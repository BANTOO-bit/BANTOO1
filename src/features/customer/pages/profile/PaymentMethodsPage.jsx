import { useNavigate } from 'react-router-dom'

function PaymentMethodsPage() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen flex flex-col bg-background-light">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 pt-12 pb-3 border-b border-border-color">
                <div className="relative flex items-center justify-center min-h-[40px]">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute left-0 flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 active:scale-95 transition-all"
                    >
                        <span className="material-symbols-outlined text-text-main">arrow_back</span>
                    </button>
                    <h1 className="text-text-main text-lg font-bold tracking-tight">Metode Pembayaran</h1>
                    <div className="w-10 h-10" />
                </div>
            </header>

            <main className="flex-1 px-4 py-5 space-y-5">

                {/* Active Payment Method */}
                <section>
                    <h2 className="text-sm font-bold text-text-main mb-3 px-1 flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                        Metode Aktif
                    </h2>

                    <div className="bg-white rounded-2xl border border-green-200 shadow-sm overflow-hidden">
                        <div className="p-4 flex items-start gap-3.5">
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-green-600 text-2xl">payments</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-text-main text-sm">Tunai (COD)</h3>
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">AKTIF</span>
                                </div>
                                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                                    Bayar langsung ke driver saat pesanan tiba. Pastikan menyiapkan uang pas untuk kenyamanan bersama.
                                </p>
                            </div>
                        </div>

                        {/* COD Info Tips */}
                        <div className="border-t border-green-100 bg-green-50/50 px-4 py-3">
                            <div className="flex flex-col gap-2">
                                {[
                                    { icon: 'check_circle', text: 'Tidak perlu rekening atau e-wallet' },
                                    { icon: 'check_circle', text: 'Bayar setelah barang diterima' },
                                    { icon: 'info', text: 'Siapkan uang pas untuk kemudahan transaksi' },
                                ].map((tip, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-green-600 text-sm">{tip.icon}</span>
                                        <span className="text-xs text-green-800">{tip.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Upcoming Methods */}
                <section>
                    <h2 className="text-sm font-bold text-text-main mb-3 px-1 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-text-secondary text-base">schedule</span>
                        Segera Hadir
                    </h2>

                    <div className="space-y-3">
                        {/* Bantoo Pay */}
                        <div className="bg-white rounded-2xl border border-border-color shadow-sm p-4 opacity-80">
                            <div className="flex items-start gap-3.5">
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-blue-500 text-2xl">account_balance_wallet</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-text-main text-sm">Bantoo! Pay</h3>
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-bold rounded-full">SEGERA</span>
                                    </div>
                                    <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                                        Dompet digital terintegrasi khusus Bantoo!. Top up sekali, bayar langsung tanpa ribet. Bebas biaya admin!
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* E-Wallet */}
                        <div className="bg-white rounded-2xl border border-border-color shadow-sm p-4 opacity-80">
                            <div className="flex items-start gap-3.5">
                                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-purple-500 text-2xl">smartphone</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-text-main text-sm">E-Wallet</h3>
                                        <span className="px-2 py-0.5 bg-purple-100 text-purple-600 text-[10px] font-bold rounded-full">SEGERA</span>
                                    </div>
                                    <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                                        Dukungan GoPay, OVO, Dana, dan ShopeePay untuk pembayaran lebih praktis.
                                    </p>
                                    <div className="flex items-center gap-2 mt-2.5">
                                        {['GoPay', 'OVO', 'Dana', 'SPay'].map((name, i) => (
                                            <span key={i} className="px-2 py-1 bg-gray-100 text-gray-500 text-[10px] font-semibold rounded-lg">
                                                {name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* QRIS */}
                        <div className="bg-white rounded-2xl border border-border-color shadow-sm p-4 opacity-80">
                            <div className="flex items-start gap-3.5">
                                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-orange-500 text-2xl">qr_code_2</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-text-main text-sm">QRIS</h3>
                                        <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-bold rounded-full">SEGERA</span>
                                    </div>
                                    <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                                        Scan QR code untuk bayar dari semua aplikasi bank dan e-wallet. Standar Bank Indonesia.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Notice */}
                <section>
                    <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-blue-500 text-xl mt-0.5">lightbulb</span>
                            <div>
                                <h3 className="font-bold text-blue-800 text-sm mb-1">Metode baru segera hadir!</h3>
                                <p className="text-xs text-blue-700 leading-relaxed">
                                    Kami sedang mengembangkan integrasi pembayaran digital. Untuk saat ini, gunakan metode COD yang sudah tersedia.
                                    Ikuti update kami untuk informasi terbaru!
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Help */}
                <section className="pb-4">
                    <button
                        onClick={() => navigate('/help/payment')}
                        className="w-full py-3.5 px-4 rounded-xl bg-white text-text-main font-semibold text-sm border border-border-color active:scale-[0.98] transition-transform flex items-center justify-center gap-2 hover:bg-gray-50"
                    >
                        <span className="material-symbols-outlined text-primary text-lg">help</span>
                        <span>Bantuan Pembayaran</span>
                    </button>
                </section>
            </main>
        </div>
    )
}

export default PaymentMethodsPage
