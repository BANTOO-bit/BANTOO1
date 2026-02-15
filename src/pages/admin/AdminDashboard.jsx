import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabaseClient'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminStatCard from '../../components/admin/AdminStatCard'
import AdminAlertPanel from '../../components/admin/AdminAlertPanel'
import AdminRecentTransactions from '../../components/admin/AdminRecentTransactions'
import AdminQuickActions from '../../components/admin/AdminQuickActions'
import AdminBarChart from '../../components/admin/AdminBarChart'
import AdminDonutChart from '../../components/admin/AdminDonutChart'

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

    useEffect(() => {
        fetchStats()

        // Realtime subscriptions
        const channels = supabase.channel('admin-dashboard-stats')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
                console.log('Orders changed, refreshing stats...')
                fetchStats()
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'drivers' }, () => {
                console.log('Drivers changed, refreshing stats...')
                fetchStats()
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawals' }, () => {
                console.log('Withdrawals changed, refreshing stats...')
                fetchStats()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channels)
        }
    }, [])

    const weeklyOrderData = [
        { label: 'Sen', value: 87 },
        { label: 'Sel', value: 112 },
        { label: 'Rab', value: 95 },
        { label: 'Kam', value: 128 },
        { label: 'Jum', value: 142 },
        { label: 'Sab', value: 168 },
        { label: 'Min', value: 153 },
    ]

    const weeklyRevenueData = [
        { label: 'Sen', value: 2100 },
        { label: 'Sel', value: 2850 },
        { label: 'Rab', value: 2400 },
        { label: 'Kam', value: 3200 },
        { label: 'Jum', value: 3600 },
        { label: 'Sab', value: 4100 },
        { label: 'Min', value: 3800 },
    ]

    const orderStatusSegments = [
        { label: 'Selesai', value: 118, color: '#22c55e' },
        { label: 'Dalam Proses', value: 16, color: '#3b82f6' },
        { label: 'Dibatalkan', value: 8, color: '#ef4444' },
    ]

    const paymentMethodSegments = [
        { label: 'COD', value: 85, color: '#f59e0b' },
        { label: 'Wallet', value: 42, color: '#6366f1' },
        { label: 'Transfer', value: 15, color: '#06b6d4' },
    ]

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
