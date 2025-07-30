import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock
from uuid import uuid4
from decimal import Decimal

from app.database.models import (
    MediaRequestInDB, MediaRequestCreate, MediaRequestType, 
    MediaRequestStatus, MediaQuality, UserInDB, SubscriptionStatus
)


class TestMediaRequestsAPI:
    """Test cases for media requests API endpoints."""
    
    def test_create_media_request(
        self, client: TestClient, mock_user: UserInDB, mock_db: AsyncMock
    ):
        """Test creating a new media request."""
        # Mock database response
        new_request = MediaRequestInDB(
            id=uuid4(),
            user_id=mock_user.id,
            request_type=MediaRequestType.IMAGE,
            prompt="A beautiful landscape",
            status=MediaRequestStatus.PENDING,
            parameters='{}',
            quality=MediaQuality.STANDARD,
            retry_count=0,
            priority=5,
            estimated_cost=Decimal("2.50"),
            created_at="2024-01-01T00:00:00Z",
            updated_at="2024-01-01T00:00:00Z"
        )
        mock_db.create_media_request.return_value = new_request
        mock_db.list_user_media_requests.return_value = []  # No requests today
        
        request_data = {
            "request_type": "image",
            "prompt": "A beautiful landscape",
            "quality": "standard",
            "priority": 5
        }
        
        response = client.post("/api/v1/media-requests", json=request_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["request_type"] == "image"
        assert data["prompt"] == "A beautiful landscape"
        assert data["status"] == "pending"
        
        # Verify database was called
        mock_db.create_media_request.assert_called_once()
    
    def test_create_media_request_premium_quality_free_user(
        self, client: TestClient, mock_user: UserInDB, mock_db: AsyncMock
    ):
        """Test creating premium quality request with free user (should fail)."""
        mock_db.list_user_media_requests.return_value = []  # No requests today
        
        request_data = {
            "request_type": "image",
            "prompt": "A beautiful landscape",
            "quality": "premium",  # Requires premium subscription
            "priority": 5
        }
        
        response = client.post("/api/v1/media-requests", json=request_data)
        
        assert response.status_code == 402
        assert "premium" in response.json()["message"].lower()
    
    def test_create_media_request_daily_limit_exceeded(
        self, client: TestClient, mock_user: UserInDB, mock_db: AsyncMock
    ):
        """Test creating request when daily limit is exceeded."""
        # Mock that user has already made 5 requests today (free tier limit)
        existing_requests = [
            MediaRequestInDB(
                id=uuid4(),
                user_id=mock_user.id,
                request_type=MediaRequestType.IMAGE,
                prompt=f"Request {i}",
                status=MediaRequestStatus.COMPLETED,
                created_at="2024-01-01T00:00:00Z",
                updated_at="2024-01-01T00:00:00Z"
            ) for i in range(5)
        ]
        mock_db.list_user_media_requests.return_value = existing_requests
        
        request_data = {
            "request_type": "image",
            "prompt": "A beautiful landscape",
            "quality": "standard",
            "priority": 5
        }
        
        response = client.post("/api/v1/media-requests", json=request_data)
        
        assert response.status_code == 429
        assert "Daily limit" in response.json()["detail"]
    
    def test_list_user_media_requests(
        self, client: TestClient, mock_user: UserInDB, mock_db: AsyncMock
    ):
        """Test listing user's media requests."""
        # Mock database response
        requests = [
            MediaRequestInDB(
                id=uuid4(),
                user_id=mock_user.id,
                request_type=MediaRequestType.IMAGE,
                prompt="Request 1",
                status=MediaRequestStatus.COMPLETED,
                created_at="2024-01-01T00:00:00Z",
                updated_at="2024-01-01T00:00:00Z"
            ),
            MediaRequestInDB(
                id=uuid4(),
                user_id=mock_user.id,
                request_type=MediaRequestType.VIDEO,
                prompt="Request 2",
                status=MediaRequestStatus.PENDING,
                created_at="2024-01-01T01:00:00Z",
                updated_at="2024-01-01T01:00:00Z"
            )
        ]
        mock_db.list_user_media_requests.return_value = requests
        
        response = client.get("/api/v1/media-requests")
        
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 2
        assert len(data["items"]) == 2
        
        # Verify database was called
        mock_db.list_user_media_requests.assert_called_once()
    
    def test_get_media_request(
        self, client: TestClient, mock_user: UserInDB, mock_media_request: MediaRequestInDB, mock_db: AsyncMock
    ):
        """Test getting a specific media request."""
        mock_db.get_media_request.return_value = mock_media_request
        
        response = client.get(f"/api/v1/media-requests/{mock_media_request.id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(mock_media_request.id)
        assert data["prompt"] == mock_media_request.prompt
        
        mock_db.get_media_request.assert_called_once_with(mock_media_request.id)
    
    def test_get_media_request_not_found(
        self, client: TestClient, mock_db: AsyncMock
    ):
        """Test getting non-existent media request."""
        request_id = uuid4()
        mock_db.get_media_request.return_value = None
        
        response = client.get(f"/api/v1/media-requests/{request_id}")
        
        assert response.status_code == 404
        assert "not found" in response.json()["message"]
    
    def test_get_media_request_access_denied(
        self, client: TestClient, mock_user: UserInDB, mock_db: AsyncMock
    ):
        """Test getting media request owned by another user."""
        other_user_request = MediaRequestInDB(
            id=uuid4(),
            user_id=uuid4(),  # Different user ID
            request_type=MediaRequestType.IMAGE,
            prompt="Other user's request",
            status=MediaRequestStatus.PENDING,
            created_at="2024-01-01T00:00:00Z",
            updated_at="2024-01-01T00:00:00Z"
        )
        mock_db.get_media_request.return_value = other_user_request
        
        response = client.get(f"/api/v1/media-requests/{other_user_request.id}")
        
        assert response.status_code == 403
        assert "Access denied" in response.json()["detail"]
    
    def test_cancel_media_request(
        self, client: TestClient, mock_user: UserInDB, mock_media_request: MediaRequestInDB, mock_db: AsyncMock
    ):
        """Test cancelling a pending media request."""
        # Mock initial request
        mock_db.get_media_request.return_value = mock_media_request
        
        # Mock updated request
        cancelled_request = mock_media_request.model_copy()
        cancelled_request.status = MediaRequestStatus.CANCELLED
        mock_db.update_media_request.return_value = cancelled_request
        
        response = client.put(f"/api/v1/media-requests/{mock_media_request.id}/cancel")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "cancelled"
        
        # Verify database calls
        mock_db.get_media_request.assert_called_once_with(mock_media_request.id)
        mock_db.update_media_request.assert_called_once()
    
    def test_cancel_completed_request_fails(
        self, client: TestClient, mock_user: UserInDB, mock_media_request: MediaRequestInDB, mock_db: AsyncMock
    ):
        """Test that completed requests cannot be cancelled."""
        # Set request as completed
        completed_request = mock_media_request.model_copy()
        completed_request.status = MediaRequestStatus.COMPLETED
        mock_db.get_media_request.return_value = completed_request
        
        response = client.put(f"/api/v1/media-requests/{mock_media_request.id}/cancel")
        
        assert response.status_code == 409
        assert "Cannot cancel" in response.json()["detail"]
    
    def test_retry_failed_request(
        self, client: TestClient, mock_user: UserInDB, mock_media_request: MediaRequestInDB, mock_db: AsyncMock
    ):
        """Test retrying a failed media request."""
        # Set request as failed
        failed_request = mock_media_request.model_copy()
        failed_request.status = MediaRequestStatus.FAILED
        failed_request.retry_count = 1
        mock_db.get_media_request.return_value = failed_request
        
        # Mock updated request
        retried_request = failed_request.model_copy()
        retried_request.status = MediaRequestStatus.PENDING
        retried_request.retry_count = 2
        mock_db.update_media_request.return_value = retried_request
        
        response = client.put(f"/api/v1/media-requests/{mock_media_request.id}/retry")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "pending"
        assert data["retry_count"] == 2
        
        # Verify database calls
        mock_db.update_media_request.assert_called_once()
    
    def test_retry_request_max_retries_exceeded(
        self, client: TestClient, mock_user: UserInDB, mock_media_request: MediaRequestInDB, mock_db: AsyncMock
    ):
        """Test that requests with max retries cannot be retried."""
        # Set request as failed with max retries
        failed_request = mock_media_request.model_copy()
        failed_request.status = MediaRequestStatus.FAILED
        failed_request.retry_count = 3  # Max retries reached
        mock_db.get_media_request.return_value = failed_request
        
        response = client.put(f"/api/v1/media-requests/{mock_media_request.id}/retry")
        
        assert response.status_code == 409
        assert "Maximum retry limit" in response.json()["detail"]


class TestMediaRequestModels:
    """Test cases for media request data models."""
    
    def test_media_request_create_model(self):
        """Test MediaRequestCreate model validation."""
        request_data = {
            "request_type": MediaRequestType.IMAGE,
            "prompt": "A beautiful landscape",
            "quality": MediaQuality.PREMIUM,
            "priority": 8
        }
        
        request = MediaRequestCreate(**request_data)
        assert request.request_type == MediaRequestType.IMAGE
        assert request.prompt == "A beautiful landscape"
        assert request.quality == MediaQuality.PREMIUM
        assert request.priority == 8
    
    def test_media_request_priority_validation(self):
        """Test that priority is validated within range."""
        with pytest.raises(ValueError):
            MediaRequestCreate(
                request_type=MediaRequestType.IMAGE,
                prompt="Test",
                priority=11  # Outside valid range (1-10)
            )
    
    def test_media_request_enum_validation(self):
        """Test that enum validation works properly."""
        with pytest.raises(ValueError):
            MediaRequestCreate(
                request_type="invalid_type",
                prompt="Test"
            )


def test_premium_user_can_create_premium_request(mock_premium_user: UserInDB, mock_db: AsyncMock):
    """Test that premium users can create premium quality requests."""
    from fastapi.testclient import TestClient
    from app.main import app
    from app.api.dependencies import get_database, get_current_active_user
    
    # Override dependencies
    app.dependency_overrides[get_database] = lambda: mock_db
    app.dependency_overrides[get_current_active_user] = lambda: mock_premium_user
    
    # Mock database responses
    new_request = MediaRequestInDB(
        id=uuid4(),
        user_id=mock_premium_user.id,
        request_type=MediaRequestType.IMAGE,
        prompt="Premium quality image",
        status=MediaRequestStatus.PENDING,
        quality=MediaQuality.PREMIUM,
        created_at="2024-01-01T00:00:00Z",
        updated_at="2024-01-01T00:00:00Z"
    )
    mock_db.create_media_request.return_value = new_request
    mock_db.list_user_media_requests.return_value = []  # No requests today
    
    client = TestClient(app)
    
    request_data = {
        "request_type": "image",
        "prompt": "Premium quality image",
        "quality": "premium",
        "priority": 5
    }
    
    response = client.post("/api/v1/media-requests", json=request_data)
    
    assert response.status_code == 201
    data = response.json()
    assert data["quality"] == "premium"
    
    # Clean up
    app.dependency_overrides.clear() 