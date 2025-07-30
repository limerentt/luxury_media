import pytest
import asyncio
import json
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import UUID

from worker.core.exceptions import MessageProcessingError, MaxRetriesExceededError
from worker.database.models import MediaGenerationMessage, MediaRequestType
from worker.services.queue_consumer import StubQueueConsumer


class TestStubQueueConsumer:
    """Test cases for StubQueueConsumer."""
    
    @pytest.fixture
    async def consumer_with_handler(self):
        """Create consumer with test message handler."""
        processed_messages = []
        
        async def test_handler(message: MediaGenerationMessage):
            processed_messages.append(message)
        
        consumer = StubQueueConsumer(test_handler)
        await consumer.connect()
        
        # Store reference to processed messages for testing
        consumer._test_processed = processed_messages
        
        yield consumer
        
        await consumer.disconnect()
    
    @pytest.mark.asyncio
    async def test_connection_and_disconnection(self):
        """Test consumer connection and disconnection."""
        async def dummy_handler(message):
            pass
        
        consumer = StubQueueConsumer(dummy_handler)
        
        # Test connection
        await consumer.connect()
        assert consumer.start_time is not None
        
        # Test disconnection
        await consumer.disconnect()
    
    @pytest.mark.asyncio
    async def test_add_and_process_message(self, consumer_with_handler, sample_media_message):
        """Test adding and processing messages."""
        # Add test message
        await consumer_with_handler.add_test_message(sample_media_message)
        
        # Start consumer briefly to process messages
        consumer_task = asyncio.create_task(consumer_with_handler.start_consuming())
        
        # Give it time to process
        await asyncio.sleep(0.1)
        await consumer_with_handler.stop_consuming()
        
        # Wait for consumer to stop
        try:
            await asyncio.wait_for(consumer_task, timeout=1.0)
        except asyncio.TimeoutError:
            consumer_task.cancel()
        
        # Check that message was processed
        assert len(consumer_with_handler._test_processed) == 1
        assert consumer_with_handler._test_processed[0].request_id == sample_media_message.request_id
        assert consumer_with_handler.processed_messages == 1
        assert consumer_with_handler.failed_messages == 0
    
    @pytest.mark.asyncio
    async def test_multiple_messages_processing(self, consumer_with_handler):
        """Test processing multiple messages."""
        messages = []
        for i in range(3):
            message = MediaGenerationMessage(
                request_id=UUID(f"1234567{i}-1234-5678-9abc-123456789012"),
                user_id=UUID("87654321-4321-8765-cba9-876543210987"),
                request_type=MediaRequestType.IMAGE,
                prompt=f"Test message {i}",
                retry_count=0,
                max_retries=3
            )
            messages.append(message)
            await consumer_with_handler.add_test_message(message)
        
        # Process messages
        consumer_task = asyncio.create_task(consumer_with_handler.start_consuming())
        await asyncio.sleep(0.2)
        await consumer_with_handler.stop_consuming()
        
        try:
            await asyncio.wait_for(consumer_task, timeout=1.0)
        except asyncio.TimeoutError:
            consumer_task.cancel()
        
        # Check all messages were processed
        assert len(consumer_with_handler._test_processed) == 3
        assert consumer_with_handler.processed_messages == 3
        assert consumer_with_handler.failed_messages == 0
        
        # Check correct order
        processed_ids = [msg.request_id for msg in consumer_with_handler._test_processed]
        expected_ids = [msg.request_id for msg in messages]
        assert processed_ids == expected_ids
    
    @pytest.mark.asyncio
    async def test_error_handling_in_message_processing(self):
        """Test error handling when message processing fails."""
        async def failing_handler(message):
            raise Exception("Processing failed")
        
        consumer = StubQueueConsumer(failing_handler)
        await consumer.connect()
        
        # Add test message
        message = MediaGenerationMessage(
            request_id=UUID("12345678-1234-5678-9abc-123456789012"),
            user_id=UUID("87654321-4321-8765-cba9-876543210987"),
            request_type=MediaRequestType.IMAGE,
            prompt="Test error handling",
            retry_count=0,
            max_retries=3
        )
        await consumer.add_test_message(message)
        
        # Process message
        consumer_task = asyncio.create_task(consumer.start_consuming())
        await asyncio.sleep(0.1)
        await consumer.stop_consuming()
        
        try:
            await asyncio.wait_for(consumer_task, timeout=1.0)
        except asyncio.TimeoutError:
            consumer_task.cancel()
        
        # Check error was handled
        assert consumer.processed_messages == 0
        assert consumer.failed_messages == 1
        
        await consumer.disconnect()
    
    @pytest.mark.asyncio
    async def test_health_check(self, consumer_with_handler):
        """Test consumer health check."""
        health = await consumer_with_handler.health_check()
        
        assert health["status"] in ["healthy", "stopped"]
        assert health["connection"] == "stub"
        assert "uptime_seconds" in health
        assert health["processed_messages"] == 0  # No messages processed yet
        assert health["failed_messages"] == 0
        assert health["queue"] == "stub_queue"
        assert health["exchange"] == "stub_exchange"
    
    @pytest.mark.asyncio
    async def test_consumer_start_stop_cycle(self, consumer_with_handler):
        """Test starting and stopping consumer multiple times."""
        # Start consumer
        consumer_task = asyncio.create_task(consumer_with_handler.start_consuming())
        await asyncio.sleep(0.05)
        
        assert consumer_with_handler.is_running is True
        
        # Stop consumer
        await consumer_with_handler.stop_consuming()
        
        try:
            await asyncio.wait_for(consumer_task, timeout=1.0)
        except asyncio.TimeoutError:
            consumer_task.cancel()
        
        assert consumer_with_handler.is_running is False
        
        # Start again
        consumer_task = asyncio.create_task(consumer_with_handler.start_consuming())
        await asyncio.sleep(0.05)
        
        assert consumer_with_handler.is_running is True
        
        await consumer_with_handler.stop_consuming()
        
        try:
            await asyncio.wait_for(consumer_task, timeout=1.0)
        except asyncio.TimeoutError:
            consumer_task.cancel()
    
    @pytest.mark.asyncio
    async def test_processing_with_different_message_types(self, consumer_with_handler):
        """Test processing different types of media generation messages."""
        # Create messages for different media types
        messages = [
            MediaGenerationMessage(
                request_id=UUID("12345671-1234-5678-9abc-123456789012"),
                user_id=UUID("87654321-4321-8765-cba9-876543210987"),
                request_type=MediaRequestType.IMAGE,
                prompt="Generate image",
                retry_count=0,
                max_retries=3
            ),
            MediaGenerationMessage(
                request_id=UUID("12345672-1234-5678-9abc-123456789012"),
                user_id=UUID("87654321-4321-8765-cba9-876543210987"),
                request_type=MediaRequestType.VIDEO,
                prompt="Generate video",
                retry_count=0,
                max_retries=3
            ),
            MediaGenerationMessage(
                request_id=UUID("12345673-1234-5678-9abc-123456789012"),
                user_id=UUID("87654321-4321-8765-cba9-876543210987"),
                request_type=MediaRequestType.AUDIO,
                prompt="Generate audio",
                retry_count=0,
                max_retries=3
            )
        ]
        
        # Add all messages
        for message in messages:
            await consumer_with_handler.add_test_message(message)
        
        # Process messages
        consumer_task = asyncio.create_task(consumer_with_handler.start_consuming())
        await asyncio.sleep(0.2)
        await consumer_with_handler.stop_consuming()
        
        try:
            await asyncio.wait_for(consumer_task, timeout=1.0)
        except asyncio.TimeoutError:
            consumer_task.cancel()
        
        # Check all messages were processed
        assert len(consumer_with_handler._test_processed) == 3
        assert consumer_with_handler.processed_messages == 3
        
        # Check correct types were processed
        processed_types = {msg.request_type for msg in consumer_with_handler._test_processed}
        expected_types = {MediaRequestType.IMAGE, MediaRequestType.VIDEO, MediaRequestType.AUDIO}
        assert processed_types == expected_types
    
    @pytest.mark.asyncio
    async def test_empty_queue_processing(self, consumer_with_handler):
        """Test consumer behavior with empty message queue."""
        # Start consumer with no messages
        consumer_task = asyncio.create_task(consumer_with_handler.start_consuming())
        await asyncio.sleep(0.1)
        await consumer_with_handler.stop_consuming()
        
        try:
            await asyncio.wait_for(consumer_task, timeout=1.0)
        except asyncio.TimeoutError:
            consumer_task.cancel()
        
        # Should have processed no messages
        assert consumer_with_handler.processed_messages == 0
        assert consumer_with_handler.failed_messages == 0
        assert len(consumer_with_handler._test_processed) == 0


# Note: Tests for the real QueueConsumer would require actual RabbitMQ connection
# or more complex mocking of aio_pika components. For now, we focus on the stub
# implementation which is sufficient for testing the worker logic. 