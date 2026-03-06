import { Component } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * AdminErrorBoundary — Catches React rendering errors in the admin panel.
 * Displays a friendly error screen instead of a blank page.
 * Must be a class component because Error Boundaries require componentDidCatch.
 */
class AdminErrorBoundaryInner extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        if (import.meta.env.DEV) console.error('[AdminErrorBoundary] Caught error:', error, errorInfo)
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null })
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="max-w-md w-full text-center">
                        <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-red-500 text-4xl">error_outline</span>
                        </div>
                        <h2 className="text-xl font-bold text-[#111418] dark:text-white mb-2">
                            Terjadi Kesalahan
                        </h2>
                        <p className="text-sm text-[#617589] dark:text-[#94a3b8] mb-6 leading-relaxed">
                            Halaman ini mengalami error yang tidak terduga. Silakan coba muat ulang halaman atau kembali ke dashboard.
                        </p>

                        {/* Error detail (collapsed by default) */}
                        <details className="text-left mb-6 bg-[#f6f7f8] dark:bg-[#0f1923] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg overflow-hidden">
                            <summary className="px-4 py-3 text-xs font-medium text-[#617589] cursor-pointer hover:bg-[#f0f2f4] dark:hover:bg-[#1a2632] transition-colors">
                                Detail Error (untuk developer)
                            </summary>
                            <pre className="px-4 py-3 text-xs text-red-600 dark:text-red-400 overflow-auto max-h-40 border-t border-[#e5e7eb] dark:border-[#2a3b4d]">
                                {this.state.error?.message || 'Unknown error'}
                            </pre>
                        </details>

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={this.handleReset}
                                className="px-5 py-2.5 bg-[#f0f2f4] dark:bg-[#2a3b4d] text-[#111418] dark:text-white font-medium rounded-lg hover:bg-[#e5e7eb] dark:hover:bg-[#344658] transition-colors flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">refresh</span>
                                Coba Lagi
                            </button>
                            <button
                                onClick={() => this.props.onNavigateDashboard?.()}
                                className="px-5 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">dashboard</span>
                                Ke Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

/**
 * AdminErrorBoundary — Functional wrapper to allow useNavigate hook.
 */
export default function AdminErrorBoundary({ children }) {
    const navigate = useNavigate()

    return (
        <AdminErrorBoundaryInner onNavigateDashboard={() => navigate('/admin/dashboard')}>
            {children}
        </AdminErrorBoundaryInner>
    )
}
