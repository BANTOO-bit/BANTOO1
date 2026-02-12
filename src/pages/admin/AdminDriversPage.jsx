import { useState } from 'react'
import { Link } from 'react-router-dom'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminHeader from '../../components/admin/AdminHeader'

export default function AdminDriversPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false)
    const [selectedDriver, setSelectedDriver] = useState(null)
    const [confirmText, setConfirmText] = useState('')

    // Sample Data
    const drivers = [
        { id: 'DRV-001', name: 'Budi Santoso', vehicle: 'Honda Vario (Putih)', plate: 'B 3456 TZL', joined: '12 Jan 2023', rating: '4.9', status: 'Online', statusColor: 'green', initials: 'BS', color: 'blue' },
        { id: 'DRV-002', name: 'Siti Aminah', vehicle: 'Yamaha Mio (Merah)', plate: 'D 1234 AB', joined: '05 Feb 2023', rating: '4.8', status: 'Online', statusColor: 'green', initials: 'SA', color: 'purple' },
        { id: 'DRV-003', name: 'Ahmad Rizky', vehicle: 'Honda Beat (Hitam)', plate: 'B 9988 AA', joined: '20 Des 2022', rating: '4.5', status: 'Offline', statusColor: 'gray', initials: 'AR', color: 'gray' },
        { id: 'DRV-004', name: 'Dewi Sartika', vehicle: 'Honda Scoopy (Cream)', plate: 'L 5566 OP', joined: '10 Mar 2023', rating: '5.0', status: 'Online', statusColor: 'green', initials: 'DS', color: 'pink' },
        { id: 'DRV-005', name: 'Reza Rahadian', vehicle: 'Yamaha Aerox (Biru)', plate: 'B 4455 RTY', joined: '11 Nov 2022', rating: '4.2', status: 'Offline', statusColor: 'gray', initials: 'RR', color: 'gray' },
    ]

    const handleTerminateClick = (driver) => {
        setSelectedDriver(driver)
        setConfirmText('')
        setIsTerminateModalOpen(true)
    }

    const expectedConfirmText = selectedDriver ? `PUTUS KEMITRAAN ${selectedDriver.name}` : ''
    const isConfirmValid = confirmText === expectedConfirmText

    return (
        <div className="flex min-h-screen w-full bg-[#f6f7f8] dark:bg-[#101922] font-display text-[#111418] dark:text-white overflow-x-hidden">
            <AdminSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <main className="flex-1 lg:ml-[250px] flex flex-col min-w-0 relative">
                <AdminHeader
                    onMenuClick={() => setIsSidebarOpen(true)}
                    title="Manajemen Driver"
                />

                <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto flex flex-col gap-6">

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl p-5 flex flex-col gap-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-[#617589] dark:text-[#94a3b8]">groups</span>
                                    <p className="text-[#617589] dark:text-[#94a3b8] text-sm font-medium">Total Armada</p>
                                </div>
                                <h3 className="text-3xl font-bold text-[#111418] dark:text-white">1,248</h3>
                            </div>
                            <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl p-5 flex flex-col gap-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-green-500">fiber_manual_record</span>
                                    <p className="text-[#617589] dark:text-[#94a3b8] text-sm font-medium">Driver Online</p>
                                </div>
                                <h3 className="text-3xl font-bold text-[#111418] dark:text-white">856</h3>
                            </div>
                            <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl p-5 flex flex-col gap-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-gray-400">fiber_manual_record</span>
                                    <p className="text-[#617589] dark:text-[#94a3b8] text-sm font-medium">Driver Offline</p>
                                </div>
                                <h3 className="text-3xl font-bold text-[#111418] dark:text-white">392</h3>
                            </div>
                        </div>

                        {/* Verification Queue Alert */}
                        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-white dark:bg-[#1a2632] text-primary flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800 shadow-sm">
                                    <span className="material-symbols-outlined text-[24px]">verified_user</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-[#111418] dark:text-white">Antrean Verifikasi Baru</h3>
                                    <p className="text-[#617589] dark:text-[#94a3b8] mt-1 text-sm">Terdapat <span className="font-bold text-[#111418] dark:text-white">5 Driver Baru</span> yang menunggu peninjauan dokumen.</p>
                                </div>
                            </div>
                            <Link to="/admin/drivers/verification" className="px-5 py-2.5 bg-primary hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm whitespace-nowrap flex items-center gap-2 shadow-sm">
                                Tinjau Antrean
                                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </Link>
                        </div>

                        {/* Driver List Table */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-1">
                            <h3 className="text-lg font-bold text-[#111418] dark:text-white">Daftar Driver Aktif</h3>
                            <div className="flex gap-2">
                                <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] hover:bg-[#f0f2f4] dark:hover:bg-[#202e3b] text-[#111418] dark:text-white font-medium rounded-lg transition-colors text-sm">
                                    <span className="material-symbols-outlined text-[20px]">filter_list</span>
                                    Filter
                                </button>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl overflow-hidden flex-1 mb-20">
                            <div className="overflow-x-visible">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-[#e5e7eb] dark:border-[#2a3b4d] text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase bg-[#f9fafb] dark:bg-[#1e2c3a]">
                                            <th className="px-6 py-4 whitespace-nowrap">Nama Driver</th>
                                            <th className="px-6 py-4 whitespace-nowrap">Kendaraan</th>
                                            <th className="px-6 py-4 whitespace-nowrap">Bergabung</th>
                                            <th className="px-6 py-4 whitespace-nowrap">Status</th>
                                            <th className="px-6 py-4 whitespace-nowrap text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#2a3b4d]">
                                        {drivers.map((driver) => (
                                            <tr key={driver.id} className="hover:bg-[#f9fafb] dark:hover:bg-[#202e3b] transition-colors relative z-10">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-full bg-${driver.color}-100 dark:bg-${driver.color}-900 text-${driver.color}-600 dark:text-${driver.color}-200 flex items-center justify-center font-bold text-sm`}>
                                                            {driver.initials}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-[#111418] dark:text-white">{driver.name}</p>
                                                            <div className="flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-xs text-yellow-500">star</span>
                                                                <p className="text-xs text-[#617589] dark:text-[#94a3b8]">{driver.rating}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-medium text-[#111418] dark:text-white">{driver.vehicle}</p>
                                                    <p className="text-xs text-[#617589] dark:text-[#94a3b8]">{driver.plate}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-[#617589] dark:text-[#94a3b8]">{driver.joined}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${driver.status === 'Online'
                                                        ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800'
                                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                                                        }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${driver.status === 'Online' ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                                                        {driver.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right relative">
                                                    <div className="relative inline-block text-left group">
                                                        <button className="text-[#617589] hover:text-[#111418] dark:text-[#94a3b8] dark:hover:text-white p-2 hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d] rounded-lg transition-colors">
                                                            <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                                        </button>
                                                        <div className="hidden group-hover:block absolute right-0 top-full z-50 w-56 bg-white dark:bg-[#1a2632] rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] flex flex-col py-1 text-left shadow-lg">
                                                            <button className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#111418] dark:text-white hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d] transition-colors w-full text-left">
                                                                <span className="material-symbols-outlined text-[18px] text-[#617589] dark:text-[#94a3b8]">person</span>
                                                                Lihat Profil
                                                            </button>
                                                            <Link to={`/admin/drivers/edit/${driver.id}`} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#111418] dark:text-white hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d] transition-colors w-full text-left">
                                                                <span className="material-symbols-outlined text-[18px] text-[#617589] dark:text-[#94a3b8]">edit</span>
                                                                Edit Data
                                                            </Link>
                                                            <button className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#111418] dark:text-white hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d] transition-colors w-full text-left">
                                                                <span className="material-symbols-outlined text-[18px] text-[#617589] dark:text-[#94a3b8]">pause_circle</span>
                                                                Nonaktifkan Sementara
                                                            </button>
                                                            <div className="h-px bg-[#e5e7eb] dark:bg-[#2a3b4d] my-1 mx-2"></div>
                                                            <button
                                                                onClick={() => handleTerminateClick(driver)}
                                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left"
                                                            >
                                                                <span className="material-symbols-outlined text-[18px]">person_off</span>
                                                                Putus Kemitraan
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-6 py-4 border-t border-[#e5e7eb] dark:border-[#2a3b4d] flex items-center justify-between">
                                <p className="text-sm text-[#617589] dark:text-[#94a3b8]">Menampilkan <span className="font-semibold text-[#111418] dark:text-white">1-{drivers.length}</span> dari <span className="font-semibold text-[#111418] dark:text-white">1,248</span> driver</p>
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

            {/* Terminate Partnership Modal */}
            {isTerminateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#111418]/60 backdrop-blur-sm">
                    <div className="w-full max-w-[500px] bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d]">
                        <div className="p-8">
                            <h3 className="text-2xl font-bold text-[#111418] dark:text-white mb-4 text-center">Putus Kemitraan Driver?</h3>
                            <p className="text-[#617589] dark:text-[#94a3b8] text-center mb-8 leading-relaxed">
                                Tindakan ini bersifat permanen. <strong className="text-[#111418] dark:text-white">{selectedDriver?.name}</strong> tidak akan bisa menerima order lagi di platform.
                            </p>
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-[#111418] dark:text-white mb-2">Alasan</label>
                                <div className="relative">
                                    <select className="w-full appearance-none bg-[#f6f7f8] dark:bg-[#202e3b] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg pl-4 pr-10 py-3 text-[#111418] dark:text-white focus:outline-none focus:border-red-500 transition-colors cursor-pointer">
                                        <option disabled selected value="">Pilih alasan...</option>
                                        <option value="prosedur">Pelanggaran Prosedur</option>
                                        <option value="fraud">Fraud</option>
                                        <option value="permintaan">Permintaan Mitra</option>
                                        <option value="lainnya">Lainnya</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#617589] dark:text-[#94a3b8]">
                                        <span className="material-symbols-outlined font-light text-2xl">keyboard_arrow_down</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mb-8">
                                <label className="block text-sm font-bold text-[#111418] dark:text-white mb-2">Konfirmasi Tindakan</label>
                                <p className="text-xs text-[#617589] dark:text-[#94a3b8] mb-3">
                                    Ketik teks berikut untuk mengonfirmasi: <span className="font-mono font-bold text-red-600 dark:text-red-400">{expectedConfirmText}</span>
                                </p>
                                <input
                                    type="text"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    placeholder={expectedConfirmText}
                                    className="w-full bg-[#f6f7f8] dark:bg-[#202e3b] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg px-4 py-3 text-[#111418] dark:text-white focus:outline-none focus:border-red-500 transition-colors font-mono"
                                />
                                {confirmText && !isConfirmValid && (
                                    <p className="text-xs text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">error</span>
                                        Teks konfirmasi tidak sesuai
                                    </p>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setIsTerminateModalOpen(false)}
                                    className="w-full px-4 py-3 bg-[#f0f2f4] hover:bg-[#e5e7eb] dark:bg-[#2a3b4d] dark:hover:bg-[#344658] text-[#617589] dark:text-[#94a3b8] font-bold rounded-lg transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={() => setIsTerminateModalOpen(false)}
                                    disabled={!isConfirmValid}
                                    className="w-full px-4 py-3 bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#ef4444]"
                                >
                                    Ya, Putus Kemitraan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
