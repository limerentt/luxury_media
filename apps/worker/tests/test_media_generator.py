import pytest
from unittest.mock import patch, AsyncMock
from uuid import UUID

from worker.core.exceptions import MediaGenerationError, TimeoutError
from worker.database.models import MediaGenerationMessage, MediaRequestType
from worker.services.media_generator import MediaGeneratorService


class TestMediaGeneratorService:
    """Test cases for MediaGeneratorService."""
    
    @pytest.fixture
    def generator(self):
        """Create MediaGeneratorService instance."""
        return MediaGeneratorService()
    
    @pytest.mark.asyncio
    async def test_generate_image_successful(self, generator, image_generation_message):
        """Test successful image generation."""
        assets = await generator.generate_media(image_generation_message)
        
        assert len(assets) == 2  # num_outputs = 2
        assert all(asset.asset_type == MediaRequestType.IMAGE for asset in assets)
        assert all(asset.media_request_id == image_generation_message.request_id for asset in assets)
        assert all(asset.width == 1920 for asset in assets)
        assert all(asset.height == 1080 for asset in assets)
        assert all(asset.format in ["jpg", "png"] for asset in assets)
    
    @pytest.mark.asyncio
    async def test_generate_video_successful(self, generator, video_generation_message):
        """Test successful video generation."""
        assets = await generator.generate_media(video_generation_message)
        
        assert len(assets) == 1  # default num_outputs
        asset = assets[0]
        assert asset.asset_type == MediaRequestType.VIDEO
        assert asset.media_request_id == video_generation_message.request_id
        assert asset.format == "mp4"
        assert asset.duration is not None
        assert asset.width in [640, 1280, 1920, 3840]  # Based on quality
        assert asset.height in [480, 720, 1080, 2160]
    
    @pytest.mark.asyncio
    async def test_generate_audio_successful(self, generator):
        """Test successful audio generation."""
        message = MediaGenerationMessage(
            request_id=UUID("12345678-1234-5678-9abc-123456789012"),
            user_id=UUID("87654321-4321-8765-cba9-876543210987"),
            request_type=MediaRequestType.AUDIO,
            prompt="Generate relaxing ambient music",
            parameters={"num_outputs": 1},
            quality="premium",
            retry_count=0,
            max_retries=3
        )
        
        assets = await generator.generate_media(message)
        
        assert len(assets) == 1
        asset = assets[0]
        assert asset.asset_type == MediaRequestType.AUDIO
        assert asset.format in ["mp3", "wav"]
        assert asset.duration is not None
        assert asset.width is None  # Audio doesn't have dimensions
        assert asset.height is None
    
    @pytest.mark.asyncio
    async def test_unsupported_media_type(self, generator):
        """Test handling of unsupported media types."""
        message = MediaGenerationMessage(
            request_id=UUID("12345678-1234-5678-9abc-123456789012"),
            user_id=UUID("87654321-4321-8765-cba9-876543210987"),
            request_type="unsupported",  # Invalid type
            prompt="Generate something",
            retry_count=0,
            max_retries=3
        )
        
        with pytest.raises(MediaGenerationError) as exc_info:
            await generator.generate_media(message)
        
        assert "Unsupported media type" in str(exc_info.value)
        assert exc_info.value.request_id == message.request_id
    
    @pytest.mark.asyncio
    async def test_multiple_assets_generation(self, generator):
        """Test generating multiple assets."""
        message = MediaGenerationMessage(
            request_id=UUID("12345678-1234-5678-9abc-123456789012"),
            user_id=UUID("87654321-4321-8765-cba9-876543210987"),
            request_type=MediaRequestType.IMAGE,
            prompt="Generate variations",
            parameters={"num_outputs": 4},
            quality="standard",
            retry_count=0,
            max_retries=3
        )
        
        assets = await generator.generate_media(message)
        
        assert len(assets) == 4
        # Ensure all assets have unique IDs
        asset_ids = [asset.id for asset in assets]
        assert len(set(asset_ids)) == 4
        
        # Check that URLs are different
        urls = [asset.file_url for asset in assets]
        assert len(set(urls)) == 4
    
    @pytest.mark.asyncio
    async def test_asset_metadata_quality_variations(self, generator):
        """Test asset metadata for different quality levels."""
        qualities = ["draft", "standard", "high", "premium"]
        
        for quality in qualities:
            message = MediaGenerationMessage(
                request_id=UUID("12345678-1234-5678-9abc-123456789012"),
                user_id=UUID("87654321-4321-8765-cba9-876543210987"),
                request_type=MediaRequestType.VIDEO,
                prompt="Test quality variations",
                quality=quality,
                retry_count=0,
                max_retries=3
            )
            
            assets = await generator.generate_media(message)
            asset = assets[0]
            
            # Higher quality should generally mean larger dimensions
            if quality == "draft":
                assert asset.width == 640 and asset.height == 480
            elif quality == "standard":
                assert asset.width == 1280 and asset.height == 720
            elif quality == "high":
                assert asset.width == 1920 and asset.height == 1080
            elif quality == "premium":
                assert asset.width == 3840 and asset.height == 2160
    
    @pytest.mark.asyncio
    async def test_thumbnail_url_generation(self, generator, image_generation_message):
        """Test thumbnail URL generation for images and videos."""
        assets = await generator.generate_media(image_generation_message)
        
        for asset in assets:
            assert asset.thumbnail_url is not None
            assert "thumbs/" in asset.thumbnail_url
            assert asset.thumbnail_url.endswith(".jpg")
    
    @pytest.mark.asyncio
    async def test_cancel_generation(self, generator):
        """Test cancelling media generation."""
        request_id = UUID("12345678-1234-5678-9abc-123456789012")
        
        result = await generator.cancel_generation(request_id)
        
        assert result is True
    
    @pytest.mark.asyncio
    async def test_health_check(self, generator):
        """Test media generator health check."""
        health = await generator.health_check()
        
        assert health["status"] == "healthy"
        assert "response_time_ms" in health
        assert health["supported_types"] == ["image", "video", "audio"]
        assert health["service"] == "media_generator_stub"
    
    @pytest.mark.asyncio
    async def test_processing_time_simulation(self, generator, image_generation_message):
        """Test that processing time simulation works."""
        import time
        
        start_time = time.time()
        await generator.generate_media(image_generation_message)
        end_time = time.time()
        
        # Should take some time due to simulation (but capped at 5 seconds for testing)
        processing_time = end_time - start_time
        assert 0 < processing_time <= 6  # Allow some buffer
    
    @pytest.mark.asyncio
    async def test_file_size_estimation(self, generator):
        """Test file size estimation for different media types."""
        # Test image
        image_message = MediaGenerationMessage(
            request_id=UUID("12345678-1234-5678-9abc-123456789012"),
            user_id=UUID("87654321-4321-8765-cba9-876543210987"),
            request_type=MediaRequestType.IMAGE,
            prompt="Test file size",
            resolution="2048x2048",
            quality="high",
            retry_count=0,
            max_retries=3
        )
        
        assets = await generator.generate_media(image_message)
        image_asset = assets[0]
        
        # Larger resolution should result in larger file size
        assert image_asset.file_size > 1000000  # > 1MB for high quality 2048x2048
    
    @pytest.mark.asyncio
    async def test_error_handling_in_generation(self, generator):
        """Test error handling during generation process."""
        with patch.object(generator, '_simulate_processing', side_effect=Exception("Simulation error")):
            message = MediaGenerationMessage(
                request_id=UUID("12345678-1234-5678-9abc-123456789012"),
                user_id=UUID("87654321-4321-8765-cba9-876543210987"),
                request_type=MediaRequestType.IMAGE,
                prompt="Test error handling",
                retry_count=0,
                max_retries=3
            )
            
            with pytest.raises(MediaGenerationError) as exc_info:
                await generator.generate_media(message)
            
            assert "Media generation failed" in str(exc_info.value)
            assert exc_info.value.request_id == message.request_id 