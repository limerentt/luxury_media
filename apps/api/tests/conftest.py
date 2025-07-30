import asyncio
from typing import AsyncGenerator, Generator
from unittest.mock import AsyncMock, MagicMock

import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from httpx import AsyncClient

from app.main import app
from app.database.client import ClickHouseClient
from app.database.models import UserInDB, MediaRequestInDB, PaymentInDB, SubscriptionStatus
from app.api.dependencies import get_database, get_current_active_user


# =====================================================
# Pytest Configuration
# =====================================================

@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create an instance of the default event loop for the test session."""
    policy = asyncio.get_event_loop_policy()
    loop = policy.new_event_loop()
    yield loop
    loop.close()


# =====================================================
# Database Fixtures
# =====================================================

@pytest_asyncio.fixture
async def mock_db() -> AsyncMock:
    """Mock ClickHouse database client."""
    mock_client = AsyncMock(spec=ClickHouseClient)
    
    # Mock connection methods
    mock_client.connect = AsyncMock()
    mock_client.disconnect = AsyncMock()
    mock_client.health_check = AsyncMock(return_value={"status": "healthy"})
    
    return mock_client


@pytest.fixture
def override_get_database(mock_db: AsyncMock):
    """Override database dependency."""
    def _override():
        return mock_db
    return _override


# =====================================================
# User Fixtures
# =====================================================

@pytest.fixture
def mock_user() -> UserInDB:
    """Create a mock user for testing."""
    from uuid import uuid4
    from datetime import datetime
    from decimal import Decimal
    
    return UserInDB(
        id=uuid4(),
        email="test@example.com",
        name="Test User",
        google_id="google_123",
        avatar_url="https://example.com/avatar.jpg",
        subscription_status=SubscriptionStatus.FREE,
        subscription_expires_at=None,
        total_media_requests=0,
        total_payments_amount=Decimal("0.00"),
        last_login_at=None,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )


@pytest.fixture
def mock_premium_user() -> UserInDB:
    """Create a mock premium user for testing."""
    from uuid import uuid4
    from datetime import datetime, timedelta
    from decimal import Decimal
    
    return UserInDB(
        id=uuid4(),
        email="premium@example.com",
        name="Premium User",
        google_id="google_456",
        avatar_url="https://example.com/premium_avatar.jpg",
        subscription_status=SubscriptionStatus.PREMIUM,
        subscription_expires_at=datetime.utcnow() + timedelta(days=30),
        total_media_requests=5,
        total_payments_amount=Decimal("29.99"),
        last_login_at=datetime.utcnow(),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )


@pytest.fixture
def override_get_current_user(mock_user: UserInDB):
    """Override current user dependency."""
    def _override():
        return mock_user
    return _override


# =====================================================
# App Fixtures
# =====================================================

@pytest.fixture
def client(
    override_get_database,
    override_get_current_user,
    mock_db: AsyncMock
) -> TestClient:
    """Create test client with overridden dependencies."""
    app.dependency_overrides[get_database] = override_get_database
    app.dependency_overrides[get_current_active_user] = override_get_current_user
    
    client = TestClient(app)
    yield client
    
    # Clean up
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def async_client(
    override_get_database,
    override_get_current_user,
    mock_db: AsyncMock
) -> AsyncGenerator[AsyncClient, None]:
    """Create async test client with overridden dependencies."""
    app.dependency_overrides[get_database] = override_get_database
    app.dependency_overrides[get_current_active_user] = override_get_current_user
    
    async with AsyncClient(app=app, base_url="http://testserver") as client:
        yield client
    
    # Clean up
    app.dependency_overrides.clear()


# =====================================================
# Media Request Fixtures
# =====================================================

@pytest.fixture
def mock_media_request(mock_user: UserInDB) -> MediaRequestInDB:
    """Create a mock media request for testing."""
    from uuid import uuid4
    from datetime import datetime
    from decimal import Decimal
    from app.database.models import MediaRequestType, MediaRequestStatus, MediaQuality
    
    return MediaRequestInDB(
        id=uuid4(),
        user_id=mock_user.id,
        request_type=MediaRequestType.IMAGE,
        prompt="A beautiful landscape",
        status=MediaRequestStatus.PENDING,
        parameters='{"style": "photorealistic"}',
        style_preset="landscape",
        resolution="1024x1024",
        quality=MediaQuality.STANDARD,
        processing_time_ms=None,
        error_message=None,
        retry_count=0,
        priority=5,
        estimated_cost=Decimal("2.50"),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        completed_at=None
    )


# =====================================================
# Payment Fixtures
# =====================================================

@pytest.fixture
def mock_payment(mock_user: UserInDB) -> PaymentInDB:
    """Create a mock payment for testing."""
    from uuid import uuid4
    from datetime import datetime
    from decimal import Decimal
    from app.database.models import PaymentStatus
    
    return PaymentInDB(
        id=uuid4(),
        user_id=mock_user.id,
        stripe_payment_intent_id="pi_test_123",
        stripe_session_id="cs_test_123",
        stripe_customer_id="cus_test_123",
        amount=Decimal("29.99"),
        currency="USD",
        status=PaymentStatus.SUCCEEDED,
        payment_method_type="card",
        payment_method_brand="visa",
        payment_method_last4="4242",
        description="Premium subscription",
        invoice_url=None,
        receipt_url="https://stripe.com/receipt_123",
        failure_code=None,
        failure_message=None,
        refunded_amount=Decimal("0.00"),
        subscription_period_start=None,
        subscription_period_end=None,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        paid_at=datetime.utcnow()
    )


# =====================================================
# Utility Fixtures
# =====================================================

@pytest.fixture
def mock_stripe():
    """Mock Stripe module."""
    import stripe
    
    # Store original methods
    original_customer_create = stripe.Customer.create
    original_customer_search = stripe.Customer.search
    original_checkout_create = stripe.checkout.Session.create
    original_payment_intent_create = stripe.PaymentIntent.create
    
    # Mock methods
    stripe.Customer.create = MagicMock(return_value=MagicMock(id="cus_test_123"))
    stripe.Customer.search = MagicMock(return_value=MagicMock(data=[]))
    stripe.checkout.Session.create = MagicMock(
        return_value=MagicMock(id="cs_test_123", url="https://checkout.stripe.com/test")
    )
    stripe.PaymentIntent.create = MagicMock(
        return_value=MagicMock(id="pi_test_123", client_secret="pi_test_123_secret")
    )
    
    yield stripe
    
    # Restore original methods
    stripe.Customer.create = original_customer_create
    stripe.Customer.search = original_customer_search
    stripe.checkout.Session.create = original_checkout_create
    stripe.PaymentIntent.create = original_payment_intent_create 