import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useNotification } from '@/context/NotificationsContext'
import { useToast } from '@/context/ToastContext'
import { handleError, handleSuccess } from '@/utils/errorHandler'
import merchantService from '@/services/merchantService'
import PageLoader from '@/features/shared/components/PageLoader'

function MerchantWalletPage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const toast = useToast()
    const { addNotification } = useNotification()

    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [walletData, setWalletData] = useState({
        balance: 0,
        totalEarnings: 0,
        totalWithdrawals: 0,
        withdrawals: [],
        bankName: null,
        accountNumber: null,
        accountName: null
    })

    const [showWithdrawModal, setShowWithdrawModal] = useState(false)
    const [withdrawAmount, setWithdrawAmount] = useState('')

    const fetchWalletData = async () => {
        if (!user?.merchantId) return
        try {
            setIsLoading(true)
            const data = await merchantService.getBalance(user.merchantId)
            setWalletData({
                balance: data.balance || 0,
                totalEarnings: data.totalEarnings || 0,
                totalWithdrawals: data.totalWithdrawals || 0,
                withdrawals: data.withdrawals || [],
                bankName: data.bankName || '',
                accountNumber: data.accountNumber || '',
                accountName: data.accountName || ''
            })
        } catch (err) {
            handleError(err, toast, { context: 'Fetch Wallet' })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchWalletData()
    }, [user?.merchantId])

    const handleWithdraw = async (e) => {
        e.preventDefault()
        const amount = parseInt(withdrawAmount.replace(/\D/g, ''), 10)

        if (!amount || amount < 10000) {
            handleError(new Error('Minimal penarikan adalah Rp 10.000'), toast)
            return
        }

        if (amount > walletData.balance) {
            handleError(new Error('Saldo tidak mencukupi'), toast)
            return
        }

        if (!walletData.bankName || !walletData.accountNumber) {
            handleError(new Error('Data rekening bank belum lengkap. Silakan lengkapi di pengaturan profil.'), toast)
            return
        }

        try {
            setIsSubmitting(true)
            await merchantService.requestWithdrawal(amount, {
                bankName: walletData.bankName,
                accountNumber: walletData.accountNumber,
                accountName: walletData.accountName
            })

            handleSuccess('Permintaan penarikan dana berhasil dikirim', toast)
            addNotification({
                type: 'success',
                message: `Permintaan penarikan dana Rp ${amount.toLocaleString('id-ID')} sedang diproses.`,
                duration: 5000
            })

            setShowWithdrawModal(false)
            setWithdrawAmount('')
            fetchWalletData() // Refresh data
        } catch (err) {
            handleError(err, toast, { context: 'Withdraw' })
        } finally {
            setIsSubmitting(false)
        }
    }

    const formatRupiah = (value) => {
        if (!value) return ''
        const numberString = value.replace(/[^,\d]/g, '').toString()
        const split = numberString.split(',')
        const sisa = split[0].length % 3
        let rupiah = split[0].substr(0, sisa)
        const ribuan = split[0].substr(sisa).match(/\d{3}/gi)

        if (ribuan) {
            const separator = sisa ? '.' : ''
            rupiah += separator + ribuan.join('.')
        }

        rupiah = split[1] !== undefined ? rupiah + ',' + split[1] : rupiah
        return rupiah
    }

    if (isLoading) return <PageLoader />

    const hasBankData = walletData.bankName && walletData.accountNumber

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 relative min-h-screen flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 pt-12 pb-4 flex items-center border-b border-border-color dark:border-gray-800">
                <button
                    onClick={() => navigate('/merchant/profile')}
                    className="absolute left-4 p-2 -ml-2 text-text-main dark:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-lg font-bold text-text-main dark:text-white leading-tight w-full text-center">
                    Saldo & Penarikan
                </h1>
            </header>

            <main className="flex-1 overflow-y-auto px-4 pt-6 pb-20">
                {/* Balance Card */}
                <div className="bg-primary rounded-3xl p-6 shadow-soft text-white mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full"></div>
                    <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-black/10 rounded-full"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 opacity-90">
                            <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                            <span className="text-sm font-medium">Saldo Tersedia</span>
                        </div>
                        <h2 className="text-3xl font-black mb-6 tracking-tight">
                            Rp {walletData.balance.toLocaleString('id-ID')}
                        </h2>

                        <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-4">
                            <div>
                                <p className="text-[10px] opacity-80 uppercase tracking-wider font-semibold">Total Pendapatan</p>
                                <p className="text-sm font-bold mt-0.5">Rp {walletData.totalEarnings.toLocaleString('id-ID')}</p>
                            </div>
                            <div>
                                <p className="text-[10px] opacity-80 uppercase tracking-wider font-semibold">Total Ditarik</p>
                                <p className="text-sm font-bold mt-0.5 text-white/90">Rp {walletData.totalWithdrawals.toLocaleString('id-ID')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bank Information */}
                <div className="bg-card-light dark:bg-card-dark rounded-2xl shadow-soft border border-border-color dark:border-gray-800 p-4 mb-6">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-bold text-text-main dark:text-white">Rekening Pencairan</h3>
                        <button
                            onClick={() => navigate('/merchant/settings/bank')}
                            className="text-[11px] font-bold text-primary flex items-center gap-0.5"
                        >
                            <span>Edit</span>
                            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                        </button>
                    </div>

                    {hasBankData ? (
                        <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                            <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-700">
                                <span className="material-symbols-outlined text-primary">account_balance</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold text-text-main dark:text-white">{walletData.bankName}</p>
                                <p className="text-sm font-mono text-text-secondary mt-0.5 tracking-wider">{walletData.accountNumber}</p>
                                <p className="text-[10px] text-text-secondary mt-0.5 uppercase">{walletData.accountName}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 bg-orange-50 dark:bg-orange-900/10 p-3 rounded-xl border border-orange-100 dark:border-orange-900/30">
                            <span className="material-symbols-outlined text-orange-500">warning</span>
                            <p className="text-[11px] text-orange-700 dark:text-orange-400 font-medium leading-relaxed">
                                Anda belum mengatur rekening pencairan. Silakan lengkapi data rekening terlebih dahulu.
                            </p>
                        </div>
                    )}
                </div>

                {/* Withdraw Button */}
                <button
                    onClick={() => setShowWithdrawModal(true)}
                    disabled={walletData.balance < 10000 || !hasBankData}
                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 mb-8 ${walletData.balance < 10000 || !hasBankData
                            ? 'bg-gray-200 dark:bg-gray-800 text-gray-500 cursor-not-allowed'
                            : 'bg-primary text-white hover:bg-primary-dark shadow-md shadow-primary/20'
                        }`}
                >
                    <span className="material-symbols-outlined text-[20px]">payments</span>
                    <span>Tarik Saldo</span>
                </button>

                {/* History */}
                <div>
                    <h3 className="text-sm font-bold text-text-main dark:text-white mb-4 pl-1">Riwayat Penarikan</h3>

                    {walletData.withdrawals.length === 0 ? (
                        <div className="text-center py-10">
                            <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-700 mb-2">history</span>
                            <p className="text-sm text-text-secondary">Belum ada riwayat penarikan</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {walletData.withdrawals.map((w, i) => (
                                <div key={i} className="bg-card-light dark:bg-card-dark p-4 rounded-2xl shadow-sm border border-border-color dark:border-gray-800 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${w.status === 'completed' || w.status === 'approved' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                                                w.status === 'rejected' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                                                    'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
                                            }`}>
                                            <span className="material-symbols-outlined text-[20px]">
                                                {w.status === 'completed' || w.status === 'approved' ? 'check_circle' :
                                                    w.status === 'rejected' ? 'cancel' : 'pending_actions'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-text-main dark:text-white capitalize">Penarikan Ke {w.bank_name}</p>
                                            <p className="text-[10px] text-text-secondary mt-0.5">
                                                {new Date(w.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className={`text-sm font-bold ${w.status === 'rejected' ? 'text-text-secondary line-through' : 'text-text-main dark:text-white'}`}>
                                            Rp {w.amount?.toLocaleString('id-ID')}
                                        </span>
                                        <span className={`text-[9px] font-bold uppercase tracking-wider mt-1 px-1.5 py-0.5 rounded ${w.status === 'completed' || w.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' :
                                                w.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' :
                                                    'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'
                                            }`}>
                                            {w.status === 'completed' ? 'Berhasil' : w.status === 'approved' ? 'Disetujui' : w.status === 'rejected' ? 'Ditolak' : 'Diproses'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Withdraw Modal */}
            {showWithdrawModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => !isSubmitting && setShowWithdrawModal(false)}
                    ></div>
                    <div className="relative bg-white dark:bg-card-dark w-full max-w-sm rounded-[24px] p-6 shadow-2xl animate-scale-up">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-3">
                                <span className="material-symbols-outlined text-[24px]">payments</span>
                            </div>
                            <h2 className="text-lg font-bold text-text-main dark:text-white">Tarik Saldo</h2>
                            <p className="text-sm text-text-secondary mt-1">Saldo tersedia: Rp {walletData.balance.toLocaleString('id-ID')}</p>
                        </div>

                        <form onSubmit={handleWithdraw} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-bold text-text-secondary mb-1.5">Nominal Penarikan</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-main dark:text-white font-bold">Rp</span>
                                    <input
                                        type="text"
                                        value={formatRupiah(withdrawAmount)}
                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                        placeholder="0"
                                        className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent text-lg font-bold text-text-main dark:text-white transition-all outline-none"
                                        autoFocus
                                    />
                                </div>
                                <div className="flex justify-between mt-2">
                                    <span className="text-[10px] text-text-secondary">Min. Rp 10.000</span>
                                    <button
                                        type="button"
                                        onClick={() => setWithdrawAmount(walletData.balance.toString())}
                                        className="text-[10px] font-bold text-primary"
                                    >
                                        Tarik Semua
                                    </button>
                                </div>
                            </div>

                            <div className="mt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowWithdrawModal(false)}
                                    disabled={isSubmitting}
                                    className="flex-1 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 text-text-secondary font-bold text-sm active:bg-gray-50 dark:active:bg-gray-800 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !withdrawAmount}
                                    className={`flex-1 py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-transform ${isSubmitting || !withdrawAmount ? 'bg-primary/70 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark active:scale-95'
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <span className="material-symbols-outlined animate-spin text-[18px]">refresh</span>
                                    ) : (
                                        'Konfirmasi'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MerchantWalletPage
