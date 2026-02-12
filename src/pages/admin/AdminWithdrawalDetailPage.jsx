import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminHeader from '../../components/admin/AdminHeader'

export default function AdminWithdrawalDetailPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const { id } = useParams()
    const navigate = useNavigate()

    return (
        <div className="flex min-h-screen w-full bg-[#f6f7f8] dark:bg-[#101922] font-display text-[#111418] dark:text-white overflow-x-hidden">
            <AdminSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <main className="flex-1 lg:ml-[250px] flex flex-col min-w-0">
                <AdminHeader
                    onMenuClick={() => setIsSidebarOpen(true)}
                    title="Tinjauan Penarikan Dana"
                    showBack={true}
                    onBackClick={() => navigate(-1)}
                />

                <div className="flex-1 p-6 lg:p-8 overflow-y-auto bg-[#f9fafb] dark:bg-[#101922]">
                    <div className="max-w-4xl mx-auto">

                        {/* Information Alert */}
                        <div className="mb-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4 flex items-start gap-3">
                            <span className="material-symbols-outlined text-primary mt-0.5">info</span>
                            <div>
                                <p className="text-sm font-medium text-primary mb-1">Permintaan Menunggu Persetujuan</p>
                                <p className="text-sm text-[#617589] dark:text-[#94a3b8]">Mohon verifikasi data bank dan saldo sebelum melakukan transfer.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 flex flex-col gap-6">

                                {/* Applicant Profile */}
                                <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] p-6">
                                    <h3 className="text-base font-semibold text-[#111418] dark:text-white mb-4">Profil Pemohon</h3>
                                    <div className="flex items-center gap-5">
                                        <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                                            <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-2xl font-bold">
                                                BS
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h2 className="text-xl font-bold text-[#111418] dark:text-white">Budi Santoso</h2>
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Driver</span>
                                            </div>
                                            <p className="text-sm text-[#617589] dark:text-[#94a3b8] mb-2">Bergabung sejak 12 Jan 2023</p>
                                            <div className="flex items-center gap-4 text-sm">
                                                <div className="flex items-center gap-1.5 text-[#617589] dark:text-[#94a3b8]">
                                                    <span className="material-symbols-outlined text-[18px]">star</span>
                                                    <span className="font-medium text-[#111418] dark:text-white">4.8</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[#617589] dark:text-[#94a3b8]">
                                                    <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                                                    <span className="font-medium text-[#111418] dark:text-white">1,240 Order</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Withdrawal Details */}
                                <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] p-6">
                                    <h3 className="text-base font-semibold text-[#111418] dark:text-white mb-6">Detail Penarikan</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                                        <div className="p-4 rounded-xl bg-[#f9fafb] dark:bg-[#1e2c3a] border border-[#e5e7eb] dark:border-[#2a3b4d]">
                                            <p className="text-xs text-[#617589] dark:text-[#94a3b8] font-medium mb-1">Saldo Saat Ini</p>
                                            <p className="text-lg font-bold text-[#111418] dark:text-white">Rp 485.000</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                                            <p className="text-xs text-primary font-medium mb-1">Nominal Penarikan</p>
                                            <p className="text-2xl font-bold text-primary">Rp 150.000</p>
                                            <p className="text-xs text-[#617589] dark:text-[#94a3b8] mt-1">Biaya Admin: Rp 0</p>
                                        </div>
                                    </div>
                                    <div className="border-t border-[#e5e7eb] dark:border-[#2a3b4d] pt-6">
                                        <h4 className="text-sm font-medium text-[#617589] dark:text-[#94a3b8] mb-4 uppercase tracking-wider">Rekening Tujuan</h4>
                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-[#617589] dark:text-[#94a3b8]">Nama Bank</span>
                                                <span className="text-sm font-semibold text-[#111418] dark:text-white">Bank Central Asia (BCA)</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-[#617589] dark:text-[#94a3b8]">Nomor Rekening</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-mono font-semibold text-[#111418] dark:text-white tracking-wide">8273 9928 1123</span>
                                                    <button className="text-[#617589] hover:text-primary transition-colors">
                                                        <span className="material-symbols-outlined text-[16px]">content_copy</span>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-[#617589] dark:text-[#94a3b8]">Atas Nama</span>
                                                <span className="text-sm font-semibold text-[#111418] dark:text-white">BUDI SANTOSO</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Transaction History */}
                                <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] overflow-hidden">
                                    <div className="p-5 border-b border-[#e5e7eb] dark:border-[#2a3b4d]">
                                        <h3 className="text-base font-semibold text-[#111418] dark:text-white">Riwayat Pendapatan</h3>
                                    </div>
                                    <div className="divide-y divide-[#e5e7eb] dark:divide-[#2a3b4d]">
                                        <div className="p-4 flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-[#111418] dark:text-white">Komisi Pengiriman</p>
                                                <p className="text-xs text-[#617589] dark:text-[#94a3b8]">Hari Ini, 10:30</p>
                                            </div>
                                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">+Rp 12.500</span>
                                        </div>
                                        <div className="p-4 flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-[#111418] dark:text-white">Bonus Target</p>
                                                <p className="text-xs text-[#617589] dark:text-[#94a3b8]">Kemarin, 18:00</p>
                                            </div>
                                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">+Rp 50.000</span>
                                        </div>
                                        <div className="p-4 flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-[#111418] dark:text-white">Penarikan Dana</p>
                                                <p className="text-xs text-[#617589] dark:text-[#94a3b8]">24 Nov 2023</p>
                                            </div>
                                            <span className="text-sm font-bold text-[#111418] dark:text-white">-Rp 200.000</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-[#f9fafb] dark:bg-[#1e2c3a] text-center border-t border-[#e5e7eb] dark:border-[#2a3b4d]">
                                        <a className="text-xs font-medium text-primary hover:underline" href="#">Lihat Semua Riwayat</a>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-6">
                                {/* Action Card */}
                                <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] p-5 sticky top-24">
                                    <h3 className="text-base font-semibold text-[#111418] dark:text-white mb-4">Aksi Verifikasi</h3>
                                    <div className="flex flex-col gap-3">
                                        <button className="w-full py-3 px-4 rounded-lg bg-primary hover:bg-blue-700 text-white font-medium text-sm transition-colors shadow-sm flex items-center justify-center gap-2">
                                            <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                            Proses Transfer
                                        </button>
                                        <button className="w-full py-3 px-4 rounded-lg border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 font-medium text-sm hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center justify-center gap-2">
                                            <span className="material-symbols-outlined text-[20px]">cancel</span>
                                            Tolak Penarikan
                                        </button>
                                    </div>
                                    <p className="text-xs text-[#617589] dark:text-[#94a3b8] mt-4 text-center leading-relaxed">
                                        Dengan memproses, sistem akan otomatis mengirim notifikasi ke mitra.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    )
}
