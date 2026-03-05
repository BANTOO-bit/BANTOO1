import { useEffect, useRef } from 'react'
import { pushNotificationService } from '../services/pushNotificationService'

/**
 * usePushNotification — Manages push notification subscriptions.
 * Extracted from AuthContext to follow Single Responsibility Principle.
 * 
 * Auto-subscribes on login when permission is already granted or default.
 * Provides cleanup function for logout.
 * 
 * Usage:
 *   const { cleanupPush } = usePushNotification(user)
 *   // Call cleanupPush() during logout
 */
export function usePushNotification(user) {
    const pushCleanupRef = useRef(null)

    useEffect(() => {
        if (!user?.id) return

        // Only subscribe if not already subscribed
        if (!pushCleanupRef.current) {
            const permissionStatus = pushNotificationService.getPermission()
            if (permissionStatus === 'granted') {
                pushCleanupRef.current = pushNotificationService.subscribeToNotifications(user.id)
                pushNotificationService.registerFCM(user.id, user.activeRole)
            } else if (permissionStatus === 'default') {
                pushCleanupRef.current = pushNotificationService.subscribeToNotifications(user.id)
            }
        }

        return () => {
            // Cleanup on unmount (but NOT on user change — that's handled by cleanupPush)
        }
    }, [user?.id, user?.activeRole])

    const cleanupPush = () => {
        if (pushCleanupRef.current) {
            pushCleanupRef.current()
            pushCleanupRef.current = null
        }
        if (user?.id) {
            pushNotificationService.unregisterFCM(user.id)
        }
    }

    return { cleanupPush }
}

export default usePushNotification
