from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query

from app.api.dependencies import (
    get_database, get_current_active_user, get_pagination_params,
    require_subscription, check_rate_limit
)
from app.core.exceptions import (
    MediaRequestNotFoundError, SubscriptionRequiredError, DatabaseError
)
from app.core.logging import log_api_call, log_business_event
from app.database.client import ClickHouseClient
from app.database.models import (
    MediaRequestResponse, MediaRequestCreate, MediaRequestUpdate, 
    MediaRequestInDB, UserInDB, PaginatedResponse,
    MediaRequestStatus, MediaRequestType, MediaQuality,
    SubscriptionStatus
)

router = APIRouter(prefix="/media-requests", tags=["media-requests"])


@router.post("", response_model=MediaRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_media_request(
    request_data: MediaRequestCreate,
    current_user: UserInDB = Depends(get_current_active_user),
    db: ClickHouseClient = Depends(get_database),
    _: None = Depends(check_rate_limit)
) -> MediaRequestResponse:
    """
    Create a new media generation request.
    
    Args:
        request_data: Media request creation data
        current_user: Current authenticated user
        db: Database client
        
    Returns:
        MediaRequestResponse: Created media request
        
    Raises:
        SubscriptionRequiredError: If subscription required for request type/quality
        DatabaseError: If database operation fails
    """
    log_api_call(
        "create_media_request",
        user_id=str(current_user.id),
        request_type=request_data.request_type,
        quality=request_data.quality
    )
    
    # Check subscription requirements based on quality
    if request_data.quality == MediaQuality.PREMIUM and current_user.subscription_status == SubscriptionStatus.FREE:
        raise SubscriptionRequiredError("premium")
    elif request_data.quality == MediaQuality.ULTRA and current_user.subscription_status != SubscriptionStatus.ENTERPRISE:
        raise SubscriptionRequiredError("enterprise")
    
    # Check rate limits based on subscription
    user_requests_today = await _get_user_requests_today(current_user.id, db)
    daily_limits = {
        SubscriptionStatus.FREE: 5,
        SubscriptionStatus.PREMIUM: 50,
        SubscriptionStatus.ENTERPRISE: 500
    }
    
    limit = daily_limits.get(current_user.subscription_status, 0)
    if user_requests_today >= limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Daily limit of {limit} requests exceeded"
        )
    
    try:
        # Create media request
        media_request = await db.create_media_request(request_data, current_user.id)
        
        log_business_event(
            "media_request_created",
            request_id=str(media_request.id),
            user_id=str(current_user.id),
            request_type=media_request.request_type,
            quality=media_request.quality,
            estimated_cost=float(media_request.estimated_cost)
        )
        
        # TODO: Send request to processing queue (RabbitMQ)
        # await send_to_processing_queue(media_request)
        
        return MediaRequestResponse.model_validate(media_request)
    
    except Exception as e:
        raise DatabaseError("create media request", str(e))


@router.get("", response_model=PaginatedResponse)
async def list_user_media_requests(
    pagination: dict = Depends(get_pagination_params),
    status_filter: MediaRequestStatus = Query(None, description="Filter by status"),
    type_filter: MediaRequestType = Query(None, description="Filter by type"),
    current_user: UserInDB = Depends(get_current_active_user),
    db: ClickHouseClient = Depends(get_database)
) -> PaginatedResponse:
    """
    List current user's media requests with pagination and filtering.
    
    Args:
        pagination: Pagination parameters
        status_filter: Optional status filter
        type_filter: Optional type filter
        current_user: Current authenticated user
        db: Database client
        
    Returns:
        PaginatedResponse: Paginated list of media requests
        
    Raises:
        DatabaseError: If database operation fails
    """
    log_api_call(
        "list_user_media_requests",
        user_id=str(current_user.id),
        status_filter=status_filter,
        type_filter=type_filter,
        **pagination
    )
    
    try:
        # TODO: Implement filtering in database query
        requests = await db.list_user_media_requests(
            current_user.id,
            limit=pagination["limit"],
            offset=pagination["offset"]
        )
        
        # Apply filters (this should be done in database query for efficiency)
        if status_filter:
            requests = [r for r in requests if r.status == status_filter]
        if type_filter:
            requests = [r for r in requests if r.request_type == type_filter]
        
        # Convert to response models
        request_responses = [MediaRequestResponse.model_validate(req) for req in requests]
        
        # Calculate total (simplified)
        total = len(request_responses)
        pages = (total + pagination["size"] - 1) // pagination["size"]
        
        return PaginatedResponse(
            items=request_responses,
            total=total,
            page=pagination["page"],
            size=pagination["size"],
            pages=pages
        )
    
    except Exception as e:
        raise DatabaseError("list media requests", str(e))


@router.get("/{request_id}", response_model=MediaRequestResponse)
async def get_media_request(
    request_id: UUID,
    current_user: UserInDB = Depends(get_current_active_user),
    db: ClickHouseClient = Depends(get_database)
) -> MediaRequestResponse:
    """
    Get a specific media request by ID.
    
    Args:
        request_id: Media request ID
        current_user: Current authenticated user
        db: Database client
        
    Returns:
        MediaRequestResponse: Media request details
        
    Raises:
        MediaRequestNotFoundError: If request not found
        HTTPException: If user doesn't own the request
        DatabaseError: If database operation fails
    """
    log_api_call(
        "get_media_request",
        request_id=str(request_id),
        user_id=str(current_user.id)
    )
    
    try:
        media_request = await db.get_media_request(request_id)
        if not media_request:
            raise MediaRequestNotFoundError(request_id)
        
        # Check ownership
        if media_request.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        return MediaRequestResponse.model_validate(media_request)
    
    except MediaRequestNotFoundError:
        raise
    except HTTPException:
        raise
    except Exception as e:
        raise DatabaseError("get media request", str(e))


@router.put("/{request_id}/cancel", response_model=MediaRequestResponse)
async def cancel_media_request(
    request_id: UUID,
    current_user: UserInDB = Depends(get_current_active_user),
    db: ClickHouseClient = Depends(get_database)
) -> MediaRequestResponse:
    """
    Cancel a pending or processing media request.
    
    Args:
        request_id: Media request ID
        current_user: Current authenticated user
        db: Database client
        
    Returns:
        MediaRequestResponse: Updated media request
        
    Raises:
        MediaRequestNotFoundError: If request not found
        HTTPException: If request cannot be cancelled or user doesn't own it
        DatabaseError: If database operation fails
    """
    log_api_call(
        "cancel_media_request",
        request_id=str(request_id),
        user_id=str(current_user.id)
    )
    
    try:
        media_request = await db.get_media_request(request_id)
        if not media_request:
            raise MediaRequestNotFoundError(request_id)
        
        # Check ownership
        if media_request.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Check if request can be cancelled
        if media_request.status not in [MediaRequestStatus.PENDING, MediaRequestStatus.PROCESSING]:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Cannot cancel request with status: {media_request.status}"
            )
        
        # Update status to cancelled
        update_data = MediaRequestUpdate(status=MediaRequestStatus.CANCELLED)
        updated_request = await db.update_media_request(request_id, update_data)
        
        log_business_event(
            "media_request_cancelled",
            request_id=str(request_id),
            user_id=str(current_user.id)
        )
        
        # TODO: Cancel processing job if it's in queue
        # await cancel_processing_job(request_id)
        
        return MediaRequestResponse.model_validate(updated_request)
    
    except (MediaRequestNotFoundError, HTTPException):
        raise
    except Exception as e:
        raise DatabaseError("cancel media request", str(e))


@router.put("/{request_id}/retry", response_model=MediaRequestResponse)
async def retry_media_request(
    request_id: UUID,
    current_user: UserInDB = Depends(get_current_active_user),
    db: ClickHouseClient = Depends(get_database)
) -> MediaRequestResponse:
    """
    Retry a failed media request.
    
    Args:
        request_id: Media request ID
        current_user: Current authenticated user
        db: Database client
        
    Returns:
        MediaRequestResponse: Updated media request
        
    Raises:
        MediaRequestNotFoundError: If request not found
        HTTPException: If request cannot be retried or user doesn't own it
        DatabaseError: If database operation fails
    """
    log_api_call(
        "retry_media_request",
        request_id=str(request_id),
        user_id=str(current_user.id)
    )
    
    try:
        media_request = await db.get_media_request(request_id)
        if not media_request:
            raise MediaRequestNotFoundError(request_id)
        
        # Check ownership
        if media_request.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Check if request can be retried
        if media_request.status != MediaRequestStatus.FAILED:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Cannot retry request with status: {media_request.status}"
            )
        
        # Check retry limit
        if media_request.retry_count >= 3:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Maximum retry limit reached"
            )
        
        # Update status and increment retry count
        update_data = MediaRequestUpdate(
            status=MediaRequestStatus.PENDING,
            retry_count=media_request.retry_count + 1,
            error_message=None
        )
        updated_request = await db.update_media_request(request_id, update_data)
        
        log_business_event(
            "media_request_retried",
            request_id=str(request_id),
            user_id=str(current_user.id),
            retry_count=updated_request.retry_count
        )
        
        # TODO: Re-send request to processing queue
        # await send_to_processing_queue(updated_request)
        
        return MediaRequestResponse.model_validate(updated_request)
    
    except (MediaRequestNotFoundError, HTTPException):
        raise
    except Exception as e:
        raise DatabaseError("retry media request", str(e))


# =====================================================
# Helper Functions
# =====================================================

async def _get_user_requests_today(user_id: UUID, db: ClickHouseClient) -> int:
    """Get count of user's requests created today."""
    # TODO: Implement proper query to count today's requests
    # This is a simplified implementation
    try:
        requests = await db.list_user_media_requests(user_id, limit=1000, offset=0)
        from datetime import datetime, timedelta
        today = datetime.utcnow().date()
        today_requests = [r for r in requests if r.created_at.date() == today]
        return len(today_requests)
    except Exception:
        return 0  # Fail safe 