import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { driverService } from '../../../services/driverService'
import { useToast } from '../../../context/ToastContext'
import { handleError } from '../../../utils/errorHandler'
import PageLoader from '../../../components/shared/PageLoader'

function DriverBankPage() {
    const navigate = useNavigate()
    const toast = useToast()
    const [account, setAccount] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchBankDetails()
    }, [])

    const fetchBankDetails = async () => {
        try {
            const data = await driverService.getBankDetails()
            if (data && data.bank_name) {
                setAccount({
                    id: 1, // Single account for now
                    type: 'bank', // Defaulting to 'bank', logic could be improved to detect wallet
                    name: data.bank_name,
                    number: data.bank_account_number,
                    holder: data.bank_account_name,
                    icon: 'account_balance',
                    color: 'text-[#0d59f2]',
                    bgColor: 'bg-blue-50'
                })
            } else {
                setAccount(null)
            }
        } catch (error) {
            handleError(error, toast, { context: 'Load data rekening' })
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <PageLoader />

    return (
        <div className="font-display bg-background-light text-slate-900 antialiased min-h-screen">
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl bg-white">
                {/* Header */}
                <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
                    <div className="flex items-center px-4 h-[64px] gap-4">
                        <button
                            onClick={() => navigate('/driver/account')}
                            className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full text-slate-700 hover:bg-slate-50 transition-colors active:scale-95"
                        >
                            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                        </button>
                        <h2 className="text-slate-900 text-lg font-bold leading-tight flex-1">Rekening Bank & Wallet</h2>
                        <button
                            onClick={() => navigate('/driver/bank/edit')}
                            className="bg-slate-50 text-[#0d59f2] w-9 h-9 flex items-center justify-center rounded-full hover:bg-blue-50 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[22px]">{account ? 'edit' : 'add'}</span>
                        </button>
                    </div>
                </header>

                <main className="flex-1 p-4 pb-12 flex flex-col gap-4">
                    {account ? (
                        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3 shadow-sm">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-full ${account.bgColor} flex items-center justify-center ${account.color}`}>
                                        <span className="material-symbols-outlined text-[24px]">{account.icon}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{account.name}</h3>
                                        <p className="text-sm font-mono text-slate-600 tracking-wide">{account.number}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="h-px w-full bg-slate-100"></div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500">Pemilik Rekening</span>
                                <span className="font-bold text-slate-800 uppercase">{account.holder}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                            <span className="material-symbols-outlined text-[48px] mb-2 opacity-50">credit_card_off</span>
                            <p className="text-sm">Belum ada rekening tersimpan</p>
                        </div>
                    )}

                    <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                        <span className="material-symbols-outlined text-blue-600 shrink-0">info</span>
                        <div>
                            <p className="text-xs font-bold text-blue-800 mb-1">Informasi Penting</p>
                            <p className="text-[11px] text-blue-700 leading-relaxed">
                                Pastikan nama pemilik rekening sesuai dengan nama di KTP Anda untuk mempercepat proses penarikan saldo.
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default DriverBankPage
