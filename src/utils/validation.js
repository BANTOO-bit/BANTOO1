/**
 * Validation Utilities
 * Custom validation functions for form fields
 * Indonesian error messages
 */

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Check if value is not empty
 */
export const required = (message = 'Field ini wajib diisi') => {
    return (value) => {
        if (!value || (typeof value === 'string' && !value.trim())) {
            return message
        }
        return null
    }
}

/**
 * Validate email format
 */
export const email = (message = 'Email tidak valid') => {
    return (value) => {
        if (!value) return null
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
            return message
        }
        return null
    }
}

/**
 * Validate Indonesian phone number (08xx format)
 */
export const indonesianPhone = (message = 'Nomor HP tidak valid (contoh: 812xxx)') => {
    return (value) => {
        if (!value) return null
        // Allow 08... OR 8... (since PhoneInput strips 0)
        // Length 9-13 digits total
        const phoneRegex = /^(08|8)\d{7,12}$/
        if (!phoneRegex.test(value)) {
            return message
        }
        return null
    }
}

/**
 * Validate minimum length
 */
export const minLength = (min, message) => {
    return (value) => {
        if (!value) return null
        if (value.length < min) {
            return message || `Minimal ${min} karakter`
        }
        return null
    }
}

/**
 * Validate maximum length
 */
export const maxLength = (max, message) => {
    return (value) => {
        if (!value) return null
        if (value.length > max) {
            return message || `Maksimal ${max} karakter`
        }
        return null
    }
}

/**
 * Validate numeric value
 */
export const numeric = (message = 'Harus berupa angka') => {
    return (value) => {
        if (!value) return null
        if (isNaN(value)) {
            return message
        }
        return null
    }
}

/**
 * Validate minimum value
 */
export const min = (minValue, message) => {
    return (value) => {
        if (!value) return null
        if (Number(value) < minValue) {
            return message || `Nilai minimal ${minValue}`
        }
        return null
    }
}

/**
 * Validate maximum value
 */
export const max = (maxValue, message) => {
    return (value) => {
        if (!value) return null
        if (Number(value) > maxValue) {
            return message || `Nilai maksimal ${maxValue}`
        }
        return null
    }
}

/**
 * Validate URL format
 */
export const url = (message = 'URL tidak valid') => {
    return (value) => {
        if (!value) return null
        try {
            new URL(value)
            return null
        } catch {
            return message
        }
    }
}

/**
 * Validate custom regex pattern
 */
export const matches = (regex, message = 'Format tidak valid') => {
    return (value) => {
        if (!value) return null
        if (!regex.test(value)) {
            return message
        }
        return null
    }
}

/**
 * Validate value is one of allowed options
 */
export const oneOf = (options, message = 'Pilihan tidak valid') => {
    return (value) => {
        if (!value) return null
        if (!options.includes(value)) {
            return message
        }
        return null
    }
}

/**
 * Validate NIK (Indonesian ID number - 16 digits)
 */
export const nik = (message = 'NIK harus 16 digit') => {
    return (value) => {
        if (!value) return null
        const nikRegex = /^\d{16}$/
        if (!nikRegex.test(value)) {
            return message
        }
        return null
    }
}

/**
 * Validate NPWP (Indonesian tax number - 15 digits)
 */
export const npwp = (message = 'NPWP harus 15 digit') => {
    return (value) => {
        if (!value) return null
        const npwpRegex = /^\d{15}$/
        if (!npwpRegex.test(value)) {
            return message
        }
        return null
    }
}

/**
 * Validate password confirmation
 */
export const confirmPassword = (passwordField, message = 'Password tidak cocok') => {
    return (value, formValues) => {
        if (!value) return null
        if (value !== formValues[passwordField]) {
            return message
        }
        return null
    }
}

// ============================================
// VALIDATION SCHEMA RUNNER
// ============================================

/**
 * Validate a single field against its validators
 * @param {*} value - Field value
 * @param {Array} validators - Array of validator functions
 * @param {Object} formValues - All form values (for cross-field validation)
 * @returns {string|null} - Error message or null
 */
export const validateField = (value, validators = [], formValues = {}) => {
    for (const validator of validators) {
        const error = validator(value, formValues)
        if (error) {
            return error
        }
    }
    return null
}

/**
 * Validate entire form against validation schema
 * @param {Object} formData - Form data object
 * @param {Object} schema - Validation schema { fieldName: [validators] }
 * @returns {Object} - Errors object { fieldName: errorMessage }
 */
export const validateForm = (formData, schema) => {
    const errors = {}

    for (const [field, validators] of Object.entries(schema)) {
        const error = validateField(formData[field], validators, formData)
        if (error) {
            errors[field] = error
        }
    }

    return errors
}

/**
 * Check if form has any errors
 * @param {Object} errors - Errors object
 * @returns {boolean} - True if has errors
 */
export const hasErrors = (errors) => {
    return Object.keys(errors).length > 0
}

// ============================================
// COMMON VALIDATION SCHEMAS
// ============================================

/**
 * Login form validation schema
 */
export const loginSchema = {
    phone: [required('Nomor HP wajib diisi'), indonesianPhone()],
    password: [required('Password wajib diisi'), minLength(6)],
}

/**
 * Registration form validation schema
 */
export const registerSchema = {
    name: [required('Nama lengkap wajib diisi'), minLength(3, 'Nama minimal 3 karakter')],
    email: [required('Email wajib diisi'), email()],
    phone: [required('Nomor HP wajib diisi'), indonesianPhone()],
    password: [required('Password wajib diisi'), minLength(6, 'Password minimal 6 karakter')],
}

/**
 * Address form validation schema
 */
export const addressSchema = {
    label: [required('Label alamat wajib diisi')],
    address: [required('Alamat lengkap wajib diisi'), minLength(10, 'Alamat minimal 10 karakter')],
    notes: [],
}

/**
 * Profile form validation schema
 */
export const profileSchema = {
    name: [required('Nama wajib diisi'), minLength(3, 'Nama minimal 3 karakter')],
    email: [email()],
    phone: [required('Nomor HP wajib diisi'), indonesianPhone()],
}

/**
 * Menu item validation schema
 */
export const menuItemSchema = {
    name: [required('Nama menu wajib diisi'), minLength(3)],
    price: [required('Harga wajib diisi'), numeric(), min(0, 'Harga tidak boleh negatif')],
    description: [maxLength(200, 'Deskripsi maksimal 200 karakter')],
    category: [required('Kategori wajib dipilih')],
}

/**
 * Bank account validation schema
 */
export const bankAccountSchema = {
    bankName: [required('Nama bank wajib diisi')],
    accountNumber: [required('Nomor rekening wajib diisi'), numeric(), minLength(10, 'Nomor rekening minimal 10 digit')],
    accountName: [required('Nama pemilik rekening wajib diisi'), minLength(3)],
}
