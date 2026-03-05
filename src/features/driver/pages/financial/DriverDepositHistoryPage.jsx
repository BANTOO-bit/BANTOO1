import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import driverService from '@/services/driverService'
import DriverBottomNavigation from '@/features/driver/components/DriverBottomNavigation'

function DriverDepositHistoryPage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [codData, setCodData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            if (!user?.id) return
            try {
                // Single RPC call — all data comes from backend
                const data = await driverService.getCodAdminFeeBalance(user.id)
                setCodData(data)
            } catch (err) {
                console.error('Error fetching COD data:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [user?.id])

    const formatCurrency = (v) => `Rp ${(v || 0).toLocaleString('id-ID')}`
    const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    const formatTime = (d) => new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

    return (
        <div className="font-display bg-background-light min-h-screen antialiased">
            <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto shadow-2xl bg-white">
                {/* Header */}
                <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
                    <div className="flex items-center gap-3 p-4">
                        <button onClick={() => navigate(-1)} className="flex items-center justify-center size-10 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
                            <span className="material-symbols-outlined text-slate-700">arrow_back</span>
                        </button>
                        <h1 className="text-lg font-bold text-slate-900">Riwayat Fee COD</h1>
                    </div>
                </header>

                <main className="flex-1 pb-bottom-nav">
                    {loading ? (
                        <div className="p-4 space-y-3">
                            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />)}
                        </div>
                    ) : codData ? (
                        <>
                            {/* Balance Summary Card */}
                            <div className="p-4 pb-2">
                                <div className="rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-5 text-white">
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Sisa Fee COD</p>
                                    <p className="text-3xl font-black mb-3">{formatCurrency(codData.balance)}</p>
                                    <div className="flex gap-4 text-xs">
                                        <div>
                                            <span className="text-slate-400">Total fee</span>
                                            <p className="font-bold">{formatCurrency(codData.totalOwed)}</p>
                                        </div>
                                        <div>
                                            <span className="text-slate-400">Sudah setor</span>
                                            <p className="font-bold text-green-400">{formatCurrency(codData.depositsMade)}</p>
                                        </div>
                                        <div>
                                            <span className="text-slate-400">Batas</span>
                                            <p className="font-bold text-amber-400">{formatCurrency(codData.limit)}</p>
                                        </div>
                                    </div>
                                    {/* Progress */}
                                    <div className="mt-3 w-full h-1.5 rounded-full bg-white/20">
                                        <div className={`h-full rounded-full transition-all ${codData.isOverLimit ? 'bg-red-400' : 'bg-green-400'}`}
                                            style={{ width: `${Math.min(100, codData.percentage)}%` }} />
                                    </div>
                                    {/* Time info */}
                                    {codData.hoursElapsed > 0 && (
                                        <p className={`mt-2 text-xs flex items-center gap-1 ${codData.isOverTimeLimit ? 'text-red-300' : 'text-slate-400'}`}>
                                            <span className="material-symbols-outlined text-sm">schedule</span>
                                            {codData.hoursElapsed} jam sejak COD pertama (batas: {codData.timeLimitHours} jam)
                                        </p>
                                    )}
                                    {codData.balance > 0 && (
                                        <button
                                            onClick={() => navigate('/driver/deposit', { state: { amount: codData.balance } })}
                                            className="mt-4 w-full py-2.5 bg-white text-slate-900 rounded-lg text-sm font-bold hover:bg-slate-100 transition-colors"
                                        >
                                            Setor Sekarang
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Ledger Entries (from backend) */}
                            <div className="px-4 pt-2 pb-4">
                                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                                    Audit Log ({codData.ledger?.length || 0})
                                </h2>

                                {(!codData.ledger || codData.ledger.length === 0) ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">receipt_long</span>
                                        <p className="text-sm text-slate-400">Belum ada riwayat transaksi COD</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {codData.ledger.map((entry, idx) => {
                                            const isFee = entry.type === 'fee_accrued'
                                            return (
                                                <div key={entry.id || idx} className={`rounded-xl p-3.5 border ${isFee ? 'border-red-100 bg-red-50/50' : 'border-green-100 bg-green-50/50'}`}>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`flex items-center justify-center size-7 rounded-full ${isFee ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-500'}`}>
                                                                <span className="material-symbols-outlined text-base">
                                                                    {isFee ? 'arrow_upward' : 'arrow_downward'}
                                                                </span>
                                                            </span>
                                                            <div>
                                                                <p className={`text-sm font-bold ${isFee ? 'text-red-700' : 'text-green-700'}`}>
                                                                    {isFee ? '+' : '-'}{formatCurrency(entry.amount)}
                                                                </p>
                                                                <p className="text-[11px] text-slate-400">{entry.description}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs font-bold text-slate-600">
                                                                Sisa: {formatCurrency(entry.balance_after)}
                                                            </p>
                                                            <p className="text-[10px] text-slate-400">
                                                                {formatDate(entry.created_at)} {formatTime(entry.created_at)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">error</span>
                            <p className="text-sm text-slate-400">Gagal memuat data</p>
                        </div>
                    )}
                </main>

                <DriverBottomNavigation active="earnings" />
            </div>
        </div>
    )
}

export default DriverDepositHistoryPage
