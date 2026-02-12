import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminHeader from '../../components/admin/AdminHeader'

export default function AdminCreatePromoPage() {
    const navigate = useNavigate()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [promoType, setPromoType] = useState('discount') // discount, freeshipping
    const [isOpenType, setIsOpenType] = useState(false)

    const handleSave = (e) => {
        e.preventDefault()
        // Logic to save promo would go here
        navigate('/admin/promos')
    }

    return (
        <div className="flex min-h-screen w-full bg-[#f6f7f8] dark:bg-[#101922] font-display text-[#111418] dark:text-white overflow-x-hidden relative">
            <AdminSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <main className="flex-1 lg:ml-[280px] flex flex-col min-w-0 relative">
                <AdminHeader
                    onMenuClick={() => setIsSidebarOpen(true)}
                    title="Manajemen Promo"
                />

                <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
                    <div className="max-w-4xl mx-auto flex flex-col gap-6">

                        {/* Breadcrumbs & Title */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-sm text-[#617589] dark:text-[#94a3b8]">
                                <Link to="/admin/promos" className="hover:text-primary transition-colors">Manajemen Promo</Link>
                                <span className="material-symbols-outlined text-xs">chevron_right</span>
                                <span className="text-primary font-medium">Buat Baru</span>
                            </div>
                            <h1 className="text-2xl font-bold text-[#111418] dark:text-white">Buat Promo Baru</h1>
                            <p className="text-[#617589] dark:text-[#94a3b8] text-sm">Lengkapi detail di bawah ini untuk membuat program promosi baru.</p>
                        </div>

                        {/* Form Card */}
                        <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl p-6 lg:p-8 shadow-sm">
                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-[#111418] dark:text-white" htmlFor="promoName">
                                        Nama Promo
                                    </label>
                                    <input
                                        className="w-full px-4 py-2.5 rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] bg-white dark:bg-[#101922] text-[#111418] dark:text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-gray-400"
                                        id="promoName"
                                        placeholder="Contoh: Diskon Kemerdekaan 45%"
                                        type="text"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-[#111418] dark:text-white">
                                        Jenis Promo
                                    </label>
                                    <div className="relative">
                                        <div
                                            className="relative w-full cursor-pointer group"
                                            onClick={() => setIsOpenType(!isOpenType)}
                                        >
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-[#617589]">
                                                <span className="material-symbols-outlined">
                                                    {promoType === 'discount' ? 'local_offer' : 'local_shipping'}
                                                </span>
                                            </div>
                                            <div className="w-full pl-12 pr-10 py-2.5 rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] ring-1 ring-transparent focus-within:ring-primary focus-within:border-primary bg-white dark:bg-[#101922] text-[#111418] dark:text-white flex items-center transition-all">
                                                <span className="block truncate">
                                                    {promoType === 'discount' ? 'Diskon Harga' : 'Gratis Ongkir'}
                                                </span>
                                            </div>
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-[#617589]">
                                                <span className="material-symbols-outlined text-[20px] transition-transform duration-200" style={{ transform: isOpenType ? 'rotate(180deg)' : 'rotate(0deg)' }}>keyboard_arrow_down</span>
                                            </div>
                                        </div>

                                        {isOpenType && (
                                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg shadow-lg overflow-hidden animate-[fadeIn_0.1s_ease-out] origin-top">
                                                <div
                                                    className={`flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d] transition-colors ${promoType === 'discount' ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                                                    onClick={() => { setPromoType('discount'); setIsOpenType(false); }}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className={`material-symbols-outlined text-[20px] ${promoType === 'discount' ? 'text-primary' : 'text-[#617589] dark:text-[#94a3b8]'}`}>local_offer</span>
                                                        <span className={`text-sm font-medium ${promoType === 'discount' ? 'text-[#111418] dark:text-white' : 'text-[#617589] dark:text-[#94a3b8]'}`}>Diskon Harga</span>
                                                    </div>
                                                    {promoType === 'discount' && <span className="material-symbols-outlined text-primary text-[20px]">check</span>}
                                                </div>
                                                <div
                                                    className={`flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d] transition-colors ${promoType === 'freeshipping' ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                                                    onClick={() => { setPromoType('freeshipping'); setIsOpenType(false); }}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className={`material-symbols-outlined text-[20px] ${promoType === 'freeshipping' ? 'text-primary' : 'text-[#617589] dark:text-[#94a3b8]'}`}>local_shipping</span>
                                                        <span className={`text-sm font-medium ${promoType === 'freeshipping' ? 'text-[#111418] dark:text-white' : 'text-[#617589] dark:text-[#94a3b8]'}`}>Gratis Ongkir</span>
                                                    </div>
                                                    {promoType === 'freeshipping' && <span className="material-symbols-outlined text-primary text-[20px]">check</span>}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-medium text-[#111418] dark:text-white" htmlFor="promoValue">
                                            Nilai Promo
                                        </label>
                                        <div className="relative">
                                            <input
                                                className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] bg-white dark:bg-[#101922] text-[#111418] dark:text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-gray-400"
                                                id="promoValue"
                                                placeholder="0"
                                                type="number"
                                            />
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-[#617589]">
                                                <span className="text-sm font-medium">%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-medium text-[#111418] dark:text-white" htmlFor="maxDiscount">
                                            Batas Maksimum Potongan
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-[#617589]">
                                                <span className="text-sm font-medium">Rp</span>
                                            </div>
                                            <input
                                                className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] bg-white dark:bg-[#101922] text-[#111418] dark:text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-gray-400"
                                                id="maxDiscount"
                                                placeholder="0"
                                                type="text"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-[#111418] dark:text-white" htmlFor="minPurchase">
                                        Minimum Pembelian
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-[#617589]">
                                            <span className="text-sm font-medium">Rp</span>
                                        </div>
                                        <input
                                            className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] bg-white dark:bg-[#101922] text-[#111418] dark:text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-gray-400"
                                            id="minPurchase"
                                            placeholder="0"
                                            type="text"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-medium text-[#111418] dark:text-white" htmlFor="startDate">
                                            Tanggal Mulai
                                        </label>
                                        <div className="relative">
                                            <input
                                                className="w-full pl-4 pr-4 py-2.5 rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] bg-white dark:bg-[#101922] text-[#111418] dark:text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-gray-400 [color-scheme:light] dark:[color-scheme:dark]"
                                                id="startDate"
                                                type="date"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-medium text-[#111418] dark:text-white" htmlFor="endDate">
                                            Tanggal Selesai
                                        </label>
                                        <div className="relative">
                                            <input
                                                className="w-full pl-4 pr-4 py-2.5 rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] bg-white dark:bg-[#101922] text-[#111418] dark:text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-gray-400 [color-scheme:light] dark:[color-scheme:dark]"
                                                id="endDate"
                                                type="date"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2 flex items-center justify-between border-t border-[#e5e7eb] dark:border-[#2a3b4d] mt-8">
                                    <div className="flex items-center gap-4 mt-6">
                                        <label className="relative inline-flex items-center cursor-pointer group">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none dark:peer-focus:ring-primary rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                            <span className="ml-3 text-sm font-medium text-[#111418] dark:text-white group-hover:text-primary transition-colors">Aktifkan Segera</span>
                                        </label>
                                    </div>
                                    <div className="flex items-center gap-3 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => navigate('/admin/promos')}
                                            className="px-6 py-2.5 rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] text-[#617589] dark:text-[#94a3b8] font-medium hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d] hover:text-[#111418] dark:hover:text-white transition-colors"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-6 py-2.5 rounded-lg bg-primary hover:bg-blue-600 text-white font-medium transition-colors shadow-none"
                                        >
                                            Simpan Promo
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
