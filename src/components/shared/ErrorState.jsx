function ErrorState({
    message = 'Terjadi kesalahan',
    detail = 'Silakan coba lagi nanti.',
    onRetry = null,
    retryLabel = 'Coba Lagi',
    fullPage = true,
    icon = 'error_outline',
    className = ''
}) {
    const content = (
        <div className={`flex flex-col items-center justify-center text-center px-6 ${fullPage ? '' : 'py-12'} ${className}`}>
            <span className="material-symbols-rounded text-5xl text-red-400 mb-4">{icon}</span>
            <h3 className="text-lg font-semibold text-text-primary mb-1">{message}</h3>
            <p className="text-sm text-text-secondary mb-6 max-w-xs">{detail}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="px-6 py-2.5 bg-primary text-white rounded-full font-medium text-sm hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-2"
                >
                    <span className="material-symbols-rounded text-lg">refresh</span>
                    {retryLabel}
                </button>
            )}
        </div>
    )

    if (fullPage) {
        return (
            <div className="min-h-screen bg-background-light flex items-center justify-center">
                {content}
            </div>
        )
    }

    return content
}

export default ErrorState
