import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DriverBottomNavigation from '../../../components/driver/DriverBottomNavigation'

function DriverWithdrawalPage() {
    const navigate = useNavigate()
    const [amount, setAmount] = useState('')

    const handleQuickAmount = (val) => {
        setAmount(val)
    }

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
                        <h2 className="text-slate-900 text-lg font-bold">Tarik Saldo</h2>
                        <div className="w-10"></div>
                    </div>
                </header>

                <main className="flex-1 p-5 pb-24 flex flex-col gap-6">
                    <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-100">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Saldo Tersedia</p>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Rp 50.400</h1>
                    </div>

                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-bold text-slate-700 ml-1">Jumlah Penarikan</label>
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold group-focus-within:text-primary transition-colors text-lg">Rp</span>
                            <input
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-xl border-slate-200 bg-white ring-0 focus:border-[#0d59f2] focus:ring-2 focus:ring-[#0d59f2]/20 font-bold text-xl text-slate-900 placeholder:text-slate-300 transition-all outline-none border"
                                placeholder="0"
                                type="number"
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-3 mt-1">
                            <button onClick={() => handleQuickAmount(10000)} className="py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-bold hover:border-[#0d59f2] hover:text-[#0d59f2] hover:bg-blue-50 transition-all active:scale-95 active:bg-blue-100">10rb</button>
                            <button onClick={() => handleQuickAmount(20000)} className="py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-bold hover:border-[#0d59f2] hover:text-[#0d59f2] hover:bg-blue-50 transition-all active:scale-95 active:bg-blue-100">20rb</button>
                            <button onClick={() => handleQuickAmount(50000)} className="py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-bold hover:border-[#0d59f2] hover:text-[#0d59f2] hover:bg-blue-50 transition-all active:scale-95 active:bg-blue-100">50rb</button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-bold text-slate-700 ml-1">Tujuan Penarikan</label>
                        <div
                            onClick={() => navigate('/driver/withdrawal/account')}
                            className="flex items-center p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors cursor-pointer group"
                        >
                            <div className="w-12 h-12 rounded-full bg-blue-600/10 flex items-center justify-center text-[#0d59f2] shrink-0 mr-4 group-hover:bg-[#0d59f2] group-hover:text-white transition-colors">
                                <span className="material-symbols-outlined">account_balance</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 truncate">Bank BCA</p>
                                <p className="text-xs font-medium text-slate-500 truncate">Budi Santoso • **** 0921</p>
                            </div>
                            <span className="material-symbols-outlined text-slate-300 group-hover:text-slate-400">chevron_right</span>
                        </div>
                    </div>

                    <div className="flex-1"></div>

                    <div className="flex flex-col gap-4 mt-2">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-slate-500 text-sm font-medium">Biaya Admin</span>
                            <span className="text-emerald-600 text-sm font-bold">Rp 0 (Gratis)</span>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl flex gap-3 border border-blue-100 items-start">
                            <span className="material-symbols-outlined text-[#0d59f2] text-xl mt-0.5 shrink-0">verified_user</span>
                            <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                Dana akan masuk ke rekening Anda dalam waktu maksimal <span className="font-bold text-slate-900">1x24 jam</span> setelah konfirmasi.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/driver/withdrawal/confirm')}
                            className="w-full bg-[#0d59f2] hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-base transition-all active:scale-[0.98]"
                        >
                            TARIK SALDO SEKARANG
                        </button>
                    </div>
                </main>

                <DriverBottomNavigation activeTab="earnings" />
            </div>
        </div>
    )
}

export default DriverWithdrawalPage
