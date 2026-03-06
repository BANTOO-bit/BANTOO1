import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import DriverBottomNavigation from '@/features/driver/components/DriverBottomNavigation'
import { walletService } from '@/services/walletService'

function DriverDepositPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const owedAmount = location.state?.amount || 0

    // Form state
    const [amount, setAmount] = useState(owedAmount > 0 ? owedAmount : '')
    const [paymentMethod, setPaymentMethod] = useState('transfer') // 'cash' or 'transfer'
    const [proofFile, setProofFile] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState(null)

    // Handle file selection
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            if (file.size > 2 * 1024 * 1024) {
                setError('Ukuran file maksimal 2MB')
                return
            }
            if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
                setError('Format file harus JPG atau PNG')
                return
            }
            setProofFile(file)
        }
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        setError(null)

        try {
            const submitAmount = parseInt(amount)
            if (!submitAmount || submitAmount < 1000) {
                throw new Error('Minimal setoran adalah Rp 1.000')
            }
            if (submitAmount > 10000000) {
                throw new Error('Maksimal setoran adalah Rp 10.000.000')
            }

            if (paymentMethod === 'transfer' && !proofFile) {
                throw new Error('Bukti transfer wajib diunggah')
            }

            // Attempt to submit to DB
            const result = await walletService.submitDeposit({
                amount: submitAmount,
                paymentMethod: paymentMethod,
                bankName: paymentMethod === 'transfer' ? 'BCA' : null, // Assuming first option for simplicity
                proofFile: proofFile
            })

            navigate('/driver/deposit/verification', { state: { deposit: result } })
        } catch (err) {
            if (import.meta.env.DEV) console.error('Failed to submit deposit:', err)
            setError(err.message || 'Gagal mengirim bukti setoran. Coba beberapa saat lagi.')
        } finally {
            setIsSubmitting(false)
        }
    }

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

                <main className="flex-1 p-4 pb-bottom-nav bg-background-light flex flex-col gap-6">
                    <div className="w-full bg-white rounded-2xl px-4 pt-4 border border-slate-100 flex flex-col items-center justify-center text-center relative overflow-hidden">
                        <div className="absolute top-0 w-full h-1 bg-red-500"></div>
                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Total Wajib Setor (Data Kalender)</p>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Rp {owedAmount.toLocaleString('id-ID')}</h1>

                        {/* Custom Input Field for paying logic */}
                        <div className="mt-4 w-full">
                            <label className="text-xs font-bold text-slate-500 mb-1 block text-left ml-1">Nominal yang disetor:</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold group-focus-within:text-red-500 transition-colors text-lg">Rp</span>
                                <input
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white ring-0 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 font-bold text-lg text-slate-900 transition-all outline-none"
                                    placeholder="0"
                                    type="number"
                                />
                            </div>
                        </div>
                        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-100">
                            <span className="material-symbols-outlined text-[16px] filled">warning</span>
                            <span className="text-[10px] font-bold">Harap segera lunasi</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <h3 className="text-slate-900 text-sm font-bold ml-1">Pilih Metode Setoran</h3>

                        {/* Cash Option */}
                        <label
                            className={`relative flex items-center p-4 bg-white rounded-xl cursor-pointer transition-all ${paymentMethod === 'cash'
                                ? 'border-2 border-[#0d59f2] ring-1 ring-[#0d59f2]/10'
                                : 'border border-slate-200 hover:bg-slate-50 group'
                                }`}
                        >
                            <input
                                className="w-5 h-5 text-[#0d59f2] border-slate-300 focus:ring-[#0d59f2]"
                                name="payment_method"
                                type="radio"
                                checked={paymentMethod === 'cash'}
                                onChange={() => setPaymentMethod('cash')}
                            />
                            <div className="ml-4 flex-1">
                                <span className="block text-sm font-bold text-slate-900">Setor Tunai ke Kantor</span>
                                <span className="block text-xs text-slate-500 mt-0.5">Datang langsung ke admin operasional</span>
                            </div>
                            <span className={`material-symbols-outlined ${paymentMethod === 'cash' ? 'text-[#0d59f2]' : 'text-slate-400 group-hover:text-[#0d59f2]'}`}>storefront</span>
                        </label>

                        {/* Transfer Option */}
                        <label
                            className={`relative flex items-center p-4 bg-white rounded-xl cursor-pointer transition-all ${paymentMethod === 'transfer'
                                ? 'border-2 border-[#0d59f2] ring-1 ring-[#0d59f2]/10'
                                : 'border border-slate-200 hover:bg-slate-50 group'
                                }`}
                        >
                            <input
                                className="w-5 h-5 text-[#0d59f2] border-slate-300 focus:ring-[#0d59f2]"
                                name="payment_method"
                                type="radio"
                                checked={paymentMethod === 'transfer'}
                                onChange={() => setPaymentMethod('transfer')}
                            />
                            <div className="ml-4 flex-1">
                                <span className="block text-sm font-bold text-slate-900">Transfer Bank</span>
                                <span className="block text-xs text-slate-500 mt-0.5">Verifikasi manual via upload bukti</span>
                            </div>
                            <span className={`material-symbols-outlined ${paymentMethod === 'transfer' ? 'text-[#0d59f2]' : 'text-slate-400 group-hover:text-[#0d59f2]'}`}>account_balance</span>
                        </label>
                    </div>

                    {/* Only show bank details and upload form if Transfer is selected */}
                    {paymentMethod === 'transfer' && (
                        <>
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
                                    <button onClick={() => navigator.clipboard.writeText('8271234567')} className="p-2 text-[#0d59f2] bg-[#0d59f2]/5 rounded-lg hover:bg-[#0d59f2]/10 active:scale-95 transition-all">
                                        <span className="material-symbols-outlined text-[20px]">content_copy</span>
                                    </button>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center group">
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Bank Mandiri</div>
                                        <div className="text-lg font-bold text-slate-800 tracking-wide font-mono">157 000 998 877</div>
                                        <div className="text-xs text-slate-500 font-medium mt-0.5">a.n PT Ojek Online Indonesia</div>
                                    </div>
                                    <button onClick={() => navigator.clipboard.writeText('157000998877')} className="p-2 text-[#0d59f2] bg-[#0d59f2]/5 rounded-lg hover:bg-[#0d59f2]/10 active:scale-95 transition-all">
                                        <span className="material-symbols-outlined text-[20px]">content_copy</span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <h3 className="text-slate-900 text-sm font-bold ml-1">Bukti Transfer</h3>
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-2xl cursor-pointer bg-white hover:bg-slate-50 hover:border-slate-400 transition-all group overflow-hidden relative">
                                    {proofFile ? (
                                        <div className="flex flex-col items-center justify-center w-full h-full p-4">
                                            <span className="material-symbols-outlined text-green-500 text-3xl mb-2">check_circle</span>
                                            <p className="text-sm font-bold text-slate-900 truncate w-full text-center px-4">{proofFile.name}</p>
                                            <p className="text-xs text-slate-500 mt-1">Tap untuk mengganti</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform text-slate-400 group-hover:text-[#0d59f2] group-hover:bg-[#0d59f2]/5">
                                                <span className="material-symbols-outlined text-[24px]">photo_camera</span>
                                            </div>
                                            <p className="mb-1 text-sm text-slate-500 font-medium group-hover:text-[#0d59f2]"><span className="font-bold">Unggah Bukti Transfer</span></p>
                                            <p className="text-xs text-slate-400">Format: JPG, PNG (Max 2MB)</p>
                                        </div>
                                    )}
                                    <input className="hidden" type="file" onChange={handleFileChange} accept="image/png, image/jpeg" />
                                </label>
                            </div>
                        </>
                    )}

                    <div className="mt-8">
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !amount || parseInt(amount) < 1000}
                            className={`w-full font-bold py-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 ${isSubmitting || !amount || parseInt(amount) < 1000 ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white active:scale-[0.98]'
                                }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-green-300 border-t-transparent rounded-full animate-spin"></span>
                                    MENGUNGGAH...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">check_circle</span>
                                    KONFIRMASI SETORAN
                                </>
                            )}
                        </button>
                    </div>
                </main>

                <DriverBottomNavigation activeTab="earnings" />
            </div>
        </div>
    )
}

export default DriverDepositPage
