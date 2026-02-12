import { useState } from 'react'

import { useNavigate } from 'react-router-dom'

function VoucherIssuesPage() {
    const navigate = useNavigate()

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 relative min-h-screen flex flex-col overflow-x-hidden pb-[88px]">
            <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 pt-12 pb-2 flex items-center justify-between border-b border-transparent dark:border-gray-800 transition-colors">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-text-main dark:text-white">arrow_back</span>
                </button>
                <h1 className="text-text-main dark:text-white text-lg font-bold tracking-tight absolute left-1/2 transform -translate-x-1/2">Kendala Voucher</h1>
                <div className="w-10 h-10"></div>
            </header>

            <main className="flex flex-col gap-6 px-4 pt-4">
                <section>
                    <div className="bg-white dark:bg-card-dark rounded-2xl p-5 shadow-soft border border-border-color dark:border-gray-700">
                        <h2 className="text-xl font-bold text-text-main dark:text-white mb-4">Kenapa voucher tidak bisa dipakai?</h2>
                        <p className="text-sm text-text-secondary dark:text-gray-400 mb-6 leading-relaxed">
                            Jika kamu mengalami kendala saat menggunakan voucher, coba cek beberapa hal berikut ini:
                        </p>
                        <div className="space-y-6">
                            <div className="flex gap-4 items-start">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold mt-0.5">1</div>
                                <div>
                                    <h3 className="text-sm font-semibold text-text-main dark:text-white mb-1">Periksa batas minimum pembelian</h3>
                                    <p className="text-xs text-text-secondary dark:text-gray-400 leading-relaxed">Setiap voucher biasanya memiliki syarat minimal transaksi. Pastikan total belanjaanmu sudah mencukupi.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold mt-0.5">2</div>
                                <div>
                                    <h3 className="text-sm font-semibold text-text-main dark:text-white mb-1">Cek masa berlaku voucher</h3>
                                    <p className="text-xs text-text-secondary dark:text-gray-400 leading-relaxed">Pastikan voucher yang ingin digunakan belum kadaluwarsa dan masih dalam periode promo yang aktif.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold mt-0.5">3</div>
                                <div>
                                    <h3 className="text-sm font-semibold text-text-main dark:text-white mb-1">Pastikan merchant/menu termasuk dalam promo</h3>
                                    <p className="text-xs text-text-secondary dark:text-gray-400 leading-relaxed">Beberapa promo hanya berlaku untuk merchant atau kategori menu tertentu saja.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold mt-0.5">4</div>
                                <div>
                                    <h3 className="text-sm font-semibold text-text-main dark:text-white mb-1">Pastikan tidak menggabungkan dengan promo lain</h3>
                                    <p className="text-xs text-text-secondary dark:text-gray-400 leading-relaxed">Umumnya, satu transaksi hanya bisa menggunakan satu jenis promo atau voucher.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-800">
                    <h2 className="text-base font-bold text-text-main dark:text-white mb-4">Butuh Bantuan Lain?</h2>
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

export default VoucherIssuesPage
