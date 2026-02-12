import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MerchantBottomNavigation from '../../components/merchant/MerchantBottomNavigation'

function MerchantOrderHistoryPage() {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedPeriod, setSelectedPeriod] = useState('7days')

    // Mock order history data
    const orders = [
        {
            id: 'JKT-8805',
            date: '19 Okt, 14:30',
            status: 'completed',
            customerName: 'Rizky Ramadhan',
            items: '2x Bakso Urat Jumbo, 1x Es Teh',
            earnings: 32000
        },
        {
            id: 'JKT-8802',
            date: '19 Okt, 12:15',
            status: 'completed',
            customerName: 'Siti Aminah',
            items: '1x Mie Ayam Ceker, 2x Kerupuk Putih',
            earnings: 17000
        },
        {
            id: 'JKT-8799',
            date: '18 Okt, 19:45',
            status: 'cancelled',
            customerName: 'Budi Santoso',
            items: '3x Es Jeruk Peras',
            earnings: 18000
        },
        {
            id: 'JKT-8795',
            date: '18 Okt, 18:20',
            status: 'completed',
            customerName: 'Andi Saputra',
            items: '2x Bakso Telur, 1x Kerupuk Kulit',
            earnings: 28000
        }
    ]

    const periods = [
        { id: 'today', label: 'Hari Ini' },
        { id: '7days', label: '7 Hari Terakhir' },
        { id: '30days', label: '30 Hari Terakhir' }
    ]

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
                                className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap active:scale-95 transition-transform ${selectedPeriod === period.id
                                        ? 'bg-primary text-white border border-primary shadow-sm font-semibold'
                                        : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark text-text-secondary hover:bg-gray-50'
                                    }`}
                            >
                                {period.label}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Order List */}
                <section className="flex flex-col gap-4">
                    {orders.map((order) => (
                        <article
                            key={order.id}
                            className={`bg-card-light dark:bg-card-dark rounded-2xl shadow-soft border border-border-color dark:border-gray-700 p-4 flex flex-col gap-3 ${order.status === 'cancelled' ? 'opacity-90' : ''}`}
                        >
                            {/* Header */}
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col">
                                    <span className="text-xs text-text-secondary font-medium">Order ID #{order.id}</span>
                                    <span className="text-[10px] text-text-secondary mt-0.5">{order.date}</span>
                                </div>
                                {getStatusBadge(order.status)}
                            </div>

                            {/* Customer & Items */}
                            <div className="flex flex-col gap-1">
                                <h3 className="font-bold text-sm text-text-main dark:text-white">{order.customerName}</h3>
                                <p className="text-xs text-text-secondary line-clamp-1">{order.items}</p>
                            </div>

                            <div className="h-px bg-border-color dark:bg-gray-800 w-full my-1" />

                            {/* Footer */}
                            <div className="flex justify-between items-center mt-1">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-text-secondary">Pendapatan Bersih</span>
                                    <span className={`text-sm font-bold ${order.status === 'cancelled' ? 'text-text-secondary line-through' : 'text-text-main dark:text-white'}`}>
                                        Rp {order.earnings.toLocaleString('id-ID')}
                                    </span>
                                </div>
                                <button className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-text-main dark:text-gray-300 font-medium text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors active:scale-95">
                                    Lihat Rincian
                                </button>
                            </div>
                        </article>
                    ))}
                </section>
            </main>

            <MerchantBottomNavigation activeTab="home" />
        </div>
    )
}

export default MerchantOrderHistoryPage
