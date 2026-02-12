import { useState } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminHeader from '../../components/admin/AdminHeader'

export default function AdminOrdersPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    // Sample Order Data
    const orders = [
        { id: '#ORD-8840', time: '10:45 • 12/10/23', warung: 'Sate Madura Cak Dul', driver: 'Budi Santoso', total: 'Rp 45.000', method: 'COD', status: 'Menyiapkan', statusColor: 'orange' },
        { id: '#ORD-8839', time: '10:30 • 12/10/23', warung: 'Geprek Bensu', driver: 'Andi Pratama', total: 'Rp 32.000', method: 'Transfer', status: 'Diantar', statusColor: 'blue' },
        { id: '#ORD-8838', time: '10:15 • 12/10/23', warung: 'RM Padang Sederhana', driver: 'Rina Mulyani', total: 'Rp 55.000', method: 'COD', status: 'Selesai', statusColor: 'emerald' },
        { id: '#ORD-8837', time: '09:50 • 12/10/23', warung: 'Bakso Solo Samrat', driver: '--', total: 'Rp 25.000', method: 'Transfer', status: 'Dibatalkan', statusColor: 'red' },
        { id: '#ORD-8836', time: '09:40 • 12/10/23', warung: 'Mie Gacoan', driver: 'Dedi Kurniawan', total: 'Rp 40.000', method: 'COD', status: 'Selesai', statusColor: 'emerald' },
        { id: '#ORD-8835', time: '09:20 • 12/10/23', warung: 'Kopi Kenangan', driver: 'Siti Aminah', total: 'Rp 18.000', method: 'Transfer', status: 'Selesai', statusColor: 'emerald' },
        { id: '#ORD-8834', time: '09:05 • 12/10/23', warung: 'Warteg Bahari', driver: 'Joko Widodo', total: 'Rp 22.000', method: 'COD', status: 'Selesai', statusColor: 'emerald' },
        { id: '#ORD-8833', time: '08:50 • 12/10/23', warung: 'Bubur Ayam Cirebon', driver: 'Ahmad Zaky', total: 'Rp 15.000', method: 'COD', status: 'Selesai', statusColor: 'emerald' },
        { id: '#ORD-8832', time: '08:30 • 12/10/23', warung: 'Soto Lamongan', driver: 'Rizky Febian', total: 'Rp 30.000', method: 'Transfer', status: 'Dibatalkan', statusColor: 'red' },
        { id: '#ORD-8831', time: '08:15 • 12/10/23', warung: 'Martabak Bangka', driver: 'Eko Patrio', total: 'Rp 45.000', method: 'Transfer', status: 'Selesai', statusColor: 'emerald' },
    ]

    return (
        <div className="flex min-h-screen w-full bg-[#f6f7f8] dark:bg-[#101922] font-display text-[#111418] dark:text-white overflow-x-hidden">
            <AdminSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <main className="flex-1 lg:ml-[240px] flex flex-col min-w-0">
                <AdminHeader
                    onMenuClick={() => setIsSidebarOpen(true)}
                    title="Daftar Semua Transaksi"
                    showBack={true}
                />

                <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto flex flex-col gap-6 h-full">

                        {/* Filters */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#1a2632] p-4 rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d]">
                            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                                <div className="relative w-full md:w-64">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#617589]">
                                        <span className="material-symbols-outlined text-[20px]">search</span>
                                    </div>
                                    <input className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-[#1a2632] border border-[#d1d5db] dark:border-[#4b5563] rounded-lg focus:ring-1 focus:ring-primary focus:border-primary text-[#111418] dark:text-white" placeholder="Cari pesanan..." type="text" />
                                </div>
                                <div className="relative w-full md:w-48">
                                    <select className="w-full pl-3 pr-8 py-2 text-sm bg-white dark:bg-[#1a2632] border border-[#d1d5db] dark:border-[#4b5563] rounded-lg focus:ring-1 focus:ring-primary focus:border-primary text-[#111418] dark:text-white appearance-none cursor-pointer">
                                        <option value="">Semua Status</option>
                                        <option value="menyiapkan">Menyiapkan</option>
                                        <option value="diantar">Diantar</option>
                                        <option value="selesai">Selesai</option>
                                        <option value="dibatalkan">Dibatalkan</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-[#617589]">
                                        <span className="material-symbols-outlined text-[20px]">arrow_drop_down</span>
                                    </div>
                                </div>
                                <div className="relative w-full md:w-48">
                                    <select className="w-full pl-3 pr-8 py-2 text-sm bg-white dark:bg-[#1a2632] border border-[#d1d5db] dark:border-[#4b5563] rounded-lg focus:ring-1 focus:ring-primary focus:border-primary text-[#111418] dark:text-white appearance-none cursor-pointer">
                                        <option value="">Hari Ini</option>
                                        <option value="kemarin">Kemarin</option>
                                        <option value="minggu_ini">Minggu Ini</option>
                                        <option value="bulan_ini">Bulan Ini</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-[#617589]">
                                        <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 text-sm font-medium text-[#111418] dark:text-white bg-white dark:bg-[#1a2632] border border-[#d1d5db] dark:border-[#4b5563] rounded-lg hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d] transition-colors flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">download</span>
                                    Ekspor
                                </button>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm flex-1 flex flex-col overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left whitespace-nowrap">
                                    <thead className="bg-[#f9fafb] dark:bg-[#1e2c3a] text-[#617589] dark:text-[#94a3b8] font-medium border-b border-[#e5e7eb] dark:border-[#2a3b4d]">
                                        <tr>
                                            <th className="px-6 py-4">ID Pesanan</th>
                                            <th className="px-6 py-4">Waktu (Jam/Tgl)</th>
                                            <th className="px-6 py-4">Nama Warung</th>
                                            <th className="px-6 py-4">Nama Driver</th>
                                            <th className="px-6 py-4">Total Pembayaran</th>
                                            <th className="px-6 py-4">Metode Bayar</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#2a3b4d]">
                                        {orders.map((order, index) => (
                                            <tr key={index} className="hover:bg-[#f9fafb] dark:hover:bg-[#202e3b] transition-colors">
                                                <td className="px-6 py-4 font-semibold text-[#111418] dark:text-white">{order.id}</td>
                                                <td className="px-6 py-4 text-[#617589] dark:text-[#94a3b8]">{order.time}</td>
                                                <td className="px-6 py-4 text-[#111418] dark:text-white font-medium">{order.warung}</td>
                                                <td className={`px-6 py-4 ${order.driver === '--' ? 'text-[#617589] dark:text-[#94a3b8] italic' : 'text-[#617589] dark:text-[#94a3b8]'}`}>{order.driver}</td>
                                                <td className="px-6 py-4 font-medium text-[#111418] dark:text-white">{order.total}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${order.method === 'COD'
                                                        ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                                                        : 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-blue-100 dark:border-blue-800'
                                                        }`}>
                                                        {order.method}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-${order.statusColor}-100 text-${order.statusColor}-700 dark:bg-${order.statusColor}-900/30 dark:text-${order.statusColor}-400`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full bg-${order.statusColor}-500 ${order.status === 'Menyiapkan' ? 'animate-pulse' : ''}`}></span>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-[#617589] hover:text-primary transition-colors"><span className="material-symbols-outlined">more_vert</span></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-6 py-4 border-t border-[#e5e7eb] dark:border-[#2a3b4d] flex items-center justify-between">
                                <p className="text-sm text-[#617589] dark:text-[#94a3b8]">
                                    Menampilkan <span className="font-semibold text-[#111418] dark:text-white">1-5</span> dari <span className="font-semibold text-[#111418] dark:text-white">1.240</span> pesanan
                                </p>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] text-[#617589] dark:text-[#94a3b8] hover:bg-[#f0f2f4] dark:hover:bg-[#202e3b] disabled:opacity-50 transition-colors" disabled>
                                        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                                    </button>
                                    <button className="p-2 rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] text-[#617589] dark:text-[#94a3b8] hover:bg-[#f0f2f4] dark:hover:bg-[#202e3b] transition-colors">
                                        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    )
}
