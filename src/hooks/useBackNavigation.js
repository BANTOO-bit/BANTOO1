import { useNavigate, useLocation } from 'react-router-dom'
import { useCallback } from 'react'

/**
 * Hook to handle smart back navigation
 * @param {Object} options
 * @param {string} options.fallbackRoute - Route to navigate to if history is empty (default: '/')
 * @returns {Function} goBack function
 */
export function useBackNavigation({ fallbackRoute = '/' } = {}) {
    const navigate = useNavigate()
    const location = useLocation()

    const goBack = useCallback(() => {
        // Check if there is a previous history entry we can go back to.
        // In React Router v6, location.key === 'default' usually means it's the first page in the stack (direct entry).
        // However, checking window.history.state is more reliable for detecting if we can go back.

        const hasHistory = window.history.state && window.history.state.idx > 0;

        if (hasHistory) {
            navigate(-1)
        } else {
            // If no history, replace current entry with fallback to avoid building up a stack of fallbacks
            navigate(fallbackRoute, { replace: true })
        }
    }, [navigate, fallbackRoute])

    return goBack
}
