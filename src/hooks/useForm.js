import { useState } from 'react'
import { validateField, validateForm, hasErrors } from '../utils/validation'

/**
 * useForm - Custom hook for form state management and validation
 * 
 * @param {Object} config - Configuration object
 * @param {Object} config.initialValues - Initial form values
 * @param {Object} config.validationSchema - Validation schema { fieldName: [validators] }
 * @param {Function} config.onSubmit - Submit handler function
 * @param {boolean} config.validateOnChange - Validate on change (default: false)
 * @param {boolean} config.validateOnBlur - Validate on blur (default: true)
 * 
 * @returns {Object} - Form state and handlers
 */
function useForm({
    initialValues = {},
    validationSchema = {},
    onSubmit,
    validateOnChange = false,
    validateOnBlur = true,
}) {
    const [values, setValues] = useState(initialValues)
    const [errors, setErrors] = useState({})
    const [touched, setTouched] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    /**
     * Handle field value change
     */
    const handleChange = (name, value) => {
        // Update value
        setValues((prev) => ({
            ...prev,
            [name]: value,
        }))

        // Clear error for this field
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: null,
            }))
        }

        // Validate on change if enabled
        if (validateOnChange && validationSchema[name]) {
            const error = validateField(
                value,
                validationSchema[name],
                { ...values, [name]: value }
            )
            if (error) {
                setErrors((prev) => ({
                    ...prev,
                    [name]: error,
                }))
            }
        }
    }

    /**
     * Handle field blur
     */
    const handleBlur = (name) => {
        // Mark field as touched
        setTouched((prev) => ({
            ...prev,
            [name]: true,
        }))

        // Validate on blur if enabled
        if (validateOnBlur && validationSchema[name]) {
            const error = validateField(
                values[name],
                validationSchema[name],
                values
            )
            if (error) {
                setErrors((prev) => ({
                    ...prev,
                    [name]: error,
                }))
            }
        }
    }

    /**
     * Handle form submission
     */
    const handleSubmit = async (e) => {
        if (e) {
            e.preventDefault()
        }

        // Validate all fields
        const formErrors = validateForm(values, validationSchema)

        if (hasErrors(formErrors)) {
            setErrors(formErrors)
            // Mark all fields as touched
            const allTouched = Object.keys(validationSchema).reduce((acc, key) => {
                acc[key] = true
                return acc
            }, {})
            setTouched(allTouched)
            return
        }

        // Clear errors
        setErrors({})

        // Call onSubmit handler
        if (onSubmit) {
            setIsSubmitting(true)
            try {
                await onSubmit(values)
            } catch (error) {
                console.error('Form submission error:', error)
            } finally {
                setIsSubmitting(false)
            }
        }
    }

    /**
     * Reset form to initial values
     */
    const reset = () => {
        setValues(initialValues)
        setErrors({})
        setTouched({})
        setIsSubmitting(false)
    }

    /**
     * Set form values programmatically
     */
    const setFormValues = (newValues) => {
        setValues((prev) => ({
            ...prev,
            ...newValues,
        }))
    }

    /**
     * Set form errors programmatically
     */
    const setFormErrors = (newErrors) => {
        setErrors((prev) => ({
            ...prev,
            ...newErrors,
        }))
    }

    /**
     * Get field props for easy spreading
     */
    const getFieldProps = (name) => ({
        name,
        value: values[name] || '',
        onChange: (value) => handleChange(name, value),
        onBlur: () => handleBlur(name),
        error: touched[name] ? errors[name] : null,
    })

    return {
        values,
        errors,
        touched,
        isSubmitting,
        handleChange,
        handleBlur,
        handleSubmit,
        reset,
        setFormValues,
        setFormErrors,
        getFieldProps,
    }
}

export default useForm
