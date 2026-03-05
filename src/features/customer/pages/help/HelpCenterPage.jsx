import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

const CATEGORIES = [
    { icon: 'shopping_bag', label: 'Masalah Pesanan', path: '/help/order', color: 'bg-orange-50 text-orange-500' },
    { icon: 'payments', label: 'Pembayaran', path: '/help/payment', color: 'bg-blue-50 text-blue-500' },
    { icon: 'person', label: 'Akun & Profil', path: '/help/account', color: 'bg-green-50 text-green-500' },
    { icon: 'local_offer', label: 'Promo & Voucher', path: '/help/promo', color: 'bg-purple-50 text-purple-500' },
    { icon: 'security', label: 'Keamanan & Privasi', path: '/help/security', color: 'bg-red-50 text-red-500' },
]

const FAQ_ITEMS = [
    { label: 'Cara pendaftaran Mitra (Warung/Driver)', path: '/help/partner-registration', icon: 'handshake' },
    { label: 'Bagaimana lacak posisi driver?', path: '/help/driver-tracking', icon: 'location_on' },
    { label: 'Cara ubah metode pembayaran', path: '/help/change-payment', icon: 'credit_card' },
    { label: 'Laporan pesanan tidak sampai', path: '/help/order-not-arrived-faq', icon: 'report_problem' },
    { label: 'Cara membatalkan pesanan', path: '/help/order/cancel', icon: 'cancel' },
    { label: 'Prosedur refund / pengembalian', path: '/help/payment/refund', icon: 'currency_exchange' },
]

function HelpCenterPage() {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')

    const filteredFAQ = useMemo(() => {
        if (!searchQuery.trim()) return FAQ_ITEMS
        const q = searchQuery.toLowerCase()
        return FAQ_ITEMS.filter(item => item.label.toLowerCase().includes(q))
    }, [searchQuery])

    const filteredCategories = useMemo(() => {
        if (!searchQuery.trim()) return CATEGORIES
        const q = searchQuery.toLowerCase()
        return CATEGORIES.filter(item => item.label.toLowerCase().includes(q))
    }, [searchQuery])

    return (
        <div className="relative min-h-screen flex flex-col bg-background-light pb-6">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 pt-12 pb-3 border-b border-border-color">
                <div className="relative flex items-center justify-center min-h-[40px]">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute left-0 flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 active:scale-95 transition-all"
                    >
                        <span className="material-symbols-outlined text-text-main">arrow_back</span>
                    </button>
                    <h1 className="text-text-main text-lg font-bold tracking-tight">Pusat Bantuan</h1>
                    <div className="w-10 h-10" />
                </div>
            </header>

            <main className="flex flex-col gap-5 px-4 pt-4">
                {/* Greeting */}
                <div className="bg-white rounded-2xl border border-border-color p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary">support_agent</span>
                        </div>
                        <div>
                            <p className="text-base font-bold text-text-main">Halo, ada yang bisa Bantoo! bantu?</p>
                            <p className="text-xs text-text-secondary">Cari jawaban atau hubungi tim kami</p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative flex items-center w-full h-11 rounded-xl bg-gray-50 overflow-hidden border border-border-color focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50 transition-all">
                        <div className="grid place-items-center h-full w-11 text-text-secondary">
                            <span className="material-symbols-outlined text-xl">search</span>
                        </div>
                        <input
                            className="h-full w-full outline-none bg-transparent text-sm text-text-main placeholder:text-text-secondary font-normal pr-4"
                            placeholder="Cari masalah atau pertanyaan..."
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="pr-3 text-text-secondary hover:text-text-main"
                            >
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Categories */}
                <section>
                    <h2 className="text-sm font-bold text-text-main mb-3 px-1">Kategori Bantuan</h2>
                    <div className="grid grid-cols-2 gap-2.5">
                        {filteredCategories.map((cat, i) => (
                            <button
                                key={i}
                                onClick={() => navigate(cat.path)}
                                className={`p-4 rounded-2xl bg-white shadow-sm border border-border-color flex flex-col gap-2.5 items-center justify-center text-center active:scale-[0.97] hover:shadow-md transition-all ${i === filteredCategories.length - 1 && filteredCategories.length % 2 !== 0 ? 'col-span-2' : ''}`}
                            >
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${cat.color}`}>
                                    <span className="material-symbols-outlined text-[22px]">{cat.icon}</span>
                                </div>
                                <span className="font-semibold text-sm text-text-main">{cat.label}</span>
                            </button>
                        ))}
                    </div>
                    {filteredCategories.length === 0 && searchQuery && (
                        <p className="text-center text-sm text-text-secondary py-4">Kategori tidak ditemukan</p>
                    )}
                </section>

                {/* FAQ */}
                <section>
                    <h2 className="text-sm font-bold text-text-main mb-3 px-1">Pertanyaan Populer</h2>
                    <div className="flex flex-col gap-2">
                        {filteredFAQ.map((item, i) => (
                            <button
                                key={i}
                                onClick={() => navigate(item.path)}
                                className="w-full flex items-center gap-3 p-3.5 bg-white rounded-xl border border-border-color active:bg-gray-50 hover:shadow-sm transition-all group"
                            >
                                <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                                    <span className="material-symbols-outlined text-text-secondary text-lg group-hover:text-primary transition-colors">{item.icon}</span>
                                </div>
                                <span className="text-sm text-text-main font-medium text-left flex-1">{item.label}</span>
                                <span className="material-symbols-outlined text-gray-300 text-base">chevron_right</span>
                            </button>
                        ))}
                    </div>
                    {filteredFAQ.length === 0 && searchQuery && (
                        <p className="text-center text-sm text-text-secondary py-4">Pertanyaan tidak ditemukan</p>
                    )}
                </section>

                {/* Contact Support */}
                <section className="pb-4">
                    <h2 className="text-sm font-bold text-text-main mb-3 px-1">Butuh Bantuan Lain?</h2>
                    <div className="bg-white rounded-2xl border border-border-color p-5 shadow-sm space-y-3">
                        <button className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] text-white font-semibold text-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2.5 shadow-sm">
                            <svg className="bi bi-whatsapp" fill="currentColor" height="20" viewBox="0 0 16 16" width="20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"></path>
                            </svg>
                            <span>Chat via WhatsApp</span>
                        </button>

                        <button
                            onClick={() => window.location.href = 'mailto:support@bantoo.app'}
                            className="w-full py-3.5 px-4 rounded-xl bg-white text-text-main font-semibold text-sm border border-border-color active:scale-[0.98] transition-transform flex items-center justify-center gap-2.5 hover:bg-gray-50"
                        >
                            <span className="material-symbols-outlined text-primary text-lg">mail</span>
                            <span>Email Support</span>
                        </button>

                        <p className="text-center text-xs text-text-secondary pt-1">
                            <span className="material-symbols-outlined text-xs align-text-bottom mr-0.5">schedule</span>
                            Jam Operasional: Setiap Hari 08:00 - 22:00 WIB
                        </p>
                    </div>
                </section>
            </main>
        </div>
    )
}

export default HelpCenterPage
