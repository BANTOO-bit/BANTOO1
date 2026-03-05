import { useState, useEffect, useCallback } from 'react'

/**
 * FIX-U1: Offline Detection Hook
 * Detects network status changes and provides:
 * - isOnline: current network status
 * - wasOffline: true if the user was recently offline (for reconnection handling)
 */
export function useNetworkStatus() {
    const [isOnline, setIsOnline] = useState(navigator.onLine)
    const [wasOffline, setWasOffline] = useState(false)

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true)
            setWasOffline(true)
            // Reset wasOffline after 5 seconds
            setTimeout(() => setWasOffline(false), 5000)
        }

        const handleOffline = () => {
            setIsOnline(false)
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    return { isOnline, wasOffline }
}

export default useNetworkStatus
