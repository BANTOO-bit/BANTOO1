import { useNavigate } from 'react-router-dom'
import DriverBottomNavigation from '../../../components/driver/DriverBottomNavigation'

function DriverDepositPage() {
    const navigate = useNavigate()

    return (
        <div className="font-display bg-background-light text-slate-900 antialiased min-h-screen">
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl bg-white">
                <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
                    <div className="flex items-center px-4 h-[72px] gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full text-slate-700 hover:bg-slate-50 transition-colors active:scale-95"
                        >
                            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                        </button>
                        <h2 className="text-slate-900 text-lg font-bold leading-tight flex-1">Setor Ke Admin</h2>
                    </div>
                </header>

                <main className="flex-1 p-4 pb-32 bg-background-light flex flex-col gap-6">
                    <div className="w-full bg-white rounded-2xl p-6 border border-slate-100 flex flex-col items-center justify-center text-center relative overflow-hidden">
                        <div className="absolute top-0 w-full h-1 bg-red-500"></div>
                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Total Wajib Setor</p>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Rp 5.600</h1>
                        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-100">
                            <span className="material-symbols-outlined text-[16px] filled">warning</span>
                            <span className="text-[10px] font-bold">Harap segera lunasi</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <h3 className="text-slate-900 text-sm font-bold ml-1">Pilih Metode Setoran</h3>
                        <label className="relative flex items-center p-4 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-all group">
                            <input className="w-5 h-5 text-[#0d59f2] border-slate-300 focus:ring-[#0d59f2]" name="payment_method" type="radio" />
                            <div className="ml-4 flex-1">
                                <span className="block text-sm font-bold text-slate-900">Setor Tunai ke Kantor</span>
                                <span className="block text-xs text-slate-500 mt-0.5">Datang langsung ke admin operasional</span>
                            </div>
                            <span className="material-symbols-outlined text-slate-400 group-hover:text-[#0d59f2]">storefront</span>
                        </label>
                        <label className="relative flex items-center p-4 bg-white border-2 border-[#0d59f2] rounded-xl cursor-pointer ring-1 ring-[#0d59f2]/10 transition-all">
                            <input checked readOnly className="w-5 h-5 text-[#0d59f2] border-slate-300 focus:ring-[#0d59f2]" name="payment_method" type="radio" />
                            <div className="ml-4 flex-1">
                                <span className="block text-sm font-bold text-slate-900">Transfer Bank</span>
                                <span className="block text-xs text-slate-500 mt-0.5">Verifikasi manual via upload bukti</span>
                            </div>
                            <span className="material-symbols-outlined text-[#0d59f2]">account_balance</span>
                        </label>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-slate-500 text-sm">info</span>
                            <p className="text-xs text-slate-500 font-medium">Silakan transfer ke salah satu rekening berikut:</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center group">
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Bank BCA</div>
                                <div className="text-lg font-bold text-slate-800 tracking-wide font-mono">827 123 4567</div>
                                <div className="text-xs text-slate-500 font-medium mt-0.5">a.n PT Ojek Online Indonesia</div>
                            </div>
                            <button className="p-2 text-[#0d59f2] bg-[#0d59f2]/5 rounded-lg hover:bg-[#0d59f2]/10 active:scale-95 transition-all">
                                <span className="material-symbols-outlined text-[20px]">content_copy</span>
                            </button>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center group">
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Bank Mandiri</div>
                                <div className="text-lg font-bold text-slate-800 tracking-wide font-mono">157 000 998 877</div>
                                <div className="text-xs text-slate-500 font-medium mt-0.5">a.n PT Ojek Online Indonesia</div>
                            </div>
                            <button className="p-2 text-[#0d59f2] bg-[#0d59f2]/5 rounded-lg hover:bg-[#0d59f2]/10 active:scale-95 transition-all">
                                <span className="material-symbols-outlined text-[20px]">content_copy</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <h3 className="text-slate-900 text-sm font-bold ml-1">Bukti Transfer</h3>
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-2xl cursor-pointer bg-white hover:bg-slate-50 hover:border-slate-400 transition-all group">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform text-slate-400 group-hover:text-[#0d59f2] group-hover:bg-[#0d59f2]/5">
                                    <span className="material-symbols-outlined text-[24px]">photo_camera</span>
                                </div>
                                <p className="mb-1 text-sm text-slate-500 font-medium group-hover:text-[#0d59f2]"><span class="font-bold">Unggah Bukti Transfer</span></p>
                                <p className="text-xs text-slate-400">Format: JPG, PNG (Max 2MB)</p>
                            </div>
                            <input className="hidden" type="file" />
                        </label>
                    </div>

                    <div className="mt-8">
                        <button
                            onClick={() => navigate('/driver/deposit/verification')}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">check_circle</span>
                            KONFIRMASI SETORAN
                        </button>
                    </div>
                </main>

                <DriverBottomNavigation activeTab="earnings" />
            </div>
        </div>
    )
}

export default DriverDepositPage
