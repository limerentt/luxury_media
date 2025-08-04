from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Optional
from uuid import UUID, uuid4

from pydantic import BaseModel, Field, ConfigDict


# =====================================================
# Enums
# =====================================================

class SubscriptionStatus(str, Enum):
    FREE = "free"
    PREMIUM = "premium"
    ENTERPRISE = "enterprise"
    SUSPENDED = "suspended"


class MediaRequestType(str, Enum):
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"
    AVATAR = "avatar"
    BANNER = "banner"


class MediaRequestStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class MediaQuality(str, Enum):
    DRAFT = "draft"
    STANDARD = "standard"
    PREMIUM = "premium"
    ULTRA = "ultra"


class MediaAssetStatus(str, Enum):
    PROCESSING = "processing"
    READY = "ready"
    ARCHIVED = "archived"
    DELETED = "deleted"
    CORRUPTED = "corrupted"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


# =====================================================
# Base Models
# =====================================================

class BaseDBModel(BaseModel):
    """Base model for database entities."""
    model_config = ConfigDict(
        from_attributes=True,
        use_enum_values=True,
        arbitrary_types_allowed=True
    )


# =====================================================
# User Models
# =====================================================

class UserBase(BaseDBModel):
    """Base user model with common fields."""
    email: str = Field(description="User email address")
    name: str = Field(description="User full name")
    google_id: Optional[str] = Field(default=None, description="Google OAuth ID")
    avatar_url: Optional[str] = Field(default=None, description="User avatar URL")


class UserCreate(UserBase):
    """User creation model."""
    pass


class UserUpdate(BaseDBModel):
    """User update model."""
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    subscription_status: Optional[SubscriptionStatus] = None
    subscription_expires_at: Optional[datetime] = None


class UserInDB(UserBase):
    """User model as stored in database."""
    id: UUID = Field(default_factory=uuid4)
    subscription_status: SubscriptionStatus = Field(default=SubscriptionStatus.FREE)
    subscription_expires_at: Optional[datetime] = None
    total_media_requests: int = Field(default=0)
    total_payments_amount: Decimal = Field(default=Decimal("0.00"))
    last_login_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class UserResponse(UserBase):
    """User response model."""
    id: UUID
    subscription_status: SubscriptionStatus
    subscription_expires_at: Optional[datetime]
    total_media_requests: int
    total_payments_amount: Decimal
    last_login_at: Optional[datetime]
    created_at: datetime


# =====================================================
# Media Request Models
# =====================================================

class MediaRequestBase(BaseDBModel):
    """Base media request model."""
    request_type: MediaRequestType
    prompt: str = Field(description="AI generation prompt")
    parameters: Optional[str] = Field(default="{}", description="JSON parameters")
    style_preset: Optional[str] = None
    resolution: Optional[str] = None
    quality: MediaQuality = Field(default=MediaQuality.STANDARD)
    priority: int = Field(default=5, ge=1, le=10)


class MediaRequestCreate(MediaRequestBase):
    """Media request creation model."""
    pass


class MediaRequestUpdate(BaseDBModel):
    """Media request update model."""
    status: Optional[MediaRequestStatus] = None
    processing_time_ms: Optional[int] = None
    error_message: Optional[str] = None
    retry_count: Optional[int] = None
    completed_at: Optional[datetime] = None


class MediaRequestInDB(MediaRequestBase):
    """Media request model as stored in database."""
    id: UUID = Field(default_factory=uuid4)
    user_id: UUID
    status: MediaRequestStatus = Field(default=MediaRequestStatus.PENDING)
    processing_time_ms: Optional[int] = None
    error_message: Optional[str] = None
    retry_count: int = Field(default=0)
    estimated_cost: Decimal = Field(default=Decimal("0.00"))
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None


class MediaRequestResponse(MediaRequestBase):
    """Media request response model."""
    id: UUID
    user_id: UUID
    status: MediaRequestStatus
    processing_time_ms: Optional[int]
    error_message: Optional[str]
    retry_count: int
    estimated_cost: Decimal
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime]


# =====================================================
# Media Asset Models
# =====================================================

class MediaAssetBase(BaseDBModel):
    """Base media asset model."""
    file_path: str
    file_name: str
    file_size: int = Field(description="File size in bytes")
    mime_type: str
    resolution: Optional[str] = None
    duration: Optional[float] = None
    thumbnail_path: Optional[str] = None
    cdn_url: Optional[str] = None


class MediaAssetCreate(MediaAssetBase):
    """Media asset creation model."""
    media_request_id: UUID
    user_id: UUID


class MediaAssetUpdate(BaseDBModel):
    """Media asset update model."""
    status: Optional[MediaAssetStatus] = None
    cdn_url: Optional[str] = None
    download_count: Optional[int] = None
    last_accessed_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    metadata: Optional[str] = None


class MediaAssetInDB(MediaAssetBase):
    """Media asset model as stored in database."""
    id: UUID = Field(default_factory=uuid4)
    media_request_id: UUID
    user_id: UUID
    status: MediaAssetStatus = Field(default=MediaAssetStatus.PROCESSING)
    download_count: int = Field(default=0)
    last_accessed_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    metadata: str = Field(default="{}")
    created_at: datetime
    updated_at: datetime


class MediaAssetResponse(MediaAssetBase):
    """Media asset response model."""
    id: UUID
    media_request_id: UUID
    user_id: UUID
    status: MediaAssetStatus
    download_count: int
    last_accessed_at: Optional[datetime]
    expires_at: Optional[datetime]
    metadata: str
    created_at: datetime


# =====================================================
# Payment Models
# =====================================================

class PaymentBase(BaseDBModel):
    """Base payment model."""
    amount: Decimal = Field(description="Payment amount")
    currency: str = Field(max_length=3, description="ISO 4217 currency code")
    description: Optional[str] = None


class PaymentCreate(PaymentBase):
    """Payment creation model."""
    user_id: UUID
    stripe_payment_intent_id: str


class PaymentUpdate(BaseDBModel):
    """Payment update model."""
    status: Optional[PaymentStatus] = None
    stripe_session_id: Optional[str] = None
    stripe_customer_id: Optional[str] = None
    payment_method_type: Optional[str] = None
    payment_method_brand: Optional[str] = None
    payment_method_last4: Optional[str] = None
    invoice_url: Optional[str] = None
    receipt_url: Optional[str] = None
    failure_code: Optional[str] = None
    failure_message: Optional[str] = None
    refunded_amount: Optional[Decimal] = None
    subscription_period_start: Optional[datetime] = None
    subscription_period_end: Optional[datetime] = None
    paid_at: Optional[datetime] = None


class PaymentInDB(PaymentBase):
    """Payment model as stored in database."""
    id: UUID = Field(default_factory=uuid4)
    user_id: UUID
    stripe_payment_intent_id: str
    stripe_session_id: Optional[str] = None
    stripe_customer_id: Optional[str] = None
    status: PaymentStatus = Field(default=PaymentStatus.PENDING)
    payment_method_type: Optional[str] = None
    payment_method_brand: Optional[str] = None
    payment_method_last4: Optional[str] = None
    invoice_url: Optional[str] = None
    receipt_url: Optional[str] = None
    failure_code: Optional[str] = None
    failure_message: Optional[str] = None
    refunded_amount: Decimal = Field(default=Decimal("0.00"))
    subscription_period_start: Optional[datetime] = None
    subscription_period_end: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    paid_at: Optional[datetime] = None


class PaymentResponse(PaymentBase):
    """Payment response model."""
    id: UUID
    user_id: UUID
    stripe_payment_intent_id: str
    status: PaymentStatus
    payment_method_type: Optional[str]
    payment_method_brand: Optional[str]
    payment_method_last4: Optional[str]
    refunded_amount: Decimal
    created_at: datetime
    paid_at: Optional[datetime]


# =====================================================
# Response Models
# =====================================================

class PaginatedResponse(BaseDBModel):
    """Paginated response model."""
    items: list
    total: int
    page: int
    size: int
    pages: int


class HealthCheck(BaseDBModel):
    """Health check response model."""
    status: str = Field(default="healthy")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    version: str
    database: str = Field(default="unknown")
    uptime: Optional[float] = None


class MediaGenerationMessage(BaseDBModel):
    """Message for media generation request processing."""
    request_id: str = Field(..., description="Media request ID")
    user_id: str = Field(..., description="User ID")
    media_type: MediaRequestType = Field(..., description="Type of media to generate")
    prompt: str = Field(..., description="Generation prompt")
    quality: MediaQuality = Field(default=MediaQuality.STANDARD, description="Media quality")
    retry_count: int = Field(default=0, description="Current retry count")
    max_retries: int = Field(default=3, description="Maximum retry attempts")
    metadata: Optional[dict] = Field(default=None, description="Additional metadata") 