import asyncio
from datetime import datetime, timedelta
from typing import Dict, Optional, Any
from uuid import UUID

import structlog
from fastapi import Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.config import settings
from app.core.exceptions import UserNotFoundError, DatabaseError
from app.database.client import ClickHouseClient, clickhouse_client
from app.database.models import UserInDB, SubscriptionStatus

logger = structlog.get_logger(__name__)

# Security
bearer = HTTPBearer()


# =====================================================
# Database Dependency
# =====================================================

async def get_database() -> ClickHouseClient:
    """Get database client instance."""
    return clickhouse_client


# =====================================================
# Authentication Dependencies
# =====================================================

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
    db: ClickHouseClient = Depends(get_database)
) -> UserInDB:
    """
    Get current authenticated user from JWT token.
    
    Args:
        credentials: JWT token from Authorization header
        db: Database client
        
    Returns:
        UserInDB: Current user
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    # TODO: Implement JWT token validation
    # For now, return a mock user for testing
    from uuid import UUID
    from app.database.models import UserInDB, SubscriptionStatus
    
    mock_user = UserInDB(
        id=UUID("550e8400-e29b-41d4-a716-446655440000"),
        email="test@example.com",
        name="Test User",
        subscription_status=SubscriptionStatus.FREE,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    return mock_user


async def get_current_active_user(
    current_user: UserInDB = Depends(get_current_user)
) -> UserInDB:
    """Get current active user (not suspended)."""
    if current_user.subscription_status == SubscriptionStatus.SUSPENDED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account suspended"
        )
    return current_user


async def require_subscription(
    min_tier: SubscriptionStatus = SubscriptionStatus.PREMIUM,
    current_user: UserInDB = Depends(get_current_active_user)
) -> UserInDB:
    """
    Require minimum subscription tier.
    
    Args:
        min_tier: Minimum required subscription tier
        current_user: Current authenticated user
        
    Returns:
        UserInDB: Current user if subscription tier is sufficient
        
    Raises:
        HTTPException: If subscription tier is insufficient
    """
    tier_order = {
        SubscriptionStatus.FREE: 0,
        SubscriptionStatus.PREMIUM: 1,
        SubscriptionStatus.ENTERPRISE: 2
    }
    
    if tier_order.get(current_user.subscription_status, 0) < tier_order.get(min_tier, 0):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Requires {min_tier.value} subscription or higher"
        )
    
    return current_user


# =====================================================
# Pagination Dependencies
# =====================================================

async def get_pagination_params(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Page size")
) -> dict:
    """Get pagination parameters."""
    return {
        "page": page,
        "size": size,
        "limit": size,
        "offset": (page - 1) * size
    }


# =====================================================
# User Management Dependencies
# =====================================================

async def get_user_by_id(
    user_id: UUID,
    db: ClickHouseClient = Depends(get_database)
) -> UserInDB:
    """
    Get user by ID.
    
    Args:
        user_id: User ID
        db: Database client
        
    Returns:
        UserInDB: User data
        
    Raises:
        UserNotFoundError: If user not found
    """
    user = await db.get_user(user_id)
    if not user:
        raise UserNotFoundError(user_id)
    return user


# =====================================================
# Logging Context Dependencies
# =====================================================

async def get_request_context() -> Dict[str, Any]:
    """Get request context for logging."""
    return {
        "request_id": f"req_{datetime.utcnow().isoformat()}",
        "timestamp": datetime.utcnow().isoformat()
    }


# =====================================================
# Rate Limiting
# =====================================================

class RateLimiter:
    """Simple in-memory rate limiter."""
    
    def __init__(self):
        self.requests: Dict[str, list] = {}
    
    def is_allowed(self, key: str, limit: int, window: int) -> bool:
        """Check if request is allowed."""
        now = datetime.utcnow()
        window_start = now - timedelta(seconds=window)
        
        # Get existing requests for this key
        if key not in self.requests:
            self.requests[key] = []
        
        # Remove old requests
        self.requests[key] = [
            req_time for req_time in self.requests[key]
            if req_time > window_start
        ]
        
        # Check if under limit
        if len(self.requests[key]) < limit:
            self.requests[key].append(now)
            return True
        
        return False


# Global rate limiter instance
rate_limiter = RateLimiter()


async def check_rate_limit(
    current_user: Optional[UserInDB] = Depends(get_current_user)
) -> None:
    """
    Check rate limit for current user.
    
    Args:
        current_user: Current authenticated user
        
    Raises:
        HTTPException: If rate limit exceeded
    """
    # Use user ID as key, or IP for anonymous users
    key = str(current_user.id) if current_user else "anonymous"
    
    if not rate_limiter.is_allowed(
        key,
        settings.rate_limit_requests,
        settings.rate_limit_window
    ):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded"
        )


# =====================================================
# Health Check Dependencies
# =====================================================

async def get_health_components() -> Dict[str, Any]:
    """Get health check components."""
    try:
        db = await get_database()
        db_health = await db.health_check()
        
        return {
            "database": db_health,
            "uptime": datetime.utcnow().isoformat(),
            "version": "1.0.0"
        }
    except Exception as e:
        logger.error("Health check failed", error=str(e))
        return {
            "database": {"status": "unhealthy", "error": str(e)},
            "uptime": datetime.utcnow().isoformat(),
            "version": "1.0.0"
        } 