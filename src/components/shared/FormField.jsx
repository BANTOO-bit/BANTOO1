import FormError from './FormError'

/**
 * FormField - Reusable form field component with validation
 * Supports text, email, password, number, textarea, select
 * Dark mode compatible
 */
function FormField({
    label,
    name,
    type = 'text',
    value,
    onChange,
    onBlur,
    error,
    placeholder,
    required = false,
    disabled = false,
    icon,
    options = [], // For select
    rows = 4, // For textarea
    className = '',
    inputClassName = '',
    ...props
}) {
    const hasError = !!error

    const baseInputClasses = `w-full rounded-2xl border bg-white dark:bg-gray-800 px-4 py-3.5 text-base text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm ${hasError ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'
        } ${icon ? 'pr-12' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`

    const handleChange = (e) => {
        if (onChange) {
            onChange(e.target.value, e)
        }
    }

    const handleBlur = (e) => {
        if (onBlur) {
            onBlur(e.target.value, e)
        }
    }

    const renderInput = () => {
        // Textarea
        if (type === 'textarea') {
            return (
                <textarea
                    name={name}
                    value={value}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    rows={rows}
                    className={`${baseInputClasses} ${inputClassName} resize-none`}
                    {...props}
                />
            )
        }

        // Select
        if (type === 'select') {
            return (
                <select
                    name={name}
                    value={value}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={disabled}
                    className={`${baseInputClasses} ${inputClassName}`}
                    {...props}
                >
                    <option value="">{placeholder || 'Pilih...'}</option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            )
        }

        // Regular input
        return (
            <input
                type={type}
                name={name}
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={placeholder}
                disabled={disabled}
                className={`${baseInputClasses} ${inputClassName}`}
                {...props}
            />
        )
    }

    return (
        <div className={className}>
            {/* Label */}
            {label && (
                <label
                    htmlFor={name}
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 pl-1 mb-2 block"
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            {/* Input Container */}
            <div className="relative">
                {renderInput()}

                {/* Icon */}
                {icon && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <span className="material-symbols-outlined text-[20px]">{icon}</span>
                    </div>
                )}
            </div>

            {/* Error Message */}
            <FormError message={error} />
        </div>
    )
}

export default FormField
