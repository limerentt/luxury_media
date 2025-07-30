import pytest
import asyncio
from datetime import datetime
from unittest.mock import AsyncMock, patch, MagicMock
from uuid import UUID

from worker.core.exceptions import MediaGenerationError, DatabaseError
from worker.database.models import (
    MediaGenerationMessage, MediaRequestType, MediaRequestStatus,
    MediaRequestUpdate
)
from worker.main import MediaWorker


class TestMediaWorker:
    """Test cases for MediaWorker."""
    
    @pytest.fixture
    def worker(self):
        """Create MediaWorker instance in stub mode."""
        return MediaWorker(use_stub=True)
    
    @pytest.mark.asyncio
    async def test_worker_initialization(self, worker):
        """Test worker initialization."""
        assert worker.worker_id is not None
        assert worker.use_stub is True
        assert worker.is_running is False
        assert worker.start_time is not None
        assert worker.consumer is not None
    
    @pytest.mark.asyncio
    async def test_process_media_request_successful(self, worker, worker_test_setup, sample_media_message):
        """Test successful media request processing."""
        db_client = worker_test_setup["db_client"]
        media_generator = worker_test_setup["media_generator"]
        
        # Mock successful operations
        db_client.update_media_request.return_value = True
        
        # Process the message
        await worker.process_media_request(sample_media_message)
        
        # Verify database calls
        assert db_client.update_media_request.call_count == 2  # Processing -> Completed
        assert db_client.create_media_asset.call_count == 1    # One asset created
        
        # Verify media generation was called
        media_generator.generate_media.assert_called_once_with(sample_media_message)
        
        # Check final status update
        final_call = db_client.update_media_request.call_args_list[1]
        final_update = final_call[0][1]  # Second argument (MediaRequestUpdate)
        assert final_update.status == MediaRequestStatus.COMPLETED
        assert final_update.processing_time_ms is not None
        assert final_update.completed_at is not None
    
    @pytest.mark.asyncio
    async def test_process_media_request_generation_error(self, worker, worker_test_setup, sample_media_message):
        """Test handling of media generation errors."""
        db_client = worker_test_setup["db_client"]
        media_generator = worker_test_setup["media_generator"]
        
        # Mock generation failure
        generation_error = MediaGenerationError("Generation failed", sample_media_message.request_id)
        media_generator.generate_media.side_effect = generation_error
        
        # Process should raise the error
        with pytest.raises(MediaGenerationError):
            await worker.process_media_request(sample_media_message)
        
        # Verify error handling
        assert db_client.update_media_request.call_count == 2  # Processing -> Failed
        
        # Check error status update
        error_call = db_client.update_media_request.call_args_list[1]
        error_update = error_call[0][1]
        assert error_update.status == MediaRequestStatus.FAILED
        assert "Generation failed" in error_update.error_message
    
    @pytest.mark.asyncio
    async def test_process_media_request_database_error(self, worker, worker_test_setup, sample_media_message):
        """Test handling of database errors."""
        db_client = worker_test_setup["db_client"]
        
        # Mock database failure on initial update
        db_error = DatabaseError("update_media_request", "Connection failed")
        db_client.update_media_request.side_effect = db_error
        
        # Process should raise the error
        with pytest.raises(DatabaseError):
            await worker.process_media_request(sample_media_message)
        
        # Should have attempted the initial update
        assert db_client.update_media_request.call_count == 1
    
    @pytest.mark.asyncio
    async def test_process_media_request_multiple_assets(self, worker, worker_test_setup):
        """Test processing request that generates multiple assets."""
        db_client = worker_test_setup["db_client"]
        media_generator = worker_test_setup["media_generator"]
        
        # Create message requesting multiple assets
        message = MediaGenerationMessage(
            request_id=UUID("12345678-1234-5678-9abc-123456789012"),
            user_id=UUID("87654321-4321-8765-cba9-876543210987"),
            request_type=MediaRequestType.IMAGE,
            prompt="Generate multiple variations",
            parameters={"num_outputs": 3},
            retry_count=0,
            max_retries=3
        )
        
        # Mock multiple assets generation
        from worker.database.models import MediaAssetCreate
        mock_assets = [
            MediaAssetCreate(
                media_request_id=message.request_id,
                asset_type=MediaRequestType.IMAGE,
                file_name=f"image_{i}.jpg",
                file_size=1000000,
                file_url=f"https://cdn.luxury-account.com/image_{i}.jpg",
                format="jpg",
                quality="standard"
            ) for i in range(3)
        ]
        media_generator.generate_media.return_value = mock_assets
        
        # Process the message
        await worker.process_media_request(message)
        
        # Verify all assets were created
        assert db_client.create_media_asset.call_count == 3
        
        # Verify final completion status
        final_call = db_client.update_media_request.call_args_list[1]
        final_update = final_call[0][1]
        assert final_update.status == MediaRequestStatus.COMPLETED
    
    @pytest.mark.asyncio
    async def test_process_media_request_asset_creation_failure(self, worker, worker_test_setup, sample_media_message):
        """Test handling of asset creation failures."""
        db_client = worker_test_setup["db_client"]
        media_generator = worker_test_setup["media_generator"]
        
        # Mock asset creation failure
        db_client.create_media_asset.side_effect = Exception("Asset creation failed")
        
        # Processing should still complete (asset creation errors don't fail the whole request)
        await worker.process_media_request(sample_media_message)
        
        # Should still mark request as completed
        final_call = db_client.update_media_request.call_args_list[1]
        final_update = final_call[0][1]
        assert final_update.status == MediaRequestStatus.COMPLETED
    
    @pytest.mark.asyncio
    async def test_handle_processing_error_retryable(self, worker, worker_test_setup):
        """Test error handling for retryable errors."""
        db_client = worker_test_setup["db_client"]
        
        message = MediaGenerationMessage(
            request_id=UUID("12345678-1234-5678-9abc-123456789012"),
            user_id=UUID("87654321-4321-8765-cba9-876543210987"),
            request_type=MediaRequestType.IMAGE,
            prompt="Test retry",
            retry_count=1,  # Has retries left
            max_retries=3
        )
        
        error = Exception("Temporary failure")
        
        await worker._handle_processing_error(message.request_id, message, error)
        
        # Should mark as pending for retry
        db_client.update_media_request.assert_called_once()
        update_call = db_client.update_media_request.call_args[0][1]
        assert update_call.status == MediaRequestStatus.PENDING
        assert "Temporary failure" in update_call.error_message
    
    @pytest.mark.asyncio
    async def test_handle_processing_error_max_retries(self, worker, worker_test_setup):
        """Test error handling when max retries exceeded."""
        db_client = worker_test_setup["db_client"]
        
        message = MediaGenerationMessage(
            request_id=UUID("12345678-1234-5678-9abc-123456789012"),
            user_id=UUID("87654321-4321-8765-cba9-876543210987"),
            request_type=MediaRequestType.IMAGE,
            prompt="Test max retries",
            retry_count=3,  # At max retries
            max_retries=3
        )
        
        error = Exception("Final failure")
        
        await worker._handle_processing_error(message.request_id, message, error)
        
        # Should mark as failed
        db_client.update_media_request.assert_called_once()
        update_call = db_client.update_media_request.call_args[0][1]
        assert update_call.status == MediaRequestStatus.FAILED
        assert "Final failure" in update_call.error_message
    
    @pytest.mark.asyncio
    async def test_handle_processing_error_non_retryable(self, worker, worker_test_setup):
        """Test error handling for non-retryable errors."""
        db_client = worker_test_setup["db_client"]
        
        message = MediaGenerationMessage(
            request_id=UUID("12345678-1234-5678-9abc-123456789012"),
            user_id=UUID("87654321-4321-8765-cba9-876543210987"),
            request_type=MediaRequestType.IMAGE,
            prompt="Test non-retryable",
            retry_count=0,
            max_retries=3
        )
        
        # MediaGenerationError is non-retryable
        error = MediaGenerationError("Invalid format", message.request_id)
        
        await worker._handle_processing_error(message.request_id, message, error)
        
        # Should mark as failed even with retries left
        db_client.update_media_request.assert_called_once()
        update_call = db_client.update_media_request.call_args[0][1]
        assert update_call.status == MediaRequestStatus.FAILED
    
    @pytest.mark.asyncio
    async def test_worker_health_check(self, worker, worker_test_setup):
        """Test worker health check."""
        db_client = worker_test_setup["db_client"]
        
        # Mock health checks
        db_client.health_check.return_value = {"status": "healthy", "response_time_ms": 10}
        
        # Mock consumer health
        worker.consumer.processed_messages = 5
        worker.consumer.failed_messages = 1
        
        health = await worker.health_check()
        
        assert health["status"] == "healthy"
        assert health["worker_id"] == worker.worker_id
        assert "uptime_seconds" in health
        assert health["is_running"] is False  # Not started yet
        assert health["services"]["database"]["status"] == "healthy"
        assert health["stats"]["processed_messages"] == 5
        assert health["stats"]["failed_messages"] == 1
    
    @pytest.mark.asyncio
    async def test_worker_health_check_degraded(self, worker, worker_test_setup):
        """Test worker health check when services are degraded."""
        db_client = worker_test_setup["db_client"]
        
        # Mock unhealthy database
        db_client.health_check.return_value = {"status": "unhealthy", "error": "Connection failed"}
        
        health = await worker.health_check()
        
        assert health["status"] == "degraded"
        assert health["services"]["database"]["status"] == "unhealthy"
    
    @pytest.mark.asyncio
    async def test_worker_health_check_exception(self, worker):
        """Test worker health check when exception occurs."""
        with patch.object(worker, 'consumer', side_effect=Exception("Health check failed")):
            health = await worker.health_check()
            
            assert health["status"] == "unhealthy"
            assert "Health check failed" in health["error"]
    
    def test_worker_signal_handlers(self, worker):
        """Test signal handler setup."""
        import signal
        
        # Setup signal handlers
        worker._setup_signal_handlers()
        
        # Check that shutdown event is not set
        assert not worker.shutdown_event.is_set()
        
        # Simulate signal (can't actually send signals in tests easily)
        # This tests that the handler function exists and works
        handler = signal.signal(signal.SIGINT, signal.SIG_DFL)  # Get current handler
        
        # Restore original handler
        signal.signal(signal.SIGINT, handler)
    
    @pytest.mark.asyncio
    async def test_connect_services(self, worker, worker_test_setup):
        """Test service connection process."""
        db_client = worker_test_setup["db_client"]
        
        await worker._connect_services()
        
        # Verify connections were established
        db_client.connect.assert_called_once()
        worker.consumer.connect.assert_called_once()
        
        # Verify health checks were performed
        db_client.health_check.assert_called_once()
        worker.consumer.health_check.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_connect_services_failure(self, worker, worker_test_setup):
        """Test service connection failure handling."""
        db_client = worker_test_setup["db_client"]
        
        # Mock connection failure
        db_client.connect.side_effect = Exception("Connection failed")
        
        with pytest.raises(Exception) as exc_info:
            await worker._connect_services()
        
        assert "Connection failed" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_shutdown_process(self, worker):
        """Test graceful shutdown process."""
        # Mock consumer task
        consumer_task = AsyncMock()
        
        # Mock consumer methods
        worker.consumer.stop_consuming = AsyncMock()
        worker.consumer.disconnect = AsyncMock()
        
        # Mock database client
        with patch('worker.main.clickhouse_client') as mock_db:
            mock_db.disconnect = AsyncMock()
            
            # Test shutdown
            await worker._shutdown(consumer_task)
            
            # Verify shutdown sequence
            worker.consumer.stop_consuming.assert_called_once()
            worker.consumer.disconnect.assert_called_once()
            mock_db.disconnect.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_shutdown_with_timeout(self, worker):
        """Test shutdown with consumer task timeout."""
        # Mock consumer task that times out
        consumer_task = AsyncMock()
        consumer_task.cancel = MagicMock()
        
        with patch('asyncio.wait_for', side_effect=asyncio.TimeoutError):
            with patch('worker.main.clickhouse_client') as mock_db:
                mock_db.disconnect = AsyncMock()
                worker.consumer.stop_consuming = AsyncMock()
                worker.consumer.disconnect = AsyncMock()
                
                await worker._shutdown(consumer_task)
                
                # Task should be cancelled on timeout
                consumer_task.cancel.assert_called_once() 