/**
 * Environment Detection and Management
 * Provides environment-specific configuration
 */

export const Environment = {
    // Detect current environment
    current() {
        const hostname = window.location.hostname;

        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'development';
        }

        if (hostname.includes('netlify') && !hostname.includes('.netlify.app')) {
            return 'staging';
        }

        return 'production';
    },

    isDevelopment() {
        return this.current() === 'development';
    },

    isStaging() {
        return this.current() === 'staging';
    },

    isProduction() {
        return this.current() === 'production';
    },

    // Get environment-specific values
    get(key, fallback = null) {
        const env = this.current();
        const envVars = {
            development: {
                apiEndpoint: '/api/chat',
                logLevel: 'debug',
                enableAnalytics: false,
                enableErrorReporting: false,
                apiTimeout: 30000,
                rateLimitMs: 1000, // Relaxed for dev
                maxMessageLength: 1000 // Longer for testing
            },
            staging: {
                apiEndpoint: '/api/chat',
                logLevel: 'info',
                enableAnalytics: true,
                enableErrorReporting: true,
                apiTimeout: 20000,
                rateLimitMs: 2000,
                maxMessageLength: 500
            },
            production: {
                apiEndpoint: '/api/chat',
                logLevel: 'warn',
                enableAnalytics: true,
                enableErrorReporting: true,
                apiTimeout: 15000,
                rateLimitMs: 2000,
                maxMessageLength: 500
            }
        };

        return envVars[env]?.[key] ?? fallback;
    }
};
