import logging
import logging.config
import sys
from typing import Any, Dict

import structlog
from structlog.stdlib import BoundLogger

from app.core.config import settings


def configure_logging() -> None:
    """Configure structured logging for the application."""
    
    # Configure standard library logging
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=getattr(logging, settings.log_level.upper()),
    )
    
    # Configure structlog
    processors = [
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
    ]
    
    # Add appropriate renderer based on configuration
    if settings.log_format == "json":
        processors.append(structlog.processors.JSONRenderer())
    else:
        processors.append(structlog.dev.ConsoleRenderer(colors=True))
    
    structlog.configure(
        processors=processors,
        wrapper_class=structlog.stdlib.BoundLogger,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )


def get_logger(name: str) -> BoundLogger:
    """Get a structured logger instance."""
    return structlog.get_logger(name)


class LoggingMiddleware:
    """Middleware for request/response logging."""
    
    def __init__(self, app):
        self.app = app
        self.logger = get_logger(__name__)
    
    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        
        # Generate request ID
        import uuid
        request_id = str(uuid.uuid4())
        
        # Start request logging
        start_time = None
        method = scope.get("method", "")
        path = scope.get("path", "")
        
        self.logger.info(
            "Request started",
            request_id=request_id,
            method=method,
            path=path,
            query_string=scope.get("query_string", b"").decode(),
            client=scope.get("client", ["unknown", 0])[0]
        )
        
        # Track request timing
        import time
        start_time = time.time()
        
        # Store request ID in scope for exception handlers
        if "state" not in scope:
            scope["state"] = {}
        scope["state"]["request_id"] = request_id
        
        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                status_code = message["status"]
                response_time = time.time() - start_time if start_time else 0
                
                # Log response
                log_level = "info"
                if status_code >= 400:
                    log_level = "warning" if status_code < 500 else "error"
                
                getattr(self.logger, log_level)(
                    "Request completed",
                    request_id=request_id,
                    method=method,
                    path=path,
                    status_code=status_code,
                    response_time_ms=round(response_time * 1000, 2)
                )
            
            await send(message)
        
        await self.app(scope, receive, send_wrapper)


def log_api_call(operation: str, **kwargs) -> None:
    """Log API operation with context."""
    logger = get_logger("api")
    logger.info(f"API operation: {operation}", **kwargs)


def log_database_operation(operation: str, table: str, **kwargs) -> None:
    """Log database operation with context."""
    logger = get_logger("database")
    logger.info(f"Database operation: {operation}", table=table, **kwargs)


def log_external_service_call(service: str, operation: str, **kwargs) -> None:
    """Log external service call with context."""
    logger = get_logger("external_service")
    logger.info(f"External service call: {service}.{operation}", **kwargs)


def log_business_event(event: str, **kwargs) -> None:
    """Log business event with context."""
    logger = get_logger("business")
    logger.info(f"Business event: {event}", **kwargs)


# Convenience function for request context logging
def log_request_context(request_id: str, user_id: str = None, **kwargs) -> Dict[str, Any]:
    """Create request context for logging."""
    context = {"request_id": request_id}
    if user_id:
        context["user_id"] = user_id
    context.update(kwargs)
    return context 