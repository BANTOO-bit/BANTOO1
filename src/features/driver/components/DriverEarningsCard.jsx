import { useNavigate } from 'react-router-dom'
import { formatCurrency } from '@/utils/formatters'

/**
 * DriverEarningsCard — Stats cards showing COD fee and today's earnings.
 */
function DriverEarningsCard({ earnings }) {
    const navigate = useNavigate()

    return (
        <>
            {/* Stats Cards */}
            <div className="px-4 pb-2">
                <div className="grid grid-cols-2 gap-3">
                    {/* COD Fee Card */}
                    <div className={`flex flex-col gap-2 rounded-xl p-4 bg-white border-2 shadow-sm relative overflow-hidden group ${earnings.codFee === 0 ? 'border-green-500' : 'border-red-600'}`}>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`flex items-center justify-center size-8 rounded-full shrink-0 ${earnings.codFee === 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                <span className="material-symbols-outlined text-[20px]">payments</span>
                            </span>
                            <p className={`text-[10px] font-bold tracking-wider leading-tight ${earnings.codFee === 0 ? 'text-green-700' : 'text-red-700'}`}>POTONGAN ONGKIR COD (Fee Admin)</p>
                        </div>
                        <p className={`tracking-tight text-2xl font-black leading-tight ${earnings.codFee === 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {earnings.codFee === 0 ? 'Rp 0' : formatCurrency(earnings.codFee)}
                        </p>
                        <p className={`text-xs font-bold px-2 py-1 rounded w-fit mt-1 ${earnings.codFee === 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                            {earnings.codFee === 0 ? 'Tidak ada tagihan' : 'Wajib setor segera'}
                        </p>
                    </div>

                    {/* Earnings Card */}
                    <div
                        onClick={() => navigate('/driver/earnings')}
                        className="flex flex-col gap-2 rounded-xl p-4 bg-white border border-slate-200 shadow-sm relative overflow-hidden cursor-pointer hover:border-blue-300 transition-colors group"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <span className="flex items-center justify-center size-8 rounded-full bg-blue-100 text-blue-600 transition-transform group-hover:scale-110">
                                <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                            </span>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Pendapatan Driver</p>
                        </div>
                        <p className="text-slate-900 tracking-tight text-xl font-bold leading-tight">{formatCurrency(earnings.todayIncome)}</p>
                        <p className="text-xs text-slate-400 font-medium">Hari ini</p>
                    </div>
                </div>
            </div>

            {/* Orders Today */}
            <div className="px-4 pb-6">
                <div className="flex items-center justify-between rounded-lg bg-white border border-slate-200 px-4 py-3 shadow-sm">
                    <span className="text-sm font-medium text-slate-600">Order Selesai Hari Ini</span>
                    <span className="text-base font-bold text-slate-900">{earnings.completedOrders}</span>
                </div>
            </div>
        </>
    )
}

export default DriverEarningsCard
