import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import merchantService from '../../services/merchantService'
import { supabase } from '../../services/supabaseClient'
import MerchantBottomNavigation from '../../components/merchant/MerchantBottomNavigation'
import { handleError } from '../../utils/errorHandler'

function MerchantBalancePage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const toast = useToast()
    const [balanceData, setBalanceData] = useState({
        balance: 0,
        totalEarnings: 0,
        totalWithdrawals: 0,
        withdrawals: []
    })
    const [weeklyStats, setWeeklyStats] = useState({
        totalRevenue: 0,
        graphData: []
    })
    const [recentTransactions, setRecentTransactions] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            if (!user?.merchantId) return

            setIsLoading(true)
            try {
                // 1. Get Balance & Withdrawals
                const balance = await merchantService.getBalance(user.merchantId)
                setBalanceData(balance)

                // 2. Get Weekly Stats
                const now = new Date()
                const weekStart = new Date()
                weekStart.setDate(now.getDate() - 7)
                weekStart.setHours(0, 0, 0, 0)

                const stats = await merchantService.getSalesStats(user.merchantId, weekStart, now)
                setWeeklyStats(stats)

                // 3. Get Recent Orders for History
                const { data: orders, error } = await supabase
                    .from('orders')
                    .select('id, created_at, total_amount, status')
                    .eq('merchant_id', user.merchantId)
                    .eq('status', 'completed')
                    .order('created_at', { ascending: false })
                    .limit(5)

                if (error) throw error

                // Merge Withdrawals and Orders for History
                const history = [
                    ...balance.withdrawals.map(w => ({
                        id: `W-${w.id.substring(0, 6)}`, // specific ID for withdrawal
                        type: 'withdraw',
                        amount: w.amount,
                        created_at: w.created_at,
                        status: w.status
                    })),
                    ...(orders || []).map(o => ({
                        id: `Order #${o.id.substring(0, 6)}`,
                        type: 'order',
                        amount: o.total_amount, // Merchant view: display Total Amount or Subtotal? Let's use total for consistency with user view
                        created_at: o.created_at,
                        status: o.status
                    }))
                ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10)

                setRecentTransactions(history)

            } catch (error) {
                handleError(error, toast)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [user?.merchantId, toast])

    const handleWithdraw = () => {
        // Simple alert for now as requested 'connected to admin panel' implies backend readiness, 
        // but UI might not be fully requested.
        // Or navigate to a withdraw page if it existed.
        toast.info('Fitur Penarikan Dana akan segera tersedia')
    }

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 relative min-h-screen flex flex-col overflow-x-hidden pb-[88px]">
            <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 pt-12 pb-4 flex items-center justify-between border-b border-transparent dark:border-gray-800">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-text-main dark:text-white"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-lg font-bold text-text-main dark:text-white leading-tight">Saldo & Penghasilan</h1>
                <div className="w-8"></div>
            </header>

            <main className="flex flex-col gap-6 px-4 pt-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="text-xs text-gray-500 mt-4">Memuat data...</p>
                    </div>
                ) : (
                    <>
                        {/* Total Balance Card */}
                        <section>
                            <div className="bg-card-light dark:bg-card-dark p-6 rounded-2xl shadow-soft border border-border-color dark:border-gray-800">
                                <div className="flex flex-col items-center justify-center text-center">
                                    <p className="text-sm font-medium text-text-secondary dark:text-gray-400 mb-2">Total Saldo Aktif</p>
                                    <h2 className="text-3xl font-bold text-text-main dark:text-white mb-6">
                                        Rp {balanceData.balance.toLocaleString('id-ID')}
                                    </h2>
                                    <button
                                        onClick={handleWithdraw}
                                        className="w-full py-3.5 bg-primary hover:bg-primary-dark active:scale-[0.98] transition-all rounded-xl text-white font-semibold shadow-md shadow-orange-500/20 flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">payments</span>
                                        Tarik Dana
                                    </button>
                                </div>
                                <div className="mt-4 pt-4 border-t border-dashed border-border-color dark:border-gray-700 flex justify-between items-center text-xs">
                                    <span className="text-text-secondary dark:text-gray-400">Bank BCA •••• 8892</span>
                                    <button onClick={() => navigate('/merchant/balance/edit-bank')} className="text-primary font-medium">Ubah Rekening</button>
                                </div>
                            </div>
                        </section>

                        {/* Weekly Earnings Chart */}
                        <section>
                            <div className="flex items-center justify-between mb-3 px-1">
                                <h3 className="text-base font-bold text-text-main dark:text-white">Penghasilan Minggu Ini</h3>
                                <button className="text-xs font-medium text-primary flex items-center">
                                    Lihat Detail <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                                </button>
                            </div>
                            <div className="bg-card-light dark:bg-card-dark p-5 rounded-2xl shadow-soft border border-border-color dark:border-gray-800">
                                <div className="flex items-end justify-between h-36 gap-2 sm:gap-4 overflow-x-auto pb-2">
                                    {weeklyStats.graphData.length > 0 ? (
                                        weeklyStats.graphData.map((item, idx) => {
                                            const maxVal = Math.max(...weeklyStats.graphData.map(d => d.value))
                                            const height = maxVal > 0 ? (item.value / maxVal) * 100 : 0
                                            return (
                                                <div key={idx} className="flex flex-col items-center gap-2 min-w-[30px] flex-1 group cursor-pointer">
                                                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg relative h-28 overflow-hidden">
                                                        <div
                                                            className={`absolute bottom-0 w-full rounded-lg transition-all bg-primary/80 group-hover:bg-primary`}
                                                            style={{ height: `${height}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-[10px] font-medium text-text-secondary dark:text-gray-400 whitespace-nowrap">{item.name}</span>
                                                </div>
                                            )
                                        })
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                            Belum ada data
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-text-secondary dark:text-gray-400">Total Minggu Ini</p>
                                        <p className="text-lg font-bold text-text-main dark:text-white">
                                            Rp {weeklyStats.totalRevenue.toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md">
                                        <span className="material-symbols-outlined text-[16px]">trending_up</span>
                                        <span className="text-xs font-bold">Realtime</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Transaction History */}
                        <section>
                            <h3 className="text-base font-bold text-text-main dark:text-white mb-3 px-1">Riwayat Pendapatan</h3>
                            <div className="flex flex-col gap-3">
                                {recentTransactions.length > 0 ? (
                                    recentTransactions.map((item, index) => (
                                        <TransactionItem
                                            key={index}
                                            id={item.id}
                                            time={new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                            amount={`${item.type === 'withdraw' ? '-' : '+'} Rp ${item.amount.toLocaleString('id-ID')}`}
                                            type={item.type}
                                            status={item.status}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center py-6 text-gray-400 text-sm">
                                        Belum ada riwayat transaksi
                                    </div>
                                )}
                            </div>
                        </section>
                    </>
                )}
            </main>

            <MerchantBottomNavigation activeTab="profile" />
        </div>
    )
}

function TransactionItem({ id, time, amount, type, status }) {
    const isWithdraw = type === 'withdraw'
    return (
        <div className={`bg-card-light dark:bg-card-dark p-4 rounded-2xl shadow-soft border border-transparent hover:border-border-color dark:hover:border-gray-700 transition-all flex items-center justify-between ${isWithdraw ? 'opacity-80' : ''}`}>
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isWithdraw ? 'bg-gray-100 dark:bg-gray-800 text-gray-500' : 'bg-orange-50 dark:bg-orange-900/20 text-primary'}`}>
                    <span className="material-symbols-outlined text-[20px]">{isWithdraw ? 'arrow_outward' : 'receipt_long'}</span>
                </div>
                <div>
                    <p className="text-sm font-bold text-text-main dark:text-white">{isWithdraw ? 'Penarikan Dana' : `${id}`}</p>
                    <p className="text-xs text-text-secondary dark:text-gray-400">{time} • {status}</p>
                </div>
            </div>
            <span className={`text-sm font-bold ${isWithdraw ? 'text-text-main dark:text-white' : 'text-green-600 dark:text-green-400'}`}>{amount}</span>
        </div>
    )
}

export default MerchantBalancePage
