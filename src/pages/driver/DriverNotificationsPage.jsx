import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DriverBottomNavigation from '../../components/driver/DriverBottomNavigation'
import { mockNotifications as initialNotifications } from '../../data/driverNotifications'

function DriverNotificationsPage() {
    const navigate = useNavigate()
    const [notifications, setNotifications] = useState(initialNotifications)
    const [allRead, setAllRead] = useState(false)

    const handleMarkAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })))
        setAllRead(true)
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
                container: 'bg-white dark:bg-gray-800 border-transparent dark:border-gray-700',
                iconBg: 'bg-purple-100 dark:bg-purple-900/30',
                iconColor: 'text-purple-600',
                titleColor: 'text-gray-900 dark:text-white',
                dotColor: 'bg-orange-600',
                timeColor: 'text-gray-400 dark:text-gray-500'
            }
        }
    }

    const todayNotifications = notifications.filter(n => n.category === 'today')
    const yesterdayNotifications = notifications.filter(n => n.category === 'yesterday')
    const hasNotifications = notifications.length > 0

    return (
        <div className="font-display bg-background-light text-slate-900 antialiased min-h-screen">
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl bg-background-light">
                {/* Header */}
                <header className="bg-white dark:bg-gray-800 px-4 py-4 sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-bold text-center flex-grow pr-8">Notifikasi</h1>
                    <div className="w-6"></div>
                </header>

                {/* Main Content */}
                <main className="flex-grow p-4 space-y-3 pb-24 overflow-y-auto no-scrollbar">
                    {hasNotifications ? (
                        <>
                            {/* Today Section */}
                            {todayNotifications.length > 0 && (
                                <>
                                    <div className="flex items-center justify-between my-4">
                                        <div className="w-24"></div>
                                        <span className="text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded-full absolute left-1/2 transform -translate-x-1/2">
                                            Hari Ini
                                        </span>
                                        <button
                                            onClick={handleMarkAllRead}
                                            disabled={allRead}
                                            className={`text-xs font-semibold transition-colors z-10 ${allRead
                                                ? 'text-gray-400 cursor-not-allowed'
                                                : 'text-blue-600 hover:text-blue-700 active:text-blue-800 cursor-pointer'
                                                }`}
                                        >
                                            {allRead ? 'Semua Dibaca' : 'Tandai Semua Dibaca'}
                                        </button>
                                    </div>

                                    {todayNotifications.map(notification => {
                                        const styles = getNotificationStyles(notification.type, notification.isUnread)
                                        return (
                                            <div
                                                key={notification.id}
                                                onClick={() => navigate(`/driver/notifications/${notification.id}`)}
                                                className={`group relative ${styles.container} border rounded-xl p-4 flex items-start space-x-4 transition-all active:scale-[0.98] cursor-pointer hover:shadow-md`}
                                            >
                                                {notification.isUnread && (
                                                    <div className={`absolute top-4 right-4 w-2.5 h-2.5 ${styles.dotColor} rounded-full ${notification.type === 'alert' ? 'animate-pulse' : ''}`}></div>
                                                )}
                                                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${styles.iconBg}`}>
                                                    <span className={`material-symbols-outlined ${styles.iconColor} text-2xl`}>{notification.icon}</span>
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="flex justify-between items-start pr-4">
                                                        <h3 className={`font-bold ${styles.titleColor} text-sm`}>{notification.title}</h3>
                                                    </div>
                                                    <p className="text-xs text-gray-700 dark:text-gray-300 mt-1 leading-relaxed font-medium">
                                                        {notification.message}
                                                    </p>
                                                    <span className={`text-[10px] ${styles.timeColor} mt-2 block font-medium`}>{notification.time}</span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </>
                            )}

                            {/* Yesterday Section */}
                            {yesterdayNotifications.length > 0 && (
                                <>
                                    <div className="flex items-center justify-center my-6">
                                        <span className="text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded-full">Kemarin</span>
                                    </div>

                                    {yesterdayNotifications.map(notification => {
                                        const styles = getNotificationStyles(notification.type, notification.isUnread)
                                        return (
                                            <div
                                                key={notification.id}
                                                onClick={() => navigate(`/driver/notifications/${notification.id}`)}
                                                className={`group ${styles.container} border rounded-xl p-4 flex items-start space-x-4 transition-all active:scale-[0.98] cursor-pointer hover:shadow-md`}
                                            >
                                                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${styles.iconBg}`}>
                                                    <span className={`material-symbols-outlined ${styles.iconColor} text-2xl`}>{notification.icon}</span>
                                                </div>
                                                <div className="flex-grow">
                                                    <h3 className={`font-bold ${styles.titleColor} text-sm`}>{notification.title}</h3>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                                        {notification.message}
                                                    </p>
                                                    <span className={`text-[10px] ${styles.timeColor} mt-2 block`}>{notification.time}</span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </>
                            )}
                        </>
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
