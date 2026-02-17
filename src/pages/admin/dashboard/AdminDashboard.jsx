import { useState, useEffect } from 'react'
import { supabase } from '../../../services/supabaseClient'
import AdminLayout from '../../../components/admin/AdminLayout'
import AdminStatCard from '../../../components/admin/AdminStatCard'
import AdminAlertPanel from '../../../components/admin/AdminAlertPanel'
import AdminRecentTransactions from '../../../components/admin/AdminRecentTransactions'
import AdminQuickActions from '../../../components/admin/AdminQuickActions'
import AdminBarChart from '../../../components/admin/AdminBarChart'
import AdminDonutChart from '../../../components/admin/AdminDonutChart'

// Helper for currency
const formatCurrency = (val) => `Rp ${val.toLocaleString('id-ID')}`

function AdminDashboard() {
    const [stats, setStats] = useState({
        total_orders: 0,
        active_cod: 0,
        online_drivers: 0,
        today_revenue: 0
    })
    const [loading, setLoading] = useState(true)
    const [weeklyOrderData, setWeeklyOrderData] = useState([])
    const [weeklyRevenueData, setWeeklyRevenueData] = useState([])
    const [orderStatusSegments, setOrderStatusSegments] = useState([])
    const [paymentMethodSegments, setPaymentMethodSegments] = useState([])

    const dayLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

    const fetchStats = async () => {
        try {
            const { data, error } = await supabase.rpc('get_admin_dashboard_stats')

            if (error) {
                console.error('Error fetching admin stats:', error)
                return
            }

            if (data) {
                setStats(data)
            }
        } catch (err) {
            console.error('Unexpected error:', err)
        } finally {
            setLoading(false)
        }
    }

    const fetchChartData = async () => {
        try {
            // Last 7 days date range
            const today = new Date()
            const sevenDaysAgo = new Date(today)
            sevenDaysAgo.setDate(today.getDate() - 6)
            sevenDaysAgo.setHours(0, 0, 0, 0)

            // Fetch orders from last 7 days
            const { data: weekOrders, error: weekErr } = await supabase
                .from('orders')
                .select('created_at, total_amount, service_fee, status, payment_method')
                .gte('created_at', sevenDaysAgo.toISOString())
                .order('created_at', { ascending: true })

            if (weekErr) {
                console.error('Error fetching weekly data:', weekErr)
                return
            }

            const orders = weekOrders || []

            // Build daily order count & revenue map
            const dailyOrders = {}
            const dailyRevenue = {}
            for (let i = 0; i < 7; i++) {
                const d = new Date(sevenDaysAgo)
                d.setDate(sevenDaysAgo.getDate() + i)
                const key = d.toISOString().slice(0, 10)
                dailyOrders[key] = 0
                dailyRevenue[key] = 0
            }

            // Status & payment aggregation (today only)
            const todayStr = today.toISOString().slice(0, 10)
            const statusCount = { completed: 0, active: 0, cancelled: 0 }
            const paymentCount = { cod: 0, wallet: 0, transfer: 0 }

            orders.forEach(o => {
                const dateKey = o.created_at?.slice(0, 10)
                if (dailyOrders[dateKey] !== undefined) {
                    dailyOrders[dateKey]++
                    if (['delivered', 'completed'].includes(o.status)) {
                        dailyRevenue[dateKey] += (o.service_fee || 0)
                    }
                }
                // Today only for donut charts
                if (dateKey === todayStr) {
                    if (['delivered', 'completed'].includes(o.status)) statusCount.completed++
                    else if (o.status === 'cancelled') statusCount.cancelled++
                    else statusCount.active++

                    if (o.payment_method === 'cod') paymentCount.cod++
                    else if (o.payment_method === 'wallet') paymentCount.wallet++
                    else paymentCount.transfer++
                }
            })

            // Convert to chart arrays
            const orderArr = []
            const revenueArr = []
            Object.keys(dailyOrders).sort().forEach(key => {
                const d = new Date(key + 'T00:00:00')
                const label = dayLabels[d.getDay()]
                orderArr.push({ label, value: dailyOrders[key] })
                revenueArr.push({ label, value: Math.round(dailyRevenue[key] / 1000) })
            })

            setWeeklyOrderData(orderArr)
            setWeeklyRevenueData(revenueArr)

            setOrderStatusSegments([
                { label: 'Selesai', value: statusCount.completed, color: '#22c55e' },
                { label: 'Dalam Proses', value: statusCount.active, color: '#3b82f6' },
                { label: 'Dibatalkan', value: statusCount.cancelled, color: '#ef4444' },
            ])

            setPaymentMethodSegments([
                { label: 'COD', value: paymentCount.cod, color: '#f59e0b' },
                { label: 'Wallet', value: paymentCount.wallet, color: '#6366f1' },
                { label: 'Transfer', value: paymentCount.transfer, color: '#06b6d4' },
            ])
        } catch (err) {
            console.error('Chart data error:', err)
        }
    }

    useEffect(() => {
        fetchStats()
        fetchChartData()

        // Realtime subscriptions
        const channels = supabase.channel('admin-dashboard-stats')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
                fetchStats()
                fetchChartData()
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'drivers' }, () => {
                fetchStats()
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawals' }, () => {
                fetchStats()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channels)
        }
    }, [])

    return (
        <AdminLayout title="Ringkasan Dashboard">
            {/* Quick Actions */}
            <div>
                <h3 className="text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wide mb-3">Tindakan Cepat</h3>
                <AdminQuickActions />
            </div>

            {/* Stats Grid */}
            <div>
                <h3 className="text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wide mb-3">Ringkasan Operasional</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <AdminStatCard
                        title="Total Pesanan Hari Ini"
                        value={loading ? '...' : stats.total_orders.toString()}
                        trend={true}
                        trendValue="Realtime"
                        icon="shopping_cart"
                        color="blue"
                    />
                    <AdminStatCard
                        title="COD Aktif (Menunggu)"
                        value={loading ? '...' : formatCurrency(stats.active_cod)}
                        subtext="Menunggu setoran"
                        icon="payments"
                        color="amber"
                    />
                    <AdminStatCard
                        title="Driver Online"
                        value={loading ? '...' : stats.online_drivers.toString()}
                        subtext="Siap menerima order"
                        icon="two_wheeler"
                        color="indigo"
                    />
                    <AdminStatCard
                        title="Pendapatan Hari Ini"
                        value={loading ? '...' : formatCurrency(stats.today_revenue)}
                        subtext="Komisi aplikasi"
                        icon="account_balance"
                        color="green"
                    />
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <AdminBarChart
                    title="Pesanan Mingguan"
                    data={weeklyOrderData}
                    color="blue"
                />
                <AdminBarChart
                    title="Pendapatan Mingguan (Rp Ribu)"
                    data={weeklyRevenueData}
                    color="green"
                />
            </div>

            {/* Donut Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] p-4 shadow-sm">
                    <h4 className="text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wide mb-3">Status Pesanan Hari Ini</h4>
                    <AdminDonutChart
                        segments={orderStatusSegments}
                        centerValue={loading ? '...' : stats.total_orders.toString()}
                        centerLabel="Total"
                    />
                </div>
                <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] p-4 shadow-sm">
                    <h4 className="text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wide mb-3">Metode Pembayaran</h4>
                    <AdminDonutChart
                        segments={paymentMethodSegments}
                        centerValue={loading ? '...' : stats.total_orders.toString()}
                        centerLabel="Pesanan"
                    />
                </div>
            </div>

            {/* Content Grid: Alerts + Transactions */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="lg:w-1/3">
                    <AdminAlertPanel />
                </div>
                <div className="lg:w-2/3 flex flex-col">
                    <AdminRecentTransactions />
                </div>
            </div>
        </AdminLayout>
    )
}

export default AdminDashboard
