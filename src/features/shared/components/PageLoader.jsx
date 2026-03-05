/**
 * PageLoader - Loading fallback component for lazy loaded routes
 * Shows a centered spinner with optional custom message
 * Supports dark mode
 */
function PageLoader({ message = 'Memuat...' }) {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center">
            <div className="relative">
                {/* Spinner */}
                <div className="w-16 h-16 border-4 border-primary/20 dark:border-primary/30 border-t-primary rounded-full animate-spin"></div>

                {/* Bantoo Logo/Icon in center (optional) */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 bg-primary/10 dark:bg-primary/20 rounded-full"></div>
                </div>
            </div>
            <p className="mt-6 text-text-secondary dark:text-gray-400 text-sm font-medium">{message}</p>
        </div>
    )
}

export default PageLoader
