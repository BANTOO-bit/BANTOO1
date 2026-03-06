import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { useAuth } from './AuthContext'
import notificationService from '../services/notificationService'
import pushNotificationService from '../services/pushNotificationService'

const NotificationsContext = createContext()

// Hook for persistent notifications (NotificationsPage, Header badge)
export function useNotifications() {
    const context = useContext(NotificationsContext)
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationsProvider')
    }
    return context
}

// Hook for toast notifications (backward-compatible with old NotificationContext)
export function useNotification() {
    const context = useContext(NotificationsContext)
    if (!context) {
        throw new Error('useNotification must be used within a NotificationsProvider')
    }
    // Return only toast-related functions for backward compat
    return {
        notifications: context.toasts,
        addNotification: context.addToast,
        removeNotification: context.removeToast,
        clearAllNotifications: context.clearAllToasts
    }
}

export function NotificationsProvider({ children }) {
    const { user } = useAuth()
    const activeRole = user?.activeRole

    // ===== Persistent Notifications State =====
    const [allNotifications, setAllNotifications] = useState([])
    const [loading, setLoading] = useState(false)
    const [unreadCountDirect, setUnreadCountDirect] = useState(0)
    const unsubscribeRef = useRef(null)
    const pushUnsubscribeRef = useRef(null)
    const hasFetchedFull = useRef(false)

    // ===== Toast Notifications State (must be declared before useEffect that uses addToast) =====
    const [toasts, setToasts] = useState([])

    const playNotificationSound = () => {
        // In a real app, this would play an audio file
        // const audio = new Audio('/sounds/notification.mp3')
        // audio.play().catch(() => { /* Silent fail */ })
    }

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(n => n.id !== id))
    }, [])

    const addToast = useCallback((notification) => {
        const id = Date.now().toString()
        const newToast = {
            id,
            duration: 5000,
            ...notification,
            isRead: false,
            timestamp: new Date()
        }

        setToasts(prev => [newToast, ...prev])
        playNotificationSound()

        // Auto remove toast after duration (if not sticky)
        if (!newToast.sticky) {
            setTimeout(() => {
                removeToast(id)
            }, newToast.duration)
        }

        return id
    }, [removeToast])

    const clearAllToasts = useCallback(() => {
        setToasts([])
    }, [])

    // Request browser notification permission on mount
    useEffect(() => {
        if (user?.id) {
            pushNotificationService.requestPermission()
        }
    }, [user?.id])

    // ===== Lazy-load: only fetch unread count on mount (lightweight) =====
    // Full notification list is fetched on-demand via ensureLoaded()
    const ensureLoaded = useCallback(async () => {
        if (hasFetchedFull.current || !user?.id) return
        hasFetchedFull.current = true
        setLoading(true)
        try {
            const data = await notificationService.getNotifications(100)
            setAllNotifications((data || []).map(n => ({
                ...n,
                read: n.is_read,
                time: formatRelativeTime(n.created_at),
                icon: getIconForType(n.type),
                color: getColorForType(n.type),
                role: n.type === 'driver' ? 'driver' : n.type === 'merchant' ? 'merchant' : 'customer'
            })))
        } catch (err) {
            console.error('Failed to fetch notifications:', err)
        } finally {
            setLoading(false)
        }
    }, [user?.id])

    // On mount: only fetch unread count (1 lightweight query) + setup subscriptions
    useEffect(() => {
        if (!user?.id) {
            setAllNotifications([])
            setUnreadCountDirect(0)
            hasFetchedFull.current = false
            return
        }

        // Lightweight unread count fetch
        notificationService.getUnreadCount().then(count => {
            setUnreadCountDirect(count)
        }).catch(() => { /* silent */ })

        // Subscribe to real-time notifications
        const unsubscribe = notificationService.subscribeToNotifications(user.id, (newNotif) => {
            setAllNotifications(prev => [{
                ...newNotif,
                read: newNotif.is_read,
                time: 'Baru saja',
                icon: getIconForType(newNotif.type),
                color: getColorForType(newNotif.type),
                role: newNotif.type === 'driver' ? 'driver' : newNotif.type === 'merchant' ? 'merchant' : 'customer'
            }, ...prev])

            // Increment unread count for badge
            if (!newNotif.is_read) {
                setUnreadCountDirect(prev => prev + 1)
            }

            // Play notification sound
            playNotificationSound()

            // Show browser push notification (when tab not focused)
            pushNotificationService.showFromRecord(newNotif)
        })

        unsubscribeRef.current = unsubscribe

        // Subscribe to browser push notifications as backup
        pushUnsubscribeRef.current = pushNotificationService.subscribeToNotifications(user.id)

        // ▶ FCM Foreground: Show toast when FCM message arrives while app is active
        const unsubForeground = pushNotificationService.onForegroundMessage(({ title, body, data }) => {
            addToast({
                title: title || 'Bantoo!',
                message: body || '',
                type: data?.type || 'info',
                duration: 6000
            })
        })

        return () => {
            if (unsubscribeRef.current) unsubscribeRef.current()
            if (pushUnsubscribeRef.current) pushUnsubscribeRef.current()
            if (typeof unsubForeground === 'function') unsubForeground()
        }
    }, [user?.id, addToast])

    // Filter notifications based on active role
    const notifications = allNotifications.filter(n => {
        if (!n.role) return true
        return n.role === activeRole
    })

    const markAsRead = async (notificationId) => {
        setAllNotifications(prev =>
            prev.map(n => n.id === notificationId ? { ...n, read: true, is_read: true } : n)
        )
        setUnreadCountDirect(prev => Math.max(0, prev - 1))
        try {
            await notificationService.markAsRead(notificationId)
        } catch (err) {
            console.error('Failed to mark as read:', err)
        }
    }

    const markAllAsRead = async () => {
        setAllNotifications(prev => prev.map(n => {
            if (n.role === activeRole || !n.role) {
                return { ...n, read: true, is_read: true }
            }
            return n
        }))
        setUnreadCountDirect(0)
        try {
            await notificationService.markAllAsRead()
        } catch (err) {
            console.error('Failed to mark all as read:', err)
        }
    }

    const deleteNotification = async (notificationId) => {
        setAllNotifications(prev => prev.filter(n => n.id !== notificationId))
        try {
            await notificationService.deleteNotification(notificationId)
        } catch (err) {
            console.error('Failed to delete notification:', err)
        }
    }

    const clearAll = async () => {
        setAllNotifications(prev => prev.filter(n => n.role !== activeRole))
        try {
            await notificationService.clearAll()
        } catch (err) {
            console.error('Failed to clear all:', err)
        }
    }

    const addNotification = (notification) => {
        const newNotification = {
            ...notification,
            id: Date.now(),
            time: 'Baru saja',
            read: false,
            role: activeRole || 'customer'
        }
        setAllNotifications(prev => [newNotification, ...prev])
    }

    // Use direct count when full list hasn't been loaded; use computed count once loaded
    const computedUnreadCount = hasFetchedFull.current
        ? notifications.filter(n => !n.read).length
        : unreadCountDirect

    // ===== Combined Value =====
    const value = {
        // Persistent notifications
        notifications,
        unreadCount: computedUnreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        addNotification,
        ensureLoaded,
        // Toast notifications
        toasts,
        addToast,
        removeToast,
        clearAllToasts,
    }

    return (
        <NotificationsContext.Provider value={value}>
            {children}
        </NotificationsContext.Provider>
    )
}

// ===== Helper Functions =====

function formatRelativeTime(dateStr) {
    if (!dateStr) return ''
    const now = new Date()
    const date = new Date(dateStr)
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Baru saja'
    if (diffMins < 60) return `${diffMins} menit lalu`
    if (diffHours < 24) return `${diffHours} jam lalu`
    if (diffDays < 7) return `${diffDays} hari lalu`
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
}

function getIconForType(type) {
    const icons = {
        order: 'receipt_long',
        promo: 'local_offer',
        system: 'system_update',
        driver: 'two_wheeler',
        merchant: 'store',
        info: 'info',
        success: 'check_circle',
        warning: 'warning',
        alert: 'gpp_bad',
        security: 'security',
        cod_fee: 'payments',
        payment: 'account_balance_wallet'
    }
    return icons[type] || 'notifications'
}

function getColorForType(type) {
    const colors = {
        order: 'blue',
        promo: 'orange',
        system: 'gray',
        driver: 'blue',
        merchant: 'green',
        info: 'blue',
        success: 'green',
        warning: 'orange',
        alert: 'red',
        security: 'red',
        cod_fee: 'amber',
        payment: 'green'
    }
    return colors[type] || 'gray'
}

export default NotificationsContext
