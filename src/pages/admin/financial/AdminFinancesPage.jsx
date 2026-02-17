import { useState, useEffect } from 'react'
import { supabase } from '../../../services/supabaseClient'
import AdminLayout from '../../../components/admin/AdminLayout'

export default function AdminFinancesPage() {
    const [stats, setStats] = useState([
        { label: 'Total COD Hari Ini', value: 'Rp 0', subtext: '0 transaksi', icon: 'account_balance_wallet', color: 'blue' },
        { label: 'Sudah Disetor', value: 'Rp 0', subtext: '0 driver', icon: 'verified', color: 'green' },
        { label: 'Sisa Belum Disetor', value: 'Rp 0', subtext: 'Belum ada data', icon: 'pending_actions', color: 'red' },
    ])
    const [codOrders, setCodOrders] = useState([])
    const [loading, setLoading] = useState(true)

    const formatCurrency = (val) => `Rp ${(val || 0).toLocaleString('id-ID')}`

    const fetchData = async () => {
        try {
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            const { data: orders, error } = await supabase
                .from('orders')
                .select('id, total_amount, service_fee, payment_method, payment_status, status, created_at, customer_name')
                .eq('payment_method', 'cod')
                .gte('created_at', today.toISOString())
                .order('created_at', { ascending: false })

            if (error) { console.error(error); return }

            const codData = orders || []
            setCodOrders(codData)

            const totalCod = codData.reduce((sum, o) => sum + (o.service_fee || 0), 0)
            const deposited = codData.filter(o => o.payment_status === 'paid' && ['delivered', 'completed'].includes(o.status)).reduce((sum, o) => sum + (o.service_fee || 0), 0)
            const remaining = totalCod - deposited

            setStats([
                { label: 'Total COD Hari Ini', value: formatCurrency(totalCod), subtext: `${codData.length} transaksi`, icon: 'account_balance_wallet', color: 'blue' },
                { label: 'Sudah Disetor', value: formatCurrency(deposited), subtext: `${codData.filter(o => o.payment_status === 'paid').length} pesanan`, icon: 'verified', color: 'green' },
                { label: 'Sisa Belum Disetor', value: formatCurrency(remaining), subtext: remaining > 0 ? 'Perlu tindak lanjut' : 'Semua sudah lunas', icon: 'pending_actions', color: 'red' },
            ])
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    useEffect(() => { fetchData() }, [])

    return (
        <AdminLayout title="Kontrol COD & Setoran">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className={`p-6 rounded-xl border shadow-sm flex flex-col justify-between h-36 ${stat.color === 'red' ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800 ring-1 ring-red-100 dark:ring-red-900/30' : 'bg-white dark:bg-[#1a2632] border-[#e5e7eb] dark:border-[#2a3b4d]'}`}>
                        <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${stat.color === 'red' ? 'text-red-700 dark:text-red-300 font-bold' : 'text-[#617589] dark:text-[#94a3b8]'}`}>{stat.label}</p>
                            <div className={`p-2 rounded-lg ${stat.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : stat.color === 'green' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-white dark:bg-red-900/40 text-red-600 dark:text-red-400 shadow-sm'}`}><span className="material-symbols-outlined text-[24px]">{stat.icon}</span></div>
                        </div>
                        <div>
                            <p className={`text-3xl font-bold tracking-tight ${stat.color === 'red' ? 'text-red-700 dark:text-red-400' : stat.color === 'green' ? 'text-green-600 dark:text-green-400' : 'text-[#111418] dark:text-white'}`}>{loading ? '...' : stat.value}</p>
                            <p className={`text-xs mt-1 ${stat.color === 'red' ? 'text-red-600/80 dark:text-red-300/70 font-medium' : 'text-[#617589] dark:text-[#94a3b8]'}`}>{stat.subtext}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* COD Transactions */}
            <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm flex flex-col overflow-hidden min-h-[400px]">
                <div className="p-6 border-b border-[#e5e7eb] dark:border-[#2a3b4d] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="text-lg font-bold text-[#111418] dark:text-white">Transaksi COD Hari Ini</h3>
                </div>

                {codOrders.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 px-6 text-center">
                        <div className="bg-[#f0f2f4] dark:bg-[#2a3b4d] w-24 h-24 rounded-full flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-5xl text-[#617589] dark:text-[#94a3b8]">account_balance_wallet</span>
                        </div>
                        <h4 className="text-xl font-bold text-[#111418] dark:text-white mb-2">Belum Ada Transaksi COD</h4>
                        <p className="text-[#617589] dark:text-[#94a3b8] max-w-md mx-auto">Data setoran kurir akan muncul di sini setelah ada pesanan COD hari ini.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#f9fafb] dark:bg-[#1e2c3a] border-b border-[#e5e7eb] dark:border-[#2a3b4d] text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase">
                                    <th className="px-6 py-4">Order ID</th><th className="px-6 py-4">Pelanggan</th><th className="px-6 py-4 text-right">Total</th><th className="px-6 py-4 text-right">Fee Admin</th><th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#2a3b4d]">
                                {codOrders.map(o => (
                                    <tr key={o.id} className="hover:bg-[#f9fafb] dark:hover:bg-[#202e3b]">
                                        <td className="px-6 py-4 text-sm font-mono text-[#617589]">#{o.id?.substring(0, 8)}</td>
                                        <td className="px-6 py-4 text-sm text-[#111418] dark:text-white">{o.customer_name || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-right font-medium text-[#111418] dark:text-white">{formatCurrency(o.total_amount)}</td>
                                        <td className="px-6 py-4 text-sm text-right font-medium text-blue-600 dark:text-blue-400">{formatCurrency(o.service_fee)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${o.payment_status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                                {o.payment_status === 'paid' ? 'Lunas' : 'Menunggu'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}
