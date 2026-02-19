import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'
import merchantService from '../../../services/merchantService'
import MerchantBottomNavigation from '../../../components/merchant/MerchantBottomNavigation'
import { handleError } from '../../../utils/errorHandler'

function MerchantSalesReportPage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const toast = useToast()
    const [selectedPeriod, setSelectedPeriod] = useState('today')
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        graphData: []
    })
    const [isLoading, setIsLoading] = useState(true)

    const periods = [
        { id: 'today', label: 'Hari Ini' },
        { id: 'week', label: 'Minggu Ini' },
        { id: 'month', label: 'Bulan Ini' }
    ]

    useEffect(() => {
        async function fetchStats() {
            if (!user?.merchantId) return

            setIsLoading(true)
            try {
                const now = new Date()
                let startDate = new Date()

                if (selectedPeriod === 'today') {
                    startDate.setHours(0, 0, 0, 0)
                } else if (selectedPeriod === 'week') {
                    startDate.setDate(now.getDate() - 7)
                    startDate.setHours(0, 0, 0, 0)
                } else if (selectedPeriod === 'month') {
                    startDate.setDate(1) // First day of month
                    startDate.setHours(0, 0, 0, 0)
                }

                const data = await merchantService.getSalesStats(user.merchantId, startDate, now)
                setStats(data)
            } catch (error) {
                handleError(error, toast)
            } finally {
                setIsLoading(false)
            }
        }

        fetchStats()
    }, [user?.merchantId, selectedPeriod, toast])

    // Use real top sellers from stats, or empty array if not available
    const topSellers = stats.topSellers || []

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 relative min-h-screen flex flex-col overflow-x-hidden pb-bottom-nav">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 pt-12 pb-4 flex items-center justify-between border-b border-transparent dark:border-gray-800">
                <button
                    onClick={() => navigate('/merchant/dashboard')}
                    className="w-10 h-10 flex items-center justify-center rounded-full active:bg-gray-100 dark:active:bg-gray-800 transition-colors -ml-2"
                >
                    <span className="material-symbols-outlined text-text-main dark:text-white">arrow_back</span>
                </button>
                <h1 className="text-lg font-bold text-text-main dark:text-white absolute left-1/2 transform -translate-x-1/2">Laporan Penjualan</h1>
                <div className="w-10" />
            </header>

            <main className="flex flex-col gap-6 px-4 pt-2">
                {/* Period Selector */}
                <section>
                    <div className="bg-gray-200 dark:bg-gray-800 p-1 rounded-xl flex items-center text-sm font-medium">
                        {periods.map((period) => (
                            <button
                                key={period.id}
                                onClick={() => setSelectedPeriod(period.id)}
                                className={`flex-1 py-2 rounded-lg transition-all text-center ${selectedPeriod === period.id
                                    ? 'bg-white dark:bg-gray-700 text-text-main dark:text-white shadow-sm'
                                    : 'text-text-secondary dark:text-gray-400 hover:text-text-main dark:hover:text-white'
                                    }`}
                            >
                                {period.label}
                            </button>
                        ))}
                    </div>
                </section>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="text-xs text-gray-500 mt-4">Memuat data...</p>
                    </div>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {/* Total Omzet */}
                            <div className="bg-card-light dark:bg-card-dark p-4 rounded-2xl shadow-soft border border-border-color dark:border-gray-700 flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-text-secondary">
                                    <span className="material-symbols-outlined text-[20px] text-primary">payments</span>
                                    <span className="text-xs font-medium">Total Omzet</span>
                                </div>
                                <h2 className="text-xl font-bold text-text-main dark:text-white">
                                    Rp {stats.totalRevenue.toLocaleString('id-ID')}
                                </h2>
                                <p className="text-[10px] text-green-500 font-medium flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[12px]">trending_up</span>
                                    Update Realtime
                                </p>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                {/* Total Pesanan */}
                                <div className="bg-card-light dark:bg-card-dark p-4 rounded-2xl shadow-soft border border-border-color dark:border-gray-700 flex flex-col justify-between">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-medium text-text-secondary">Total Pesanan</span>
                                        <h2 className="text-lg font-bold text-text-main dark:text-white">{stats.totalOrders}</h2>
                                    </div>
                                    <span className="text-[10px] text-green-500 font-medium">order</span>
                                </div>

                                {/* Rata-rata */}
                                <div className="bg-card-light dark:bg-card-dark p-4 rounded-2xl shadow-soft border border-border-color dark:border-gray-700 flex flex-col justify-between">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-medium text-text-secondary">Rata-rata</span>
                                        <h2 className="text-lg font-bold text-text-main dark:text-white">
                                            Rp {(stats.averageOrderValue / 1000).toFixed(0)}k
                                        </h2>
                                    </div>
                                    <span className="text-[10px] text-text-secondary font-medium">per order</span>
                                </div>
                            </div>
                        </section>

                        {/* Sales Trend Chart */}
                        <section className="bg-card-light dark:bg-card-dark p-5 rounded-2xl shadow-soft border border-border-color dark:border-gray-700">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-sm font-bold text-text-main dark:text-white">Tren Penjualan</h3>
                                <span className="text-xs text-text-secondary">
                                    {selectedPeriod === 'today' ? 'Hari Ini' : selectedPeriod === 'week' ? '7 Hari Terakhir' : 'Bulan Ini'}
                                </span>
                            </div>
                            <div className="flex items-end justify-between h-[120px] gap-2 overflow-x-auto pb-2">
                                {stats.graphData.length > 0 ? (
                                    stats.graphData.map((data, index) => {
                                        const maxVal = Math.max(...stats.graphData.map(d => d.value))
                                        const height = maxVal > 0 ? (data.value / maxVal) * 100 : 0
                                        return (
                                            <div key={index} className="flex flex-col items-center gap-2 min-w-[30px] flex-1 group">
                                                <div className="relative w-full bg-orange-50 dark:bg-orange-900/20 rounded-t-lg h-full flex items-end overflow-hidden">
                                                    <div
                                                        className={`w-full bg-primary/80 group-hover:bg-primary transition-all duration-300 rounded-t-lg`}
                                                        style={{ height: `${height}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-medium text-text-secondary whitespace-nowrap">
                                                    {data.name}
                                                </span>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                        Belum ada data grafik
                                    </div>
                                )}
                            </div>
                        </section>
                    </>
                )}

                <div className="h-8" />
            </main>

            <MerchantBottomNavigation activeTab="home" />
        </div>
    )
}

export default MerchantSalesReportPage
