import React from 'react'
import ErrorFallback from './ErrorFallback'

/**
 * ErrorBoundary - Catches JavaScript errors in child components
 * Displays ErrorFallback UI when an error occurs
 * Supports custom fallback UI via props
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        }
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        // Log error details
        this.setState({
            error: error,
            errorInfo: errorInfo
        })

        // Log to console in development
        if (import.meta.env.DEV) {
            console.error("ErrorBoundary caught an error:", error, errorInfo)
        }

        // Call optional error callback
        if (this.props.onError) {
            this.props.onError(error, errorInfo)
        }
    }

    resetError = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        })
    }

    render() {
        if (this.state.hasError) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback({
                    error: this.state.error,
                    errorInfo: this.state.errorInfo,
                    resetError: this.resetError
                })
            }

            // Use default ErrorFallback component
            return (
                <ErrorFallback
                    error={this.state.error}
                    errorInfo={this.state.errorInfo}
                    resetError={this.resetError}
                />
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
