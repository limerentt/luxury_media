import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError

from app.api.routes import health, users, media_requests, payments
from app.core.config import settings
from app.core.exceptions import (
    luxury_account_exception_handler,
    http_exception_handler,
    validation_exception_handler,
    general_exception_handler,
    LuxuryAccountException
)
from app.core.logging import configure_logging, LoggingMiddleware, get_logger
from app.database.client import clickhouse_client

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown events."""
    
    # Startup
    logger.info("Starting Luxury Account API", version=settings.app_version)
    
    try:
        # Initialize database connection
        await clickhouse_client.connect()
        logger.info("Database connection established")
        
        # TODO: Run database migrations
        # await run_migrations()
        
        # TODO: Initialize other services (Redis, RabbitMQ, etc.)
        # await init_redis()
        # await init_rabbitmq()
        
        logger.info("Application startup completed")
        
    except Exception as e:
        logger.error("Failed to start application", error=str(e))
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down Luxury Account API")
    
    try:
        # Close database connection
        await clickhouse_client.disconnect()
        logger.info("Database connection closed")
        
        # TODO: Close other connections
        # await close_redis()
        # await close_rabbitmq()
        
        logger.info("Application shutdown completed")
        
    except Exception as e:
        logger.error("Error during shutdown", error=str(e))


def create_application() -> FastAPI:
    """Create and configure the FastAPI application."""
    
    # Configure logging first
    configure_logging()
    
    # Create FastAPI app
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="Production-ready platform for luxury account creation with AI-powered media generation",
        docs_url="/api/docs" if settings.debug else None,
        redoc_url="/api/redoc" if settings.debug else None,
        openapi_url="/api/openapi.json" if settings.debug else None,
        lifespan=lifespan
    )
    
    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )
    
    # Add logging middleware
    app.add_middleware(LoggingMiddleware)
    
    # Add exception handlers
    app.add_exception_handler(LuxuryAccountException, luxury_account_exception_handler)
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(ValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, general_exception_handler)
    
    # Include API routes
    app.include_router(health.router, prefix=settings.api_prefix)
    app.include_router(users.router, prefix=settings.api_prefix)
    app.include_router(media_requests.router, prefix=settings.api_prefix)
    app.include_router(payments.router, prefix=settings.api_prefix)
    
    # Add root endpoint
    @app.get("/")
    async def root():
        """Root endpoint."""
        return {
            "message": "Luxury Account API",
            "version": settings.app_version,
            "docs": "/api/docs" if settings.debug else "Documentation not available in production",
            "health": f"{settings.api_prefix}/health"
        }
    
    return app


# Create the application instance
app = create_application()


# Additional middleware and event handlers can be added here if needed
@app.middleware("http")
async def add_security_headers(request, call_next):
    """Add security headers to all responses."""
    response = await call_next(request)
    
    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    # Don't add HSTS in development
    if not settings.debug:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    
    return response


# Custom startup message
@app.on_event("startup")
async def startup_message():
    """Log startup message with configuration info."""
    logger.info(
        "Luxury Account API started",
        version=settings.app_version,
        debug=settings.debug,
        host=settings.host,
        port=settings.port,
        api_prefix=settings.api_prefix,
        clickhouse_host=settings.clickhouse_host,
        clickhouse_port=settings.clickhouse_port,
        clickhouse_database=settings.clickhouse_database
    )


if __name__ == "__main__":
    import uvicorn
    
    # Development server
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level=settings.log_level.lower(),
        access_log=True
    ) 