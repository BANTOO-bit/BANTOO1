import { useState } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminHeader from '../../components/admin/AdminHeader'

export default function AdminFinancesPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    // Stats data
    const stats = [
        { label: 'Total COD Hari Ini', value: 'Rp 4,250,000', subtext: '18 transaksi', icon: 'account_balance_wallet', color: 'blue' },
        { label: 'Sudah Disetor', value: 'Rp 1,200,000', subtext: '5 driver', icon: 'verified', color: 'green' },
        { label: 'Sisa Belum Disetor', value: 'Rp 3,050,000', subtext: '13 driver', icon: 'pending_actions', color: 'red' },
    ]

    return (
        <div className="flex min-h-screen w-full bg-[#f6f7f8] dark:bg-[#101922] font-display text-[#111418] dark:text-white overflow-x-hidden">
            <AdminSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <main className="flex-1 lg:ml-[280px] flex flex-col min-w-0">
                <AdminHeader
                    onMenuClick={() => setIsSidebarOpen(true)}
                    title="Kontrol COD & Setoran"
                />

                <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto flex flex-col gap-6 h-full">

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {stats.map((stat, index) => (
                                <div key={index} className={`p-6 rounded-xl border shadow-sm flex flex-col justify-between h-36 ${stat.color === 'red' ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800 ring-1 ring-red-100 dark:ring-red-900/30' : 'bg-white dark:bg-[#1a2632] border-[#e5e7eb] dark:border-[#2a3b4d]'}`}>
                                    <div className="flex items-center justify-between">
                                        <p className={`text-sm font-medium ${stat.color === 'red' ? 'text-red-700 dark:text-red-300 font-bold' : 'text-[#617589] dark:text-[#94a3b8]'}`}>
                                            {stat.label}
                                        </p>
                                        <div className={`p-2 rounded-lg ${stat.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
                                                stat.color === 'green' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
                                                    'bg-white dark:bg-red-900/40 text-red-600 dark:text-red-400 shadow-sm'
                                            }`}>
                                            <span className="material-symbols-outlined text-[24px]">{stat.icon}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className={`text-3xl font-bold tracking-tight ${stat.color === 'red' ? 'text-red-700 dark:text-red-400' : stat.color === 'green' ? 'text-green-600 dark:text-green-400' : 'text-[#111418] dark:text-white'}`}>
                                            {stat.value}
                                        </p>
                                        <p className={`text-xs mt-1 ${stat.color === 'red' ? 'text-red-600/80 dark:text-red-300/70 font-medium' : 'text-[#617589] dark:text-[#94a3b8]'}`}>
                                            {stat.subtext}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Recent COD Transactions / Empty State */}
                        <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm flex flex-col overflow-hidden min-h-[400px]">
                            <div className="p-6 border-b border-[#e5e7eb] dark:border-[#2a3b4d] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <h3 className="text-lg font-bold text-[#111418] dark:text-white">Rekapitulasi Driver</h3>
                                <div className="flex items-center gap-3">
                                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#617589] dark:text-[#94a3b8] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d] transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">filter_list</span>
                                        Filter Status
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-admin-primary rounded-lg shadow-sm opacity-50 cursor-not-allowed" disabled>
                                        <span className="material-symbols-outlined text-[18px]">download</span>
                                        Unduh Laporan
                                    </button>
                                </div>
                            </div>

                            {/* Empty State Content */}
                            <div className="flex-1 flex flex-col items-center justify-center py-20 px-6 text-center">
                                <div className="bg-[#f0f2f4] dark:bg-[#2a3b4d] w-24 h-24 rounded-full flex items-center justify-center mb-6">
                                    <span className="material-symbols-outlined text-5xl text-[#617589] dark:text-[#94a3b8]">account_balance_wallet</span>
                                </div>
                                <h4 className="text-xl font-bold text-[#111418] dark:text-white mb-2">Belum Ada Transaksi COD</h4>
                                <p className="text-[#617589] dark:text-[#94a3b8] max-w-md mx-auto">
                                    Data setoran kurir akan muncul di sini setelah ada pesanan dengan metode pembayaran COD yang diselesaikan hari ini.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    )
}
