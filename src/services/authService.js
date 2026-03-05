import { supabase } from './supabaseClient'

/**
 * @typedef {import('../types').ServiceResponse} ServiceResponse
 * @typedef {import('../types').Profile} Profile
 * @typedef {import('../types').UserRole} UserRole
 */

// We no longer use dummy emails. All users register with real emails.

export const authService = {
    /**
     * Sign Up with Email & Phone
     * @param {string} phone 
     * @param {string} password 
     * @param {Object} [metadata={}] 
     * @param {string} email 
     * @returns {Promise<ServiceResponse<any>>}
     */
    async signUpWithPhone(phone, password, metadata = {}, email) {
        if (!email) {
            return { data: null, error: new Error('Email is required for registration') }
        }

        const { data, error } = await supabase.auth.signUp({
            email: email,
            password,
            options: {
                data: {
                    ...metadata,
                    phone_number: phone, // Store original phone in metadata
                    email: email // Store real email in metadata (optional)
                },
            },
        })
        return { data, error }
    },

    /**
     * Sign In with Phone
     * @param {string} phone 
     * @param {string} password 
     * @returns {Promise<ServiceResponse<any>>}
     */
    async signInWithPhone(phone, password) {
        try {
            // Normalize phone: strip spaces, leading 0, leading 62, leading +62
            let normalized = phone.replace(/[\s\-]/g, '')
            if (normalized.startsWith('+62')) normalized = normalized.substring(3)
            else if (normalized.startsWith('62')) normalized = normalized.substring(2)
            else if (normalized.startsWith('0')) normalized = normalized.substring(1)

            // Try multiple phone formats stored in DB: raw, 0-prefix, 62-prefix
            const phoneCandidates = [normalized, `0${normalized}`, `62${normalized}`, `+62${normalized}`]

            let profile = null
            for (const candidate of phoneCandidates) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('email')
                    .eq('phone', candidate)
                    .maybeSingle()
                if (!error && data?.email) {
                    profile = data
                    break
                }
            }

            if (!profile || !profile.email) {
                return { data: null, error: new Error('Phone number not found or invalid credentials.') }
            }

            // Now sign in with the retrieved email
            const { data, error } = await supabase.auth.signInWithPassword({
                email: profile.email,
                password,
            })
            return { data, error }
        } catch (err) {
            return { data: null, error: err }
        }
    },

    /**
     * Sign In with Email - for admin only
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<ServiceResponse<any>>}
     */
    async signInWithEmail(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        return { data, error }
    },

    /**
     * Sign Out
     * @returns {Promise<ServiceResponse<null>>}
     */
    async signOut() {
        const { error } = await supabase.auth.signOut()
        return { error }
    },

    /**
     * Lookup email by phone (helper for forgot password)
     * @param {string} phone 
     * @returns {Promise<{email: string|null, error: any}>}
     */
    async getEmailByPhone(phone) {
        // Normalize phone format
        let normalized = phone.replace(/[\s\-]/g, '')
        if (normalized.startsWith('+62')) normalized = normalized.substring(3)
        else if (normalized.startsWith('62')) normalized = normalized.substring(2)
        else if (normalized.startsWith('0')) normalized = normalized.substring(1)

        const phoneCandidates = [normalized, `0${normalized}`, `62${normalized}`, `+62${normalized}`]

        for (const candidate of phoneCandidates) {
            const { data, error } = await supabase
                .from('profiles')
                .select('email')
                .eq('phone', candidate)
                .maybeSingle()
            if (!error && data?.email) {
                return { email: data.email, error: null }
            }
        }

        return { email: null, error: new Error('Phone not found') }
    },

    /**
     * Send Password Reset Email
     * @param {string} email 
     * @returns {Promise<ServiceResponse<any>>}
     */
    async resetPasswordForEmail(email) {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        })
        return { data, error }
    },

    /**
     * Get Current Session
     * @returns {Promise<ServiceResponse<any>>}
     */
    async getSession() {
        const { data, error } = await supabase.auth.getSession()
        return { data, error }
    },

    // Get Current User
    async getCurrentUser() {
        const { data: { user } } = await supabase.auth.getUser()
        return user
    },

    // Update Profile
    async updateProfile(updates) {
        const { data, error } = await supabase.auth.updateUser({
            data: updates
        })
        return { data, error }
    },

    // Update Password
    async updatePassword(newPassword) {
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword
        })
        return { data, error }
    },

    /**
     * Get current auth user
     * @returns {Promise<{data: {user: import('@supabase/supabase-js').User|null}, error: any}>}
     */
    async getUser() {
        return supabase.auth.getUser()
    },

    /**
     * Listen for auth state changes
     * @param {function(string, import('@supabase/supabase-js').Session|null): void} callback 
     * @returns {{data: {subscription: {unsubscribe: function(): void}}}}
     */
    onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange(callback)
    },

    /**
     * Refresh full user profile with roles, partner statuses, wallet
     * Extracted from AuthContext.refreshProfile()
     * @param {string} userId
     * @returns {Promise<Object>}
     */
    async refreshUserProfile(userId) {
        const safeFetch = async (promise) => {
            let timeoutId
            const timeout = new Promise(resolve => {
                timeoutId = setTimeout(() => {
                    resolve({ data: null, error: { message: 'Timeout' } })
                }, 15000)
            })
            try {
                const result = await Promise.race([promise, timeout])
                clearTimeout(timeoutId)
                return result
            } catch (e) {
                clearTimeout(timeoutId)
                return { data: null, error: e }
            }
        }

        const [profile, userRoles, merchant, driver, wallet] = await Promise.all([
            safeFetch(supabase.from('profiles').select('full_name, phone, avatar_url, active_role, role').eq('id', userId).maybeSingle()),
            safeFetch(supabase.from('user_roles').select('role').eq('user_id', userId)),
            safeFetch(supabase.from('merchants').select('id, name, status').eq('owner_id', userId).maybeSingle()),
            safeFetch(supabase.from('drivers').select('id, status').eq('user_id', userId).maybeSingle()),
            safeFetch(supabase.from('wallets').select('balance').eq('user_id', userId).maybeSingle())
        ])

        return { profile, userRoles, merchant, driver, wallet }
    },

    /**
     * Update user's active role in profiles table
     * @param {string} userId 
     * @param {UserRole} role 
     * @returns {Promise<void>}
     */
    async updateActiveRole(userId, role) {
        // Prevent admin from switching to non-admin roles
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .maybeSingle()
        if (profile?.role === 'admin' && role !== 'admin') {
            throw new Error('Admin role is locked. Cannot switch to non-admin role.')
        }

        const { error } = await supabase
            .from('profiles')
            .update({ active_role: role })
            .eq('id', userId)
        if (error) throw error
    },

    /**
     * Reset active role on logout
     * @param {string} userId 
     * @param {boolean} isAdmin 
     * @returns {Promise<{error: any}>}
     */
    async resetRoleOnLogout(userId, isAdmin) {
        const { error } = await supabase
            .from('profiles')
            .update({ active_role: isAdmin ? 'admin' : 'customer' })
            .eq('id', userId)
        return { error }
    },

    /**
     * Set driver offline (used during role switch)
     * @param {string} userId 
     * @returns {Promise<{error: any}>}
     */
    async setDriverOffline(userId) {
        const { error } = await supabase
            .from('drivers')
            .update({ is_active: false })
            .eq('user_id', userId)
        return { error }
    },

    /**
     * Subscribe to profile realtime changes
     * @param {string} userId 
     * @param {function(any): void} callback 
     * @returns {import('@supabase/supabase-js').RealtimeChannel}
     */
    subscribeToProfileChanges(userId, callback) {
        const channel = supabase
            .channel(`profile-sync-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'profiles',
                    filter: `id=eq.${userId}`
                },
                callback
            )
            .subscribe()

        return () => supabase.removeChannel(channel)
    },

    /**
     * Insert a driver record (partner registration)
     */
    async insertDriverRecord(record) {
        const { error } = await supabase.from('drivers').insert(record)
        return { error }
    },

    /**
     * Insert a merchant record (partner registration)
     */
    async insertMerchantRecord(record) {
        const { error } = await supabase.from('merchants').insert(record)
        return { error }
    },

    /**
     * Update profile data (name, phone, etc.)
     */
    async updateProfileData(userId, updates) {
        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
        return { error }
    }
}
