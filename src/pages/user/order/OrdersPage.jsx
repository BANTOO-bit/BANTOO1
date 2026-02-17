import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useCart } from '../../../context/CartContext'
import { useOrder } from '../../../context/OrderContext'
import orderService from '../../../services/orderService'
import merchantService from '../../../services/merchantService'
import { formatOrderId, generateOrderId } from '../../../utils/orderUtils'
import BottomNavigation from '../../../components/user/BottomNavigation'
import ActiveOrderCard from '../../../components/user/ActiveOrderCard'
import OrderHistoryCard from '../../../components/user/OrderHistoryCard'
import OrderCardSkeleton from '../../../components/shared/OrderCardSkeleton'
import LoadingState from '../../../components/shared/LoadingState'
import ErrorState from '../../../components/shared/ErrorState'
import EmptyState from '../../../components/shared/EmptyState'
import { useToast } from '../../../context/ToastContext'
import { handleError } from '../../../utils/errorHandler'

import ConfirmationModal from '../../../components/shared/ConfirmationModal'

function OrdersPage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const toast = useToast()
    const { addToCart, setMerchantInfo, clearCart, cartItems } = useCart()
    const [activeTab, setActiveTab] = useState('aktif')
    const [activeOrders, setActiveOrders] = useState([])
    const [orderHistory, setOrderHistory] = useState([])
    const [showReorderToast, setShowReorderToast] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    // Modal State
    const [cancelModalOpen, setCancelModalOpen] = useState(false)
    const [selectedOrderToCancel, setSelectedOrderToCancel] = useState(null)
    const [isCancelling, setIsCancelling] = useState(false)

    // Load orders from Supabase
    useEffect(() => {
        loadOrders()
    }, [user?.id])

    const loadOrders = async () => {
        if (!user?.id) {
            setIsLoading(false)
            return
        }

        try {
            setIsLoading(true)
            setError(null)

            // Fetch all customer orders
            const allOrders = await orderService.getCustomerOrders()

            // Transform and separate active and completed orders
            const transformedOrders = allOrders.map(order => ({
                id: generateOrderId(order.id),
                dbId: order.id,
                merchantName: order.merchant?.name || 'Merchant',
                merchantId: order.merchant_id,
                merchantImage: order.merchant?.image_url,
                status: order.status,
                totalAmount: order.total_amount,
                paymentMethod: order.payment_method,
                createdAt: order.created_at,
                items: order.items?.map(item => ({
                    id: item.product_id,
                    name: item.product_name,
                    quantity: item.quantity,
                    price: item.price_at_time,
                    image: item.product?.image_url,
                    notes: item.notes
                })) || []
            }))

            // Separate active and completed orders
            const active = transformedOrders.filter(o =>
                o.status === 'pending' ||
                o.status === 'accepted' ||
                o.status === 'ready' ||
                o.status === 'picked_up'
            )
            const history = transformedOrders.filter(o =>
                o.status === 'delivered' ||
                o.status === 'completed' ||
                o.status === 'cancelled'
            )

            setActiveOrders(active)
            setOrderHistory(history)
        } catch (err) {
            console.error('Error loading orders:', err)
            setError(err.message || 'Gagal memuat pesanan')
        } finally {
            setIsLoading(false)
        }
    }

    const handleTrack = (order) => {
        navigate(`/tracking/${order.dbId}`)
    }

    const handleCancelClick = (order) => {
        setSelectedOrderToCancel(order)
        setCancelModalOpen(true)
    }

    const handleConfirmCancel = async () => {
        if (!selectedOrderToCancel) return

        try {
            setIsCancelling(true)
            // Cancel order via API
            await orderService.cancelOrder(selectedOrderToCancel.dbId, 'Dibatalkan oleh pelanggan')

            // Reload orders
            await loadOrders()
            toast.success('Pesanan berhasil dibatalkan')
            setCancelModalOpen(false)
            setSelectedOrderToCancel(null)
        } catch (err) {
            console.error('Error cancelling order:', err)
            handleError(err, toast, { context: 'Cancel Order' })
        } finally {
            setIsCancelling(false)
        }
    }

    const handleReview = (order) => {
        navigate(`/ review / ${order.dbId} `)
    }

    const handleViewDetail = (order) => {
        navigate(`/ order - detail / ${order.dbId} `)
    }

    const handleReorder = (order) => {
        // Clear existing cart and add items from previous order
        clearCart()

        // Set merchant info if available
        if (order.merchantName) {
            setMerchantInfo({
                name: order.merchantName,
                id: order.merchantId || Date.now()
            })
        }

        // Add all items from the order to cart
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

        // Show success toast
        setShowReorderToast(true)
        setTimeout(() => {
            setShowReorderToast(false)
            navigate('/cart')
        }, 1500)
    }

    const formatDate = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    // Get merchant image from data or use default
    const getMerchantImage = (order) => {
        // Use order's merchant image if available
        if (order.merchantImage) return order.merchantImage
        // Default image
        return 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop'
    }

    return (
        <div className="relative min-h-screen flex flex-col overflow-x-hidden pb-[100px] bg-background-light dark:bg-background-dark">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-card-light dark:bg-card-dark px-4 pt-12 pb-4 border-b border-border-color dark:border-gray-800">
                <div className="relative flex items-center justify-center min-h-[40px]">
                    <h1 className="text-lg font-bold">Pesanan Saya</h1>
                    {/* Cart Button */}
                    <button
                        onClick={() => navigate('/cart')}
                        className="absolute right-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800 text-primary active:scale-95 transition-transform z-10"
                    >
                        <span className="material-symbols-outlined">shopping_cart</span>
                        {cartItems.reduce((sum, item) => sum + item.quantity, 0) > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                {cartItems.reduce((sum, item) => sum + item.quantity, 0) > 9 ? '9+' : cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                            </span>
                        )}
                    </button>
                </div>

                {/* Pill Tabs */}
                <div className="flex mt-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('aktif')}
                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'aktif'
                            ? 'bg-primary text-white shadow-md'
                            : 'text-text-secondary dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                            }`}
                    >
                        Aktif
                    </button>
                    <button
                        onClick={() => setActiveTab('riwayat')}
                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'riwayat'
                            ? 'bg-primary text-white shadow-md'
                            : 'text-text-secondary dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                            }`}
                    >
                        Riwayat
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex flex-col gap-4 p-4">
                {isLoading ? (
                    /* Loading Skeleton */
                    <div className="flex flex-col gap-3">
                        {[1, 2, 3].map(i => <OrderCardSkeleton key={i} />)}
                    </div>
                ) : error ? (
                    /* Error State */
                    <div className="flex flex-col items-center py-12">
                        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-4xl text-red-500">error</span>
                        </div>
                        <h3 className="font-bold text-text-main dark:text-white mb-1">Gagal Memuat Pesanan</h3>
                        <p className="text-sm text-text-secondary dark:text-gray-400 text-center mb-4">{error}</p>
                        <button
                            onClick={loadOrders}
                            className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-md active:scale-95 transition-transform"
                        >
                            Coba Lagi
                        </button>
                    </div>
                ) : activeTab === 'aktif' ? (
                    <>
                        {/* Active Orders */}
                        {activeOrders.length === 0 ? (
                            <div className="flex flex-col items-center py-12">
                                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-4xl text-gray-400">receipt_long</span>
                                </div>
                                <h3 className="font-bold text-text-main dark:text-white mb-1">Belum Ada Pesanan Aktif</h3>
                                <p className="text-sm text-text-secondary dark:text-gray-400 text-center mb-4">Pesanan yang sedang diproses akan muncul di sini</p>
                                <button
                                    onClick={() => navigate('/')}
                                    className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-md active:scale-95 transition-transform"
                                >
                                    Pesan Sekarang
                                </button>
                            </div>
                        ) : (
                            activeOrders.map(order => (
                                <ActiveOrderCard
                                    key={order.id}
                                    order={order}
                                    onTrack={handleTrack}
                                    onCancel={handleCancelClick}
                                />
                            ))
                        )}
                    </>
                ) : (
                    /* Riwayat Tab */
                    orderHistory.length === 0 ? (
                        <div className="flex flex-col items-center py-12">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-4xl text-gray-400">history</span>
                            </div>
                            <h3 className="font-bold text-text-main dark:text-white mb-1">Belum Ada Riwayat</h3>
                            <p className="text-sm text-text-secondary dark:text-gray-400 text-center">Pesanan yang sudah selesai akan muncul di sini</p>
                        </div>
                    ) : (
                        orderHistory.map(order => (
                            <OrderHistoryCard
                                key={order.id}
                                order={order}
                                onReview={handleReview}
                                onReorder={handleReorder}
                                onViewDetail={handleViewDetail}
                                formatDate={formatDate}
                                getMerchantImage={getMerchantImage}
                            />
                        ))
                    )
                )}
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

            {/* Bottom Navigation */}
            <BottomNavigation activeTab="orders" />
        </div>
    )
}

export default OrdersPage
