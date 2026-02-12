/**
 * Logger Utility
 * Centralized logging with environment-aware output
 * Prevents debug logs in production
 */

const isDevelopment = import.meta.env.DEV
const isProduction = import.meta.env.PROD

/**
 * Logger instance with environment-aware methods
 */
const logger = {
    /**
     * Log error messages
     * Always logs in development, can be sent to error tracking in production
     * @param {string} message - Error message
     * @param {Error|any} error - Error object or data
     * @param {string} context - Optional context (e.g., component name)
     */
    error: (message, error, context) => {
        if (isDevelopment) {
            console.error(`[Error${context ? ` - ${context}` : ''}]:`, message, error)
        }

        // In production, you could send to error tracking service
        // Example: Sentry.captureException(error, { tags: { context } })
    },

    /**
     * Log warning messages
     * Only logs in development
     * @param {string} message - Warning message
     * @param {any} data - Optional data
     */
    warn: (message, data) => {
        if (isDevelopment) {
            console.warn('[Warning]:', message, data)
        }
    },

    /**
     * Log debug messages
     * Only logs in development
     * @param {string} message - Debug message
     * @param {any} data - Optional data
     */
    debug: (message, data) => {
        if (isDevelopment) {
            console.log('[Debug]:', message, data)
        }
    },

    /**
     * Log info messages
     * Only logs in development
     * @param {string} message - Info message
     * @param {any} data - Optional data
     */
    info: (message, data) => {
        if (isDevelopment) {
            console.info('[Info]:', message, data)
        }
    },
}

export default logger
