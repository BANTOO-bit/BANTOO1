import { useState, useEffect } from 'react'
import AdminLayout from '../../../components/admin/AdminLayout'
import settingsService from '../../../services/settingsService'

// Default values (fallback if DB is empty)
const DEFAULTS = {
    operational: { service_radius_km: 10, open_time: '08:00', close_time: '21:00', cod_balance_limit: 200000 },
    financial: { commission_percent: 10, base_delivery_fare: 8000, parking_fee: 2000, cod_admin_fee: 0 },
    bank: { bank_name: 'BCA', account_number: '', account_holder: '' },
    admin_profile: { full_name: '', whatsapp: '', office_address: '', office_lat: -6.2088, office_lng: 106.8456 }
}

export default function AdminSettingsPage() {
    const [activeTab, setActiveTab] = useState('operasional')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState(null)

    // Real state for each settings group
    const [operational, setOperational] = useState(DEFAULTS.operational)
    const [financial, setFinancial] = useState(DEFAULTS.financial)
    const [bank, setBank] = useState(DEFAULTS.bank)
    const [adminProfile, setAdminProfile] = useState(DEFAULTS.admin_profile)

    // Load settings from DB on mount
    useEffect(() => {
        async function load() {
            try {
                const all = await settingsService.getAll()
                if (all.operational) setOperational({ ...DEFAULTS.operational, ...all.operational })
                if (all.financial) setFinancial({ ...DEFAULTS.financial, ...all.financial })
                if (all.bank) setBank({ ...DEFAULTS.bank, ...all.bank })
                if (all.admin_profile) setAdminProfile({ ...DEFAULTS.admin_profile, ...all.admin_profile })
            } catch (err) {
                console.error('Failed to load settings:', err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    // Show toast notification
    const showToast = (message, type = 'success') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 3000)
    }

    // Save handler for operational tab
    const saveOperational = async () => {
        setSaving(true)
        try {
            await settingsService.save('operational', operational)
            showToast('Pengaturan operasional berhasil disimpan')
        } catch (err) {
            console.error(err)
            showToast('Gagal menyimpan pengaturan', 'error')
        } finally {
            setSaving(false)
        }
    }

    // Save handler for financial tab
    const saveFinancial = async () => {
        setSaving(true)
        try {
            await settingsService.saveAll({ financial, bank })
            showToast('Pengaturan keuangan berhasil disimpan')
        } catch (err) {
            console.error(err)
            showToast('Gagal menyimpan pengaturan', 'error')
        } finally {
            setSaving(false)
        }
    }

    // Save handler for account tab
    const saveProfile = async () => {
        setSaving(true)
        try {
            await settingsService.save('admin_profile', adminProfile)
            showToast('Profil admin berhasil disimpan')
        } catch (err) {
            console.error(err)
            showToast('Gagal menyimpan profil', 'error')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <AdminLayout title="Pengaturan Sistem">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
                        <p className="text-sm text-gray-500">Memuat pengaturan...</p>
                    </div>
                </div>
            </AdminLayout>
        )
    }

    const tabClass = (tab) =>
        `shrink-0 border-b-2 pb-4 text-sm font-medium transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`

    return (
        <AdminLayout title="Pengaturan Sistem">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-[999] px-5 py-3 rounded-xl shadow-xl text-sm font-medium text-white flex items-center gap-2 animate-[slideIn_0.3s_ease-out] ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
                    <span className="material-symbols-outlined text-lg">{toast.type === 'error' ? 'error' : 'check_circle'}</span>
                    {toast.message}
                </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav aria-label="Tabs" className="flex gap-8 overflow-x-auto">
                    <button onClick={() => setActiveTab('operasional')} className={tabClass('operasional')}>Operasional</button>
                    <button onClick={() => setActiveTab('keuangan')} className={tabClass('keuangan')}>Keuangan</button>
                    <button onClick={() => setActiveTab('akun')} className={tabClass('akun')}>Akun Admin</button>
                </nav>
            </div>

            <div className="flex flex-col gap-5 mt-5">
                {/* ========== OPERATIONAL TAB ========== */}
                {activeTab === 'operasional' && (
                    <section className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                        <div className="bg-white dark:bg-[#1a2632] rounded-2xl shadow-sm border border-[#e5e7eb] dark:border-[#2a3b4d] overflow-hidden flex flex-col lg:flex-row">
                            <div className="flex-1 p-8">
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-[#111418] dark:text-white mb-1">Pengaturan Operasional</h3>
                                    <p className="text-sm text-[#617589] dark:text-[#94a3b8]">Tentukan parameter dasar untuk layanan pengiriman Anda.</p>
                                </div>
                                <div className="space-y-6">
                                    {/* Radius */}
                                    <div>
                                        <label className="block text-sm font-semibold text-[#111418] dark:text-white mb-2">Radius Layanan Maksimal (km)</label>
                                        <div className="relative">
                                            <input
                                                className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-[#111418] dark:text-white"
                                                type="number"
                                                value={operational.service_radius_km}
                                                onChange={e => setOperational(p => ({ ...p, service_radius_km: Number(e.target.value) }))}
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <span className="text-gray-500 text-sm">km</span>
                                            </div>
                                        </div>
                                        <p className="mt-1.5 text-xs text-[#617589] dark:text-[#94a3b8] flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">info</span>
                                            Jarak maksimal pengantaran dari titik pusat kecamatan.
                                        </p>
                                    </div>

                                    {/* Operating Hours */}
                                    <div>
                                        <label className="block text-sm font-semibold text-[#111418] dark:text-white mb-2">Jam Buka/Tutup Operasional</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="relative">
                                                <input
                                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-[#111418] dark:text-white"
                                                    type="time"
                                                    value={operational.open_time}
                                                    onChange={e => setOperational(p => ({ ...p, open_time: e.target.value }))}
                                                />
                                                <span className="absolute -top-2 left-2 px-1 bg-gray-50 dark:bg-gray-800 text-[10px] text-gray-500">Buka</span>
                                            </div>
                                            <div className="relative">
                                                <input
                                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-[#111418] dark:text-white"
                                                    type="time"
                                                    value={operational.close_time}
                                                    onChange={e => setOperational(p => ({ ...p, close_time: e.target.value }))}
                                                />
                                                <span className="absolute -top-2 left-2 px-1 bg-gray-50 dark:bg-gray-800 text-[10px] text-gray-500">Tutup</span>
                                            </div>
                                        </div>
                                        <p className="mt-1.5 text-xs text-[#617589] dark:text-[#94a3b8] flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">schedule</span>
                                            Waktu dimana pelanggan dapat membuat pesanan di aplikasi.
                                        </p>
                                    </div>

                                    {/* COD Balance Limit */}
                                    <div>
                                        <label className="block text-sm font-semibold text-[#111418] dark:text-white mb-2">Batas Saldo COD Driver</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-500 font-medium text-sm">Rp</span>
                                            </div>
                                            <input
                                                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-[#111418] dark:text-white"
                                                type="number"
                                                value={operational.cod_balance_limit}
                                                onChange={e => setOperational(p => ({ ...p, cod_balance_limit: Number(e.target.value) }))}
                                            />
                                        </div>
                                        <p className="mt-1.5 text-xs text-[#617589] dark:text-[#94a3b8] flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">account_balance_wallet</span>
                                            Driver tidak bisa mengambil order jika saldo tunai melebihi batas ini.
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end">
                                    <button
                                        onClick={saveOperational}
                                        disabled={saving}
                                        className="px-6 py-2.5 rounded-lg bg-primary hover:bg-blue-600 text-white font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {saving && <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>}
                                        Simpan Perubahan
                                    </button>
                                </div>
                            </div>
                            {/* Clock illustration */}
                            <div className="lg:w-[340px] bg-blue-50 dark:bg-blue-900/10 border-t lg:border-t-0 lg:border-l border-[#e5e7eb] dark:border-[#2a3b4d] p-8 flex flex-col items-center justify-center text-center">
                                <div className="relative w-48 h-48 mb-6">
                                    <div className="absolute inset-0 bg-white dark:bg-[#1a2632] rounded-full border-4 border-primary/20 flex items-center justify-center">
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

                {/* ========== FINANCIAL TAB ========== */}
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
                            {/* Commission */}
                            <div className="bg-white dark:bg-[#1a2632] p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-colors">
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Komisi Platform</label>
                                        <span className="material-symbols-outlined text-gray-400 text-lg">percent</span>
                                    </div>
                                    <div className="relative rounded-md shadow-sm">
                                        <input
                                            className="block w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 pr-10 py-3 focus:border-primary focus:ring-primary sm:text-lg font-bold text-gray-900 dark:text-white"
                                            type="number"
                                            value={financial.commission_percent}
                                            onChange={e => setFinancial(p => ({ ...p, commission_percent: Number(e.target.value) }))}
                                        />
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                                            <span className="text-gray-500 font-medium">%</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Potongan dari total order.</p>
                                </div>
                            </div>

                            {/* Base fare */}
                            <div className="bg-white dark:bg-[#1a2632] p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-colors">
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Tarif Dasar Pengantaran</label>
                                        <span className="material-symbols-outlined text-gray-400 text-lg">local_shipping</span>
                                    </div>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                            <span className="text-gray-500 font-medium">Rp</span>
                                        </div>
                                        <input
                                            className="block w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 pl-12 py-3 focus:border-primary focus:ring-primary sm:text-lg font-bold text-gray-900 dark:text-white"
                                            type="number"
                                            value={financial.base_delivery_fare}
                                            onChange={e => setFinancial(p => ({ ...p, base_delivery_fare: Number(e.target.value) }))}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Harga awal per pengiriman.</p>
                                </div>
                            </div>

                            {/* Parking fee */}
                            <div className="bg-white dark:bg-[#1a2632] p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-colors">
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Biaya Parkir Otomatis</label>
                                        <span className="material-symbols-outlined text-gray-400 text-lg">local_parking</span>
                                    </div>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                            <span className="text-gray-500 font-medium">Rp</span>
                                        </div>
                                        <input
                                            className="block w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 pl-12 py-3 focus:border-primary focus:ring-primary sm:text-lg font-bold text-gray-900 dark:text-white"
                                            type="number"
                                            value={financial.parking_fee}
                                            onChange={e => setFinancial(p => ({ ...p, parking_fee: Number(e.target.value) }))}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Tambahan biaya parkir driver.</p>
                                </div>
                            </div>

                            {/* COD admin fee */}
                            <div className="bg-white dark:bg-[#1a2632] p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-colors">
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Batas Potongan Ongkir COD</label>
                                        <span className="material-symbols-outlined text-gray-400 text-lg">price_check</span>
                                    </div>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                            <span className="text-gray-500 font-medium">Rp</span>
                                        </div>
                                        <input
                                            className="block w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 pl-12 py-3 focus:border-primary focus:ring-primary sm:text-lg font-bold text-gray-900 dark:text-white"
                                            type="number"
                                            value={financial.cod_admin_fee}
                                            onChange={e => setFinancial(p => ({ ...p, cod_admin_fee: Number(e.target.value) }))}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Potongan biaya admin dari ongkos kirim.</p>
                                </div>
                            </div>
                        </div>

                        {/* Bank Details */}
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
                                            <select
                                                className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-gray-50 dark:bg-gray-800 dark:text-white py-2.5"
                                                value={bank.bank_name}
                                                onChange={e => setBank(p => ({ ...p, bank_name: e.target.value }))}
                                            >
                                                <option>BCA</option>
                                                <option>Mandiri</option>
                                                <option>BRI</option>
                                                <option>BNI</option>
                                                <option>BSI</option>
                                                <option>CIMB Niaga</option>
                                                <option>Dana</option>
                                                <option>OVO</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nomor Rekening</label>
                                            <input
                                                className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-gray-50 dark:bg-gray-800 dark:text-white py-2.5"
                                                placeholder="Contoh: 1234567890"
                                                type="text"
                                                value={bank.account_number}
                                                onChange={e => setBank(p => ({ ...p, account_number: e.target.value }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nama Pemilik Rekening</label>
                                            <input
                                                className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-gray-50 dark:bg-gray-800 dark:text-white py-2.5"
                                                placeholder="Contoh: PT. Food Delivery Indonesia"
                                                type="text"
                                                value={bank.account_holder}
                                                onChange={e => setBank(p => ({ ...p, account_holder: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                    {/* Bank Card Preview */}
                                    <div className="flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-dashed border-gray-300 dark:border-gray-600">
                                        <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
                                            <span className="material-symbols-outlined text-3xl">credit_card</span>
                                        </div>
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Pratinjau Kartu Driver</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-[200px] mb-4">Informasi ini akan muncul di aplikasi driver saat melakukan top-up deposit.</p>
                                        <div className="w-full max-w-sm bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-4 text-white shadow-lg relative overflow-hidden">
                                            <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-white opacity-10 rounded-full"></div>
                                            <div className="flex justify-between items-start mb-6 relative z-10">
                                                <span className="font-bold tracking-wider">{bank.bank_name || 'BANK'}</span>
                                                <span className="material-symbols-outlined">contactless</span>
                                            </div>
                                            <div className="mb-4 relative z-10">
                                                <p className="text-xs opacity-80 mb-1">Nomor Rekening</p>
                                                <p className="font-mono text-lg tracking-widest">{bank.account_number ? bank.account_number.replace(/(.{4})/g, '$1 ').trim() : '•••• •••• ••'}</p>
                                            </div>
                                            <div className="relative z-10">
                                                <p className="text-xs opacity-80 mb-1">Nama Pemilik</p>
                                                <p className="text-sm font-medium truncate">{bank.account_holder ? bank.account_holder.toUpperCase() : 'BELUM DIISI'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={saveFinancial}
                                disabled={saving}
                                className="px-6 py-2.5 rounded-lg bg-primary hover:bg-blue-600 text-white font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {saving && <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>}
                                Simpan Perubahan
                            </button>
                        </div>
                    </section>
                )}

                {/* ========== ACCOUNT TAB ========== */}
                {activeTab === 'akun' && (
                    <section className="space-y-5 pb-10 animate-[fadeIn_0.3s_ease-out]">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-primary">manage_accounts</span>
                            <h3 className="text-lg font-bold text-[#111418] dark:text-white">Profil & Lokasi Kantor</h3>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Profile Form */}
                            <div className="lg:col-span-1 bg-white dark:bg-[#1a2632] p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between h-full">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 rounded-full overflow-hidden bg-primary/10 ring-4 ring-gray-50 dark:ring-gray-700 shrink-0 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-primary text-3xl">admin_panel_settings</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{adminProfile.full_name || 'Admin'}</p>
                                            <p className="text-xs text-gray-500">Administrator</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nama Lengkap</label>
                                            <input
                                                className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-gray-50 dark:bg-gray-800 dark:text-white py-2.5"
                                                type="text"
                                                value={adminProfile.full_name}
                                                onChange={e => setAdminProfile(p => ({ ...p, full_name: e.target.value }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nomor WhatsApp</label>
                                            <input
                                                className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-gray-50 dark:bg-gray-800 dark:text-white py-2.5"
                                                type="tel"
                                                placeholder="08xx-xxxx-xxxx"
                                                value={adminProfile.whatsapp}
                                                onChange={e => setAdminProfile(p => ({ ...p, whatsapp: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Office Location */}
                            <div className="lg:col-span-2 bg-white dark:bg-[#1a2632] p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col h-full min-h-[400px]">
                                <div className="mb-4">
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Lokasi Kantor Pusat (Titik Temu COD)</label>
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <textarea
                                                className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-gray-50 dark:bg-gray-800 dark:text-white resize-none py-2.5"
                                                placeholder="Alamat lengkap..."
                                                rows="2"
                                                value={adminProfile.office_address}
                                                onChange={e => setAdminProfile(p => ({ ...p, office_address: e.target.value }))}
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                                {/* Map placeholder */}
                                <div className="relative w-full flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden group border border-gray-200 dark:border-gray-700">
                                    <div className="absolute inset-0 opacity-15 dark:opacity-10" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=%2720%27 height=%2720%27 viewBox=%270 0 20 20%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg fill=%27%239C92AC%27 fill-opacity=%270.4%27 fill-rule=%27evenodd%27%3E%3Ccircle cx=%273%27 cy=%273%27 r=%273%27/%3E%3Ccircle cx=%2713%27 cy=%2713%27 r=%273%27/%3E%3C/g%3E%3C/svg%3E')" }}></div>
                                    <div className="absolute inset-0 bg-blue-50/30 dark:bg-blue-900/10 pointer-events-none"></div>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                                        <div className="relative cursor-pointer hover:-translate-y-1 transition-transform">
                                            <span className="material-symbols-outlined text-red-500 text-5xl drop-shadow-xl filter">location_on</span>
                                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3 h-1 bg-black/30 rounded-full blur-[2px]"></div>
                                        </div>
                                        <div className="mt-2 px-3 py-1.5 bg-white dark:bg-gray-900 rounded-lg shadow-lg text-xs font-bold text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                                            Kantor Pusat
                                        </div>
                                    </div>
                                    <div className="absolute top-4 left-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm px-4 py-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 max-w-xs">
                                        <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold mb-0.5">Koordinat</p>
                                        <p className="text-xs font-mono text-gray-900 dark:text-white">{adminProfile.office_lat}, {adminProfile.office_lng}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button
                                onClick={saveProfile}
                                disabled={saving}
                                className="px-6 py-2.5 rounded-lg bg-primary hover:bg-blue-600 text-white font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {saving && <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>}
                                Simpan Profil
                            </button>
                        </div>
                    </section>
                )}
            </div>
        </AdminLayout>
    )
}
