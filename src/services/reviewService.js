import { supabase } from './supabaseClient'

/**
 * Review Service - Handle ratings and reviews
 */
export const reviewService = {
    /**
     * Create a review for completed order
     */
    async createReview({ orderId, merchantRating, driverRating, comment }) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        // Get order details
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('merchant_id, driver_id, status')
            .eq('id', orderId)
            .eq('customer_id', user.id)
            .single()

        if (orderError) throw orderError
        if (order.status !== 'completed') throw new Error('Can only review completed orders')

        const { data, error } = await supabase
            .from('reviews')
            .insert({
                order_id: orderId,
                customer_id: user.id,
                merchant_id: order.merchant_id,
                driver_id: order.driver_id,
                merchant_rating: merchantRating,
                driver_rating: driverRating,
                comment
            })
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * Get reviews for a merchant
     */
    async getMerchantReviews(merchantId, limit = 20, offset = 0) {
        const { data, error } = await supabase
            .from('reviews')
            .select(`
                *,
                customer:profiles!customer_id(id, full_name, avatar_url)
            `)
            .eq('merchant_id', merchantId)
            .not('merchant_rating', 'is', null)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

        if (error) throw error
        return data
    },

    /**
     * Get reviews for a driver
     */
    async getDriverReviews(driverId, limit = 20, offset = 0) {
        const { data, error } = await supabase
            .from('reviews')
            .select(`
                *,
                customer:profiles!customer_id(id, full_name, avatar_url)
            `)
            .eq('driver_id', driverId)
            .not('driver_rating', 'is', null)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

        if (error) throw error
        return data
    },

    /**
     * Reply to a review (for merchants)
     */
    async replyToReview(reviewId, reply) {
        const { data, error } = await supabase
            .from('reviews')
            .update({
                merchant_reply: reply,
                replied_at: new Date().toISOString()
            })
            .eq('id', reviewId)
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * Check if user has reviewed an order
     */
    async hasReviewed(orderId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return false

        const { data, error } = await supabase
            .from('reviews')
            .select('id')
            .eq('order_id', orderId)
            .eq('customer_id', user.id)
            .single()

        return !error && !!data
    }
}

export default reviewService
