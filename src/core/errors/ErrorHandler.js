/**
 * Global Error Handler
 * Catches and handles all application errors
 */

import { logger } from '../logger/Logger.js';
import { AppError, NetworkError, APIError } from './AppError.js';
import { appConfig } from '../config/AppConfig.js';

export class ErrorHandler {
    constructor() {
        this.errorListeners = [];
        this.setupGlobalHandlers();
    }

    setupGlobalHandlers() {
        // Catch unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            event.preventDefault();
            this.handle(event.reason, 'Unhandled Promise Rejection');
        });

        // Catch uncaught errors
        window.addEventListener('error', (event) => {
            event.preventDefault();
            this.handle(event.error, 'Uncaught Error');
        });
    }

    handle(error, context = 'Unknown') {
        // Normalize error to AppError
        const appError = this.normalizeError(error);

        // Log the error
        if (appError.code === 'FATAL_ERROR' || appError instanceof TypeError) {
            logger.fatal(`${context}: ${appError.message}`, appError);
        } else {
            logger.error(`${context}: ${appError.message}`, appError);
        }

        // Notify listeners
        this.notifyListeners(appError, context);

        // Show user-friendly message
        this.showUserMessage(appError);

        // Report to remote service if enabled
        if (appConfig.get('features.errorReportingEnabled')) {
            this.reportToRemote(appError, context);
        }

        return appError;
    }

    normalizeError(error) {
        if (error instanceof AppError) {
            return error;
        }

        if (error instanceof TypeError) {
            return new AppError(error.message, 'TYPE_ERROR', {
                originalError: error.toString(),
                stack: error.stack
            });
        }

        if (error instanceof Error) {
            return new AppError(error.message, 'GENERIC_ERROR', {
                name: error.name,
                stack: error.stack
            });
        }

        if (typeof error === 'string') {
            return new AppError(error, 'STRING_ERROR');
        }

        return new AppError('An unknown error occurred', 'UNKNOWN_ERROR', {
            originalError: JSON.stringify(error)
        });
    }

    showUserMessage(error) {
        const messages = {
            'NETWORK_ERROR': 'Network connection issue. Please check your internet and try again.',
            'API_ERROR': 'Service temporarily unavailable. Please try again in a moment.',
            'VALIDATION_ERROR': error.message,
            'RATE_LIMIT_ERROR': 'Please wait a moment before trying again.',
            'AUTHENTICATION_ERROR': 'Authentication failed. Please refresh the page.',
            'NOT_FOUND_ERROR': 'The requested resource was not found.',
            'TIMEOUT_ERROR': 'Request timed out. Please try again.',
            'CONFIGURATION_ERROR': 'Configuration error. Please contact support.',
            'DEFAULT': 'An unexpected error occurred. Please try again.'
        };

        const userMessage = messages[error.code] || messages.DEFAULT;

        // Show toast notification
        this.showToast(userMessage, 'error');
    }

    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `app-toast app-toast--${type}`;
        toast.textContent = message;

        // Add styles dynamically
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                .app-toast {
                    position: fixed;
                    bottom: 2rem;
                    left: 50%;
                    transform: translateX(-50%);
                    padding: 1rem 1.5rem;
                    border-radius: 8px;
                    color: white;
                    font-family: 'Poppins', sans-serif;
                    font-size: 0.9rem;
                    z-index: 10000;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                    animation: slideUp 0.3s ease;
                    max-width: 90%;
                }

                .app-toast--error {
                    background: #dc3545;
                }

                .app-toast--warning {
                    background: #ffc107;
                    color: #000;
                }

                .app-toast--success {
                    background: #28a745;
                }

                .app-toast--info {
                    background: #17a2b8;
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translate(-50%, 20px);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, 0);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(toast);

        // Remove after duration
        setTimeout(() => {
            toast.style.animation = 'slideUp 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, appConfig.get('ui.toastDuration'));
    }

    async reportToRemote(error, context) {
        // Implement remote error reporting (e.g., Sentry, LogRocket)
        try {
            const report = {
                error: error.toJSON(),
                context,
                userAgent: navigator.userAgent,
                url: window.location.href,
                timestamp: new Date().toISOString()
            };

            // Example: Send to error reporting service
            // await fetch('/api/errors', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(report)
            // });

            console.info('Error reported:', report);
        } catch (e) {
            // Silently fail - don't throw errors from error handler
            console.error('Failed to report error:', e);
        }
    }

    addListener(callback) {
        this.errorListeners.push(callback);
    }

    removeListener(callback) {
        this.errorListeners = this.errorListeners.filter(cb => cb !== callback);
    }

    notifyListeners(error, context) {
        this.errorListeners.forEach(callback => {
            try {
                callback(error, context);
            } catch (e) {
                console.error('Error listener threw:', e);
            }
        });
    }

    // Utility: wrap async function with error handling
    async wrapAsync(fn, context = 'Async Operation') {
        try {
            return await fn();
        } catch (error) {
            throw this.handle(error, context);
        }
    }

    // Utility: wrap function with error handling
    wrap(fn, context = 'Operation') {
        try {
            return fn();
        } catch (error) {
            throw this.handle(error, context);
        }
    }
}

// Singleton instance
export const errorHandler = new ErrorHandler();
