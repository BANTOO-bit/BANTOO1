import { useNavigate } from 'react-router-dom'
import DriverBottomNavigation from '../../../components/driver/DriverBottomNavigation'

function DriverDepositVerification() {
    const navigate = useNavigate()

    return (
        <div className="font-display bg-background-light text-slate-900 antialiased min-h-screen">
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-white border-x border-slate-100">
                <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
                    <div className="flex items-center px-4 h-[72px] gap-4">
                        <h2 className="text-slate-900 text-lg font-bold leading-tight flex-1 text-center">Status Verifikasi</h2>
                    </div>
                </header>

                <main className="flex-1 px-4 pt-4 pb-bottom-nav bg-background-light flex flex-col items-center pt-10">
                    <div className="relative w-28 h-28 bg-blue-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-blue-50/50">
                        <span className="material-symbols-outlined text-[#0d59f2] text-[48px] filled">hourglass_top</span>
                        <div className="absolute -right-2 -top-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center border-4 border-white">
                            <span className="material-symbols-outlined text-white text-[14px] font-bold">priority_high</span>
                        </div>
                    </div>

                    <div className="text-center mb-8 space-y-2">
                        <h1 className="text-2xl font-extrabold text-slate-900">Setoran Terkirim!</h1>
                        <p className="text-slate-500 text-sm leading-relaxed max-w-[280px] mx-auto">
                            Bukti setoran Anda telah berhasil dikirim dan sedang dalam proses verifikasi oleh Admin.
                        </p>
                    </div>

                    <div className="w-full bg-white rounded-2xl p-5 border border-slate-200 flex flex-col gap-4 mb-6">
                        <div className="flex justify-between items-center border-b border-slate-50 pb-3 border-dashed">
                            <span className="text-slate-500 text-sm font-medium">Jumlah Setoran</span>
                            <span className="text-slate-900 font-bold font-mono text-base">Rp 5.600</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-50 pb-3 border-dashed">
                            <span className="text-slate-500 text-sm font-medium">Metode</span>
                            <span className="text-slate-900 font-semibold text-sm">Transfer Bank</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500 text-sm font-medium">Status</span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                                <span className="text-[11px] font-bold uppercase tracking-wide">Menunggu Verifikasi</span>
                            </span>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex gap-3 w-full">
                        <span className="material-symbols-outlined text-slate-400 text-[20px] shrink-0">info</span>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            Akun Anda akan diperbarui setelah setoran disetujui. Estimasi 5-10 menit.
                        </p>
                    </div>

                    <div className="mt-8 w-full">
                        <button
                            onClick={() => navigate('/driver/dashboard')}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">home</span>
                            KEMBALI KE BERANDA
                        </button>
                    </div>
                </main>

                <DriverBottomNavigation activeTab="earnings" />
            </div>
        </div>
    )
}

export default DriverDepositVerification
