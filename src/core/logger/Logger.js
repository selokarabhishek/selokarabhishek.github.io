/**
 * Production-Grade Logging System
 * Supports multiple log levels, remote logging, and structured logging
 */

import { LogLevel, LogLevelNames, getLogLevelFromString } from './LogLevels.js';
import { appConfig } from '../config/AppConfig.js';

export class Logger {
    constructor(context = 'App') {
        this.context = context;
        this.minLevel = getLogLevelFromString(appConfig.get('logging.level'));
        this.enableConsole = appConfig.get('logging.enableConsole');
        this.enableRemote = appConfig.get('logging.enableRemote');
        this.remoteEndpoint = appConfig.get('logging.remoteEndpoint');
        this.logBuffer = [];
        this.maxBufferSize = 100;
    }

    _shouldLog(level) {
        return level >= this.minLevel;
    }

    _formatMessage(level, message, data = {}) {
        return {
            timestamp: new Date().toISOString(),
            level: LogLevelNames[level],
            context: this.context,
            message,
            data,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
    }

    _logToConsole(level, formatted) {
        if (!this.enableConsole) return;

        const style = this._getConsoleStyle(level);
        const prefix = `[${formatted.timestamp}] [${formatted.level}] [${formatted.context}]`;

        switch (level) {
            case LogLevel.DEBUG:
                console.debug(`%c${prefix}`, style, formatted.message, formatted.data);
                break;
            case LogLevel.INFO:
                console.info(`%c${prefix}`, style, formatted.message, formatted.data);
                break;
            case LogLevel.WARN:
                console.warn(`%c${prefix}`, style, formatted.message, formatted.data);
                break;
            case LogLevel.ERROR:
            case LogLevel.FATAL:
                console.error(`%c${prefix}`, style, formatted.message, formatted.data);
                if (formatted.data.stack) {
                    console.error('Stack trace:', formatted.data.stack);
                }
                break;
        }
    }

    _getConsoleStyle(level) {
        const styles = {
            [LogLevel.DEBUG]: 'color: #6c757d',
            [LogLevel.INFO]: 'color: #0dcaf0',
            [LogLevel.WARN]: 'color: #ffc107; font-weight: bold',
            [LogLevel.ERROR]: 'color: #dc3545; font-weight: bold',
            [LogLevel.FATAL]: 'color: #fff; background: #dc3545; font-weight: bold; padding: 2px 4px'
        };
        return styles[level] || '';
    }

    async _logToRemote(formatted) {
        if (!this.enableRemote || !this.remoteEndpoint) return;

        // Buffer logs and send in batches
        this.logBuffer.push(formatted);

        if (this.logBuffer.length >= this.maxBufferSize) {
            await this._flushLogs();
        }
    }

    async _flushLogs() {
        if (this.logBuffer.length === 0) return;

        const logs = [...this.logBuffer];
        this.logBuffer = [];

        try {
            await fetch(this.remoteEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ logs })
            });
        } catch (error) {
            // Don't log this error to avoid infinite loop
            console.error('Failed to send logs to remote:', error);
        }
    }

    _log(level, message, data = {}) {
        if (!this._shouldLog(level)) return;

        const formatted = this._formatMessage(level, message, data);

        this._logToConsole(level, formatted);
        this._logToRemote(formatted);

        // Store fatal errors
        if (level === LogLevel.FATAL) {
            this._storeFatalError(formatted);
        }
    }

    _storeFatalError(formatted) {
        try {
            const fatalErrors = JSON.parse(localStorage.getItem('fatalErrors') || '[]');
            fatalErrors.push(formatted);
            // Keep only last 10
            if (fatalErrors.length > 10) {
                fatalErrors.shift();
            }
            localStorage.setItem('fatalErrors', JSON.stringify(fatalErrors));
        } catch (e) {
            // Ignore storage errors
        }
    }

    // Public logging methods
    debug(message, data) {
        this._log(LogLevel.DEBUG, message, data);
    }

    info(message, data) {
        this._log(LogLevel.INFO, message, data);
    }

    warn(message, data) {
        this._log(LogLevel.WARN, message, data);
    }

    error(message, error) {
        const data = error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack
        } : error;

        this._log(LogLevel.ERROR, message, data);
    }

    fatal(message, error) {
        const data = error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack
        } : error;

        this._log(LogLevel.FATAL, message, data);
    }

    // Performance logging
    time(label) {
        console.time(label);
    }

    timeEnd(label) {
        console.timeEnd(label);
    }

    // Create child logger with different context
    child(context) {
        return new Logger(`${this.context}:${context}`);
    }

    // Flush buffered logs (call before page unload)
    async flush() {
        await this._flushLogs();
    }
}

// Create default logger instance
export const logger = new Logger('App');

// Flush logs before page unload
window.addEventListener('beforeunload', () => {
    logger.flush();
});
