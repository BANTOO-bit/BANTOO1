import { useState, useEffect } from 'react'
import { supabase } from '../../../services/supabaseClient'
import AdminLayout from '../../../components/admin/AdminLayout'
import notificationService from '../../../services/notificationService'
import { useAuth } from '../../../context/AuthContext'

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

const timeAgo = (dateStr) => {
    if (!dateStr) return ''
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
    if (diff < 60) return 'Baru saja'
    if (diff < 3600) return `${Math.floor(diff / 60)} menit yang lalu`
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam yang lalu`
    return `${Math.floor(diff / 86400)} hari yang lalu`
}

export default function AdminNotificationsPage() {
    const { user } = useAuth()
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all') // all, unread

    useEffect(() => {
        async function fetchAll() {
            try {
                const data = await notificationService.getNotifications(50)
                setNotifications(data || [])
            } catch (err) {
                console.error('Error fetching notifications:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchAll()

        // Realtime
        if (user?.id) {
            const unsub = notificationService.subscribeToNotifications(user.id, (newNotif) => {
                setNotifications(prev => [newNotif, ...prev])
            })
            return () => unsub()
        }
    }, [user?.id])

    const handleMarkAllRead = async () => {
        await notificationService.markAllAsRead()
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    }

    const handleMarkRead = async (id) => {
        try {
            await supabase.from('notifications').update({ is_read: true }).eq('id', id)
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
        } catch (err) {
            console.error('Error marking as read:', err)
        }
    }

    const filteredNotifs = filter === 'unread'
        ? notifications.filter(n => !n.is_read)
        : notifications

    const unreadCount = notifications.filter(n => !n.is_read).length

    return (
        <AdminLayout title="Semua Notifikasi" showBack>
            {/* Filter bar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center p-1 bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg w-fit">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'all' ? 'bg-primary/10 text-primary' : 'text-[#617589] hover:text-[#111418] dark:hover:text-white'}`}
                    >
                        Semua ({notifications.length})
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'unread' ? 'bg-primary/10 text-primary' : 'text-[#617589] hover:text-[#111418] dark:hover:text-white'}`}
                    >
                        Belum Dibaca ({unreadCount})
                    </button>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-sm">done_all</span>
                        Tandai Semua Dibaca
                    </button>
                )}
            </div>

            {/* Notifications List */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : filteredNotifs.length === 0 ? (
                <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] flex flex-col items-center justify-center p-12 min-h-[300px]">
                    <div className="w-16 h-16 bg-[#f0f2f4] dark:bg-[#2a3b4d] rounded-full flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-3xl text-[#94a3b8]">notifications_off</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#111418] dark:text-white mb-1">
                        {filter === 'unread' ? 'Semua Sudah Dibaca' : 'Belum Ada Notifikasi'}
                    </h3>
                    <p className="text-sm text-[#617589] dark:text-[#94a3b8]">
                        {filter === 'unread' ? 'Tidak ada notifikasi yang belum dibaca.' : 'Notifikasi akan muncul di sini secara real-time.'}
                    </p>
                </div>
            ) : (
                <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] overflow-hidden divide-y divide-[#e5e7eb] dark:divide-[#2a3b4d]">
                    {filteredNotifs.map((notif) => {
                        const style = getNotifStyle(notif.type)
                        return (
                            <div
                                key={notif.id}
                                className={`flex items-start gap-4 p-4 transition-colors cursor-pointer ${!notif.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-[#f9fafb] dark:hover:bg-[#2a3b4d]/30'}`}
                                onClick={() => !notif.is_read && handleMarkRead(notif.id)}
                            >
                                <div className={`w-10 h-10 rounded-full ${style.bg} ${style.text} flex items-center justify-center shrink-0`}>
                                    <span className="material-symbols-outlined text-lg">{style.icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className={`text-sm ${!notif.is_read ? 'font-bold text-[#111418] dark:text-white' : 'font-medium text-[#111418] dark:text-white'}`}>
                                            {notif.title || 'Notifikasi'}
                                        </p>
                                        {!notif.is_read && (
                                            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0"></div>
                                        )}
                                    </div>
                                    <p className="text-xs text-[#617589] dark:text-[#94a3b8] mt-0.5 leading-relaxed">{notif.message || notif.body || ''}</p>
                                    <p className="text-[11px] text-[#94a3b8] mt-1.5">{timeAgo(notif.created_at)}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </AdminLayout>
    )
}
