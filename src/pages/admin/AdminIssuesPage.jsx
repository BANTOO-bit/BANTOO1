import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminHeader from '../../components/admin/AdminHeader'

export default function AdminIssuesPage() {
    const navigate = useNavigate()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [activeTab, setActiveTab] = useState('all') // all, open, closed
    const [filterCategory, setFilterCategory] = useState('Semua Kategori')

    // Mock Data
    const [issues, setIssues] = useState([
        {
            id: 'ORD-8921',
            time: '12 Okt, 10:30',
            type: 'Indikasi Fraud (Promo)',
            typeIcon: 'warning',
            typeColor: 'red',
            description: 'Penggunaan voucher ganda terdeteksi',
            related: { name: 'Rizky Billar', role: 'Pelanggan', initials: 'RB', color: 'blue' },
            status: 'Terbuka',
            statusColor: 'red'
        },
        {
            id: 'ORD-8922',
            time: '12 Okt, 10:15',
            type: 'Makanan Tidak Sesuai',
            typeIcon: 'restaurant_menu',
            typeColor: 'orange',
            description: 'Laporan pelanggan: makanan basi',
            related: { name: 'Nasi Goreng Gila', role: 'Warung', initials: 'NG', color: 'orange' },
            status: 'Investigasi',
            statusColor: 'orange'
        },
        {
            id: 'ORD-8920',
            time: '12 Okt, 09:45',
            type: 'Driver Tidak Bergerak',
            typeIcon: 'two_wheeler',
            typeColor: 'gray',
            description: 'Lokasi driver stuck > 15 menit',
            related: { name: 'Asep Surasep', role: 'Driver', initials: 'AS', color: 'purple' },
            status: 'Selesai',
            statusColor: 'green'
        },
        {
            id: 'ORD-8919',
            time: '12 Okt, 09:10',
            type: 'Warung Tutup Tiba-tiba',
            typeIcon: 'block',
            typeColor: 'red',
            description: 'Driver melaporkan resto tutup',
            related: { name: 'Ayam Geprek Bensu', role: 'Warung', initials: 'AB', color: 'orange' },
            status: 'Terbuka',
            statusColor: 'red'
        },
        {
            id: 'ORD-8915',
            time: '12 Okt, 08:30',
            type: 'Masalah Pembayaran',
            typeIcon: 'payments',
            typeColor: 'gray',
            description: 'Saldo terpotong tapi order gagal',
            related: { name: 'Putri Delina', role: 'Pelanggan', initials: 'PD', color: 'blue' },
            status: 'Selesai',
            statusColor: 'green'
        }
    ])

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Terbuka':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                        Terbuka
                    </span>
                )
            case 'Investigasi':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                        Investigasi
                    </span>
                )
            case 'Selesai':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        Selesai
                    </span>
                )
            default:
                return null
        }
    }

    const filteredIssues = issues.filter(issue => {
        if (activeTab === 'open' && issue.status === 'Selesai') return false
        if (activeTab === 'closed' && issue.status !== 'Selesai') return false
        return true
    })

    return (
        <div className="flex min-h-screen w-full bg-[#f6f7f8] dark:bg-[#101922] font-display text-[#111418] dark:text-white overflow-x-hidden relative">
            <AdminSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <main className="flex-1 lg:ml-[280px] flex flex-col min-w-0 relative">
                <AdminHeader
                    onMenuClick={() => setIsSidebarOpen(true)}
                    title="Pusat Bantuan & Masalah Operasional"
                />

                <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto flex flex-col h-full gap-6">

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white dark:bg-[#1a2632] p-5 rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-[#617589] dark:text-[#94a3b8] text-sm font-medium mb-1">Tiket Terbuka</p>
                                    <p className="text-2xl font-bold text-[#111418] dark:text-white">8 <span className="text-sm font-normal text-red-500 ml-1">Kritis</span></p>
                                </div>
                                <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center">
                                    <span className="material-symbols-outlined">warning</span>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-[#1a2632] p-5 rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-[#617589] dark:text-[#94a3b8] text-sm font-medium mb-1">Sedang Ditangani</p>
                                    <p className="text-2xl font-bold text-[#111418] dark:text-white">12</p>
                                </div>
                                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-primary flex items-center justify-center">
                                    <span className="material-symbols-outlined">engineering</span>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-[#1a2632] p-5 rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-[#617589] dark:text-[#94a3b8] text-sm font-medium mb-1">Diselesaikan Hari Ini</p>
                                    <p className="text-2xl font-bold text-[#111418] dark:text-white">24</p>
                                </div>
                                <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center">
                                    <span className="material-symbols-outlined">check_circle</span>
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center p-1 bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg w-fit">
                                <button
                                    onClick={() => setActiveTab('all')}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'all' ? 'bg-primary/10 text-primary' : 'text-[#617589] dark:text-[#94a3b8] hover:text-[#111418] dark:hover:text-white'}`}
                                >
                                    Semua
                                </button>
                                <button
                                    onClick={() => setActiveTab('open')}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'open' ? 'bg-primary/10 text-primary' : 'text-[#617589] dark:text-[#94a3b8] hover:text-[#111418] dark:hover:text-white'}`}
                                >
                                    Terbuka
                                </button>
                                <button
                                    onClick={() => setActiveTab('closed')}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'closed' ? 'bg-primary/10 text-primary' : 'text-[#617589] dark:text-[#94a3b8] hover:text-[#111418] dark:hover:text-white'}`}
                                >
                                    Selesai
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <select
                                        value={filterCategory}
                                        onChange={(e) => setFilterCategory(e.target.value)}
                                        className="appearance-none pl-3 pr-8 py-2 bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg text-sm text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        <option>Semua Kategori</option>
                                        <option>Fraud</option>
                                        <option>Layanan</option>
                                        <option>Aplikasi</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-[#617589]">
                                        <span className="material-symbols-outlined text-[18px]">expand_more</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        {issues.length === 0 ? (
                            <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm flex-1 flex flex-col items-center justify-center p-12 min-h-[400px]">
                                <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6 ring-8 ring-green-50/50 dark:ring-green-900/10">
                                    <span className="material-symbols-outlined text-4xl text-green-600 dark:text-green-400">verified_user</span>
                                </div>
                                <h3 className="text-xl font-bold text-[#111418] dark:text-white mb-2 text-center">Belum Ada Laporan Masalah</h3>
                                <p className="text-[#617589] dark:text-[#94a3b8] text-sm text-center max-w-sm leading-relaxed">
                                    Semua operasional berjalan lancar. Laporan dari pelanggan, warung, atau driver akan muncul di sini jika terjadi kendala.
                                </p>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm overflow-hidden flex-1">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-[#f9fafb] dark:bg-[#1e2c3a] border-b border-[#e5e7eb] dark:border-[#2a3b4d]">
                                                <th className="px-6 py-3.5 text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider whitespace-nowrap">Order ID</th>
                                                <th className="px-6 py-3.5 text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider whitespace-nowrap">Jenis Masalah</th>
                                                <th className="px-6 py-3.5 text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider whitespace-nowrap">Pihak Terkait</th>
                                                <th className="px-6 py-3.5 text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider whitespace-nowrap">Status</th>
                                                <th className="px-6 py-3.5 text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider text-right whitespace-nowrap">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#2a3b4d]">
                                            {filteredIssues.map((issue) => (
                                                <tr key={issue.id} className="hover:bg-[#f9fafb] dark:hover:bg-[#202e3b] transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-[#111418] dark:text-white text-sm">#{issue.id}</span>
                                                            <span className="text-xs text-[#617589] dark:text-[#94a3b8]">{issue.time}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`material-symbols-outlined text-${issue.typeColor}-500 text-[18px]`}>{issue.typeIcon}</span>
                                                            <span className="text-sm text-[#111418] dark:text-white font-medium">{issue.type}</span>
                                                        </div>
                                                        <p className="text-xs text-[#617589] dark:text-[#94a3b8] mt-1 pl-6">{issue.description}</p>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-full bg-${issue.related.color}-100 text-${issue.related.color}-600 dark:bg-${issue.related.color}-900/30 dark:text-${issue.related.color}-300 flex items-center justify-center text-xs font-bold`}>
                                                                {issue.related.initials}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-[#111418] dark:text-white">{issue.related.name}</p>
                                                                <p className="text-xs text-[#617589] dark:text-[#94a3b8]">{issue.related.role}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStatusBadge(issue.status)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {issue.status === 'Selesai' ? (
                                                                <Link to={`/admin/issues/${issue.id}`} className="px-3 py-1.5 text-xs font-semibold text-primary border border-primary/20 hover:bg-primary/5 rounded-lg transition-colors">
                                                                    Lihat Detail
                                                                </Link>
                                                            ) : (
                                                                <>
                                                                    <Link to={`/admin/issues/${issue.id}`} className="px-3 py-1.5 text-xs font-semibold text-primary border border-primary/20 hover:bg-primary/5 rounded-lg transition-colors">
                                                                        Tindak Lanjut
                                                                    </Link>
                                                                    <button className="px-3 py-1.5 text-xs font-medium text-[#617589] hover:bg-gray-100 dark:hover:bg-[#2a3b4d] rounded-lg transition-colors">
                                                                        Tutup Kasus
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="px-6 py-4 border-t border-[#e5e7eb] dark:border-[#2a3b4d] flex items-center justify-between">
                                    <p className="text-sm text-[#617589] dark:text-[#94a3b8]">Menampilkan <span className="font-semibold text-[#111418] dark:text-white">1-{filteredIssues.length}</span> dari <span className="font-semibold text-[#111418] dark:text-white">{issues.length}</span> masalah</p>
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
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
