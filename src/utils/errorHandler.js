/**
 * Centralized Error Handler
 * Provides consistent error handling across the application
 */

/**
 * Error message mapping for common errors
 */
const ERROR_MESSAGES = {
    // Network errors
    'Failed to fetch': 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
    'NetworkError': 'Koneksi internet bermasalah. Silakan coba lagi.',
    'Network request failed': 'Permintaan gagal. Periksa koneksi internet Anda.',

    // Auth errors
    'Invalid login credentials': 'Email atau password salah.',
    'Email not confirmed': 'Email belum diverifikasi. Periksa inbox Anda.',
    'User already registered': 'Email sudah terdaftar.',
    'Invalid email': 'Format email tidak valid.',
    'Password too short': 'Password minimal 6 karakter.',

    // Supabase errors
    'PGRST116': 'Data tidak ditemukan.',
    'PGRST301': 'Tidak ada data yang ditemukan.',
    '23505': 'Data sudah ada.',
    '23503': 'Data terkait tidak ditemukan.',

    // Permission errors
    'Permission denied': 'Anda tidak memiliki akses.',
    'Unauthorized': 'Sesi Anda telah berakhir. Silakan login kembali.',

    // Validation errors
    'Required field': 'Field ini wajib diisi.',
    'Invalid format': 'Format tidak valid.',

    // Order errors
    'Insufficient balance': 'Saldo tidak mencukupi.',
    'Order not found': 'Pesanan tidak ditemukan.',
    'Merchant closed': 'Warung sedang tutup.',
    'Out of stock': 'Stok habis.',

    // Default
    'default': 'Terjadi kesalahan. Silakan coba lagi.'
}

/**
 * Get user-friendly error message
 * @param {Error|string} error - Error object or message
 * @returns {string} User-friendly error message
 */
export function getErrorMessage(error) {
    if (!error) return ERROR_MESSAGES.default

    // If error is a string
    if (typeof error === 'string') {
        return ERROR_MESSAGES[error] || error
    }

    // If error is an object
    const errorMessage = error.message || error.error_description || error.msg || ''

    // Check for known error messages
    for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
        if (errorMessage.includes(key)) {
            return message
        }
    }

    // Check for error code
    if (error.code && ERROR_MESSAGES[error.code]) {
        return ERROR_MESSAGES[error.code]
    }

    // Return original message if it's user-friendly (not technical)
    if (errorMessage && !errorMessage.includes('Error:') && errorMessage.length < 100) {
        return errorMessage
    }

    return ERROR_MESSAGES.default
}

/**
 * Handle error with toast notification
 * @param {Error|string} error - Error object or message
 * @param {Object} toast - Toast context object
 * @param {Object} options - Additional options
 */
export function handleError(error, toast, options = {}) {
    const {
        context = '',
        fallbackMessage = null,
        duration = 4000,
        logToConsole = true
    } = options

    // Log to console in development
    if (logToConsole && import.meta.env.DEV) {
        console.error(`[Error${context ? ` - ${context}` : ''}]:`, error)
    }

    // Get user-friendly message
    const message = fallbackMessage || getErrorMessage(error)

    // Show toast notification
    if (toast && toast.error) {
        toast.error(message, duration)
    }

    // Return message for further handling if needed
    return message
}

/**
 * Handle success with toast notification
 * @param {string} message - Success message
 * @param {Object} toast - Toast context object
 * @param {number} duration - Toast duration
 */
export function handleSuccess(message, toast, duration = 3000) {
    if (toast && toast.success) {
        toast.success(message, duration)
    }
}

/**
 * Handle warning with toast notification
 * @param {string} message - Warning message
 * @param {Object} toast - Toast context object
 * @param {number} duration - Toast duration
 */
export function handleWarning(message, toast, duration = 3000) {
    if (toast && toast.warning) {
        toast.warning(message, duration)
    }
}

/**
 * Handle info with toast notification
 * @param {string} message - Info message
 * @param {Object} toast - Toast context object
 * @param {number} duration - Toast duration
 */
export function handleInfo(message, toast, duration = 3000) {
    if (toast && toast.info) {
        toast.info(message, duration)
    }
}

/**
 * Async error wrapper for try-catch blocks
 * @param {Function} fn - Async function to wrap
 * @param {Object} toast - Toast context object
 * @param {Object} options - Error handling options
 * @returns {Function} Wrapped function
 */
export function withErrorHandler(fn, toast, options = {}) {
    return async (...args) => {
        try {
            return await fn(...args)
        } catch (error) {
            handleError(error, toast, options)
            throw error // Re-throw for caller to handle if needed
        }
    }
}

export default {
    getErrorMessage,
    handleError,
    handleSuccess,
    handleWarning,
    handleInfo,
    withErrorHandler
}
