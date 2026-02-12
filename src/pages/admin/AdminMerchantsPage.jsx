import { useState } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminHeader from '../../components/admin/AdminHeader'

export default function AdminMerchantsPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false)
    const [selectedMerchant, setSelectedMerchant] = useState(null)
    const [confirmText, setConfirmText] = useState('')

    // Sample Data
    const merchants = [
        { id: 'WRG-001', name: 'Warung Makan Bu Siti', owner: 'Siti Aminah', phone: '+62 812-3456-7890', category: 'Makanan & Minuman', status: 'Buka', statusColor: 'green' },
        { id: 'WRG-002', name: 'Toko Kelontong Jaya', owner: 'Budi Santoso', phone: '+62 856-7890-1234', category: 'Sembako', status: 'Buka', statusColor: 'green' },
        { id: 'WRG-003', name: 'Martabak Bangka 88', owner: 'Hendra Wijaya', phone: '+62 813-4567-8901', category: 'Makanan & Minuman', status: 'Tutup', statusColor: 'red' },
        { id: 'WRG-004', name: 'Apotek Sehat Selalu', owner: 'Dr. Ratna Sari', phone: '+62 821-2345-6789', category: 'Kesehatan', status: 'Buka', statusColor: 'green' },
    ]

    const handleTerminateClick = (merchant) => {
        setSelectedMerchant(merchant)
        setConfirmText('')
        setIsTerminateModalOpen(true)
    }

    const expectedConfirmText = selectedMerchant ? `PUTUS KEMITRAAN ${selectedMerchant.name}` : ''
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
                    title="Manajemen Warung"
                />

                <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto flex flex-col gap-8">

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl p-6 flex flex-col items-center justify-center text-center">
                                <span className="material-symbols-outlined text-4xl text-blue-500 mb-3">store</span>
                                <p className="text-sm text-[#617589] dark:text-[#94a3b8] font-medium mb-1">Total Warung Aktif</p>
                                <h3 className="text-3xl font-bold text-[#111418] dark:text-white">128</h3>
                            </div>
                            <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl p-6 flex flex-col items-center justify-center text-center">
                                <span className="material-symbols-outlined text-4xl text-green-500 mb-3">door_open</span>
                                <p className="text-sm text-[#617589] dark:text-[#94a3b8] font-medium mb-1">Warung Buka</p>
                                <h3 className="text-3xl font-bold text-[#111418] dark:text-white">92</h3>
                            </div>
                            <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl p-6 flex flex-col items-center justify-center text-center">
                                <span className="material-symbols-outlined text-4xl text-red-500 mb-3">door_front</span>
                                <p className="text-sm text-[#617589] dark:text-[#94a3b8] font-medium mb-1">Warung Tutup</p>
                                <h3 className="text-3xl font-bold text-[#111418] dark:text-white">36</h3>
                            </div>
                        </div>

                        {/* Verification Queue Alert */}
                        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-3xl text-blue-600 dark:text-blue-200">pending_actions</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-[#111418] dark:text-white mb-2">Antrean Verifikasi Warung</h3>
                                    <p className="text-[#617589] dark:text-[#94a3b8]">Terdapat <span className="font-bold text-blue-600 dark:text-blue-400">3 Warung Baru</span> yang menunggu peninjauan dokumen dan persetujuan.</p>
                                </div>
                            </div>
                            <a href="/admin/merchants/verification" className="whitespace-nowrap flex items-center gap-2 px-6 py-3 bg-primary hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-primary/20">
                                Tinjau Antrean
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </a>
                        </div>

                        {/* Merchant List Table */}
                        <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl overflow-hidden">
                            <div className="px-6 py-5 border-b border-[#e5e7eb] dark:border-[#2a3b4d] flex items-center justify-between">
                                <h3 className="text-lg font-bold text-[#111418] dark:text-white">Daftar Warung Aktif</h3>
                                <div className="flex gap-2">
                                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#617589] dark:text-[#94a3b8] bg-[#f0f2f4] dark:bg-[#2a3b4d] hover:bg-[#e5e7eb] dark:hover:bg-[#344658] rounded-lg transition-colors">
                                        <span className="material-symbols-outlined text-base">filter_list</span>
                                        Filter
                                    </button>
                                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#617589] dark:text-[#94a3b8] bg-[#f0f2f4] dark:bg-[#2a3b4d] hover:bg-[#e5e7eb] dark:hover:bg-[#344658] rounded-lg transition-colors">
                                        <span className="material-symbols-outlined text-base">download</span>
                                        Ekspor
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#f9fafb] dark:bg-[#1e2c3a] border-b border-[#e5e7eb] dark:border-[#2a3b4d]">
                                            <th className="px-6 py-4 text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider">Nama Warung</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider">Pemilik</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider">Kategori</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#2a3b4d]">
                                        {merchants.map((merchant) => (
                                            <tr key={merchant.id} className="hover:bg-[#f9fafb] dark:hover:bg-[#202e3b] transition-colors relative z-10">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 bg-center bg-cover flex items-center justify-center text-xs font-bold text-gray-500">
                                                            IMG
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-[#111418] dark:text-white">{merchant.name}</p>
                                                            <p className="text-xs text-[#617589] dark:text-[#94a3b8]">ID: {merchant.id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <p className="text-sm text-[#111418] dark:text-white font-medium">{merchant.owner}</p>
                                                    <p className="text-xs text-[#617589] dark:text-[#94a3b8]">{merchant.phone}</p>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${merchant.category === 'Kesehatan'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                                        }`}>
                                                        {merchant.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-2.5 h-2.5 rounded-full ${merchant.statusColor === 'green' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                        <span className="text-sm text-[#111418] dark:text-white">{merchant.status}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="relative inline-block text-left group">
                                                        <button className="p-1 rounded-full text-[#617589] hover:text-primary dark:text-[#94a3b8] dark:hover:text-primary bg-[#f0f2f4] dark:bg-[#344658] transition-colors">
                                                            <span className="material-symbols-outlined">more_vert</span>
                                                        </button>
                                                        <div className="hidden group-hover:block absolute right-0 top-full mt-1 w-56 bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg z-50 overflow-hidden shadow-sm">
                                                            <div className="flex flex-col py-1">
                                                                <button className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#111418] dark:text-white hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d] transition-colors text-left">
                                                                    <span className="material-symbols-outlined text-[20px] text-[#617589] dark:text-[#94a3b8]">store</span>
                                                                    Lihat Profil
                                                                </button>
                                                                <a href={`/admin/merchants/edit/${merchant.id}`} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#111418] dark:text-white hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d] transition-colors text-left">
                                                                    <span className="material-symbols-outlined text-[20px] text-[#617589] dark:text-[#94a3b8]">edit</span>
                                                                    Edit Data
                                                                </a>
                                                                <div className="h-px bg-[#e5e7eb] dark:bg-[#2a3b4d] my-1 mx-0"></div>
                                                                <button
                                                                    onClick={() => handleTerminateClick(merchant)}
                                                                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                                                                >
                                                                    <span className="material-symbols-outlined text-[20px]">shopping_cart_off</span>
                                                                    Putus Kemitraan
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
                            <h3 className="text-2xl font-bold text-[#111418] dark:text-white mb-4 text-center">Putus Kemitraan Warung?</h3>
                            <p className="text-[#617589] dark:text-[#94a3b8] text-center mb-8 leading-relaxed">
                                Tindakan ini bersifat permanen. <strong className="text-[#111418] dark:text-white">{selectedMerchant?.name}</strong> tidak akan bisa menerima pesanan lagi di platform.
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
