import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../../services/supabaseClient'
import AdminLayout from '../../../components/admin/AdminLayout'

export default function AdminUserDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [orderCount, setOrderCount] = useState(0)
    const [totalSpent, setTotalSpent] = useState(0)
    const [recentOrders, setRecentOrders] = useState([])

    const fetchUser = async () => {
        try {
            const { data, error: fetchErr } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', id)
                .single()

            if (fetchErr) throw fetchErr
            setUser(data)

            // Fetch order stats
            const { count } = await supabase
                .from('orders')
                .select('id', { count: 'exact', head: true })
                .eq('customer_id', id)
            setOrderCount(count || 0)

            const { data: ordersData } = await supabase
                .from('orders')
                .select('id, total_amount, status, created_at, merchant:merchants(name)')
                .eq('customer_id', id)
                .order('created_at', { ascending: false })
                .limit(5)

            setRecentOrders(ordersData || [])
            setTotalSpent(ordersData?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0)
        } catch (err) {
            console.error('Error fetching user:', err)
            setError('Gagal memuat data pengguna')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchUser() }, [id])

    const formatCurrency = (val) => `Rp ${(val || 0).toLocaleString('id-ID')}`
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'
    const formatDateTime = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'
    const getInitials = (name) => name ? name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : '??'

    const getStatusLabel = (status) => {
        const map = { pending: 'Menunggu', accepted: 'Diterima', preparing: 'Menyiapkan', ready: 'Siap Antar', delivering: 'Diantar', delivered: 'Terkirim', completed: 'Selesai', cancelled: 'Dibatalkan' }
        return map[status] || status
    }

    const getStatusColor = (status) => {
        if (['completed', 'delivered'].includes(status)) return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
        if (status === 'cancelled') return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    }

    if (loading) {
        return (
            <AdminLayout title="Detail Pelanggan" showBack>
                <div className="flex items-center justify-center py-20">
                    <span className="material-symbols-outlined animate-spin text-4xl text-[#617589]">progress_activity</span>
                </div>
            </AdminLayout>
        )
    }

    if (error || !user) {
        return (
            <AdminLayout title="Detail Pelanggan" showBack>
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <span className="material-symbols-outlined text-5xl text-red-400 mb-4">error</span>
                    <h3 className="text-lg font-bold text-[#111418] dark:text-white mb-2">{error || 'Pengguna tidak ditemukan'}</h3>
                    <button onClick={() => navigate('/admin/users')} className="text-sm text-primary hover:underline mt-4">← Kembali ke Daftar Pelanggan</button>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout title="Detail Pelanggan" showBack>
            <div className="flex flex-col gap-6">

                {/* Header Card */}
                <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-28 relative">
                        <div className="absolute -bottom-10 left-6">
                            <div className="w-20 h-20 rounded-full bg-white dark:bg-[#1a2632] border-4 border-white dark:border-[#1a2632] shadow-lg flex items-center justify-center text-lg font-bold text-emerald-600 bg-emerald-50">
                                {getInitials(user.full_name)}
                            </div>
                        </div>
                    </div>
                    <div className="pt-14 pb-6 px-6">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-[#111418] dark:text-white">{user.full_name || 'Pengguna'}</h2>
                                <p className="text-sm text-[#617589] dark:text-[#94a3b8] mt-1">ID: {user.id?.substring(0, 8)} • Bergabung {formatDate(user.created_at)}</p>
                                <div className="flex items-center gap-2 mt-3">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                        Aktif
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => navigate(`/admin/orders?customer=${user.id}`)}
                                    className="px-4 py-2.5 bg-primary hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2 text-sm">
                                    <span className="material-symbols-outlined text-[18px]">history</span>
                                    Riwayat Pesanan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                        { label: 'Total Pesanan', value: orderCount, icon: 'shopping_bag', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
                        { label: 'Total Belanja', value: formatCurrency(totalSpent), icon: 'payments', color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
                        { label: 'Status', value: 'Aktif', icon: 'verified', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] p-4 flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${stat.color}`}>
                                <span className="material-symbols-outlined text-xl">{stat.icon}</span>
                            </div>
                            <div>
                                <p className="text-lg font-bold text-[#111418] dark:text-white">{stat.value}</p>
                                <p className="text-xs text-[#617589]">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Info + Recent Orders */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Contact Info */}
                    <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl p-6">
                        <h3 className="text-base font-bold text-[#111418] dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px] text-emerald-500">contact_page</span>
                            Informasi Kontak
                        </h3>
                        <div className="flex flex-col gap-4">
                            <InfoRow label="Nama Lengkap" value={user.full_name || '-'} />
                            <InfoRow label="Email" value={user.email || '-'} />
                            <InfoRow label="Telepon" value={user.phone || '-'} />
                            <InfoRow label="Role" value={user.role || 'customer'} />
                            <InfoRow label="Bergabung" value={formatDate(user.created_at)} />
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl p-6">
                        <h3 className="text-base font-bold text-[#111418] dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px] text-blue-500">receipt_long</span>
                            Pesanan Terbaru
                        </h3>
                        {recentOrders.length === 0 ? (
                            <p className="text-sm text-[#617589] dark:text-[#94a3b8] text-center py-8">Belum ada pesanan</p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {recentOrders.map((order) => (
                                    <div key={order.id} className="flex items-center justify-between p-3 bg-[#f9fafb] dark:bg-[#0d1520] rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium text-[#111418] dark:text-white">{order.merchant?.name || 'Warung'}</p>
                                            <p className="text-xs text-[#617589] dark:text-[#94a3b8]">{formatDateTime(order.created_at)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-[#111418] dark:text-white">{formatCurrency(order.total_amount)}</p>
                                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${getStatusColor(order.status)}`}>
                                                {getStatusLabel(order.status)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {orderCount > 5 && (
                                    <button onClick={() => navigate(`/admin/orders?customer=${user.id}`)}
                                        className="text-sm text-primary hover:underline text-center mt-2">
                                        Lihat semua {orderCount} pesanan →
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AdminLayout>
    )
}

function InfoRow({ label, value }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
            <span className="text-sm text-[#617589] dark:text-[#94a3b8] sm:w-40 shrink-0">{label}</span>
            <span className="text-sm font-medium text-[#111418] dark:text-white">{value}</span>
        </div>
    )
}
