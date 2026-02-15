import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { orderService } from '../../services/orderService'
import MerchantBottomNavigation from '../../components/merchant/MerchantBottomNavigation'
import EmptyState from '../../components/shared/EmptyState'

function MerchantOrderHistoryPage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedPeriod, setSelectedPeriod] = useState('7days')
    const [orders, setOrders] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    const periods = [
        { id: 'today', label: 'Hari Ini' },
        { id: '7days', label: '7 Hari Terakhir' },
        { id: '30days', label: '30 Hari Terakhir' }
    ]

    useEffect(() => {
        if (user?.merchantId) {
            fetchOrders()
        }
    }, [user?.merchantId, selectedPeriod, searchQuery])

    const fetchOrders = async () => {
        setIsLoading(true)
        try {
            const now = new Date()
            let startDate = null

            if (selectedPeriod === 'today') {
                startDate = new Date()
                startDate.setHours(0, 0, 0, 0)
            } else if (selectedPeriod === '7days') {
                startDate = new Date()
                startDate.setDate(now.getDate() - 7)
                startDate.setHours(0, 0, 0, 0)
            } else if (selectedPeriod === '30days') {
                startDate = new Date()
                startDate.setDate(now.getDate() - 30)
                startDate.setHours(0, 0, 0, 0)
            }

            const data = await orderService.getMerchantOrderHistory(user.merchantId, {
                startDate,
                endDate: now,
                search: searchQuery
            })

            // Transform data to UI format
            const formattedOrders = data.map(order => ({
                id: order.id,
                date: new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
                status: order.status,
                customerName: order.customer?.full_name || 'Pelanggan',
                items: order.items?.map(i => `${i.quantity}x ${i.product_name}`).join(', ') || '',
                earnings: order.subtotal // Assuming subtotal is what merchant earns (approximation)
            }))

            setOrders(formattedOrders)
        } catch (error) {
            console.error('Failed to fetch order history:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const getStatusBadge = (status) => {
        if (status === 'completed') {
            return (
                <div className="px-2 py-1 rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Selesai
                </div>
            )
        }
        return (
            <div className="px-2 py-1 rounded-md bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">close</span>
                Dibatalkan
            </div>
        )
    }

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 relative min-h-screen flex flex-col overflow-x-hidden pb-[88px]">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 pt-12 pb-4 flex items-center justify-center relative border-b border-transparent">
                <button
                    onClick={() => navigate('/merchant/dashboard')}
                    className="absolute left-4 top-auto p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-text-main dark:text-white">arrow_back</span>
                </button>
                <h1 className="text-lg font-bold text-text-main dark:text-white">Riwayat Pesanan</h1>
            </header>

            <main className="flex flex-col gap-6 px-4 pt-2">
                {/* Search and Filters */}
                <section className="flex flex-col gap-4">
                    {/* Search Bar */}
                    <div className="relative group">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors">
                            <span className="material-symbols-outlined text-[20px]">search</span>
                        </span>
                        <input
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shadow-sm placeholder:text-gray-400 transition-all"
                            placeholder="Cari Order ID atau nama..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Period Filter */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                        {periods.map((period) => (
                            <button
                                key={period.id}
                                onClick={() => setSelectedPeriod(period.id)}
                                className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${selectedPeriod === period.id
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'bg-white dark:bg-card-dark text-text-secondary border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                {period.label}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Orders List */}
                <section className="flex flex-col gap-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-4"></div>
                            <p className="text-slate-500 text-sm font-medium">Memuat riwayat...</p>
                        </div>
                    ) : orders.length > 0 ? (
                        orders.map((order) => (
                            <div key={order.id} className="bg-white dark:bg-card-dark rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                                                #{order.id.slice(0, 8)}
                                            </span>
                                            <span className="text-xs text-text-secondary">{order.date}</span>
                                        </div>
                                        <h3 className="font-bold text-text-main dark:text-white line-clamp-1">
                                            {order.customerName}
                                        </h3>
                                    </div>
                                    {getStatusBadge(order.status)}
                                </div>

                                <div className="h-px bg-gray-100 dark:bg-gray-800 w-full" />

                                <div className="flex flex-col gap-2">
                                    <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">
                                        {order.items}
                                    </p>
                                    <div className="flex justify-between items-end mt-1">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase tracking-wider text-text-secondary font-medium">Total Pendapatan</span>
                                            <span className="text-base font-bold text-primary">
                                                Rp {order.earnings.toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <EmptyState
                            icon="history"
                            title="Belum ada riwayat"
                            message="Riwayat pesanan yang sudah selesai atau dibatalkan akan muncul di sini."
                        />
                    )}
                </section>
            </main>

            <MerchantBottomNavigation activeTab="home" />
        </div>
    )
}

export default MerchantOrderHistoryPage
