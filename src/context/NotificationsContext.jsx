import { createContext, useContext, useState, useCallback, useEffect } from 'react'

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

// Sample notifications
const defaultNotifications = [
    {
        id: 1,
        type: 'order',
        title: 'Pesanan Selesai',
        message: 'Pesanan dari Ayam Geprek UMKM telah sampai. Jangan lupa beri ulasan ya!',
        time: '10 menit lalu',
        read: false,
        icon: 'check_circle',
        color: 'green'
    },
    {
        id: 2,
        type: 'promo',
        title: 'Promo Spesial! 🎉',
        message: 'Dapatkan diskon 20% untuk pesanan pertamamu hari ini!',
        time: '1 jam lalu',
        read: false,
        icon: 'local_offer',
        color: 'orange'
    },
    {
        id: 3,
        type: 'order',
        title: 'Driver Menuju Lokasi',
        message: 'Driver Ahmad sedang dalam perjalanan mengantar pesananmu.',
        time: '2 jam lalu',
        read: true,
        icon: 'two_wheeler',
        color: 'blue'
    },
    {
        id: 4,
        type: 'system',
        title: 'Update Aplikasi',
        message: 'Versi terbaru Bantoo! sudah tersedia. Update sekarang untuk pengalaman lebih baik.',
        time: '1 hari lalu',
        read: true,
        icon: 'system_update',
        color: 'gray'
    }
]

export function NotificationsProvider({ children }) {
    // ===== Persistent Notifications State =====
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem('bantoo_notifications')
        return saved ? JSON.parse(saved) : defaultNotifications
    })

    useEffect(() => {
        localStorage.setItem('bantoo_notifications', JSON.stringify(notifications))
    }, [notifications])

    const markAsRead = (notificationId) => {
        setNotifications(prev =>
            prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        )
    }

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }

    const deleteNotification = (notificationId) => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
    }

    const clearAll = () => {
        setNotifications([])
    }

    const addNotification = (notification) => {
        const newNotification = {
            ...notification,
            id: Date.now(),
            time: 'Baru saja',
            read: false
        }
        setNotifications(prev => [newNotification, ...prev])
    }

    const unreadCount = notifications.filter(n => !n.read).length

    // ===== Toast Notifications State =====
    const [toasts, setToasts] = useState([])

    const playNotificationSound = () => {
        // In a real app, this would play an audio file
        // const audio = new Audio('/sounds/notification.mp3')
        // audio.play().catch(e => { /* Silent fail */ })
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

export default NotificationsContext
