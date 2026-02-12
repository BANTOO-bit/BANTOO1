import { useNavigate } from 'react-router-dom'
import MerchantBottomNavigation from '../../components/merchant/MerchantBottomNavigation'

function MerchantBalancePage() {
    const navigate = useNavigate()

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
                {/* Total Balance Card */}
                <section>
                    <div className="bg-card-light dark:bg-card-dark p-6 rounded-2xl shadow-soft border border-border-color dark:border-gray-800">
                        <div className="flex flex-col items-center justify-center text-center">
                            <p className="text-sm font-medium text-text-secondary dark:text-gray-400 mb-2">Total Saldo Aktif</p>
                            <h2 className="text-3xl font-bold text-text-main dark:text-white mb-6">Rp 2.500.000</h2>
                            <button className="w-full py-3.5 bg-primary hover:bg-primary-dark active:scale-[0.98] transition-all rounded-xl text-white font-semibold shadow-md shadow-orange-500/20 flex items-center justify-center gap-2">
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

                {/* Weekly Earnings Chart (Mock) */}
                <section>
                    <div className="flex items-center justify-between mb-3 px-1">
                        <h3 className="text-base font-bold text-text-main dark:text-white">Penghasilan Minggu Ini</h3>
                        <button className="text-xs font-medium text-primary flex items-center">
                            Lihat Detail <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        </button>
                    </div>
                    <div className="bg-card-light dark:bg-card-dark p-5 rounded-2xl shadow-soft border border-border-color dark:border-gray-800">
                        <div className="flex items-end justify-between h-36 gap-2 sm:gap-4">
                            {[
                                { day: 'Sen', height: '40%' },
                                { day: 'Sel', height: '65%' },
                                { day: 'Rab', height: '30%' },
                                { day: 'Kam', height: '85%' },
                                { day: 'Jum', height: '50%', active: true },
                                { day: 'Sab', height: '0%' },
                                { day: 'Min', height: '0%' },
                            ].map((item, idx) => (
                                <div key={idx} className="flex flex-col items-center gap-2 flex-1 group cursor-pointer">
                                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg relative h-28 overflow-hidden">
                                        <div
                                            className={`absolute bottom-0 w-full rounded-lg transition-all ${item.active ? 'bg-primary shadow-sm shadow-orange-500/30' : 'bg-primary/40 group-hover:bg-primary bg-gray-200 dark:bg-gray-700'}`}
                                            style={{ height: item.height }}
                                        ></div>
                                    </div>
                                    <span className={`text-[10px] font-medium ${item.active ? 'text-primary font-bold' : 'text-text-secondary dark:text-gray-400'}`}>{item.day}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-text-secondary dark:text-gray-400">Total Minggu Ini</p>
                                <p className="text-lg font-bold text-text-main dark:text-white">Rp 3.850.000</p>
                            </div>
                            <div className="flex items-center gap-1 text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md">
                                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                                <span className="text-xs font-bold">+12%</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Transaction History */}
                <section>
                    <h3 className="text-base font-bold text-text-main dark:text-white mb-3 px-1">Riwayat Pendapatan</h3>
                    <div className="flex flex-col gap-3">
                        <TransactionItem
                            id="#ORD-2291" time="Hari ini, 14:20 • Selesai" amount="+ Rp 45.000"
                            type="order"
                        />
                        <TransactionItem
                            id="#ORD-2288" time="Hari ini, 13:45 • Selesai" amount="+ Rp 120.000"
                            type="order"
                        />
                        <TransactionItem
                            id="Penarikan Dana" time="Kemarin, 09:00 • Berhasil" amount="- Rp 1.000.000"
                            type="withdraw"
                        />
                        <TransactionItem
                            id="#ORD-2104" time="Kemarin, 20:30 • Selesai" amount="+ Rp 65.000"
                            type="order"
                        />
                    </div>
                    <button className="w-full text-center py-4 text-primary text-sm font-semibold hover:underline">
                        Lihat Semua Riwayat
                    </button>
                </section>
            </main>

            <MerchantBottomNavigation activeTab="profile" />
        </div>
    )
}

function TransactionItem({ id, time, amount, type }) {
    const isWithdraw = type === 'withdraw'
    return (
        <div className={`bg-card-light dark:bg-card-dark p-4 rounded-2xl shadow-soft border border-transparent hover:border-border-color dark:hover:border-gray-700 transition-all flex items-center justify-between ${isWithdraw ? 'opacity-80' : ''}`}>
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isWithdraw ? 'bg-gray-100 dark:bg-gray-800 text-gray-500' : 'bg-orange-50 dark:bg-orange-900/20 text-primary'}`}>
                    <span className="material-symbols-outlined text-[20px]">{isWithdraw ? 'arrow_outward' : 'receipt_long'}</span>
                </div>
                <div>
                    <p className="text-sm font-bold text-text-main dark:text-white">{isWithdraw ? 'Penarikan Dana' : `Pesanan ${id}`}</p>
                    <p className="text-xs text-text-secondary dark:text-gray-400">{time}</p>
                </div>
            </div>
            <span className={`text-sm font-bold ${isWithdraw ? 'text-text-main dark:text-white' : 'text-green-600 dark:text-green-400'}`}>{amount}</span>
        </div>
    )
}

export default MerchantBalancePage
