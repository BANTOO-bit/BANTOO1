import { useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

/**
 * useAdminSessionTimeout — Auto-logout admin after idle period.
 * Monitors mouse, keyboard, scroll, and touch events to reset the timer.
 * 
 * @param {number} timeoutMinutes - Minutes of inactivity before logout (default: 30)
 */
export default function useAdminSessionTimeout(timeoutMinutes = 30) {
    const navigate = useNavigate()
    const { user, logout } = useAuth()
    const timerRef = useRef(null)
    const isAdmin = user?.roles?.includes('admin')

    const handleLogout = useCallback(async () => {
        if (!isAdmin) return
        try {
            await logout()
        } catch (err) {
            console.error('Session timeout logout error:', err)
        }
        navigate('/manage/auth', {
            state: { message: 'Sesi Anda telah berakhir karena tidak aktif. Silakan login kembali.' }
        })
    }, [isAdmin, logout, navigate])

    const resetTimer = useCallback(() => {
        if (!isAdmin) return
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(handleLogout, timeoutMinutes * 60 * 1000)
    }, [isAdmin, timeoutMinutes, handleLogout])

    useEffect(() => {
        if (!isAdmin) return

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']

        // Start the timer
        resetTimer()

        // Reset timer on user activity
        events.forEach(event => window.addEventListener(event, resetTimer, { passive: true }))

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
            events.forEach(event => window.removeEventListener(event, resetTimer))
        }
    }, [isAdmin, resetTimer])
}
