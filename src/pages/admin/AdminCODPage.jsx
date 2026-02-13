import { useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
export default function AdminCODPage() {
    const [showReminderModal, setShowReminderModal] = useState(false)
    const [selectedDriver, setSelectedDriver] = useState(null)

    // Sample Data for COD List
    const codList = [
        {
            id: 'DRV-082',
            name: 'Budi Santoso',
            initials: 'BS',
            color: 'gray',
            codFee: 75000,
            deposited: 75000,
            remaining: 0,
            status: 'Lunas',
            statusColor: 'green'
        },
        {
            id: 'DRV-104',
            name: 'Ahmad Rizky',
            initials: 'AR',
            color: 'blue',
            codFee: 120000,
            deposited: 50000,
            remaining: 70000,
            status: 'Parsial',
            statusColor: 'yellow'
        },
        {
            id: 'DRV-055',
            name: 'Dedi Mahendra',
            initials: 'DM',
            color: 'red',
            codFee: 200000,
            deposited: 0,
            remaining: 200000,
            status: 'Belum Setor',
            statusColor: 'red',
            isOverLimit: true
        },
        {
            id: 'DRV-112',
            name: 'Indra Kurniawan',
            initials: 'IK',
            color: 'purple',
            codFee: 45000,
            deposited: 0,
            remaining: 45000,
            status: 'Menunggu',
            statusColor: 'gray'
        },
        {
            id: 'DRV-099',
            name: 'Ferry Pratama',
            initials: 'FP',
            color: 'gray',
            codFee: 85000,
            deposited: 0,
            remaining: 85000,
            status: 'Suspended',
            statusColor: 'red',
            isSuspended: true
        }
    ]

    const handleOpenReminder = (driver) => {
        setSelectedDriver(driver)
        setShowReminderModal(true)
    }

    const handleCloseReminder = () => {
        setShowReminderModal(false)
        setSelectedDriver(null)
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
    }

    return (
        <AdminLayout title="Kontrol COD & Setoran">

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-[#1a2632] p-6 rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm flex flex-col justify-between h-36">
                                <div className="flex items-center justify-between">
                                    <p className="text-[#617589] dark:text-[#94a3b8] text-sm font-medium">Total Fee Admin Hari Ini</p>
                                    <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-2 rounded-lg">
                                        <span className="material-symbols-outlined text-[24px]">account_balance_wallet</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-[#111418] dark:text-white tracking-tight">Rp 4.525.000</p>
                                    <p className="text-xs text-[#617589] dark:text-[#94a3b8] mt-1">Dari 184 pesanan selesai</p>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-[#1a2632] p-6 rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm flex flex-col justify-between h-36">
                                <div className="flex items-center justify-between">
                                    <p className="text-[#617589] dark:text-[#94a3b8] text-sm font-medium">Sudah Disetor</p>
                                    <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-2 rounded-lg">
                                        <span className="material-symbols-outlined text-[24px]">verified</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-green-600 dark:text-green-400 tracking-tight">Rp 3.210.000</p>
                                    <p className="text-xs text-[#617589] dark:text-[#94a3b8] mt-1">71% dari total tagihan fee</p>
                                </div>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-xl border border-red-200 dark:border-red-800 shadow-sm flex flex-col justify-between h-36 ring-1 ring-red-100 dark:ring-red-900/30">
                                <div className="flex items-center justify-between">
                                    <p className="text-red-700 dark:text-red-300 text-sm font-bold">Sisa Belum Disetor</p>
                                    <div className="bg-white dark:bg-red-900/40 text-red-600 dark:text-red-400 p-2 rounded-lg shadow-sm">
                                        <span className="material-symbols-outlined text-[24px]">pending_actions</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-red-700 dark:text-red-400 tracking-tight">Rp 1.315.000</p>
                                    <p className="text-xs text-red-600/80 dark:text-red-300/70 mt-1 font-medium">Perlu tindak lanjut segera</p>
                                </div>
                            </div>
                        </div>

                        {/* Recap Table */}
                        <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm flex flex-col overflow-hidden">
                            <div className="p-6 border-b border-[#e5e7eb] dark:border-[#2a3b4d] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <h3 className="text-lg font-bold text-[#111418] dark:text-white">Rekapitulasi Driver</h3>
                                <div className="flex items-center gap-3">
                                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#617589] dark:text-[#94a3b8] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d] transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">filter_list</span>
                                        Filter Status
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                                        <span className="material-symbols-outlined text-[18px]">download</span>
                                        Unduh Laporan
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#f9fafb] dark:bg-[#1e2c3a] border-b border-[#e5e7eb] dark:border-[#2a3b4d]">
                                            <th className="px-6 py-4 text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider">Driver</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider text-right">Ongkir COD (Fee Admin)</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider text-right">Disetor</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider text-right">Selisih</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider text-center">Status</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#2a3b4d]">
                                        {codList.map((driver) => (
                                            <tr
                                                key={driver.id}
                                                className={`transition-colors ${driver.isSuspended
                                                    ? 'bg-gray-50 dark:bg-[#15202b] opacity-75'
                                                    : driver.isOverLimit
                                                        ? 'bg-red-50/50 dark:bg-red-900/5 hover:bg-red-50 dark:hover:bg-red-900/10'
                                                        : 'hover:bg-[#f9fafb] dark:hover:bg-[#202e3b]'
                                                    }`}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-9 h-9 rounded-full bg-${driver.color}-100 dark:bg-${driver.color}-900/30 flex items-center justify-center text-${driver.color}-600 text-xs font-bold`}>
                                                            {driver.initials}
                                                        </div>
                                                        <div>
                                                            <p className={`text-sm font-medium text-[#111418] dark:text-white ${driver.isSuspended ? 'line-through' : ''}`}>
                                                                {driver.name}
                                                            </p>
                                                            <p className="text-xs text-[#617589] dark:text-[#94a3b8]">ID: {driver.id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-[#111418] dark:text-white font-medium">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <span>{formatCurrency(driver.codFee)}</span>
                                                        {driver.isOverLimit && (
                                                            <span className="material-symbols-outlined text-red-600 text-[18px]" title="Melewati Batas Maksimal">error</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600 dark:text-green-400 font-medium">
                                                    {formatCurrency(driver.deposited)}
                                                </td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-bold ${driver.remaining > 0 ? 'text-red-600 dark:text-red-400' : 'text-[#617589] dark:text-[#94a3b8]'}`}>
                                                    {driver.remaining > 0 ? formatCurrency(driver.remaining) : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                                        ${driver.status === 'Lunas' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800' : ''}
                                                        ${driver.status === 'Parsial' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800' : ''}
                                                        ${driver.status === 'Belum Setor' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800' : ''}
                                                        ${driver.status === 'Menunggu' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700' : ''}
                                                        ${driver.status === 'Suspended' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800' : ''}
                                                    `}>
                                                        {driver.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    {driver.status === 'Lunas' && (
                                                        <button className="text-[#617589] hover:text-[#111418] dark:hover:text-white transition-colors" title="Lihat Detail">
                                                            <span className="material-symbols-outlined">visibility</span>
                                                        </button>
                                                    )}
                                                    {(driver.status === 'Parsial' || driver.status === 'Menunggu') && (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button className="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded transition-colors shadow-sm whitespace-nowrap">
                                                                Konfirmasi Setoran
                                                            </button>
                                                        </div>
                                                    )}
                                                    {driver.status === 'Belum Setor' && (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button className="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded transition-colors whitespace-nowrap">
                                                                Konfirmasi Setoran
                                                            </button>
                                                            <button
                                                                onClick={() => handleOpenReminder(driver)}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded transition-colors whitespace-nowrap"
                                                            >
                                                                <span className="material-symbols-outlined text-[16px]">notifications</span>
                                                                Kirim Pengingat
                                                            </button>
                                                            <button className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded transition-colors whitespace-nowrap" title="Suspend Driver">
                                                                Suspend
                                                            </button>
                                                        </div>
                                                    )}
                                                    {driver.status === 'Suspended' && (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button className="px-3 py-1.5 text-xs font-semibold text-[#617589] border border-[#e5e7eb] rounded hover:bg-white transition-colors whitespace-nowrap">
                                                                Buka Suspend
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-6 py-4 border-t border-[#e5e7eb] dark:border-[#2a3b4d] flex items-center justify-between">
                                <p className="text-sm text-[#617589] dark:text-[#94a3b8]">Menampilkan <span className="font-semibold text-[#111418] dark:text-white">1-5</span> dari <span className="font-semibold text-[#111418] dark:text-white">12</span> driver aktif</p>
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
        </AdminLayout>
    )
}
