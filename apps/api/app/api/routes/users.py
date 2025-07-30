from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import (
    get_database, get_current_active_user, get_pagination_params,
    check_rate_limit
)
from app.core.exceptions import UserNotFoundError, UserAlreadyExistsError, DatabaseError
from app.core.logging import log_api_call, log_business_event
from app.database.client import ClickHouseClient
from app.database.models import (
    UserResponse, UserCreate, UserUpdate, UserInDB,
    PaginatedResponse
)

router = APIRouter(prefix="/users", tags=["users"])


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    db: ClickHouseClient = Depends(get_database),
    _: None = Depends(check_rate_limit)
) -> UserResponse:
    """
    Create a new user account.
    
    Args:
        user_data: User creation data
        db: Database client
        
    Returns:
        UserResponse: Created user data
        
    Raises:
        UserAlreadyExistsError: If user with email already exists
        DatabaseError: If database operation fails
    """
    log_api_call("create_user", email=user_data.email)
    
    try:
        # Check if user already exists
        existing_user = await db.get_user_by_email(user_data.email)
        if existing_user:
            raise UserAlreadyExistsError(user_data.email)
        
        # Create new user
        user = await db.create_user(user_data)
        
        log_business_event(
            "user_created",
            user_id=str(user.id),
            email=user.email,
            subscription_status=user.subscription_status
        )
        
        return UserResponse.model_validate(user)
    
    except UserAlreadyExistsError:
        raise
    except Exception as e:
        raise DatabaseError("create user", str(e))


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: UserInDB = Depends(get_current_active_user)
) -> UserResponse:
    """
    Get current user's profile.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        UserResponse: Current user profile
    """
    log_api_call("get_current_user_profile", user_id=str(current_user.id))
    
    return UserResponse.model_validate(current_user)


@router.put("/me", response_model=UserResponse)
async def update_current_user_profile(
    user_update: UserUpdate,
    current_user: UserInDB = Depends(get_current_active_user),
    db: ClickHouseClient = Depends(get_database)
) -> UserResponse:
    """
    Update current user's profile.
    
    Args:
        user_update: User update data
        current_user: Current authenticated user
        db: Database client
        
    Returns:
        UserResponse: Updated user profile
        
    Raises:
        DatabaseError: If database operation fails
    """
    log_api_call("update_current_user_profile", user_id=str(current_user.id))
    
    try:
        updated_user = await db.update_user(current_user.id, user_update)
        if not updated_user:
            raise UserNotFoundError(current_user.id)
        
        log_business_event(
            "user_updated",
            user_id=str(updated_user.id),
            updated_fields=list(user_update.model_dump(exclude_unset=True).keys())
        )
        
        return UserResponse.model_validate(updated_user)
    
    except UserNotFoundError:
        raise
    except Exception as e:
        raise DatabaseError("update user", str(e))


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: UUID,
    current_user: UserInDB = Depends(get_current_active_user),
    db: ClickHouseClient = Depends(get_database)
) -> UserResponse:
    """
    Get user by ID.
    
    Note: Users can only access their own profiles unless they have admin permissions.
    
    Args:
        user_id: User ID to retrieve
        current_user: Current authenticated user
        db: Database client
        
    Returns:
        UserResponse: User profile
        
    Raises:
        UserNotFoundError: If user not found
        InsufficientPermissionsError: If trying to access another user's data
    """
    log_api_call("get_user_by_id", user_id=str(user_id), requester_id=str(current_user.id))
    
    # Check permissions (users can only access their own data)
    # TODO: Add admin role check
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    try:
        user = await db.get_user(user_id)
        if not user:
            raise UserNotFoundError(user_id)
        
        return UserResponse.model_validate(user)
    
    except UserNotFoundError:
        raise
    except Exception as e:
        raise DatabaseError("get user", str(e))


@router.get("", response_model=PaginatedResponse)
async def list_users(
    pagination: dict = Depends(get_pagination_params),
    current_user: UserInDB = Depends(get_current_active_user),
    db: ClickHouseClient = Depends(get_database)
) -> PaginatedResponse:
    """
    List users with pagination.
    
    Note: This endpoint requires admin permissions.
    TODO: Implement admin role checking.
    
    Args:
        pagination: Pagination parameters
        current_user: Current authenticated user
        db: Database client
        
    Returns:
        PaginatedResponse: Paginated list of users
        
    Raises:
        InsufficientPermissionsError: If not admin
        DatabaseError: If database operation fails
    """
    log_api_call("list_users", requester_id=str(current_user.id), **pagination)
    
    # TODO: Add admin role check
    # For now, only allow users to see themselves
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Admin permissions required"
    )
    
    try:
        users = await db.list_users(
            limit=pagination["limit"],
            offset=pagination["offset"]
        )
        
        # Convert to response models
        user_responses = [UserResponse.model_validate(user) for user in users]
        
        # Calculate total (this is simplified - in production you'd want proper counting)
        total = len(user_responses)  # This is not accurate for pagination
        pages = (total + pagination["size"] - 1) // pagination["size"]
        
        return PaginatedResponse(
            items=user_responses,
            total=total,
            page=pagination["page"],
            size=pagination["size"],
            pages=pages
        )
    
    except Exception as e:
        raise DatabaseError("list users", str(e))


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_current_user(
    current_user: UserInDB = Depends(get_current_active_user),
    db: ClickHouseClient = Depends(get_database)
):
    """
    Delete current user account.
    
    Note: This is a soft delete that suspends the account.
    
    Args:
        current_user: Current authenticated user
        db: Database client
        
    Raises:
        DatabaseError: If database operation fails
    """
    log_api_call("delete_current_user", user_id=str(current_user.id))
    
    try:
        # Soft delete by suspending account
        from app.database.models import SubscriptionStatus
        user_update = UserUpdate(subscription_status=SubscriptionStatus.SUSPENDED)
        
        await db.update_user(current_user.id, user_update)
        
        log_business_event(
            "user_deleted",
            user_id=str(current_user.id),
            email=current_user.email
        )
    
    except Exception as e:
        raise DatabaseError("delete user", str(e)) 