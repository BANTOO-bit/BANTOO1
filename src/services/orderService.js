import { supabase } from './supabaseClient'
import {
    ORDER_STATUS,
    CANCELLABLE_ORDER_STATUSES,
    REJECTABLE_ORDER_STATUSES,
    TIMEOUTS,
} from '../config/constants'

/**
 * @typedef {import('../types').ServiceResponse} ServiceResponse
 * @typedef {import('../types').Order} Order
 * @typedef {import('../types').OrderItem} OrderItem
 */

/**
 * Order Service - Handle order creation and management
 *
 * SECURITY NOTES:
 * - createOrder uses RPC to calculate prices server-side (from DB, not frontend)
 * - updateStatus validates caller role/ownership before allowing changes
 * - confirmPayment restricted to drivers assigned to the order
 */
export const orderService = {
    /**
     * Check if merchant is currently open (operating hours + manual toggle)
     * @param {string} merchantId
     * @returns {Promise<{is_open: boolean, reason: string|null}>}
     */
    async checkMerchantOpen(merchantId) {
        const { data, error } = await supabase.rpc('check_merchant_open', {
            p_merchant_id: merchantId
        })

        if (error) {
            // If RPC doesn't exist yet, skip check (graceful degradation)
            if (error.code === '42883' || error.message?.includes('does not exist')) {
                return { is_open: true, reason: null }
            }
            console.warn('Operating hours check failed:', error)
            return { is_open: true, reason: null }
        }

        return data
    },

    /**
     * Create a new order via server-side RPC
     * Prices are calculated from the database, NOT from frontend values.
     * @param {Object} orderData - Order details
     * @param {string} orderData.merchantId
     * @param {Array<{productId: string, quantity: number, notes?: string}>} orderData.items
     * @param {string} [orderData.deliveryAddress]
     * @param {string} [orderData.deliveryDetail]
     * @param {string} [orderData.customerName]
     * @param {string} [orderData.customerPhone]
     * @param {number} [orderData.customerLat]
     * @param {number} [orderData.customerLng]
     * @param {string} [orderData.paymentMethod='cod']
     * @param {string|null} [orderData.promoCode=null]
     * @param {string|null} [orderData.notes=null]
     * @param {number|null} [orderData.deliveryFee=null]
     * @returns {Promise<Order>}
     */
    async createOrder(orderData) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        // Check operating hours before creating order
        const merchantCheck = await this.checkMerchantOpen(orderData.merchantId)
        if (!merchantCheck.is_open) {
            throw new Error(merchantCheck.reason || 'Warung sedang tutup')
        }

        const {
            merchantId,
            items, // Array of { productId, quantity, notes }
            deliveryAddress,
            deliveryDetail,
            customerName,
            customerPhone,
            customerLat,
            customerLng,
            paymentMethod = 'cod',
            promoCode = null,
            notes = null,
            deliveryFee = null,
            applicationFee = 0
        } = orderData

        // Prepare items for RPC (only IDs and quantities — prices come from DB)
        const orderItems = items.map(item => ({
            menu_item_id: item.productId,
            quantity: item.quantity,
            notes: item.notes || null
        }))

        // H-2.2: Timeout guard (15 seconds) for order creation
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000)

        try {
            const { data: rpcResult, error: rpcError } = await supabase.rpc('create_order', {
                p_merchant_id: merchantId,
                p_items: orderItems,
                p_delivery_address: deliveryAddress,
                p_delivery_detail: deliveryDetail || null,
                p_customer_name: customerName,
                p_customer_phone: customerPhone,
                p_customer_lat: customerLat || null,
                p_customer_lng: customerLng || null,
                p_payment_method: paymentMethod,
                p_promo_code: promoCode,
                p_notes: notes,
                p_delivery_fee: deliveryFee,
                p_application_fee: applicationFee
            })

            if (rpcError) {
                clearTimeout(timeoutId)
                console.error('RPC create_order failed:', rpcError)
                throw new Error(rpcError.message || 'Gagal membuat pesanan. Silakan coba lagi.')
            }

            clearTimeout(timeoutId)
            return rpcResult
        } catch (err) {
            clearTimeout(timeoutId)
            if (err.name === 'AbortError') {
                throw new Error('Koneksi timeout. Periksa jaringan Anda dan coba lagi.')
            }
            throw err
        }
    },

    /**
     * C4: Validate cart items exist and are available before checkout.
     * Calls server-side RPC to check against actual DB state.
     * @param {Array<{productId?: string, id?: string, name?: string}>} items - Array of items from cart
     * @returns {Promise<{valid: boolean, unavailable_items: Array<any>}>}
     */
    async validateCartItems(items) {
        const rpcItems = items.map(item => ({
            menu_item_id: item.productId || item.id,
            name: item.name || 'Unknown'
        }))

        const { data, error } = await supabase.rpc('validate_cart_items', {
            p_items: rpcItems
        })

        if (error) {
            // If RPC not deployed, skip validation (graceful degradation)
            if (error.code === '42883' || error.message?.includes('does not exist')) {
                console.warn('RPC validate_cart_items not found, skipping validation')
                return { valid: true, unavailable_items: [] }
            }
            console.warn('Cart validation failed:', error)
            return { valid: true, unavailable_items: [] }
        }

        return data
    },



    /**
     * Get orders for current user (as customer)
     * @param {string|null} [status=null]
     * @returns {Promise<ServiceResponse<Order[]>>}
     */
    async getCustomerOrders(status = null) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        let query = supabase
            .from('orders')
            .select(`
                *,
                merchant:merchants(id, name, image_url, address),
                items:order_items(*, menu_items(image_url))
            `)
            .eq('customer_id', user.id)
            .order('created_at', { ascending: false })

        if (status) {
            if (Array.isArray(status)) {
                query = query.in('status', status)
            } else {
                query = query.eq('status', status)
            }
        }

        const { data, error } = await query
        if (error) throw error
        return data
    },

    /**
     * Get orders for merchant
     * @param {string} merchantId 
     * @param {string|Array<string>|null} [status=null] 
     * @returns {Promise<Order[]>}
     */
    async getMerchantOrders(merchantId, status = null) {
        let query = supabase
            .from('orders')
            .select(`
                *,
                customer:profiles!customer_id(id, full_name, phone, avatar_url),
                driver:profiles!driver_id(id, full_name, phone),
                items:order_items(*, menu_items(image_url))
            `)
            .eq('merchant_id', merchantId)
            .order('created_at', { ascending: false })

        if (status) {
            if (Array.isArray(status)) {
                query = query.in('status', status)
            } else {
                query = query.eq('status', status)
            }
        }

        const { data, error } = await query
        if (error) throw error
        return data
    },

    /**
     * Get merchant order history with date filtering
     * @param {string} merchantId 
     * @param {Object} [options={}] 
     * @param {Date} [options.startDate] 
     * @param {Date} [options.endDate] 
     * @param {string} [options.search=''] 
     * @returns {Promise<Order[]>}
     */
    async getMerchantOrderHistory(merchantId, { startDate, endDate, search = '' } = {}) {
        let query = supabase
            .from('orders')
            .select(`
                *,
                customer:profiles!customer_id(id, full_name, phone, avatar_url),
                items:order_items(*, menu_items(image_url))
            `)
            .eq('merchant_id', merchantId)
            .or('status.eq.completed,status.eq.cancelled') // Only history (completed/cancelled)
            .order('created_at', { ascending: false })

        if (startDate) {
            query = query.gte('created_at', startDate.toISOString())
        }
        if (endDate) {
            // Adjust end date to end of day
            const end = new Date(endDate)
            end.setHours(23, 59, 59, 999)
            query = query.lte('created_at', end.toISOString())
        }

        // Note: extensive search might need backend search engine or simple client side filter if list is small.
        // For now, if search string is provided, we might filter ID. 
        // Supabase basic text search on ID:
        if (search) {
            query = query.ilike('id', `%${search}%`)
        }

        const { data, error } = await query
        if (error) throw error
        return data
    },

    /**
     * Get available orders for driver
     * @returns {Promise<Order[]>}
     */
    async getAvailableOrders() {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                merchant:merchants(id, name, image_url, address, latitude, longitude),
                items:order_items(*, menu_items(image_url))
            `)
            .eq('status', 'ready')
            .is('driver_id', null)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    /**
     * Get driver's assigned orders
     * @param {string|null} [status=null] 
     * @returns {Promise<Order[]>}
     */
    async getDriverOrders(status = null) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        let query = supabase
            .from('orders')
            .select(`
                *,
                merchant:merchants(id, name, image_url, address, latitude, longitude),
                customer:profiles!customer_id(id, full_name, phone),
                items:order_items(*, menu_items(image_url))
            `)
            .eq('driver_id', user.id)
            .order('created_at', { ascending: false })

        if (status) {
            query = query.eq('status', status)
        }

        const { data, error } = await query
        if (error) throw error
        return data
    },

    /**
     * Get single order by ID
     * @param {string} orderId 
     * @returns {Promise<Order|null>}
     */
    async getOrder(orderId) {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                merchant:merchants(id, name, image_url, address, phone, latitude, longitude),
                customer:profiles!customer_id(id, full_name, phone, avatar_url),
                driver:profiles!driver_id(id, full_name, phone, avatar_url),
                items:order_items(*, menu_items(image_url))
            `)
            .eq('id', orderId)
            .maybeSingle()

        if (error) throw error
        return data
    },

    /**
     * Update order status via server-side RPC (timestamps computed server-side).
     * C5: No fallback — RPC must be deployed.
     * @param {string} orderId 
     * @param {import('../types').OrderStatus} status 
     * @param {Object} [additionalData={}] 
     * @returns {Promise<Order>}
     */
    async updateStatus(orderId, status, additionalData = {}) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        // Server-side timestamps + role validation via RPC
        const { data: rpcResult, error: rpcError } = await supabase.rpc('update_order_status', {
            p_order_id: orderId,
            p_status: status,
            p_additional: additionalData
        })

        if (rpcError) {
            console.error('RPC update_order_status failed:', rpcError)
            throw new Error(rpcError.message || 'Gagal update status pesanan')
        }

        // Fetch fresh order data after update
        const { data: freshOrder } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single()
        return freshOrder || rpcResult
    },

    /**
     * Add more preparation time to an order
     * @param {string} orderId 
     * @param {number} addedMinutes 
     * @returns {Promise<Order>}
     */
    async addPrepTime(orderId, addedMinutes) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        // Fetch current prep_time
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('prep_time')
            .eq('id', orderId)
            .single()

        if (fetchError || !order) throw new Error('Pesanan tidak ditemukan')

        const newPrepTime = (order.prep_time || 0) + addedMinutes

        // Update database (bypass RPC since we just update prep_time)
        const { data: updatedOrder, error: updateError } = await supabase
            .from('orders')
            .update({ prep_time: newPrepTime })
            .eq('id', orderId)
            .select()
            .single()

        if (updateError) {
            console.error('Error adding prep time:', updateError)
            throw new Error(updateError.message || 'Gagal menambah waktu memasak')
        }

        return updatedOrder
    },

    /**
     * Accept order (for driver) — uses RPC for atomic acceptance.
     * C5: No fallback — RPC must be deployed.
     * @param {string} orderId 
     * @returns {Promise<ServiceResponse<any>>}
     */
    async acceptOrder(orderId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        // Atomic RPC — prevents race conditions via FOR UPDATE row lock
        const { data: rpcResult, error: rpcError } = await supabase.rpc('driver_accept_order', {
            p_order_id: orderId
        })

        if (rpcError) {
            console.error('RPC driver_accept_order failed:', rpcError)
            throw new Error(rpcError.message || 'Gagal menerima pesanan')
        }

        return rpcResult
    },

    /**
     * Cancel order — validates status before cancelling
     * Only allows cancel when status is 'pending' or 'accepted'
     * @param {string} orderId 
     * @param {string} reason 
     * @returns {Promise<Order>}
     */
    async cancelOrder(orderId, reason) {
        // Validate: can only cancel in early stages
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('status')
            .eq('id', orderId)
            .single()

        if (fetchError || !order) throw new Error('Pesanan tidak ditemukan')

        if (!CANCELLABLE_ORDER_STATUSES.includes(order.status)) {
            throw new Error(`Pesanan tidak bisa dibatalkan karena sudah berstatus "${order.status}"`)
        }

        return this.updateStatus(orderId, ORDER_STATUS.CANCELLED, { cancellation_reason: reason })
    },

    /**
     * Confirm payment received (for COD orders)
     * Uses server-side RPC for atomic verification and server-side timestamp.
     * @param {string} orderId 
     * @param {number} amount 
     * @param {import('../types').PaymentMethod} [paymentMethod='cod'] 
     * @returns {Promise<ServiceResponse<any>>}
     */
    async confirmPayment(orderId, amount, paymentMethod = 'cod') {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        // Use server-side RPC for atomic payment confirmation with server timestamp
        const { data: rpcResult, error: rpcError } = await supabase.rpc('confirm_cod_payment', {
            p_order_id: orderId
        })

        if (rpcError) throw new Error(rpcError.message || 'Gagal konfirmasi pembayaran')

        // Check RPC result
        if (rpcResult && !rpcResult.success) {
            throw new Error(rpcResult.message || 'Gagal konfirmasi pembayaran')
        }

        return rpcResult
    },

    /**
     * Get order with full location data for tracking.
     * Includes merchant lat/lng, customer lat/lng, and driver profile.
     * @param {string} orderId 
     * @returns {Promise<Order|null>}
     */
    async getOrderWithLocations(orderId) {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                merchant:merchants(id, name, image_url, address, phone, latitude, longitude),
                customer:profiles!customer_id(id, full_name, phone, avatar_url),
                driver:profiles!driver_id(
                    id, full_name, phone, avatar_url,
                    driver_detail:drivers!user_id(vehicle_type, vehicle_plate, vehicle_brand)
                ),
                items:order_items(*, menu_items(image_url))
            `)
            .eq('id', orderId)
            .maybeSingle()

        if (error) throw error
        return data
    },

    /**
     * Validate promo code
     * @param {string} code 
     * @param {number} orderTotal 
     * @returns {Promise<(import('../types').Promo & {discount: number}) | null>}
     */
    async validatePromo(code, orderTotal) {
        const { data: promo, error } = await supabase
            .from('promos')
            .select('*')
            .eq('code', code.toUpperCase())
            .eq('is_active', true)
            .single()

        if (error || !promo) return null

        // Check validity
        const now = new Date()
        if (promo.valid_until && new Date(promo.valid_until) < now) return null
        if (promo.min_order && orderTotal < promo.min_order) return null
        if (promo.usage_limit && promo.used_count >= promo.usage_limit) return null

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

        return { ...promo, discount }
    },

    /**
     * Reject order (merchant-specific cancel with metadata)
     * @param {string} orderId
     * @param {string} reason - Rejection reason
     * @returns {Promise<Order>}
     */
    async rejectOrder(orderId, reason) {
        // Validate: can only reject in early stages
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('status, merchant_id')
            .eq('id', orderId)
            .single()

        if (fetchError || !order) throw new Error('Pesanan tidak ditemukan')

        if (!REJECTABLE_ORDER_STATUSES.includes(order.status)) {
            throw new Error(`Pesanan tidak bisa ditolak karena sudah berstatus "${order.status}"`)
        }

        const result = await this.updateStatus(orderId, ORDER_STATUS.CANCELLED, {
            cancellation_reason: `Ditolak oleh merchant: ${reason}`
        })

        // Anti-Spam (Auto-Close)
        try {
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            
            const { count, error: countError } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .eq('merchant_id', order.merchant_id)
                .eq('status', ORDER_STATUS.CANCELLED)
                .ilike('cancellation_reason', 'Ditolak oleh merchant:%')
                .gte('created_at', today.toISOString())
            
            // If they rejected 3 or more orders today (including this one), auto-close them
            if (!countError && count >= 3) {
                await supabase
                    .from('merchants')
                    .update({ is_open: false })
                    .eq('id', order.merchant_id)
                
                result._autoClosed = true
            }
        } catch (e) {
            console.error('Failed to run anti-spam validation:', e)
        }

        return result
    },

    /**
     * Check and auto-cancel expired pending orders
     * Calls backend RPC if available, falls back to client-side check
     * @param {number} timeoutMinutes - Minutes before auto-cancel (default 15)
     * @returns {Promise<{success: boolean, cancelled_count: number}>}
     */
    async checkAndCancelExpiredOrders(timeoutMinutes = 15) {
        try {
            // Try backend RPC first
            const { data, error } = await supabase.rpc('auto_cancel_expired_orders', {
                p_timeout_minutes: timeoutMinutes
            })

            if (!error && data) {
                return data
            }

            // Fallback: client-side check
            if (error?.code === '42883' || error?.message?.includes('does not exist')) {
                console.warn('RPC auto_cancel_expired_orders not found, using client-side fallback')

                const cutoff = new Date(Date.now() - timeoutMinutes * 60 * 1000).toISOString()
                const { data: expiredOrders, error: fetchError } = await supabase
                    .from('orders')
                    .select('id')
                    .eq('status', 'pending')
                    .lt('created_at', cutoff)

                if (fetchError || !expiredOrders?.length) {
                    return { success: true, cancelled_count: 0 }
                }

                let cancelledCount = 0
                for (const order of expiredOrders) {
                    try {
                        await this.cancelOrder(order.id, `Otomatis dibatalkan — merchant tidak merespons dalam ${timeoutMinutes} menit`)
                        cancelledCount++
                    } catch (e) {
                        console.warn('Failed to auto-cancel order:', order.id, e.message)
                    }
                }

                return { success: true, cancelled_count: cancelledCount }
            }

            console.warn('auto_cancel_expired_orders RPC failed:', error?.message)
            return { success: false, cancelled_count: 0 }
        } catch (err) {
            console.error('Error checking expired orders:', err)
            return { success: false, cancelled_count: 0 }
        }
    },

    /** Order timeout in minutes */
    ORDER_TIMEOUT_MINUTES: TIMEOUTS.ORDER_TIMEOUT_MINUTES,

    /**
     * H-6.2: Reassign stale driver orders (driver inactive too long)
     * @param {number} timeoutMinutes - Minutes before order is considered stale
     * @returns {Promise<{success: boolean, reassigned_count: number}>}
     */
    async reassignStaleDriverOrders(timeoutMinutes = 30) {
        try {
            const { data, error } = await supabase.rpc('auto_reassign_stale_driver_orders', {
                p_timeout_minutes: timeoutMinutes
            })
            if (error) {
                console.warn('Stale driver reassign RPC failed:', error.message)
                return { success: false, reassigned_count: 0 }
            }
            return data
        } catch (err) {
            console.error('Error reassigning stale driver orders:', err)
            return { success: false, reassigned_count: 0 }
        }
    },

    /**
     * C2/H-4.2: Confirm COD payment (driver confirms cash received)
     * @param {string} orderId
     */
    async confirmCodPayment(orderId) {
        const { data, error } = await supabase.rpc('confirm_cod_payment', {
            p_order_id: orderId
        })
        if (error) throw new Error(error.message || 'Gagal konfirmasi pembayaran COD')
        return data
    },

    /**
     * H-4.2: Raise a dispute for an order
     * @param {string} orderId
     * @param {string} reason
     */
    async raiseDispute(orderId, reason) {
        const { data, error } = await supabase.rpc('raise_order_dispute', {
            p_order_id: orderId,
            p_reason: reason
        })
        if (error) throw new Error(error.message || 'Gagal mengajukan dispute')
        return data
    },

    /** Driver order timeout (stale check) in minutes */
    DRIVER_TIMEOUT_MINUTES: TIMEOUTS.DRIVER_STALE_MINUTES,

    /**
     * M-5.2: Send merchant heartbeat (keeps last_active_at fresh)
     * Prevents auto-close due to inactivity
     * @param {string} merchantId
     */
    async merchantHeartbeat(merchantId) {
        if (!merchantId) return
        try {
            await supabase.rpc('merchant_heartbeat', { p_merchant_id: merchantId })
        } catch (e) {
            console.warn('Merchant heartbeat failed:', e.message)
        }
    },

    // ============================================================
    // CUSTOMER PAGE-SPECIFIC FUNCTIONS
    // ============================================================

    /**
     * Get order with driver info for customer chat page
     * Returns order + driver profile + vehicle details
     */
    async getOrderDriverInfo(orderId) {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                id, status, driver_id,
                driver_profile:profiles!driver_id (full_name, avatar_url, phone)
            `)
            .eq('id', orderId)
            .single()

        if (error) throw error

        // If driver assigned, get vehicle details
        if (data?.driver_id) {
            const { data: driverDetail } = await supabase
                .from('drivers')
                .select('vehicle_brand, vehicle_plate, vehicle_type')
                .eq('user_id', data.driver_id)
                .single()

            data.driver_detail = driverDetail
        }

        return data
    },

    /**
     * Get driver info by userId (for ActiveOrderCard)
     */
    async getDriverInfoById(driverId) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url, phone')
            .eq('id', driverId)
            .single()

        const { data: driver } = await supabase
            .from('drivers')
            .select('vehicle_brand, vehicle_plate, vehicle_type, rating')
            .eq('user_id', driverId)
            .single()

        if (!profile) return null

        return {
            name: profile.full_name || 'Driver',
            photo: profile.avatar_url,
            vehicle: [driver?.vehicle_brand, driver?.vehicle_type].filter(Boolean).join(' ') || 'Motor',
            plate: driver?.vehicle_plate || '-',
            rating: driver?.rating || null
        }
    },

    /**
     * Subscribe to realtime order changes
     */
    subscribeToOrders(channelName, filter, callback) {
        const channel = supabase
            .channel(channelName)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'orders',
                filter
            }, callback)
            .subscribe()

        return channel
    },

    /**
     * Subscribe to available orders (for drivers)
     */
    subscribeToAvailableOrders(channelName, callback) {
        const channel = supabase
            .channel(channelName)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'orders',
                filter: 'status=eq.ready'
            }, callback)
            .subscribe()

        return channel
    },

    /**
     * Remove a realtime channel
     */
    removeChannel(channel) {
        supabase.removeChannel(channel)
    }
}

export default orderService
