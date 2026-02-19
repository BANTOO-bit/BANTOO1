import { useNavigate } from 'react-router-dom'
import DriverBottomNavigation from '../../../components/driver/DriverBottomNavigation'
import { useOrder } from '../../../context/OrderContext'

function DriverOrderComplete() {
    const navigate = useNavigate()
    const { activeOrder, clearOrder } = useOrder()

    const isCOD = activeOrder?.paymentMethod === 'COD'
    const orderId = activeOrder?.id ? activeOrder.id.split('-')[2] : '00000'

    return (
        <div className="font-display bg-background-light text-slate-900 antialiased min-h-screen relative flex flex-col overflow-x-hidden max-w-md mx-auto bg-white border-x border-slate-100">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/driver/dashboard')} className="rounded-full p-2 hover:bg-slate-100 transition-colors text-slate-500">
                            <span className="material-symbols-outlined text-[24px]">close</span>
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 leading-none">Ringkasan Pesanan</h1>
                            <span className="text-xs font-semibold text-slate-500">Order ID #{orderId}</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center justify-center rounded-full size-10 bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors">
                            <span className="material-symbols-outlined text-[24px]">history</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col pb-bottom-nav bg-background-light px-5 pt-10">
                {/* Success Icon */}
                <div className="flex flex-col items-center justify-center mb-10 text-center">
                    <div className="bg-green-100 rounded-full p-4 mb-4 ring-4 ring-green-50">
                        <span className="material-symbols-outlined text-[64px] text-green-600">check_circle</span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Pesanan Selesai!</h1>
                    <p className="text-slate-500 text-sm">Terima kasih atas kerja keras Anda.</p>
                </div>

                {/* Earnings Card */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 mb-6 relative overflow-hidden">
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-green-500"></div>
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Pendapatan Anda</p>
                            <h2 className="text-3xl font-bold text-green-600">Rp 7.200</h2>
                        </div>
                        <div className="bg-green-50 p-3 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-green-600">account_balance_wallet</span>
                        </div>
                    </div>
                    <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rincian</p>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600 font-medium">Ongkir</span>
                            <span className="font-bold text-slate-900">Rp 8.000</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600 font-medium">Biaya Platform</span>
                            <span className="font-bold text-red-500">-Rp 800</span>
                        </div>
                    </div>
                </div>

                {/* Fee Info Card — Conditional based on payment type */}
                {isCOD ? (
                    /* COD: Red warning about depositing cash fee */
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 opacity-[0.05]">
                            <span className="material-symbols-outlined text-[150px] text-red-900">warning</span>
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="material-symbols-outlined text-red-600 fill-current">error</span>
                                <span className="text-xs font-bold bg-red-600 text-white px-2 py-0.5 rounded uppercase tracking-wide">Penting</span>
                            </div>
                            <p className="text-lg font-bold text-slate-800 leading-tight mb-1">
                                Simpan Potongan Ongkir COD
                            </p>
                            <div className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
                                <span className="text-xl font-bold text-slate-500 mr-0.5">Rp</span>800
                            </div>

                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-red-100 mb-3">
                                <div className="flex gap-3 items-start">
                                    <span className="material-symbols-outlined text-red-500 text-[20px] shrink-0 mt-0.5">info</span>
                                    <p className="text-xs font-medium text-slate-700 leading-relaxed">
                                        POTONGAN ONGKIR COD (Fee Admin) sebesar <span className="font-bold text-red-600">Rp 800</span> ini <span className="font-bold text-red-600">wajib disetorkan</span> ke Admin/Koordinator agar Anda bisa terus menerima order.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                                <div className="flex gap-2 items-start">
                                    <span className="material-symbols-outlined text-orange-600 text-[18px] shrink-0 mt-0.5">schedule</span>
                                    <div>
                                        <p className="text-xs font-bold text-orange-800 mb-1">Kapan & Ke Mana Setor?</p>
                                        <p className="text-[11px] text-slate-700 leading-relaxed">
                                            Setorkan ke <span className="font-bold text-orange-700">Admin/Koordinator terdekat</span> sebelum akhir hari atau saat saldo COD Anda mencapai batas maksimal.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Wallet/Non-tunai: Blue info about auto-deducted fee */
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 opacity-[0.05]">
                            <span className="material-symbols-outlined text-[150px] text-blue-900">info</span>
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="material-symbols-outlined text-blue-600 fill-current">info</span>
                                <span className="text-xs font-bold bg-blue-600 text-white px-2 py-0.5 rounded uppercase tracking-wide">Penting</span>
                            </div>
                            <p className="text-lg font-bold text-slate-800 leading-tight mb-1">
                                Fee Admin Otomatis Dipotong
                            </p>
                            <div className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
                                <span className="text-xl font-bold text-slate-500 mr-0.5">Rp</span>800
                            </div>
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-blue-100">
                                <div className="flex gap-3 items-start">
                                    <span className="material-symbols-outlined text-blue-500 text-[20px] shrink-0 mt-0.5">info</span>
                                    <p className="text-xs font-medium text-slate-700 leading-relaxed">
                                        Karena pembayaran non-tunai, Fee Admin Rp 800 telah dipotong otomatis dari pendapatan digital Anda. Tidak perlu setor tunai.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Bottom Action */}
            <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 p-4 max-w-md mx-auto bg-background-light border-t border-transparent">
                <button
                    onClick={() => {
                        clearOrder()
                        navigate('/driver/dashboard')
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 transition-colors text-white font-bold text-lg h-14 rounded-xl flex items-center justify-center gap-2"
                >
                    <span>KEMBALI KE BERANDA</span>
                </button>
            </div>

            <DriverBottomNavigation activeTab="orders" />
        </div>
    )
}

export default DriverOrderComplete

