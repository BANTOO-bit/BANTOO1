import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotification } from '../../context/NotificationsContext'

function ToastNotification() {
    const { notifications, removeNotification } = useNotification()
    const navigate = useNavigate()

    if (notifications.length === 0) return null

    return (
        <div className="fixed top-4 left-0 right-0 z-[100] flex flex-col items-center gap-2 p-4 pointer-events-none">
            {notifications.map((notification) => (
                <ToastItem
                    key={notification.id}
                    notification={notification}
                    onClose={() => removeNotification(notification.id)}
                    navigate={navigate}
                />
            ))}
        </div>
    )
}

function ToastItem({ notification, onClose, navigate }) {
    const [isExiting, setIsExiting] = useState(false)

    const handleClose = (e) => {
        e.stopPropagation()
        setIsExiting(true)
        setTimeout(onClose, 300) // Wait for exit animation
    }

    const handleClick = () => {
        if (notification.actionUrl) {
            navigate(notification.actionUrl)
            handleClose({ stopPropagation: () => { } })
        }
    }

    // Auto-close logic is handled by context, but we can add exit animation trigger here if needed

    const getStyles = (type) => {
        switch (type) {
            case 'order':
                return {
                    bg: 'bg-white',
                    border: 'border-l-4 border-l-blue-500',
                    icon: 'local_shipping',
                    iconColor: 'text-blue-500',
                    titleColor: 'text-slate-900'
                }
            case 'success':
                return {
                    bg: 'bg-white',
                    border: 'border-l-4 border-l-green-500',
                    icon: 'check_circle',
                    iconColor: 'text-green-500',
                    titleColor: 'text-slate-900'
                }
            case 'error':
                return {
                    bg: 'bg-white',
                    border: 'border-l-4 border-l-red-500',
                    icon: 'error',
                    iconColor: 'text-red-500',
                    titleColor: 'text-slate-900'
                }
            default:
                return {
                    bg: 'bg-white',
                    border: 'border-l-4 border-l-slate-500',
                    icon: 'notifications',
                    iconColor: 'text-slate-500', // Changed from text-slate-500 to match others
                    titleColor: 'text-slate-900'
                }
        }
    }

    const style = getStyles(notification.type)

    return (
        <div
            onClick={handleClick}
            className={`
                pointer-events-auto
                w-full max-w-sm bg-white rounded-lg shadow-lg overflow-hidden border border-slate-100
                flex items-start p-4 gap-3 cursor-pointer
                transition-all duration-300 ease-in-out transform
                ${style.border}
                ${isExiting ? 'opacity-0 -translate-y-full scale-95' : 'opacity-100 translate-y-0 scale-100 animate-in slide-in-from-top-4'}
            `}
        >
            <div className={`shrink-0 ${style.iconColor}`}>
                <span className="material-symbols-outlined text-2xl">{style.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
                <h4 className={`font-bold text-sm ${style.titleColor}`}>{notification.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-tight line-clamp-2">{notification.message}</p>
                {notification.actionLabel && (
                    <button className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-700">
                        {notification.actionLabel}
                    </button>
                )}
            </div>
            <button
                onClick={handleClose}
                className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-50"
            >
                <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
        </div>
    )
}

export default ToastNotification
