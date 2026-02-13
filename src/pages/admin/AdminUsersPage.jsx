import { useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
export default function AdminUsersPage() {
    const [filterStatus, setFilterStatus] = useState('all')

    // Sample Data
    const users = [
        { id: 'USR-001', name: 'Rina Wati', email: 'rina.wati@gmail.com', phone: '0812-3456-7890', joined: '15 Jan 2024', totalOrders: 42, totalSpent: 'Rp 1.280.000', status: 'Aktif', initials: 'RW', color: 'blue' },
        { id: 'USR-002', name: 'Hendra Gunawan', email: 'hendra.g@yahoo.com', phone: '0856-1234-5678', joined: '22 Feb 2024', totalOrders: 18, totalSpent: 'Rp 540.000', status: 'Aktif', initials: 'HG', color: 'indigo' },
        { id: 'USR-003', name: 'Maya Putri', email: 'maya.putri@gmail.com', phone: '0878-9876-5432', joined: '03 Mar 2024', totalOrders: 67, totalSpent: 'Rp 2.150.000', status: 'Aktif', initials: 'MP', color: 'pink' },
        { id: 'USR-004', name: 'Dimas Prasetyo', email: 'dimas.p@outlook.com', phone: '0813-5544-3322', joined: '10 Apr 2024', totalOrders: 5, totalSpent: 'Rp 125.000', status: 'Nonaktif', initials: 'DP', color: 'gray' },
        { id: 'USR-005', name: 'Sari Rahayu', email: 'sari.r@gmail.com', phone: '0821-6677-8899', joined: '28 Mei 2024', totalOrders: 31, totalSpent: 'Rp 980.000', status: 'Aktif', initials: 'SR', color: 'emerald' },
        { id: 'USR-006', name: 'Fajar Hidayat', email: 'fajar.h@gmail.com', phone: '0857-1122-3344', joined: '14 Jun 2024', totalOrders: 0, totalSpent: 'Rp 0', status: 'Banned', initials: 'FH', color: 'red' },
    ]

    const filteredUsers = filterStatus === 'all'
        ? users
        : users.filter(u => u.status === filterStatus)

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Aktif':
                return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800'
            case 'Nonaktif':
                return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            case 'Banned':
                return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800'
            default:
                return 'bg-gray-100 text-gray-600'
        }
    }

    const getAvatarColors = (color) => {
        const map = {
            blue: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300',
            indigo: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300',
            pink: 'bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-300',
            gray: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
            emerald: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300',
            red: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300',
        }
        return map[color] || map.blue
    }

    return (
        <AdminLayout title="Manajemen Pelanggan">

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl p-5 flex flex-col gap-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-[#617589] dark:text-[#94a3b8]">groups</span>
                                    <p className="text-[#617589] dark:text-[#94a3b8] text-sm font-medium">Total Pelanggan</p>
                                </div>
                                <h3 className="text-3xl font-bold text-[#111418] dark:text-white">2,847</h3>
                            </div>
                            <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl p-5 flex flex-col gap-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-green-500">fiber_manual_record</span>
                                    <p className="text-[#617589] dark:text-[#94a3b8] text-sm font-medium">Pelanggan Aktif</p>
                                </div>
                                <h3 className="text-3xl font-bold text-[#111418] dark:text-white">2,391</h3>
                            </div>
                            <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl p-5 flex flex-col gap-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-blue-500">person_add</span>
                                    <p className="text-[#617589] dark:text-[#94a3b8] text-sm font-medium">Baru Minggu Ini</p>
                                </div>
                                <h3 className="text-3xl font-bold text-[#111418] dark:text-white">28</h3>
                            </div>
                            <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl p-5 flex flex-col gap-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-red-500">block</span>
                                    <p className="text-[#617589] dark:text-[#94a3b8] text-sm font-medium">Di-banned</p>
                                </div>
                                <h3 className="text-3xl font-bold text-[#111418] dark:text-white">12</h3>
                            </div>
                        </div>

                        {/* Filter & Search Bar */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-1">
                            <h3 className="text-lg font-bold text-[#111418] dark:text-white">Daftar Pelanggan</h3>
                            <div className="flex gap-2 flex-wrap">
                                <div className="flex p-1 bg-gray-100 dark:bg-[#2a3b4d] rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d]">
                                    {['all', 'Aktif', 'Nonaktif', 'Banned'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => setFilterStatus(status)}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${filterStatus === status
                                                ? 'bg-white dark:bg-[#1a2632] text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                                                : 'text-[#617589] dark:text-[#94a3b8] hover:text-[#111418] dark:hover:text-white'
                                                }`}
                                        >
                                            {status === 'all' ? 'Semua' : status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Users Table */}
                        <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl overflow-hidden flex-1 mb-20">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-[#e5e7eb] dark:border-[#2a3b4d] text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase bg-[#f9fafb] dark:bg-[#1e2c3a]">
                                            <th className="px-6 py-4 whitespace-nowrap">Pelanggan</th>
                                            <th className="px-6 py-4 whitespace-nowrap">Kontak</th>
                                            <th className="px-6 py-4 whitespace-nowrap">Bergabung</th>
                                            <th className="px-6 py-4 whitespace-nowrap text-right">Total Pesanan</th>
                                            <th className="px-6 py-4 whitespace-nowrap text-right">Total Belanja</th>
                                            <th className="px-6 py-4 whitespace-nowrap">Status</th>
                                            <th className="px-6 py-4 whitespace-nowrap text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#2a3b4d]">
                                        {filteredUsers.map((user) => (
                                            <tr key={user.id} className="hover:bg-[#f9fafb] dark:hover:bg-[#202e3b] transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-full ${getAvatarColors(user.color)} flex items-center justify-center font-bold text-sm`}>
                                                            {user.initials}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-[#111418] dark:text-white">{user.name}</p>
                                                            <p className="text-xs text-[#617589] dark:text-[#94a3b8]">{user.id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-[#111418] dark:text-white">{user.email}</p>
                                                    <p className="text-xs text-[#617589] dark:text-[#94a3b8]">{user.phone}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-[#617589] dark:text-[#94a3b8]">{user.joined}</p>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <p className="text-sm font-semibold text-[#111418] dark:text-white">{user.totalOrders}</p>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <p className="text-sm font-medium text-[#111418] dark:text-white">{user.totalSpent}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(user.status)}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Aktif' ? 'bg-green-500' : user.status === 'Banned' ? 'bg-red-500' : 'bg-gray-500'}`}></span>
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="relative inline-block text-left group">
                                                        <button className="text-[#617589] hover:text-[#111418] dark:text-[#94a3b8] dark:hover:text-white p-2 hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d] rounded-lg transition-colors">
                                                            <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                                        </button>
                                                        <div className="hidden group-hover:block absolute right-0 top-full z-50 w-48 bg-white dark:bg-[#1a2632] rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] flex flex-col py-1 text-left shadow-lg">
                                                            <button className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#111418] dark:text-white hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d] transition-colors w-full text-left">
                                                                <span className="material-symbols-outlined text-[18px] text-[#617589] dark:text-[#94a3b8]">person</span>
                                                                Lihat Detail
                                                            </button>
                                                            <button className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#111418] dark:text-white hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d] transition-colors w-full text-left">
                                                                <span className="material-symbols-outlined text-[18px] text-[#617589] dark:text-[#94a3b8]">history</span>
                                                                Riwayat Pesanan
                                                            </button>
                                                            <div className="h-px bg-[#e5e7eb] dark:bg-[#2a3b4d] my-1 mx-2"></div>
                                                            {user.status === 'Banned' ? (
                                                                <button className="flex items-center gap-3 px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors w-full text-left">
                                                                    <span className="material-symbols-outlined text-[18px]">lock_open</span>
                                                                    Unban Pelanggan
                                                                </button>
                                                            ) : (
                                                                <button className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left">
                                                                    <span className="material-symbols-outlined text-[18px]">block</span>
                                                                    Ban Pelanggan
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-6 py-4 border-t border-[#e5e7eb] dark:border-[#2a3b4d] flex items-center justify-between">
                                <p className="text-sm text-[#617589] dark:text-[#94a3b8]">Menampilkan <span className="font-semibold text-[#111418] dark:text-white">1-{filteredUsers.length}</span> dari <span className="font-semibold text-[#111418] dark:text-white">2,847</span> pelanggan</p>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] text-[#617589] dark:text-[#94a3b8] hover:bg-[#f0f2f4] dark:hover:bg-[#202e3b] disabled:opacity-50" disabled>
                                        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                                    </button>
                                    <button className="p-2 rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] text-[#617589] dark:text-[#94a3b8] hover:bg-[#f0f2f4] dark:hover:bg-[#202e3b]">
                                        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                                    </button>
                                </div>
                            </div>
                        </div>
        </AdminLayout>
    )
}
