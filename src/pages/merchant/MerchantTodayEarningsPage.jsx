import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MerchantBottomNavigation from '../../components/merchant/MerchantBottomNavigation'

function MerchantTodayEarningsPage() {
    const navigate = useNavigate()

    const earnings = {
        gross: 1400000,
        deduction: 150000,
        net: 1250000
    }

    const transactions = [
        { id: 'JKT-8825', time: '14:45', item: 'Mie Ayam Spesial', amount: 18000, status: 'success' },
        { id: 'JKT-8821', time: '14:32', item: 'Bakso Urat Jumbo...', amount: 35000, status: 'success' },
        { id: 'JKT-8818', time: '13:15', item: 'Es Teh Manis (2)', amount: 10000, status: 'success' },
        { id: 'JKT-8812', time: '11:05', item: 'Mie Yamin...', amount: 22000, status: 'cancelled' }
    ]

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
                        <p className="text-xs text-text-secondary mt-0.5">Senin, 16 Oktober 2023</p>
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

                {/* Sales Trend Chart */}
                <section className="bg-card-light dark:bg-card-dark rounded-2xl p-5 shadow-soft border border-border-color dark:border-gray-700">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[20px]">ssid_chart</span>
                            <span className="text-xs font-bold text-text-main dark:text-white">Tren Penjualan</span>
                        </div>
                        <div className="flex items-center gap-1 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-md">
                            <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-[14px]">trending_up</span>
                            <span className="text-[10px] font-bold text-green-600 dark:text-green-400">+12%</span>
                        </div>
                    </div>
                    <div className="relative w-full h-32">
                        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 300 100">
                            {/* Grid lines */}
                            <line className="dark:stroke-gray-700" stroke="#EAEAEA" strokeDasharray="4" strokeWidth="1" x1="0" x2="300" y1="0" y2="0" />
                            <line className="dark:stroke-gray-700" stroke="#EAEAEA" strokeDasharray="4" strokeWidth="1" x1="0" x2="300" y1="50" y2="50" />
                            <line className="dark:stroke-gray-700" stroke="#EAEAEA" strokeDasharray="4" strokeWidth="1" x1="0" x2="300" y1="100" y2="100" />

                            {/* Gradient definition */}
                            <defs>
                                <linearGradient id="gradientDetails" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.2" />
                                    <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
                                </linearGradient>
                            </defs>

                            {/* Line path */}
                            <path
                                d="M0,80 C40,80 60,30 100,40 C140,50 160,80 200,60 C240,40 260,10 300,20"
                                fill="none"
                                stroke="#FF6B00"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="3"
                            />

                            {/* Fill area */}
                            <path
                                d="M0,80 C40,80 60,30 100,40 C140,50 160,80 200,60 C240,40 260,10 300,20 V100 H0 Z"
                                fill="url(#gradientDetails)"
                                stroke="none"
                            />

                            {/* Data points */}
                            <circle cx="100" cy="40" fill="#FFFFFF" r="3" stroke="#FF6B00" strokeWidth="2" />
                            <circle cx="200" cy="60" fill="#FFFFFF" r="3" stroke="#FF6B00" strokeWidth="2" />
                            <circle cx="300" cy="20" fill="#FFFFFF" r="3" stroke="#FF6B00" strokeWidth="2" />
                        </svg>
                    </div>
                    <div className="flex justify-between mt-3 px-1 text-[10px] text-text-secondary font-medium">
                        <span>08:00</span>
                        <span>12:00</span>
                        <span>16:00</span>
                        <span>20:00</span>
                    </div>
                </section>

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
                            <span className="text-xs font-medium text-text-secondary">Potongan Aplikasi</span>
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
                    {transactions.map((transaction) => (
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
                                        <span className="text-[10px] text-text-secondary">{transaction.item}</span>
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
                    ))}
                </section>
            </main>

            <MerchantBottomNavigation activeTab="home" />
        </div>
    )
}

export default MerchantTodayEarningsPage
