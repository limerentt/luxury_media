#!/usr/bin/env python3
"""
Main worker script for processing media generation requests.

This script:
1. Connects to RabbitMQ queue
2. Listens for media generation requests  
3. Processes requests using AI media generation services
4. Updates ClickHouse database with results
5. Handles errors and retries
"""

import asyncio
import signal
import sys
from datetime import datetime
from typing import Optional
from uuid import uuid4

import structlog

from worker.core.config import settings
from worker.core.exceptions import (
    MediaGenerationError, DatabaseError, RabbitMQConnectionError,
    MaxRetriesExceededError, TimeoutError
)
from worker.core.logging import (
    configure_logging, log_worker_event, log_media_generation,
    log_database_operation, log_error
)
from app.database.client import clickhouse_client
from app.database.models import (
    MediaGenerationMessage, MediaRequestUpdate, MediaRequestStatus,
    MediaAssetStatus
)
from worker.services.media_generator import media_generator
from worker.services.queue_consumer import QueueConsumer, StubQueueConsumer, RabbitMQConsumer

logger = structlog.get_logger(__name__)


class MediaWorker:
    """Main worker class that orchestrates media generation processing."""
    
    def __init__(self, use_stub: bool = False):
        self.worker_id = str(uuid4())
        self.use_stub = use_stub
        self.start_time = datetime.utcnow()
        self.is_running = False
        self.shutdown_event = asyncio.Event()
        
        # Initialize consumer based on mode
        if use_stub:
            self.consumer = StubQueueConsumer()
        else:
            import os
            rabbitmq_url = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672")
            self.consumer = RabbitMQConsumer(rabbitmq_url)
    
    async def start(self) -> None:
        """Start the worker service."""
        try:
            log_worker_event(
                "worker_starting",
                worker_id=self.worker_id,
                mode="stub" if self.use_stub else "production"
            )
            
            # Configure logging
            configure_logging()
            
            # Connect to services
            await self._connect_services()
            
            # Setup signal handlers
            self._setup_signal_handlers()
            
            # Start consuming messages
            self.is_running = True
            
            log_worker_event(
                "worker_started",
                worker_id=self.worker_id,
                uptime=0
            )
            
            # Start the consumer in a separate task
            consumer_task = asyncio.create_task(self.consumer.start_consuming(self.process_media_request))
            
            # Wait for shutdown signal
            await self.shutdown_event.wait()
            
            # Graceful shutdown
            await self._shutdown(consumer_task)
            
        except Exception as e:
            log_error(e, "worker_startup")
            raise
    
    async def _connect_services(self) -> None:
        """Connect to all required services."""
        try:
            # Connect to ClickHouse
            await clickhouse_client.connect()
            
            # Connect to RabbitMQ (or stub)
            await self.consumer.connect()
            
            # Health check services
            db_health = await clickhouse_client.health_check()
            consumer_health = await self.consumer.health_check()
            generator_health = await media_generator.health_check()
            
            log_worker_event(
                "services_connected",
                database_status=db_health.get("status", "unknown"),
                queue_status=consumer_health.get("status", "unknown"),
                generator_status=generator_health.get("status", "unknown")
            )
            
        except Exception as e:
            log_error(e, "service_connection")
            raise
    
    def _setup_signal_handlers(self) -> None:
        """Setup signal handlers for graceful shutdown."""
        def signal_handler(signum, frame):
            log_worker_event("shutdown_signal_received", signal=signum)
            self.shutdown_event.set()
        
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
    
    async def process_media_request(self, message: MediaGenerationMessage) -> None:
        """
        Process a media generation request.
        
        Args:
            message: Media generation request message
            
        Raises:
            MediaGenerationError: If generation fails
            DatabaseError: If database operations fail
        """
        request_id = message.request_id
        
        log_media_generation(
            "request_processing_started",
            request_id=str(request_id),
            user_id=str(message.user_id),
            media_type=message.media_type,
            retry_count=message.retry_count
        )
        
        try:
            # Update request status to processing
            await clickhouse_client.update_media_request(
                request_id,
                MediaRequestUpdate(
                    status=MediaRequestStatus.PROCESSING,
                    retry_count=message.retry_count
                )
            )
            
            # Generate media assets
            assets = await media_generator.generate_media(
                media_type=str(message.media_type),
                prompt=message.prompt,
                quality=str(message.quality)
            )
            
            # Save generated media result to database
            try:
                # For now, just log the successful generation
                log_media_generation(
                    "media_generated_successfully",
                    request_id=str(request_id),
                    media_type=str(message.media_type),
                    file_url=assets.get("file_url", "unknown"),
                    format=assets.get("metadata", {}).get("format", "unknown")
                )
            except Exception as e:
                log_error(e, "asset_creation", request_id=str(request_id))
                # Continue with request completion
            
            # Update request status to completed
            processing_time = 1000  # Mock processing time in milliseconds
            
            await clickhouse_client.update_media_request(
                request_id,
                MediaRequestUpdate(
                    status=MediaRequestStatus.COMPLETED,
                    processing_time_ms=int(processing_time),
                    completed_at=datetime.utcnow()
                )
            )
            
            log_media_generation(
                "request_processing_completed",
                request_id=str(request_id),
                assets_count=len(assets),
                processing_time_ms=int(processing_time)
            )
            
        except MediaGenerationError as e:
            await self._handle_processing_error(request_id, message, e)
            raise
        except TimeoutError as e:
            await self._handle_processing_error(request_id, message, e)
            raise
        except DatabaseError as e:
            log_error(e, "database", request_id=str(request_id))
            # Don't update request status if database is failing
            raise
        except Exception as e:
            await self._handle_processing_error(request_id, message, e)
            raise MediaGenerationError(f"Unexpected error: {str(e)}", request_id)
    
    async def _handle_processing_error(
        self,
        request_id: str,
        message: MediaGenerationMessage,
        error: Exception
    ) -> None:
        """Handle processing errors and update request status."""
        try:
            # Determine if this is a retryable error
            should_retry = (
                message.retry_count < message.max_retries and
                not isinstance(error, (MediaGenerationError, TimeoutError))
            )
            
            status = MediaRequestStatus.FAILED
            if should_retry:
                status = MediaRequestStatus.PENDING  # Will be retried
            
            await clickhouse_client.update_media_request(
                request_id,
                MediaRequestUpdate(
                    status=status,
                    error_message=str(error)[:500],  # Limit error message length
                    retry_count=message.retry_count
                )
            )
            
            log_media_generation(
                "request_processing_failed",
                request_id=str(request_id),
                error_type=type(error).__name__,
                error_message=str(error)[:200],
                retry_count=message.retry_count,
                will_retry=should_retry
            )
            
        except Exception as db_error:
            log_error(db_error, "error_handling", request_id=str(request_id))
    
    async def _shutdown(self, consumer_task: asyncio.Task) -> None:
        """Graceful shutdown of the worker."""
        log_worker_event("worker_shutting_down", worker_id=self.worker_id)
        
        try:
            # Stop consuming new messages
            await self.consumer.stop_consuming()
            
            # Wait for current message processing to complete (with timeout)
            try:
                await asyncio.wait_for(
                    consumer_task,
                    timeout=settings.worker_shutdown_timeout
                )
            except asyncio.TimeoutError:
                log_worker_event("shutdown_timeout_exceeded")
                consumer_task.cancel()
            
            # Disconnect from services
            await self.consumer.disconnect()
            await clickhouse_client.disconnect()
            
            uptime = (datetime.utcnow() - self.start_time).total_seconds()
            
            log_worker_event(
                "worker_shutdown_complete",
                worker_id=self.worker_id,
                uptime_seconds=int(uptime),
                processed_messages=getattr(self.consumer, 'processed_messages', 0),
                failed_messages=getattr(self.consumer, 'failed_messages', 0)
            )
            
        except Exception as e:
            log_error(e, "worker_shutdown")
    
    async def health_check(self) -> dict:
        """Comprehensive health check of all services."""
        try:
            uptime = (datetime.utcnow() - self.start_time).total_seconds()
            
            # Check all services
            db_health = await clickhouse_client.health_check()
            consumer_health = await self.consumer.health_check()
            generator_health = await media_generator.health_check()
            
            overall_status = "healthy"
            if any(
                service.get("status") != "healthy"
                for service in [db_health, consumer_health, generator_health]
            ):
                overall_status = "degraded"
            
            return {
                "status": overall_status,
                "worker_id": self.worker_id,
                "uptime_seconds": int(uptime),
                "is_running": self.is_running,
                "services": {
                    "database": db_health,
                    "queue_consumer": consumer_health,
                    "media_generator": generator_health
                },
                "stats": {
                    "processed_messages": getattr(self.consumer, 'processed_messages', 0),
                    "failed_messages": getattr(self.consumer, 'failed_messages', 0)
                }
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e),
                "worker_id": self.worker_id
            }


async def main():
    """Main entry point for the worker."""
    try:
        # Determine if we should use stub mode (for testing)
        use_stub = "--stub" in sys.argv or settings.debug
        
        # Create and start worker
        worker = MediaWorker(use_stub=use_stub)
        await worker.start()
        
    except KeyboardInterrupt:
        log_worker_event("worker_interrupted")
    except Exception as e:
        log_error(e, "main")
        sys.exit(1)


if __name__ == "__main__":
    # Run the worker
    asyncio.run(main()) 