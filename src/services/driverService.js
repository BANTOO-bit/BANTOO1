import { supabase } from './supabaseClient'

export const driverService = {
    /**
     * Get available orders nearby
     * @param {Object} location - { lat, lng }
     * @param {number} radius - Radius in km (default 10)
     */
    async getAvailableOrders({ lat, lng }, radius = 10) {
        try {
            // Try RCP first (Optimized for Radius)
            const { data, error } = await supabase.rpc('get_available_orders', {
                p_lat: lat,
                p_lng: lng,
                p_radius_km: radius
            })

            if (!error) return data

            console.warn('RPC "get_available_orders" failed, falling back to standard query:', error.message)

            // Fallback: Standard Query (No Radius Filter, just status)
            // This ensures drivers see orders even if GIS functions are missing
            const { data: fallbackData, error: fallbackError } = await supabase
                .from('orders')
                .select(`
                    id, 
                    total_amount, 
                    payment_method, 
                    created_at,
                    merchants (
                        name, 
                        address, 
                        latitude, 
                        longitude
                    ),
                    delivery_address
                `)
                .eq('status', 'ready')
                .is('driver_id', null)
                .order('created_at', { ascending: false })

            if (fallbackError) throw fallbackError

            // Map standard query result to match RPC output format
            return fallbackData.map(o => {
                // approximate distance calc (Haversine)
                let distance = null
                if (lat && lng && o.merchants?.latitude && o.merchants?.longitude) {
                    const R = 6371 // km
                    const dLat = (o.merchants.latitude - lat) * Math.PI / 180
                    const dLon = (o.merchants.longitude - lng) * Math.PI / 180
                    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                        Math.cos(lat * Math.PI / 180) * Math.cos(o.merchants.latitude * Math.PI / 180) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2)
                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
                    distance = R * c
                }

                return {
                    id: o.id,
                    merchant_name: o.merchants?.name,
                    merchant_address: o.merchants?.address,
                    customer_address: o.delivery_address,
                    distance_to_merchant: distance,
                    total_amount: o.total_amount,
                    payment_method: o.payment_method,
                    created_at: o.created_at,
                    merchant_lat: o.merchants?.latitude,
                    merchant_lng: o.merchants?.longitude
                }
            })

        } catch (error) {
            console.error('Error fetching available orders:', error)
            return [] // Return empty array instead of throwing to prevent UI crash
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

            // First try to get from drivers table
            const { data, error } = await supabase
                .from('drivers')
                .select(`
                    *,
                    profile:user_id (full_name, avatar_url, phone, email)
                `)
                .eq('user_id', user.id)
                .single()

            if (error || !data) {
                // Fallback: If not in drivers table yet, get basic profile
                const { data: basicProfile } = await supabase
                    .from('profiles')
                    .select('full_name, avatar_url, phone, email')
                    .eq('id', user.id)
                    .single()

                if (basicProfile) {
                    return {
                        id: 'guest-driver',
                        user_id: user.id,
                        status: 'pending',
                        is_active: false,
                        full_name: basicProfile.full_name, // Map for easier access
                        avatar_url: basicProfile.avatar_url,
                        profile: basicProfile
                    }
                }
                return null
            }

            // Flatten handy properties
            return {
                ...data,
                full_name: data.profile?.full_name,
                avatar_url: data.profile?.avatar_url,
                email: data.profile?.email
            }
        } catch (error) {
            console.error('Error fetching driver profile:', error)
            return null
        }
    },

    async getActiveOrder() {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return null

            // Use standard query instead of RPC 'get_driver_active_order' which is missing
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    id,
                    merchant_id,
                    total_amount,
                    payment_method,
                    status,
                    created_at,
                    delivery_address,
                    latitude,
                    longitude,
                    notes,
                    merchants (
                        name,
                        address,
                        latitude,
                        longitude
                    ),
                    profiles!orders_customer_id_fkey (
                        full_name,
                        phone
                    ),
                    order_items (
                        product_name,
                        quantity,
                        notes
                    )
                `)
                .eq('driver_id', user.id)
                .in('status', ['pickup', 'picked_up', 'delivering'])
                .single()

            if (error) {
                if (error.code === 'PGRST116') {
                    // No rows found - this is expected if no active order
                    return null
                }
                throw error
            }

            // Transform to flat structure expected by UI (if needed) or keep as is
            // The UI expects flattened properties like merchant_name.
            // Let's flatten it here to match the component's expectation if it was using RPC return format
            if (data) {
                return {
                    id: data.id,
                    merchant_name: data.merchants?.name,
                    merchant_address: data.merchants?.address,
                    customer_address: data.delivery_address,
                    total_amount: data.total_amount,
                    payment_method: data.payment_method,
                    status: data.status,
                    created_at: data.created_at,
                    merchant_lat: data.merchants?.latitude,
                    merchant_lng: data.merchants?.longitude,
                    customer_lat: data.latitude,
                    customer_lng: data.longitude,
                    customer_name: data.profiles?.full_name || 'Customer',
                    customer_note: data.notes,
                    items: data.order_items?.map(i => ({
                        name: i.product_name,
                        quantity: i.quantity,
                        notes: i.notes
                    }))
                }
            }

            return null
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
    /**
     * Update driver profile
     */
    async updateDriver(userId, updates) {
        try {
            const { data, error } = await supabase
                .from('drivers')
                .update(updates)
                .eq('user_id', userId)
                .select()
                .single()

            if (error) throw error
            return data
        } catch (error) {
            console.error('Error updating driver:', error)
            throw error
        }
    },

    /**
     * Get Driver Bank Details
     */
    async getBankDetails() {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return null

            const { data, error } = await supabase
                .from('drivers')
                .select('bank_name, bank_account_number, bank_account_name')
                .eq('user_id', user.id)
                .single()

            if (error) throw error
            return data
        } catch (error) {
            console.error('Error fetching bank details:', error)
            return null
        }
    }
}

export default driverService
