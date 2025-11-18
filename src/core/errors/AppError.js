/**
 * Custom Application Error Classes
 * Provides structured error handling with error codes
 */

export class AppError extends Error {
    constructor(message, code = 'UNKNOWN_ERROR', details = {}) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.details = details;
        this.timestamp = new Date().toISOString();

        // Maintain proper stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            details: this.details,
            timestamp: this.timestamp,
            stack: this.stack
        };
    }
}

// Specific error types
export class NetworkError extends AppError {
    constructor(message, details = {}) {
        super(message, 'NETWORK_ERROR', details);
    }
}

export class APIError extends AppError {
    constructor(message, statusCode, details = {}) {
        super(message, 'API_ERROR', { ...details, statusCode });
        this.statusCode = statusCode;
    }
}

export class ValidationError extends AppError {
    constructor(message, field, details = {}) {
        super(message, 'VALIDATION_ERROR', { ...details, field });
        this.field = field;
    }
}

export class ConfigurationError extends AppError {
    constructor(message, details = {}) {
        super(message, 'CONFIGURATION_ERROR', details);
    }
}

export class RateLimitError extends AppError {
    constructor(message = 'Rate limit exceeded', retryAfter = 2000, details = {}) {
        super(message, 'RATE_LIMIT_ERROR', { ...details, retryAfter });
        this.retryAfter = retryAfter;
    }
}

export class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed', details = {}) {
        super(message, 'AUTHENTICATION_ERROR', details);
    }
}

export class NotFoundError extends AppError {
    constructor(resource, details = {}) {
        super(`Resource not found: ${resource}`, 'NOT_FOUND_ERROR', { ...details, resource });
        this.resource = resource;
    }
}

export class TimeoutError extends AppError {
    constructor(message = 'Operation timed out', timeout, details = {}) {
        super(message, 'TIMEOUT_ERROR', { ...details, timeout });
        this.timeout = timeout;
    }
}
