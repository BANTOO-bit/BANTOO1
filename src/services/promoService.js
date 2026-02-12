import { supabase } from './supabaseClient'

/**
 * Promo Service - Handle promo codes and vouchers
 */
export const promoService = {
    /**
     * Validate a promo code
     */
    async validatePromo(code, orderTotal, merchantId = null) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        // Get promo
        const { data: promo, error } = await supabase
            .from('promos')
            .select('*')
            .eq('code', code.toUpperCase())
            .eq('is_active', true)
            .single()

        if (error || !promo) {
            return { valid: false, message: 'Kode promo tidak ditemukan' }
        }

        // Check validity period
        const now = new Date()
        if (promo.valid_from && new Date(promo.valid_from) > now) {
            return { valid: false, message: 'Promo belum berlaku' }
        }
        if (promo.valid_until && new Date(promo.valid_until) < now) {
            return { valid: false, message: 'Promo sudah berakhir' }
        }

        // Check merchant-specific promo
        if (promo.merchant_id && promo.merchant_id !== merchantId) {
            return { valid: false, message: 'Promo tidak berlaku untuk warung ini' }
        }

        // Check minimum order
        if (promo.min_order && orderTotal < promo.min_order) {
            return {
                valid: false,
                message: `Minimum pembelian Rp ${promo.min_order.toLocaleString('id-ID')}`
            }
        }

        // Check usage limit
        if (promo.usage_limit && promo.used_count >= promo.usage_limit) {
            return { valid: false, message: 'Kuota promo habis' }
        }

        // Check if user already used this promo
        const { data: usage } = await supabase
            .from('promo_usages')
            .select('id')
            .eq('promo_id', promo.id)
            .eq('user_id', user.id)
            .single()

        if (usage) {
            return { valid: false, message: 'Anda sudah pernah menggunakan promo ini' }
        }

        // Calculate discount
        let discount = 0
        if (promo.type === 'percentage') {
            discount = Math.floor(orderTotal * promo.value / 100)
            if (promo.max_discount) {
                discount = Math.min(discount, promo.max_discount)
            }
        } else {
            discount = promo.value
        }

        return {
            valid: true,
            promo: {
                id: promo.id,
                code: promo.code,
                name: promo.name,
                type: promo.type,
                value: promo.value,
                discount
            }
        }
    },

    /**
     * Get active promos (for display)
     */
    async getActivePromos() {
        const { data, error } = await supabase
            .from('promos')
            .select('*')
            .eq('is_active', true)
            .or('valid_until.is.null,valid_until.gt.now()')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    /**
     * Get all promos (admin)
     */
    async getAllPromos() {
        const { data, error } = await supabase
            .from('promos')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    /**
     * Create promo (admin)
     */
    async createPromo(promoData) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data, error } = await supabase
            .from('promos')
            .insert({
                ...promoData,
                code: promoData.code.toUpperCase(),
                created_by: user.id
            })
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * Update promo (admin)
     */
    async updatePromo(promoId, updates) {
        const { data, error } = await supabase
            .from('promos')
            .update(updates)
            .eq('id', promoId)
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * Deactivate promo (admin)
     */
    async deactivatePromo(promoId) {
        return this.updatePromo(promoId, { is_active: false })
    }
}

export default promoService
