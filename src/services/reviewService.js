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
    },
    /**
     * Get driver's average rating and count
     */
    async getDriverRating(driverId) {
        const { data, error } = await supabase
            .from('reviews')
            .select('driver_rating')
            .eq('driver_id', driverId)
            .not('driver_rating', 'is', null)

        if (error) throw error

        if (!data || data.length === 0) {
            return {
                averageRating: 0,
                totalReviews: 0,
                distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
            }
        }

        const totalReviews = data.length
        const sumRating = data.reduce((sum, review) => sum + review.driver_rating, 0)
        const averageRating = Number((sumRating / totalReviews).toFixed(1))

        const distribution = data.reduce((dist, review) => {
            const rating = Math.round(review.driver_rating)
            dist[rating] = (dist[rating] || 0) + 1
            return dist
        }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 })

        return {
            averageRating,
            totalReviews,
            distribution
        }
    },

    /**
     * Get merchant's average rating and count
     */
    async getMerchantRating(merchantId) {
        const { data, error } = await supabase
            .from('reviews')
            .select('merchant_rating')
            .eq('merchant_id', merchantId)
            .not('merchant_rating', 'is', null)

        if (error) throw error

        if (!data || data.length === 0) {
            return {
                averageRating: 0,
                totalReviews: 0,
                distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
            }
        }

        const totalReviews = data.length
        const sumRating = data.reduce((sum, review) => sum + review.merchant_rating, 0)
        const averageRating = Number((sumRating / totalReviews).toFixed(1))

        const distribution = data.reduce((dist, review) => {
            const rating = Math.round(review.merchant_rating)
            dist[rating] = (dist[rating] || 0) + 1
            return dist
        }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 })

        return {
            averageRating,
            totalReviews,
            distribution
        }
    }
}

export default reviewService
