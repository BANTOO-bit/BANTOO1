/**
 * LoadingState - Reusable loading state component
 * Shows a centered spinner with optional message and icon
 * Supports dark mode and multiple sizes
 */
function LoadingState({
    message = 'Memuat...',
    fullPage = true,
    icon = null,
    size = 'md',
    className = ''
}) {
    const sizeClasses = {
        sm: 'w-8 h-8 border-2',
        md: 'w-10 h-10 border-3',
        lg: 'w-12 h-12 border-4',
    }

    const content = (
        <>
            {/* Icon (optional) */}
            {icon && (
                <div className="mb-4 text-primary dark:text-primary-light">
                    {icon}
                </div>
            )}

            {/* Spinner */}
            <div
                className={`${sizeClasses[size]} border-primary/20 dark:border-primary/30 border-t-primary rounded-full animate-spin mb-4`}
                role="status"
                aria-label="Loading"
            />

            {/* Message */}
            {message && (
                <p className="text-sm text-text-secondary dark:text-gray-400 font-medium">
                    {message}
                </p>
            )}
        </>
    )

    if (!fullPage) {
        return (
            <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
                {content}
            </div>
        )
    }

    return (
        <div className={`min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center ${className}`}>
            {content}
        </div>
    )
}

export default LoadingState
