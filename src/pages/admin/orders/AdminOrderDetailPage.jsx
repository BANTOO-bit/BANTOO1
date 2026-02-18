import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../../services/supabaseClient'
import AdminLayout from '../../../components/admin/AdminLayout'
import { generateOrderId } from '../../../utils/orderUtils'

const STATUS_CONFIG = {
    pending: { label: 'Menunggu', color: 'orange', icon: 'schedule' },
    accepted: { label: 'Diterima', color: 'blue', icon: 'check_circle' },
    preparing: { label: 'Menyiapkan', color: 'orange', icon: 'skillet' },
    ready: { label: 'Siap Antar', color: 'cyan', icon: 'takeout_dining' },
    pickup: { label: 'Driver Menuju', color: 'blue', icon: 'two_wheeler' },
    picked_up: { label: 'Diambil', color: 'blue', icon: 'local_shipping' },
    delivering: { label: 'Diantar', color: 'blue', icon: 'delivery_dining' },
    delivered: { label: 'Terkirim', color: 'emerald', icon: 'where_to_vote' },
    completed: { label: 'Selesai', color: 'emerald', icon: 'verified' },
    cancelled: { label: 'Dibatalkan', color: 'red', icon: 'cancel' },
}

const STATUS_COLORS = {
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    cyan: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const formatCurrency = (val) => `Rp ${(val || 0).toLocaleString('id-ID')}`
const formatDateTime = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })
}

export default function AdminOrderDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchOrder() {
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select(`
                        *,
                        merchant:merchants(id, name, phone, logo_url),
                        customer:profiles!orders_customer_id_fkey(id, full_name, phone, email),
                        driver:profiles!orders_driver_id_fkey(id, full_name, phone),
                        items:order_items(id, product_name, quantity, price_at_time, notes)
                    `)
                    .eq('id', id)
                    .single()

                if (error) throw error
                setOrder(data)
            } catch (err) {
                console.error('Error fetching order:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchOrder()
    }, [id])

    if (loading) {
        return (
            <AdminLayout title="Detail Pesanan">
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </AdminLayout>
        )
    }

    if (!order) {
        return (
            <AdminLayout title="Detail Pesanan" showBack onBackClick={() => navigate('/admin/orders')}>
                <div className="flex flex-col items-center justify-center py-20">
                    <span className="material-symbols-outlined text-5xl text-gray-300 mb-4">receipt_long</span>
                    <h3 className="text-lg font-bold text-[#111418] dark:text-white mb-2">Pesanan Tidak Ditemukan</h3>
                    <p className="text-sm text-[#617589] dark:text-[#94a3b8]">Pesanan mungkin sudah dihapus atau ID tidak valid.</p>
                </div>
            </AdminLayout>
        )
    }

    const status = STATUS_CONFIG[order.status] || { label: order.status, color: 'gray', icon: 'help' }
    const displayId = generateOrderId(order.id)

    // Timeline events
    const timeline = [
        { label: 'Pesanan Dibuat', time: order.created_at, icon: 'add_circle' },
        order.accepted_at && { label: 'Diterima Warung', time: order.accepted_at, icon: 'check_circle' },
        order.picked_up_at && { label: 'Diambil Driver', time: order.picked_up_at, icon: 'local_shipping' },
        order.delivered_at && { label: 'Terkirim', time: order.delivered_at, icon: 'where_to_vote' },
        order.cancelled_at && { label: 'Dibatalkan', time: order.cancelled_at, icon: 'cancel' },
    ].filter(Boolean)

    return (
        <AdminLayout
            title={`Pesanan ${displayId}`}
            showBack
            onBackClick={() => navigate('/admin/orders')}
            breadcrumb={[
                { label: 'Pesanan', path: '/admin/orders' },
                { label: displayId }
            ]}
        >
            {/* Header Status Bar */}
            <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${STATUS_COLORS[status.color]}`}>
                        <span className="material-symbols-outlined text-2xl">{status.icon}</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-[#111418] dark:text-white">{displayId}</h2>
                        <p className="text-sm text-[#617589] dark:text-[#94a3b8]">{formatDateTime(order.created_at)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${STATUS_COLORS[status.color]}`}>
                        <span className="material-symbols-outlined text-base">{status.icon}</span>
                        {status.label}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${order.payment_method === 'cod' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'}`}>
                        {order.payment_method === 'cod' ? '💵 COD' : '💳 ' + (order.payment_method || 'Online')}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Order Items + Summary */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-[#e5e7eb] dark:border-[#2a3b4d]">
                            <h3 className="text-sm font-bold text-[#111418] dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg text-primary">receipt_long</span>
                                Item Pesanan
                            </h3>
                        </div>
                        <div className="divide-y divide-[#e5e7eb] dark:divide-[#2a3b4d]">
                            {order.items?.map((item, idx) => (
                                <div key={item.id || idx} className="px-6 py-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                                            {item.quantity}x
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-[#111418] dark:text-white">{item.product_name}</p>
                                            {item.notes && <p className="text-xs text-[#617589] dark:text-[#94a3b8] italic mt-0.5">"{item.notes}"</p>}
                                        </div>
                                    </div>
                                    <p className="text-sm font-semibold text-[#111418] dark:text-white">{formatCurrency(item.price_at_time * item.quantity)}</p>
                                </div>
                            ))}
                            {(!order.items || order.items.length === 0) && (
                                <div className="px-6 py-8 text-center text-sm text-[#617589]">Tidak ada item</div>
                            )}
                        </div>
                        {/* Total */}
                        <div className="px-6 py-4 bg-[#f9fafb] dark:bg-[#1e2c3a] border-t border-[#e5e7eb] dark:border-[#2a3b4d]">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-[#617589] dark:text-[#94a3b8]">Subtotal</span>
                                <span className="text-sm text-[#111418] dark:text-white">{formatCurrency(order.total_amount - (order.delivery_fee || 0) - (order.service_fee || 0))}</span>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-[#617589] dark:text-[#94a3b8]">Ongkir</span>
                                <span className="text-sm text-[#111418] dark:text-white">{formatCurrency(order.delivery_fee || 0)}</span>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-[#617589] dark:text-[#94a3b8]">Biaya Layanan</span>
                                <span className="text-sm text-[#111418] dark:text-white">{formatCurrency(order.service_fee || 0)}</span>
                            </div>
                            {order.discount_amount > 0 && (
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-green-600">Diskon</span>
                                    <span className="text-sm text-green-600">-{formatCurrency(order.discount_amount)}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between pt-2 border-t border-[#e5e7eb] dark:border-[#2a3b4d]">
                                <span className="text-base font-bold text-[#111418] dark:text-white">Total</span>
                                <span className="text-base font-bold text-primary">{formatCurrency(order.total_amount)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl p-6">
                        <h3 className="text-sm font-bold text-[#111418] dark:text-white flex items-center gap-2 mb-5">
                            <span className="material-symbols-outlined text-lg text-primary">timeline</span>
                            Timeline Pesanan
                        </h3>
                        <div className="relative">
                            {timeline.map((event, idx) => (
                                <div key={idx} className="flex gap-4 pb-6 last:pb-0">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${idx === timeline.length - 1 ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-gray-800 text-[#617589]'}`}>
                                            <span className="material-symbols-outlined text-base">{event.icon}</span>
                                        </div>
                                        {idx < timeline.length - 1 && (
                                            <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 mt-1"></div>
                                        )}
                                    </div>
                                    <div className="pt-1">
                                        <p className="text-sm font-medium text-[#111418] dark:text-white">{event.label}</p>
                                        <p className="text-xs text-[#617589] dark:text-[#94a3b8]">{formatDateTime(event.time)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Cancellation Reason */}
                    {order.status === 'cancelled' && order.cancellation_reason && (
                        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-6">
                            <h3 className="text-sm font-bold text-red-800 dark:text-red-300 flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-lg">error</span>
                                Alasan Pembatalan
                            </h3>
                            <p className="text-sm text-red-700 dark:text-red-400">{order.cancellation_reason}</p>
                        </div>
                    )}
                </div>

                {/* Right Column: Parties */}
                <div className="space-y-6">
                    {/* Customer */}
                    <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl p-6">
                        <h3 className="text-sm font-bold text-[#111418] dark:text-white flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-lg text-blue-500">person</span>
                            Pelanggan
                        </h3>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center font-bold text-sm">
                                {(order.customer?.full_name || 'U').substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-[#111418] dark:text-white">{order.customer?.full_name || '-'}</p>
                                <p className="text-xs text-[#617589] dark:text-[#94a3b8]">{order.customer?.phone || '-'}</p>
                            </div>
                        </div>
                        {order.delivery_address && (
                            <div className="mt-3 pt-3 border-t border-[#e5e7eb] dark:border-[#2a3b4d]">
                                <p className="text-xs font-semibold text-[#617589] dark:text-[#94a3b8] mb-1">Alamat Pengiriman</p>
                                <p className="text-sm text-[#111418] dark:text-white leading-relaxed">{order.delivery_address}</p>
                            </div>
                        )}
                        {order.notes && (
                            <div className="mt-3 pt-3 border-t border-[#e5e7eb] dark:border-[#2a3b4d]">
                                <p className="text-xs font-semibold text-[#617589] dark:text-[#94a3b8] mb-1">Catatan</p>
                                <p className="text-sm text-[#111418] dark:text-white italic">"{order.notes}"</p>
                            </div>
                        )}
                    </div>

                    {/* Merchant */}
                    <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl p-6">
                        <h3 className="text-sm font-bold text-[#111418] dark:text-white flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-lg text-orange-500">storefront</span>
                            Warung
                        </h3>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center font-bold text-sm bg-cover bg-center"
                                style={order.merchant?.logo_url ? { backgroundImage: `url(${order.merchant.logo_url})` } : {}}>
                                {!order.merchant?.logo_url && (order.merchant?.name?.substring(0, 2).toUpperCase() || 'WR')}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-[#111418] dark:text-white">{order.merchant?.name || '-'}</p>
                                <p className="text-xs text-[#617589] dark:text-[#94a3b8]">{order.merchant?.phone || '-'}</p>
                            </div>
                        </div>
                        {order.merchant?.id && (
                            <button
                                onClick={() => navigate(`/admin/merchants/${order.merchant.id}`)}
                                className="mt-3 w-full text-xs font-semibold text-primary border border-primary/20 hover:bg-primary/5 rounded-lg py-2 transition-colors"
                            >
                                Lihat Profil Warung
                            </button>
                        )}
                    </div>

                    {/* Driver */}
                    <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl p-6">
                        <h3 className="text-sm font-bold text-[#111418] dark:text-white flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-lg text-indigo-500">two_wheeler</span>
                            Driver
                        </h3>
                        {order.driver ? (
                            <>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                        {(order.driver.full_name || 'D').substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-[#111418] dark:text-white">{order.driver.full_name || '-'}</p>
                                        <p className="text-xs text-[#617589] dark:text-[#94a3b8]">{order.driver.phone || '-'}</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-2 text-[#617589] dark:text-[#94a3b8]">
                                <span className="material-symbols-outlined text-lg">hourglass_empty</span>
                                <p className="text-sm">Belum ada driver</p>
                            </div>
                        )}
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl p-6">
                        <h3 className="text-sm font-bold text-[#111418] dark:text-white flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-lg text-green-500">payments</span>
                            Pembayaran
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-[#617589] dark:text-[#94a3b8]">Metode</span>
                                <span className="text-sm font-medium text-[#111418] dark:text-white capitalize">{order.payment_method || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-[#617589] dark:text-[#94a3b8]">Status</span>
                                <span className={`text-sm font-medium ${order.payment_status === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                                    {order.payment_status === 'paid' ? 'Lunas' : 'Belum Bayar'}
                                </span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-[#e5e7eb] dark:border-[#2a3b4d]">
                                <span className="text-sm font-bold text-[#111418] dark:text-white">Total</span>
                                <span className="text-sm font-bold text-primary">{formatCurrency(order.total_amount)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
