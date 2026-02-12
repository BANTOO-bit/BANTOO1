import { supabase } from './supabaseClient'

/**
 * Address Service - Sync addresses with database
 */
export const addressService = {
    /**
     * Get all addresses for current user
     */
    async getAddresses() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data, error } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', user.id)
            .order('is_default', { ascending: false })
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    /**
     * Get default address
     */
    async getDefaultAddress() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data, error } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_default', true)
            .single()

        if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows
        return data
    },

    /**
     * Add new address
     */
    async addAddress(addressData) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        // If this is set as default, unset other defaults first
        if (addressData.isDefault) {
            await supabase
                .from('addresses')
                .update({ is_default: false })
                .eq('user_id', user.id)
        }

        const { data, error } = await supabase
            .from('addresses')
            .insert({
                user_id: user.id,
                label: addressData.label || 'Rumah',
                recipient_name: addressData.recipientName || addressData.name,
                phone: addressData.phone,
                address: addressData.address,
                detail: addressData.detail,
                latitude: addressData.latitude || addressData.lat,
                longitude: addressData.longitude || addressData.lng,
                is_default: addressData.isDefault || false
            })
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * Update address
     */
    async updateAddress(addressId, updates) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        // If setting as default, unset others
        if (updates.isDefault) {
            await supabase
                .from('addresses')
                .update({ is_default: false })
                .eq('user_id', user.id)
        }

        const { data, error } = await supabase
            .from('addresses')
            .update({
                label: updates.label,
                recipient_name: updates.recipientName || updates.name,
                phone: updates.phone,
                address: updates.address,
                detail: updates.detail,
                latitude: updates.latitude || updates.lat,
                longitude: updates.longitude || updates.lng,
                is_default: updates.isDefault
            })
            .eq('id', addressId)
            .eq('user_id', user.id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * Delete address
     */
    async deleteAddress(addressId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { error } = await supabase
            .from('addresses')
            .delete()
            .eq('id', addressId)
            .eq('user_id', user.id)

        if (error) throw error

        // If deleted address was default, set first remaining as default
        const { data: remaining } = await supabase
            .from('addresses')
            .select('id')
            .eq('user_id', user.id)
            .limit(1)
            .single()

        if (remaining) {
            await this.setDefault(remaining.id)
        }

        return true
    },

    /**
     * Set address as default
     */
    async setDefault(addressId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        // Unset all defaults
        await supabase
            .from('addresses')
            .update({ is_default: false })
            .eq('user_id', user.id)

        // Set new default
        const { data, error } = await supabase
            .from('addresses')
            .update({ is_default: true })
            .eq('id', addressId)
            .eq('user_id', user.id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * Sync local addresses to database (migration helper)
     */
    async syncFromLocal(localAddresses) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        for (const addr of localAddresses) {
            await this.addAddress({
                label: addr.label,
                recipientName: addr.name,
                phone: addr.phone,
                address: addr.address,
                detail: addr.detail,
                isDefault: addr.isDefault
            })
        }

        return this.getAddresses()
    }
}

export default addressService
