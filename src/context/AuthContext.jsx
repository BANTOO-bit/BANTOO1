import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { authService } from '../services/authService'
import { supabase } from '../services/supabaseClient'
import PageLoader from '../components/shared/PageLoader'

const AuthContext = createContext()

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const isRefreshing = useRef(false) // Guard against concurrent calls

    // Helper to fetch full user profile with roles
    const refreshProfile = async (passedUser = null) => {
        // Prevent concurrent refresh calls
        if (isRefreshing.current) {
            return
        }
        isRefreshing.current = true

        try {
            let authUser = passedUser

            if (!authUser) {
                const { data, error } = await supabase.auth.getUser()
                if (error || !data.user) return
                authUser = data.user
            }

            const userId = authUser.id

            // Helper for safe fetching with timeout (no lingering timeout warnings)
            const safeFetch = async (promise, label) => {
                let timeoutId
                const timeout = new Promise(resolve => {
                    timeoutId = setTimeout(() => {
                        resolve({ data: null, error: { message: 'Timeout' } })
                    }, 15000)
                })

                try {
                    const result = await Promise.race([promise, timeout])
                    clearTimeout(timeoutId) // Cancel timeout if fetch won
                    return result
                } catch (e) {
                    clearTimeout(timeoutId)
                    return { data: null, error: e }
                }
            }

            const [profile, userRoles, merchant, driver, wallet] = await Promise.all([
                safeFetch(supabase.from('profiles').select('full_name, phone, avatar_url, active_role').eq('id', userId).maybeSingle(), 'profile'),
                safeFetch(supabase.from('user_roles').select('role').eq('user_id', userId), 'user_roles'),
                safeFetch(supabase.from('merchants').select('id, name, status').eq('owner_id', userId).maybeSingle(), 'merchant'),
                safeFetch(supabase.from('drivers').select('id, status').eq('user_id', userId).maybeSingle(), 'driver'),
                safeFetch(supabase.from('wallets').select('balance').eq('user_id', userId).maybeSingle(), 'wallet')
            ])

            // Extract roles array from user_roles
            const roles = userRoles.data?.map(r => r.role) || ['customer']
            const activeRole = profile.data?.active_role || 'customer'

            const userWithRole = {
                ...authUser,
                // Profile data
                fullName: profile.data?.full_name || authUser.user_metadata?.full_name,
                phone: profile.data?.phone || authUser.user_metadata?.phone_number,
                avatarUrl: profile.data?.avatar_url,
                // Multi-role support
                roles: roles,
                activeRole: activeRole,
                // Legacy support (deprecated)
                role: activeRole,
                // Partner statuses
                merchantStatus: merchant.data?.status || null,
                merchantId: merchant.data?.id || null,
                merchantName: merchant.data?.name || null,
                driverStatus: driver.data?.status || null,
                driverId: driver.data?.id || null,
                // Wallet
                walletBalance: wallet.data?.balance || 0,
                // Helper flags
                isMerchant: roles.includes('merchant') && merchant.data?.status === 'approved',
                isDriver: roles.includes('driver') && driver.data?.status === 'approved',
                isAdmin: roles.includes('admin'),
                hasPendingMerchant: merchant.data?.status === 'pending',
                hasPendingDriver: driver.data?.status === 'pending'
            }

            setUser(userWithRole)
            setIsAuthenticated(true)
        } catch (err) {
            console.error('Error refreshing profile:', err)
        } finally {
            isRefreshing.current = false // Reset guard
        }
    }

    // Switch active role
    const switchRole = async (newRole) => {
        if (!user) throw new Error('Not authenticated')

        // Validate user has this role
        if (!user.roles.includes(newRole)) {
            throw new Error(`User does not have role: ${newRole}`)
        }

        const { error } = await supabase
            .from('profiles')
            .update({ active_role: newRole })
            .eq('id', user.id)

        if (error) throw error

        // Refresh to get updated state
        await refreshProfile()
    }

    // Check if user has a specific role
    const hasRole = (roleName) => {
        return user?.roles?.includes(roleName) || false
    }

    useEffect(() => {
        // Initial check
        const initAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession()
                if (error) throw error

                if (session) {
                    await refreshProfile(session.user)
                }
            } catch (error) {
            } finally {
                setLoading(false)
            }
        }

        initAuth()

        // Listen for auth changes (skip INITIAL_SESSION as initAuth handles it)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            // Skip initial session - already handled by initAuth
            if (_event === 'INITIAL_SESSION') {
                return
            }

            if (session) {
                await refreshProfile(session.user)
            } else {
                setUser(null)
                setIsAuthenticated(false)
            }
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    // Login (using Phone/Password)
    const login = async (phone, password) => {
        const { data, error } = await authService.signInWithPhone(phone, password)
        if (error) throw error
        return data
    }

    // Register (using Phone/Password)
    const register = async (name, phone, password, role = 'customer', email = null) => {
        const { data, error } = await authService.signUpWithPhone(phone, password, {
            full_name: name,
            role: role
        }, email)
        if (error) throw error

        // Force logout so user can login manually (as requested)
        await authService.signOut()

        return data
    }

    // Logout
    const logout = async () => {
        const { error } = await authService.signOut()
        if (error) throw error
        // State updates handled by onAuthStateChange
    }

    // Shop Status (for merchant)
    const [isShopOpen, setIsShopOpen] = useState(false)

    const toggleShopStatus = async () => {
        if (!user?.merchantId) return

        const newStatus = !isShopOpen
        const { error } = await supabase
            .from('merchants')
            .update({ is_open: newStatus })
            .eq('id', user.merchantId)

        if (!error) {
            setIsShopOpen(newStatus)
        }
    }

    // Load merchant shop status
    useEffect(() => {
        const loadShopStatus = async () => {
            if (user?.merchantId) {
                const { data } = await supabase
                    .from('merchants')
                    .select('is_open')
                    .eq('id', user.merchantId)
                    .single()

                if (data) setIsShopOpen(data.is_open)
            }
        }
        loadShopStatus()
    }, [user?.merchantId])

    const value = {
        isAuthenticated,
        user,
        login,
        register,
        logout,
        loading,
        refreshProfile,
        // Multi-role
        switchRole,
        hasRole,
        // Shop status
        isShopOpen,
        toggleShopStatus
    }

    return (
        <AuthContext.Provider value={value}>
            {loading ? <PageLoader /> : children}
        </AuthContext.Provider>
    )
}

export default AuthContext
