import { useState, useEffect, useCallback, createContext, useContext } from 'react'

const ToastContext = createContext()

export function useToast() {
    return useContext(ToastContext)
}

export function AdminToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const addToast = useCallback((message, type = 'success', duration = 3000) => {
        const id = Date.now() + Math.random()
        setToasts(prev => [...prev, { id, message, type, duration }])
    }, [])

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
                {toasts.map(toast => (
                    <Toast key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    )
}

function Toast({ toast, onDismiss }) {
    const [isVisible, setIsVisible] = useState(false)
    const [isLeaving, setIsLeaving] = useState(false)

    useEffect(() => {
        requestAnimationFrame(() => setIsVisible(true))
        const timer = setTimeout(() => {
            setIsLeaving(true)
            setTimeout(onDismiss, 300)
        }, toast.duration)
        return () => clearTimeout(timer)
    }, [toast.duration, onDismiss])

    const config = {
        success: {
            icon: 'check_circle',
            bg: 'bg-emerald-600',
            ring: 'ring-emerald-600/20',
        },
        error: {
            icon: 'error',
            bg: 'bg-red-600',
            ring: 'ring-red-600/20',
        },
        warning: {
            icon: 'warning',
            bg: 'bg-amber-500',
            ring: 'ring-amber-500/20',
        },
        info: {
            icon: 'info',
            bg: 'bg-blue-600',
            ring: 'ring-blue-600/20',
        },
    }

    const c = config[toast.type] || config.success

    return (
        <div className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg ring-1 ${c.bg} ${c.ring} text-white min-w-[280px] max-w-[400px]
            transform transition-all duration-300 ease-out
            ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}
        `}>
            <span className="material-symbols-outlined text-xl shrink-0">{c.icon}</span>
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button onClick={() => { setIsLeaving(true); setTimeout(onDismiss, 300) }} className="shrink-0 hover:bg-white/20 rounded-full p-0.5 transition-colors">
                <span className="material-symbols-outlined text-base">close</span>
            </button>
        </div>
    )
}
