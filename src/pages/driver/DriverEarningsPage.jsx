import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DriverBottomNavigation from '../../components/driver/DriverBottomNavigation'
import BackToTopButton from '../../components/shared/BackToTopButton'
import { supabase } from '../../services/supabaseClient'
import { useAuth } from '../../context/AuthContext'

function DriverEarningsPage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [showFilter, setShowFilter] = useState(false)
    const [allTransactions, setAllTransactions] = useState([])
    const [loadingData, setLoadingData] = useState(false)

    // Calendar State
    // Default to current month
    const [currentMonth, setCurrentMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
    const [startDate, setStartDate] = useState(null)
    const [endDate, setEndDate] = useState(null)

    // Applied Filter State (what actually filters the list)
    const [appliedStart, setAppliedStart] = useState(null)
    const [appliedEnd, setAppliedEnd] = useState(null)

    // Helper to format currency
    const formatCurrency = (value) => {
        return `Rp ${value.toLocaleString('id-ID')}`
    }

    // Fetch real driver orders from Supabase when filter is applied
    useEffect(() => {
        if (!appliedStart || !user?.id) return

        async function fetchDriverOrders() {
            setLoadingData(true)
            try {
                // Get driver record
                const { data: driver } = await supabase
                    .from('drivers')
                    .select('id')
                    .eq('user_id', user.id)
                    .single()

                if (!driver) {
                    setAllTransactions([])
                    return
                }

                const start = new Date(appliedStart)
                start.setHours(0, 0, 0, 0)
                const end = new Date(appliedEnd || appliedStart)
                end.setHours(23, 59, 59, 999)

                const { data: orders, error } = await supabase
                    .from('orders')
                    .select('id, total_amount, delivery_fee, service_fee, payment_method, status, created_at')
                    .eq('driver_id', user.id)
                    .in('status', ['delivered', 'completed'])
                    .gte('created_at', start.toISOString())
                    .lte('created_at', end.toISOString())
                    .order('created_at', { ascending: false })

                if (error) throw error

                const mapped = (orders || []).map(o => {
                    const createdAt = new Date(o.created_at)
                    const isCOD = o.payment_method === 'cod'
                    return {
                        id: o.id.substring(0, 8).toUpperCase(),
                        fullId: o.id,
                        time: createdAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                        date: createdAt.toISOString().split('T')[0],
                        status: 'LUNAS',
                        method: isCOD ? 'Tunai (COD)' : o.payment_method === 'wallet' ? 'Wallet' : 'Transfer',
                        icon_bg: 'bg-blue-50',
                        icon_color: 'text-blue-600',
                        icon: 'local_shipping',
                        method_icon: isCOD ? 'payments' : 'smartphone',
                        method_color: isCOD ? 'text-orange-600' : 'text-purple-700',
                        method_icon_color: isCOD ? 'text-orange-500' : 'text-purple-600',
                        total_cod: o.total_amount,
                        admin_fee: o.service_fee || Math.round(o.total_amount * 0.01),
                        delivery_fee: o.delivery_fee
                    }
                })

                setAllTransactions(mapped)
            } catch (err) {
                if (import.meta.env.DEV) console.error('Failed to fetch driver orders:', err)
            } finally {
                setLoadingData(false)
            }
        }

        fetchDriverOrders()
    }, [appliedStart, appliedEnd, user?.id])

    // Calendar Logic
    const getDaysInMonth = (date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        const firstDayOfMonth = new Date(year, month, 1).getDay() // 0 = Sunday

        // Array of days: null for padding, numbers for days
        const days = []
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(null)
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i))
        }
        return days
    }

    const handleDateClick = (date) => {
        if (!startDate || (startDate && endDate)) {
            setStartDate(date)
            setEndDate(null)
        } else {
            // Smart select: if clicked date is BEFORE start date, swap them
            if (date < startDate) {
                setEndDate(startDate)
                setStartDate(date)
            } else {
                setEndDate(date)
            }
        }
    }

    const isDateSelected = (date) => {
        if (!date) return false
        if (startDate && date.getTime() === startDate.getTime()) return true
        if (endDate && date.getTime() === endDate.getTime()) return true
        return false
    }

    const isDateInRange = (date) => {
        if (!date || !startDate || !endDate) return false
        return date > startDate && date < endDate
    }

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
    }

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
    }

    const handleApplyFilter = () => {
        setAppliedStart(startDate)
        setAppliedEnd(endDate || startDate) // If only start selected, end = start (single day)
        setShowFilter(false)
    }

    // Filter Logic â€” data is already filtered by Supabase query, use directly
    const filteredTransactions = allTransactions

    // Calculate totals
    const earnings = useMemo(() => {
        if (filteredTransactions.length === 0) {
            return { driver: 0, codFee: 0 }
        }
        const driverIncome = filteredTransactions.reduce((acc, curr) => acc + (curr.delivery_fee || 10000), 0)
        const codFee = filteredTransactions.reduce((acc, curr) => acc + curr.admin_fee, 0)
        return { driver: driverIncome, codFee: codFee }
    }, [filteredTransactions])

    const hasTransactions = filteredTransactions.length > 0

    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]

    const formatDateRange = (start, end) => {
        if (!start) return 'Pilih Tanggal'
        const startStr = `${start.getDate()} ${monthNames[start.getMonth()]}`
        const endStr = end ? `${end.getDate()} ${monthNames[end.getMonth()]}` : startStr

        const year = start.getFullYear()
        return `${startStr} - ${endStr} ${year}`
    }

    return (
        <div className="font-display bg-background-light text-slate-900 antialiased min-h-screen">
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl bg-white">
                {/* Header */}
                <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
                    <div className="flex items-center p-4 justify-between h-[72px]">
                        <h2 className="text-slate-900 text-xl font-bold leading-tight">Pendapatan</h2>
                        <button
                            onClick={() => setShowFilter(true)}
                            className="flex items-center gap-2 bg-white border border-[#0d59f2]/20 shadow-sm rounded-full pl-2 pr-2 py-1.5 transition-all active:scale-95 active:bg-slate-50 hover:border-[#0d59f2]/50 group ring-2 ring-[#0d59f2]/5 max-w-[190px]"
                        >
                            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#0d59f2] text-white shadow-sm shrink-0">
                                <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                            </div>
                            <div className="flex flex-col items-start mr-1 overflow-hidden">
                                <span className="text-[9px] text-slate-400 font-medium leading-tight">Filter</span>
                                <span className="text-[10px] font-bold text-slate-800 leading-tight truncate w-full">
                                    {appliedStart ? formatDateRange(appliedStart, appliedEnd) : 'Pilih Tanggal'}
                                </span>
                            </div>
                            <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-[#0d59f2] transition-colors shrink-0">expand_more</span>
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 p-4 pb-bottom-nav bg-background-light flex flex-col gap-4">
                    {/* Driver Earnings Card */}
                    <div className="w-full rounded-2xl bg-[#0d59f2] text-white p-5 shadow-lg shadow-[#0d59f2]/20 relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 opacity-10">
                            <span className="material-symbols-outlined text-[120px]">moped</span>
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="material-symbols-outlined text-sm">motorcycle</span>
                                <p className="text-white/80 text-[10px] font-bold uppercase tracking-wider">Pendapatan Driver</p>
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight mb-4">
                                {hasTransactions ? formatCurrency(earnings.driver) : 'Rp 0'}
                            </h1>
                            <button
                                onClick={() => navigate('/driver/withdrawal')}
                                className={`w-full bg-white text-[#0d59f2] font-bold py-2.5 rounded-xl text-sm transition-transform active:scale-95 shadow-sm hover:shadow-md flex items-center justify-center gap-2 ${!hasTransactions && 'bg-white/40 text-white cursor-not-allowed backdrop-blur-sm opacity-75'}`}
                                disabled={!hasTransactions}
                            >
                                <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                                Tarik Saldo
                            </button>
                        </div>
                    </div>

                    {/* COD Fee Card - ALWAYS RED */}
                    <div className="w-full rounded-2xl bg-red-500 text-white p-5 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 opacity-10">
                            <span className="material-symbols-outlined text-[120px]">payments</span>
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
                                <p className="text-white/80 text-[10px] font-bold uppercase tracking-wider">Potongan Ongkir COD (Fee Admin)</p>
                            </div>
                            <div className="flex flex-col mb-4">
                                <h1 className="text-3xl font-extrabold tracking-tight">
                                    {earnings.codFee === 0 ? 'Rp 0' : formatCurrency(earnings.codFee)}
                                </h1>
                                <p className="text-white/80 text-[10px] italic font-medium mt-0.5">(Bukan pendapatan)</p>
                            </div>
                            <button
                                onClick={() => navigate('/driver/deposit')}
                                className="w-full bg-white text-red-500 font-bold py-2.5 rounded-xl text-sm transition-transform active:scale-95 shadow-sm"
                            >
                                Setor Ke Admin
                            </button>
                        </div>
                    </div>

                    {/* Transaction History */}
                    <div className="flex-1 flex flex-col mt-2">
                        <div className="flex items-center justify-between mb-3 px-1">
                            <h3 className="text-slate-900 text-lg font-bold">Riwayat Transaksi</h3>
                            {hasTransactions && (
                                <a className="text-[#0d59f2] text-xs font-semibold hover:underline" href="#">Lihat Semua</a>
                            )}
                        </div>

                        {hasTransactions ? (
                            <div className="flex flex-col gap-3">
                                {filteredTransactions.map((trx, index) => (
                                    <div
                                        key={index}
                                        onClick={() => navigate(`/driver/earnings/transaction/${trx.id}`)}
                                        className="flex flex-col bg-white rounded-xl p-4 shadow-sm border border-slate-100 cursor-pointer hover:border-blue-200 transition-colors"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-start gap-3">
                                                <div className={`${trx.icon_bg} ${trx.icon_color} rounded-md p-1.5 mt-0.5`}>
                                                    <span className="material-symbols-outlined text-[18px]">{trx.icon}</span>
                                                </div>
                                                <div>
                                                    <h4 className="text-slate-900 text-sm font-bold">#{trx.id}</h4>
                                                    <p className="text-slate-400 text-[10px] font-medium">Selesai â€¢ {trx.time} WIB â€¢ {trx.date}</p>
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        <span className={`material-symbols-outlined text-[14px] ${trx.method_icon_color}`}>{trx.method_icon}</span>
                                                        <span className={`text-[10px] font-bold ${trx.method_color}`}>{trx.method}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="px-2 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-bold border border-green-100">{trx.status}</span>
                                        </div>
                                        <div className="h-px w-full bg-slate-100 my-2"></div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-500 font-medium">Total COD</span>
                                            <span className="text-slate-900 font-bold">{formatCurrency(trx.total_cod)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs mt-1">
                                            <span className="text-slate-500 font-medium">Fee Admin</span>
                                            <span className="text-red-500 font-bold">{formatCurrency(trx.admin_fee)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // EMPTY STATE UI
                            <div className="flex flex-col items-center justify-center py-12 px-6 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                                    <span className="material-symbols-outlined text-[32px] text-slate-300">receipt_long</span>
                                </div>
                                <h4 className="text-slate-800 font-bold text-sm mb-1">Belum ada transaksi</h4>
                                <p className="text-slate-400 text-xs leading-relaxed max-w-[240px]">
                                    {appliedStart ? 'Tidak ada transaksi pada periode yang dipilih.' : 'Silakan pilih rentang tanggal untuk melihat riwayat pendapatan Anda.'}
                                </p>
                            </div>
                        )}
                    </div>
                </main>

                {/* Bottom Navigation */}
                <DriverBottomNavigation activeTab="earnings" />

                {/* Calendar Popup Modal */}
                {showFilter && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" role="dialog">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowFilter(false)}></div>
                        <div className="relative w-full max-w-[340px] bg-white rounded-[24px] border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200 shadow-2xl">
                            <div className="px-5 pt-5 pb-2">
                                <h3 className="text-lg font-bold text-slate-900 text-center">Pilih Tanggal</h3>
                            </div>
                            <div className="flex items-center justify-between px-4 py-3">
                                <button
                                    onClick={handlePrevMonth}
                                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                                </button>
                                <span className="text-sm font-bold text-slate-800">
                                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                                </span>
                                <button
                                    onClick={handleNextMonth}
                                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                                </button>
                            </div>
                            <div className="px-4 pb-6">
                                <div className="grid grid-cols-7 text-center mb-2">
                                    {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
                                        <span key={day} className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{day}</span>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-y-1">
                                    {getDaysInMonth(currentMonth).map((date, i) => {
                                        if (!date) return <span key={`empty-${i}`} className="h-10"></span>

                                        const isSelected = isDateSelected(date)
                                        const inRange = isDateInRange(date)
                                        const isStart = startDate && date.getTime() === startDate.getTime()
                                        const isEnd = endDate && date.getTime() === endDate.getTime()

                                        // Visual tweaks for start/end ranges
                                        const isRangeStart = isStart && endDate
                                        const isRangeEnd = isEnd && startDate

                                        return (
                                            <div key={i} className={`h-10 flex items-center justify-center relative`}>
                                                {/* Range Highlights */}
                                                {inRange && (
                                                    <div className="absolute top-1 bottom-1 left-0 right-0 bg-[#0d59f2]/10"></div>
                                                )}
                                                {isRangeStart && (
                                                    <div className="absolute top-1 bottom-1 right-0 w-1/2 bg-[#0d59f2]/10"></div>
                                                )}
                                                {isRangeEnd && (
                                                    <div className="absolute top-1 bottom-1 left-0 w-1/2 bg-[#0d59f2]/10"></div>
                                                )}

                                                <button
                                                    onClick={() => handleDateClick(date)}
                                                    className={`relative z-10 w-9 h-9 flex items-center justify-center rounded-full text-sm font-semibold transition-all duration-200
                                                        ${isSelected
                                                            ? 'bg-[#0d59f2] text-white shadow-md scale-105'
                                                            : 'text-slate-700 hover:bg-slate-100'
                                                        }
                                                        ${inRange ? 'text-[#0d59f2] bg-transparent' : ''}
                                                    `}
                                                >
                                                    {date.getDate()}
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                            <div className="p-5 bg-slate-50 border-t border-slate-100 flex gap-3">
                                <button
                                    onClick={() => setShowFilter(false)}
                                    className="flex-1 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleApplyFilter}
                                    className="flex-1 py-3 text-sm font-bold text-white bg-[#0d59f2] rounded-xl hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                                    disabled={!startDate}
                                >
                                    Terapkan Filter
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <BackToTopButton />
        </div>
    )
}

export default DriverEarningsPage
