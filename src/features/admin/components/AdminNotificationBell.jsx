import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import notificationService from '@/services/notificationService'

// Map notification type to icon + color
const getNotifStyle = (type) => {
    const map = {
        order: { icon: 'shopping_bag', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
        driver: { icon: 'two_wheeler', bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400' },
        merchant: { icon: 'storefront', bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' },
        withdrawal: { icon: 'payments', bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
        warning: { icon: 'warning', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' },
        system: { icon: 'info', bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400' },
    }
    return map[type] || map.system
}

// Relative time helper
const timeAgo = (dateStr) => {
    if (!dateStr) return ''
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
    if (diff < 60) return 'Baru saja'
    if (diff < 3600) return `${Math.floor(diff / 60)} menit yang lalu`
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam yang lalu`
    return `${Math.floor(diff / 86400)} hari yang lalu`
}

/**
 * AdminNotificationBell — Notification bell icon with dropdown and realtime subscription.
 */
function AdminNotificationBell() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const notificationRef = useRef(null)

    // Fetch notifications
    useEffect(() => {
        let unsubscribe = () => { }

        async function loadNotifications() {
            try {
                const data = await notificationService.getNotifications(10)
                setNotifications(data || [])
                const count = await notificationService.getUnreadCount()
                setUnreadCount(count)
            } catch (err) {
                console.error('Failed to load notifications:', err)
            }
        }

        loadNotifications()

        if (user?.id) {
            unsubscribe = notificationService.subscribeToNotifications(user.id, (newNotif) => {
                setNotifications(prev => [newNotif, ...prev].slice(0, 10))
                setUnreadCount(prev => prev + 1)
            })
        }

        return () => unsubscribe()
    }, [user?.id])

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead()
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
            setUnreadCount(0)
        } catch (err) {
            console.error('Failed to mark all as read:', err)
        }
    }

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) setIsNotificationOpen(false)
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <div className="relative" ref={notificationRef}>
            <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative p-1.5 text-[#617589] dark:text-[#94a3b8] hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d] rounded-lg transition-colors"
            >
                <span className="material-symbols-outlined text-xl">notifications</span>
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#1a2632]"></span>
                )}
            </button>

            {/* Notification Dropdown */}
            {isNotificationOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-lg overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-[#e5e7eb] dark:border-[#2a3b4d] flex items-center justify-between">
                        <h3 className="font-semibold text-sm text-[#111418] dark:text-white">Notifikasi</h3>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllRead} className="text-xs text-primary hover:underline">Tandai semua dibaca</button>
                        )}
                    </div>
                    <div className="max-h-[360px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center">
                                <span className="material-symbols-outlined text-3xl text-[#94a3b8] mb-2">notifications_off</span>
                                <p className="text-sm text-[#617589] dark:text-[#94a3b8]">Belum ada notifikasi</p>
                            </div>
                        ) : (
                            notifications.map((notif, idx) => {
                                const style = getNotifStyle(notif.type)
                                return (
                                    <div key={notif.id || idx} className={`p-3 ${idx < notifications.length - 1 ? 'border-b border-[#e5e7eb] dark:border-[#2a3b4d]' : ''} hover:bg-[#f9fafb] dark:hover:bg-[#2a3b4d]/30 transition-colors cursor-pointer`}>
                                        <div className="flex gap-2.5">
                                            <div className={`w-8 h-8 rounded-full ${style.bg} ${style.text} flex items-center justify-center flex-shrink-0`}>
                                                <span className="material-symbols-outlined text-base">{style.icon}</span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-medium text-[#111418] dark:text-white mb-0.5">{notif.title || 'Notifikasi'}</p>
                                                <p className="text-[11px] text-[#617589] dark:text-[#94a3b8] leading-relaxed">{notif.message || notif.body || ''}</p>
                                                <p className="text-[10px] text-[#94a3b8] mt-1">{timeAgo(notif.created_at)}</p>
                                            </div>
                                            {!notif.is_read && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shrink-0"></div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                    {notifications.length > 0 && (
                        <div className="p-2.5 bg-[#f9fafb] dark:bg-[#2a3b4d]/50 text-center border-t border-[#e5e7eb] dark:border-[#2a3b4d]">
                            <button onClick={() => navigate('/admin/notifications')} className="text-xs font-medium text-primary hover:underline">Lihat Semua Notifikasi</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default AdminNotificationBell
