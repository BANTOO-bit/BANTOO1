import { supabase } from './supabaseClient'
import logger from '../utils/logger'

/**
 * Merchant Service - Handle merchant and menu data from Supabase
 */
export const merchantService = {
    /**
     * Get all merchants
     * @param {Object} options - Query options
     * @param {string} options.category - Filter by category
     * @param {string} options.search - Search by name
     * @param {boolean} options.isOpen - Filter by open status
     */
    async getMerchants({ category = null, search = null, isOpen = null } = {}) {
        try {
            let query = supabase
                .from('merchants')
                .select(`
                    id, name, category, rating, rating_count, 
                    delivery_time, delivery_fee, distance, 
                    is_open, has_promo, image, address, phone,
                    created_at
                `)
                .eq('status', 'active')
                .order('rating', { ascending: false })

            if (category) {
                query = query.eq('category', category)
            }
            if (search) {
                query = query.ilike('name', `%${search}%`)
            }
            if (isOpen !== null) {
                query = query.eq('is_open', isOpen)
            }

            const { data, error } = await query

            if (error) throw error
            return data || []
        } catch (error) {
            logger.error('Failed to fetch merchants', error, 'merchantService')
            throw error
        }
    },

    /**
     * Get merchant by ID
     */
    async getMerchantById(id) {
        try {
            const { data, error } = await supabase
                .from('merchants')
                .select(`
                    id, name, category, rating, rating_count,
                    delivery_time, delivery_fee, distance,
                    is_open, has_promo, image, address, phone,
                    description, created_at
                `)
                .eq('id', id)
                .single()

            if (error) throw error
            return data
        } catch (error) {
            logger.error('Failed to fetch merchant by ID', error, 'merchantService')
            throw error
        }
    },

    /**
     * Get menus for a merchant
     */
    async getMenusByMerchantId(merchantId) {
        try {
            const { data, error } = await supabase
                .from('menu_items')
                .select(`
                    id, name, description, price, category,
                    is_popular, image, is_available,
                    merchant_id
                `)
                .eq('merchant_id', merchantId)
                .eq('is_available', true)
                .order('is_popular', { ascending: false })

            if (error) throw error

            // Get merchant info for the items
            const merchant = await this.getMerchantById(merchantId)
            return (data || []).map(item => ({
                ...item,
                merchantId: merchant?.id,
                merchantName: merchant?.name
            }))
        } catch (error) {
            logger.error('Failed to fetch menus', error, 'merchantService')
            throw error
        }
    },

    /**
     * Get all menus across all merchants (for search/popular)
     */
    async getAllMenus({ search = null, popular = false } = {}) {
        try {
            let query = supabase
                .from('menu_items')
                .select(`
                    id, name, description, price, category,
                    is_popular, image, is_available,
                    merchant_id,
                    merchants!inner(id, name, image, is_open)
                `)
                .eq('is_available', true)

            if (popular) {
                query = query.eq('is_popular', true)
            }
            if (search) {
                query = query.ilike('name', `%${search}%`)
            }

            const { data, error } = await query

            if (error) throw error
            return (data || []).map(item => ({
                ...item,
                merchantId: item.merchants?.id,
                merchantName: item.merchants?.name,
                merchantImage: item.merchants?.image
            }))
        } catch (error) {
            logger.error('Failed to fetch all menus', error, 'merchantService')
            throw error
        }
    },

    /**
     * Get popular menus (for homepage)
     */
    async getPopularMenus(limit = 5) {
        try {
            const menus = await this.getAllMenus({ popular: true })
            return menus.slice(0, limit)
        } catch (error) {
            logger.error('Failed to fetch popular menus', error, 'merchantService')
            return []
        }
    },

    /**
     * Get unique categories from merchants
     */
    async getCategories() {
        try {
            const { data, error } = await supabase
                .from('merchants')
                .select('category')
                .eq('status', 'active')

            if (error) throw error
            const categories = [...new Set((data || []).map(m => m.category))]
            return categories
        } catch (error) {
            logger.error('Failed to fetch categories', error, 'merchantService')
            throw error
        }
    },

    /**
     * Calculate delivery fee based on distance
     */
    async getDeliveryFee(merchantId, userLat, userLng) {
        try {
            // Try to get from backend
            const { data, error } = await supabase
                .rpc('calculate_delivery_fee', {
                    p_merchant_id: merchantId,
                    p_user_lat: userLat,
                    p_user_lng: userLng
                })

            if (error) throw error
            return data || 8000
        } catch {
            // Fallback: base fee + distance-based calculation
            // Base: Rp 5.000 + Rp 2.000 per km (estimated from merchant data)
            const merchant = await this.getMerchantById(merchantId)
            if (merchant?.distance) {
                const distanceKm = parseFloat(merchant.distance) || 1
                return Math.round(5000 + (distanceKm * 2000))
            }
            return 8000
        }
    },

    /**
     * Get merchants for verification (admin panel)
     */
    async getMerchantsForVerification(status = 'pending') {
        try {
            const { data, error } = await supabase
                .from('merchants')
                .select(`
                    *,
                    owner:profiles!owner_id(id, full_name, email, phone, avatar_url)
                `)
                .eq('status', status)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data || []
        } catch (error) {
            logger.error('Failed to fetch merchants for verification', error, 'merchantService')
            throw error
        }
    },

    /**
     * Get merchant for review (admin panel)
     */
    async getMerchantForReview(id) {
        try {
            const { data, error } = await supabase
                .from('merchants')
                .select(`
                    *,
                    owner:profiles!owner_id(id, full_name, email, phone, avatar_url)
                `)
                .eq('id', id)
                .single()

            if (error) throw error
            return data
        } catch (error) {
            logger.error('Failed to fetch merchant for review', error, 'merchantService')
            throw error
        }
    },

    /**
     * Approve merchant registration
     */
    async approveMerchant(merchantId, adminId) {
        try {
            const { data, error } = await supabase
                .from('merchants')
                .update({
                    status: 'approved',
                    approved_at: new Date().toISOString(),
                    approved_by: adminId
                })
                .eq('id', merchantId)
                .select()
                .single()

            if (error) throw error

            // Update the owner's profile role to 'merchant' so they can access merchant dashboard
            if (data?.owner_id) {
                await supabase
                    .from('profiles')
                    .update({
                        role: 'merchant',
                        active_role: 'merchant',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', data.owner_id)
            }

            logger.info(`Merchant ${merchantId} approved by admin ${adminId}`, 'merchantService')
            return data
        } catch (error) {
            logger.error('Failed to approve merchant', error, 'merchantService')
            throw error
        }
    },

    /**
     * Reject merchant registration
     */
    async rejectMerchant(merchantId, reason = '') {
        try {
            const { data, error } = await supabase
                .from('merchants')
                .update({
                    status: 'rejected',
                    rejected_at: new Date().toISOString(),
                    rejection_reason: reason
                })
                .eq('id', merchantId)
                .select()
                .single()

            if (error) throw error
            logger.info(`Merchant ${merchantId} rejected with reason: ${reason}`, 'merchantService')
            return data
        } catch (error) {
            logger.error('Failed to reject merchant', error, 'merchantService')
            throw error
        }
    }
}

export default merchantService

