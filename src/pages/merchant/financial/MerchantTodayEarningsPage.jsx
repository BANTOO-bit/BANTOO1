import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import dashboardService from '../../../services/dashboardService'
import orderService from '../../../services/orderService'
import MerchantBottomNavigation from '../../../components/merchant/MerchantBottomNavigation'
import { formatOrderId } from '../../../utils/orderUtils'

const APP_FEE_PERCENT = 10 // 10% platform fee

function MerchantTodayEarningsPage() {
    const navigate = useNavigate()
    const { user } = useAuth()

    const [loading, setLoading] = useState(true)
    const [earnings, setEarnings] = useState({ gross: 0, deduction: 0, net: 0 })
    const [transactions, setTransactions] = useState([])
    const [chartData, setChartData] = useState([])

    // Build SVG path from hourly data points
    // Points are [{hour, value}], mapped to SVG viewBox 0-300 x 0-100
    const buildChartPath = (data) => {
        if (!data.length || data.every(d => d.value === 0)) return { line: '', fill: '', points: [] }

        const maxVal = Math.max(...data.map(d => d.value), 1)
        const svgW = 300
        const svgH = 100
        const padding = 5 // so lines don't clip at edges

        const pts = data.map((d, i) => ({
            x: (i / Math.max(data.length - 1, 1)) * svgW,
            y: padding + (svgH - 2 * padding) * (1 - d.value / maxVal)
        }))

        // Build smooth line using simple line segments
        const lineD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
        const fillD = lineD + ` L${svgW},${svgH} L0,${svgH} Z`

        return { line: lineD, fill: fillD, points: pts }
    }

    // Today's date string
    const todayStr = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })

    useEffect(() => {
        async function fetchData() {
            if (!user?.merchantId) return

            try {
                setLoading(true)

                // Fetch today's orders (all statuses for transaction list)
                const todayStart = new Date()
                todayStart.setHours(0, 0, 0, 0)

                const orders = await orderService.getMerchantOrders(user.merchantId)

                // Filter to today only
                const todayOrders = orders.filter(o => new Date(o.created_at) >= todayStart)

                // Calculate earnings from completed orders
                const completedOrders = todayOrders.filter(o => ['completed', 'delivered'].includes(o.status))
                const gross = completedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
                const deduction = Math.round(gross * APP_FEE_PERCENT / 100)
                const net = gross - deduction

                setEarnings({ gross, deduction, net })

                // Build hourly chart data from completed orders (08:00 - 22:00)
                const hourlyMap = {}
                for (let h = 8; h <= 22; h++) hourlyMap[h] = 0
                completedOrders.forEach(o => {
                    const hour = new Date(o.created_at).getHours()
                    if (hour >= 8 && hour <= 22) hourlyMap[hour] += (o.total_amount || 0)
                })
                const hourlyData = Object.entries(hourlyMap).map(([h, val]) => ({
                    hour: parseInt(h),
                    label: `${String(h).padStart(2, '0')}:00`,
                    value: val
                }))
                setChartData(hourlyData)

                // Build transaction list from today's orders (most recent first)
                const txList = todayOrders.map(order => ({
                    id: formatOrderId(order.id),
                    time: new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                    item: order.items?.map(i => `${i.product_name}`).join(', ') || 'Pesanan',
                    amount: order.total_amount || 0,
                    status: ['cancelled', 'rejected'].includes(order.status) ? 'cancelled' : 'success'
                }))

                setTransactions(txList)
            } catch (error) {
                console.error('Error fetching earnings:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [user?.merchantId])

    if (loading) {
        return (
            <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 relative min-h-screen flex flex-col overflow-x-hidden pb-[88px]">
                <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 pt-12 pb-4 flex items-center border-b border-transparent dark:border-gray-800">
                    <div className="relative w-full flex items-center justify-center">
                        <button onClick={() => navigate('/merchant/dashboard')} className="absolute left-0 p-2 -ml-2 text-text-main dark:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <h1 className="text-lg font-bold text-text-main dark:text-white leading-tight">Pendapatan Hari Ini</h1>
                    </div>
                </header>
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="size-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-text-secondary text-sm">Memuat data pendapatan...</p>
                    </div>
                </div>
                <MerchantBottomNavigation activeTab="home" />
            </div>
        )
    }

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 relative min-h-screen flex flex-col overflow-x-hidden pb-[88px]">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 pt-12 pb-4 flex items-center border-b border-transparent dark:border-gray-800">
                <div className="relative w-full flex items-center justify-center">
                    <button
                        onClick={() => navigate('/merchant/dashboard')}
                        className="absolute left-0 p-2 -ml-2 text-text-main dark:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="text-center">
                        <h1 className="text-lg font-bold text-text-main dark:text-white leading-tight">Pendapatan Hari Ini</h1>
                        <p className="text-xs text-text-secondary mt-0.5">{todayStr}</p>
                    </div>
                    <div className="absolute right-0 w-10" />
                </div>
            </header>

            <main className="flex flex-col gap-6 px-4 pt-4">
                {/* Total Earnings Hero */}
                <section className="flex flex-col items-center justify-center py-2">
                    <span className="text-sm font-medium text-text-secondary">Total Pendapatan Bersih</span>
                    <h2 className="text-4xl font-black text-text-main dark:text-white mt-1 tracking-tight">
                        Rp {earnings.net.toLocaleString('id-ID')}
                    </h2>
                </section>

                {/* Sales Trend Chart — dynamic from real hourly data */}
                {(() => {
                    const chart = buildChartPath(chartData)
                    const hasData = chart.line !== ''
                    return (
                        <section className="bg-card-light dark:bg-card-dark rounded-2xl p-5 shadow-soft border border-border-color dark:border-gray-700">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-[20px]">ssid_chart</span>
                                    <span className="text-xs font-bold text-text-main dark:text-white">Tren Penjualan</span>
                                </div>
                                {transactions.filter(t => t.status === 'success').length > 0 && (
                                    <div className="flex items-center gap-1 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-md">
                                        <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-[14px]">trending_up</span>
                                        <span className="text-[10px] font-bold text-green-600 dark:text-green-400">
                                            {transactions.filter(t => t.status === 'success').length} transaksi
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="relative w-full h-32">
                                {hasData ? (
                                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 300 100">
                                        <line className="dark:stroke-gray-700" stroke="#EAEAEA" strokeDasharray="4" strokeWidth="1" x1="0" x2="300" y1="0" y2="0" />
                                        <line className="dark:stroke-gray-700" stroke="#EAEAEA" strokeDasharray="4" strokeWidth="1" x1="0" x2="300" y1="50" y2="50" />
                                        <line className="dark:stroke-gray-700" stroke="#EAEAEA" strokeDasharray="4" strokeWidth="1" x1="0" x2="300" y1="100" y2="100" />
                                        <defs>
                                            <linearGradient id="gradientDetails" x1="0" x2="0" y1="0" y2="1">
                                                <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.2" />
                                                <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                        {/* Line */}
                                        <path
                                            d={chart.line}
                                            fill="none"
                                            stroke="#FF6B00"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="3"
                                        />
                                        {/* Gradient fill area */}
                                        <path
                                            d={chart.fill}
                                            fill="url(#gradientDetails)"
                                            stroke="none"
                                        />
                                        {/* Data points */}
                                        {chart.points.map((p, i) => (
                                            <circle key={i} cx={p.x} cy={p.y} fill="#FFFFFF" r="2.5" stroke="#FF6B00" strokeWidth="1.5" />
                                        ))}
                                    </svg>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-text-secondary">
                                        <div className="text-center">
                                            <span className="material-symbols-outlined text-3xl opacity-30">show_chart</span>
                                            <p className="text-[10px] mt-1">Belum ada data penjualan</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-between mt-3 px-1 text-[10px] text-text-secondary font-medium">
                                <span>08:00</span>
                                <span>12:00</span>
                                <span>16:00</span>
                                <span>20:00</span>
                            </div>
                        </section>
                    )
                })()}

                {/* Earnings Breakdown */}
                <section className="bg-card-light dark:bg-card-dark rounded-2xl shadow-soft border border-border-color dark:border-gray-700 overflow-hidden">
                    {/* Gross Income */}
                    <div className="p-4 flex items-center justify-between border-b border-border-color dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-text-secondary">
                                <span className="material-symbols-outlined text-[18px]">payments</span>
                            </div>
                            <span className="text-xs font-medium text-text-secondary">Penghasilan Kotor</span>
                        </div>
                        <span className="text-sm font-bold text-text-main dark:text-white">
                            Rp {earnings.gross.toLocaleString('id-ID')}
                        </span>
                    </div>

                    {/* Deduction */}
                    <div className="p-4 flex items-center justify-between border-b border-border-color dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500">
                                <span className="material-symbols-outlined text-[18px]">local_offer</span>
                            </div>
                            <span className="text-xs font-medium text-text-secondary">Potongan Aplikasi ({APP_FEE_PERCENT}%)</span>
                        </div>
                        <span className="text-sm font-bold text-red-500">
                            - Rp {earnings.deduction.toLocaleString('id-ID')}
                        </span>
                    </div>

                    {/* Net Income */}
                    <div className="p-4 flex items-center justify-between bg-background-light dark:bg-card-dark">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
                                <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                            </div>
                            <span className="text-xs font-bold text-text-main dark:text-white">Pendapatan Bersih</span>
                        </div>
                        <span className="text-base font-black text-green-600 dark:text-green-400">
                            Rp {earnings.net.toLocaleString('id-ID')}
                        </span>
                    </div>
                </section>

                {/* Recent Transactions */}
                <section className="flex flex-col gap-3">
                    <h3 className="text-sm font-bold text-text-main dark:text-white ml-1">Transaksi Terbaru</h3>
                    {transactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-text-secondary">
                            <span className="material-symbols-outlined text-4xl mb-2 opacity-40">receipt_long</span>
                            <p className="text-sm">Belum ada transaksi hari ini</p>
                        </div>
                    ) : (
                        transactions.map((transaction) => (
                            <div
                                key={transaction.id}
                                className="bg-card-light dark:bg-card-dark p-3 rounded-2xl shadow-soft border border-border-color dark:border-gray-700 flex items-center justify-between active:scale-[0.99] transition-transform"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl ${transaction.status === 'cancelled' ? 'bg-gray-100 dark:bg-gray-800 text-text-secondary' : 'bg-orange-50 dark:bg-orange-900/20 text-primary'} border ${transaction.status === 'cancelled' ? 'border-gray-200 dark:border-gray-700' : 'border-orange-100 dark:border-orange-800/30'} flex items-center justify-center`}>
                                        <span className="material-symbols-outlined text-[20px]">
                                            {transaction.status === 'cancelled' ? 'cancel' : 'receipt_long'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs font-bold text-text-main dark:text-white">
                                            Order #{transaction.id}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] text-text-secondary">{transaction.time}</span>
                                            <span className="w-0.5 h-0.5 bg-gray-300 rounded-full" />
                                            <span className="text-[10px] text-text-secondary truncate max-w-[120px]">{transaction.item}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className={`text-sm font-bold ${transaction.status === 'cancelled' ? 'text-text-secondary line-through' : 'text-text-main dark:text-white'}`}>
                                        Rp {transaction.amount.toLocaleString('id-ID')}
                                    </span>
                                    <span className={`text-[10px] font-medium ${transaction.status === 'cancelled' ? 'text-red-500 bg-red-50 dark:bg-red-900/30' : 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30'} px-1.5 py-0.5 rounded`}>
                                        {transaction.status === 'cancelled' ? 'Dibatalkan' : 'Sukses'}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </section>
            </main>

            <MerchantBottomNavigation activeTab="home" />
        </div>
    )
}

export default MerchantTodayEarningsPage
