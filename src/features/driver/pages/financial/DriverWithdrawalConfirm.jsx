import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import DriverBottomNavigation from '@/features/driver/components/DriverBottomNavigation'
import { walletService } from '@/services/walletService'
import { driverService } from '@/services/driverService'

function DriverWithdrawalConfirm() {
    const navigate = useNavigate()
    const location = useLocation()
    const amount = location.state?.amount || 0
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState(null)
    const [bankAccount, setBankAccount] = useState(null)

    useEffect(() => {
        async function loadBank() {
            try {
                const data = await driverService.getBankDetails()
                if (data && data.bank_name) {
                    setBankAccount({
                        bankName: data.bank_name,
                        accountName: data.bank_account_name || '-',
                        accountNumber: data.bank_account_number || '-'
                    })
                }
            } catch (err) {
                if (import.meta.env.DEV) console.error('Failed to load bank details:', err)
            }
        }
        loadBank()
    }, [])

    // Redirect back if no amount — use useEffect to avoid side-effects during render
    useEffect(() => {
        if (!amount) {
            navigate('/driver/withdrawal', { replace: true })
        }
    }, [amount, navigate])

    if (!amount) return null

    const handleConfirm = async () => {
        setIsSubmitting(true)
        setError(null)
        try {
            await walletService.requestWithdrawal({
                amount: amount,
                bankName: bankAccount?.bankName || 'Unknown',
                accountName: bankAccount?.accountName || 'Unknown',
                accountNumber: bankAccount?.accountNumber || 'Unknown'
            })
            navigate('/driver/withdrawal/status', { state: { amount } })
        } catch (err) {
            if (import.meta.env.DEV) console.error('Failed to request withdrawal:', err)
            setError(err.message || 'Gagal memproses penarikan. Silakan coba lagi.')
        } finally {
            setIsSubmitting(false)
        }
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
                        <h2 className="text-slate-900 text-lg font-bold">Konfirmasi Penarikan</h2>
                        <div className="w-10"></div>
                    </div>
                </header>

                <main className="flex-1 px-4 pt-4 pb-bottom-nav flex flex-col gap-6">
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                        <div className="p-8 flex flex-col items-center border-b border-slate-100 bg-slate-50/50 relative">
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Total Penarikan</p>
                            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Rp {amount.toLocaleString('id-ID')}</h1>
                            {error && (
                                <div className="absolute top-4 left-4 right-4 bg-red-100 text-red-600 text-xs text-center font-semibold p-2 rounded-lg border border-red-200">
                                    {error}
                                </div>
                            )}
                        </div>
                        <div className="p-5 space-y-4 bg-white">
                            <div className="flex justify-between items-start py-1">
                                <span className="text-slate-500 text-sm font-medium pt-1">Tujuan</span>
                                <div className="text-right">
                                    <div className="flex items-center justify-end gap-2 mb-0.5">
                                        <span className="material-symbols-outlined text-[#0d59f2] text-[18px]">account_balance</span>
                                        <p className="font-bold text-slate-900 text-sm">{bankAccount?.bankName || '-'}</p>
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium">{bankAccount ? `${bankAccount.accountName} • ${bankAccount.accountNumber.slice(-4).padStart(bankAccount.accountNumber.length, '*')}` : '-'}</p>
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
                                <span className="font-bold text-slate-900 text-lg">Rp {amount.toLocaleString('id-ID')}</span>
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
                            onClick={handleConfirm}
                            disabled={isSubmitting}
                            className={`w-full font-bold py-4 rounded-xl text-base transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${isSubmitting ? 'bg-slate-300 text-slate-500 cursor-wait' : 'bg-[#0d59f2] hover:bg-blue-700 text-white'
                                }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></span>
                                    MEMPROSES...
                                </>
                            ) : (
                                'KONFIRMASI SEKARANG'
                            )}
                        </button>
                    </div>
                </main>

                <DriverBottomNavigation activeTab="earnings" />
            </div>
        </div>
    )
}

export default DriverWithdrawalConfirm
