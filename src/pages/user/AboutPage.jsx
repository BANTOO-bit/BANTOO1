import { useNavigate } from 'react-router-dom'

function AboutPage() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen flex flex-col bg-background-light">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white px-4 pt-12 pb-4 border-b border-border-color">
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
                {/* Logo & Tagline */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center mb-4 shadow-lg">
                        <span className="text-4xl font-bold text-white">B!</span>
                    </div>
                    <h2 className="text-2xl font-bold text-primary">Bantoo!</h2>
                    <p className="text-text-secondary text-sm mt-1">Teman Lapar-mu di Kecamatan</p>
                </div>

                {/* About Content */}
                <div className="bg-white rounded-2xl border border-border-color p-5 mb-6">
                    <h3 className="font-bold text-text-main mb-3">Tentang Kami</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                        Bantoo! adalah aplikasi pesan-antar makanan lokal yang menghubungkan kamu dengan resto-resto terbaik di kecamatan.
                        Kami berkomitmen untuk mendukung UMKM kuliner lokal dan memberikan pengalaman pesan makanan yang cepat, mudah, dan terjangkau.
                    </p>
                </div>

                {/* Mission */}
                <div className="bg-white rounded-2xl border border-border-color p-5 mb-6">
                    <h3 className="font-bold text-text-main mb-3">Misi Kami</h3>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-primary mt-0.5">check_circle</span>
                            <span className="text-sm text-text-secondary">Mendukung pertumbuhan UMKM kuliner lokal</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-primary mt-0.5">check_circle</span>
                            <span className="text-sm text-text-secondary">Menyediakan layanan antar yang cepat dan terpercaya</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-primary mt-0.5">check_circle</span>
                            <span className="text-sm text-text-secondary">Memberikan harga yang adil untuk semua pihak</span>
                        </li>
                    </ul>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-orange-50 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-primary">50+</p>
                        <p className="text-xs text-text-secondary mt-1">Merchant</p>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-primary">20+</p>
                        <p className="text-xs text-text-secondary mt-1">Driver</p>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-primary">1000+</p>
                        <p className="text-xs text-text-secondary mt-1">Pesanan</p>
                    </div>
                </div>

                {/* Social Links */}
                <div className="bg-white rounded-2xl border border-border-color p-5">
                    <h3 className="font-bold text-text-main mb-3">Ikuti Kami</h3>
                    <div className="flex gap-3">
                        <button className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-xl">📸</span>
                        </button>
                        <button className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-xl">🐦</span>
                        </button>
                        <button className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-xl">📘</span>
                        </button>
                        <button className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-xl">🎵</span>
                        </button>
                    </div>
                </div>

                {/* Version */}
                <p className="text-center text-xs text-text-secondary mt-6">
                    Version 2.4.1 (Build 120)
                </p>
            </main>
        </div>
    )
}

export default AboutPage
