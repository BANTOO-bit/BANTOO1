import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MerchantBottomNavigation from '../../components/merchant/MerchantBottomNavigation'

function MerchantSalesReportPage() {
    const navigate = useNavigate()
    const [selectedPeriod, setSelectedPeriod] = useState('today')

    const periods = [
        { id: 'today', label: 'Hari Ini' },
        { id: 'week', label: 'Minggu Ini' },
        { id: 'month', label: 'Bulan Ini' }
    ]

    const topSellers = [
        { name: 'Bakso Urat Jumbo', sold: 42, percentage: 85 },
        { name: 'Mie Ayam Spesial', sold: 35, percentage: 70 },
        { name: 'Es Teh Manis', sold: 28, percentage: 55 },
        { name: 'Kerupuk Putih', sold: 15, percentage: 30 }
    ]

    const salesData = [
        { day: 'Sen', height: '40%' },
        { day: 'Sel', height: '65%' },
        { day: 'Rab', height: '50%' },
        { day: 'Kam', height: '85%' },
        { day: 'Jum', height: '60%' },
        { day: 'Sab', height: '95%', active: true },
        { day: 'Min', height: '75%' }
    ]

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 relative min-h-screen flex flex-col overflow-x-hidden pb-[88px]">
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

                {/* Summary Cards */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Total Omzet */}
                    <div className="bg-card-light dark:bg-card-dark p-4 rounded-2xl shadow-soft border border-border-color dark:border-gray-700 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-text-secondary">
                            <span className="material-symbols-outlined text-[20px] text-primary">payments</span>
                            <span className="text-xs font-medium">Total Omzet</span>
                        </div>
                        <h2 className="text-xl font-bold text-text-main dark:text-white">Rp 1.250.000</h2>
                        <p className="text-[10px] text-green-500 font-medium flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">trending_up</span>
                            +12% dari kemarin
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Total Pesanan */}
                        <div className="bg-card-light dark:bg-card-dark p-4 rounded-2xl shadow-soft border border-border-color dark:border-gray-700 flex flex-col justify-between">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-medium text-text-secondary">Total Pesanan</span>
                                <h2 className="text-lg font-bold text-text-main dark:text-white">24</h2>
                            </div>
                            <span className="text-[10px] text-green-500 font-medium">+4 order</span>
                        </div>

                        {/* Rata-rata */}
                        <div className="bg-card-light dark:bg-card-dark p-4 rounded-2xl shadow-soft border border-border-color dark:border-gray-700 flex flex-col justify-between">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-medium text-text-secondary">Rata-rata</span>
                                <h2 className="text-lg font-bold text-text-main dark:text-white">Rp 52k</h2>
                            </div>
                            <span className="text-[10px] text-text-secondary font-medium">per order</span>
                        </div>
                    </div>
                </section>

                {/* Sales Trend Chart */}
                <section className="bg-card-light dark:bg-card-dark p-5 rounded-2xl shadow-soft border border-border-color dark:border-gray-700">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-bold text-text-main dark:text-white">Tren Penjualan</h3>
                        <span className="text-xs text-text-secondary">7 Hari Terakhir</span>
                    </div>
                    <div className="flex items-end justify-between h-[120px] gap-2">
                        {salesData.map((data, index) => (
                            <div key={index} className="flex flex-col items-center gap-2 w-full group">
                                <div className="relative w-full bg-orange-50 dark:bg-orange-900/20 rounded-t-lg h-full flex items-end overflow-hidden">
                                    <div
                                        className={`w-full ${data.active ? 'bg-primary' : 'bg-primary/40 group-hover:bg-primary'} transition-all duration-300 rounded-t-lg ${data.active ? 'shadow-sm' : ''}`}
                                        style={{ height: data.height }}
                                    />
                                </div>
                                <span className={`text-[10px] font-medium ${data.active ? 'text-primary font-bold' : 'text-text-secondary'}`}>
                                    {data.day}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Top Sellers */}
                <section className="flex flex-col gap-4">
                    <h3 className="text-sm font-bold text-text-main dark:text-white px-1">Menu Terlaris</h3>
                    <div className="bg-card-light dark:bg-card-dark rounded-2xl shadow-soft border border-border-color dark:border-gray-700 p-4 flex flex-col gap-5">
                        {topSellers.map((item, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <span className={`flex items-center justify-center w-6 h-6 rounded-full ${index === 0 ? 'bg-orange-100 text-primary' : 'bg-gray-100 text-text-secondary'} text-xs font-bold`}>
                                    {index + 1}
                                </span>
                                <div className="flex-1 flex flex-col gap-1.5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-semibold text-text-main dark:text-white">{item.name}</span>
                                        <span className="text-xs font-bold text-text-main dark:text-white">{item.sold} terjual</span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                                        <div
                                            className={`${index === 0 ? 'bg-primary' : `bg-primary/${100 - index * 20}`} h-1.5 rounded-full`}
                                            style={{ width: `${item.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="h-8" />
            </main>

            <MerchantBottomNavigation activeTab="home" />
        </div>
    )
}

export default MerchantSalesReportPage
