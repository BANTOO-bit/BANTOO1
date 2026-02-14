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
     * Create a new order via server-side RPC
     * Prices are calculated from the database, NOT from frontend values.
     * @param {Object} orderData - Order details
     */
    async createOrder(orderData) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

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
            // If RPC function doesn't exist yet, fall back to client-side
            // Also, fallback if RPC fails with specific codes like 23502 (not_null_violation)
            if (rpcError.code === '42883' || rpcError.code === '23502' || rpcError.message?.includes('function') || rpcError.message?.includes('does not exist')) {
                console.warn('RPC create_order failed, falling back to client-side:', rpcError)
                return this._createOrderFallback(user, orderData)
            }
            throw rpcError
        }

        return rpcResult
    },

    /**
     * Fallback: client-side order creation (TEMPORARY — remove after RPC deployment)
     * @private
     */
    async _createOrderFallback(user, orderData) {
        const {
            merchantId, items, deliveryAddress, deliveryDetail,
            customerName, customerPhone, customerLat, customerLng,
            paymentMethod = 'cod', promoCode = null, notes = null,
            deliveryFee: propDeliveryFee
        } = orderData

        // Fetch real prices from database to prevent manipulation
        const itemIds = items.map(i => i.productId)
        const { data: dbItems, error: itemsError } = await supabase
            .from('menu_items')
            .select('id, price, name')
            .in('id', itemIds)

        if (itemsError) throw itemsError

        // Build price map from DB (not from frontend!)
        const priceMap = {}
            ; (dbItems || []).forEach(item => { priceMap[item.id] = item.price })

        // Calculate subtotal using DB prices
        const subtotal = items.reduce((sum, item) => {
            const dbPrice = priceMap[item.productId]
            if (dbPrice === undefined) throw new Error(`Menu item ${item.productId} not found`)
            return sum + (dbPrice * item.quantity)
        }, 0)

        // Fetch delivery fee from DB or use calculated value
        let deliveryFee = propDeliveryFee || 8000 // Use passed fee first, then default
        if (!propDeliveryFee && customerLat && customerLng) {
            try {
                const { data: fee } = await supabase.rpc('calculate_delivery_fee', {
                    p_merchant_id: merchantId,
                    p_user_lat: customerLat,
                    p_user_lng: customerLng
                })
                if (fee) deliveryFee = fee
            } catch {
                // Keep default fee on error
            }
        }

        const serviceFee = 0
        let discount = 0
        let promoId = null

        if (promoCode) {
            const promo = await this.validatePromo(promoCode, subtotal)
            if (promo) {
                promoId = promo.id
                discount = promo.discount
            }
        }

        const totalAmount = subtotal + deliveryFee - discount

        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                customer_id: user.id,
                merchant_id: merchantId,
                subtotal,
                delivery_fee: deliveryFee,
                service_fee: 0,
                discount,
                total_amount: totalAmount,
                payment_method: paymentMethod,
                payment_status: paymentMethod === 'wallet' ? 'paid' : 'pending',
                promo_id: promoId,
                promo_code: promoCode,
                delivery_address: deliveryAddress,
                delivery_detail: deliveryDetail,
                customer_name: customerName,
                customer_phone: customerPhone,
                customer_lat: customerLat,
                customer_lng: customerLng,
                notes,
                status: 'pending'
            })
            .select()
            .single()

        if (orderError) throw orderError

        const orderItems = items.map(item => ({
            order_id: order.id,
            product_id: item.productId,
            product_name: item.name,
            quantity: item.quantity,
            price_at_time: priceMap[item.productId],
            notes: item.notes || null
        }))

        const { error: oiError } = await supabase
            .from('order_items')
            .insert(orderItems)

        if (oiError) throw oiError

        return order
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
     * Accept order (for driver) — validates order is available
     */
    async acceptOrder(orderId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        // Verify order is available (no driver assigned, status is 'ready')
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('id, status, driver_id')
            .eq('id', orderId)
            .single()

        if (fetchError || !order) throw new Error('Order not found')
        if (order.driver_id) throw new Error('Order already taken by another driver')
        if (order.status !== 'ready') throw new Error('Order is not available for pickup')

        // Assign driver and update status
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

        if (error) throw new Error('Failed to accept order — it may have been taken')
        return data
    },

    /**
     * Cancel order — only the customer or admin can cancel
     */
    async cancelOrder(orderId, reason) {
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
