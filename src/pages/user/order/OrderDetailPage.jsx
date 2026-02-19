import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import BackButton from '../../../components/shared/BackButton'
import { useAuth } from '../../../context/AuthContext'
import { useCart } from '../../../context/CartContext'
import { useNotification } from '../../../context/NotificationsContext'
import { supabase } from '../../../services/supabaseClient'
import orderService from '../../../services/orderService'
import logger from '../../../utils/logger'
import { formatOrderId, generateOrderId } from '../../../utils/orderUtils'
import BottomNavigation from '../../../components/user/BottomNavigation'

function OrderDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const { addToCart, setMerchantInfo, clearCart } = useCart()
    const { addNotification } = useNotification()
    const [order, setOrder] = useState(null)
    const [showReorderToast, setShowReorderToast] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    // Fetch order from Supabase
    useEffect(() => {
        async function fetchOrder() {
            if (!id) {
                setIsLoading(false)
                return
            }

            try {
                setIsLoading(true)
                setError(null)

                // Fetch order by ID
                const orderData = await orderService.getOrder(id)

                if (!orderData) {
                    setError('Pesanan tidak ditemukan')
                    setIsLoading(false)
                    return
                }

                // Transform data to match component format
                const transformedOrder = {
                    id: generateOrderId(orderData.id),
                    dbId: orderData.id,
                    merchantName: orderData.merchant?.name || 'Merchant',
                    merchantImage: orderData.merchant?.image_url,
                    merchantAddress: orderData.merchant?.address,
                    status: orderData.status,
                    totalAmount: orderData.total_amount,
                    subtotal: orderData.subtotal,
                    deliveryFee: orderData.delivery_fee,
                    serviceFee: orderData.service_fee,
                    discount: orderData.discount,
                    paymentMethod: orderData.payment_method,
                    deliveryAddress: orderData.delivery_address,
                    deliveryDetail: orderData.delivery_detail,
                    notes: orderData.notes,
                    createdAt: orderData.created_at,
                    items: orderData.items?.map(item => ({
                        id: item.product_id,
                        name: item.product_name,
                        quantity: item.quantity,
                        price: item.price_at_time,
                        notes: item.notes
                    })) || [],
                    timeline: {
                        created: orderData.created_at ? new Date(orderData.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : null,
                        processed: orderData.accepted_at ? new Date(orderData.accepted_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : null,
                        handover: orderData.picked_up_at ? new Date(orderData.picked_up_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : null,
                        completed: orderData.delivered_at ? new Date(orderData.delivered_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : null
                    }
                }

                setOrder(transformedOrder)
            } catch (err) {
                logger.error('Error fetching order', err, 'OrderDetailPage')
                setError(err.message || 'Gagal memuat detail pesanan')
            } finally {
                setIsLoading(false)
            }
        }

        fetchOrder()
    }, [id])

    // Realtime subscription for order status updates
    useEffect(() => {
        if (!order?.dbId) return

        logger.debug('Subscribing to order updates:', order.dbId)

        // Subscribe to this specific order
        const channel = supabase
            .channel(`order-${order.dbId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'orders',
                filter: `id=eq.${order.dbId}`
            }, (payload) => {
                logger.debug('Order status updated:', payload.new)

                // Status change messages
                const statusMessages = {
                    'accepted': '✅ Pesanan diterima merchant',
                    'ready': '📦 Pesanan siap diambil driver',
                    'picked_up': '🚗 Pesanan sedang diantar',
                    'delivered': '🎉 Pesanan telah sampai'
                }

                // Show notification if status changed
                if (payload.new.status !== payload.old.status && statusMessages[payload.new.status]) {
                    addNotification({
                        type: 'success',
                        message: statusMessages[payload.new.status],
                        duration: 4000
                    })
                }

                // Update order state with new data
                setOrder(prev => ({
                    ...prev,
                    status: payload.new.status,
                    timeline: {
                        created: prev.timeline?.created,
                        processed: payload.new.accepted_at ? new Date(payload.new.accepted_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : prev.timeline?.processed,
                        handover: payload.new.picked_up_at ? new Date(payload.new.picked_up_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : prev.timeline?.handover,
                        completed: payload.new.delivered_at ? new Date(payload.new.delivered_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : prev.timeline?.completed
                    }
                }))
            })
            .subscribe()

        // Cleanup subscription
        return () => {
            logger.debug('Unsubscribing from order:', order.dbId)
            channel.unsubscribe()
        }
    }, [order?.dbId, addNotification])

    const formatDate = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) + ' WIB'
    }

    const formatTime = (dateString) => {
        if (!dateString) return '12:45'
        const date = new Date(dateString)
        return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const handleReview = () => {
        localStorage.setItem('bantoo_review_order', JSON.stringify(order))
        navigate('/review')
    }

    const handleReorder = () => {
        clearCart()

        if (order.merchantName) {
            setMerchantInfo({
                name: order.merchantName,
                id: order.merchantId || Date.now()
            })
        }

        if (order.items && order.items.length > 0) {
            order.items.forEach(item => {
                for (let i = 0; i < (item.quantity || 1); i++) {
                    addToCart({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        image: item.image
                    })
                }
            })
        }

        setShowReorderToast(true)
        setTimeout(() => {
            setShowReorderToast(false)
            navigate('/cart')
        }, 1500)
    }

    const handleContactSupport = () => {
        navigate('/help')
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="text-center">
                    <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">receipt_long</span>
                    <p className="text-text-secondary dark:text-gray-400">Memuat detail pesanan...</p>
                    <button onClick={() => navigate(-1)} className="mt-4 text-primary font-bold">Kembali</button>
                </div>
            </div>
        )
    }

    const isCancelled = order.status === 'cancelled'
    const isCompleted = order.status === 'delivered' || order.status === 'completed'
    const subtotal = order.items?.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0) || order.total || 0
    const deliveryFee = order.deliveryFee || 10000
    const serviceFee = 0
    const total = order.total || (subtotal + deliveryFee)
    const itemCount = order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0

    return (
        <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark pb-[120px]">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-card-light dark:bg-card-dark px-4 pt-12 pb-3 border-b border-border-color dark:border-gray-800 shadow-sm">
                <div className="relative flex items-center justify-center min-h-[44px]">
                    <BackButton />
                    <div className="flex flex-col items-center justify-center">
                        <h1 className="text-base font-bold leading-tight">Detail Pesanan</h1>
                        <span className="text-[11px] font-medium text-text-secondary dark:text-gray-400 mt-0.5">
                            Order ID #{formatOrderId(order.id)}
                        </span>
                    </div>
                </div>
            </header>

            <main className="flex flex-col gap-4 p-4">
                {/* Status Banner Card */}
                <div className="bg-card-light dark:bg-card-dark rounded-2xl p-5 shadow-soft border border-border-color dark:border-gray-800 flex flex-col items-center text-center">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${isCancelled
                        ? 'bg-red-50 dark:bg-red-900/20'
                        : 'bg-green-50 dark:bg-green-900/20'
                        }`}>
                        <span className={`material-symbols-outlined text-[48px] fill ${isCancelled ? 'text-red-600' : 'text-green-600'
                            }`}>
                            {isCancelled ? 'cancel' : 'check_circle'}
                        </span>
                    </div>
                    <h2 className="text-lg font-bold text-text-main dark:text-white">
                        {isCancelled ? 'Pesanan Dibatalkan' : 'Pesanan Selesai'}
                    </h2>
                    <p className="text-xs text-text-secondary dark:text-gray-400 mt-1 max-w-[240px] leading-relaxed">
                        {isCancelled
                            ? (order.cancelReason || 'Pesanan dibatalkan karena merchant tidak merespon.')
                            : 'Terima kasih! Pesananmu sudah sampai di tujuan.'
                        }
                    </p>
                    <div className="mt-4 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center gap-1.5 border border-gray-100 dark:border-gray-700">
                        <span className={`material-symbols-outlined text-[16px] ${isCancelled ? 'text-red-600' : 'text-green-600'}`}>
                            schedule
                        </span>
                        <span className="text-[11px] font-semibold text-text-main dark:text-white">
                            {isCancelled ? 'Dibatalkan' : 'Diterima'} pukul {formatTime(order.completedAt || order.createdAt)} WIB
                        </span>
                    </div>
                </div>

                {/* Delivery Address Card */}
                <div className="bg-card-light dark:bg-card-dark rounded-2xl p-5 shadow-soft border border-border-color dark:border-gray-800">
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-dashed border-gray-100 dark:border-gray-800">
                        <span className="material-symbols-outlined text-primary text-lg">location_on</span>
                        <h3 className="font-bold text-sm">Alamat Pengiriman</h3>
                    </div>
                    <div className="pl-1">
                        <p className="font-bold text-sm text-text-main dark:text-white">
                            {order.recipientName || order.address?.name || 'Budi Santoso'}
                        </p>
                        <p className="text-xs text-text-secondary dark:text-gray-400 mt-1 font-medium">
                            {order.recipientPhone || order.address?.phone || '0812-3456-7890'}
                        </p>
                        <p className="text-xs text-text-secondary dark:text-gray-400 mt-2 leading-relaxed bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                            {typeof order.address === 'string'
                                ? order.address
                                : (order.address?.address || order.address?.label || 'Jl. Kebon Jeruk Raya No. 25, RT.02/RW.05, Kebon Jeruk, Jakarta Barat, 11530')
                            }
                        </p>
                    </div>
                </div>

                {/* Order Items Card */}
                <div className="bg-card-light dark:bg-card-dark rounded-2xl p-5 shadow-soft border border-border-color dark:border-gray-800">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-primary text-lg">storefront</span>
                        <h3 className="font-bold text-sm">Daftar Pesanan</h3>
                    </div>
                    <div className="flex flex-col gap-5">
                        {order.items && order.items.length > 0 ? (
                            order.items.map((item, index) => (
                                <div key={index}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-xs font-bold text-primary shrink-0 border border-orange-100 dark:border-orange-900/30">
                                                {item.quantity || 1}x
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-text-main dark:text-white">
                                                    {typeof item.name === 'string' ? item.name : (item.name?.name || 'Menu Item')}
                                                </span>
                                                {item.variant && typeof item.variant === 'string' && (
                                                    <span className="text-[10px] text-text-secondary dark:text-gray-400 mt-1 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 w-fit">
                                                        {item.variant}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end text-right">
                                            <span className="text-sm font-bold">Rp {((item.price || 0) * (item.quantity || 1)).toLocaleString()}</span>
                                            {(item.quantity || 1) > 1 && (
                                                <span className="text-[10px] text-text-secondary dark:text-gray-400 mt-0.5">@ Rp {item.price?.toLocaleString()}</span>
                                            )}
                                        </div>
                                    </div>
                                    {index < order.items.length - 1 && (
                                        <div className="h-px bg-gray-50 dark:bg-gray-800 mt-5"></div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-text-secondary text-center py-4">Tidak ada detail item</p>
                        )}
                    </div>
                </div>

                {/* Payment Details Card */}
                <div className="bg-card-light dark:bg-card-dark rounded-2xl p-5 shadow-soft border border-border-color dark:border-gray-800">
                    <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-lg">receipt_long</span>
                        Rincian Pembayaran
                    </h3>
                    <div className="space-y-3 mb-4">
                        <div className="flex justify-between items-center text-xs text-text-secondary dark:text-gray-400">
                            <span>Subtotal ({itemCount} item)</span>
                            <span className="font-medium text-text-main dark:text-white">Rp {subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-text-secondary dark:text-gray-400">
                            <span>Ongkos Kirim</span>
                            <span className="font-medium text-text-main dark:text-white">Rp {deliveryFee.toLocaleString()}</span>
                        </div>

                    </div>
                    <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-4"></div>
                    <div className="flex justify-between items-center mb-5">
                        <span className="text-sm font-bold text-text-main dark:text-white">Total Pembayaran</span>
                        <span className="text-base font-bold text-primary">Rp {total.toLocaleString()}</span>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 flex items-center justify-between border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-lg fill">account_balance_wallet</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-text-secondary dark:text-gray-400 uppercase font-semibold tracking-wide">Metode Pembayaran</span>
                                <span className="text-xs font-bold text-text-main dark:text-white">
                                    {typeof order.paymentMethod === 'string' ? order.paymentMethod : (order.paymentMethod?.name || 'Bantoo Pay')}
                                </span>
                            </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${isCancelled
                            ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30'
                            : 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30'
                            }`}>
                            {isCancelled ? 'Dana Dikembalikan' : 'Lunas'}
                        </span>
                    </div>
                </div>

                {/* Order Timestamp & Actions */}
                <div className="flex flex-col gap-4 mt-2 mb-4">
                    <div className="flex items-center justify-center gap-1.5 text-text-secondary dark:text-gray-400">
                        <span className="material-symbols-outlined text-[14px]">history</span>
                        <span className="text-[11px] font-medium">Dipesan pada {formatDate(order.createdAt)}</span>
                    </div>
                    <div className="flex gap-3 w-full">
                        {isCancelled ? (
                            <>
                                <button
                                    onClick={handleContactSupport}
                                    className="flex-1 py-3 px-2 rounded-xl border border-gray-300 dark:border-gray-600 text-xs font-bold text-text-main dark:text-white flex items-center justify-center gap-2 bg-white dark:bg-card-dark active:scale-95 active:bg-gray-50 transition-all shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-[18px]">support_agent</span>
                                    Hubungi Bantuan
                                </button>
                                <button
                                    onClick={handleReorder}
                                    className="flex-1 py-3 px-2 rounded-xl bg-primary text-xs font-bold text-white flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-[18px]">refresh</span>
                                    Pesan Lagi
                                </button>
                            </>
                        ) : (
                            <>
                                {order.hasReview ? (
                                    <button
                                        disabled
                                        className="flex-1 py-3 px-2 rounded-xl bg-gray-100 text-xs font-bold text-gray-500 flex items-center justify-center gap-2 border border-gray-200"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                        Sudah Diulas
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleReview}
                                        className="flex-1 py-3 px-2 rounded-xl border border-gray-300 dark:border-gray-600 text-xs font-bold text-text-main dark:text-white flex items-center justify-center gap-2 bg-white dark:bg-card-dark active:scale-95 active:bg-gray-50 transition-all shadow-sm"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">rate_review</span>
                                        Beri Ulasan
                                    </button>
                                )}
                                <button
                                    onClick={handleReorder}
                                    className="flex-1 py-3 px-2 rounded-xl bg-primary text-xs font-bold text-white flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-[18px]">refresh</span>
                                    Pesan Lagi
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </main>

            {/* Re-order Toast */}
            {showReorderToast && (
                <div className="fixed bottom-24 left-4 right-4 z-50 animate-slide-up">
                    <div className="bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
                        <span className="material-symbols-outlined">check_circle</span>
                        <span className="text-sm font-medium">Item ditambahkan ke keranjang!</span>
                    </div>
                </div>
            )}

            {/* Bottom Navigation */}
            <BottomNavigation activeTab="orders" />
        </div>
    )
}

export default OrderDetailPage
