/**
 * ButtonLoader - Inline spinner for button loading states
 * Small, compact spinner designed for use inside buttons
 */
function ButtonLoader({ size = 'sm', className = '' }) {
    const sizeClasses = {
        xs: 'w-3 h-3 border-2',
        sm: 'w-4 h-4 border-2',
        md: 'w-5 h-5 border-2',
        lg: 'w-6 h-6 border-3',
    }

    return (
        <div
            className={`${sizeClasses[size]} border-white/30 border-t-white rounded-full animate-spin ${className}`}
            role="status"
            aria-label="Loading"
        />
    )
}

export default ButtonLoader
