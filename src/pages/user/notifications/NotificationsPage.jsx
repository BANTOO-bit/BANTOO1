import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../../../context/NotificationsContext'

function NotificationsPage() {
    const navigate = useNavigate()
    const { notifications, markAsRead, markAllAsRead, deleteNotification, unreadCount } = useNotifications()

    const getIconColor = (color) => {
        const colors = {
            green: 'bg-green-100 text-green-600',
            orange: 'bg-orange-100 text-primary',
            blue: 'bg-blue-100 text-blue-600',
            gray: 'bg-gray-100 text-gray-600'
        }
        return colors[color] || colors.gray
    }

    return (
        <div className="min-h-screen flex flex-col bg-background-light">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white px-4 pt-12 pb-4 border-b border-border-color">
                <div className="relative flex items-center justify-center min-h-[40px]">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute left-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-text-main active:scale-95 transition-transform"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-bold">Notifikasi</h1>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="absolute right-0 text-sm text-primary font-medium"
                        >
                            Tandai Semua
                        </button>
                    )}
                </div>
            </header>

            {/* Notifications List */}
            <main className="flex-1">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-5xl text-gray-400">notifications_off</span>
                        </div>
                        <h2 className="text-lg font-bold text-text-main mb-2">Belum Ada Notifikasi</h2>
                        <p className="text-sm text-text-secondary text-center">
                            Notifikasi pesanan dan promo akan muncul di sini
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-border-color">
                        {notifications.map(notification => (
                            <div
                                key={notification.id}
                                onClick={() => markAsRead(notification.id)}
                                className={`flex gap-3 p-4 cursor-pointer transition-colors ${!notification.read ? 'bg-orange-50/50' : 'bg-white hover:bg-gray-50'
                                    }`}
                            >
                                {/* Icon */}
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getIconColor(notification.color)}`}>
                                    <span className="material-symbols-outlined text-xl">{notification.icon}</span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className={`text-sm ${!notification.read ? 'font-bold' : 'font-medium'} text-text-main`}>
                                            {notification.title}
                                        </h3>
                                        {!notification.read && (
                                            <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5" />
                                        )}
                                    </div>
                                    <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
                                        {notification.message}
                                    </p>
                                    <p className="text-[10px] text-text-secondary mt-1">
                                        {notification.time}
                                    </p>
                                </div>

                                {/* Delete Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        deleteNotification(notification.id)
                                    }}
                                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg">close</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

export default NotificationsPage
