import { supabase } from './supabaseClient'

// Helper to convert phone to dummy email
const phoneToEmail = (phone) => {
    // Remove non-digits
    let clean = phone.replace(/\D/g, '')

    // Normalize to 08 format (Indonesian standard)
    if (clean.startsWith('62')) {
        clean = '0' + clean.substring(2)
    } else if (clean.startsWith('8')) {
        clean = '0' + clean
    }

    // If user enters 0812..., store as 0812...@bantoo.app
    return `${clean}@bantoo.app`
}

export const authService = {
    // Sign Up with Phone (Pseudo-Email)
    async signUpWithPhone(phone, password, metadata = {}, email = null) {
        const dummyEmail = phoneToEmail(phone)
        const { data, error } = await supabase.auth.signUp({
            email: dummyEmail,
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

    // Sign In with Phone (Pseudo-Email) - for customer/merchant/driver
    async signInWithPhone(phone, password) {
        const email = phoneToEmail(phone)
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        return { data, error }
    },

    // Sign In with Email - for admin only
    async signInWithEmail(email, password) {
        // Admin uses real email stored as dummy phone email format
        // Try direct email first, then try phone-to-email format
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            // If direct email fails, the admin might have registered with phone
            // and email is stored in metadata. This fallback won't work for that case.
            return { data: null, error }
        }

        return { data, error: null }
    },

    // Sign Out
    async signOut() {
        const { error } = await supabase.auth.signOut()
        return { error }
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
    }
}
