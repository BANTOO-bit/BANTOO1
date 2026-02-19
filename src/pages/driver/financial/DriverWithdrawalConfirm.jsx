import { useNavigate } from 'react-router-dom'
import DriverBottomNavigation from '../../../components/driver/DriverBottomNavigation'

function DriverWithdrawalConfirm() {
    const navigate = useNavigate()

    return (
        <div className="font-display bg-white text-slate-900 antialiased min-h-screen">
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl bg-white">
                <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
                    <div className="flex items-center px-4 justify-between h-[64px]">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 -ml-2 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded-full transition-colors active:scale-95"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <h2 className="text-slate-900 text-lg font-bold">Konfirmasi Penarikan</h2>
                        <div className="w-10"></div>
                    </div>
                </header>

                <main className="flex-1 px-4 pt-4 pb-bottom-nav flex flex-col gap-6">
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                        <div className="p-8 flex flex-col items-center border-b border-slate-100 bg-slate-50/50">
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Total Penarikan</p>
                            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Rp 50.000</h1>
                        </div>
                        <div className="p-5 space-y-4 bg-white">
                            <div className="flex justify-between items-start py-1">
                                <span className="text-slate-500 text-sm font-medium pt-1">Tujuan</span>
                                <div className="text-right">
                                    <div className="flex items-center justify-end gap-2 mb-0.5">
                                        <span className="material-symbols-outlined text-[#0d59f2] text-[18px]">account_balance</span>
                                        <p className="font-bold text-slate-900 text-sm">Bank BCA</p>
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium">Budi Santoso • ****0921</p>
                                </div>
                            </div>
                            <div className="h-px bg-slate-100 w-full"></div>
                            <div className="flex justify-between items-center py-1">
                                <span className="text-slate-500 text-sm font-medium">Biaya Admin</span>
                                <span className="font-bold text-emerald-600 text-sm">Gratis (Rp 0)</span>
                            </div>
                            <div className="h-px bg-slate-100 w-full"></div>
                            <div className="flex justify-between items-center py-1">
                                <span className="text-slate-900 font-bold text-sm">Diterima</span>
                                <span className="font-bold text-slate-900 text-lg">Rp 50.000</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl flex gap-3 border border-blue-100 items-start">
                        <span className="material-symbols-outlined text-[#0d59f2] text-xl mt-0.5 shrink-0">schedule</span>
                        <p className="text-sm text-slate-700 font-medium leading-relaxed">
                            Estimasi dana masuk: <span className="font-bold text-slate-900">Maksimal 1x24 jam (Hari Kerja)</span>
                        </p>
                    </div>

                    <div className="flex-1"></div>

                    <div className="flex flex-col gap-4 mt-2">
                        <div className="flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-slate-400 text-[18px]">lock</span>
                            <p className="text-xs text-slate-500 font-medium">Transaksi ini akan diproses secara aman oleh sistem</p>
                        </div>
                        <button
                            onClick={() => navigate('/driver/withdrawal/status')}
                            className="w-full bg-[#0d59f2] hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-base transition-all active:scale-[0.98]"
                        >
                            KONFIRMASI SEKARANG
                        </button>
                    </div>
                </main>

                <DriverBottomNavigation activeTab="earnings" />
            </div>
        </div>
    )
}

export default DriverWithdrawalConfirm
