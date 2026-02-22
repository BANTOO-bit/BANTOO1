import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AdminLayout from '../../../components/admin/AdminLayout'
import AdminEmptyState from '../../../components/admin/AdminEmptyState'
import { supabase } from '../../../services/supabaseClient'
import { formatOrderId, generateOrderId } from '../../../utils/orderUtils'
import { exportToCSV } from '../../../utils/exportCSV'

// Status config with display labels and colors
const STATUS_CONFIG = {
    pending: { label: 'Menunggu', color: 'gray' },
    accepted: { label: 'Belum Diproses', color: 'blue' },
    preparing: { label: 'Menyiapkan', color: 'orange' },
    processing: { label: 'Menyiapkan', color: 'orange' },
    ready: { label: 'Siap', color: 'green' },
    pickup: { label: 'Penjemputan', color: 'purple' },
    picked_up: { label: 'Diantar', color: 'indigo' },
    delivering: { label: 'Diantar', color: 'blue' },
    delivered: { label: 'Terkirim', color: 'emerald' },
    completed: { label: 'Selesai', color: 'emerald' },
    cancelled: { label: 'Dibatalkan', color: 'red' },
}

const STATUS_COLORS = {
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    cyan: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    gray: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
    green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
}

// Date range filter helpers
function getDateRange(filter) {
    const now = new Date()
    const start = new Date(now)
    start.setHours(0, 0, 0, 0)

    switch (filter) {
        case 'kemarin':
            start.setDate(start.getDate() - 1)
            const endYesterday = new Date(start)
            endYesterday.setHours(23, 59, 59, 999)
            return { start: start.toISOString(), end: endYesterday.toISOString() }
        case 'minggu_ini':
            start.setDate(start.getDate() - start.getDay())
            return { start: start.toISOString(), end: now.toISOString() }
        case 'bulan_ini':
            start.setDate(1)
            return { start: start.toISOString(), end: now.toISOString() }
        default: // hari_ini
            return { start: start.toISOString(), end: now.toISOString() }
    }
}

export default function AdminOrdersPage() {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const customerFilter = searchParams.get('customer')
    const [orders, setOrders] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [dateFilter, setDateFilter] = useState('')
    const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, cancelled: 0 })
    const [customerName, setCustomerName] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 15

    // Fetch orders from Supabase
    const fetchOrders = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)

            let query = supabase
                .from('orders')
                .select(`
                    id, status, total_amount, payment_method, payment_status,
                    created_at, accepted_at, picked_up_at, delivered_at, cancelled_at,
                    delivery_address, notes, cancellation_reason,
                    merchant:merchants(id, name),
                    customer:profiles!orders_customer_id_fkey(id, full_name, phone),
                    driver:profiles!orders_driver_id_fkey(id, full_name, phone),
                    items:order_items(product_name, quantity, price_at_time)
                `)
                .order('created_at', { ascending: false })
                .limit(100)

            // Apply customer filter from URL params
            if (customerFilter) {
                query = query.eq('customer_id', customerFilter)
            }

            // Apply status filter
            if (statusFilter) {
                query = query.eq('status', statusFilter)
            }

            // Apply date filter
            if (dateFilter) {
                const { start, end } = getDateRange(dateFilter)
                query = query.gte('created_at', start).lte('created_at', end)
            }

            const { data, error: fetchError } = await query

            if (fetchError) throw fetchError

            setOrders(data || [])

            // Compute stats
            const all = data || []
            setStats({
                total: all.length,
                active: all.filter(o => ['pending', 'accepted', 'preparing', 'processing', 'ready', 'pickup', 'picked_up', 'delivering'].includes(o.status)).length,
                completed: all.filter(o => ['delivered', 'completed'].includes(o.status)).length,
                cancelled: all.filter(o => o.status === 'cancelled').length,
            })
        } catch (err) {
            console.error('Error fetching admin orders:', err)
            setError(err.message || 'Gagal memuat data pesanan')
        } finally {
            setIsLoading(false)
        }
    }, [statusFilter, dateFilter, customerFilter])

    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    // Realtime subscription
    useEffect(() => {
        const channel = supabase
            .channel('admin-orders-realtime')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'orders',
            }, () => {
                // Refresh on any order change
                fetchOrders()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [fetchOrders])

    // Search filter (client-side)
    const filteredOrders = orders.filter(order => {
        if (!searchQuery) return true
        const q = searchQuery.toLowerCase()
        const orderId = formatOrderId(order.id) || ''
        return (
            orderId.toLowerCase().includes(q) ||
            order.merchant?.name?.toLowerCase().includes(q) ||
            order.customer?.full_name?.toLowerCase().includes(q) ||
            order.driver?.full_name?.toLowerCase().includes(q)
        )
    })

    // Pagination
    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE)
    const paginatedOrders = filteredOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

    // Reset page when filters change
    useEffect(() => { setCurrentPage(1) }, [searchQuery, statusFilter, dateFilter])

    // Format helpers
    const formatTime = (dateStr) => {
        if (!dateStr) return '-'
        const d = new Date(dateStr)
        return d.toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short', year: '2-digit' })
    }

    const formatCurrency = (amount) => {
        if (!amount) return 'Rp 0'
        return `Rp ${amount.toLocaleString('id-ID')}`
    }

    const getStatusBadge = (status) => {
        const config = STATUS_CONFIG[status] || { label: status, color: 'blue' }
        const colorClass = STATUS_COLORS[config.color] || STATUS_COLORS.blue
        return { label: config.label, colorClass }
    }

    // Fetch customer name when filtering
    useEffect(() => {
        if (!customerFilter) { setCustomerName(''); return }
        supabase.from('profiles').select('full_name').eq('id', customerFilter).single()
            .then(({ data }) => setCustomerName(data?.full_name || 'Pelanggan'))
    }, [customerFilter])

    const clearCustomerFilter = () => {
        searchParams.delete('customer')
        setSearchParams(searchParams)
    }

    return (
        <AdminLayout title={customerFilter ? `Pesanan ${customerName}` : 'Daftar Semua Transaksi'} showBack>

            {/* Customer Filter Banner */}
            {customerFilter && customerName && (
                <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 mb-4">
                    <span className="material-symbols-outlined text-blue-600 text-[20px]">filter_alt</span>
                    <p className="text-sm text-blue-800 dark:text-blue-300 flex-1">
                        Menampilkan pesanan dari <span className="font-bold">{customerName}</span>
                    </p>
                    <button onClick={clearCustomerFilter} className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 px-3 py-1 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                        Hapus Filter
                    </button>
                </div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                    { label: 'Total', value: stats.total, icon: 'receipt_long', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
                    { label: 'Aktif', value: stats.active, icon: 'pending', color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20' },
                    { label: 'Selesai', value: stats.completed, icon: 'check_circle', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
                    { label: 'Batal', value: stats.cancelled, icon: 'cancel', color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] p-3 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                            <span className="material-symbols-outlined text-xl">{stat.icon}</span>
                        </div>
                        <div>
                            <p className="text-xl font-bold text-[#111418] dark:text-white">{stat.value}</p>
                            <p className="text-xs text-[#617589]">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#1a2632] p-4 rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] mb-4">
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#617589]">
                            <span className="material-symbols-outlined text-[20px]">search</span>
                        </div>
                        <input
                            className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-[#1a2632] border border-[#d1d5db] dark:border-[#4b5563] rounded-lg focus:ring-1 focus:ring-primary focus:border-primary text-[#111418] dark:text-white"
                            placeholder="Cari pesanan, warung, customer..."
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="relative w-full md:w-48">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pl-3 pr-8 py-2 text-sm bg-white dark:bg-[#1a2632] border border-[#d1d5db] dark:border-[#4b5563] rounded-lg focus:ring-1 focus:ring-primary focus:border-primary text-[#111418] dark:text-white appearance-none cursor-pointer"
                        >
                            <option value="">Semua Status</option>
                            <option value="pending">Menunggu</option>
                            <option value="accepted">Diterima</option>
                            <option value="preparing">Menyiapkan</option>
                            <option value="ready">Siap Antar</option>
                            <option value="pickup">Driver Menuju</option>
                            <option value="picked_up">Diambil</option>
                            <option value="delivering">Diantar</option>
                            <option value="delivered">Terkirim</option>
                            <option value="completed">Selesai</option>
                            <option value="cancelled">Dibatalkan</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-[#617589]">
                            <span className="material-symbols-outlined text-[20px]">arrow_drop_down</span>
                        </div>
                    </div>
                    <div className="relative w-full md:w-48">
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-full pl-3 pr-8 py-2 text-sm bg-white dark:bg-[#1a2632] border border-[#d1d5db] dark:border-[#4b5563] rounded-lg focus:ring-1 focus:ring-primary focus:border-primary text-[#111418] dark:text-white appearance-none cursor-pointer"
                        >
                            <option value="">Semua Waktu</option>
                            <option value="hari_ini">Hari Ini</option>
                            <option value="kemarin">Kemarin</option>
                            <option value="minggu_ini">Minggu Ini</option>
                            <option value="bulan_ini">Bulan Ini</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-[#617589]">
                            <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => exportToCSV(filteredOrders, [
                            { key: 'id', label: 'ID Pesanan' },
                            { key: 'customer.full_name', label: 'Pelanggan' },
                            { key: 'merchant.name', label: 'Warung' },
                            { key: 'driver.full_name', label: 'Driver' },
                            { key: 'total_amount', label: 'Total' },
                            { key: 'payment_method', label: 'Metode Bayar' },
                            { key: 'status', label: 'Status' },
                            { key: 'created_at', label: 'Tanggal' },
                        ], 'pesanan')}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">download</span>
                        Export CSV
                    </button>
                    <button
                        onClick={fetchOrders}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">refresh</span>
                        Refresh
                    </button>
                </div>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-sm text-[#617589]">Memuat pesanan...</p>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && !isLoading && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 text-center">
                    <span className="material-symbols-outlined text-red-500 text-3xl mb-2 block">error</span>
                    <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p>
                    <button onClick={fetchOrders} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200">
                        Coba Lagi
                    </button>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && filteredOrders.length === 0 && (
                <AdminEmptyState
                    icon="receipt_long"
                    title="Belum Ada Pesanan"
                    description={searchQuery || statusFilter ? 'Tidak ada pesanan yang cocok dengan filter.' : 'Belum ada pesanan masuk.'}
                />
            )}

            {/* Order Table */}
            {!isLoading && !error && filteredOrders.length > 0 && (
                <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] overflow-hidden">
                    {/* Table Header */}
                    <div className="hidden md:grid md:grid-cols-[1fr_1.5fr_1fr_1fr_0.8fr_0.8fr] gap-4 px-4 py-3 bg-gray-50 dark:bg-[#0d1520] border-b border-[#e5e7eb] dark:border-[#2a3b4d] text-xs font-bold text-[#617589] uppercase tracking-wider">
                        <span>ID Pesanan</span>
                        <span>Warung</span>
                        <span>Driver</span>
                        <span>Total</span>
                        <span>Metode</span>
                        <span>Status</span>
                    </div>

                    {/* Table Rows */}
                    <div className="divide-y divide-[#e5e7eb] dark:divide-[#2a3b4d]">
                        {paginatedOrders.map(order => {
                            const { label, colorClass } = getStatusBadge(order.status)
                            const paymentLabel = order.payment_method === 'cod' ? 'COD' : order.payment_method === 'wallet' ? 'Wallet' : 'Transfer'

                            return (
                                <div
                                    key={order.id}
                                    className="grid grid-cols-2 md:grid-cols-[1fr_1.5fr_1fr_1fr_0.8fr_0.8fr] gap-2 md:gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#0d1520] cursor-pointer transition-colors items-center"
                                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                                >
                                    {/* ID & Time */}
                                    <div>
                                        <p className="text-sm font-bold text-[#111418] dark:text-white">
                                            {formatOrderId(order.id)}
                                        </p>
                                        <p className="text-[10px] text-[#617589] mt-0.5">{formatTime(order.created_at)}</p>
                                    </div>

                                    {/* Warung */}
                                    <div className="hidden md:block">
                                        <p className="text-sm text-[#111418] dark:text-white font-medium truncate">
                                            {order.merchant?.name || '-'}
                                        </p>
                                        <p className="text-[10px] text-[#617589] truncate mt-0.5">
                                            {order.customer?.full_name || 'Customer'}
                                        </p>
                                    </div>

                                    {/* Driver */}
                                    <div className="hidden md:block">
                                        <p className="text-sm text-[#111418] dark:text-white truncate">
                                            {order.driver?.full_name || '--'}
                                        </p>
                                    </div>

                                    {/* Total */}
                                    <div>
                                        <p className="text-sm font-bold text-[#111418] dark:text-white">
                                            {formatCurrency(order.total_amount)}
                                        </p>
                                    </div>

                                    {/* Payment Method */}
                                    <div className="hidden md:block">
                                        <span className="text-xs text-[#617589]">{paymentLabel}</span>
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${colorClass}`}>
                                            {label}
                                        </span>
                                    </div>

                                    {/* Mobile: extra info */}
                                    <div className="col-span-2 md:hidden flex items-center gap-2 text-[10px] text-[#617589]">
                                        <span>{order.merchant?.name || '-'}</span>
                                        <span>•</span>
                                        <span>{order.driver?.full_name || 'No Driver'}</span>
                                        <span>•</span>
                                        <span>{paymentLabel}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Pagination Footer */}
                    <div className="px-4 py-3 bg-gray-50 dark:bg-[#0d1520] border-t border-[#e5e7eb] dark:border-[#2a3b4d] flex items-center justify-between">
                        <p className="text-xs text-[#617589]">
                            Menampilkan {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} dari {filteredOrders.length} pesanan
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-1.5 rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] text-[#617589] hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <span className="material-symbols-outlined text-base">chevron_left</span>
                            </button>
                            <span className="text-xs font-medium text-[#111418] dark:text-white px-2">{currentPage} / {totalPages || 1}</span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage >= totalPages}
                                className="p-1.5 rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] text-[#617589] hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <span className="material-symbols-outlined text-base">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    )
}
