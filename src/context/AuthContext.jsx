import { createContext, useContext, useRef, useCallback } from 'react'
import { authService } from '@/services/authService'
import { TIMEOUTS } from '@/config/constants'
import PageLoader from '@/features/shared/components/PageLoader'
import { useAuthSession } from '@/hooks/useAuthSession'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useRoleManager } from '@/hooks/useRoleManager'

const AuthContext = createContext()

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export function AuthProvider({ children }) {
    // 1. Dependency Hooks
    const authAttemptsRef = useRef({ count: 0, firstAttempt: null })

    // 2. Profile Management
    const handleLogoutBase = async (userId, isAdmin) => {
        const withTimeout = (promise, ms = 10000) => {
            let timeoutId
            const timeout = new Promise((_, reject) => {
                timeoutId = setTimeout(() => reject(new Error('Logout network timeout')), ms)
            })
            return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId))
        }

        if (userId) {
            try {
                await withTimeout(authService.resetRoleOnLogout(userId, isAdmin))
            } catch (e) {
                console.warn('Failed to reset active_role on logout (network issue):', e)
            }
        }

        localStorage.removeItem('user_last_active_role')
        localStorage.removeItem('bantoo_cart')
        localStorage.removeItem('bantoo_cart_merchant')
        localStorage.removeItem('bantoo_merchant_notes')

        try {
            await withTimeout(authService.signOut())
        } catch (e) {
            console.warn('Backend signout timed out or failed, forcing local logout:', e)
            const supabaseProjectRef = (import.meta.env.VITE_SUPABASE_URL || '').match(/\/\/([^.]+)/)?.[1] || ''
            if (supabaseProjectRef) localStorage.removeItem(`sb-${supabaseProjectRef}-auth-token`)
        }
    }

    const { fullUser, setFullUser, isAuthenticated, refreshProfile, clearProfile } = useUserProfile(null, async () => {
        // Logout callback from realtime terminate event
        await handleLogoutBase(fullUser?.id, fullUser?.roles?.includes('admin'))
        clearProfile()
    })

    // 3. Session Management
    const { loading } = useAuthSession(
        useCallback(async (authUser) => {
            await refreshProfile(authUser)
        }, [refreshProfile]),
        useCallback(async () => {
            clearProfile()
        }, [clearProfile])
    )

    // 4. Role Management
    const { switchRole, hasRole } = useRoleManager(fullUser, refreshProfile, setFullUser)

    // 5. Auth Action Methods (Rate limited)
    const checkRateLimit = () => {
        const now = Date.now()
        const tracker = authAttemptsRef.current
        const AUTH_WINDOW_MS = TIMEOUTS.AUTH_RATE_LIMIT_WINDOW_MS
        const AUTH_MAX_ATTEMPTS = TIMEOUTS.AUTH_MAX_ATTEMPTS

        if (tracker.firstAttempt && (now - tracker.firstAttempt) > AUTH_WINDOW_MS) {
            authAttemptsRef.current = { count: 0, firstAttempt: null }
        }
        if (authAttemptsRef.current.count >= AUTH_MAX_ATTEMPTS) {
            const remainingSec = Math.ceil((AUTH_WINDOW_MS - (now - authAttemptsRef.current.firstAttempt)) / 1000)
            throw new Error(`Terlalu banyak percobaan. Coba lagi dalam ${remainingSec} detik.`)
        }
        if (!authAttemptsRef.current.firstAttempt) authAttemptsRef.current.firstAttempt = now
        authAttemptsRef.current.count++
    }

    const login = async (phone, password) => {
        checkRateLimit()
        const { data, error } = await authService.signInWithPhone(phone, password)
        if (error) throw error
        authAttemptsRef.current = { count: 0, firstAttempt: null }
        return data
    }

    const register = async (name, phone, password, role = 'customer', email) => {
        if (!email) throw new Error('Email dibutuhkan untuk pendaftaran')
        checkRateLimit()
        const { data, error } = await authService.signUpWithPhone(phone, password, {
            full_name: name, role
        }, email)
        if (error) throw error
        authAttemptsRef.current = { count: 0, firstAttempt: null }
        await authService.signOut()
        return data
    }

    const resetPassword = async (identifier) => {
        let emailToReset = identifier
        if (/^[\d+]+$/.test(identifier) || identifier.startsWith('62') || identifier.startsWith('08')) {
            const { email, error } = await authService.getEmailByPhone(identifier)
            if (error || !email) throw new Error('Nomor HP tidak ditemukan atau belum didaftarkan dengan email.')
            emailToReset = email
        }
        const { data, error } = await authService.resetPasswordForEmail(emailToReset)
        if (error) throw error
        return data
    }

    const updatePassword = async (newPassword) => {
        const { data, error } = await authService.updatePassword(newPassword)
        if (error) throw error
        return data
    }

    const logout = async () => {
        await handleLogoutBase(fullUser?.id, fullUser?.roles?.includes('admin'))
        clearProfile()
    }

    // Compose flat value object matching original API
    const value = {
        isAuthenticated,
        user: fullUser,
        login,
        register,
        resetPassword,
        updatePassword,
        logout,
        loading,
        refreshProfile,
        switchRole,
        hasRole,
    }

    return (
        <AuthContext.Provider value={value}>
            {loading ? <PageLoader /> : children}
        </AuthContext.Provider>
    )
}

export default AuthContext
