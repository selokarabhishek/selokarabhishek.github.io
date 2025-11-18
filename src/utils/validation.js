/**
 * Input Validation Utilities
 * Centralized validation logic with detailed error messages
 */

import { ValidationError } from '../core/errors/AppError.js';
import { appConfig } from '../core/config/AppConfig.js';

export const Validators = {
    // String validation
    isNonEmptyString(value, fieldName = 'Field') {
        if (typeof value !== 'string' || value.trim().length === 0) {
            throw new ValidationError(`${fieldName} cannot be empty`, fieldName);
        }
        return true;
    },

    isValidLength(value, min, max, fieldName = 'Field') {
        if (value.length < min) {
            throw new ValidationError(
                `${fieldName} must be at least ${min} characters`,
                fieldName,
                { min, actual: value.length }
            );
        }
        if (value.length > max) {
            throw new ValidationError(
                `${fieldName} must be at most ${max} characters`,
                fieldName,
                { max, actual: value.length }
            );
        }
        return true;
    },

    // Email validation
    isValidEmail(email, fieldName = 'Email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new ValidationError(`${fieldName} is invalid`, fieldName);
        }
        return true;
    },

    // URL validation
    isValidURL(url, fieldName = 'URL') {
        try {
            new URL(url);
            return true;
        } catch {
            throw new ValidationError(`${fieldName} is invalid`, fieldName);
        }
    },

    // Number validation
    isValidNumber(value, min, max, fieldName = 'Number') {
        const num = Number(value);
        if (isNaN(num)) {
            throw new ValidationError(`${fieldName} must be a number`, fieldName);
        }
        if (min !== undefined && num < min) {
            throw new ValidationError(`${fieldName} must be at least ${min}`, fieldName);
        }
        if (max !== undefined && num > max) {
            throw new ValidationError(`${fieldName} must be at most ${max}`, fieldName);
        }
        return true;
    },

    // File validation
    isValidFile(file, fieldName = 'File') {
        if (!(file instanceof File)) {
            throw new ValidationError(`${fieldName} must be a file`, fieldName);
        }

        const maxSize = appConfig.get('ui.maxFileSize');
        if (file.size > maxSize) {
            const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
            throw new ValidationError(
                `${fieldName} size must be less than ${maxSizeMB}MB`,
                fieldName,
                { maxSize, actualSize: file.size }
            );
        }

        const supportedTypes = appConfig.get('ui.supportedImageTypes');
        if (!supportedTypes.includes(file.type)) {
            throw new ValidationError(
                `${fieldName} type not supported. Supported: ${supportedTypes.join(', ')}`,
                fieldName,
                { supportedTypes, actualType: file.type }
            );
        }

        return true;
    },

    // Message validation
    isValidMessage(message, fieldName = 'Message') {
        this.isNonEmptyString(message, fieldName);

        const maxLength = appConfig.get('chat.maxMessageLength');
        this.isValidLength(message, 1, maxLength, fieldName);

        // Check for suspicious content (basic XSS prevention)
        const suspiciousPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi // onclick, onerror, etc.
        ];

        for (const pattern of suspiciousPatterns) {
            if (pattern.test(message)) {
                throw new ValidationError(
                    `${fieldName} contains suspicious content`,
                    fieldName,
                    { reason: 'Potential XSS attempt' }
                );
            }
        }

        return true;
    },

    // Sanitize input
    sanitizeHTML(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    },

    // Sanitize message (allow some markdown-like syntax)
    sanitizeMessage(message) {
        // Remove script tags and suspicious attributes
        return message
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
            .replace(/javascript:/gi, '');
    }
};

// Convenience functions
export function validateMessage(message) {
    return Validators.isValidMessage(message);
}

export function validateFile(file) {
    return Validators.isValidFile(file);
}

export function validateEmail(email) {
    return Validators.isValidEmail(email);
}

export function sanitize(input) {
    return Validators.sanitizeMessage(input);
}
