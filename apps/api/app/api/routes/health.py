from datetime import datetime
from typing import Dict, Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import get_health_components
from app.core.config import settings
from app.database.models import HealthCheck
from app.database.client import ClickHouseClient

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthCheck)
async def health_check(
    components: Dict[str, Any] = Depends(get_health_components)
) -> HealthCheck:
    """
    Health check endpoint for monitoring.
    
    Returns:
        HealthCheck: Health status and system information
    """
    database_status = "unknown"
    
    try:
        # Check database connectivity
        db: ClickHouseClient = components["database"]
        db_health = await db.health_check()
        database_status = db_health["status"]
        
        # Calculate uptime (this is a simple implementation)
        # In production, you might want to track actual startup time
        uptime = 60.0  # placeholder
        
        return HealthCheck(
            status="healthy" if database_status == "healthy" else "degraded",
            timestamp=datetime.utcnow(),
            version=settings.app_version,
            database=database_status,
            uptime=uptime
        )
    
    except Exception as e:
        # Log the error but don't expose internal details
        return HealthCheck(
            status="unhealthy",
            timestamp=datetime.utcnow(),
            version=settings.app_version,
            database="unhealthy",
            uptime=None
        )


@router.get("/health/ready")
async def readiness_check(
    components: Dict[str, Any] = Depends(get_health_components)
) -> Dict[str, str]:
    """
    Kubernetes readiness probe endpoint.
    
    Returns:
        Dict: Ready status
    
    Raises:
        HTTPException: If service is not ready
    """
    try:
        # Check all critical dependencies
        db: ClickHouseClient = components["database"]
        db_health = await db.health_check()
        
        if db_health["status"] != "healthy":
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database not ready"
            )
        
        return {"status": "ready"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service not ready"
        )


@router.get("/health/live")
async def liveness_check() -> Dict[str, str]:
    """
    Kubernetes liveness probe endpoint.
    
    Returns:
        Dict: Alive status
    """
    return {"status": "alive"} 