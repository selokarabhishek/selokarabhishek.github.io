/**
 * Rate Limiting Utilities
 * Debounce, throttle, and rate limiting functions
 */

import { RateLimitError } from '../core/errors/AppError.js';

export class RateLimiter {
    constructor(limitMs) {
        this.limitMs = limitMs;
        this.lastCallTime = null;
    }

    check() {
        const now = Date.now();

        if (this.lastCallTime && (now - this.lastCallTime) < this.limitMs) {
            const retryAfter = this.limitMs - (now - this.lastCallTime);
            throw new RateLimitError('Rate limit exceeded', retryAfter);
        }

        this.lastCallTime = now;
        return true;
    }

    reset() {
        this.lastCallTime = null;
    }

    getTimeUntilNext() {
        if (!this.lastCallTime) return 0;

        const now = Date.now();
        const timeSince = now - this.lastCallTime;
        return Math.max(0, this.limitMs - timeSince);
    }
}

export function debounce(func, wait) {
    let timeout;

    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function throttle(func, limit) {
    let inThrottle;

    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Async rate limiter with queue
export class AsyncRateLimiter {
    constructor(maxCalls, perMs) {
        this.maxCalls = maxCalls;
        this.perMs = perMs;
        this.calls = [];
        this.queue = [];
    }

    async execute(fn) {
        await this._waitForSlot();

        try {
            return await fn();
        } finally {
            this._cleanup();
        }
    }

    async _waitForSlot() {
        this._cleanup();

        if (this.calls.length < this.maxCalls) {
            this.calls.push(Date.now());
            return;
        }

        // Wait for oldest call to expire
        const oldestCall = this.calls[0];
        const waitTime = (oldestCall + this.perMs) - Date.now();

        if (waitTime > 0) {
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        this.calls.push(Date.now());
    }

    _cleanup() {
        const now = Date.now();
        this.calls = this.calls.filter(time => (now - time) < this.perMs);
    }
}
