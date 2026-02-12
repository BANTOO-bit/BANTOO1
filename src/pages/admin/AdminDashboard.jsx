import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabaseClient'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminHeader from '../../components/admin/AdminHeader'
import AdminStatCard from '../../components/admin/AdminStatCard'
import AdminAlertPanel from '../../components/admin/AdminAlertPanel'
import AdminRecentTransactions from '../../components/admin/AdminRecentTransactions'
import AdminQuickActions from '../../components/admin/AdminQuickActions'
import AdminBarChart from '../../components/admin/AdminBarChart'
import AdminDonutChart from '../../components/admin/AdminDonutChart'

// Helper for currency
const formatCurrency = (val) => `Rp ${val.toLocaleString('id-ID')}`

function AdminDashboard() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [stats, setStats] = useState({
        total_orders: 0,
        active_cod: 0,
        online_drivers: 0,
        today_revenue: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchStats() {
            try {
                // Call the RPC function we just created
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

        fetchStats()

        // Optional: Realtime subscription could be added here later
    }, [])

    // Placeholder data for charts (still mock for now as RPC only returns summary)
    // In Phase 2 we can make these dynamic too
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
        <div className="flex min-h-screen w-full bg-admin-bg-light dark:bg-admin-bg-dark font-display text-[#111418] dark:text-white overflow-x-hidden">
            {/* Sidebar */}
            <AdminSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Content */}
            <main className="flex-1 lg:ml-[280px] flex flex-col min-w-0">
                {/* Header */}
                <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} />

                {/* Dashboard Content */}
                <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto flex flex-col gap-6 h-full">

                        {/* Quick Actions */}
                        <div>
                            <h3 className="text-sm font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wide mb-4">Tindakan Cepat</h3>
                            <AdminQuickActions />
                        </div>

                        {/* Stats Grid — Row 1: Key Metrics */}
                        <div>
                            <h3 className="text-sm font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wide mb-4">Ringkasan Operasional</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

                        {/* Stats Grid — Row 2: Financial & Growth */}
                        {/* <div>
                            <h3 className="text-sm font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wide mb-4">Keuangan & Pertumbuhan</h3>
                             (Hidden for now as focused on Realtime Ops)
                        </div> */}

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] p-5 shadow-sm">
                                <h4 className="text-sm font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wide mb-4">Status Pesanan Hari Ini</h4>
                                <AdminDonutChart
                                    segments={orderStatusSegments}
                                    centerValue={loading ? '...' : stats.total_orders.toString()}
                                    centerLabel="Total"
                                />
                            </div>
                            <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] p-5 shadow-sm">
                                <h4 className="text-sm font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wide mb-4">Metode Pembayaran</h4>
                                <AdminDonutChart
                                    segments={paymentMethodSegments}
                                    centerValue={loading ? '...' : stats.total_orders.toString()}
                                    centerLabel="Pesanan"
                                />
                            </div>
                        </div>

                        {/* Content Grid: Alerts + Transactions */}
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* Alert Panel */}
                            <div className="lg:w-1/3">
                                <AdminAlertPanel />
                            </div>

                            {/* Recent Transactions */}
                            <div className="lg:w-2/3 flex flex-col">
                                <AdminRecentTransactions />
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    )
}

export default AdminDashboard
