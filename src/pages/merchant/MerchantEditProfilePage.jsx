import { useNavigate } from 'react-router-dom'

function MerchantEditProfilePage() {
    const navigate = useNavigate()

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 relative min-h-screen flex flex-col overflow-x-hidden pb-[88px]">
            <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 pt-12 pb-4 flex items-center justify-between border-b border-transparent dark:border-gray-800">
                <button
                    onClick={() => navigate(-1)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-lg font-bold text-text-main dark:text-white leading-tight">Ubah Profil</h1>
                <div className="w-8"></div>
            </header>

            <main className="flex flex-col gap-6 px-4 pt-2">
                <section className="flex flex-col items-center pt-4 pb-2">
                    <div className="relative w-28 h-28 mb-4">
                        <img
                            alt="Warung Profile"
                            className="w-full h-full object-cover rounded-full shadow-md border-4 border-white dark:border-gray-700"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPJUWVGlK5dsbdE1ze8KcSanUwlmrqPGkiL40KT-e-wmETHdEO4T-s9SgWNs48g6LrOlvLJ4gqY4S2X6lFXcbGSqxLAEOX9YEeHCNnrpWvnjL9RGR4rhcQjjKU2H5TcZfa2M1UFFghOLebABGwFMecQtTpq_kT0Tj7YOwjIYbGbwvqogf55x4snrWPnlI7hNmhSrGiDGx2Dxqvaxv6vIvY-ygVSXGTq2Q_f9UOCdZ0eSP_sZ5y5PWT1Ue4I-W3jUFkZau2xS2mQw8A"
                        />
                        <button className="absolute bottom-1 right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white shadow-sm border-2 border-white dark:border-gray-800 hover:bg-primary-dark transition-colors">
                            <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                        </button>
                    </div>
                </section>

                <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-text-main dark:text-gray-200" htmlFor="shopName">Nama Warung</label>
                        <input
                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-card-dark border border-border-color dark:border-gray-700 text-text-main dark:text-white placeholder-text-secondary dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                            id="shopName"
                            placeholder="Warung Bu Ningsih"
                            type="text"
                            defaultValue="Warung Bu Ningsih"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-text-main dark:text-gray-200" htmlFor="category">Kategori Kuliner</label>
                        <input
                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-card-dark border border-border-color dark:border-gray-700 text-text-main dark:text-white placeholder-text-secondary dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                            id="category"
                            placeholder="Masakan Rumah"
                            type="text"
                            defaultValue="Masakan Rumah"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-text-main dark:text-gray-200" htmlFor="location">Lokasi Warung</label>
                        <input
                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-card-dark border border-border-color dark:border-gray-700 text-text-main dark:text-white placeholder-text-secondary dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                            id="location"
                            placeholder="Jakarta Selatan"
                            type="text"
                            defaultValue="Jakarta Selatan"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-text-main dark:text-gray-200" htmlFor="description">Deskripsi Warung</label>
                        <textarea
                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-card-dark border border-border-color dark:border-gray-700 text-text-main dark:text-white placeholder-text-secondary dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm resize-none"
                            id="description"
                            placeholder="Deskripsikan warung Anda..."
                            rows="4"
                        ></textarea>
                    </div>
                    <div className="pt-4">
                        <button
                            className="w-full py-4 bg-primary hover:bg-primary-dark active:scale-[0.98] transition-all text-white font-bold rounded-2xl shadow-lg shadow-primary/30 text-base"
                            type="button"
                            onClick={() => navigate(-1)}
                        >
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
                <div className="h-4"></div>
            </main>
        </div>
    )
}

export default MerchantEditProfilePage
