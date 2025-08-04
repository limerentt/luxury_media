"""Queue consumer service for processing media generation requests."""

import asyncio
import json
import logging
from typing import Callable, Any
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)


class QueueConsumer(ABC):
    """Abstract base class for queue consumers."""
    
    @abstractmethod
    async def connect(self) -> None:
        """Connect to the queue service."""
        pass
    
    @abstractmethod
    async def start_consuming(self, callback: Callable[[Any], None]) -> None:
        """Start consuming messages from the queue."""
        pass
    
    @abstractmethod
    async def stop_consuming(self) -> None:
        """Stop consuming messages from the queue."""
        pass
    
    @abstractmethod
    async def health_check(self) -> dict:
        """Check if the queue connection is healthy."""
        pass


class StubQueueConsumer(QueueConsumer):
    """Stub implementation of queue consumer for testing/development."""
    
    def __init__(self, queue_name: str = "media_generation"):
        self.queue_name = queue_name
        self.consuming = False
        self.connected = False
        self.logger = logger
    
    async def connect(self) -> None:
        """Connect to the queue service (stub implementation)."""
        self.connected = True
        self.logger.info(f"Connected to stub queue: {self.queue_name}")
    
    async def start_consuming(self, callback: Callable[[Any], None]) -> None:
        """Start consuming messages (stub implementation)."""
        self.consuming = True
        self.logger.info(f"Started consuming from queue: {self.queue_name}")
        
        # Simulate consuming messages in development mode
        while self.consuming:
            await asyncio.sleep(10)  # Wait 10 seconds between mock messages
            if not self.consuming:
                break
                
            # Create a mock message for development
            from app.database.models import MediaGenerationMessage, MediaRequestType, MediaQuality
            
            mock_message = MediaGenerationMessage(
                request_id="dev-request-123",
                user_id="dev-user-456", 
                media_type=MediaRequestType.IMAGE,
                prompt="Development test prompt",
                quality=MediaQuality.STANDARD,
                retry_count=0,
                max_retries=3
            )
            
            self.logger.info("Processing mock message in development mode")
            try:
                await callback(mock_message)
            except Exception as e:
                self.logger.error(f"Error processing mock message: {e}")
    
    async def stop_consuming(self) -> None:
        """Stop consuming messages."""
        self.consuming = False
        self.logger.info(f"Stopped consuming from queue: {self.queue_name}")
    
    async def health_check(self) -> dict:
        """Check if the queue connection is healthy (stub implementation)."""
        return {"status": "healthy" if self.connected else "unhealthy"}


class RabbitMQConsumer(QueueConsumer):
    """RabbitMQ implementation of queue consumer."""
    
    def __init__(self, rabbitmq_url: str, queue_name: str = "media_generation"):
        self.rabbitmq_url = rabbitmq_url
        self.queue_name = queue_name
        self.consuming = False
        self.connected = False
        self.logger = logger
    
    async def connect(self) -> None:
        """Connect to RabbitMQ."""
        # TODO: Implement actual RabbitMQ connection
        # For now, just log that we're connected
        self.connected = True
        self.logger.info(f"Connected to RabbitMQ: {self.rabbitmq_url} (queue: {self.queue_name})")
    
    async def start_consuming(self, callback: Callable[[Any], None]) -> None:
        """Start consuming messages from RabbitMQ."""
        self.consuming = True
        self.logger.info(f"Started consuming from RabbitMQ queue: {self.queue_name}")
        
        # TODO: Implement actual RabbitMQ consumer
        # For now, fall back to stub behavior
        stub_consumer = StubQueueConsumer(self.queue_name)
        await stub_consumer.start_consuming(callback)
    
    async def stop_consuming(self) -> None:
        """Stop consuming messages."""
        self.consuming = False
        self.logger.info(f"Stopped consuming from RabbitMQ queue: {self.queue_name}")
    
    async def health_check(self) -> dict:
        """Check if RabbitMQ connection is healthy."""
        # TODO: Implement actual RabbitMQ health check
        return {"status": "healthy" if self.connected else "unhealthy"}