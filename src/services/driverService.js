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
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // 1. Try RPC First
            const { error } = await supabase.rpc('toggle_driver_status', {
                p_is_active: isActive
            })

            if (!error) return

            console.warn('RPC toggle_driver_status failed, falling back to direct update:', error.message)

            // 2. Fallback: Direct Update
            const { error: updateError } = await supabase
                .from('drivers')
                .update({ is_active: isActive })
                .eq('user_id', user.id)

            if (updateError) throw updateError

        } catch (error) {
            console.error('Failed to toggle driver status:', error)
            // Don't throw, just log. The UI optimistically updates anyway.
        }
    },

    /**
     * Get real-time notifications for driver
     * Simulates notifications by checking for available orders and system status
     */
    async getNotifications(driverId) {
        try {
            // 1. Get available orders (Type: 'order')
            const availableOrders = await this.getAvailableOrders({ lat: 0, lng: 0 }) // Coordinates optional for list

            const orderNotifications = availableOrders.map(order => ({
                id: `order-${order.id}`,
                type: 'order',
                icon: 'local_shipping',
                title: 'Pesanan Baru Masuk!',
                message: `Pesanan #${order.id.slice(0, 8)} dari ${order.merchant_name} siap diambil.`,
                time: new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                isUnread: true, // You might want to track read state in local storage or a table
                category: 'today',
                orderId: order.id
            }))

            // 2. Fetch system alerts or wallet warnings if needed
            // For now, we'll return order notifications
            return orderNotifications

        } catch (error) {
            console.error('Failed to get notifications:', error)
            return []
        }
    },

    /**
     * Get driver's assigned orders (Wrapper for orderService)
     */
    async getDriverOrders(status = null) {
        const { orderService } = await import('./orderService')
        return orderService.getDriverOrders(status)
    },



    /**
     * Get Driver Profile
     */
    /**
     * Get Driver Stats (Rating, Trips, Join Date)
     */
    async getDriverStats(userId) {
        try {
            // 1. Get Join Date & ID
            const { data: driver, error: driverError } = await supabase
                .from('drivers')
                .select('created_at')
                .eq('user_id', userId)
                .single()

            if (driverError) throw driverError

            // Calculate "Member Since" - e.g. "Jan 2024"
            const date = new Date(driver.created_at)
            const joinDate = date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })

            // 2. Get Completed Trips Count
            const { count: tripsCount, error: tripsError } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .eq('driver_id', userId)
                .eq('status', 'completed')

            if (tripsError) throw tripsError

            // 3. Get Average Rating
            // Note: Schema might vary. Assuming 'reviews' table linked to 'orders' or 'driver_id'
            // For now, if no review table is clear, we return '-' or a mock if DB not ready.
            // Let's assume a 'reviews' table exists for now
            /* 
            const { data: reviews, error: reviewsError } = await supabase
                .from('reviews')
                .select('rating')
                .eq('driver_id', userId)
            */

            // Placeholder rating until reviews table confirmed active
            const rating = '-'

            return {
                rating: rating,
                trips: tripsCount || 0,
                joinDate: joinDate
            }

        } catch (error) {
            console.error('Error fetching driver stats:', error)
            return { rating: '-', trips: 0, joinDate: '-' }
        }
    },

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
                email: data.profile?.email,
                phone: data.profile?.phone,
                address: data.address // Now available in drivers table
            }
        } catch (error) {
            console.error('Error fetching driver profile:', error)
            return null
        }
    },

    /**
     * Update Driver Profile
     * @param {Object} updates - { full_name, phone, address, vehicle_plate, etc }
     */
    async updateProfile(userId, updates) {
        try {
            // 1. Update Profile (Name, Phone) in 'profiles' table
            const profileUpdates = {}
            if (updates.full_name) profileUpdates.full_name = updates.full_name
            if (updates.phone) profileUpdates.phone = updates.phone
            if (updates.avatar_url) profileUpdates.avatar_url = updates.avatar_url
            // Note: Email updates require Auth API

            if (Object.keys(profileUpdates).length > 0) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update(profileUpdates)
                    .eq('id', userId)

                if (profileError) throw profileError
            }

            // 2. Update Driver Details in 'drivers' table (Address, etc.)
            const driverUpdates = {}
            if (updates.address) driverUpdates.address = updates.address
            if (updates.vehicle_plate) driverUpdates.vehicle_plate = updates.vehicle_plate
            if (updates.vehicle_brand) driverUpdates.vehicle_brand = updates.vehicle_brand

            // Add other fields as needed based on what's passed
            if (updates.bank_name) driverUpdates.bank_name = updates.bank_name
            if (updates.bank_account_number) driverUpdates.bank_account_number = updates.bank_account_number
            if (updates.bank_account_name) driverUpdates.bank_account_name = updates.bank_account_name

            if (Object.keys(driverUpdates).length > 0) {
                const { error: driverError } = await supabase
                    .from('drivers')
                    .update(driverUpdates)
                    .eq('user_id', userId)

                if (driverError) throw driverError
            }

            return { success: true }
        } catch (error) {
            console.error('Error updating profile:', error)
            throw error
        }
    },

    /**
     * Upload Avatar
     * @param {File} file 
     * @param {string} userId 
     */
    async uploadAvatar(file, userId) {
        try {
            const { storageService, STORAGE_PATHS } = await import('./storageService')
            const result = await storageService.uploadFile(file, STORAGE_PATHS.USER_PROFILE, userId)

            // Update Profile with new URL
            await this.updateProfile(userId, { avatar_url: result.url })

            return result.url
        } catch (error) {
            console.error('Error uploading avatar:', error)
            throw error
        }
    },

    async getActiveOrder() {
        // Backward-compatible: returns the first active order (or null)
        const orders = await this.getActiveOrders()
        return orders.length > 0 ? orders[0] : null
    },

    /**
     * Get all active orders for this driver (multi-order support)
     * @returns {Array} Array of active orders
     */
    async getActiveOrders() {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return []

            // Try new RPC first (multi-order)
            const { data: rpcData, error: rpcError } = await supabase.rpc('get_driver_active_orders')

            if (!rpcError && rpcData?.orders) {
                return rpcData.orders
            }

            // Fallback: standard query (returns all active orders)
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
                .order('created_at', { ascending: true })

            if (error) throw error

            return (data || []).map(d => ({
                id: d.id,
                merchant_name: d.merchants?.name,
                merchant_address: d.merchants?.address,
                customer_address: d.delivery_address,
                total_amount: d.total_amount,
                payment_method: d.payment_method,
                status: d.status,
                created_at: d.created_at,
                merchant_lat: d.merchants?.latitude,
                merchant_lng: d.merchants?.longitude,
                customer_lat: d.latitude,
                customer_lng: d.longitude,
                customer_name: d.profiles?.full_name || 'Customer',
                customer_note: d.notes,
                items: d.order_items?.map(i => ({
                    name: i.product_name,
                    quantity: i.quantity,
                    notes: i.notes
                }))
            }))
        } catch (error) {
            console.error('Error getting active orders:', error)
            return []
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
     * Get Dashboard Stats
     */
    async getStats() {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return null

            // 1. Try RPC First
            const { data: rpcData, error: rpcError } = await supabase.rpc('get_driver_stats', {
                p_driver_id: user.id
            })

            if (!rpcError && rpcData) {
                return rpcData
            }

            // 2. Fallback: Manual Calculation
            // Get today's start and end
            const now = new Date()
            const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString()
            const endOfDay = new Date(now.setHours(23, 59, 59, 999)).toISOString()

            const { data: orders, error } = await supabase
                .from('orders')
                .select('id, total_amount, delivery_fee')
                .eq('driver_id', user.id)
                .eq('status', 'delivered')
                .gte('delivered_at', startOfDay)
                .lte('delivered_at', endOfDay)

            if (error) throw error

            const todayOrders = orders.length
            // Calculate revenue (using delivery_fee or a percentage of total? 
            // Usually driver gets delivery_fee. Let's assume delivery_fee is the earnings for now)
            const todayRevenue = orders.reduce((sum, order) => sum + (order.delivery_fee || 10000), 0)

            return {
                todayOrders,
                todayRevenue
            }
        } catch (error) {
            console.error('Error fetching stats:', error)
            return { todayOrders: 0, todayRevenue: 0 }
        }
    },
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
