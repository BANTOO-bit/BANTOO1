/**
 * EmptyState - Reusable empty state component
 * Shows when no data is available with optional action button
 * Supports dark mode and multiple sizes
 */
function EmptyState({
    icon = 'inbox',
    title = 'Belum ada data',
    message = 'Data akan muncul di sini.',
    actionLabel = null,
    onAction = null,
    size = 'md',
    illustration = null,
    className = ''
}) {
    const sizeClasses = {
        sm: {
            container: 'py-8 px-4',
            iconBg: 'w-16 h-16',
            iconSize: 'text-3xl',
            title: 'text-base',
            message: 'text-xs',
        },
        md: {
            container: 'py-12 px-6',
            iconBg: 'w-20 h-20',
            iconSize: 'text-4xl',
            title: 'text-lg',
            message: 'text-sm',
        },
        lg: {
            container: 'py-16 px-8',
            iconBg: 'w-24 h-24',
            iconSize: 'text-5xl',
            title: 'text-xl',
            message: 'text-base',
        },
    }

    const sizes = sizeClasses[size]

    return (
        <div className={`flex flex-col items-center justify-center text-center ${sizes.container} ${className}`}>
            {/* Illustration or Icon */}
            {illustration ? (
                <div className="mb-6">
                    {illustration}
                </div>
            ) : (
                <div className={`${sizes.iconBg} bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 transition-colors`}>
                    <span className={`material-symbols-rounded ${sizes.iconSize} text-gray-400 dark:text-gray-500`}>
                        {icon}
                    </span>
                </div>
            )}

            {/* Title */}
            <h3 className={`${sizes.title} font-semibold text-text-main dark:text-white mb-2`}>
                {title}
            </h3>

            {/* Message */}
            <p className={`${sizes.message} text-text-secondary dark:text-gray-400 max-w-sm mb-6 leading-relaxed`}>
                {message}
            </p>

            {/* Action Button */}
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold text-sm active:scale-95 transition-all flex items-center gap-2"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    )
}

export default EmptyState
