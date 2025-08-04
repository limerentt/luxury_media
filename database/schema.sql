-- ClickHouse Schema for Luxury Account Platform
-- Created: 2024
-- Engine: MergeTree with monthly partitioning
-- Optimization: Time-series analytics

-- =====================================================
-- Users Table - User accounts and profiles
-- =====================================================

CREATE TABLE users (
    id UUID DEFAULT generateUUIDv4(),
    email String,
    name String,
    google_id Nullable(String),
    avatar_url Nullable(String),
    subscription_status Enum8(
        'free' = 1,
        'premium' = 2,
        'enterprise' = 3,
        'suspended' = 4
    ) DEFAULT 'free',
    subscription_expires_at Nullable(DateTime),
    total_media_requests UInt32 DEFAULT 0,
    total_payments_amount Decimal64(2) DEFAULT 0,
    last_login_at Nullable(DateTime),
    created_at DateTime DEFAULT now(),
    updated_at DateTime DEFAULT now()
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(created_at)
ORDER BY (id, created_at)
SETTINGS index_granularity = 8192;

-- =====================================================
-- Media Requests Table - AI generation requests
-- =====================================================

CREATE TABLE media_requests (
    id UUID DEFAULT generateUUIDv4(),
    user_id UUID,
    request_type Enum8(
        'image' = 1,
        'video' = 2,
        'audio' = 3,
        'avatar' = 4,
        'banner' = 5
    ),
    prompt String,
    status Enum8(
        'pending' = 1,
        'processing' = 2,
        'completed' = 3,
        'failed' = 4,
        'cancelled' = 5
    ) DEFAULT 'pending',
    parameters String DEFAULT '{}', -- JSON string for AI parameters
    style_preset Nullable(String),
    resolution Nullable(String),
    quality Enum8(
        'draft' = 1,
        'standard' = 2,
        'premium' = 3,
        'ultra' = 4
    ) DEFAULT 'standard',
    processing_time_ms Nullable(UInt32),
    error_message Nullable(String),
    retry_count UInt8 DEFAULT 0,
    priority UInt8 DEFAULT 5, -- 1-10 scale, 10 = highest
    estimated_cost Decimal64(2) DEFAULT 0,
    created_at DateTime DEFAULT now(),
    updated_at DateTime DEFAULT now(),
    completed_at Nullable(DateTime)
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(created_at)
ORDER BY (id, created_at)
SETTINGS index_granularity = 8192;

-- =====================================================
-- Media Assets Table - Generated media files
-- =====================================================

CREATE TABLE media_assets (
    id UUID DEFAULT generateUUIDv4(),
    media_request_id UUID,
    user_id UUID,
    file_path String,
    file_name String,
    file_size UInt64, -- bytes
    mime_type String,
    resolution Nullable(String), -- e.g., "1920x1080"
    duration Nullable(Float32), -- seconds for video/audio
    thumbnail_path Nullable(String),
    cdn_url Nullable(String),
    status Enum8(
        'processing' = 1,
        'ready' = 2,
        'archived' = 3,
        'deleted' = 4,
        'corrupted' = 5
    ) DEFAULT 'processing',
    download_count UInt32 DEFAULT 0,
    last_accessed_at Nullable(DateTime),
    expires_at Nullable(DateTime),
    metadata String DEFAULT '{}', -- JSON string for additional metadata
    created_at DateTime DEFAULT now(),
    updated_at DateTime DEFAULT now()
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(created_at)
ORDER BY (id, created_at)
SETTINGS index_granularity = 8192;

-- =====================================================
-- Payments Table - Stripe payment records
-- =====================================================

CREATE TABLE payments (
    id UUID DEFAULT generateUUIDv4(),
    user_id UUID,
    stripe_payment_intent_id String,
    stripe_session_id Nullable(String),
    stripe_customer_id Nullable(String),
    amount Decimal64(2), -- supports up to 999,999.99 in any currency
    currency FixedString(3), -- ISO 4217 currency codes (USD, EUR, etc.)
    status Enum8(
        'pending' = 1,
        'processing' = 2,
        'succeeded' = 3,
        'failed' = 4,
        'cancelled' = 5,
        'refunded' = 6
    ) DEFAULT 'pending',
    payment_method_type Nullable(String), -- card, bank_transfer, etc.
    payment_method_brand Nullable(String), -- visa, mastercard, etc.
    payment_method_last4 Nullable(String),
    description Nullable(String),
    invoice_url Nullable(String),
    receipt_url Nullable(String),
    failure_code Nullable(String),
    failure_message Nullable(String),
    refunded_amount Decimal64(2) DEFAULT 0,
    subscription_period_start Nullable(DateTime),
    subscription_period_end Nullable(DateTime),
    created_at DateTime DEFAULT now(),
    updated_at DateTime DEFAULT now(),
    paid_at Nullable(DateTime)
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(created_at)
ORDER BY (id, created_at)
SETTINGS index_granularity = 8192;

-- =====================================================
-- Indexes for Performance Optimization
-- =====================================================

-- Users table indexes
ALTER TABLE users ADD INDEX idx_users_email (email) TYPE bloom_filter GRANULARITY 1;
ALTER TABLE users ADD INDEX idx_users_google_id (google_id) TYPE bloom_filter GRANULARITY 1;
ALTER TABLE users ADD INDEX idx_users_subscription (subscription_status) TYPE set(0) GRANULARITY 1;

-- Media requests table indexes
ALTER TABLE media_requests ADD INDEX idx_media_requests_user_id (user_id) TYPE bloom_filter GRANULARITY 1;
ALTER TABLE media_requests ADD INDEX idx_media_requests_status (status) TYPE set(0) GRANULARITY 1;
ALTER TABLE media_requests ADD INDEX idx_media_requests_type (request_type) TYPE set(0) GRANULARITY 1;

-- Media assets table indexes
ALTER TABLE media_assets ADD INDEX idx_media_assets_user_id (user_id) TYPE bloom_filter GRANULARITY 1;
ALTER TABLE media_assets ADD INDEX idx_media_assets_request_id (media_request_id) TYPE bloom_filter GRANULARITY 1;
ALTER TABLE media_assets ADD INDEX idx_media_assets_status (status) TYPE set(0) GRANULARITY 1;

-- Payments table indexes
ALTER TABLE payments ADD INDEX idx_payments_user_id (user_id) TYPE bloom_filter GRANULARITY 1;
ALTER TABLE payments ADD INDEX idx_payments_stripe_id (stripe_payment_intent_id) TYPE bloom_filter GRANULARITY 1;
ALTER TABLE payments ADD INDEX idx_payments_status (status) TYPE set(0) GRANULARITY 1;
ALTER TABLE payments ADD INDEX idx_payments_currency (currency) TYPE set(0) GRANULARITY 1;

-- =====================================================
-- Materialized Views for Analytics
-- =====================================================

-- Daily user registration stats
CREATE MATERIALIZED VIEW mv_daily_user_stats
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (date, subscription_status)
AS SELECT
    toDate(created_at) as date,
    subscription_status,
    count() as registrations,
    uniq(id) as unique_users
FROM users
GROUP BY date, subscription_status;

-- Daily media generation stats
CREATE MATERIALIZED VIEW mv_daily_media_stats
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (date, request_type, status)
AS SELECT
    toDate(created_at) as date,
    request_type,
    status,
    count() as requests,
    avg(processing_time_ms) as avg_processing_time,
    sum(estimated_cost) as total_cost
FROM media_requests
GROUP BY date, request_type, status;

-- Daily revenue stats
CREATE MATERIALIZED VIEW mv_daily_revenue_stats
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (date, currency, status)
AS SELECT
    toDate(created_at) as date,
    currency,
    status,
    count() as payment_count,
    sum(amount) as total_amount,
    avg(amount) as avg_amount
FROM payments
GROUP BY date, currency, status;

-- =====================================================
-- Comments and Documentation
-- =====================================================

-- This schema is optimized for:
-- 1. Time-series analytics with monthly partitioning
-- 2. High-performance inserts and queries
-- 3. Luxury account platform requirements
-- 4. Stripe payment integration
-- 5. AI media generation workflows
--
-- Key features:
-- - UUID primary keys for distributed systems
-- - Proper data types for financial data (Decimal64)
-- - Enum types for controlled vocabularies
-- - Nullable fields for optional data
-- - Materialized views for real-time analytics
-- - Optimized indexes for common query patterns
--
-- Maintenance:
-- - Partitions can be automatically managed by ClickHouse
-- - Old partitions can be dropped for data retention
-- - Materialized views provide aggregated analytics data 