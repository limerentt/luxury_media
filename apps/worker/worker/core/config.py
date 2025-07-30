from typing import Optional
from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Worker service settings with environment variable support."""
    
    # Application
    app_name: str = "Luxury Account Worker"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # Database - ClickHouse
    clickhouse_host: str = Field(default="localhost")
    clickhouse_port: int = Field(default=8123)
    clickhouse_database: str = Field(default="luxury_account")
    clickhouse_user: str = Field(default="default")
    clickhouse_password: str = Field(default="")
    clickhouse_secure: bool = Field(default=False)
    clickhouse_pool_size: int = Field(default=10)
    
    # RabbitMQ
    rabbitmq_url: str = Field(default="amqp://localhost:5672")
    rabbitmq_exchange: str = Field(default="media_processing")
    rabbitmq_queue: str = Field(default="media_requests")
    rabbitmq_routing_key: str = Field(default="media.generate")
    rabbitmq_prefetch_count: int = Field(default=10)
    rabbitmq_reconnect_delay: int = Field(default=5)  # seconds
    rabbitmq_max_retries: int = Field(default=3)
    
    # Media Generation
    media_processing_timeout: int = Field(default=300)  # 5 minutes
    media_max_retries: int = Field(default=3)
    media_retry_delay: int = Field(default=30)  # seconds
    
    # Storage - MinIO
    minio_endpoint: str = Field(default="localhost:9000")
    minio_access_key: str = Field(default="minioadmin")
    minio_secret_key: str = Field(default="minioadmin")
    minio_secure: bool = Field(default=False)
    minio_bucket: str = Field(default="luxury-account-media")
    
    # Logging
    log_level: str = Field(default="INFO")
    log_format: str = Field(default="json")
    
    # Worker Configuration
    worker_concurrency: int = Field(default=4)
    worker_heartbeat: int = Field(default=60)  # seconds
    worker_shutdown_timeout: int = Field(default=30)  # seconds
    
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