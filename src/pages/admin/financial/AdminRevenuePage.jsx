import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../../components/admin/AdminLayout'
import { dashboardService } from '../../../services/dashboardService'

export default function AdminRevenuePage() {
    const [period, setPeriod] = useState('daily') // daily, weekly, monthly
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [stats, setStats] = useState({
        platformFee: 0,
        driverRevenue: 0,
        merchantRevenue: 0,
        pendingWithdrawalsCount: 0,
        recentTransactions: []
    })

    useEffect(() => {
        fetchStats()
    }, [period])

    const fetchStats = async () => {
        try {
            setLoading(true)
            const data = await dashboardService.getRevenueStats(period)
            setStats(data)
            setError(null)
        } catch (err) {
            console.error('Failed to fetch revenue stats:', err)
            setError('Gagal memuat data pendapatan')
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (val) => {
        return `Rp ${val.toLocaleString('id-ID')}`
    }

    return (
        <AdminLayout title="Laporan Pendapatan">

                        {/* Time Period Selectors */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex p-1 bg-gray-100 dark:bg-[#2a3b4d] rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d]">
                                <button
                                    onClick={() => setPeriod('daily')}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${period === 'daily' ? 'bg-white dark:bg-[#1a2632] text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-[#617589] dark:text-[#94a3b8] hover:text-[#111418] dark:hover:text-white'}`}
                                >
                                    Harian
                                </button>
                                <button
                                    onClick={() => setPeriod('weekly')}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${period === 'weekly' ? 'bg-white dark:bg-[#1a2632] text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-[#617589] dark:text-[#94a3b8] hover:text-[#111418] dark:hover:text-white'}`}
                                >
                                    Mingguan
                                </button>
                                <button
                                    onClick={() => setPeriod('monthly')}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${period === 'monthly' ? 'bg-white dark:bg-[#1a2632] text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-[#617589] dark:text-[#94a3b8] hover:text-[#111418] dark:hover:text-white'}`}
                                >
                                    Bulanan
                                </button>
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 text-white font-medium rounded-lg text-sm transition-all duration-200 shadow-sm w-full sm:w-auto">
                                    <span className="material-symbols-outlined text-[20px]">download</span>
                                    Ekspor Excel/CSV
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 p-4 rounded-xl text-red-600 text-center">{error}</div>
                        ) : (
                            <>
                                {/* Stats Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="bg-white dark:bg-[#1a2632] p-5 rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm flex flex-col gap-4 hover:border-primary/50 transition-colors duration-300">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-primary">
                                                    <span className="material-symbols-outlined text-[20px]">domain</span>
                                                </div>
                                                <p className="text-[#617589] dark:text-[#94a3b8] text-sm font-medium">Fee Platform</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-3xl font-bold text-[#111418] dark:text-white">{formatCurrency(stats.platformFee)}</p>
                                            <p className="text-xs text-[#617589] dark:text-[#94a3b8] mt-1">Estimasi pendapatan bersih</p>
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-[#1a2632] p-5 rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm flex flex-col gap-4 hover:border-orange-400/50 transition-colors duration-300">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                                                    <span className="material-symbols-outlined text-[20px]">two_wheeler</span>
                                                </div>
                                                <p className="text-[#617589] dark:text-[#94a3b8] text-sm font-medium">Fee Driver</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-3xl font-bold text-[#111418] dark:text-white">{formatCurrency(stats.driverRevenue)}</p>
                                            <p className="text-xs text-[#617589] dark:text-[#94a3b8] mt-1">Total komisi untuk driver</p>
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-[#1a2632] p-5 rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm flex flex-col gap-4 hover:border-purple-400/50 transition-colors duration-300">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                                                    <span className="material-symbols-outlined text-[20px]">storefront</span>
                                                </div>
                                                <p className="text-[#617589] dark:text-[#94a3b8] text-sm font-medium">Omzet Warung</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-3xl font-bold text-[#111418] dark:text-white">{formatCurrency(stats.merchantRevenue)}</p>
                                            <p className="text-xs text-[#617589] dark:text-[#94a3b8] mt-1">Total transaksi bruto warung</p>
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-[#1a2632] p-5 rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm flex flex-col gap-4 hover:border-red-400/50 transition-colors duration-300">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                                                    <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                                                </div>
                                                <p className="text-[#617589] dark:text-[#94a3b8] text-sm font-medium">Penarikan Dana</p>
                                            </div>
                                            <span className="flex items-center text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded-full">
                                                <span className="material-symbols-outlined text-[14px] mr-1">pending_actions</span>
                                                Pending
                                            </span>
                                        </div>
                                        <div className="flex items-end justify-between">
                                            <div>
                                                <p className="text-3xl font-bold text-[#111418] dark:text-white">{stats.pendingWithdrawalsCount}</p>
                                                <p className="text-xs text-[#617589] dark:text-[#94a3b8] mt-1">Permintaan pending</p>
                                            </div>
                                            <Link to="/admin/withdrawals" className="px-4 py-2 bg-primary hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors shadow-sm cursor-pointer">
                                                Kelola
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Transactions Table */}
                                <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm overflow-hidden">
                                    <div className="p-5 border-b border-[#e5e7eb] dark:border-[#2a3b4d] flex justify-between items-center">
                                        <h3 className="text-lg font-bold text-[#111418] dark:text-white">Transaksi Terbaru (Selesai)</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-[#f9fafb] dark:bg-[#1e2c3a] text-xs text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider">
                                                    <th className="px-6 py-4 font-medium">ID Transaksi</th>
                                                    <th className="px-6 py-4 font-medium">Warung</th>
                                                    <th className="px-6 py-4 font-medium">Waktu</th>
                                                    <th className="px-6 py-4 font-medium text-right">Fee Platform</th>
                                                    <th className="px-6 py-4 font-medium text-right">Total</th>
                                                    <th className="px-6 py-4 font-medium text-center">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#2a3b4d]">
                                                {stats.recentTransactions.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="6" className="px-6 py-8 text-center text-[#617589] dark:text-[#94a3b8]">
                                                            Belum ada transaksi selesai pada periode ini.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    stats.recentTransactions.map(trx => (
                                                        <tr key={trx.id} className="hover:bg-[#f9fafb] dark:hover:bg-[#202e3b] transition-colors">
                                                            <td className="px-6 py-4 text-sm font-medium text-[#111418] dark:text-white">{trx.id.substring(0, 8).toUpperCase()}</td>
                                                            <td className="px-6 py-4 text-sm text-[#617589] dark:text-[#94a3b8]">{trx.merchantName}</td>
                                                            <td className="px-6 py-4 text-sm text-[#617589] dark:text-[#94a3b8]">{trx.time}</td>
                                                            <td className="px-6 py-4 text-sm font-medium text-green-600 dark:text-green-400 text-right">+{formatCurrency(trx.platformFee)}</td>
                                                            <td className="px-6 py-4 text-sm text-[#111418] dark:text-white text-right">{formatCurrency(trx.total)}</td>
                                                            <td className="px-6 py-4 text-center">
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400">
                                                                    {trx.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}
        </AdminLayout>
    )
}
