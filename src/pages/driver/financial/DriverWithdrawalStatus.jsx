import { useNavigate } from 'react-router-dom'
import DriverBottomNavigation from '../../../components/driver/DriverBottomNavigation'

function DriverWithdrawalStatus() {
    const navigate = useNavigate()

    return (
        <div className="font-display bg-white text-slate-900 antialiased min-h-screen">
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl bg-white">
                <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
                    <div className="flex items-center px-4 justify-center h-[64px]">
                        <h2 className="text-slate-900 text-lg font-bold">Status Penarikan</h2>
                    </div>
                </header>

                <main className="flex-1 p-6 pb-24 flex flex-col items-center justify-center text-center gap-8">
                    <div className="relative w-32 h-32 flex items-center justify-center bg-blue-50 rounded-full mb-2">
                        <div className="absolute w-full h-full rounded-full border-4 border-blue-100 animate-pulse"></div>
                        <span className="material-symbols-outlined text-[#0d59f2] text-6xl">hourglass_top</span>
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-2xl font-extrabold text-slate-900">Penarikan Sedang Proses</h1>
                        <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
                            Permintaan penarikan <span className="text-slate-900 font-bold">Rp 50.000</span> Anda sedang diproses dan akan segera dikirim ke rekening tujuan.
                        </p>
                    </div>

                    <div className="w-full bg-white border border-slate-200 rounded-2xl p-5">
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 text-sm font-medium">ID Transaksi</span>
                                <span className="font-bold text-slate-900 text-sm font-mono">#WD-9921</span>
                            </div>
                            <div className="h-px bg-slate-100 w-full"></div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 text-sm font-medium">Tujuan</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-slate-400 text-[16px]">account_balance</span>
                                    <span className="font-bold text-slate-900 text-sm">Bank BCA</span>
                                </div>
                            </div>
                            <div className="h-px bg-slate-100 w-full"></div>
                            <div className="flex justify-between items-start text-left">
                                <span className="text-slate-500 text-sm font-medium pt-0.5">Estimasi Waktu</span>
                                <span className="font-bold text-emerald-600 text-sm text-right max-w-[150px]">Maksimal 1x24 Jam</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1"></div>

                    <div className="w-full space-y-4">
                        <button
                            onClick={() => navigate('/driver/dashboard')}
                            className="w-full bg-[#0d59f2] hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-base transition-all active:scale-[0.98]"
                        >
                            KEMBALI KE BERANDA
                        </button>
                        <p className="text-xs text-slate-400 font-medium px-4">
                            Status penarikan akan diperbarui otomatis di riwayat pendapatan.
                        </p>
                    </div>
                </main>

                <DriverBottomNavigation activeTab="earnings" />
            </div>
        </div>
    )
}

export default DriverWithdrawalStatus
