import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BackButton from '../../../components/shared/BackButton'
import ErrorBoundary from '../../../components/shared/ErrorBoundary'
import { useOrder } from '../../../context/OrderContext'
import orderService from '../../../services/orderService'
import { subscribeToDriverLocation, calculateDistance, estimateDeliveryTime } from '../../../services/driverLocationService'
import { formatOrderId } from '../../../utils/orderUtils'
import { useToast } from '../../../context/ToastContext'
import { handleError } from '../../../utils/errorHandler'
import ConfirmationModal from '../../../components/shared/ConfirmationModal'

const TrackingMap = lazy(() => import('../../../components/user/TrackingMap'))

// ============================================
// ORDER STATUS STEPS
// ============================================
const orderStatuses = [
    { id: 'pending', label: 'Menunggu Konfirmasi', icon: 'pending', description: 'Menunggu restoran menerima pesanan' },
    { id: 'accepted', label: 'Pesanan Diterima', icon: 'check_circle', description: 'Restoran menerima pesananmu' },
    { id: 'preparing', label: 'Sedang Dimasak', icon: 'skillet', description: 'Pesananmu sedang dipersiapkan' },
    { id: 'ready', label: 'Siap Diambil', icon: 'takeout_dining', description: 'Menunggu driver mengambil' },
    { id: 'picked_up', label: 'Driver Mengambil', icon: 'two_wheeler', description: 'Driver mengambil pesanan dari restoran' },
    { id: 'delivering', label: 'Dalam Perjalanan', icon: 'navigation', description: 'Driver menuju lokasimu' },
    { id: 'delivered', label: 'Pesanan Tiba', icon: 'home', description: 'Selamat menikmati!' },
]

// Map status strings to step index
const STATUS_INDEX_MAP = {
    'pending': 0,
    'confirmed': 1,
    'accepted': 1,
    'preparing': 2,
    'processing': 2,
    'ready': 3,
    'pickup': 3,
    'picked_up': 4,
    'on_the_way': 5,
    'delivering': 5,
    'delivered': 6,
    'completed': 6,
    'cancelled': -1,
}

// ============================================
// ORDER DETAIL MODAL COMPONENT
// ============================================
function OrderDetailModal({ isOpen, onClose, order }) {
    if (!isOpen || !order) return null

    const deliveryFee = order.delivery_fee || 5000
    const subtotal = order.subtotal || (order.total_amount - deliveryFee)

    // Get merchant image
    const getMerchantImage = (orderData) => {
        if (orderData?.merchant?.image_url) return orderData.merchant.image_url
        if (orderData?.merchant?.image) return orderData.merchant.image
        // Fallback placeholder
        return 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop'
    }

    const merchantName = order.merchant?.name || order.merchantName || 'Restoran'

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end animate-fade-in">
            <div className="w-full bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto animate-slide-up">
                {/* Header */}
                <div className="sticky top-0 bg-white px-4 py-4 border-b border-border-color flex items-center justify-between">
                    <h3 className="text-lg font-bold">Detail Pesanan</h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
                    >
                        <span className="material-symbols-outlined text-text-secondary text-xl">close</span>
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    {/* Order ID & Time */}
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="text-xs text-text-secondary">No. Pesanan</p>
                            <p className="font-bold text-sm">{formatOrderId(order.id)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-text-secondary">Waktu Pesanan</p>
                            <p className="font-medium text-sm">
                                {order.created_at ? new Date(order.created_at).toLocaleString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                }) : '-'}
                            </p>
                        </div>
                    </div>

                    {/* Merchant Info */}
                    <div className="bg-orange-50 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                                <img
                                    src={getMerchantImage(order)}
                                    alt={merchantName}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <p className="font-bold">{merchantName}</p>
                                <p className="text-xs text-text-secondary">Restoran</p>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-white rounded-xl border border-border-color overflow-hidden">
                        <div className="px-4 py-3 bg-gray-50 border-b border-border-color">
                            <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">Daftar Pesanan</p>
                        </div>
                        <div className="divide-y divide-border-color">
                            {order.items?.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-3">
                                        {item.menu_items?.image_url ? (
                                            <img src={item.menu_items.image_url} alt={item.product_name || item.name} className="w-12 h-12 bg-gray-100 rounded-lg object-cover border border-border-color" />
                                        ) : (
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-border-color">
                                                <span className="material-symbols-outlined text-gray-400">restaurant</span>
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium text-sm">{item.product_name || item.name}</p>
                                            <p className="text-xs text-text-secondary">{item.quantity}x @ Rp {(item.price_at_time || item.price)?.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <p className="font-bold text-sm">Rp {((item.price_at_time || item.price) * item.quantity).toLocaleString()}</p>
                                </div>
                            )) || (
                                    <div className="p-4 text-center text-text-secondary text-sm">
                                        Tidak ada data item
                                    </div>
                                )}
                        </div>
                    </div>

                    {/* Delivery Address */}
                    {order.delivery_address && (
                        <div className="bg-white rounded-xl border border-border-color p-4">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-green-600">location_on</span>
                                </div>
                                <div>
                                    <p className="text-xs text-text-secondary mb-1">Alamat Pengiriman</p>
                                    <p className="font-medium text-sm">{order.delivery_address}</p>
                                    {order.delivery_detail && (
                                        <p className="text-xs text-text-secondary mt-0.5">{order.delivery_detail}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payment Summary */}
                    <div className="bg-white rounded-xl border border-border-color p-4">
                        <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Ringkasan Pembayaran</p>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Subtotal ({order.items?.length || 0} item)</span>
                                <span className="text-text-secondary">Rp {subtotal?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Ongkos Kirim</span>
                                <span>Rp {deliveryFee?.toLocaleString()}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Diskon</span>
                                    <span>-Rp {order.discount?.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm pt-2 border-t border-border-color font-bold">
                                <span>Total Pembayaran</span>
                                <span className="text-primary">Rp {order.total_amount?.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white rounded-xl border border-border-color p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined text-blue-600">
                                    {order.payment_method === 'wallet' ? 'account_balance_wallet' : 'payments'}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-text-secondary">Metode Pembayaran</p>
                                <p className="font-medium text-sm">
                                    {order.payment_method === 'wallet' ? 'Saldo Bantoo' : 'Tunai (COD)'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-6"></div>
            </div>
        </div>
    )
}

// ============================================
// MAIN TRACKING PAGE
// ============================================
function TrackingPage() {
    const navigate = useNavigate()
    const { orderId: paramOrderId } = useParams()
    const { activeOrder } = useOrder()
    const toast = useToast()

    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [driverLocation, setDriverLocation] = useState(null)
    const [estimatedTime, setEstimatedTime] = useState(null)

    // Cancel Modal State
    const [cancelModalOpen, setCancelModalOpen] = useState(false)
    const [isCancelling, setIsCancelling] = useState(false)

    // Derived data
    const merchantLocation = order?.merchant
        ? [order.merchant.latitude, order.merchant.longitude]
        : null
    const userLocation = order?.customer_lat && order?.customer_lng
        ? [order.customer_lat, order.customer_lng]
        : null
    const currentStatusIndex = STATUS_INDEX_MAP[order?.status] ?? 0
    const currentStatus = orderStatuses[currentStatusIndex]
    const isDelivered = ['delivered', 'completed'].includes(order?.status)
    const isCancelled = order?.status === 'cancelled'

    // Driver info from order relation
    const driverInfo = order?.driver ? {
        name: order.driver.full_name || 'Driver',
        phone: order.driver.phone || '-',
        photo: order.driver.avatar_url,
        vehicle: order.driver.driver_detail?.[0]
            ? `${order.driver.driver_detail[0].vehicle_brand || ''} ${order.driver.driver_detail[0].vehicle_type || ''}`.trim()
            : 'Motor',
        plate: order.driver.driver_detail?.[0]?.vehicle_plate || '-',
    } : null

    // ============================================
    // FETCH ORDER DATA
    // ============================================
    const fetchOrder = useCallback(async () => {
        const targetOrderId = paramOrderId || activeOrder?.id
        if (!targetOrderId) {
            // Fallback: check localStorage for backward compat
            const savedOrder = localStorage.getItem('bantoo_current_order')
            if (savedOrder) {
                try {
                    const parsed = JSON.parse(savedOrder)
                    setOrder(parsed)
                    setLoading(false)
                    return
                } catch { /* ignore */ }
            }
            setError('Pesanan tidak ditemukan')
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            const data = await orderService.getOrderWithLocations(targetOrderId)
            setOrder(data)
        } catch (err) {
            console.error('Failed to fetch order:', err)
            setError(err.message || 'Gagal memuat pesanan')
        } finally {
            setLoading(false)
        }
    }, [paramOrderId, activeOrder?.id])

    useEffect(() => {
        fetchOrder()
    }, [fetchOrder])

    // ============================================
    // REALTIME: SUBSCRIBE TO ORDER STATUS CHANGES
    // ============================================
    useEffect(() => {
        if (!order?.id) return

        // Subscribe to order changes via Supabase Realtime
        // Subscribe to order changes via Supabase Realtime
        import('../../../services/supabaseClient').then(({ supabase }) => {
            const channel = supabase
                .channel(`tracking-order-${order.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'orders',
                        filter: `id=eq.${order.id}`
                    },
                    (payload) => {
                        // Update local order state with new data
                        setOrder(prev => ({ ...prev, ...payload.new }))

                        // If status changed to 'picked_up' or 'delivering', fetch driver info
                        if (['picked_up', 'delivering'].includes(payload.new.status)) {
                            fetchOrder()
                        }
                    }
                )
                .subscribe()

            return () => {
                supabase.removeChannel(channel)
            }
        })

    }, [order?.id])

    // ============================================
    // REALTIME: SUBSCRIBE TO DRIVER LOCATION
    // ============================================
    useEffect(() => {
        if (!order?.id || !order?.driver_id) return
        // Only track during active delivery statuses
        if (!['picked_up', 'delivering'].includes(order.status)) return

        const subscription = subscribeToDriverLocation(order.id, (location) => {
            const driverPos = [location.lat, location.lng]
            setDriverLocation(driverPos)

            // Calculate ETA from driver to user
            if (userLocation) {
                const distance = calculateDistance(
                    location.lat, location.lng,
                    userLocation[0], userLocation[1]
                )
                setEstimatedTime(estimateDeliveryTime(distance))
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [order?.id, order?.driver_id, order?.status])

    // ============================================
    // ESTIMATE TIME (fallback when no live GPS)
    // ============================================
    useEffect(() => {
        if (estimatedTime !== null) return // Already set by live GPS
        if (!merchantLocation || !userLocation) return

        if (['picked_up', 'delivering'].includes(order?.status)) {
            const distance = calculateDistance(
                merchantLocation[0], merchantLocation[1],
                userLocation[0], userLocation[1]
            )
            setEstimatedTime(estimateDeliveryTime(distance))
        } else if (isDelivered) {
            setEstimatedTime(0)
        }
    }, [order?.status, merchantLocation, userLocation])

    // ============================================
    // HANDLE CANCEL
    // ============================================
    const handleConfirmCancel = async () => {
        if (!order) return

        try {
            setIsCancelling(true)
            await orderService.cancelOrder(order.id, 'Dibatalkan oleh pelanggan via Tracking')

            toast.success('Pesanan berhasil dibatalkan')
            setCancelModalOpen(false)
            navigate('/orders')
        } catch (err) {
            console.error('Error cancelling order:', err)
            handleError(err, toast, { context: 'Cancel Order' })
        } finally {
            setIsCancelling(false)
        }
    }

    // ============================================
    // LOADING & ERROR STATES
    // ============================================
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-background-light">
                <header className="sticky top-0 z-50 bg-white px-4 pt-12 pb-4 border-b border-border-color shadow-sm">
                    <div className="relative flex items-center justify-center min-h-[40px]">
                        <BackButton />
                        <h1 className="text-lg font-bold">Lacak Pesanan</h1>
                    </div>
                </header>
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="size-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-text-secondary text-sm">Memuat tracking...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !order) {
        return (
            <div className="min-h-screen flex flex-col bg-background-light">
                <header className="sticky top-0 z-50 bg-white px-4 pt-12 pb-4 border-b border-border-color shadow-sm">
                    <div className="relative flex items-center justify-center min-h-[40px]">
                        <BackButton />
                        <h1 className="text-lg font-bold">Lacak Pesanan</h1>
                    </div>
                </header>
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="text-center">
                        <span className="material-symbols-outlined text-5xl text-gray-300 mb-3 block">search_off</span>
                        <p className="font-bold text-lg mb-1">Pesanan Tidak Ditemukan</p>
                        <p className="text-text-secondary text-sm mb-4">{error || 'Tidak ada pesanan aktif untuk dilacak.'}</p>
                        <button
                            onClick={() => navigate('/orders')}
                            className="py-2.5 px-6 bg-primary text-white font-bold rounded-xl"
                        >
                            Lihat Pesanan
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // ============================================
    // RENDER
    // ============================================
    const merchantName = order.merchant?.name || order.merchantName || 'Restoran'
    const hasDriver = currentStatusIndex >= 4 && driverInfo

    // Cancelled State
    if (isCancelled) {
        return (
            <div className="min-h-screen flex flex-col bg-background-light">
                <header className="sticky top-0 z-50 bg-white px-4 pt-12 pb-4 border-b border-border-color shadow-sm">
                    <div className="relative flex items-center justify-center min-h-[40px]">
                        <BackButton />
                        <h1 className="text-lg font-bold">Lacak Pesanan</h1>
                    </div>
                </header>
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-4xl text-red-500">cancel</span>
                        </div>
                        <p className="font-bold text-lg mb-1">Pesanan Dibatalkan</p>
                        <p className="text-text-secondary text-sm mb-2">
                            {order.cancellation_reason || 'Pesanan ini telah dibatalkan.'}
                        </p>
                        <p className="text-xs text-text-secondary mb-6">ID: {formatOrderId(order.id)}</p>
                        <button
                            onClick={() => navigate('/orders')}
                            className="py-2.5 px-6 bg-primary text-white font-bold rounded-xl"
                        >
                            Kembali ke Pesanan
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-background-light pb-6">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white px-4 pt-12 pb-4 border-b border-border-color shadow-sm">
                <div className="relative flex items-center justify-center min-h-[40px]">
                    <BackButton confirmMessage="Sedang melacak pesanan. Yakin ingin keluar?" />
                    <h1 className="text-lg font-bold">Lacak Pesanan</h1>
                </div>
            </header>

            {/* Waiting States: Pending, Accepted, Preparing, Processing, Ready */}
            {['pending', 'accepted', 'preparing', 'processing', 'ready'].includes(order.status) ? (
                <div className="w-full h-[320px] bg-white flex flex-col items-center justify-center p-6 text-center border-b border-gray-100 relative overflow-hidden text-slate-800">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-50/80 rounded-full blur-3xl -z-10"></div>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20" style={{ animationDuration: '3s' }}></div>
                        <div className="relative w-24 h-24 bg-gradient-to-tr from-blue-500 to-blue-400 rounded-full flex items-center justify-center shadow-md border-4 border-white">
                            <span className="material-symbols-outlined text-4xl text-white">
                                {order.status === 'pending' ? 'storefront' : order.status === 'ready' ? 'takeout_dining' : 'soup_kitchen'}
                            </span>
                        </div>
                    </div>

                    <h3 className="font-bold text-xl text-gray-900 mb-2">
                        {order.status === 'pending' ? 'Menunggu Konfirmasi' : order.status === 'ready' ? 'Siap Diambil' : 'Sedang Disiapkan'}
                    </h3>

                    <div className="space-y-1 max-w-[280px] mx-auto">
                        <p className="text-gray-500 text-sm leading-relaxed">
                            {order.status === 'pending'
                                ? `Pesananmu sedang diteruskan ke ${merchantName}. Mohon tunggu sebentar ya...`
                                : order.status === 'ready'
                                    ? 'Pesananmu sudah siap. Sistem sedang mencarikan driver terdekat.'
                                    : 'Restoran sedang menyiapkan hidangan lezatmu dengan sepenuh hati.'}
                        </p>
                    </div>

                    <div className="mt-8 px-4 py-2 bg-slate-50 border border-slate-100 rounded-full flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <span className="text-xs font-semibold text-slate-600">Mohon Ditunggu Ya</span>
                    </div>
                </div>
            ) : (
                <div className="relative w-full h-[280px] bg-gray-100">
                    <ErrorBoundary
                        fallback={({ error: mapError }) => (
                            <div className="h-full w-full bg-gray-50 rounded-2xl flex items-center justify-center p-6">
                                <div className="text-center max-w-sm">
                                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="material-symbols-outlined text-red-500 text-3xl">map</span>
                                    </div>
                                    <h3 className="font-bold text-text-main mb-2">Peta Tidak Dapat Dimuat</h3>
                                    <p className="text-sm text-text-secondary mb-4">
                                        Terjadi kesalahan saat memuat peta. Silakan coba lagi.
                                    </p>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="py-2 px-4 bg-primary text-white rounded-lg font-medium"
                                    >
                                        Muat Ulang Peta
                                    </button>
                                </div>
                            </div>
                        )}
                    >
                        {merchantLocation && userLocation ? (
                            <Suspense fallback={
                                <div className="h-full w-full flex items-center justify-center bg-gray-50">
                                    <div className="size-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            }>
                                <TrackingMap
                                    merchantLocation={merchantLocation}
                                    userLocation={userLocation}
                                    driverLocation={driverLocation}
                                    height="280px"
                                />
                            </Suspense>
                        ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gray-50 p-6">
                                <div className="text-center">
                                    <span className="material-symbols-outlined text-3xl text-gray-300 mb-2 block">location_off</span>
                                    <p className="font-bold text-gray-600 mb-1 text-sm">Peta Tidak Tersedia</p>
                                    <p className="text-xs text-text-secondary max-w-[200px] mx-auto">
                                        Alamat ini tidak memiliki titik koordinat GPS. Driver akan mengacu pada detail alamat tertulis.
                                    </p>
                                </div>
                            </div>
                        )}
                    </ErrorBoundary>

                    {/* Floating Status Card Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 border border-white z-30 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-text-secondary font-medium">Estimasi Tiba</p>
                            <p className="text-lg font-bold text-text-main flex items-center gap-1">
                                {isDelivered ? 'Tiba!' : estimatedTime !== null ? `${estimatedTime} Menit` : 'Menghitung...'}
                            </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${isDelivered ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'
                            }`}>
                            {currentStatus.label}
                        </div>
                    </div>
                </div>
            )}

            {/* Status Timeline */}
            <div className="mx-4 mt-6">
                <h3 className="font-bold text-lg mb-4">Status Pengiriman</h3>
                <div className="space-y-0 pl-2">
                    {orderStatuses.map((status, index) => {
                        const isCompleted = index <= currentStatusIndex
                        const isCurrent = index === currentStatusIndex
                        const isLast = index === orderStatuses.length - 1

                        return (
                            <div key={status.id} className="flex gap-4 relative">
                                {/* Timeline Line */}
                                {!isLast && (
                                    <div className={`absolute left-[11px] top-6 bottom-[-24px] w-0.5 ${isCompleted && index < currentStatusIndex ? 'bg-green-500' : 'bg-gray-200'
                                        }`} />
                                )}

                                {/* Timeline Dot */}
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${isCompleted
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-200 text-gray-400'
                                    }`}>
                                    <span className="material-symbols-outlined text-sm">
                                        {isCompleted ? 'check' : 'radio_button_unchecked'}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className={`pb-6 flex-1 ${isCurrent ? 'opacity-100' : 'opacity-60'}`}>
                                    <p className="text-sm font-bold text-text-main">{status.label}</p>
                                    <p className="text-xs text-text-secondary mt-0.5">{status.description}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Driver Info Card */}
            {hasDriver && (
                <div className="mx-4 mt-2 bg-white rounded-2xl border border-border-color p-4 shadow-sm">
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Driver Anda</p>
                    <div className="flex items-center gap-3">
                        {driverInfo.photo ? (
                            <img
                                src={driverInfo.photo}
                                alt={driverInfo.name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center border-2 border-primary/20">
                                <span className="material-symbols-outlined text-blue-600">person</span>
                            </div>
                        )}
                        <div className="flex-1">
                            <p className="font-bold text-text-main text-sm">{driverInfo.name}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                                <span className="material-symbols-outlined text-blue-500 text-xs">two_wheeler</span>
                                <span className="text-xs text-text-secondary">{driverInfo.vehicle}</span>
                            </div>
                            <p className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded w-fit mt-1">{driverInfo.plate}</p>
                        </div>
                        <div className="flex gap-2">
                            <a
                                href={`tel:${driverInfo.phone}`}
                                className="w-9 h-9 flex items-center justify-center bg-green-100 text-green-600 rounded-full active:scale-95 transition-transform"
                            >
                                <span className="material-symbols-outlined text-lg">call</span>
                            </a>
                            <button
                                onClick={() => navigate(`/chat-driver/${order.id}`)}
                                className="w-9 h-9 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full active:scale-95 transition-transform"
                            >
                                <span className="material-symbols-outlined text-lg">chat</span>
                            </button>
                        </div>
                    </div>

                    {/* Live location indicator */}
                    {driverLocation && (
                        <div className="mt-3 pt-3 border-t border-border-color flex items-center gap-2">
                            <div className="relative flex items-center justify-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <div className="absolute w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                            </div>
                            <span className="text-xs text-green-600 font-medium">Lokasi driver live</span>
                        </div>
                    )}
                </div>
            )}

            {/* Order Info Summary */}
            <div className="mx-4 mt-4 bg-white rounded-2xl border border-border-color p-4 shadow-sm mb-20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center bg-orange-50 rounded-lg">
                            <span className="material-symbols-outlined text-primary">storefront</span>
                        </div>
                        <div>
                            <p className="font-bold text-sm">{merchantName}</p>
                            <p className="text-xs text-text-secondary">{order.items?.length || 0} item • Rp {order.total_amount?.toLocaleString()}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowDetailModal(true)}
                        className="text-xs text-primary font-bold border border-primary/20 px-3 py-1.5 rounded-full hover:bg-orange-50 active:scale-95 transition-all"
                    >
                        Detail
                    </button>
                </div>
            </div>

            {/* Bottom Action - Delivered */}
            {isDelivered && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-border-color z-30 animate-slide-up">
                    <button
                        onClick={() => navigate('/review')}
                        className="w-full py-3.5 bg-primary text-white font-bold rounded-xl active:scale-[0.99] transition-transform flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">star</span>
                        Beri Ulasan
                    </button>
                </div>
            )}

            {/* Bottom Action - Cancel (Only if Pending) */}
            {order.status === 'pending' && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-border-color z-30 animate-slide-up">
                    <button
                        onClick={() => setCancelModalOpen(true)}
                        className="w-full py-3.5 bg-red-50 text-red-600 font-bold rounded-xl border border-red-200 active:scale-[0.99] transition-transform flex items-center justify-center gap-2 hover:bg-red-100"
                    >
                        <span className="material-symbols-outlined">cancel</span>
                        Batalkan Pesanan
                    </button>
                </div>
            )}

            {/* Order Detail Modal */}
            <OrderDetailModal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                order={order}
            />

            {/* Cancel Confirmation Modal */}
            <ConfirmationModal
                isOpen={cancelModalOpen}
                onClose={() => !isCancelling && setCancelModalOpen(false)}
                onConfirm={handleConfirmCancel}
                title="Batalkan Pesanan?"
                message="Apakah Anda yakin ingin membatalkan pesanan ini? Pesanan yang dibatalkan tidak dapat dikembalikan."
                confirmLabel="Batalkan"
                cancelLabel="Kembali"
                confirmColor="red"
                icon="cancel"
                loading={isCancelling}
            />
        </div>
    )
}

export default TrackingPage
