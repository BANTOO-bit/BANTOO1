import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DriverBottomNavigation from '../../components/driver/DriverBottomNavigation'
import { driverService } from '../../services/driverService'
import { useAuth } from '../../context/AuthContext'

function DriverNotificationsPage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [notifications, setNotifications] = useState([])
    const [allRead, setAllRead] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user?.id) {
            loadNotifications()
        }
    }, [user?.id])

    const loadNotifications = async () => {
        try {
            setLoading(true)
            const data = await driverService.getNotifications(user.id)
            setNotifications(data)
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error('Failed to load notifications:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleMarkAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })))
        setAllRead(true)
        // In a real app, you would also update the read status in the backend here
    }

    const getNotificationStyles = (type, isUnread) => {
        if (type === 'alert') {
            return {
                container: isUnread
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50'
                    : 'bg-white dark:bg-gray-800 border-transparent dark:border-gray-700',
                iconBg: 'bg-red-100 dark:bg-red-900/40',
                iconColor: 'text-red-600',
                titleColor: 'text-red-700 dark:text-red-400',
                dotColor: 'bg-red-600',
                timeColor: 'text-red-500/80 dark:text-red-400/60'
            }
        } else if (type === 'order') {
            return {
                container: isUnread
                    ? 'bg-blue-50 dark:bg-gray-800 border-blue-100 dark:border-gray-700'
                    : 'bg-white dark:bg-gray-800 border-transparent dark:border-gray-700',
                iconBg: 'bg-orange-100 dark:bg-orange-900/30',
                iconColor: 'text-orange-600',
                titleColor: 'text-gray-900 dark:text-white',
                dotColor: 'bg-orange-600',
                timeColor: 'text-gray-400 dark:text-gray-500'
            }
        } else if (type === 'success') {
            return {
                container: isUnread
                    ? 'bg-blue-50 dark:bg-gray-800 border-blue-100 dark:border-gray-700'
                    : 'bg-white dark:bg-gray-800 border-transparent dark:border-gray-700',
                iconBg: isUnread ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-green-100 dark:bg-green-900/30',
                iconColor: isUnread ? 'text-blue-600' : 'text-green-600 dark:text-green-400',
                titleColor: 'text-gray-900 dark:text-white',
                dotColor: 'bg-orange-600',
                timeColor: 'text-gray-400 dark:text-gray-500'
            }
        } else {
            return {
                container: isUnread
                    ? 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                    : 'bg-white dark:bg-gray-800 border-transparent dark:border-gray-700',
                iconBg: 'bg-gray-100 dark:bg-gray-700',
                iconColor: 'text-gray-600 dark:text-gray-300',
                titleColor: 'text-gray-900 dark:text-white',
                dotColor: 'bg-blue-600',
                timeColor: 'text-gray-400 dark:text-gray-500'
            }
        }
    }

    const hasNotifications = notifications.length > 0

    return (
        <div className="font-display bg-background-light text-slate-900 antialiased min-h-screen">
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl bg-white">
                {/* Header */}
                <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-colors duration-300">
                    <div className="flex items-center p-4 justify-between">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center justify-center rounded-full size-10 -ml-2 text-slate-900 hover:bg-slate-100 transition-colors"
                            >
                                <span className="material-symbols-outlined">arrow_back</span>
                            </button>
                            <span className="material-symbols-outlined text-slate-900">notifications</span>
                            <h1 className="text-xl font-bold text-slate-900">Notifikasi</h1>
                        </div>
                        {notifications.length > 0 && !allRead && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs font-bold text-[#0d59f2] hover:text-blue-700 transition-colors uppercase tracking-wide"
                            >
                                Tandai Dibaca
                            </button>
                        )}
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 bg-background-light p-4 pb-bottom-nav">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-8 h-8 border-4 border-slate-200 border-t-[#0d59f2] rounded-full animate-spin mb-4"></div>
                            <p className="text-slate-500 text-sm font-medium">Memuat notifikasi...</p>
                        </div>
                    ) : notifications.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            {/* Group notifications by date (simplified for now) */}
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Terbaru</h2>
                                <div className="h-px flex-1 bg-slate-200"></div>
                            </div>

                            {notifications.map((notification) => {
                                const styles = getNotificationStyles(notification.type, notification.isUnread)

                                return (
                                    <div
                                        key={notification.id}
                                        onClick={() => {
                                            if (notification.type === 'order') {
                                                navigate('/driver/order/pickup')
                                            }
                                        }}
                                        className={`relative p-4 rounded-xl border transition-all duration-200 ${styles.container} ${notification.type === 'order' ? 'cursor-pointer active:scale-[0.98]' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            {/* Icon */}
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${styles.iconBg} ${styles.iconColor}`}>
                                                <span className="material-symbols-outlined text-[20px]">{notification.icon}</span>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className={`text-sm font-bold mb-1 ${styles.titleColor}`}>
                                                    {notification.title}
                                                </h3>
                                                <p className="text-xs text-slate-500 leading-relaxed mb-1.5">
                                                    {notification.message}
                                                </p>
                                                <span className={`text-[10px] font-medium ${styles.timeColor}`}>
                                                    {notification.time}
                                                </span>

                                                {/* Details Box (if any) */}
                                                {notification.details && (
                                                    <div className="mt-3 p-3 bg-white/50 rounded-lg border border-slate-100 text-xs text-slate-600">
                                                        {notification.details.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        /* Empty State */
                        <div className="flex flex-col items-center justify-center text-center pt-32">
                            <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-full mb-6 flex items-center justify-center">
                                <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-6xl">notifications_off</span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Belum ada notifikasi</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
                                Informasi pesanan, sistem, dan promosi terbaru akan muncul di sini.
                            </p>
                        </div>
                    )}
                </main>

                {/* Bottom Navigation */}
                <DriverBottomNavigation />
            </div>
        </div>
    )
}

export default DriverNotificationsPage
