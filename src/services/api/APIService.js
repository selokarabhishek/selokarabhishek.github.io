/**
 * HTTP API Service
 * Centralized API communication with retry logic and error handling
 */

import { logger } from '../../core/logger/Logger.js';
import { errorHandler } from '../../core/errors/ErrorHandler.js';
import { APIError, NetworkError, TimeoutError } from '../../core/errors/AppError.js';
import { appConfig } from '../../core/config/AppConfig.js';

export class APIService {
    constructor() {
        this.config = appConfig.getApiConfig();
        this.logger = logger.child('APIService');
    }

    async request(endpoint, options = {}) {
        const {
            method = 'GET',
            headers = {},
            body = null,
            timeout = this.config.timeout,
            retries = this.config.retryAttempts
        } = options;

        const url = this._buildURL(endpoint);

        this.logger.debug(`API Request: ${method} ${url}`, { body });

        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const response = await this._fetchWithTimeout(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        ...headers
                    },
                    body: body ? JSON.stringify(body) : null
                }, timeout);

                return await this._handleResponse(response);

            } catch (error) {
                this.logger.warn(`API Request failed (attempt ${attempt + 1}/${retries + 1})`, {
                    error: error.message,
                    url
                });

                // Don't retry on client errors (4xx)
                if (error instanceof APIError && error.statusCode < 500) {
                    throw error;
                }

                // Retry on network errors and 5xx
                if (attempt < retries) {
                    await this._delay(this.config.retryDelay * (attempt + 1));
                    continue;
                }

                throw error;
            }
        }
    }

    async get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    async post(endpoint, data, options = {}) {
        return this.request(endpoint, { ...options, method: 'POST', body: data });
    }

    async put(endpoint, data, options = {}) {
        return this.request(endpoint, { ...options, method: 'PUT', body: data });
    }

    async delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }

    _buildURL(endpoint) {
        if (endpoint.startsWith('http')) {
            return endpoint;
        }

        const base = window.location.origin;
        return `${base}${endpoint}`;
    }

    async _fetchWithTimeout(url, options, timeout) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            return response;

        } catch (error) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                throw new TimeoutError('Request timed out', timeout);
            }

            if (!navigator.onLine) {
                throw new NetworkError('No internet connection');
            }

            throw new NetworkError(error.message, { originalError: error.toString() });
        }
    }

    async _handleResponse(response) {
        const contentType = response.headers.get('content-type');
        const isJSON = contentType && contentType.includes('application/json');

        let data;
        try {
            data = isJSON ? await response.json() : await response.text();
        } catch (error) {
            throw new APIError('Failed to parse response', response.status, {
                error: error.message
            });
        }

        if (!response.ok) {
            this.logger.error(`API Error: ${response.status}`, { data });

            throw new APIError(
                data.error || data.message || 'API request failed',
                response.status,
                { data }
            );
        }

        this.logger.debug(`API Response: ${response.status}`, { data });
        return data;
    }

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Stream response (for future streaming APIs)
    async *stream(endpoint, options = {}) {
        const response = await fetch(this._buildURL(endpoint), {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            }
        });

        if (!response.ok) {
            throw new APIError('Stream request failed', response.status);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                yield chunk;
            }
        } finally {
            reader.releaseLock();
        }
    }
}

// Singleton instance
export const apiService = new APIService();
