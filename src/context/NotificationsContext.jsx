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
    const { user, activeRole } = useAuth()

    // ===== Persistent Notifications State =====
    const [allNotifications, setAllNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const unsubscribeRef = useRef(null)
    const pushUnsubscribeRef = useRef(null)

    // Request browser notification permission on mount
    useEffect(() => {
        if (user?.id) {
            pushNotificationService.requestPermission()
        }
    }, [user?.id])

    // Fetch notifications from Supabase on mount / user change
    useEffect(() => {
        if (!user?.id) {
            setAllNotifications([])
            setLoading(false)
            return
        }

        let cancelled = false

        async function fetchNotifications() {
            try {
                const data = await notificationService.getNotifications(100)
                if (!cancelled) {
                    setAllNotifications((data || []).map(n => ({
                        ...n,
                        read: n.is_read,
                        time: formatRelativeTime(n.created_at),
                        icon: getIconForType(n.type),
                        color: getColorForType(n.type),
                        role: n.type === 'driver' ? 'driver' : n.type === 'merchant' ? 'merchant' : 'customer'
                    })))
                }
            } catch (err) {
                console.error('Failed to fetch notifications:', err)
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        fetchNotifications()

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

            // Play notification sound
            playNotificationSound()

            // Show browser push notification (when tab not focused)
            pushNotificationService.showFromRecord(newNotif)
        })

        unsubscribeRef.current = unsubscribe

        // Subscribe to browser push notifications as backup
        pushUnsubscribeRef.current = pushNotificationService.subscribeToNotifications(user.id)

        return () => {
            cancelled = true
            if (unsubscribeRef.current) unsubscribeRef.current()
            if (pushUnsubscribeRef.current) pushUnsubscribeRef.current()
        }
    }, [user?.id])

    // Filter notifications based on active role
    const notifications = allNotifications.filter(n => {
        if (!n.role) return true
        return n.role === activeRole
    })

    const markAsRead = async (notificationId) => {
        setAllNotifications(prev =>
            prev.map(n => n.id === notificationId ? { ...n, read: true, is_read: true } : n)
        )
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

    const unreadCount = notifications.filter(n => !n.read).length

    // ===== Toast Notifications State =====
    const [toasts, setToasts] = useState([])

    const playNotificationSound = () => {
        // In a real app, this would play an audio file
        // const audio = new Audio('/sounds/notification.mp3')
        // audio.play().catch(() => { /* Silent fail */ })
    }

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
    }, [])

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(n => n.id !== id))
    }, [])

    const clearAllToasts = useCallback(() => {
        setToasts([])
    }, [])

    // ===== Combined Value =====
    const value = {
        // Persistent notifications
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        addNotification,
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
        security: 'security'
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
        security: 'red'
    }
    return colors[type] || 'gray'
}

export default NotificationsContext
