import { useState, useEffect } from 'react'
import { supabase } from '../../../services/supabaseClient'
import AdminLayout from '../../../components/admin/AdminLayout'

export default function AdminCODPage() {
    const [tab, setTab] = useState('summary') // 'summary' | 'deposits' | 'balances' | 'ledger'
    const [deposits, setDeposits] = useState([])
    const [balances, setBalances] = useState([])
    const [ledger, setLedger] = useState([])
    const [summary, setSummary] = useState(null)
    const [selectedDriver, setSelectedDriver] = useState(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(null)
    const [stats, setStats] = useState({ pending: 0, totalOwed: 0, totalDeposited: 0 })

    const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0)
    const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

    // Fetch pending deposits
    const fetchDeposits = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('deposits')
                .select('*, profiles:user_id(full_name, phone)')
                .order('created_at', { ascending: false })
                .limit(50)
            if (error) throw error
            setDeposits(data || [])
            setStats(prev => ({ ...prev, pending: (data || []).filter(d => d.status === 'pending').length }))
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    // Fetch driver balances via RPC
    const fetchBalances = async () => {
        setLoading(true)
        try {
            // Get all active/suspended drivers
            const { data: drivers, error } = await supabase
                .from('drivers')
                .select('user_id, status, profiles:user_id(full_name, phone)')
                .in('status', ['approved', 'active', 'suspended'])

            if (error) throw error

            // Get COD balance for each driver via RPC
            const results = []
            for (const driver of (drivers || [])) {
                try {
                    const { data: balance } = await supabase.rpc('get_cod_balance', { p_driver_id: driver.user_id })
                    if (balance && balance.balance > 0) {
                        results.push({
                            ...driver,
                            name: driver.profiles?.full_name || 'Driver',
                            phone: driver.profiles?.phone,
                            initials: (driver.profiles?.full_name || 'D').split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2),
                            cod: balance
                        })
                    }
                } catch { /* skip */ }
            }

            results.sort((a, b) => (b.cod?.balance || 0) - (a.cod?.balance || 0))
            setBalances(results)
            setStats(prev => ({
                ...prev,
                totalOwed: results.reduce((s, d) => s + (d.cod?.balance || 0), 0),
                totalDeposited: results.reduce((s, d) => s + (d.cod?.deposits_made || 0), 0)
            }))
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    // Fetch ledger for specific driver
    const fetchLedger = async (driverId) => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('cod_ledger')
                .select('*')
                .eq('driver_id', driverId)
                .order('created_at', { ascending: false })
                .limit(50)
            if (error) throw error
            setLedger(data || [])
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    // Fetch summary stats via RPC
    const fetchSummary = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase.rpc('get_cod_summary')
            if (error) throw error
            setSummary(data)
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    // Export to CSV
    const exportCSV = (data, filename) => {
        if (!data || data.length === 0) return
        const headers = Object.keys(data[0])
        const csvRows = [headers.join(',')]
        data.forEach(row => {
            csvRows.push(headers.map(h => {
                let val = row[h]
                if (val === null || val === undefined) val = ''
                if (typeof val === 'object') val = JSON.stringify(val)
                return '"' + String(val).replace(/"/g, '""') + '"'
            }).join(','))
        })
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
        link.click()
    }

    useEffect(() => {
        if (tab === 'summary') fetchSummary()
        else if (tab === 'deposits') fetchDeposits()
        else if (tab === 'balances') fetchBalances()
    }, [tab])

    // Approve/Reject deposit
    const handleDepositAction = async (depositId, action) => {
        setActionLoading(depositId)
        try {
            const { error } = await supabase
                .from('deposits')
                .update({
                    status: action,
                    reviewed_at: new Date().toISOString(), // Admin-only action, acceptable client timestamp
                    reviewed_by: (await supabase.auth.getUser()).data.user?.id || null,
                    admin_notes: action === 'rejected' ? 'Ditolak oleh admin' : null
                })
                .eq('id', depositId)

            if (error) throw error
            fetchDeposits()
        } catch (err) { console.error(err) }
        finally { setActionLoading(null) }
    }

    const viewDriverLedger = (driver) => {
        setSelectedDriver(driver)
        setTab('ledger')
        fetchLedger(driver.user_id || driver.id)
    }

    return (
        <AdminLayout title="COD Fee Management">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white dark:bg-[#1a2632] p-6 rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm flex flex-col justify-between h-36">
                    <div className="flex items-center justify-between">
                        <p className="text-[#617589] dark:text-[#94a3b8] text-sm font-medium">Deposit Menunggu</p>
                        <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 p-2 rounded-lg"><span className="material-symbols-outlined text-[24px]">hourglass_top</span></div>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-amber-600 tracking-tight">{stats.pending}</p>
                        <p className="text-xs text-[#617589] mt-1">Perlu verifikasi admin</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1a2632] p-6 rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm flex flex-col justify-between h-36">
                    <div className="flex items-center justify-between">
                        <p className="text-[#617589] dark:text-[#94a3b8] text-sm font-medium">Total Fee Belum Disetor</p>
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 p-2 rounded-lg"><span className="material-symbols-outlined text-[24px]">warning</span></div>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-red-600 tracking-tight">{formatCurrency(stats.totalOwed)}</p>
                        <p className="text-xs text-[#617589] mt-1">Dari semua driver</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1a2632] p-6 rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm flex flex-col justify-between h-36">
                    <div className="flex items-center justify-between">
                        <p className="text-[#617589] dark:text-[#94a3b8] text-sm font-medium">Total Sudah Disetor</p>
                        <div className="bg-green-50 dark:bg-green-900/20 text-green-600 p-2 rounded-lg"><span className="material-symbols-outlined text-[24px]">verified</span></div>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-green-600 tracking-tight">{formatCurrency(stats.totalDeposited)}</p>
                        <p className="text-xs text-[#617589] mt-1">Deposit yang disetujui</p>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm overflow-hidden">
                <div className="flex border-b border-[#e5e7eb] dark:border-[#2a3b4d]">
                    {[
                        { key: 'summary', label: 'Ringkasan', icon: 'dashboard' },
                        { key: 'deposits', label: 'Verifikasi Deposit', icon: 'fact_check' },
                        { key: 'balances', label: 'Saldo Driver', icon: 'account_balance_wallet' },
                        ...(tab === 'ledger' ? [{ key: 'ledger', label: `Ledger: ${selectedDriver?.name || 'Driver'}`, icon: 'receipt_long' }] : [])
                    ].map(t => (
                        <button key={t.key} onClick={() => { setTab(t.key); if (t.key !== 'ledger') setSelectedDriver(null) }}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${tab === t.key ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-[#617589] hover:text-[#111418] dark:hover:text-white'}`}>
                            <span className="material-symbols-outlined text-[18px]">{t.icon}</span>{t.label}
                            {t.key === 'deposits' && stats.pending > 0 && (
                                <span className="ml-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{stats.pending}</span>
                            )}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20"><div className="animate-spin size-8 border-4 border-blue-200 border-t-blue-600 rounded-full" /></div>
                ) : (
                    <>
                        {/* ===== SUMMARY TAB ===== */}
                        {tab === 'summary' && (
                            summary ? (
                                <div className="p-6 space-y-6">
                                    {/* Period cards */}
                                    {[
                                        { label: 'Hari Ini', data: summary.today, icon: 'today', color: 'blue' },
                                        { label: 'Minggu Ini', data: summary.week, icon: 'date_range', color: 'indigo' },
                                        { label: 'Bulan Ini', data: summary.month, icon: 'calendar_month', color: 'purple' }
                                    ].map(period => (
                                        <div key={period.label} className="border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl p-5">
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className={`material-symbols-outlined text-${period.color}-600`}>{period.icon}</span>
                                                <h4 className="text-sm font-bold text-[#111418] dark:text-white uppercase tracking-wider">{period.label}</h4>
                                                <span className="text-xs bg-[#f0f2f4] dark:bg-[#2a3b4d] text-[#617589] px-2 py-0.5 rounded-full">{period.data?.entries || 0} transaksi</span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <p className="text-xs text-[#617589] mb-1">Fee Terkumpul</p>
                                                    <p className="text-lg font-bold text-red-600">{formatCurrency(period.data?.fee_accrued)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-[#617589] mb-1">Setoran Masuk</p>
                                                    <p className="text-lg font-bold text-green-600">{formatCurrency(period.data?.deposits)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-[#617589] mb-1">Selisih</p>
                                                    <p className={`text-lg font-bold ${(period.data?.fee_accrued - period.data?.deposits) > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                                                        {formatCurrency((period.data?.fee_accrued || 0) - (period.data?.deposits || 0))}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {/* Driver counts */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="border border-green-200 dark:border-green-800 rounded-xl p-4 bg-green-50/50 dark:bg-green-900/10">
                                            <p className="text-xs text-[#617589] mb-1">Driver Aktif</p>
                                            <p className="text-2xl font-bold text-green-600">{summary.active_drivers || 0}</p>
                                        </div>
                                        <div className="border border-red-200 dark:border-red-800 rounded-xl p-4 bg-red-50/50 dark:bg-red-900/10">
                                            <p className="text-xs text-[#617589] mb-1">Driver Suspended</p>
                                            <p className="text-2xl font-bold text-red-600">{summary.suspended_drivers || 0}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-20 text-center text-[#617589]">Tidak ada data ringkasan</div>
                            )
                        )}

                        {/* ===== DEPOSITS TAB ===== */}
                        {tab === 'deposits' && (
                            deposits.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <span className="material-symbols-outlined text-5xl text-[#617589] mb-4">inbox</span>
                                    <h4 className="text-lg font-bold text-[#111418] dark:text-white mb-1">Tidak Ada Deposit</h4>
                                    <p className="text-[#617589] text-sm">Belum ada setoran yang masuk</p>
                                </div>
                            ) : (
                                <div>
                                    <div className="px-6 py-3 flex justify-end border-b border-[#e5e7eb] dark:border-[#2a3b4d]">
                                        <button onClick={() => exportCSV(deposits.map(d => ({
                                            driver: d.profiles?.full_name || 'N/A',
                                            jumlah: d.amount,
                                            metode: d.payment_method,
                                            status: d.status,
                                            tanggal: d.created_at
                                        })), 'deposits_cod')}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#617589] border border-[#e5e7eb] hover:bg-[#f9fafb] rounded-lg transition-colors">
                                            <span className="material-symbols-outlined text-[16px]">download</span>Export CSV
                                        </button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-[#f9fafb] dark:bg-[#1e2c3a] border-b border-[#e5e7eb] dark:border-[#2a3b4d]">
                                                    <th className="px-6 py-3 text-xs font-semibold text-[#617589] uppercase">Driver</th>
                                                    <th className="px-6 py-3 text-xs font-semibold text-[#617589] uppercase text-right">Jumlah</th>
                                                    <th className="px-6 py-3 text-xs font-semibold text-[#617589] uppercase text-center">Metode</th>
                                                    <th className="px-6 py-3 text-xs font-semibold text-[#617589] uppercase text-center">Status</th>
                                                    <th className="px-6 py-3 text-xs font-semibold text-[#617589] uppercase">Tanggal</th>
                                                    <th className="px-6 py-3 text-xs font-semibold text-[#617589] uppercase text-right">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#2a3b4d]">
                                                {deposits.map(dep => (
                                                    <tr key={dep.id} className="hover:bg-[#f9fafb] dark:hover:bg-[#202e3b] transition-colors">
                                                        <td className="px-6 py-4">
                                                            <p className="text-sm font-medium text-[#111418] dark:text-white">{dep.profiles?.full_name || 'Driver'}</p>
                                                            <p className="text-xs text-[#617589]">{dep.profiles?.phone || dep.user_id?.substring(0, 8)}</p>
                                                        </td>
                                                        <td className="px-6 py-4 text-right text-sm font-bold text-[#111418] dark:text-white">{formatCurrency(dep.amount)}</td>
                                                        <td className="px-6 py-4 text-center text-xs text-[#617589] capitalize">{dep.payment_method || 'transfer'}</td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border
                                                            ${dep.status === 'pending' ? 'bg-amber-100 text-amber-800 border-amber-200' : ''}
                                                            ${dep.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                                                            ${dep.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' : ''}
                                                        `}>{dep.status === 'pending' ? 'Menunggu' : dep.status === 'approved' ? 'Disetujui' : 'Ditolak'}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-xs text-[#617589]">{formatDate(dep.created_at)}</td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                {dep.proof_url && (
                                                                    <a href={dep.proof_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors" title="Lihat Bukti">
                                                                        <span className="material-symbols-outlined text-[20px]">image</span>
                                                                    </a>
                                                                )}
                                                                {dep.status === 'pending' && (
                                                                    <>
                                                                        <button onClick={() => handleDepositAction(dep.id, 'approved')} disabled={actionLoading === dep.id}
                                                                            className="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50">
                                                                            {actionLoading === dep.id ? '...' : 'Setujui'}
                                                                        </button>
                                                                        <button onClick={() => handleDepositAction(dep.id, 'rejected')} disabled={actionLoading === dep.id}
                                                                            className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50">
                                                                            Tolak
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )
                        )}

                        {/* ===== BALANCES TAB ===== */}
                        {tab === 'balances' && (
                            balances.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <span className="material-symbols-outlined text-5xl text-[#617589] mb-4">check_circle</span>
                                    <h4 className="text-lg font-bold text-[#111418] dark:text-white mb-1">Semua Lunas</h4>
                                    <p className="text-[#617589] text-sm">Tidak ada driver yang memiliki saldo COD</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-[#f9fafb] dark:bg-[#1e2c3a] border-b border-[#e5e7eb] dark:border-[#2a3b4d]">
                                                <th className="px-6 py-3 text-xs font-semibold text-[#617589] uppercase">Driver</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-[#617589] uppercase text-right">Saldo Fee</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-[#617589] uppercase text-center">Waktu</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-[#617589] uppercase text-center">Status</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-[#617589] uppercase text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#2a3b4d]">
                                            {balances.map(driver => (
                                                <tr key={driver.user_id} className={`transition-colors ${driver.cod?.is_over_limit ? 'bg-red-50/50 dark:bg-red-900/5' : 'hover:bg-[#f9fafb] dark:hover:bg-[#202e3b]'}`}>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 text-xs font-bold">{driver.initials}</div>
                                                            <div>
                                                                <p className="text-sm font-medium text-[#111418] dark:text-white">{driver.name}</p>
                                                                <p className="text-xs text-[#617589]">{driver.phone || driver.user_id?.substring(0, 8)}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <p className={`text-sm font-bold ${driver.cod?.is_over_limit ? 'text-red-600' : 'text-[#111418] dark:text-white'}`}>
                                                            {formatCurrency(driver.cod?.balance)}
                                                        </p>
                                                        <p className="text-[10px] text-[#617589]">{driver.cod?.percentage || 0}% dari batas</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <p className={`text-xs font-medium ${driver.cod?.is_over_time_limit ? 'text-red-600' : 'text-[#617589]'}`}>
                                                            {driver.cod?.hours_elapsed || 0} jam
                                                        </p>
                                                        <p className="text-[10px] text-[#617589]">Batas: {driver.cod?.time_limit_hours || 48}j</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border
                                                            ${driver.status === 'suspended' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-green-100 text-green-800 border-green-200'}
                                                        `}>{driver.status === 'suspended' ? 'Suspended' : 'Aktif'}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button onClick={() => viewDriverLedger({ user_id: driver.user_id, name: driver.name })}
                                                            className="px-3 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-lg transition-colors">
                                                            Lihat Ledger
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        )}

                        {/* ===== LEDGER TAB ===== */}
                        {tab === 'ledger' && (
                            <>
                                <div className="p-4 bg-[#f9fafb] dark:bg-[#1e2c3a] border-b border-[#e5e7eb] dark:border-[#2a3b4d] flex items-center justify-between">
                                    <button onClick={() => { setTab('balances'); setSelectedDriver(null) }}
                                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium">
                                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>Kembali
                                    </button>
                                    <p className="text-sm text-[#617589]">{ledger.length} entri</p>
                                </div>
                                {ledger.length === 0 ? (
                                    <div className="py-20 text-center text-[#617589]">Tidak ada data ledger</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-[#f9fafb] dark:bg-[#1e2c3a] border-b border-[#e5e7eb] dark:border-[#2a3b4d]">
                                                    <th className="px-6 py-3 text-xs font-semibold text-[#617589] uppercase">Tanggal</th>
                                                    <th className="px-6 py-3 text-xs font-semibold text-[#617589] uppercase">Tipe</th>
                                                    <th className="px-6 py-3 text-xs font-semibold text-[#617589] uppercase text-right">Jumlah</th>
                                                    <th className="px-6 py-3 text-xs font-semibold text-[#617589] uppercase text-right">Saldo</th>
                                                    <th className="px-6 py-3 text-xs font-semibold text-[#617589] uppercase">Keterangan</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#2a3b4d]">
                                                {ledger.map(entry => (
                                                    <tr key={entry.id} className="hover:bg-[#f9fafb] dark:hover:bg-[#202e3b]">
                                                        <td className="px-6 py-3 text-xs text-[#617589]">{formatDate(entry.created_at)}</td>
                                                        <td className="px-6 py-3">
                                                            <span className={`inline-flex items-center gap-1 text-xs font-medium ${entry.type === 'fee_accrued' ? 'text-red-600' : 'text-green-600'}`}>
                                                                <span className="material-symbols-outlined text-sm">{entry.type === 'fee_accrued' ? 'arrow_upward' : 'arrow_downward'}</span>
                                                                {entry.type === 'fee_accrued' ? 'Fee COD' : 'Setoran'}
                                                            </span>
                                                        </td>
                                                        <td className={`px-6 py-3 text-right text-sm font-bold ${entry.type === 'fee_accrued' ? 'text-red-600' : 'text-green-600'}`}>
                                                            {entry.type === 'fee_accrued' ? '+' : '-'}{formatCurrency(entry.amount)}
                                                        </td>
                                                        <td className="px-6 py-3 text-right text-sm font-medium text-[#111418] dark:text-white">{formatCurrency(entry.balance_after)}</td>
                                                        <td className="px-6 py-3 text-xs text-[#617589]">{entry.description || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </AdminLayout>
    )
}
