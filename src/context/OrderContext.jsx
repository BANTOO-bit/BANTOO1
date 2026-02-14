import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../services/supabaseClient'
import { useAuth } from './AuthContext'
import orderService from '../services/orderService'

const OrderContext = createContext()

/**
 * ORDER LIFECYCLE STATES:
 * pending      → Customer placed order, waiting for merchant
 * accepted     → Merchant accepted, preparing food
 * preparing    → Food is being prepared
 * ready        → Food ready for pickup by driver
 * picked_up    → Driver picked up the food
 * delivering   → Driver en route to customer
 * delivered    → Order arrived at customer
 * completed    → Order confirmed complete
 * cancelled    → Order cancelled
 * timeout      → Order timed out (no response)
 */
const ORDER_STATUSES = [
    'pending', 'accepted', 'preparing', 'ready',
    'picked_up', 'delivering', 'delivered', 'completed',
    'cancelled', 'timeout'
]

export function OrderProvider({ children }) {
    const { user, activeRole } = useAuth()
    const [activeOrder, setActiveOrder] = useState(null)
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const subscriptionRef = useRef(null)

    // ============================================
    // FETCH ORDERS
    // ============================================

    const fetchOrders = useCallback(async (status = null) => {
        if (!user) return
        setLoading(true)
        setError(null)

        try {
            let data = []
            if (activeRole === 'merchant') {
                data = await orderService.getMerchantOrders(user.merchantId, status)
            } else if (activeRole === 'driver') {
                data = await orderService.getDriverOrders(status)
            } else {
                data = await orderService.getCustomerOrders(status)
            }
            setOrders(data || [])

            // Set active order (first non-completed/cancelled order)
            const active = (data || []).find(o =>
                !['completed', 'cancelled', 'timeout'].includes(o.status)
            )
            if (active) setActiveOrder(active)
        } catch (err) {
            console.error('Error fetching orders:', err)
            setError(err.message || 'Gagal memuat pesanan')
        } finally {
            setLoading(false)
        }
    }, [user, activeRole])

    // Load orders on mount or when user changes
    useEffect(() => {
        if (user) {
            fetchOrders()
        }
    }, [user, fetchOrders])

    // ============================================
    // CREATE ORDER
    // ============================================

    const createOrder = useCallback(async (orderData) => {
        setLoading(true)
        setError(null)
        try {
            const result = await orderService.createOrder(orderData)
            setActiveOrder(result)
            setOrders(prev => [result, ...prev])
            return result
        } catch (err) {
            console.error('Error creating order:', err)
            setError(err.message || 'Gagal membuat pesanan')
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    // ============================================
    // UPDATE ORDER STATUS
    // ============================================

    const updateOrderStatus = useCallback(async (orderId, newStatus, additionalData = {}) => {
        try {
            const result = await orderService.updateStatus(orderId, newStatus, additionalData)

            // Update local state
            setOrders(prev => prev.map(o =>
                o.id === orderId ? { ...o, status: newStatus, ...additionalData } : o
            ))

            if (activeOrder?.id === orderId) {
                setActiveOrder(prev => ({ ...prev, status: newStatus, ...additionalData }))
            }

            // Clear active order if completed/cancelled
            if (['completed', 'cancelled', 'timeout'].includes(newStatus)) {
                if (activeOrder?.id === orderId) {
                    setActiveOrder(null)
                }
            }

            return result
        } catch (err) {
            console.error('Error updating order status:', err)
            throw err
        }
    }, [activeOrder])

    // ============================================
    // ACCEPT ORDER (Merchant/Driver)
    // ============================================

    const acceptOrder = useCallback(async (orderId) => {
        try {
            const newStatus = activeRole === 'merchant' ? 'accepted' : 'picked_up'
            return await updateOrderStatus(orderId, newStatus)
        } catch (err) {
            throw err
        }
    }, [activeRole, updateOrderStatus])

    // ============================================
    // CANCEL ORDER
    // ============================================

    const cancelOrder = useCallback(async (orderId, reason = '') => {
        try {
            await orderService.cancelOrder(orderId, reason)
            setOrders(prev => prev.map(o =>
                o.id === orderId ? { ...o, status: 'cancelled', cancel_reason: reason } : o
            ))
            if (activeOrder?.id === orderId) {
                setActiveOrder(null)
            }
        } catch (err) {
            console.error('Error cancelling order:', err)
            throw err
        }
    }, [activeOrder])

    // ============================================
    // GET AVAILABLE ORDERS (Driver)
    // ============================================

    const getAvailableOrders = useCallback(async () => {
        try {
            return await orderService.getAvailableOrders()
        } catch (err) {
            console.error('Error fetching available orders:', err)
            return []
        }
    }, [])

    // ============================================
    // SUPABASE REALTIME SUBSCRIPTION
    // ============================================

    useEffect(() => {
        if (!user) return

        // Clean up previous subscription
        if (subscriptionRef.current) {
            supabase.removeChannel(subscriptionRef.current)
        }

        // Build filter based on role
        let filter = ''
        if (activeRole === 'merchant' && user.merchantId) {
            filter = `merchant_id=eq.${user.merchantId}`
        } else if (activeRole === 'driver') {
            filter = `driver_id=eq.${user.id}`
        } else {
            filter = `customer_id=eq.${user.id}`
        }

        const channelName = `orders-${activeRole}-${user.id}`

        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'orders',
                    filter: filter
                },
                (payload) => {
                    const { eventType, new: newRecord, old: oldRecord } = payload

                    if (eventType === 'INSERT') {
                        // New order came in
                        setOrders(prev => [newRecord, ...prev])
                        if (!['completed', 'cancelled', 'timeout'].includes(newRecord.status)) {
                            setActiveOrder(newRecord)
                        }
                    } else if (eventType === 'UPDATE') {
                        // Order status changed
                        setOrders(prev => prev.map(o =>
                            o.id === newRecord.id ? newRecord : o
                        ))
                        if (activeOrder?.id === newRecord.id) {
                            if (['completed', 'cancelled', 'timeout'].includes(newRecord.status)) {
                                setActiveOrder(null)
                            } else {
                                setActiveOrder(newRecord)
                            }
                        }
                    } else if (eventType === 'DELETE') {
                        setOrders(prev => prev.filter(o => o.id !== oldRecord.id))
                        if (activeOrder?.id === oldRecord.id) {
                            setActiveOrder(null)
                        }
                    }
                }
            )
            .subscribe()

        subscriptionRef.current = channel

        // Also subscribe to available orders for drivers
        if (activeRole === 'driver') {
            const availableChannel = supabase
                .channel(`available-orders-${user.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'orders',
                        filter: 'status=eq.ready'
                    },
                    (payload) => {
                        // Notify driver of new available order
                        // This will be picked up by the DriverDashboard component
                        window.dispatchEvent(new CustomEvent('new-order-available', {
                            detail: payload.new
                        }))
                    }
                )
                .subscribe()

            return () => {
                supabase.removeChannel(channel)
                supabase.removeChannel(availableChannel)
            }
        }

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user, activeRole])

    // ============================================
    // CLEAR / HELPERS
    // ============================================

    const clearOrder = useCallback(() => {
        setActiveOrder(null)
    }, [])

    const clearError = useCallback(() => {
        setError(null)
    }, [])

    const getOrderById = useCallback((orderId) => {
        return orders.find(o => o.id === orderId) || null
    }, [orders])

    const isValidStatus = useCallback((status) => {
        return ORDER_STATUSES.includes(status)
    }, [])

    const getActiveOrders = useCallback(() => {
        return orders.filter(o =>
            !['completed', 'cancelled', 'timeout'].includes(o.status)
        )
    }, [orders])

    const getCompletedOrders = useCallback(() => {
        return orders.filter(o =>
            ['completed', 'cancelled', 'timeout'].includes(o.status)
        )
    }, [orders])

    // ============================================
    // CONTEXT VALUE
    // ============================================

    const value = {
        // State
        activeOrder,
        orders,
        loading,
        error,

        // Actions
        fetchOrders,
        createOrder,
        updateOrderStatus,
        acceptOrder,
        cancelOrder,
        getAvailableOrders,
        clearOrder,
        clearError,

        // Helpers
        setActiveOrder,
        getOrderById,
        isValidStatus,
        getActiveOrders,
        getCompletedOrders,

        // Constants
        ORDER_STATUSES,
    }

    return (
        <OrderContext.Provider value={value}>
            {children}
        </OrderContext.Provider>
    )
}

export function useOrder() {
    const context = useContext(OrderContext)
    if (!context) {
        throw new Error('useOrder must be used within OrderProvider')
    }
    return context
}

export { ORDER_STATUSES }
export default OrderContext
