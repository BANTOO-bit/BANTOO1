import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../services/supabaseClient'

export default function AdminRecentTransactions() {
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchTransactions = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    id, status, total_amount, created_at, customer_name,
                    merchant:merchants(name),
                    driver:profiles!orders_driver_id_fkey(full_name)
                `)
                .order('created_at', { ascending: false })
                .limit(5)

            if (error) {
                console.error('Error fetching transactions:', error)
                return
            }

            setTransactions((data || []).map(o => ({
                id: `#${o.id?.substring(0, 8)}`,
                fullId: o.id,
                merchant: o.merchant?.name || o.customer_name || '-',
                driver: o.driver?.full_name || '--',
                isDriverMissing: !o.driver?.full_name,
                total: `Rp ${(o.total_amount || 0).toLocaleString('id-ID')}`,
                status: getStatusLabel(o.status),
                statusColor: getStatusColor(o.status)
            })))
        } catch (err) {
            console.error('Unexpected error:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTransactions()

        const channel = supabase.channel('admin-recent-tx')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
                fetchTransactions()
            })
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [])

    const getStatusLabel = (status) => {
        const labels = {
            pending: 'Menunggu',
            accepted: 'Diterima',
            preparing: 'Menyiapkan',
            ready: 'Siap',
            pickup: 'Dijemput',
            picked_up: 'Diambil',
            delivering: 'Diantar',
            delivered: 'Terkirim',
            completed: 'Selesai',
            cancelled: 'Dibatalkan'
        }
        return labels[status] || status
    }

    const getStatusColor = (status) => {
        if (['delivered', 'completed'].includes(status)) return 'emerald'
        if (['cancelled'].includes(status)) return 'red'
        if (['delivering', 'picked_up', 'pickup'].includes(status)) return 'blue'
        if (['preparing', 'ready', 'accepted'].includes(status)) return 'orange'
        return 'gray'
    }

    const getStatusStyles = (color) => {
        const styles = {
            orange: {
                badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
                dot: 'bg-orange-500'
            },
            blue: {
                badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                dot: 'bg-blue-500'
            },
            gray: {
                badge: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
                dot: 'bg-gray-500 animate-pulse'
            },
            emerald: {
                badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                dot: 'bg-emerald-500'
            },
            red: {
                badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                dot: 'bg-red-500'
            }
        }
        return styles[color] || styles.gray
    }

    return (
        <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm flex-1 flex flex-col">
            <div className="px-6 py-4 border-b border-[#e5e7eb] dark:border-[#2a3b4d] flex items-center justify-between">
                <h3 className="font-bold text-[#111418] dark:text-white">Transaksi Terkini</h3>
                <Link to="/admin/orders" className="text-sm font-medium text-admin-primary hover:text-blue-700">Lihat Semua</Link>
            </div>
            <div className="overflow-x-auto">
                {loading ? (
                    <div className="p-8 text-center text-sm text-[#617589] dark:text-[#94a3b8]">
                        <span className="material-symbols-outlined animate-spin text-[20px] mr-2">progress_activity</span>
                        Memuat transaksi...
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="p-8 text-center">
                        <span className="material-symbols-outlined text-[#617589] text-3xl mb-2">receipt_long</span>
                        <p className="text-sm text-[#617589] dark:text-[#94a3b8]">Belum ada transaksi</p>
                    </div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#f9fafb] dark:bg-[#2a3b4d]/50 text-[#617589] dark:text-[#94a3b8] font-medium border-b border-[#e5e7eb] dark:border-[#2a3b4d]">
                            <tr>
                                <th className="px-6 py-3">ID Pesanan</th>
                                <th className="px-6 py-3">Warung</th>
                                <th className="px-6 py-3">Driver</th>
                                <th className="px-6 py-3">Total</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#2a3b4d]">
                            {transactions.map((tx) => {
                                const style = getStatusStyles(tx.statusColor)
                                return (
                                    <tr key={tx.id} className="hover:bg-[#f9fafb] dark:hover:bg-[#202e3b] transition-colors">
                                        <td className="px-6 py-4 font-medium text-[#111418] dark:text-white">{tx.id}</td>
                                        <td className="px-6 py-4 text-[#617589] dark:text-[#94a3b8]">{tx.merchant}</td>
                                        <td className={`px-6 py-4 text-[#617589] dark:text-[#94a3b8] ${tx.isDriverMissing ? 'italic' : ''}`}>{tx.driver}</td>
                                        <td className="px-6 py-4 font-medium text-[#111418] dark:text-white">{tx.total}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.badge}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
                                                {tx.status}
                                            </span>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
