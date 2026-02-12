import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MerchantBottomNavigation from '../../components/merchant/MerchantBottomNavigation'

function MerchantTotalOrdersPage() {
    const navigate = useNavigate()
    const [selectedFilter, setSelectedFilter] = useState('all')

    // Mock stats for each filter
    const statsData = {
        all: { completed: 20, cancelled: 2, active: 2 },
        cash: { completed: 12, cancelled: 1, active: 1 },
        noncash: { completed: 8, cancelled: 1, active: 1 }
    }

    const currentStats = statsData[selectedFilter]

    // Mock orders with payment methods
    const allOrders = [
        {
            id: 'JKT-8825',
            time: 'Hari ini, 14:45',
            status: 'processing',
            customerName: 'Budi Santoso',
            customerInitials: 'BS',
            items: '1x Mie Ayam Spesial, 2x Es Teh Manis, 1x Kerupuk Putih',
            total: 28000,
            avatarBg: 'bg-gray-100 dark:bg-gray-800',
            textColor: 'text-text-secondary',
            borderColor: 'border-gray-200 dark:border-gray-700',
            paymentMethod: 'cash', // Tunai
            paymentLabel: 'Tunai'
        },
        {
            id: 'JKT-8821',
            time: 'Hari ini, 14:32',
            status: 'new',
            customerName: 'Siti Aminah',
            customerInitials: 'SA',
            items: '2x Bakso Urat Jumbo, 1x Es Jeruk',
            total: 60000,
            avatarBg: 'bg-purple-100 dark:bg-purple-900/30',
            textColor: 'text-purple-600',
            borderColor: 'border-purple-200 dark:border-purple-800/30',
            paymentMethod: 'gopay',
            paymentLabel: 'GoPay',
            paymentIcon: 'account_balance_wallet'
        },
        {
            id: 'JKT-8815',
            time: 'Hari ini, 13:15',
            status: 'completed',
            customerName: 'Ahmad Dhani',
            customerInitials: 'AD',
            items: '1x Pangsit Goreng, 1x Es Teh Tawar',
            total: 22000,
            avatarBg: 'bg-blue-50 dark:bg-blue-900/10',
            textColor: 'text-blue-600',
            borderColor: 'border-blue-100 dark:border-blue-800/30',
            paymentMethod: 'ovo',
            paymentLabel: 'OVO',
            paymentIcon: 'smartphone'
        },
        {
            id: 'JKT-8810',
            time: 'Hari ini, 12:45',
            status: 'completed',
            customerName: 'Rina Kurnia',
            customerInitials: 'RK',
            items: '2x Bakso Telur, 2x Kerupuk',
            total: 44000,
            avatarBg: 'bg-indigo-50 dark:bg-indigo-900/10',
            textColor: 'text-indigo-600',
            borderColor: 'border-indigo-100 dark:border-indigo-800/30',
            paymentMethod: 'shopeepay',
            paymentLabel: 'ShopeePay',
            paymentIcon: 'local_mall'
        },
        // Tunai specific examples
        {
            id: 'JKT-8899',
            time: 'Hari ini, 12:00',
            status: 'completed',
            customerName: 'Doni Tata',
            customerInitials: 'DT',
            items: '1x Nasi Goreng Spesial',
            total: 25000,
            avatarBg: 'bg-green-50 dark:bg-green-900/10',
            textColor: 'text-green-600',
            borderColor: 'border-green-100 dark:border-green-800/30',
            paymentMethod: 'cash',
            paymentLabel: 'Tunai'
        },
        {
            id: 'JKT-8802',
            time: 'Hari ini, 11:00',
            status: 'cancelled',
            customerName: 'Joko Anwar',
            customerInitials: 'JO',
            items: '3x Bakso Halus (Batal oleh Pembeli)',
            total: 45000,
            avatarBg: 'bg-red-50 dark:bg-red-900/10',
            textColor: 'text-red-600',
            borderColor: 'border-red-100 dark:border-red-800/30',
            paymentMethod: 'dana',
            paymentLabel: 'Dana',
            paymentIcon: 'account_balance_wallet'
        }
    ]

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

        const badge = badges[status]
        return (
            <span className={`px-2.5 py-1 rounded-lg ${badge.bg} ${badge.text} text-[10px] font-bold uppercase tracking-wide`}>
                {badge.label}
            </span>
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
                        filteredOrders.map((order) => (
                            <article
                                key={order.id}
                                className={`bg-white dark:bg-card-dark rounded-2xl p-4 shadow-card border border-border-color dark:border-gray-700 flex flex-col gap-3 group active:scale-[0.99] transition-transform duration-100 ${order.status === 'cancelled' ? 'grayscale opacity-80' : order.status === 'completed' ? 'opacity-90' : ''}`}
                            >
                                {/* Header */}
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-text-main dark:text-white">#{order.id}</span>
                                        <span className="text-[10px] text-text-secondary mt-0.5">{order.time}</span>
                                    </div>
                                    {getStatusBadge(order.status)}
                                </div>

                                {/* Customer Info */}
                                <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-full ${order.avatarBg} flex items-center justify-center flex-shrink-0 ${order.textColor} font-bold text-xs border ${order.borderColor}`}>
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
                        ))
                    )}
                </section>

                <div className="h-4" />
            </main>

            <MerchantBottomNavigation activeTab="home" />
        </div>
    )
}

export default MerchantTotalOrdersPage
