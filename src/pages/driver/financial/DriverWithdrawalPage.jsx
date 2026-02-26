import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DriverBottomNavigation from '../../../components/driver/DriverBottomNavigation'
import { walletService } from '../../../services/walletService'
import { driverService } from '../../../services/driverService'

function DriverWithdrawalPage() {
    const navigate = useNavigate()
    const [amount, setAmount] = useState('')
    const [balance, setBalance] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [bankAccount, setBankAccount] = useState(null)

    useEffect(() => {
        loadBalance()
    }, [])

    const loadBalance = async () => {
        try {
            setIsLoading(true)
            const [currentBalance, bankData] = await Promise.all([
                walletService.getBalance(),
                driverService.getBankDetails()
            ])
            setBalance(currentBalance)
            if (bankData && bankData.bank_name) {
                setBankAccount({
                    bankName: bankData.bank_name,
                    accountName: bankData.bank_account_name || '-',
                    accountNumber: bankData.bank_account_number || '-'
                })
            }
        } catch (err) {
            console.error('Failed to load wallet balance:', err)
            setError('Gagal memuat saldo')
        } finally {
            setIsLoading(false)
        }
    }

    const handleQuickAmount = (val) => {
        // Only set if amount doesn't exceed balance
        if (val <= balance) {
            setAmount(String(val))
        }
    }

    const handleWithdraw = () => {
        const numAmount = parseInt(amount)
        if (!bankAccount) {
            setError('Tambahkan rekening bank terlebih dahulu')
            return
        }
        if (!numAmount || numAmount <= 0) {
            setError('Masukkan nominal penarikan yang valid')
            return
        }
        if (numAmount < 10000) {
            setError('Minimal penarikan adalah Rp 10.000')
            return
        }
        if (numAmount > 10000000) {
            setError('Maksimal penarikan adalah Rp 10.000.000')
            return
        }
        if (numAmount > balance) {
            setError('Saldo Anda tidak mencukupi')
            return
        }

        setError(null)
        // Pass amount to confirmation page
        navigate('/driver/withdrawal/confirm', { state: { amount: numAmount } })
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

                <main className="flex-1 px-4 pt-4 pb-bottom-nav flex flex-col gap-6">
                    <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-100 relative">
                        {isLoading ? (
                            <div className="animate-pulse">
                                <div className="h-4 bg-slate-200 rounded w-24 mx-auto mb-3"></div>
                                <div className="h-10 bg-slate-200 rounded w-40 mx-auto"></div>
                            </div>
                        ) : (
                            <>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Saldo Tersedia</p>
                                <h1 className="text-4xl font-extrabold text-[#0d59f2] tracking-tight">Rp {balance.toLocaleString('id-ID')}</h1>
                            </>
                        )}
                        {error && <div className="absolute top-2 right-2 flex items-center justify-center bg-red-100 text-red-500 rounded-full w-6 h-6"><span className="material-symbols-outlined text-[14px]">error</span></div>}
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
                                <p className="text-sm font-bold text-slate-900 truncate">{bankAccount?.bankName || 'Belum ada rekening'}</p>
                                <p className="text-xs font-medium text-slate-500 truncate">{bankAccount ? `${bankAccount.accountName} • ${bankAccount.accountNumber.slice(-4).padStart(bankAccount.accountNumber.length, '*')}` : 'Tambahkan rekening terlebih dahulu'}</p>
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
                            onClick={handleWithdraw}
                            disabled={isLoading || !amount || parseInt(amount) > balance}
                            className={`w-full font-bold py-4 rounded-xl text-base transition-all active:scale-[0.98] ${isLoading || !amount || parseInt(amount) > balance
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-[#0d59f2] hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30'
                                }`}
                        >
                            TARIK SALDO SEKARANG
                        </button>
                    </div>
                </main>

                <DriverBottomNavigation activeTab="earnings" />
            </div>
        </div >
    )
}

export default DriverWithdrawalPage
