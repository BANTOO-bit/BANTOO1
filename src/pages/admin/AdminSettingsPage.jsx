import { useState } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminHeader from '../../components/admin/AdminHeader'

export default function AdminSettingsPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isConfigured, setIsConfigured] = useState(false) // Toggle state for demo
    const [activeTab, setActiveTab] = useState('operasional')

    const handleStartConfiguration = () => {
        setIsConfigured(true)
    }

    return (
        <div className="flex min-h-screen w-full bg-[#f6f7f8] dark:bg-[#101922] font-display text-[#111418] dark:text-white overflow-x-hidden relative">
            <AdminSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <main className="flex-1 lg:ml-[240px] flex flex-col min-w-0 h-screen overflow-y-auto">
                <AdminHeader
                    onMenuClick={() => setIsSidebarOpen(true)}
                    title={isConfigured ? "Pengaturan Sistem" : (isConfigured === false ? "Pengaturan Sistem" : "Wizard Konfigurasi")}
                />

                {!isConfigured ? (
                    // Empty State / Not Configured (code1.html)
                    <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-8 bg-[#f6f7f8] dark:bg-[#101922]">
                        <div className="max-w-md w-full text-center flex flex-col items-center">
                            <div className="w-24 h-24 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-primary text-[48px]">settings_suggest</span>
                            </div>
                            <h3 className="text-xl font-bold text-[#111418] dark:text-white mb-3">
                                Pengaturan Belum Dikonfigurasi
                            </h3>
                            <p className="text-[#617589] dark:text-[#94a3b8] text-base mb-8 max-w-sm mx-auto leading-relaxed">
                                Lengkapi data operasional dan profil Anda untuk mulai mengelola sistem pengiriman di kecamatan ini.
                            </p>
                            <button
                                onClick={handleStartConfiguration}
                                className="px-8 py-3 text-sm font-semibold text-white bg-primary hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[20px]">tune</span>
                                Mulai Konfigurasi
                            </button>
                        </div>
                    </div>
                ) : (
                    // Configured View with Tabs
                    <div className="flex-1 px-6 lg:px-10 py-8 bg-[#f6f7f8] dark:bg-[#101922]">
                        <div className="max-w-5xl mx-auto space-y-8">
                            <div className="border-b border-gray-200 dark:border-gray-700">
                                <nav aria-label="Tabs" className="flex gap-8 overflow-x-auto">
                                    <button
                                        onClick={() => setActiveTab('operasional')}
                                        className={`shrink-0 border-b-2 pb-4 text-sm font-medium transition-colors ${activeTab === 'operasional' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                                    >
                                        Operasional
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('keuangan')}
                                        className={`shrink-0 border-b-2 pb-4 text-sm font-medium transition-colors ${activeTab === 'keuangan' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                                    >
                                        Keuangan
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('akun')}
                                        className={`shrink-0 border-b-2 pb-4 text-sm font-medium transition-colors ${activeTab === 'akun' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                                    >
                                        Akun Admin
                                    </button>
                                </nav>
                            </div>

                            {/* Operational Tab (code3.html content adapted) */}
                            {activeTab === 'operasional' && (
                                <section className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                                    <div className="bg-white dark:bg-[#1a2632] rounded-2xl shadow-sm border border-[#e5e7eb] dark:border-[#2a3b4d] overflow-hidden flex flex-col lg:flex-row">
                                        <div className="flex-1 p-8">
                                            <div className="mb-6">
                                                <h3 className="text-xl font-bold text-[#111418] dark:text-white mb-1">Pengaturan Operasional</h3>
                                                <p className="text-sm text-[#617589] dark:text-[#94a3b8]">Tentukan parameter dasar untuk layanan pengiriman Anda.</p>
                                            </div>
                                            <form className="space-y-6">
                                                <div>
                                                    <label className="block text-sm font-semibold text-[#111418] dark:text-white mb-2">
                                                        Radius Layanan Maksimal (km)
                                                    </label>
                                                    <div className="relative">
                                                        <input className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-[#111418] dark:text-white placeholder-gray-400" placeholder="Contoh: 10" type="number" defaultValue="10" />
                                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                            <span className="text-gray-500 text-sm">km</span>
                                                        </div>
                                                    </div>
                                                    <p className="mt-1.5 text-xs text-[#617589] dark:text-[#94a3b8] flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[14px]">info</span>
                                                        Jarak maksimal pengantaran dari titik pusat kecamatan.
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-[#111418] dark:text-white mb-2">
                                                        Jam Buka/Tutup Operasional
                                                    </label>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="relative">
                                                            <input className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-[#111418] dark:text-white" type="time" defaultValue="08:00" />
                                                            <span className="absolute -top-2 left-2 px-1 bg-gray-50 dark:bg-gray-800 text-[10px] text-gray-500">Buka</span>
                                                        </div>
                                                        <div className="relative">
                                                            <input className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-[#111418] dark:text-white" type="time" defaultValue="21:00" />
                                                            <span className="absolute -top-2 left-2 px-1 bg-gray-50 dark:bg-gray-800 text-[10px] text-gray-500">Tutup</span>
                                                        </div>
                                                    </div>
                                                    <p className="mt-1.5 text-xs text-[#617589] dark:text-[#94a3b8] flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                                                        Waktu dimana pelanggan dapat membuat pesanan di aplikasi.
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-[#111418] dark:text-white mb-2">
                                                        Batas Saldo COD Driver
                                                    </label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <span className="text-gray-500 font-medium text-sm">Rp</span>
                                                        </div>
                                                        <input className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-[#111418] dark:text-white placeholder-gray-400" placeholder="0" type="number" defaultValue="200000" />
                                                    </div>
                                                    <p className="mt-1.5 text-xs text-[#617589] dark:text-[#94a3b8] flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[14px]">account_balance_wallet</span>
                                                        Driver tidak bisa mengambil order jika saldo tunai melebihi batas ini.
                                                    </p>
                                                </div>
                                            </form>
                                            <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end">
                                                <button className="px-6 py-2.5 rounded-lg bg-primary hover:bg-blue-600 text-white font-medium transition-colors shadow-sm">
                                                    Simpan Perubahan
                                                </button>
                                            </div>
                                        </div>
                                        <div className="lg:w-[340px] bg-blue-50 dark:bg-blue-900/10 border-t lg:border-t-0 lg:border-l border-[#e5e7eb] dark:border-[#2a3b4d] p-8 flex flex-col items-center justify-center text-center">
                                            <div className="relative w-48 h-48 mb-6">
                                                <div className="absolute inset-0 bg-white dark:bg-[#1a2632] rounded-full border-4 border-primary/20 flex items-center justify-center shadow-lg">
                                                    <div className="w-36 h-36 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center relative">
                                                        <div className="absolute w-1 h-16 bg-primary rounded-full bottom-1/2 left-1/2 -translate-x-1/2 origin-bottom transform rotate-45"></div>
                                                        <div className="absolute w-1 h-12 bg-blue-300 rounded-full bottom-1/2 left-1/2 -translate-x-1/2 origin-bottom transform -rotate-45"></div>
                                                        <div className="w-4 h-4 bg-primary rounded-full absolute z-10"></div>
                                                        <span className="absolute top-2 text-primary font-bold text-xs">12</span>
                                                        <span className="absolute bottom-2 text-primary font-bold text-xs">6</span>
                                                        <span className="absolute right-3 text-primary font-bold text-xs">3</span>
                                                        <span className="absolute left-3 text-primary font-bold text-xs">9</span>
                                                    </div>
                                                </div>
                                                <div className="absolute -bottom-4 -right-2 bg-white dark:bg-[#2a3b4d] p-3 rounded-xl shadow-lg border border-gray-100 dark:border-gray-600">
                                                    <span className="material-symbols-outlined text-primary text-3xl">sports_motorsports</span>
                                                </div>
                                            </div>
                                            <h4 className="text-lg font-bold text-[#111418] dark:text-white mb-2">Waktu adalah Uang</h4>
                                            <p className="text-sm text-[#617589] dark:text-[#94a3b8] leading-relaxed">
                                                Konfigurasi yang tepat membantu driver bekerja lebih efisien dan pelanggan mendapatkan kepastian layanan.
                                            </p>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Financial Tab (code4.html content adapted) */}
                            {activeTab === 'keuangan' && (
                                <section className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                            <span className="material-symbols-outlined text-green-600 dark:text-green-400">payments</span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-[#111418] dark:text-white">Parameter Keuangan</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Atur komisi dan tarif dasar pengiriman</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="bg-white dark:bg-[#1a2632] p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-colors">
                                            <div className="flex flex-col gap-4">
                                                <div className="flex items-center justify-between">
                                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200" htmlFor="commission">Komisi Platform</label>
                                                    <span className="material-symbols-outlined text-gray-400 text-lg">percent</span>
                                                </div>
                                                <div className="relative rounded-md shadow-sm">
                                                    <input className="block w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 pr-10 py-3 focus:border-primary focus:ring-primary sm:text-lg font-bold text-gray-900 dark:text-white" id="commission" name="commission" placeholder="0" type="text" defaultValue="10" />
                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                                                        <span className="text-gray-500 font-medium">%</span>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Potongan dari total order.</p>
                                            </div>
                                        </div>
                                        <div className="bg-white dark:bg-[#1a2632] p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-colors">
                                            <div className="flex flex-col gap-4">
                                                <div className="flex items-center justify-between">
                                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200" htmlFor="base_fare">Tarif Dasar Pengantaran</label>
                                                    <span className="material-symbols-outlined text-gray-400 text-lg">local_shipping</span>
                                                </div>
                                                <div className="relative rounded-md shadow-sm">
                                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                                        <span className="text-gray-500 font-medium">Rp</span>
                                                    </div>
                                                    <input className="block w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 pl-12 py-3 focus:border-primary focus:ring-primary sm:text-lg font-bold text-gray-900 dark:text-white" id="base_fare" name="base_fare" placeholder="0" type="text" defaultValue="8.000" />
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Harga awal per pengiriman.</p>
                                            </div>
                                        </div>
                                        <div className="bg-white dark:bg-[#1a2632] p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-colors">
                                            <div className="flex flex-col gap-4">
                                                <div className="flex items-center justify-between">
                                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200" htmlFor="parking">Biaya Parkir Otomatis</label>
                                                    <span className="material-symbols-outlined text-gray-400 text-lg">local_parking</span>
                                                </div>
                                                <div className="relative rounded-md shadow-sm">
                                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                                        <span className="text-gray-500 font-medium">Rp</span>
                                                    </div>
                                                    <input className="block w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 pl-12 py-3 focus:border-primary focus:ring-primary sm:text-lg font-bold text-gray-900 dark:text-white" id="parking" name="parking" placeholder="0" type="text" defaultValue="2.000" />
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Tambahan biaya parkir driver.</p>
                                            </div>
                                        </div>
                                        <div className="bg-white dark:bg-[#1a2632] p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-colors">
                                            <div className="flex flex-col gap-4">
                                                <div className="flex items-center justify-between">
                                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200" htmlFor="cod_admin_fee">Batas Potongan Ongkir COD</label>
                                                    <span className="material-symbols-outlined text-gray-400 text-lg">price_check</span>
                                                </div>
                                                <div className="relative rounded-md shadow-sm">
                                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                                        <span className="text-gray-500 font-medium">Rp</span>
                                                    </div>
                                                    <input className="block w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 pl-12 py-3 focus:border-primary focus:ring-primary sm:text-lg font-bold text-gray-900 dark:text-white" id="cod_admin_fee" name="cod_admin_fee" placeholder="0" type="text" defaultValue="0" />
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Potongan biaya admin dari ongkos kirim.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-8">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">account_balance</span>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-[#111418] dark:text-white">Rekening Bank Setoran</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Rekening tujuan untuk top-up saldo driver</p>
                                            </div>
                                        </div>
                                        <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-gray-200 dark:border-gray-700 p-6 md:p-8">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-6">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nama Bank</label>
                                                        <select className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-gray-50 dark:bg-gray-800 dark:text-white py-2.5">
                                                            <option>BCA</option>
                                                            <option>Mandiri</option>
                                                            <option>BRI</option>
                                                            <option>BNI</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nomor Rekening</label>
                                                        <input className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-gray-50 dark:bg-gray-800 dark:text-white py-2.5" placeholder="Contoh: 1234567890" type="text" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nama Pemilik Rekening</label>
                                                        <input className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-gray-50 dark:bg-gray-800 dark:text-white py-2.5" placeholder="Contoh: PT. Food Delivery Indonesia" type="text" />
                                                    </div>
                                                </div>
                                                <div className="flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-dashed border-gray-300 dark:border-gray-600">
                                                    <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
                                                        <span className="material-symbols-outlined text-3xl">credit_card</span>
                                                    </div>
                                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Pratinjau Kartu Driver</h4>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-[200px] mb-4">Informasi ini akan muncul di aplikasi driver saat melakukan top-up deposit.</p>
                                                    <div className="w-full max-w-sm bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-4 text-white shadow-lg relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-white opacity-10 rounded-full"></div>
                                                        <div className="flex justify-between items-start mb-6 relative z-10">
                                                            <span className="font-bold tracking-wider">BCA</span>
                                                            <span className="material-symbols-outlined">contactless</span>
                                                        </div>
                                                        <div className="mb-4 relative z-10">
                                                            <p className="text-xs opacity-80 mb-1">Nomor Rekening</p>
                                                            <p className="font-mono text-lg tracking-widest">1234 5678 90</p>
                                                        </div>
                                                        <div className="relative z-10">
                                                            <p className="text-xs opacity-80 mb-1">Nama Pemilik</p>
                                                            <p className="text-sm font-medium truncate">PT. FOOD DELIVERY INDONESIA</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <button className="px-6 py-2.5 rounded-lg bg-primary hover:bg-blue-600 text-white font-medium transition-colors shadow-sm">
                                            Simpan Perubahan
                                        </button>
                                    </div>
                                </section>
                            )}

                            {/* Account Tab (code2.html content adapted) */}
                            {activeTab === 'akun' && (
                                <section className="space-y-5 pb-10 animate-[fadeIn_0.3s_ease-out]">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="material-symbols-outlined text-primary">manage_accounts</span>
                                        <h3 className="text-lg font-bold text-[#111418] dark:text-white">Profil & Lokasi Kantor</h3>
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <div className="lg:col-span-1 bg-white dark:bg-[#1a2632] p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between h-full">
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100 ring-4 ring-gray-50 dark:ring-gray-700 shrink-0">
                                                        <img alt="Profile" className="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDp112u6IqfIrXkCeDGj3PBdeufTwIOsAdBhT_KmMTzZhOaPSHjx70PR1U48QF5mwh2DwfpFYxI-mjWuvsTcTtLhCBUUcXh0IJAGjcH3tOG4y8lpq5rU4_XiLp6nzPiMfKQDcOz9maD4u3WhriGgam2HX8D3hBPe89S8vcYklpsQWoMJokMeX4Io9jkDQx1u9S7B2YVQKJVCrBuZw7vwYScBrxRNdXeTAf9jloSeMowA0k73QAfmOZh_Xr30859kwOEBBQS_wUdZQ" />
                                                    </div>
                                                    <button className="text-xs font-medium text-primary hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 px-4 py-2 rounded-lg transition-colors">
                                                        Ubah Foto
                                                    </button>
                                                </div>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nama Lengkap</label>
                                                        <input className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-gray-50 dark:bg-gray-800 dark:text-white py-2.5" type="text" defaultValue="Budi Santoso" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email (Read-only)</label>
                                                        <div className="relative">
                                                            <input className="block w-full rounded-lg border-gray-200 dark:border-gray-700 shadow-sm sm:text-sm bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 cursor-not-allowed py-2.5" readOnly type="email" defaultValue="admin@kecamatan.id" />
                                                            <span className="material-symbols-outlined absolute right-3 top-2.5 text-gray-400 text-sm">lock</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nomor WhatsApp</label>
                                                        <input className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-gray-50 dark:bg-gray-800 dark:text-white py-2.5" type="tel" defaultValue="0812-3456-7890" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">Keamanan Akun</label>
                                                <button className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-[#f0f2f4] dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow">
                                                    <span className="material-symbols-outlined text-lg">lock_reset</span>
                                                    Ganti Password
                                                </button>
                                            </div>
                                        </div>
                                        <div className="lg:col-span-2 bg-white dark:bg-[#1a2632] p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col h-full min-h-[400px]">
                                            <div className="mb-4">
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Lokasi Kantor Pusat (Titik Temu COD)</label>
                                                <div className="flex gap-3">
                                                    <div className="flex-1">
                                                        <textarea className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-gray-50 dark:bg-gray-800 dark:text-white resize-none py-2.5" placeholder="Alamat lengkap..." rows="2" defaultValue="Jl. Merdeka No. 45, Kecamatan Kota, Jawa Tengah"></textarea>
                                                    </div>
                                                    <button className="shrink-0 self-start px-4 py-2.5 bg-primary hover:bg-blue-600 text-white rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-lg">search</span>
                                                        Cari
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="relative w-full flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden group border border-gray-200 dark:border-gray-700">
                                                <div className="absolute inset-0 opacity-15 dark:opacity-10" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.4\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E')" }}></div>
                                                <div className="absolute inset-0 bg-blue-50/30 dark:bg-blue-900/10 pointer-events-none"></div>
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                                                    <div className="relative group cursor-pointer hover:-translate-y-1 transition-transform">
                                                        <span className="material-symbols-outlined text-red-500 text-5xl drop-shadow-xl filter">location_on</span>
                                                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3 h-1 bg-black/30 rounded-full blur-[2px]"></div>
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block w-max">
                                                            <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg">
                                                                Geser pin untuk ubah
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 px-3 py-1.5 bg-white dark:bg-gray-900 rounded-lg shadow-lg text-xs font-bold text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 flex items-center gap-1.5">
                                                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                                                        Kantor Pusat
                                                    </div>
                                                </div>
                                                <div className="absolute right-4 bottom-4 flex flex-col gap-2">
                                                    <button className="bg-white dark:bg-gray-700 p-2.5 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-200 hover:bg-[#f0f2f4] dark:hover:bg-gray-600 transition-colors">
                                                        <span className="material-symbols-outlined text-sm">my_location</span>
                                                    </button>
                                                    <div className="flex flex-col rounded-lg shadow-md border border-gray-200 dark:border-gray-600 overflow-hidden">
                                                        <button className="bg-white dark:bg-gray-700 p-2.5 text-gray-600 dark:text-gray-200 hover:bg-[#f0f2f4] dark:hover:bg-gray-600 border-b border-gray-200 dark:border-gray-600 transition-colors">
                                                            <span className="material-symbols-outlined text-sm">add</span>
                                                        </button>
                                                        <button className="bg-white dark:bg-gray-700 p-2.5 text-gray-600 dark:text-gray-200 hover:bg-[#f0f2f4] dark:hover:bg-gray-600 transition-colors">
                                                            <span className="material-symbols-outlined text-sm">remove</span>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="absolute top-4 left-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm px-4 py-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 max-w-xs">
                                                    <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold mb-0.5">Koordinat</p>
                                                    <p className="text-xs font-mono text-gray-900 dark:text-white">-6.2088, 106.8456</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <button className="px-6 py-2.5 rounded-lg bg-primary hover:bg-blue-600 text-white font-medium transition-colors shadow-sm">
                                            Simpan Profil
                                        </button>
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
