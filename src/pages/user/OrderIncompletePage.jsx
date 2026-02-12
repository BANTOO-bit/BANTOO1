import { useNavigate } from 'react-router-dom'

function OrderIncompletePage() {
    const navigate = useNavigate()

    return (
        <div className="relative min-h-screen flex flex-col bg-background-light pb-6">
            <header className="sticky top-0 z-20 bg-background-light/95 backdrop-blur-md px-4 pt-12 pb-4 flex items-center justify-between border-b border-transparent transition-colors">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <span className="material-symbols-outlined text-text-main">arrow_back</span>
                </button>
                <h1 className="text-text-main text-base font-bold tracking-tight absolute left-1/2 transform -translate-x-1/2 whitespace-nowrap">Item Kurang/Tidak Lengkap</h1>
                <div className="w-10 h-10"></div>
            </header>

            <main className="flex flex-col gap-6 px-4 pt-4">
                <section>
                    <div className="bg-white rounded-2xl p-5 border border-border-color shadow-soft mb-6">
                        <p className="text-sm text-text-main leading-relaxed">
                            Mohon maaf jika pesanan Anda tidak lengkap. Untuk membantu kami memproses keluhan Anda dengan cepat, silakan ikuti langkah-langkah pelaporan di bawah ini:
                        </p>
                    </div>
                    <h2 className="text-sm font-bold text-text-main mb-4 uppercase tracking-wider text-xs">Langkah Pelaporan</h2>
                    <div className="flex flex-col gap-4 relative">
                        <div className="absolute left-[1.65rem] top-8 bottom-8 w-0.5 bg-gray-200 -z-10"></div>
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-14 h-14 rounded-full bg-white border-4 border-background-light flex items-center justify-center text-primary shadow-sm z-10">
                                <span className="material-symbols-outlined">receipt_long</span>
                            </div>
                            <div className="flex-grow pt-1 pb-2">
                                <h3 className="font-bold text-text-main text-sm mb-1">Foto Struk Belanja</h3>
                                <p className="text-xs text-text-secondary leading-relaxed">
                                    Ambil foto struk belanja fisik yang menempel pada kemasan. Pastikan nomor pesanan dan daftar item terlihat jelas.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-14 h-14 rounded-full bg-white border-4 border-background-light flex items-center justify-center text-primary shadow-sm z-10">
                                <span className="material-symbols-outlined">fastfood</span>
                            </div>
                            <div className="flex-grow pt-1 pb-2">
                                <h3 className="font-bold text-text-main text-sm mb-1">Foto Produk Diterima</h3>
                                <p className="text-xs text-text-secondary leading-relaxed">
                                    Foto seluruh makanan/minuman yang Anda terima. Keluarkan dari kantong agar terlihat semua itemnya.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-14 h-14 rounded-full bg-white border-4 border-background-light flex items-center justify-center text-primary shadow-sm z-10">
                                <span className="material-symbols-outlined">report_problem</span>
                            </div>
                            <div className="flex-grow pt-1 pb-2">
                                <h3 className="font-bold text-text-main text-sm mb-1">Laporkan di Aplikasi</h3>
                                <p className="text-xs text-text-secondary leading-relaxed">
                                    Buka halaman <b>Rincian Pesanan</b> Anda, lalu klik tombol <b>'Laporkan Masalah'</b> untuk mengunggah bukti foto tersebut.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-100 flex gap-3">
                        <span className="material-symbols-outlined text-primary text-xl mt-0.5">info</span>
                        <p className="text-xs text-text-main">
                            Laporan akan kami proses dalam waktu 1x24 jam setelah bukti diterima lengkap.
                        </p>
                    </div>
                </section>

                <section className="mt-4 pt-4 border-t border-dashed border-gray-200">
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

export default OrderIncompletePage
