import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext()

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within ToastProvider')
    }
    return context
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const addToast = useCallback((message, type = 'info', duration = 1000) => {
        const id = Date.now() + Math.random()
        const newToast = { id, message, type, duration }

        setToasts(prev => {
            // Remove any existing toast with the same message to prevent stacking
            const filtered = prev.filter(t => t.message !== message)
            return [...filtered, newToast]
        })

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                removeToast(id)
            }, duration)
        }

        return id
    }, [])

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
    }, [])

    const toast = {
        success: (message, duration) => addToast(message, 'success', duration),
        error: (message, duration) => addToast(message, 'error', duration),
        warning: (message, duration) => addToast(message, 'warning', duration),
        info: (message, duration) => addToast(message, 'info', duration),
        remove: removeToast,
        clear: () => setToasts([])
    }

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    )
}

function ToastContainer({ toasts, onRemove }) {
    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
            {toasts.map(toast => (
                <ToastItem
                    key={toast.id}
                    toast={toast}
                    onRemove={() => onRemove(toast.id)}
                />
            ))}
        </div>
    )
}

function ToastItem({ toast, onRemove }) {
    const { message, type } = toast

    const typeStyles = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        warning: 'bg-yellow-500 text-white',
        info: 'bg-blue-500 text-white'
    }

    const icons = {
        success: 'check_circle',
        error: 'error',
        warning: 'warning',
        info: 'info'
    }

    return (
        <div
            className={`
                ${typeStyles[type]}
                min-w-[300px] max-w-md
                px-4 py-3 rounded-xl shadow-lg
                flex items-center gap-3
                pointer-events-auto
                animate-slide-in-right
            `}
        >
            <span className="material-symbols-outlined text-xl flex-shrink-0">
                {icons[type]}
            </span>
            <p className="flex-1 text-sm font-medium">{message}</p>
            <button
                onClick={onRemove}
                className="flex-shrink-0 hover:opacity-70 transition-opacity"
            >
                <span className="material-symbols-outlined text-lg">close</span>
            </button>
        </div>
    )
}

export default ToastProvider
