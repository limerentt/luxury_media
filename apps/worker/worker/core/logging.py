import logging
import sys
from typing import Any, Dict

import structlog

from worker.core.config import settings


def configure_logging() -> None:
    """Configure structured logging for the worker service."""
    
    # Configure structlog
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.dev.ConsoleRenderer() if settings.log_format == "console" else structlog.processors.JSONRenderer()
        ],
        wrapper_class=structlog.make_filtering_bound_logger(
            getattr(logging, settings.log_level.upper())
        ),
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )
    
    # Configure standard logging
    logging.basicConfig(
        level=getattr(logging, settings.log_level.upper()),
        format="%(message)s",
        stream=sys.stdout,
    )


# Helper functions for specific logging contexts
def log_worker_event(event: str, **kwargs) -> None:
    """Log worker-specific events."""
    logger = structlog.get_logger("worker.events")
    logger.info(event, **kwargs)


def log_message_processing(
    action: str,
    message_id: str = None,
    request_id: str = None,
    **kwargs
) -> None:
    """Log message processing events."""
    logger = structlog.get_logger("worker.messages")
    logger.info(
        action,
        message_id=message_id,
        request_id=request_id,
        **kwargs
    )


def log_media_generation(
    action: str,
    request_id: str = None,
    media_type: str = None,
    **kwargs
) -> None:
    """Log media generation events."""
    logger = structlog.get_logger("worker.media")
    logger.info(
        action,
        request_id=request_id,
        media_type=media_type,
        **kwargs
    )


def log_database_operation(
    operation: str,
    table: str = None,
    record_id: str = None,
    **kwargs
) -> None:
    """Log database operations."""
    logger = structlog.get_logger("worker.database")
    logger.info(
        operation,
        table=table,
        record_id=record_id,
        **kwargs
    )


def log_external_service_call(
    service: str,
    operation: str,
    **kwargs
) -> None:
    """Log external service calls."""
    logger = structlog.get_logger("worker.external")
    logger.info(
        f"{service}_{operation}",
        service=service,
        operation=operation,
        **kwargs
    )


def log_error(
    error: Exception,
    context: str = "general",
    **kwargs
) -> None:
    """Log errors with context."""
    logger = structlog.get_logger(f"worker.errors.{context}")
    logger.error(
        "Error occurred",
        error_type=type(error).__name__,
        error_message=str(error),
        **kwargs,
        exc_info=True
    ) 