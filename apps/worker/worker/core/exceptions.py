"""Custom exceptions for the worker service."""

from typing import Optional
from uuid import UUID


class WorkerException(Exception):
    """Base exception for worker service."""
    
    def __init__(self, message: str, details: Optional[dict] = None):
        super().__init__(message)
        self.message = message
        self.details = details or {}


class MessageProcessingError(WorkerException):
    """Exception raised when message processing fails."""
    
    def __init__(self, message: str, message_id: Optional[str] = None, details: Optional[dict] = None):
        super().__init__(message, details)
        self.message_id = message_id


class MediaGenerationError(WorkerException):
    """Exception raised when media generation fails."""
    
    def __init__(self, message: str, request_id: Optional[UUID] = None, details: Optional[dict] = None):
        super().__init__(message, details)
        self.request_id = request_id


class DatabaseError(WorkerException):
    """Exception raised when database operations fail."""
    
    def __init__(self, operation: str, error: str, details: Optional[dict] = None):
        message = f"Database operation '{operation}' failed: {error}"
        super().__init__(message, details)
        self.operation = operation
        self.error = error


class RabbitMQConnectionError(WorkerException):
    """Exception raised when RabbitMQ connection fails."""
    
    def __init__(self, message: str = "RabbitMQ connection failed", details: Optional[dict] = None):
        super().__init__(message, details)


class MaxRetriesExceededError(WorkerException):
    """Exception raised when maximum retries are exceeded."""
    
    def __init__(self, operation: str, max_retries: int, details: Optional[dict] = None):
        message = f"Maximum retries ({max_retries}) exceeded for operation: {operation}"
        super().__init__(message, details)
        self.operation = operation
        self.max_retries = max_retries


class StorageError(WorkerException):
    """Exception raised when storage operations fail."""
    
    def __init__(self, operation: str, error: str, details: Optional[dict] = None):
        message = f"Storage operation '{operation}' failed: {error}"
        super().__init__(message, details)
        self.operation = operation
        self.error = error


class ValidationError(WorkerException):
    """Exception raised when validation fails."""
    
    def __init__(self, field: str, value: str, message: str, details: Optional[dict] = None):
        full_message = f"Validation failed for '{field}' with value '{value}': {message}"
        super().__init__(full_message, details)
        self.field = field
        self.value = value


class TimeoutError(WorkerException):
    """Exception raised when operations timeout."""
    
    def __init__(self, operation: str, timeout: int, details: Optional[dict] = None):
        message = f"Operation '{operation}' timed out after {timeout} seconds"
        super().__init__(message, details)
        self.operation = operation
        self.timeout = timeout 