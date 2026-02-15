import { useNavigate } from 'react-router-dom'

/**
 * ErrorFallback - User-friendly error UI component
 * Used by ErrorBoundary to display when an error occurs
 */
function ErrorFallback({ error, resetError, errorInfo }) {
    const navigate = useNavigate()

    const handleGoHome = () => {
        resetError()
        navigate('/')
    }

    const handleReload = () => {
        window.location.reload()
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
            <div className="bg-white dark:bg-card-dark rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700 p-8 max-w-md w-full">
                {/* Error Icon */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-red-500 dark:text-red-400 text-4xl">error</span>
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-sm">close</span>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-text-main dark:text-white mb-2">
                        Oops! Terjadi Kesalahan
                    </h2>
                    <p className="text-sm text-text-secondary dark:text-gray-400 leading-relaxed">
                        Maaf, terjadi kesalahan yang tidak terduga. Jangan khawatir, data Anda aman. Silakan coba muat ulang halaman atau kembali ke beranda.
                    </p>
                </div>

                {/* Error Details (Development Only) */}
                {import.meta.env.DEV && error && (
                    <details className="mb-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <summary className="cursor-pointer font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-base">code</span>
                            Detail Error (Development Mode)
                        </summary>
                        <div className="mt-3 space-y-2">
                            <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-3 border border-red-200 dark:border-red-800">
                                <p className="text-xs font-mono text-red-700 dark:text-red-400 break-all">
                                    {error.toString()}
                                </p>
                            </div>
                            {errorInfo && errorInfo.componentStack && (
                                <div className="bg-gray-100 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                                    <pre className="text-[10px] font-mono text-gray-600 dark:text-gray-400 overflow-auto max-h-32">
                                        {errorInfo.componentStack}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </details>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={handleGoHome}
                        className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-800 text-text-main dark:text-white rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[20px]">home</span>
                        <span>Ke Beranda</span>
                    </button>
                    <button
                        onClick={handleReload}
                        className="flex-1 py-3 px-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[20px]">refresh</span>
                        <span>Muat Ulang</span>
                    </button>
                </div>

                {/* Help Text */}
                <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
                    Jika masalah terus berlanjut, silakan hubungi tim support kami
                </p>
            </div>
        </div>
    )
}

export default ErrorFallback
