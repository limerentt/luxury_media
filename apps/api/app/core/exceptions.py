from typing import Any, Dict, Optional, Union
from uuid import UUID

from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import structlog

logger = structlog.get_logger(__name__)


class ErrorResponse(BaseModel):
    """Standard error response model."""
    error: str
    message: str
    details: Optional[Dict[str, Any]] = None
    request_id: Optional[str] = None


class LuxuryAccountException(Exception):
    """Base exception for Luxury Account platform."""
    
    def __init__(
        self,
        message: str,
        error_code: str = "INTERNAL_ERROR",
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class UserNotFoundError(LuxuryAccountException):
    """User not found error."""
    
    def __init__(self, user_id: Union[UUID, str]):
        super().__init__(
            message=f"User with ID {user_id} not found",
            error_code="USER_NOT_FOUND",
            status_code=status.HTTP_404_NOT_FOUND,
            details={"user_id": str(user_id)}
        )


class UserAlreadyExistsError(LuxuryAccountException):
    """User already exists error."""
    
    def __init__(self, email: str):
        super().__init__(
            message=f"User with email {email} already exists",
            error_code="USER_ALREADY_EXISTS",
            status_code=status.HTTP_409_CONFLICT,
            details={"email": email}
        )


class MediaRequestNotFoundError(LuxuryAccountException):
    """Media request not found error."""
    
    def __init__(self, request_id: Union[UUID, str]):
        super().__init__(
            message=f"Media request with ID {request_id} not found",
            error_code="MEDIA_REQUEST_NOT_FOUND",
            status_code=status.HTTP_404_NOT_FOUND,
            details={"request_id": str(request_id)}
        )


class PaymentNotFoundError(LuxuryAccountException):
    """Payment not found error."""
    
    def __init__(self, payment_id: Union[UUID, str]):
        super().__init__(
            message=f"Payment with ID {payment_id} not found",
            error_code="PAYMENT_NOT_FOUND",
            status_code=status.HTTP_404_NOT_FOUND,
            details={"payment_id": str(payment_id)}
        )


class InsufficientPermissionsError(LuxuryAccountException):
    """Insufficient permissions error."""
    
    def __init__(self, action: str, resource: str):
        super().__init__(
            message=f"Insufficient permissions to {action} {resource}",
            error_code="INSUFFICIENT_PERMISSIONS",
            status_code=status.HTTP_403_FORBIDDEN,
            details={"action": action, "resource": resource}
        )


class SubscriptionRequiredError(LuxuryAccountException):
    """Subscription required error."""
    
    def __init__(self, required_tier: str):
        super().__init__(
            message=f"This feature requires {required_tier} subscription",
            error_code="SUBSCRIPTION_REQUIRED",
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            details={"required_tier": required_tier}
        )


class RateLimitExceededError(LuxuryAccountException):
    """Rate limit exceeded error."""
    
    def __init__(self, limit: int, window: int):
        super().__init__(
            message=f"Rate limit exceeded: {limit} requests per {window} seconds",
            error_code="RATE_LIMIT_EXCEEDED",
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            details={"limit": limit, "window": window}
        )


class StripeError(LuxuryAccountException):
    """Stripe payment error."""
    
    def __init__(self, message: str, stripe_error_code: Optional[str] = None):
        super().__init__(
            message=f"Payment processing failed: {message}",
            error_code="STRIPE_ERROR",
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            details={"stripe_error_code": stripe_error_code}
        )


class DatabaseError(LuxuryAccountException):
    """Database operation error."""
    
    def __init__(self, operation: str, details: Optional[str] = None):
        super().__init__(
            message=f"Database {operation} failed",
            error_code="DATABASE_ERROR",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            details={"operation": operation, "error_details": details}
        )


class ValidationError(LuxuryAccountException):
    """Data validation error."""
    
    def __init__(self, field: str, message: str):
        super().__init__(
            message=f"Validation error for field '{field}': {message}",
            error_code="VALIDATION_ERROR",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            details={"field": field, "validation_message": message}
        )


# Exception handlers
async def luxury_account_exception_handler(
    request: Request, exc: LuxuryAccountException
) -> JSONResponse:
    """Handle custom Luxury Account exceptions."""
    request_id = getattr(request.state, "request_id", None)
    
    logger.error(
        "Application error",
        error_code=exc.error_code,
        message=exc.message,
        status_code=exc.status_code,
        details=exc.details,
        request_id=request_id,
        path=str(request.url),
        method=request.method
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error=exc.error_code,
            message=exc.message,
            details=exc.details,
            request_id=request_id
        ).model_dump()
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Handle FastAPI HTTP exceptions."""
    request_id = getattr(request.state, "request_id", None)
    
    logger.warning(
        "HTTP exception",
        status_code=exc.status_code,
        detail=exc.detail,
        request_id=request_id,
        path=str(request.url),
        method=request.method
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error="HTTP_ERROR",
            message=str(exc.detail),
            request_id=request_id
        ).model_dump()
    )


async def validation_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle Pydantic validation exceptions."""
    request_id = getattr(request.state, "request_id", None)
    
    logger.error(
        "Validation exception",
        error=str(exc),
        request_id=request_id,
        path=str(request.url),
        method=request.method
    )
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=ErrorResponse(
            error="VALIDATION_ERROR",
            message="Request validation failed",
            details={"validation_errors": str(exc)},
            request_id=request_id
        ).model_dump()
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle all other exceptions."""
    request_id = getattr(request.state, "request_id", None)
    
    logger.error(
        "Unhandled exception",
        error=str(exc),
        exception_type=type(exc).__name__,
        request_id=request_id,
        path=str(request.url),
        method=request.method,
        exc_info=True
    )
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ErrorResponse(
            error="INTERNAL_ERROR",
            message="An internal server error occurred",
            request_id=request_id
        ).model_dump()
    ) 