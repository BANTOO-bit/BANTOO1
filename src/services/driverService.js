import { supabase } from './supabaseClient'

export const driverService = {
    /**
     * Get available orders nearby
     * @param {Object} location - { lat, lng }
     * @param {number} radius - Radius in km (default 10)
     */
    async getAvailableOrders({ lat, lng }, radius = 10) {
        try {
            const { data, error } = await supabase.rpc('get_available_orders', {
                p_lat: lat,
                p_lng: lng,
                p_radius_km: radius
            })

            if (error) throw error
            return data
        } catch (error) {
            console.error('Error fetching available orders:', error)
            throw error
        }
    },

    /**
     * Accept an order
     * @param {string} orderId 
     */
    async acceptOrder(orderId) {
        try {
            const { data, error } = await supabase.rpc('driver_accept_order', {
                p_order_id: orderId
            })

            if (error) throw error
            if (!data.success) throw new Error(data.message)

            return data
        } catch (error) {
            console.error('Error accepting order:', error)
            throw error
        }
    },

    /**
     * Update order status (pickup, delivering, delivered)
     * @param {string} orderId 
     * @param {string} status 
     */
    async updateOrderStatus(orderId, status) {
        try {
            const { data, error } = await supabase.rpc('driver_update_order_status', {
                p_order_id: orderId,
                p_status: status
            })

            if (error) throw error
            if (!data.success) throw new Error(data.message)

            return data
        } catch (error) {
            console.error('Error updating status:', error)
            throw error
        }
    },

    /**
     * Update driver location (Heartbeat)
     * @param {number} lat 
     * @param {number} lng 
     */
    async updateLocation(lat, lng) {
        try {
            const { error } = await supabase.rpc('update_driver_location', {
                p_lat: lat,
                p_lng: lng
            })
            if (error) throw error
        } catch (error) {
            // Suppress log for frequent updates to avoid console spam
            // console.error('Location update failed:', error) 
        }
    },

    /**
     * Toggle Online/Offline status
     * @param {boolean} isActive 
     */
    async toggleStatus(isActive) {
        try {
            const { error } = await supabase.rpc('toggle_driver_status', {
                p_is_active: isActive
            })
            if (error) throw error
        } catch (error) {
            console.error('Error toggling status:', error)
            throw error
        }
    },

    /**
     * Get Driver Profile
     */
    async getProfile() {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return null

            const { data, error } = await supabase
                .from('drivers')
                .select(`
                    *,
                    profile:user_id (full_name, avatar_url, phone)
                `)
                .eq('user_id', user.id)
                .single()

            if (error) throw error
            return data
        } catch (error) {
            console.error('Error fetching driver profile:', error)
            return null
        }
    },

    async getActiveOrder() {
        try {
            const { data, error } = await supabase.rpc('get_driver_active_order')
            if (error) throw error
            // RPC returns an array (table), we expect 0 or 1
            return data && data.length > 0 ? data[0] : null
        } catch (error) {
            console.error('Error getting active order:', error)
            return null
        }
    },

    /**
     * Get drivers for verification (Admin)
     * @param {string} status - 'pending', 'approved', 'rejected'
     */
    async getDriversForVerification(status = 'pending') {
        try {
            let query = supabase
                .from('drivers')
                .select(`
                    *,
                    profile:user_id (full_name, avatar_url, phone, email)
                `)
                .order('created_at', { ascending: false })

            if (status) {
                query = query.eq('status', status)
            }

            const { data, error } = await query

            if (error) throw error
            return data
        } catch (error) {
            console.error('Error fetching drivers for verification:', error)
            throw error
        }
    },

    /**
     * Get specific driver for review (Admin)
     * @param {string} driverId 
     */
    async getDriverForReview(driverId) {
        try {
            const { data, error } = await supabase
                .from('drivers')
                .select(`
                    *,
                    profile:user_id (full_name, avatar_url, phone, email)
                `)
                .eq('id', driverId)
                .single()

            if (error) throw error
            return data
        } catch (error) {
            console.error('Error fetching driver for review:', error)
            throw error
        }
    },

    /**
     * Approve driver application
     * @param {string} driverId 
     * @param {string} adminId 
     */
    async approveDriver(driverId, adminId) {
        try {
            const { data, error } = await supabase
                .from('drivers')
                .update({
                    status: 'approved',
                    is_active: false, // Default to offline initially
                    approved_at: new Date().toISOString(),
                    approved_by: adminId
                })
                .eq('id', driverId)
                .select()
                .single()

            if (error) throw error

            // Also update the profile role/active_role if needed
            // But usually we just rely on the driver record existing.
            // Let's ensure the user has 'driver' in their roles list if we store roles in profile
            // For this schema, we seem to rely on separate tables.

            return data
        } catch (error) {
            console.error('Error approving driver:', error)
            throw error
        }
    },

    /**
     * Reject driver application
     * @param {string} driverId 
     * @param {string} reason 
     */
    async rejectDriver(driverId, reason) {
        try {
            const { data, error } = await supabase
                .from('drivers')
                .update({
                    status: 'rejected',
                    rejection_reason: reason,
                    rejected_at: new Date().toISOString()
                })
                .eq('id', driverId)
                .select()
                .single()

            if (error) throw error
            return data
        } catch (error) {
            console.error('Error rejecting driver:', error)
            throw error
        }
    },

    /**
     * Get Dashboard Stats (Simple Version)
     */
    async getStats() {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return null

            // Example: Get today's completed orders
            // This is a placeholder, a real RPC would be better for performance
            const today = new Date().toISOString().split('T')[0]

            const { count, error } = await supabase
                .from('orders')
                .select('id', { count: 'exact', head: true })
                .eq('driver_id', user.id)
                .eq('status', 'delivered')
                .gte('delivered_at', today)

            if (error) throw error

            return {
                todayOrders: count || 0,
                // Revenue calculation requires more complex query or RPC
                todayRevenue: 0
            }
        } catch (error) {
            return { todayOrders: 0, todayRevenue: 0 }
        }
    }
}

export default driverService
