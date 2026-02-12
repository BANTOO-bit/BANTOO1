import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function HelpCategoryCard({ icon, label, color, onClick, className = "" }) {
    const bgColors = {
        orange: 'bg-orange-50 text-primary',
        blue: 'bg-blue-50 text-blue-500',
        green: 'bg-green-50 text-green-500',
        purple: 'bg-purple-50 text-purple-500',
        red: 'bg-red-50 text-red-500'
    }

    const bg = bgColors[color] || bgColors.orange

    // Handle dark mode equivalent for icons if needed, but keeping simple for now
    return (
        <button
            onClick={onClick}
            className={`p-4 rounded-2xl bg-white shadow-soft border border-border-color flex flex-col gap-3 items-center justify-center text-center active:scale-95 transition-transform ${className}`}
        >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bg}`}>
                <span className="material-symbols-outlined">{icon}</span>
            </div>
            <span className="font-semibold text-sm text-text-main">{label}</span>
        </button>
    )
}

function FAQButton({ label, onClick }) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-border-color active:bg-gray-50 transition-colors"
        >
            <span className="text-sm text-text-main font-medium text-left">{label}</span>
            <span className="material-symbols-outlined text-text-secondary text-sm">arrow_forward_ios</span>
        </button>
    )
}

function HelpCenterPage({ onNavigate }) {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')

    return (
        <div className="relative min-h-screen flex flex-col bg-background-light pb-6">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-background-light/95 backdrop-blur-md px-4 pt-12 pb-2 flex items-center justify-between border-b border-transparent transition-colors">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <span className="material-symbols-outlined text-text-main">arrow_back</span>
                </button>
                <h1 className="text-text-main text-lg font-bold tracking-tight absolute left-1/2 transform -translate-x-1/2">Pusat Bantuan</h1>
                <div className="w-10 h-10"></div>
            </header>

            <main className="flex flex-col gap-6 px-4 pt-4">
                {/* Search */}
                <section>
                    <div className="relative flex items-center w-full h-12 rounded-2xl focus-within:ring-2 focus-within:ring-primary/50 transition-shadow bg-white shadow-soft overflow-hidden border border-border-color">
                        <div className="grid place-items-center h-full w-12 text-text-secondary">
                            <span className="material-symbols-outlined">search</span>
                        </div>
                        <input
                            className="peer h-full w-full outline-none bg-transparent text-sm text-text-main placeholder:text-text-secondary font-normal pr-4"
                            id="search"
                            placeholder="Cari masalah atau pertanyaan..."
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="mt-6 mb-2 px-1">
                        <p className="text-[1.15rem] font-semibold text-[#2E2E2E] leading-snug">Halo, ada yang bisa Bantoo! bantu?</p>
                    </div>
                </section>

                {/* Categories */}
                <section>
                    <h2 className="text-base font-bold text-text-main mb-4">Kategori Bantuan</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <HelpCategoryCard
                            icon="shopping_bag"
                            label="Masalah Pesanan"
                            color="orange"
                            onClick={() => onNavigate?.('helpOrder')}
                        />
                        <HelpCategoryCard
                            icon="payments"
                            label="Pembayaran"
                            color="blue"
                            onClick={() => onNavigate?.('helpPayment')}
                        />
                        <HelpCategoryCard
                            icon="person"
                            label="Akun & Profil"
                            color="green"
                            onClick={() => onNavigate?.('helpAccount')}
                        />
                        <HelpCategoryCard
                            icon="local_offer"
                            label="Promo"
                            color="purple"
                            onClick={() => onNavigate?.('helpPromo')}
                        />

                        {/* Security Row Spanning 2 Columns */}
                        <button
                            onClick={() => onNavigate?.('helpSecurity')}
                            className="col-span-2 p-4 rounded-2xl bg-white shadow-soft border border-border-color flex flex-row items-center justify-center gap-3 active:scale-95 transition-transform"
                        >
                            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                                <span className="material-symbols-outlined">security</span>
                            </div>
                            <span className="font-semibold text-sm text-text-main">Keamanan & Privasi</span>
                        </button>
                    </div>
                </section>

                {/* FAQ */}
                <section>
                    <h2 className="text-base font-bold text-text-main mb-4">Tanya Bantoo!</h2>
                    <div className="flex flex-col gap-2">
                        <FAQButton label="Cara pendaftaran Mitra (Warung/Driver)" onClick={() => onNavigate?.('helpPartnerRegistration')} />
                        <FAQButton label="Bagaimana lacak posisi driver?" onClick={() => onNavigate?.('helpDriverTracking')} />
                        <FAQButton label="Cara ubah metode pembayaran" onClick={() => onNavigate?.('helpChangePayment')} />
                        <FAQButton label="Laporan pesanan tidak sampai" onClick={() => onNavigate?.('helpOrderNotArrivedFAQ')} />
                    </div>
                </section>

                {/* External Support */}
                <section className="mt-2 text-center pb-8">
                    <h2 className="text-base font-bold text-text-main mb-4 text-left">Butuh Bantuan Lain?</h2>
                    <div className="flex flex-col gap-3">
                        <button className="w-full py-3.5 px-4 rounded-2xl bg-[#25D366] text-white font-semibold text-sm shadow-md active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
                            <svg className="bi bi-whatsapp" fill="currentColor" height="20" viewBox="0 0 16 16" width="20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"></path>
                            </svg>
                            <span>WhatsApp Support</span>
                        </button>
                        <p className="text-center text-xs font-normal text-[#7A7A7A]">Jam Operasional: Setiap Hari (08:00 - 22:00 WIB)</p>
                    </div>
                </section>

                <div className="h-4"></div>
            </main>
        </div>
    )
}

export default HelpCenterPage
