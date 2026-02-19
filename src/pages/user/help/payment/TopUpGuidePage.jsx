import { useState } from 'react'

import { useNavigate } from 'react-router-dom'

function TopUpGuidePage() {
    const navigate = useNavigate()

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 relative min-h-screen flex flex-col overflow-x-hidden pb-bottom-nav">
            <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 pt-12 pb-2 flex items-center justify-between border-b border-transparent dark:border-gray-800 transition-colors">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-text-main dark:text-white">arrow_back</span>
                </button>
                <h1 className="text-text-main dark:text-white text-lg font-bold tracking-tight absolute left-1/2 transform -translate-x-1/2">Cara Isi Saldo</h1>
                <div className="w-10 h-10"></div>
            </header>

            <main className="flex flex-col gap-6 px-4 pt-6">
                <article className="flex flex-col gap-4">
                    <p className="text-sm text-text-secondary dark:text-gray-400 mb-2">
                        Berikut adalah panduan lengkap cara mengisi saldo Bantoo Pay Anda melalui berbagai metode yang tersedia.
                    </p>
                    <div className="bg-white dark:bg-card-dark rounded-2xl p-5 border border-border-color dark:border-gray-700 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <span className="material-symbols-outlined">account_balance</span>
                            </div>
                            <h2 className="text-base font-bold text-text-main dark:text-white">Transfer Bank <span className="text-sm font-normal text-gray-400 dark:text-gray-500 ml-1">(Coming Soon)</span></h2>
                        </div>
                        <ol className="list-decimal list-outside ml-4 space-y-3 text-sm text-text-secondary dark:text-gray-300">
                            <li>Buka aplikasi Bantoo! dan masuk ke menu <strong>Isi Saldo</strong> di halaman utama.</li>
                            <li>Pilih opsi pembayaran <strong>Transfer Bank</strong> (Virtual Account).</li>
                            <li>Pilih bank tujuan Anda (BCA, Mandiri, BNI, atau BRI).</li>
                            <li>Salin <strong>Nomor Virtual Account</strong> yang muncul di layar.</li>
                            <li>Lakukan transfer melalui ATM, Mobile Banking, atau Internet Banking sesuai instruksi bank masing-masing.</li>
                            <li>Saldo akan masuk otomatis setelah pembayaran berhasil.</li>
                        </ol>
                    </div>
                    <div className="bg-white dark:bg-card-dark rounded-2xl p-5 border border-border-color dark:border-gray-700 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                <span className="material-symbols-outlined">storefront</span>
                            </div>
                            <h2 className="text-base font-bold text-text-main dark:text-white">Minimarket <span className="text-sm font-normal text-gray-400 dark:text-gray-500 ml-1">(Coming Soon)</span></h2>
                        </div>
                        <ol className="list-decimal list-outside ml-4 space-y-3 text-sm text-text-secondary dark:text-gray-300">
                            <li>Kunjungi gerai <strong>Indomaret</strong> atau <strong>Alfamart</strong> terdekat.</li>
                            <li>Informasikan kepada kasir bahwa Anda ingin melakukan <strong>Top Up Bantoo Pay</strong>.</li>
                            <li>Sebutkan <strong>Nomor Handphone</strong> yang terdaftar di aplikasi Bantoo!.</li>
                            <li>Pilih nominal top up yang tersedia (Min. Rp 50.000).</li>
                            <li>Bayar sesuai nominal di kasir dan simpan struk sebagai bukti pembayaran.</li>
                        </ol>
                    </div>
                    <div className="bg-white dark:bg-card-dark rounded-2xl p-5 border border-border-color dark:border-gray-700 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                <span className="material-symbols-outlined">support_agent</span>
                            </div>
                            <h2 className="text-base font-bold text-text-main dark:text-white">Bantuan Admin <span className="text-sm font-normal text-gray-400 dark:text-gray-500 ml-1">(Coming Soon)</span></h2>
                        </div>
                        <p className="text-sm text-text-secondary dark:text-gray-300 mb-3">Jika mengalami kendala pada metode otomatis, silakan hubungi admin kami:</p>
                        <ol className="list-decimal list-outside ml-4 space-y-3 text-sm text-text-secondary dark:text-gray-300">
                            <li>Klik tombol <strong>WhatsApp Support</strong> berwarna hijau di bagian bawah halaman ini.</li>
                            <li>Sampaikan kepada Admin bahwa Anda ingin melakukan pengisian saldo.</li>
                            <li>Ikuti instruksi pembayaran manual yang diberikan oleh Admin.</li>
                            <li>Kirimkan bukti transfer, dan saldo akan diproses dalam 1x24 jam.</li>
                        </ol>
                    </div>
                </article>

                <section className="mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-800">
                    <h2 className="text-base font-bold text-text-main dark:text-white mb-4 text-center">Butuh Bantuan Lain?</h2>
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

export default TopUpGuidePage
