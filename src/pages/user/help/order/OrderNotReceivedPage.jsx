import { useNavigate } from 'react-router-dom'

function OrderNotReceivedPage() {
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
                <h1 className="text-text-main text-lg font-bold tracking-tight absolute left-1/2 transform -translate-x-1/2 w-max">Pesanan Belum Diterima</h1>
                <div className="w-10 h-10"></div>
            </header>

            <main className="flex flex-col gap-6 px-4 pt-4">
                <section>
                    <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex gap-3 items-start">
                        <span className="material-symbols-outlined text-orange-600 mt-0.5">warning</span>
                        <div>
                            <h3 className="text-sm font-bold text-orange-800 mb-1">Penting: Lapor dalam 1x24 Jam</h3>
                            <p className="text-xs leading-relaxed text-orange-700">
                                Jika status pesanan sudah selesai tapi barang belum diterima, mohon segera laporkan maksimal 1x24 jam setelah pesanan diselesaikan.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="flex flex-col gap-4">
                    <div className="p-5 bg-white rounded-2xl shadow-soft border border-border-color">
                        <h2 className="text-base font-bold text-text-main mb-3">Cek Sekitar Lokasi</h2>
                        <p className="text-sm text-text-secondary mb-4 leading-relaxed">
                            Terkadang driver menitipkan pesanan di tempat aman. Pastikan Anda sudah melakukan hal berikut:
                        </p>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold mt-0.5">1</span>
                                <span className="text-sm text-text-main">Pastikan titik lokasi pengantaran di aplikasi sudah sesuai.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold mt-0.5">2</span>
                                <span className="text-sm text-text-main">Tanyakan kepada orang rumah, tetangga, resepsionis, atau satpam.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold mt-0.5">3</span>
                                <span className="text-sm text-text-main">Cek apakah ada foto bukti pengantaran di halaman <span className="font-medium">Riwayat Pesanan</span>.</span>
                            </li>
                        </ul>
                    </div>
                    <div className="p-5 bg-white rounded-2xl shadow-soft border border-border-color">
                        <h2 className="text-base font-bold text-text-main mb-3">Hubungi Driver</h2>
                        <p className="text-sm text-text-secondary mb-4 leading-relaxed">
                            Jika pesanan baru saja diselesaikan, Anda masih bisa mencoba menghubungi driver melalui fitur Chat atau Telepon.
                        </p>
                        <button className="w-full py-3 rounded-xl border border-primary text-primary font-semibold text-sm hover:bg-orange-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-lg">chat</span>
                            <span>Chat Driver dari Riwayat</span>
                        </button>
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

export default OrderNotReceivedPage
