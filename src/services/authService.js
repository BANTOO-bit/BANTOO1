import { supabase } from './supabaseClient'

// We no longer use dummy emails. All users register with real emails.

export const authService = {
    // Sign Up with Email & Phone
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

    // Sign In with Phone
    async signInWithPhone(phone, password) {
        try {
            // First lookup the user's email using their phone number from the profiles table
            // This assumes phone numbers are unique in the profiles table
            const { data: profile, error: lookupError } = await supabase
                .from('profiles')
                .select('email')
                .eq('phone', phone)
                .maybeSingle()

            if (lookupError || !profile || !profile.email) {
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

    // Sign In with Email - for admin only
    async signInWithEmail(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        return { data, error }
    },

    // Sign Out
    async signOut() {
        const { error } = await supabase.auth.signOut()
        return { error }
    },

    // Lookup email by phone (helper for forgot password)
    async getEmailByPhone(phone) {
        const { data, error } = await supabase
            .from('profiles')
            .select('email')
            .eq('phone', phone)
            .maybeSingle()

        return { email: data?.email, error }
    },

    // Send Password Reset Email
    async resetPasswordForEmail(email) {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        })
        return { data, error }
    },

    // Get Current Session
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
    }
}
