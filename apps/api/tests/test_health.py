import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock


class TestHealthAPI:
    """Test cases for health check endpoints."""
    
    def test_health_check_healthy(self, client: TestClient, mock_db: AsyncMock):
        """Test health check when all services are healthy."""
        # Mock healthy database
        mock_db.health_check.return_value = {"status": "healthy", "response_time_ms": 10}
        
        response = client.get("/api/v1/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
        assert "version" in data
        assert data["database"] == "healthy"
        
        # Verify database health check was called
        mock_db.health_check.assert_called_once()
    
    def test_health_check_degraded(self, client: TestClient, mock_db: AsyncMock):
        """Test health check when database is unhealthy."""
        # Mock unhealthy database
        mock_db.health_check.return_value = {"status": "unhealthy", "error": "Connection failed"}
        
        response = client.get("/api/v1/health")
        
        assert response.status_code == 200  # Health endpoint should always return 200
        data = response.json()
        assert data["status"] == "degraded"
        assert data["database"] == "unhealthy"
    
    def test_health_check_exception(self, client: TestClient, mock_db: AsyncMock):
        """Test health check when database throws exception."""
        # Mock database exception
        mock_db.health_check.side_effect = Exception("Database connection error")
        
        response = client.get("/api/v1/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "unhealthy"
        assert data["database"] == "unhealthy"
    
    def test_readiness_check_ready(self, client: TestClient, mock_db: AsyncMock):
        """Test readiness check when service is ready."""
        # Mock healthy database
        mock_db.health_check.return_value = {"status": "healthy"}
        
        response = client.get("/api/v1/health/ready")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ready"
    
    def test_readiness_check_not_ready(self, client: TestClient, mock_db: AsyncMock):
        """Test readiness check when service is not ready."""
        # Mock unhealthy database
        mock_db.health_check.return_value = {"status": "unhealthy"}
        
        response = client.get("/api/v1/health/ready")
        
        assert response.status_code == 503
        assert "not ready" in response.json()["detail"]
    
    def test_liveness_check(self, client: TestClient):
        """Test liveness check (should always be alive)."""
        response = client.get("/api/v1/health/live")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "alive"


def test_root_endpoint():
    """Test the root endpoint without authentication."""
    from fastapi.testclient import TestClient
    from app.main import app
    
    # Don't override any dependencies for this test
    client = TestClient(app)
    
    response = client.get("/")
    
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "version" in data
    assert "Luxury Account API" in data["message"] 