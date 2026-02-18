import React from 'react'

/**
 * AppErrorBoundary - Top-level error boundary for the entire application
 * Catches any unhandled errors and displays a fallback UI
 */
class AppErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null, errorInfo: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        // Log error to console
        console.error("Application Error:", error, errorInfo)

        this.setState({ errorInfo })

        // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
        // if (import.meta.env.PROD) {
        //     errorTrackingService.logError(error, errorInfo)
        // }
    }

    handleReload = () => {
        window.location.reload()
    }

    handleGoHome = () => {
        // Admin stays in admin context — never redirect to customer app
        const isAdminRoute = window.location.pathname.startsWith('/admin')
        window.location.href = isAdminRoute ? '/admin/dashboard' : '/'
    }

    render() {
        if (this.state.hasError) {
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
                                    <span className="material-symbols-outlined text-white text-sm">priority_high</span>
                                </div>
                            </div>
                        </div>

                        {/* Error Message */}
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-text-main dark:text-white mb-2">
                                Aplikasi Mengalami Masalah
                            </h2>
                            <p className="text-sm text-text-secondary dark:text-gray-400 leading-relaxed">
                                Maaf, aplikasi mengalami kesalahan yang tidak terduga. Jangan khawatir, data Anda aman. Silakan muat ulang halaman atau kembali ke beranda.
                            </p>
                        </div>

                        {/* Error Details (Development Only) */}
                        {import.meta.env.DEV && this.state.error && (
                            <details className="mb-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                                <summary className="cursor-pointer font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base">bug_report</span>
                                    Detail Error (Development Mode)
                                </summary>
                                <div className="mt-3 space-y-2">
                                    <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-3 border border-red-200 dark:border-red-800">
                                        <p className="text-xs font-mono text-red-700 dark:text-red-400 break-all">
                                            {this.state.error.toString()}
                                        </p>
                                    </div>
                                    {this.state.errorInfo && this.state.errorInfo.componentStack && (
                                        <div className="bg-gray-100 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                                            <pre className="text-[10px] font-mono text-gray-600 dark:text-gray-400 overflow-auto max-h-32">
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </details>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={this.handleGoHome}
                                className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-800 text-text-main dark:text-white rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[20px]">home</span>
                                <span>Ke Beranda</span>
                            </button>
                            <button
                                onClick={this.handleReload}
                                className="flex-1 py-3 px-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[20px]">refresh</span>
                                <span>Muat Ulang</span>
                            </button>
                        </div>

                        {/* Help Text */}
                        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
                            Jika masalah terus berlanjut, silakan hubungi tim support
                        </p>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

export default AppErrorBoundary
