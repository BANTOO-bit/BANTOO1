import { useState, useEffect } from 'react'
import { supabase } from '../../../services/supabaseClient'
import AdminLayout from '../../../components/admin/AdminLayout'

export default function AdminCODPage() {
    const [showReminderModal, setShowReminderModal] = useState(false)
    const [selectedDriver, setSelectedDriver] = useState(null)
    const [codList, setCodList] = useState([])
    const [loading, setLoading] = useState(true)
    const [totals, setTotals] = useState({ fee: 0, deposited: 0, remaining: 0, orderCount: 0 })

    const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)

    const fetchCodData = async () => {
        try {
            const today = new Date(); today.setHours(0, 0, 0, 0)

            // Fetch today's COD orders grouped by driver
            const { data: orders, error } = await supabase
                .from('orders')
                .select('driver_id, service_fee, payment_status, status, drivers!orders_driver_id_fkey(id, profiles!drivers_user_id_fkey(full_name))')
                .eq('payment_method', 'cod')
                .gte('created_at', today.toISOString())
                .not('driver_id', 'is', null)

            if (error) { console.error(error); setLoading(false); return }

            // Aggregate by driver
            const driverMap = {}
                ; (orders || []).forEach(o => {
                    const dId = o.driver_id
                    if (!driverMap[dId]) {
                        const name = o.drivers?.profiles?.full_name || 'Driver'
                        const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2)
                        driverMap[dId] = { id: dId, name, initials, codFee: 0, deposited: 0, remaining: 0 }
                    }
                    const fee = o.service_fee || 0
                    driverMap[dId].codFee += fee
                    if (o.payment_status === 'paid' && ['delivered', 'completed'].includes(o.status)) {
                        driverMap[dId].deposited += fee
                    }
                })

            const list = Object.values(driverMap).map(d => {
                d.remaining = d.codFee - d.deposited
                if (d.remaining <= 0) d.status = 'Lunas'
                else if (d.deposited > 0) d.status = 'Parsial'
                else d.status = 'Belum Setor'
                d.statusColor = d.status === 'Lunas' ? 'green' : d.status === 'Parsial' ? 'yellow' : 'red'
                d.isOverLimit = d.remaining > 150000
                return d
            }).sort((a, b) => b.remaining - a.remaining)

            setCodList(list)

            const totalFee = list.reduce((s, d) => s + d.codFee, 0)
            const totalDeposited = list.reduce((s, d) => s + d.deposited, 0)
            setTotals({ fee: totalFee, deposited: totalDeposited, remaining: totalFee - totalDeposited, orderCount: (orders || []).length })
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    useEffect(() => { fetchCodData() }, [])

    const handleOpenReminder = (driver) => { setSelectedDriver(driver); setShowReminderModal(true) }
    const handleCloseReminder = () => { setShowReminderModal(false); setSelectedDriver(null) }

    return (
        <AdminLayout title="Kontrol COD & Setoran">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#1a2632] p-6 rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm flex flex-col justify-between h-36">
                    <div className="flex items-center justify-between">
                        <p className="text-[#617589] dark:text-[#94a3b8] text-sm font-medium">Total Fee Admin Hari Ini</p>
                        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-2 rounded-lg"><span className="material-symbols-outlined text-[24px]">account_balance_wallet</span></div>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-[#111418] dark:text-white tracking-tight">{loading ? '...' : formatCurrency(totals.fee)}</p>
                        <p className="text-xs text-[#617589] dark:text-[#94a3b8] mt-1">Dari {totals.orderCount} pesanan COD</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1a2632] p-6 rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm flex flex-col justify-between h-36">
                    <div className="flex items-center justify-between">
                        <p className="text-[#617589] dark:text-[#94a3b8] text-sm font-medium">Sudah Disetor</p>
                        <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-2 rounded-lg"><span className="material-symbols-outlined text-[24px]">verified</span></div>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400 tracking-tight">{loading ? '...' : formatCurrency(totals.deposited)}</p>
                        <p className="text-xs text-[#617589] dark:text-[#94a3b8] mt-1">{totals.fee > 0 ? Math.round((totals.deposited / totals.fee) * 100) : 0}% dari total tagihan</p>
                    </div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-xl border border-red-200 dark:border-red-800 shadow-sm flex flex-col justify-between h-36 ring-1 ring-red-100 dark:ring-red-900/30">
                    <div className="flex items-center justify-between">
                        <p className="text-red-700 dark:text-red-300 text-sm font-bold">Sisa Belum Disetor</p>
                        <div className="bg-white dark:bg-red-900/40 text-red-600 dark:text-red-400 p-2 rounded-lg shadow-sm"><span className="material-symbols-outlined text-[24px]">pending_actions</span></div>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-red-700 dark:text-red-400 tracking-tight">{loading ? '...' : formatCurrency(totals.remaining)}</p>
                        <p className="text-xs text-red-600/80 dark:text-red-300/70 mt-1 font-medium">{totals.remaining > 0 ? 'Perlu tindak lanjut segera' : 'Semua sudah lunas'}</p>
                    </div>
                </div>
            </div>

            {/* Recap Table */}
            <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm flex flex-col overflow-hidden">
                <div className="p-6 border-b border-[#e5e7eb] dark:border-[#2a3b4d] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="text-lg font-bold text-[#111418] dark:text-white">Rekapitulasi Driver</h3>
                </div>

                {codList.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 px-6 text-center">
                        <div className="bg-[#f0f2f4] dark:bg-[#2a3b4d] w-24 h-24 rounded-full flex items-center justify-center mb-6"><span className="material-symbols-outlined text-5xl text-[#617589] dark:text-[#94a3b8]">account_balance_wallet</span></div>
                        <h4 className="text-xl font-bold text-[#111418] dark:text-white mb-2">Belum Ada Transaksi COD</h4>
                        <p className="text-[#617589] dark:text-[#94a3b8] max-w-md mx-auto">Data setoran kurir akan muncul setelah ada pesanan COD hari ini.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#f9fafb] dark:bg-[#1e2c3a] border-b border-[#e5e7eb] dark:border-[#2a3b4d]">
                                    <th className="px-6 py-4 text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider">Driver</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider text-right">Fee Admin</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider text-right">Disetor</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider text-right">Selisih</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider text-center">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#2a3b4d]">
                                {codList.map((driver) => (
                                    <tr key={driver.id} className={`transition-colors ${driver.isOverLimit ? 'bg-red-50/50 dark:bg-red-900/5 hover:bg-red-50 dark:hover:bg-red-900/10' : 'hover:bg-[#f9fafb] dark:hover:bg-[#202e3b]'}`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-900/30 flex items-center justify-center text-gray-600 text-xs font-bold">{driver.initials}</div>
                                                <div><p className="text-sm font-medium text-[#111418] dark:text-white">{driver.name}</p><p className="text-xs text-[#617589] dark:text-[#94a3b8]">ID: {driver.id?.substring(0, 8)}</p></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-[#111418] dark:text-white font-medium">
                                            <div className="flex items-center justify-end gap-1">
                                                <span>{formatCurrency(driver.codFee)}</span>
                                                {driver.isOverLimit && <span className="material-symbols-outlined text-red-600 text-[18px]" title="Melewati Batas">error</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600 dark:text-green-400 font-medium">{formatCurrency(driver.deposited)}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-bold ${driver.remaining > 0 ? 'text-red-600 dark:text-red-400' : 'text-[#617589] dark:text-[#94a3b8]'}`}>{driver.remaining > 0 ? formatCurrency(driver.remaining) : '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                                ${driver.status === 'Lunas' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800' : ''}
                                                ${driver.status === 'Parsial' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800' : ''}
                                                ${driver.status === 'Belum Setor' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800' : ''}
                                            `}>{driver.status}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            {driver.status === 'Lunas' && <button className="text-[#617589] hover:text-[#111418] dark:hover:text-white transition-colors" title="Lihat Detail"><span className="material-symbols-outlined">visibility</span></button>}
                                            {driver.status !== 'Lunas' && (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button className="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded transition-colors shadow-sm whitespace-nowrap">Konfirmasi Setoran</button>
                                                    {driver.status === 'Belum Setor' && (
                                                        <button onClick={() => handleOpenReminder(driver)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded transition-colors whitespace-nowrap">
                                                            <span className="material-symbols-outlined text-[16px]">notifications</span>Kirim Pengingat
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="px-6 py-4 border-t border-[#e5e7eb] dark:border-[#2a3b4d] flex items-center justify-between">
                    <p className="text-sm text-[#617589] dark:text-[#94a3b8]">Menampilkan <span className="font-semibold text-[#111418] dark:text-white">{codList.length}</span> driver aktif</p>
                </div>
            </div>
        </AdminLayout>
    )
}
