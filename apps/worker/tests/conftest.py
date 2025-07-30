import asyncio
import pytest
from datetime import datetime
from typing import AsyncGenerator
from unittest.mock import AsyncMock, MagicMock
from uuid import UUID, uuid4

from worker.core.config import Settings
from worker.database.client import ClickHouseClient
from worker.database.models import (
    MediaGenerationMessage, MediaRequestType, MediaAssetCreate, MediaAssetInDB
)
from worker.services.media_generator import MediaGeneratorService
from worker.services.queue_consumer import StubQueueConsumer


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def mock_settings():
    """Mock settings for testing."""
    return Settings(
        debug=True,
        log_level="DEBUG",
        clickhouse_host="localhost",
        clickhouse_port=8123,
        clickhouse_database="test_db",
        rabbitmq_url="amqp://localhost:5672",
        media_processing_timeout=60,
        worker_concurrency=1
    )


@pytest.fixture
async def mock_db_client():
    """Mock ClickHouse database client."""
    mock_client = AsyncMock(spec=ClickHouseClient)
    
    # Mock successful operations
    mock_client.connect.return_value = None
    mock_client.disconnect.return_value = None
    mock_client.update_media_request.return_value = True
    mock_client.get_media_request_status.return_value = "pending"
    mock_client.create_media_asset.return_value = AsyncMock(spec=MediaAssetInDB)
    mock_client.health_check.return_value = {
        "status": "healthy",
        "response_time_ms": 10,
        "connection": "active"
    }
    
    return mock_client


@pytest.fixture
async def mock_media_generator():
    """Mock media generator service."""
    mock_generator = AsyncMock(spec=MediaGeneratorService)
    
    # Mock successful generation
    mock_asset = MediaAssetCreate(
        media_request_id=uuid4(),
        asset_type=MediaRequestType.IMAGE,
        file_name="test_image.jpg",
        file_size=1024000,
        file_url="https://cdn.luxury-account.com/test_image.jpg",
        width=1024,
        height=1024,
        format="jpg",
        quality="standard"
    )
    
    mock_generator.generate_media.return_value = [mock_asset]
    mock_generator.health_check.return_value = {
        "status": "healthy",
        "response_time_ms": 5,
        "supported_types": ["image", "video", "audio"],
        "service": "media_generator_stub"
    }
    
    return mock_generator


@pytest.fixture
def sample_media_message():
    """Sample media generation message for testing."""
    return MediaGenerationMessage(
        request_id=uuid4(),
        user_id=uuid4(),
        request_type=MediaRequestType.IMAGE,
        prompt="A beautiful sunset over mountains",
        parameters={"num_outputs": 1},
        style_preset="photographic",
        resolution="1024x1024",
        quality="standard",
        priority=5,
        retry_count=0,
        max_retries=3
    )


@pytest.fixture
def image_generation_message():
    """Image generation message for testing."""
    return MediaGenerationMessage(
        request_id=UUID("12345678-1234-5678-9abc-123456789012"),
        user_id=UUID("87654321-4321-8765-cba9-876543210987"),
        request_type=MediaRequestType.IMAGE,
        prompt="Generate a luxury car in a city setting",
        parameters={
            "num_outputs": 2,
            "quality": "high"
        },
        style_preset="luxury",
        resolution="1920x1080",
        quality="high",
        priority=3,
        retry_count=0,
        max_retries=3
    )


@pytest.fixture
def video_generation_message():
    """Video generation message for testing."""
    return MediaGenerationMessage(
        request_id=UUID("abcdef12-3456-7890-abcd-ef1234567890"),
        user_id=UUID("fedcba98-7654-3210-fedc-ba9876543210"),
        request_type=MediaRequestType.VIDEO,
        prompt="Create a short video of a luxury hotel",
        parameters={
            "duration": 30,
            "fps": 30
        },
        style_preset="cinematic",
        resolution="1920x1080",
        quality="premium",
        priority=1,
        retry_count=1,
        max_retries=3
    )


@pytest.fixture
async def stub_queue_consumer():
    """Stub queue consumer for testing."""
    async def dummy_handler(message):
        pass
    
    consumer = StubQueueConsumer(dummy_handler)
    await consumer.connect()
    yield consumer
    await consumer.disconnect()


@pytest.fixture
def mock_datetime():
    """Mock datetime for consistent testing."""
    mock_dt = MagicMock()
    mock_dt.utcnow.return_value = datetime(2024, 1, 15, 12, 0, 0)
    return mock_dt


@pytest.fixture
async def worker_test_setup(mock_db_client, mock_media_generator):
    """Setup for worker integration tests."""
    # Mock the global instances
    from worker.database import client
    from worker.services import media_generator as gen_module
    
    # Store original instances
    original_db = client.clickhouse_client
    original_generator = gen_module.media_generator
    
    # Replace with mocks
    client.clickhouse_client = mock_db_client
    gen_module.media_generator = mock_media_generator
    
    yield {
        "db_client": mock_db_client,
        "media_generator": mock_media_generator
    }
    
    # Restore original instances
    client.clickhouse_client = original_db
    gen_module.media_generator = original_generator


@pytest.fixture
def faker_seed():
    """Set faker seed for consistent test data."""
    import random
    random.seed(42)
    return 42 