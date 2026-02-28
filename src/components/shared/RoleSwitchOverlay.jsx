import { useState, useEffect } from 'react'

const roleConfig = {
    customer: {
        icon: 'person',
        label: 'Customer',
        color: 'text-green-500',
        bg: 'bg-green-50',
    },
    driver: {
        icon: 'two_wheeler',
        label: 'Driver',
        color: 'text-blue-500',
        bg: 'bg-blue-50',
    },
    merchant: {
        icon: 'store',
        label: 'Warung',
        color: 'text-orange-500',
        bg: 'bg-orange-50',
    },
}

/**
 * Full-screen overlay shown during role transition
 * Usage: <RoleSwitchOverlay targetRole="driver" />
 */
function RoleSwitchOverlay({ targetRole }) {
    const [phase, setPhase] = useState('enter') // enter → visible
    const config = roleConfig[targetRole] || roleConfig.customer

    useEffect(() => {
        const timer = setTimeout(() => setPhase('visible'), 50)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div
            className={`fixed inset-0 z-[200] flex flex-col items-center justify-center transition-opacity duration-300 ${phase === 'enter' ? 'opacity-0' : 'opacity-100'
                }`}
            style={{ backgroundColor: 'rgba(255,255,255,0.97)' }}
        >
            {/* Pulsing icon */}
            <div className={`w-20 h-20 rounded-full ${config.bg} flex items-center justify-center mb-4 animate-pulse`}>
                <span className={`material-symbols-outlined text-[40px] ${config.color}`}>
                    {config.icon}
                </span>
            </div>

            {/* Label */}
            <p className="text-lg font-bold text-slate-700 mb-1">
                Beralih ke {config.label}
            </p>
            <p className="text-sm text-slate-400">Mohon tunggu sebentar...</p>

            {/* Loading dots */}
            <div className="flex gap-1.5 mt-6">
                <span className={`w-2 h-2 rounded-full ${config.color.replace('text-', 'bg-')} animate-bounce`} style={{ animationDelay: '0ms' }}></span>
                <span className={`w-2 h-2 rounded-full ${config.color.replace('text-', 'bg-')} animate-bounce`} style={{ animationDelay: '150ms' }}></span>
                <span className={`w-2 h-2 rounded-full ${config.color.replace('text-', 'bg-')} animate-bounce`} style={{ animationDelay: '300ms' }}></span>
            </div>
        </div>
    )
}

export default RoleSwitchOverlay
