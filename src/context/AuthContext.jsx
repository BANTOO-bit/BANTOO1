import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { authService } from '../services/authService'
import { supabase } from '../services/supabaseClient'
import { pushNotificationService } from '../services/pushNotificationService'
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
    const pushCleanupRef = useRef(null) // Push notification cleanup

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

            // Start fetching all data in parallel
            const [profile, userRoles, merchant, driver, wallet] = await Promise.all([
                safeFetch(supabase.from('profiles').select('full_name, phone, avatar_url, active_role, role').eq('id', userId).maybeSingle(), 'profile'),
                safeFetch(supabase.from('user_roles').select('role').eq('user_id', userId), 'user_roles'),
                safeFetch(supabase.from('merchants').select('id, name, status').eq('owner_id', userId).maybeSingle(), 'merchant'),
                safeFetch(supabase.from('drivers').select('id, status').eq('user_id', userId).maybeSingle(), 'driver'),
                safeFetch(supabase.from('wallets').select('balance').eq('user_id', userId).maybeSingle(), 'wallet')
            ])

            // Provide fallback if user_roles fails but prevent critical errors
            if (userRoles.error) {
                // Only warn if it's not a 404 (table missing is a known issue in some envs)
                if (userRoles.error.code !== '404' && !userRoles.error.message?.includes('404')) {
                    console.warn('Warning: Error fetching user roles.', userRoles.error)
                }
            }

            // Extract roles array from user_roles or derive from partner tables
            let roles = userRoles.data?.map(r => r.role) || []

            // If user_roles table is missing or empty, try to derive from direct tables
            if (roles.length === 0) {
                roles.push('customer') // Everyone is a customer
                if (driver.data) roles.push('driver')
                if (merchant.data) roles.push('merchant')
                // Check profiles.role for admin (admin role is stored in profiles table)
                if (profile.data?.role === 'admin') roles.push('admin')
            }

            // Deduplicate just in case
            roles = [...new Set(roles)]

            // Critical check: if profile fetch failed but roles exist, try to use existing profile or default
            // Priority:
            // 1. Valid Active Role from DB (if user has permission for it)
            // 2. Saved Active Role from LocalStorage (if valid)
            // 3. Fallback based on available roles (Merchant > Driver > Customer)

            let determinedRole = profile.data?.active_role
            const savedRole = localStorage.getItem('user_last_active_role')

            // Validate DB role against actual permissions
            if (determinedRole && !roles.includes(determinedRole)) {
                determinedRole = null // DB role is invalid (e.g. role revoked)
            }

            // If DB role is empty/invalid, try localStorage
            if (!determinedRole && savedRole && roles.includes(savedRole)) {
                determinedRole = savedRole
            }

            // Fallback logic — Admin takes highest priority and is locked
            const activeRole = determinedRole || (
                roles.includes('admin') ? 'admin' :
                    roles.includes('merchant') ? 'merchant' :
                        roles.includes('driver') ? 'driver' : 'customer'
            )

            // Persist the final determined role to localStorage to keep it fresh
            localStorage.setItem('user_last_active_role', activeRole)

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

            // #6: Auto-subscribe to push notifications on login
            if (!pushCleanupRef.current) {
                pushNotificationService.requestPermission().then(granted => {
                    if (granted) {
                        pushCleanupRef.current = pushNotificationService.subscribeToNotifications(userId)
                    }
                })
            }
        } catch (err) {
            console.error('Error refreshing profile:', err)
        } finally {
            isRefreshing.current = false // Reset guard
        }
    }

    // Switch active role
    const switchRole = async (newRole) => {
        if (!user) throw new Error('Not authenticated')

        // Admin role is locked — cannot switch to any other role
        if (user.roles.includes('admin')) {
            throw new Error('Admin role is locked. Cannot switch roles.')
        }

        // Validate user has this role
        if (!user.roles.includes(newRole)) {
            throw new Error(`User does not have role: ${newRole}`)
        }

        // 1. Optimistic update (Fast UX)
        localStorage.setItem('user_last_active_role', newRole)

        // 2. Update DB
        const { error } = await supabase
            .from('profiles')
            .update({ active_role: newRole })
            .eq('id', user.id)

        if (error) throw error

        // 3. Refresh to get updated state (and sync Context)
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

    // L-1.3: Periodic role refresh (every 5 minutes)
    // Keeps role/profile data fresh if changed from admin panel or another device
    useEffect(() => {
        if (!user?.id) return

        const interval = setInterval(() => {
            refreshProfile()
        }, 5 * 60 * 1000) // 5 minutes

        return () => clearInterval(interval)
    }, [user?.id])

    // L-1.2: Realtime profile changes (multi-device awareness)
    // Detects when profile is updated from another device or by admin (e.g. suspension)
    useEffect(() => {
        if (!user?.id) return

        const channel = supabase
            .channel(`profile-sync-${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'profiles',
                    filter: `id=eq.${user.id}`
                },
                async (payload) => {
                    const updated = payload.new
                    // If account was terminated/suspended, force logout
                    if (updated.status === 'terminated' || updated.status === 'suspended') {
                        await logout()
                        return
                    }
                    // Otherwise refresh profile to sync role changes
                    await refreshProfile()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user?.id])

    // Fix #3: Client-side rate limiting for auth actions
    const authAttemptsRef = useRef({ count: 0, firstAttempt: null })
    const AUTH_MAX_ATTEMPTS = 5
    const AUTH_WINDOW_MS = 5 * 60 * 1000 // 5 minutes

    const checkRateLimit = () => {
        const now = Date.now()
        const tracker = authAttemptsRef.current
        // Reset window if expired
        if (tracker.firstAttempt && (now - tracker.firstAttempt) > AUTH_WINDOW_MS) {
            authAttemptsRef.current = { count: 0, firstAttempt: null }
        }
        if (authAttemptsRef.current.count >= AUTH_MAX_ATTEMPTS) {
            const remainingSec = Math.ceil((AUTH_WINDOW_MS - (now - authAttemptsRef.current.firstAttempt)) / 1000)
            throw new Error(`Terlalu banyak percobaan. Coba lagi dalam ${remainingSec} detik.`)
        }
        if (!authAttemptsRef.current.firstAttempt) {
            authAttemptsRef.current.firstAttempt = now
        }
        authAttemptsRef.current.count++
    }

    // Login (using Phone/Password)
    const login = async (phone, password) => {
        checkRateLimit()
        const { data, error } = await authService.signInWithPhone(phone, password)
        if (error) throw error
        // Reset on success
        authAttemptsRef.current = { count: 0, firstAttempt: null }
        return data
    }

    // Register (using Phone/Password)
    const register = async (name, phone, password, role = 'customer', email = null) => {
        checkRateLimit()
        const { data, error } = await authService.signUpWithPhone(phone, password, {
            full_name: name,
            role: role
        }, email)
        if (error) throw error

        // Reset on success
        authAttemptsRef.current = { count: 0, firstAttempt: null }

        // Force logout so user can login manually (as requested)
        await authService.signOut()

        return data
    }

    // Logout
    const logout = async () => {
        const isAdmin = user?.roles?.includes('admin')

        // Reset role before sign out (admin stays admin, others reset to customer)
        if (user?.id) {
            try {
                await supabase.from('profiles')
                    .update({ active_role: isAdmin ? 'admin' : 'customer' })
                    .eq('id', user.id)
            } catch (e) {
                console.warn('Failed to reset active_role on logout:', e)
            }
        }
        localStorage.removeItem('user_last_active_role')

        // H-1.1: Clear cart data on logout to prevent stale items
        localStorage.removeItem('bantoo_cart')
        localStorage.removeItem('bantoo_cart_merchant')
        localStorage.removeItem('bantoo_merchant_notes')

        // #6: Cleanup push notification subscription on logout
        if (pushCleanupRef.current) {
            pushCleanupRef.current()
            pushCleanupRef.current = null
        }

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
