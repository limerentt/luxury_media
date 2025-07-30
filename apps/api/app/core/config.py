from typing import Optional
from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    # Application
    app_name: str = "Luxury Account API"
    app_version: str = "1.0.0"
    debug: bool = False
    api_prefix: str = "/api/v1"
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    
    # Database - ClickHouse
    clickhouse_host: str = Field(default="localhost")
    clickhouse_port: int = Field(default=8123)
    clickhouse_database: str = Field(default="luxury_account")
    clickhouse_user: str = Field(default="default")
    clickhouse_password: str = Field(default="")
    clickhouse_secure: bool = Field(default=False)
    clickhouse_pool_size: int = Field(default=10)
    
    # Authentication
    secret_key: str = Field(
        default="dev-secret-key-change-in-production",
        description="Secret key for JWT token generation"
    )
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Google OAuth
    google_client_id: Optional[str] = Field(default=None)
    google_client_secret: Optional[str] = Field(default=None)
    
    # Stripe
    stripe_secret_key: str = Field(
        default="sk_test_dev_key",
        description="Stripe secret key"
    )
    stripe_publishable_key: str = Field(
        default="pk_test_dev_key",
        description="Stripe publishable key"
    )
    stripe_webhook_secret: Optional[str] = Field(default=None)
    
    # Storage - MinIO
    minio_endpoint: str = Field(default="localhost:9000")
    minio_access_key: str = Field(default="minioadmin")
    minio_secret_key: str = Field(default="minioadmin")
    minio_secure: bool = Field(default=False)
    minio_bucket: str = Field(default="luxury-account-media")
    
    # Queue - RabbitMQ
    rabbitmq_url: str = Field(default="amqp://localhost:5672")
    
    # Logging
    log_level: str = Field(default="INFO")
    log_format: str = Field(default="json")
    
    # CORS
    allowed_origins: list[str] = Field(
        default=["http://localhost:3000", "http://localhost:3001"]
    )
    
    # Rate limiting
    rate_limit_requests: int = Field(default=100)
    rate_limit_window: int = Field(default=60)  # seconds
    
    @property
    def clickhouse_url(self) -> str:
        """Build ClickHouse connection URL."""
        protocol = "https" if self.clickhouse_secure else "http"
        auth = f"{self.clickhouse_user}:{self.clickhouse_password}@" if self.clickhouse_password else ""
        return f"{protocol}://{auth}{self.clickhouse_host}:{self.clickhouse_port}/{self.clickhouse_database}"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings() 