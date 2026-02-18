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

        // Try RPC first (server-side price calculation)
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
            // RPC failed — do not fallback to client-side
            console.error('RPC create_order failed:', rpcError)
            throw new Error(rpcError.message || 'Gagal membuat pesanan. Silakan coba lagi.')
        }

        return rpcResult
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
     * Update order status with ownership validation
     * Validates that the caller has the right to change this order's status.
     */
    async updateStatus(orderId, status, additionalData = {}) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        // Fetch the order first to validate ownership
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('id, status, customer_id, driver_id, merchant_id')
            .eq('id', orderId)
            .single()

        if (fetchError || !order) throw new Error('Order not found')

        // Validate caller has rights to update this order
        const isCustomer = order.customer_id === user.id
        const isDriver = order.driver_id === user.id

        // Check if user is merchant owner
        let isMerchant = false
        if (order.merchant_id) {
            const { data: merchant } = await supabase
                .from('merchants')
                .select('owner_id')
                .eq('id', order.merchant_id)
                .single()
            isMerchant = merchant?.owner_id === user.id
        }

        // Check if user is admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
        const isAdmin = profile?.role === 'admin'

        // Validate role-based permissions for status transitions
        const allowedTransitions = {
            'cancelled': [isCustomer, isMerchant, isAdmin],
            'accepted': [isMerchant, isAdmin],
            'preparing': [isMerchant, isAdmin],
            'ready': [isMerchant, isAdmin],
            'pickup': [isDriver, isAdmin],
            'picked_up': [isDriver, isAdmin],
            'delivering': [isDriver, isAdmin],
            'delivered': [isDriver, isAdmin],
            'completed': [isDriver, isCustomer, isAdmin]
        }

        const permissions = allowedTransitions[status] || [isAdmin]
        if (!permissions.some(Boolean)) {
            throw new Error('You do not have permission to update this order status')
        }

        const updateData = { status, ...additionalData }

        // Add timestamps based on status
        switch (status) {
            case 'accepted':
                updateData.accepted_at = new Date().toISOString()
                break
            case 'pickup':
            case 'picked_up':
                updateData.picked_up_at = new Date().toISOString()
                break
            case 'completed':
            case 'delivered':
                updateData.delivered_at = new Date().toISOString()
                if (!additionalData.payment_status) {
                    updateData.payment_status = 'paid'
                }
                break
            case 'cancelled':
                updateData.cancelled_at = new Date().toISOString()
                break
        }

        const { data, error } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', orderId)
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * Accept order (for driver) — uses RPC for atomic acceptance, falls back to direct query
     */
    async acceptOrder(orderId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        // Try RPC first (atomic — prevents race conditions)
        const { data: rpcResult, error: rpcError } = await supabase.rpc('driver_accept_order', {
            p_order_id: orderId
        })

        if (!rpcError && rpcResult) {
            return rpcResult
        }

        // Fallback to direct query if RPC not deployed yet
        if (rpcError?.code === '42883' || rpcError?.message?.includes('does not exist')) {
            console.warn('RPC driver_accept_order not found, using direct query fallback')

            const { data: order, error: fetchError } = await supabase
                .from('orders')
                .select('id, status, driver_id')
                .eq('id', orderId)
                .single()

            if (fetchError || !order) throw new Error('Order not found')
            if (order.driver_id) throw new Error('Pesanan sudah diambil driver lain')
            if (order.status !== 'ready') throw new Error('Pesanan tidak tersedia untuk pickup')

            const { data, error } = await supabase
                .from('orders')
                .update({
                    driver_id: user.id,
                    status: 'pickup',
                    picked_up_at: new Date().toISOString()
                })
                .eq('id', orderId)
                .is('driver_id', null)
                .select()
                .single()

            if (error) throw new Error('Gagal menerima pesanan — mungkin sudah diambil')
            return data
        }

        throw rpcError || new Error('Gagal menerima pesanan')
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
    }
}

export default orderService
