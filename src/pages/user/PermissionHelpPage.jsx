import { useNavigate } from 'react-router-dom'

function PermissionHelpPage() {
    const navigate = useNavigate()

    return (
        <div className="relative min-h-screen flex flex-col bg-background-light pb-6">
            <header className="sticky top-0 z-20 bg-background-light/95 backdrop-blur-md px-4 pt-12 pb-4 flex items-center justify-between border-b border-transparent transition-colors">
                <button
                    onClick={() => navigate(-1)}
                    className="absolute left-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-text-main active:scale-95 transition-transform"
                >
                    <span className="material-symbols-outlined text-text-main">arrow_back</span>
                </button>
                <h1 className="text-text-main text-lg font-bold tracking-tight absolute left-1/2 transform -translate-x-1/2 whitespace-nowrap">Izin Lokasi & Notifikasi</h1>
                <div className="w-10 h-10"></div>
            </header>

            <main className="flex flex-col gap-6 px-4 pt-4">
                <section>
                    <div className="bg-white rounded-2xl p-5 shadow-soft border border-border-color">
                        <h2 className="text-lg font-bold text-text-main mb-4">Mengapa Izin Diperlukan?</h2>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-xl">location_on</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-text-main text-sm mb-1">Akses Lokasi</h3>
                                    <p className="text-xs text-text-secondary leading-relaxed">
                                        Diperlukan agar driver dapat menjemput dan mengantar pesanan ke titik yang akurat. Aktifkan mode "Izinkan Hanya Saat Aplikasi Digunakan".
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-xl">notifications</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-text-main text-sm mb-1">Notifikasi</h3>
                                    <p className="text-xs text-text-secondary leading-relaxed">
                                        Agar kamu tidak ketinggalan update status pesanan, promo terbaru, dan chat dari driver.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <div className="bg-white rounded-2xl p-5 shadow-soft border border-border-color">
                        <h2 className="text-lg font-bold text-text-main mb-4">Cara Mengaktifkan</h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-text-main mt-0.5">1</div>
                                <p className="text-sm text-text-secondary leading-relaxed">Buka menu <b>Pengaturan (Settings)</b> di HP kamu.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-text-main mt-0.5">2</div>
                                <p className="text-sm text-text-secondary leading-relaxed">Pilih <b>Aplikasi</b>, lalu cari dan pilih <b>Bantoo!</b>.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-text-main mt-0.5">3</div>
                                <p className="text-sm text-text-secondary leading-relaxed">Masuk ke menu <b>Izin (Permissions)</b>.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-text-main mt-0.5">4</div>
                                <p className="text-sm text-text-secondary leading-relaxed">Aktifkan izin untuk <b>Lokasi</b> dan <b>Notifikasi</b>.</p>
                            </div>
                        </div>
                        <div className="mt-6">
                            <button className="w-full py-3 rounded-xl bg-gray-900 text-white font-semibold text-sm shadow-md active:scale-[0.98] transition-transform">
                                Buka Pengaturan Aplikasi
                            </button>
                            <p className="text-[10px] text-center text-text-secondary mt-2">*Tombol ini akan membawamu ke pengaturan sistem HP.</p>
                        </div>
                    </div>
                </section>

                <section className="mt-4 mb-6">
                    <h2 className="text-base font-bold text-text-main mb-4">Butuh Bantuan Lain?</h2>
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

export default PermissionHelpPage
