import { useEffect } from 'react'

function Toast({ message, type = 'success', isVisible, onClose, duration = 3000 }) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose?.()
            }, duration)
            return () => clearTimeout(timer)
        }
    }, [isVisible, duration, onClose])

    if (!isVisible) return null

    const bgColor = type === 'success'
        ? 'bg-primary'
        : type === 'error'
            ? 'bg-red-500'
            : 'bg-gray-800'

    const icon = type === 'success'
        ? 'check_circle'
        : type === 'error'
            ? 'error'
            : 'info'

    return (
        <div className="fixed bottom-24 left-4 right-4 z-[100] flex justify-center animate-slide-up">
            <div className={`flex items-center gap-2 px-5 py-3 rounded-xl ${bgColor} text-white shadow-lg`}>
                <span className="material-symbols-outlined text-[20px]">{icon}</span>
                <span className="text-sm font-medium">{message}</span>
            </div>
        </div>
    )
}

export default Toast
