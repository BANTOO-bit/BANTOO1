import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import orderService from '../../../services/orderService'
import MerchantBottomNavigation from '../../../components/merchant/MerchantBottomNavigation'
import { formatOrderId } from '../../../utils/orderUtils'

function MerchantTotalOrdersPage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [selectedFilter, setSelectedFilter] = useState('all')
    const [loading, setLoading] = useState(true)
    const [allOrders, setAllOrders] = useState([])

    useEffect(() => {
        async function fetchOrders() {
            if (!user?.merchantId) return

            try {
                setLoading(true)

                // Fetch all of today's orders
                const orders = await orderService.getMerchantOrders(user.merchantId)

                // Filter to today only
                const todayStart = new Date()
                todayStart.setHours(0, 0, 0, 0)
                const todayOrders = orders.filter(o => new Date(o.created_at) >= todayStart)

                // Transform for display
                const transformed = todayOrders.map(order => {
                    const customerName = order.customer?.full_name || 'Pelanggan'
                    const initials = customerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                    const itemsSummary = order.items?.map(i => `${i.quantity}x ${i.product_name}`).join(', ') || '-'

                    // Determine status
                    let status = 'processing'
                    if (order.status === 'pending') status = 'new'
                    else if (['completed', 'delivered'].includes(order.status)) status = 'completed'
                    else if (['cancelled', 'rejected'].includes(order.status)) status = 'cancelled'

                    // Determine payment
                    const isCash = order.payment_method === 'cod' || order.payment_method === 'COD'

                    return {
                        id: order.id,
                        displayId: formatOrderId(order.id),
                        time: `Hari ini, ${new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`,
                        status,
                        customerName,
                        customerInitials: initials,
                        items: itemsSummary,
                        total: order.total_amount || 0,
                        paymentMethod: isCash ? 'cash' : 'noncash',
                        paymentLabel: isCash ? 'Tunai' : (order.payment_method === 'wallet' ? 'Saldo' : order.payment_method || 'Non-Tunai'),
                        paymentIcon: isCash ? null : 'account_balance_wallet'
                    }
                })

                setAllOrders(transformed)
            } catch (error) {
                console.error('Error fetching orders:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchOrders()
    }, [user?.merchantId])

    const filters = [
        { id: 'all', label: 'Semua' },
        { id: 'cash', label: 'Tunai' },
        { id: 'noncash', label: 'Non-Tunai' }
    ]

    const filteredOrders = allOrders.filter(order => {
        if (selectedFilter === 'all') return true
        if (selectedFilter === 'cash') return order.paymentMethod === 'cash'
        if (selectedFilter === 'noncash') return order.paymentMethod !== 'cash'
        return true
    })

    // Compute stats from filtered orders
    const currentStats = {
        completed: filteredOrders.filter(o => o.status === 'completed').length,
        cancelled: filteredOrders.filter(o => o.status === 'cancelled').length,
        active: filteredOrders.filter(o => ['new', 'processing'].includes(o.status)).length
    }

    // Color palette for avatars
    const avatarColors = [
        { bg: 'bg-blue-50 dark:bg-blue-900/10', text: 'text-blue-600', border: 'border-blue-100 dark:border-blue-800/30' },
        { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600', border: 'border-purple-200 dark:border-purple-800/30' },
        { bg: 'bg-indigo-50 dark:bg-indigo-900/10', text: 'text-indigo-600', border: 'border-indigo-100 dark:border-indigo-800/30' },
        { bg: 'bg-green-50 dark:bg-green-900/10', text: 'text-green-600', border: 'border-green-100 dark:border-green-800/30' },
        { bg: 'bg-orange-50 dark:bg-orange-900/10', text: 'text-orange-600', border: 'border-orange-100 dark:border-orange-800/30' },
    ]

    const getAvatarColor = (index) => avatarColors[index % avatarColors.length]

    const getStatusBadge = (status) => {
        const badges = {
            processing: {
                bg: 'bg-orange-100 dark:bg-orange-900/30',
                text: 'text-orange-700 dark:text-orange-300',
                label: 'Diproses'
            },
            new: {
                bg: 'bg-blue-100 dark:bg-blue-900/30',
                text: 'text-blue-700 dark:text-blue-300',
                label: 'Baru'
            },
            completed: {
                bg: 'bg-green-100 dark:bg-green-900/30',
                text: 'text-green-700 dark:text-green-300',
                label: 'Selesai'
            },
            cancelled: {
                bg: 'bg-red-100 dark:bg-red-900/30',
                text: 'text-red-700 dark:text-red-300',
                label: 'Batal'
            }
        }

        const badge = badges[status] || badges.processing
        return (
            <span className={`px-2.5 py-1 rounded-lg ${badge.bg} ${badge.text} text-[10px] font-bold uppercase tracking-wide`}>
                {badge.label}
            </span>
        )
    }

    if (loading) {
        return (
            <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 relative min-h-screen flex flex-col overflow-x-hidden pb-[88px]">
                <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-border-color dark:border-gray-800">
                    <button onClick={() => navigate('/merchant/dashboard')} className="w-10 h-10 -ml-2 flex items-center justify-center text-text-main dark:text-white rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-base font-bold text-text-main dark:text-white text-center">Total Pesanan</h1>
                    <div className="w-8" />
                </header>
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="size-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-text-secondary text-sm">Memuat data pesanan...</p>
                    </div>
                </div>
                <MerchantBottomNavigation activeTab="home" />
            </div>
        )
    }

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 relative min-h-screen flex flex-col overflow-x-hidden pb-[88px]">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-border-color dark:border-gray-800 transition-all">
                <button
                    onClick={() => navigate('/merchant/dashboard')}
                    className="w-10 h-10 -ml-2 flex items-center justify-center text-text-main dark:text-white rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-base font-bold text-text-main dark:text-white text-center">Total Pesanan</h1>
                <div className="w-8" />
            </header>

            <main className="flex flex-col gap-5 px-4 pt-4">
                {/* Payment Filters */}
                <section className="flex gap-2 overflow-x-auto no-scrollbar">
                    {filters.map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => setSelectedFilter(filter.id)}
                            className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap active:scale-95 transition-transform ${selectedFilter === filter.id
                                ? 'bg-primary text-white shadow-md'
                                : 'bg-white dark:bg-card-dark text-text-secondary border border-border-color dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-800'
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </section>

                {/* Stats Grid */}
                <section className="grid grid-cols-3 gap-3">
                    <div className="bg-white dark:bg-card-dark p-3 rounded-2xl border border-border-color dark:border-gray-700 shadow-soft flex flex-col items-center justify-center gap-1">
                        <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wide">Selesai</span>
                        <span className="text-xl font-black text-green-600 dark:text-green-400">{currentStats.completed}</span>
                    </div>
                    <div className="bg-white dark:bg-card-dark p-3 rounded-2xl border border-border-color dark:border-gray-700 shadow-soft flex flex-col items-center justify-center gap-1">
                        <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wide">Batal</span>
                        <span className="text-xl font-black text-red-500 dark:text-red-400">{currentStats.cancelled}</span>
                    </div>
                    <div className="bg-white dark:bg-card-dark p-3 rounded-2xl border border-border-color dark:border-gray-700 shadow-soft flex flex-col items-center justify-center gap-1">
                        <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wide">Aktif</span>
                        <span className="text-xl font-black text-blue-600 dark:text-blue-400">{currentStats.active}</span>
                    </div>
                </section>

                {/* Orders List */}
                <section className="flex flex-col gap-4">
                    {filteredOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-text-secondary opacity-60">
                            <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
                            <p className="text-xs">Tidak ada pesanan</p>
                        </div>
                    ) : (
                        filteredOrders.map((order, index) => {
                            const colors = getAvatarColor(index)
                            return (
                                <article
                                    key={order.id}
                                    className={`bg-white dark:bg-card-dark rounded-2xl p-4 shadow-card border border-border-color dark:border-gray-700 flex flex-col gap-3 group active:scale-[0.99] transition-transform duration-100 ${order.status === 'cancelled' ? 'grayscale opacity-80' : order.status === 'completed' ? 'opacity-90' : ''}`}
                                >
                                    {/* Header */}
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-text-main dark:text-white">#{order.displayId}</span>
                                            <span className="text-[10px] text-text-secondary mt-0.5">{order.time}</span>
                                        </div>
                                        {getStatusBadge(order.status)}
                                    </div>

                                    {/* Customer Info */}
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center flex-shrink-0 ${colors.text} font-bold text-xs border ${colors.border}`}>
                                            {order.customerInitials}
                                        </div>
                                        <div className="flex flex-col flex-1">
                                            <span className="text-sm font-bold text-text-main dark:text-white">{order.customerName}</span>
                                            <p className="text-xs text-text-secondary mt-1 leading-relaxed line-clamp-2">{order.items}</p>
                                        </div>
                                    </div>

                                    <div className="h-px bg-border-color dark:bg-gray-800 w-full my-0.5" />

                                    {/* Footer - Different layout for Cash vs Non-Cash */}
                                    {order.paymentMethod === 'cash' ? (
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-text-secondary font-medium">Total Pesanan</span>
                                            <span className={`text-sm font-bold ${order.status === 'cancelled' ? 'text-text-secondary line-through decoration-red-500' : 'text-primary'}`}>
                                                Rp {order.total.toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-center pt-1">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-text-secondary font-medium">Metode</span>
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    <span className="material-symbols-outlined text-[14px] text-primary">{order.paymentIcon || 'credit_card'}</span>
                                                    <span className="text-xs font-bold text-text-main dark:text-white">{order.paymentLabel}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] text-text-secondary font-medium">Total</span>
                                                <span className={`text-sm font-bold ${order.status === 'cancelled' ? 'text-text-secondary line-through decoration-red-500' : 'text-primary'}`}>
                                                    Rp {order.total.toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </article>
                            )
                        })
                    )}
                </section>

                <div className="h-4" />
            </main>

            <MerchantBottomNavigation activeTab="home" />
        </div>
    )
}

export default MerchantTotalOrdersPage
