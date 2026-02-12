/**
 * InlineLoader - Small inline spinner for sections and inline loading
 * Minimal design with multiple sizes
 * Supports dark mode
 */
function InlineLoader({ size = 'md', className = '', color = 'primary' }) {
    const sizeClasses = {
        xs: 'w-3 h-3 border',
        sm: 'w-4 h-4 border-2',
        md: 'w-5 h-5 border-2',
        lg: 'w-6 h-6 border-2',
        xl: 'w-8 h-8 border-3',
    }

    const colorClasses = {
        primary: 'border-primary/20 dark:border-primary/30 border-t-primary',
        white: 'border-white/30 border-t-white',
        gray: 'border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300',
    }

    return (
        <div
            className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin ${className}`}
            role="status"
            aria-label="Loading"
        />
    )
}

export default InlineLoader
