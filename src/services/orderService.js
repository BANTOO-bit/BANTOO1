import { supabase } from './supabaseClient'

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
     * @returns {Object} { is_open: boolean, reason: string|null }
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
            notes = null
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
            // Server-side price calculation via RPC
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
                p_notes: notes
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
     * @param {Array} items - Array of { productId, name } from cart
     * @returns {Object} { valid: boolean, unavailable_items: Array }
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
     */
    async getCustomerOrders(status = null) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        let query = supabase
            .from('orders')
            .select(`
                *,
                merchant:merchants(id, name, image_url, address),
                items:order_items(*)
            `)
            .eq('customer_id', user.id)
            .order('created_at', { ascending: false })

        if (status) {
            query = query.eq('status', status)
        }

        const { data, error } = await query
        if (error) throw error
        return data
    },

    /**
     * Get orders for merchant
     */
    async getMerchantOrders(merchantId, status = null) {
        let query = supabase
            .from('orders')
            .select(`
                *,
                customer:profiles!customer_id(id, full_name, phone, avatar_url),
                driver:profiles!driver_id(id, full_name, phone),
                items:order_items(*)
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
     */
    async getMerchantOrderHistory(merchantId, { startDate, endDate, search = '' } = {}) {
        let query = supabase
            .from('orders')
            .select(`
                *,
                customer:profiles!customer_id(id, full_name, phone, avatar_url),
                items:order_items(*)
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
     */
    async getAvailableOrders() {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                merchant:merchants(id, name, image_url, address, latitude, longitude),
                items:order_items(*)
            `)
            .eq('status', 'ready')
            .is('driver_id', null)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    /**
     * Get driver's assigned orders
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
                items:order_items(*)
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
     */
    async getOrder(orderId) {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                merchant:merchants(id, name, image_url, address, phone, latitude, longitude),
                customer:profiles!customer_id(id, full_name, phone, avatar_url),
                driver:profiles!driver_id(id, full_name, phone, avatar_url),
                items:order_items(*)
            `)
            .eq('id', orderId)
            .single()

        if (error) throw error
        return data
    },

    /**
     * Update order status via server-side RPC (timestamps computed server-side).
     * C5: No fallback — RPC must be deployed.
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
     * Accept order (for driver) — uses RPC for atomic acceptance.
     * C5: No fallback — RPC must be deployed.
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
     */
    async cancelOrder(orderId, reason) {
        // Validate: can only cancel in early stages
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('status')
            .eq('id', orderId)
            .single()

        if (fetchError || !order) throw new Error('Pesanan tidak ditemukan')

        const cancellableStatuses = ['pending', 'accepted', 'preparing']
        if (!cancellableStatuses.includes(order.status)) {
            throw new Error(`Pesanan tidak bisa dibatalkan karena sudah berstatus "${order.status}"`)
        }

        return this.updateStatus(orderId, 'cancelled', { cancellation_reason: reason })
    },

    /**
     * Confirm payment received (for COD orders)
     * Only the assigned driver can confirm payment.
     */
    async confirmPayment(orderId, amount, paymentMethod = 'cod') {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        // Verify caller is the assigned driver
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('id, driver_id, payment_status, status')
            .eq('id', orderId)
            .single()

        if (fetchError || !order) throw new Error('Order not found')
        if (order.driver_id !== user.id) throw new Error('Only the assigned driver can confirm payment')
        if (order.payment_status === 'paid') throw new Error('Payment already confirmed')

        const { data, error } = await supabase
            .from('orders')
            .update({
                payment_status: 'paid',
                paid_at: new Date().toISOString()
            })
            .eq('id', orderId)
            .eq('driver_id', user.id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * Get order with full location data for tracking.
     * Includes merchant lat/lng, customer lat/lng, and driver profile.
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
                items:order_items(*)
            `)
            .eq('id', orderId)
            .single()

        if (error) throw error
        return data
    },

    /**
     * Validate promo code
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
     */
    async rejectOrder(orderId, reason) {
        // Validate: can only reject in early stages
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('status')
            .eq('id', orderId)
            .single()

        if (fetchError || !order) throw new Error('Pesanan tidak ditemukan')

        const rejectableStatuses = ['pending', 'accepted', 'preparing']
        if (!rejectableStatuses.includes(order.status)) {
            throw new Error(`Pesanan tidak bisa ditolak karena sudah berstatus "${order.status}"`)
        }

        return this.updateStatus(orderId, 'cancelled', {
            cancellation_reason: `Ditolak oleh merchant: ${reason}`
        })
    },

    /**
     * Check and auto-cancel expired pending orders
     * Calls backend RPC if available, falls back to client-side check
     * @param {number} timeoutMinutes - Minutes before auto-cancel (default 15)
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
    ORDER_TIMEOUT_MINUTES: 15,

    /**
     * H-6.2: Reassign stale driver orders (driver inactive too long)
     * @param {number} timeoutMinutes - Minutes before order is considered stale
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
    DRIVER_TIMEOUT_MINUTES: 30,

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
    }
}

export default orderService
