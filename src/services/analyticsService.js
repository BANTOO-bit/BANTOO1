import { supabase } from './supabaseClient'

/**
 * Analytics Service — Provides deep analytics data for admin dashboard.
 * Includes trends, top performers, and hourly distribution.
 */
export const analyticsService = {
    /**
     * Get daily order trends for the last N days
     * @param {number} days - Number of days to look back (default 30)
     * @returns {Array<{ date, orders, revenue }>}
     */
    async getOrderTrends(days = 30) {
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)
        startDate.setHours(0, 0, 0, 0)

        const { data: orders, error } = await supabase
            .from('orders')
            .select('id, total_amount, status, created_at')
            .gte('created_at', startDate.toISOString())
            .not('status', 'in', '("cancelled","timeout")')
            .order('created_at', { ascending: true })

        if (error) throw error

        // Group by date
        const trendMap = {}
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate)
            date.setDate(date.getDate() + i)
            const key = date.toISOString().split('T')[0]
            trendMap[key] = { date: key, orders: 0, revenue: 0 }
        }

        ; (orders || []).forEach(order => {
            const key = new Date(order.created_at).toISOString().split('T')[0]
            if (trendMap[key]) {
                trendMap[key].orders++
                trendMap[key].revenue += (order.total_amount || 0)
            }
        })

        return Object.values(trendMap)
    },

    /**
     * Get top merchants by revenue
     * @param {number} limit - Number of top merchants
     * @param {number} days - Timeframe in days
     */
    async getTopMerchants(limit = 10, days = 30) {
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)

        const { data: orders, error } = await supabase
            .from('orders')
            .select('merchant_id, total_amount, merchant:merchants(name, image_url)')
            .gte('created_at', startDate.toISOString())
            .in('status', ['completed', 'delivered'])

        if (error) throw error

        // Aggregate by merchant
        const merchantMap = {}
            ; (orders || []).forEach(order => {
                const id = order.merchant_id
                if (!merchantMap[id]) {
                    merchantMap[id] = {
                        id,
                        name: order.merchant?.name || 'Unknown',
                        image_url: order.merchant?.image_url,
                        revenue: 0,
                        orderCount: 0
                    }
                }
                merchantMap[id].revenue += (order.total_amount || 0)
                merchantMap[id].orderCount++
            })

        return Object.values(merchantMap)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, limit)
    },

    /**
     * Get top drivers by completed deliveries
     * @param {number} limit
     * @param {number} days
     */
    async getTopDrivers(limit = 10, days = 30) {
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)

        const { data: orders, error } = await supabase
            .from('orders')
            .select('driver_id, delivery_fee, driver:profiles!driver_id(full_name, avatar_url)')
            .gte('created_at', startDate.toISOString())
            .in('status', ['completed', 'delivered'])
            .not('driver_id', 'is', null)

        if (error) throw error

        const driverMap = {}
            ; (orders || []).forEach(order => {
                const id = order.driver_id
                if (!driverMap[id]) {
                    driverMap[id] = {
                        id,
                        name: order.driver?.full_name || 'Unknown',
                        avatar_url: order.driver?.avatar_url,
                        earnings: 0,
                        deliveries: 0
                    }
                }
                driverMap[id].earnings += (order.delivery_fee || 0)
                driverMap[id].deliveries++
            })

        return Object.values(driverMap)
            .sort((a, b) => b.deliveries - a.deliveries)
            .slice(0, limit)
    },

    /**
     * Get orders distribution by hour of day
     * @param {number} days - Timeframe
     * @returns {Array<{ hour, count }>} 24 entries (0-23)
     */
    async getHourlyDistribution(days = 30) {
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)

        const { data: orders, error } = await supabase
            .from('orders')
            .select('created_at')
            .gte('created_at', startDate.toISOString())
            .not('status', 'in', '("cancelled","timeout")')

        if (error) throw error

        // Initialize all 24 hours
        const hourly = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0, label: `${String(i).padStart(2, '0')}:00` }))

            ; (orders || []).forEach(order => {
                const hour = new Date(order.created_at).getHours()
                hourly[hour].count++
            })

        return hourly
    },

    /**
     * Get order status distribution (for donut chart)
     * @param {number} days
     */
    async getStatusDistribution(days = 30) {
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)

        const { data: orders, error } = await supabase
            .from('orders')
            .select('status')
            .gte('created_at', startDate.toISOString())

        if (error) throw error

        const statusMap = {}
            ; (orders || []).forEach(order => {
                statusMap[order.status] = (statusMap[order.status] || 0) + 1
            })

        const statusLabels = {
            pending: 'Menunggu',
            accepted: 'Diterima',
            preparing: 'Diproses',
            ready: 'Siap',
            pickup: 'Pickup',
            picked_up: 'Diambil',
            delivering: 'Diantar',
            delivered: 'Terkirim',
            completed: 'Selesai',
            cancelled: 'Dibatalkan',
            timeout: 'Timeout'
        }

        return Object.entries(statusMap).map(([status, count]) => ({
            status,
            label: statusLabels[status] || status,
            count
        }))
    },

    /**
     * Get summary comparison: this period vs last period
     * @param {number} days
     */
    async getPeriodComparison(days = 7) {
        const now = new Date()
        const thisPeriodStart = new Date(now)
        thisPeriodStart.setDate(thisPeriodStart.getDate() - days)
        const lastPeriodStart = new Date(thisPeriodStart)
        lastPeriodStart.setDate(lastPeriodStart.getDate() - days)

        const { data: allOrders, error } = await supabase
            .from('orders')
            .select('total_amount, status, created_at')
            .gte('created_at', lastPeriodStart.toISOString())
            .not('status', 'in', '("cancelled","timeout")')

        if (error) throw error

        let thisRevenue = 0, thisOrders = 0
        let lastRevenue = 0, lastOrders = 0

            ; (allOrders || []).forEach(order => {
                const orderDate = new Date(order.created_at)
                if (orderDate >= thisPeriodStart) {
                    thisRevenue += (order.total_amount || 0)
                    thisOrders++
                } else {
                    lastRevenue += (order.total_amount || 0)
                    lastOrders++
                }
            })

        return {
            thisWeek: { revenue: thisRevenue, orders: thisOrders },
            lastWeek: { revenue: lastRevenue, orders: lastOrders },
            revenueGrowth: lastRevenue > 0 ? ((thisRevenue - lastRevenue) / lastRevenue * 100).toFixed(1) : 0,
            orderGrowth: lastOrders > 0 ? ((thisOrders - lastOrders) / lastOrders * 100).toFixed(1) : 0
        }
    }
}

export default analyticsService
