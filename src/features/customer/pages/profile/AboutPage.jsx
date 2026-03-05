import { useNavigate } from 'react-router-dom'

function AboutPage() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen flex flex-col bg-background-light">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md px-4 pt-12 pb-4 border-b border-border-color">
                <div className="relative flex items-center justify-center min-h-[40px]">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute left-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-text-main active:scale-95 transition-transform"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-bold">Tentang Bantoo!</h1>
                </div>
            </header>

            <main className="flex-1 px-4 py-6">
                {/* Hero Logo Section */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-40 mb-3">
                        <img src="/images/bantoo-logo.png" alt="Bantoo" className="w-full h-auto object-contain" />
                    </div>
                    <p className="text-sm text-text-secondary font-medium">Teman Lapar-mu di Kecamatan</p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">Food Delivery</span>
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">UMKM Lokal</span>
                    </div>
                </div>

                {/* About Content */}
                <div className="bg-white rounded-2xl border border-border-color p-5 mb-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-primary text-xl">info</span>
                        <h3 className="font-bold text-text-main">Tentang Kami</h3>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">
                        Bantoo! adalah aplikasi pesan-antar makanan lokal yang menghubungkan kamu dengan warung-warung terbaik di kecamatan.
                        Kami berkomitmen untuk mendukung UMKM kuliner lokal dan memberikan pengalaman pesan makanan yang cepat, mudah, dan terjangkau.
                    </p>
                </div>

                {/* Mission */}
                <div className="bg-white rounded-2xl border border-border-color p-5 mb-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-primary text-xl">flag</span>
                        <h3 className="font-bold text-text-main">Misi Kami</h3>
                    </div>
                    <ul className="space-y-3">
                        {[
                            { icon: 'storefront', text: 'Mendukung pertumbuhan UMKM kuliner lokal' },
                            { icon: 'local_shipping', text: 'Menyediakan layanan antar yang cepat dan terpercaya' },
                            { icon: 'handshake', text: 'Memberikan harga yang adil untuk semua pihak' },
                            { icon: 'eco', text: 'Membangun ekosistem yang berkelanjutan' },
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-3 bg-blue-50/50 rounded-xl px-3 py-2.5">
                                <span className="material-symbols-outlined text-primary text-lg">{item.icon}</span>
                                <span className="text-sm text-text-secondary font-medium">{item.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* How It Works */}
                <div className="bg-white rounded-2xl border border-border-color p-5 mb-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-primary text-xl">route</span>
                        <h3 className="font-bold text-text-main">Cara Kerja</h3>
                    </div>
                    <div className="space-y-4">
                        {[
                            { step: '1', title: 'Pilih Warung', desc: 'Jelajahi warung terdekat di sekitarmu', icon: 'search', color: 'bg-blue-500' },
                            { step: '2', title: 'Pesan Menu', desc: 'Pilih menu favoritmu dan masukkan ke keranjang', icon: 'restaurant_menu', color: 'bg-green-500' },
                            { step: '3', title: 'Antar ke Rumah', desc: 'Driver kami antarkan pesananmu dengan cepat', icon: 'two_wheeler', color: 'bg-orange-500' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                    <span className="material-symbols-outlined text-white text-lg">{item.icon}</span>
                                </div>
                                <div className="flex-1 pt-0.5">
                                    <p className="text-sm font-bold text-text-main">{item.title}</p>
                                    <p className="text-xs text-text-secondary mt-0.5">{item.desc}</p>
                                </div>
                                {i < 2 && <div className="absolute left-[35px] mt-10 w-0.5 h-4 bg-gray-200" />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                        { value: '50+', label: 'Warung', icon: 'store', color: 'text-blue-600', bg: 'bg-blue-50' },
                        { value: '20+', label: 'Driver', icon: 'two_wheeler', color: 'text-green-600', bg: 'bg-green-50' },
                        { value: '1K+', label: 'Pesanan', icon: 'receipt_long', color: 'text-orange-600', bg: 'bg-orange-50' },
                    ].map((stat, i) => (
                        <div key={i} className={`${stat.bg} rounded-2xl p-4 text-center border border-transparent`}>
                            <span className={`material-symbols-outlined ${stat.color} text-2xl`}>{stat.icon}</span>
                            <p className={`text-xl font-bold ${stat.color} mt-1`}>{stat.value}</p>
                            <p className="text-xs text-text-secondary font-medium mt-0.5">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Contact & Social */}
                <div className="bg-white rounded-2xl border border-border-color p-5 mb-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-primary text-xl">group</span>
                        <h3 className="font-bold text-text-main">Ikuti Kami</h3>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                        {[
                            { emoji: '📸', label: 'Instagram', bg: 'bg-gradient-to-br from-purple-100 to-pink-100' },
                            { emoji: '🐦', label: 'Twitter', bg: 'bg-blue-50' },
                            { emoji: '📘', label: 'Facebook', bg: 'bg-indigo-50' },
                            { emoji: '🎵', label: 'TikTok', bg: 'bg-gray-100' },
                        ].map((item, i) => (
                            <button key={i} className={`${item.bg} rounded-2xl p-3 flex flex-col items-center gap-1.5 active:scale-95 transition-transform`}>
                                <span className="text-2xl">{item.emoji}</span>
                                <span className="text-[10px] font-semibold text-text-secondary">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Version & Legal */}
                <div className="text-center py-4 space-y-1">
                    <p className="text-xs text-text-secondary font-medium">
                        Bantoo! v2.4.1
                    </p>
                    <p className="text-[10px] text-gray-400">
                        © 2026 Bantoo. All rights reserved.
                    </p>
                </div>
            </main>
        </div>
    )
}

export default AboutPage
