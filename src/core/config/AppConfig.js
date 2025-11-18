/**
 * Central Application Configuration
 * Single source of truth for all app settings
 */

import { Environment } from './Environment.js';

export class AppConfig {
    constructor() {
        this.env = Environment.current();
        this.config = this._loadConfig();
    }

    _loadConfig() {
        return {
            // API Configuration
            api: {
                endpoint: Environment.get('apiEndpoint'),
                timeout: Environment.get('apiTimeout'),
                retryAttempts: 3,
                retryDelay: 1000
            },

            // OpenAI Configuration
            openai: {
                model: 'gpt-4o-mini',
                maxTokens: 800,
                temperature: 0.7,
                systemPromptVersion: '1.0'
            },

            // Chat Configuration
            chat: {
                maxMessageLength: Environment.get('maxMessageLength'),
                rateLimitMs: Environment.get('rateLimitMs'),
                maxConversationHistory: 6,
                welcomeDelay: 3000,
                typingIndicatorDelay: 500
            },

            // Knowledge Base Configuration
            knowledgeBase: {
                path: 'ai-knowledge-base.json',
                cacheEnabled: true,
                cacheExpiryMs: 3600000, // 1 hour
                maxRelevantProjects: 2,
                maxRelevantBlogs: 2
            },

            // UI Configuration
            ui: {
                animationDuration: 300,
                toastDuration: 3000,
                maxFileSize: 5 * 1024 * 1024, // 5MB
                supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp']
            },

            // Feature Flags
            features: {
                chatEnabled: true,
                playgroundEnabled: true,
                analyticsEnabled: Environment.get('enableAnalytics'),
                errorReportingEnabled: Environment.get('enableErrorReporting'),
                voiceInputEnabled: false, // Future feature
                multiLanguageEnabled: false // Future feature
            },

            // Logging Configuration
            logging: {
                level: Environment.get('logLevel'),
                enableConsole: !Environment.isProduction(),
                enableRemote: Environment.isProduction(),
                remoteEndpoint: null // Configure if using remote logging
            },

            // Analytics Configuration
            analytics: {
                enabled: Environment.get('enableAnalytics'),
                provider: 'ga4', // Google Analytics 4
                measurementId: null, // Set via environment
                events: {
                    chatOpened: 'chat_opened',
                    messageSent: 'message_sent',
                    playgroundUsed: 'playground_used',
                    errorOccurred: 'error_occurred'
                }
            },

            // Security Configuration
            security: {
                enableCSRF: false, // Not needed for static site
                sanitizeInput: true,
                allowedOrigins: [window.location.origin],
                contentSecurityPolicy: {
                    'default-src': ["'self'"],
                    'script-src': ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
                    'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                    'font-src': ["'self'", "https://fonts.gstatic.com"],
                    'img-src': ["'self'", "data:", "https:"],
                    'connect-src': ["'self'", Environment.get('apiEndpoint')]
                }
            },

            // Performance Configuration
            performance: {
                enableLazyLoading: true,
                enableImageOptimization: true,
                enableCodeSplitting: false, // Enable if using bundler
                maxCacheAge: 86400000 // 24 hours
            }
        };
    }

    // Getter methods
    get(path) {
        return path.split('.').reduce((obj, key) => obj?.[key], this.config);
    }

    set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((obj, key) => {
            if (!obj[key]) obj[key] = {};
            return obj[key];
        }, this.config);
        target[lastKey] = value;
    }

    // Convenience methods
    isFeatureEnabled(featureName) {
        return this.get(`features.${featureName}`) === true;
    }

    getApiConfig() {
        return this.get('api');
    }

    getChatConfig() {
        return this.get('chat');
    }

    getKnowledgeBaseConfig() {
        return this.get('knowledgeBase');
    }

    // Export configuration for debugging
    export() {
        return {
            environment: this.env,
            config: JSON.parse(JSON.stringify(this.config))
        };
    }
}

// Singleton instance
export const appConfig = new AppConfig();
