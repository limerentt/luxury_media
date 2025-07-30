import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock
from uuid import uuid4

from app.database.models import UserInDB, UserCreate, UserUpdate, SubscriptionStatus


class TestUsersAPI:
    """Test cases for users API endpoints."""
    
    def test_get_current_user_profile(self, client: TestClient, mock_user: UserInDB):
        """Test getting current user profile."""
        response = client.get("/api/v1/users/me")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(mock_user.id)
        assert data["email"] == mock_user.email
        assert data["name"] == mock_user.name
        assert data["subscription_status"] == mock_user.subscription_status.value
    
    def test_update_current_user_profile(
        self, client: TestClient, mock_user: UserInDB, mock_db: AsyncMock
    ):
        """Test updating current user profile."""
        # Mock database response
        updated_user = mock_user.model_copy()
        updated_user.name = "Updated Name"
        mock_db.update_user.return_value = updated_user
        
        update_data = {"name": "Updated Name"}
        response = client.put("/api/v1/users/me", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Name"
        
        # Verify database was called
        mock_db.update_user.assert_called_once()
    
    def test_get_user_by_id_own_data(
        self, client: TestClient, mock_user: UserInDB, mock_db: AsyncMock
    ):
        """Test getting user by ID (own data)."""
        mock_db.get_user.return_value = mock_user
        
        response = client.get(f"/api/v1/users/{mock_user.id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(mock_user.id)
        
        mock_db.get_user.assert_called_once_with(mock_user.id)
    
    def test_get_user_by_id_forbidden(self, client: TestClient):
        """Test getting user by ID (forbidden - other user's data)."""
        other_user_id = uuid4()
        
        response = client.get(f"/api/v1/users/{other_user_id}")
        
        assert response.status_code == 403
        assert "Access denied" in response.json()["message"]
    
    def test_create_user(self, client: TestClient, mock_db: AsyncMock):
        """Test creating a new user."""
        # Mock database responses
        mock_db.get_user_by_email.return_value = None  # User doesn't exist
        
        new_user = UserInDB(
            id=uuid4(),
            email="new@example.com",
            name="New User",
            subscription_status=SubscriptionStatus.FREE,
            total_media_requests=0,
            total_payments_amount=0,
            created_at="2024-01-01T00:00:00Z",
            updated_at="2024-01-01T00:00:00Z"
        )
        mock_db.create_user.return_value = new_user
        
        user_data = {
            "email": "new@example.com",
            "name": "New User"
        }
        
        response = client.post("/api/v1/users", json=user_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "new@example.com"
        assert data["name"] == "New User"
        
        # Verify database calls
        mock_db.get_user_by_email.assert_called_once_with("new@example.com")
        mock_db.create_user.assert_called_once()
    
    def test_create_user_already_exists(self, client: TestClient, mock_db: AsyncMock):
        """Test creating user that already exists."""
        # Mock user already exists
        existing_user = UserInDB(
            id=uuid4(),
            email="existing@example.com",
            name="Existing User",
            subscription_status=SubscriptionStatus.FREE,
            total_media_requests=0,
            total_payments_amount=0,
            created_at="2024-01-01T00:00:00Z",
            updated_at="2024-01-01T00:00:00Z"
        )
        mock_db.get_user_by_email.return_value = existing_user
        
        user_data = {
            "email": "existing@example.com",
            "name": "New User"
        }
        
        response = client.post("/api/v1/users", json=user_data)
        
        assert response.status_code == 409
        assert "already exists" in response.json()["message"]
    
    def test_delete_current_user(
        self, client: TestClient, mock_user: UserInDB, mock_db: AsyncMock
    ):
        """Test soft deleting current user."""
        suspended_user = mock_user.model_copy()
        suspended_user.subscription_status = SubscriptionStatus.SUSPENDED
        mock_db.update_user.return_value = suspended_user
        
        response = client.delete("/api/v1/users/me")
        
        assert response.status_code == 204
        
        # Verify database was called to suspend user
        mock_db.update_user.assert_called_once()
        call_args = mock_db.update_user.call_args
        assert call_args[0][0] == mock_user.id  # user_id
        assert call_args[0][1].subscription_status == SubscriptionStatus.SUSPENDED
    
    def test_list_users_forbidden(self, client: TestClient):
        """Test listing users (should be forbidden for non-admin)."""
        response = client.get("/api/v1/users")
        
        assert response.status_code == 403
        assert "Admin permissions required" in response.json()["message"]


class TestUserModels:
    """Test cases for user data models."""
    
    def test_user_create_model(self):
        """Test UserCreate model validation."""
        user_data = {
            "email": "test@example.com",
            "name": "Test User",
            "google_id": "google_123"
        }
        
        user = UserCreate(**user_data)
        assert user.email == "test@example.com"
        assert user.name == "Test User"
        assert user.google_id == "google_123"
    
    def test_user_update_model(self):
        """Test UserUpdate model validation."""
        update_data = {
            "name": "Updated Name",
            "subscription_status": SubscriptionStatus.PREMIUM
        }
        
        user_update = UserUpdate(**update_data)
        assert user_update.name == "Updated Name"
        assert user_update.subscription_status == SubscriptionStatus.PREMIUM
        assert user_update.avatar_url is None  # Not provided
    
    def test_user_model_enum_validation(self):
        """Test that subscription status enum validation works."""
        with pytest.raises(ValueError):
            UserUpdate(subscription_status="invalid_status")


@pytest_asyncio.async_test
async def test_user_authentication_required():
    """Test that authentication is required for protected endpoints."""
    from fastapi.testclient import TestClient
    from app.main import app
    from app.api.dependencies import get_current_active_user
    
    # Don't override the authentication dependency
    client = TestClient(app)
    
    # These should all return 401 without authentication
    endpoints = [
        ("GET", "/api/v1/users/me"),
        ("PUT", "/api/v1/users/me"),
        ("DELETE", "/api/v1/users/me"),
        ("GET", "/api/v1/users"),
    ]
    
    for method, endpoint in endpoints:
        if method == "GET":
            response = client.get(endpoint)
        elif method == "PUT":
            response = client.put(endpoint, json={})
        elif method == "DELETE":
            response = client.delete(endpoint)
        
        assert response.status_code == 401 