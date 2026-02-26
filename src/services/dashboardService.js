import { supabase } from './supabaseClient'
import logger from '../utils/logger'

/**
 * Dashboard Service - Get stats and analytics for dashboards
 */
export const dashboardService = {
    /**
     * Get merchant dashboard stats
     */
    async getMerchantStats(merchantId) {
        try {
            // Get today's date range
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const todayISO = today.toISOString()

            // Get orders for this merchant
            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select('id, total_amount, status, created_at, payment_status')
                .eq('merchant_id', merchantId)
                .gte('created_at', todayISO)

            if (ordersError) throw ordersError

            // Calculate stats
            const totalOrders = orders?.length || 0
            const completedOrders = orders?.filter(o => o.status === 'completed').length || 0
            const activeOrders = orders?.filter(o => ['pending', 'accepted', 'ready', 'pickup'].includes(o.status)).length || 0

            // Calculate earnings (only from completed orders)
            const todayEarnings = orders
                ?.filter(o => o.status === 'completed')
                .reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

            // Get new orders count
            const newOrders = orders?.filter(o => o.status === 'pending').length || 0

            return {
                todayEarnings,
                totalOrders,
                completedOrders,
                activeOrders,
                newOrders
            }
        } catch (error) {
            logger.error('Failed to fetch merchant stats', error, 'dashboardService')
            throw error
        }
    },

    /**
     * Get driver dashboard stats
     */
    async getDriverStats(driverId) {
        try {
            // Get today's date range
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const todayISO = today.toISOString()

            // Get driver's completed orders for today (include service_fee for actual admin fee)
            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select('id, delivery_fee, service_fee, payment_method, status, created_at')
                .eq('driver_id', driverId)
                .eq('status', 'completed')
                .gte('created_at', todayISO)

            if (ordersError) throw ordersError

            // Calculate driver NET income (delivery_fee - service_fee)
            const todayIncome = orders?.reduce((sum, order) => {
                const fee = order.delivery_fee || 0
                const adminFee = order.service_fee || 0
                return sum + (fee - adminFee)
            }, 0) || 0

            // COD admin fee: actual service_fee from COD orders (this stays with driver, must be deposited)
            const codOrders = orders?.filter(o => o.payment_method === 'cod') || []
            const codFee = codOrders.reduce((sum, order) => sum + (order.service_fee || 0), 0)

            const completedCount = orders?.length || 0

            return {
                todayIncome,
                codFee,
                completedOrders: completedCount
            }
        } catch (error) {
            logger.error('Failed to fetch driver stats', error, 'dashboardService')
            throw error
        }
    },

    /**
     * Get user's wallet balance and payment methods
     */
    async getPaymentMethods(userId) {
        try {
            // Get wallet balance
            const { data: wallet, error: walletError } = await supabase
                .from('wallets')
                .select('balance')
                .eq('user_id', userId)
                .single()

            if (walletError && walletError.code !== 'PGRST116') {
                throw walletError
            }

            const walletBalance = wallet?.balance || 0

            // Return payment methods with real wallet balance
            return [
                {
                    id: 'cash',
                    name: 'Tunai (COD)',
                    description: 'Bayar saat pesanan tiba',
                    icon: 'payments'
                },
                {
                    id: 'wallet',
                    name: 'BANTOO Wallet',
                    description: `Saldo: Rp ${walletBalance.toLocaleString('id-ID')}`,
                    icon: 'account_balance_wallet',
                    balance: walletBalance
                },
                {
                    id: 'gopay',
                    name: 'GoPay',
                    description: 'Simulasi Pembayaran Digital',
                    icon: 'payment'
                },
                {
                    id: 'ovo',
                    name: 'OVO',
                    description: 'Simulasi Pembayaran Digital',
                    icon: 'payment'
                },
                {
                    id: 'dana',
                    name: 'DANA',
                    description: 'Simulasi Pembayaran Digital',
                    icon: 'payment'
                }
            ]
        } catch (error) {
            logger.error('Failed to fetch payment methods', error, 'dashboardService')
            throw error
        }
    },

    /**
     * Get admin dashboard stats
     * Aggregates system-wide data for the admin view
     */
    async getAdminStats() {
        try {
            // Parallel requests for efficiency
            const [
                { count: totalUsers },
                { count: totalOrders },
                { data: recentOrders },
                { data: revenueData }
            ] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('orders').select('*', { count: 'exact', head: true }),
                supabase.from('orders')
                    .select('id, total_amount, status, created_at, merchant:merchants(name), customer:profiles!customer_id(full_name)')
                    .order('created_at', { ascending: false })
                    .limit(5),
                supabase.from('orders')
                    .select('total_amount, delivery_fee, created_at')
                    .eq('status', 'completed')
            ])

            // Calculate revenue
            const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
            const totalDeliveryFees = revenueData?.reduce((sum, order) => sum + (order.delivery_fee || 0), 0) || 0

            // Platform net revenue (example: 10% of order value + 20% of delivery fee)
            const netRevenue = (totalRevenue * 0.10) + (totalDeliveryFees * 0.20)

            // Calculate weekly chart data from real database rows
            const last7Days = Array.from({ length: 7 }, (_, i) => {
                const d = new Date()
                d.setDate(d.getDate() - (6 - i))
                d.setHours(0, 0, 0, 0)
                return d
            })

            const daysMap = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

            const weeklyOrdersData = last7Days.map(date => ({
                label: daysMap[date.getDay()],
                value: 0
            }))

            const weeklyRevenueData = last7Days.map(date => ({
                label: daysMap[date.getDay()],
                value: 0
            }))

            revenueData?.forEach(order => {
                if (!order.created_at) return
                const orderDate = new Date(order.created_at)
                orderDate.setHours(0, 0, 0, 0)

                const dayIndex = last7Days.findIndex(d => d.getTime() === orderDate.getTime())
                if (dayIndex !== -1) {
                    weeklyOrdersData[dayIndex].value += 1
                    weeklyRevenueData[dayIndex].value += (order.total_amount || 0)
                }
            })

            return {
                totalUsers: totalUsers || 0,
                totalOrders: totalOrders || 0,
                totalRevenue,
                netRevenue,
                recentOrders: recentOrders || [],
                weeklyOrders: weeklyOrdersData,
                weeklyRevenue: weeklyRevenueData
            }
        } catch (error) {
            logger.error('Failed to fetch admin stats', error, 'dashboardService')
            throw error
        }
    },

    /**
     * Get detailed revenue stats for Finance Page
     */
    async getRevenueStats(period = 'daily') {
        try {
            const today = new Date()
            let startDate = new Date()

            if (period === 'daily') {
                startDate.setHours(0, 0, 0, 0)
            } else if (period === 'weekly') {
                startDate.setDate(today.getDate() - 7)
            } else if (period === 'monthly') {
                startDate.setMonth(today.getMonth() - 1)
            }

            const startISO = startDate.toISOString()

            // Fetch completed orders
            const { data: orders, error } = await supabase
                .from('orders')
                .select('id, total_amount, delivery_fee, created_at, status, merchants(name)')
                .eq('status', 'completed')
                .gte('created_at', startISO)
                .order('created_at', { ascending: false })

            if (error) throw error

            // Fetch pending withdrawals
            const { count: pendingWithdrawalsCount, error: withdrawalError } = await supabase
                .from('withdrawals')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending')

            if (withdrawalError) throw withdrawalError

            // Calculations
            const totalGrossRevenue = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0
            const totalDeliveryFees = orders?.reduce((sum, o) => sum + (o.delivery_fee || 0), 0) || 0

            // Business Logic (Approximation)
            // Platform gets 10% of order value + 20% of delivery fee
            const platformFee = Math.round((totalGrossRevenue * 0.10) + (totalDeliveryFees * 0.20))

            // Driver gets 80% of delivery fee
            const driverRevenue = Math.round(totalDeliveryFees * 0.80)

            // Merchant gets 90% of order value
            const merchantRevenue = Math.round(totalGrossRevenue * 0.90)

            // Chart Data Generation
            const chartData = []
            if (period === 'daily') {
                // Group by hour
                const hours = {}
                // Initialize steps
                for (let i = 0; i < 24; i += 4) hours[i] = 0

                orders?.forEach(o => {
                    const hour = new Date(o.created_at).getHours()
                    // bucket into 4-hour slots
                    const bucket = Math.floor(hour / 4) * 4
                    hours[bucket] = (hours[bucket] || 0) + (o.total_amount || 0)
                })

                Object.keys(hours).forEach(key => {
                    chartData.push({
                        label: `${key}:00`,
                        value: hours[key]
                    })
                })
            }

            return {
                platformFee,
                driverRevenue,
                merchantRevenue,
                totalGrossRevenue, // Added for context
                pendingWithdrawalsCount: pendingWithdrawalsCount || 0,
                totalOrders: orders?.length || 0,
                chartData,
                recentTransactions: orders?.slice(0, 5).map(o => ({
                    id: o.id,
                    merchantName: o.merchants?.name || 'Unknown',
                    time: new Date(o.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                    platformFee: Math.round((o.total_amount * 0.10) + (o.delivery_fee * 0.20)),
                    total: o.total_amount,
                    status: 'completed'
                })) || []
            }
        } catch (error) {
            console.error('Failed to fetch revenue stats', error)
            throw error
        }
    }
}

export default dashboardService
