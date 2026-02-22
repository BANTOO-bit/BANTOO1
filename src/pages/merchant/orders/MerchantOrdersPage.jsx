import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useNotification } from '../../../context/NotificationsContext'
import orderService from '../../../services/orderService'
import { supabase } from '../../../services/supabaseClient'
import { generateOrderId, formatOrderId } from '../../../utils/orderUtils'
import { showNotification } from '../../../utils/notificationHelper'
import MerchantBottomNavigation from '../../../components/merchant/MerchantBottomNavigation'
import MerchantOrderDetail from '../../../components/merchant/MerchantOrderDetail'
import BackToTopButton from '../../../components/shared/BackToTopButton'
import OrderCardSkeleton from '../../../components/shared/OrderCardSkeleton'
import EmptyState from '../../../components/shared/EmptyState'
import { useToast } from '../../../context/ToastContext'
import { handleError, handleSuccess } from '../../../utils/errorHandler'
import logger from '../../../utils/logger'

function MerchantOrdersPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const { user } = useAuth()
    const toast = useToast()
    const { addNotification } = useNotification()
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'baru')

    // Update activeTab when location state changes (e.g. from Dashboard)
    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab)
        }
    }, [location.state])
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [viewMode, setViewMode] = useState('list') // 'list' | 'detail'
    const [activeModal, setActiveModal] = useState(null) // 'accept' | 'reject' | 'handover' | 'search' | null
    const [prepTime, setPrepTime] = useState(null)
    const [rejectReason, setRejectReason] = useState('')
    const [showSuccess, setShowSuccess] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [actionLoading, setActionLoading] = useState(false) // C1: Double-submit guard

    // Real data from Supabase
    const [orders, setOrders] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    // Fetch orders from Supabase
    // Fetch orders from Supabase
    const fetchOrders = useCallback(async () => {
        if (!user?.merchantId) {
            setIsLoading(false)
            return
        }

        try {
            setIsLoading(true)
            setError(null)

            // Map tab to database status
            const statusMap = {
                'baru': ['pending'],
                'diproses': ['accepted', 'preparing', 'processing', 'ready', 'pickup', 'picked_up', 'delivering'],
                'selesai': ['delivered', 'completed', 'cancelled']
            }

            const data = await orderService.getMerchantOrders(user.merchantId, statusMap[activeTab])

            // Transform data to match component format
            const transformedOrders = data.map(order => ({
                id: generateOrderId(order.id),
                dbId: order.id, // Keep database ID for updates
                time: new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                created_at: order.created_at, // Raw timestamp for timeout countdown
                accepted_at: order.accepted_at,
                prep_time: order.prep_time,
                payment: (order.payment_method === 'cod' || order.payment_method === 'cash') ? 'Tunai (COD)' : order.payment_method,
                status: order.status, // Pass raw status for logic, component handles display text
                total: order.total_amount,
                items: order.items?.map(item => ({
                    qty: item.quantity,
                    name: item.product_name,
                    price: item.price_at_time,
                    note: item.notes,
                    image: item.menu_items?.image_url
                })) || [],
                customer: order.customer ? {
                    name: order.customer.full_name,
                    initials: order.customer.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()
                } : null,
                driver: order.driver ? {
                    name: order.driver.full_name,
                    phone: order.driver.phone
                } : null,
                timeline: {
                    created: new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                    processed: order.accepted_at ? new Date(order.accepted_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : null,
                    handover: order.picked_up_at ? new Date(order.picked_up_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : null,
                    completed: order.delivered_at ? new Date(order.delivered_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : null,
                    cancelled: order.cancelled_at ? new Date(order.cancelled_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : null
                },
                cancellation_reason: order.cancellation_reason
            }))

            setOrders(transformedOrders)
        } catch (err) {
            if (import.meta.env.DEV) console.error('Error fetching merchant orders:', err)
            setError(err.message || 'Gagal memuat pesanan')
        } finally {
            setIsLoading(false)
        }
    }, [activeTab, user?.merchantId])

    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    // H4: Periodically check and auto-cancel expired pending orders
    useEffect(() => {
        // Run immediately on mount
        orderService.checkAndCancelExpiredOrders(orderService.ORDER_TIMEOUT_MINUTES)
            .then(result => {
                if (result?.cancelled_count > 0) {
                    handleSuccess(`${result.cancelled_count} pesanan expired otomatis dibatalkan`, toast)
                    fetchOrders()
                }
            })

        // Then check every 60 seconds
        const interval = setInterval(async () => {
            try {
                const result = await orderService.checkAndCancelExpiredOrders(orderService.ORDER_TIMEOUT_MINUTES)
                if (result?.cancelled_count > 0) {
                    handleSuccess(`${result.cancelled_count} pesanan expired otomatis dibatalkan`, toast)
                    fetchOrders()
                }
            } catch (e) {
                console.warn('Auto-cancel check failed:', e)
            }
        }, 60000)

        return () => clearInterval(interval)
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // Realtime subscription for new orders and status changes
    useEffect(() => {
        if (!user?.merchantId) return

        // Subscribe to orders for this merchant
        const channel = supabase
            .channel(`merchant-orders-${user.merchantId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'orders',
                filter: `merchant_id=eq.${user.merchantId}`
            }, (payload) => {
                logger.debug('New order received:', payload.new)

                // Show notification for new order
                if (payload.new.status === 'pending') {
                    // Play notification sound
                    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
                    audio.play().catch(e => logger.debug('Audio play failed:', e))

                    addNotification({
                        type: 'success',
                        message: `Pesanan baru #${generateOrderId(payload.new.id)} masuk!`,
                        duration: 5000
                    })

                    // Refresh orders if we're on the 'baru' tab
                    if (activeTab === 'baru') {
                        // Fetch orders again to include the new one
                        setTimeout(() => {
                            fetchOrders()
                        }, 500)
                    }
                }
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'orders',
                filter: `merchant_id=eq.${user.merchantId}`
            }, (payload) => {
                logger.debug('Order updated:', payload.new)

                // Refresh current tab if order status changed
                const statusMap = {
                    'pending': 'baru',
                    'accepted': 'diproses',
                    'preparing': 'diproses',
                    'processing': 'diproses',
                    'ready': 'diproses',
                    'pickup': 'diproses',
                    'picked_up': 'diproses',
                    'delivering': 'diproses',
                    'delivered': 'selesai',
                    'completed': 'selesai',
                    'cancelled': 'selesai'
                }

                // Check for cancelled order and alert the merchant
                if (payload.new.status === 'cancelled' && payload.old.status !== 'cancelled') {
                    // Play error/alert sound
                    const alertAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2864/2864-preview.mp3')
                    alertAudio.play().catch(e => logger.debug('Alert audio play failed:', e))

                    // Show visual warning toast notification
                    addNotification({
                        type: 'error',
                        message: `Pesanan #${generateOrderId(payload.new.id)} telah DIBATALKAN. Silakan cek tab Selesai.`,
                        duration: 8000 // Show slightly longer
                    })
                }

                // If order moved to current tab or away from it, refresh
                if (statusMap[payload.new.status] === activeTab ||
                    statusMap[payload.old.status] === activeTab) {
                    setTimeout(() => {
                        fetchOrders()
                    }, 500)
                }
            })
            .subscribe()

        // Cleanup subscription on unmount
        return () => {
            supabase.removeChannel(channel)
        }
    }, [user?.merchantId, activeTab, addNotification])

    // Filter orders based on search query
    const filteredOrders = orders.filter(order => {
        if (!searchQuery) return true
        const query = searchQuery.toLowerCase()
        return (
            order.id.toLowerCase().includes(query) ||
            order.payment.toLowerCase().includes(query) ||
            order.items.some(item => item.name.toLowerCase().includes(query))
        )
    })

    const currentOrders = filteredOrders

    const handleAcceptClick = (order) => {
        setSelectedOrder(order)
        setActiveModal('accept')
        setPrepTime(null)
    }

    const handleRejectClick = (order) => {
        setSelectedOrder(order)
        setActiveModal('reject')
        setRejectReason('')
    }

    const handleHandoverClick = (order) => {
        setSelectedOrder(order)
        setActiveModal('handover')
    }

    const confirmAcceptOrder = async () => {
        if (!prepTime || actionLoading) return // C1: guard
        setActionLoading(true)

        try {
            // Update order status â€” set to 'preparing' so customer sees "Sedang Dimasak"
            await orderService.updateStatus(selectedOrder.dbId, 'preparing', { prep_time: prepTime })

            // Refresh orders
            setOrders(orders.filter(o => o.id !== selectedOrder.id))
            closeModal()
            setShowSuccess(true)

            // Auto-hide success message
            setTimeout(() => setShowSuccess(false), 3000)
        } catch (err) {
            console.error('Error accepting order:', err)
            handleError(err, toast, { context: 'Accept Order' })
        } finally {
            setActionLoading(false)
        }
    }

    const confirmRejectOrder = async () => {
        if (!rejectReason || actionLoading) return // C1: guard
        setActionLoading(true)

        try {
            // H5: Use rejectOrder (adds "Ditolak oleh merchant:" prefix)
            await orderService.rejectOrder(selectedOrder.dbId, rejectReason)

            // Remove from list
            setOrders(orders.filter(o => o.id !== selectedOrder.id))
            closeModal()
            handleSuccess('Pesanan berhasil ditolak', toast)
        } catch (err) {
            console.error('Error rejecting order:', err)
            handleError(err, toast, { context: 'Reject Order' })
        } finally {
            setActionLoading(false)
        }
    }

    const confirmHandover = async () => {
        if (actionLoading) return // C1: guard
        setActionLoading(true)

        try {
            // Update order status to 'ready' (ready for driver pickup)
            await orderService.updateStatus(selectedOrder.dbId, 'ready')

            // Remove from list
            setOrders(orders.filter(o => o.id !== selectedOrder.id))
            setActiveModal(null)
            setShowSuccess(true)

            // Auto-hide success message
            setTimeout(() => setShowSuccess(false), 3000)
        } catch (err) {
            console.error('Error handing over order:', err)
            handleError(err, toast, { context: 'Handover Order' })
        } finally {
            setActionLoading(false)
        }
    }

    const closeModal = () => {
        setActiveModal(null)
        setSelectedOrder(null)
    }

    const handleSearch = () => {
        setActiveModal('search')
    }

    const handleOrderClick = (order) => {
        if (activeTab === 'selesai' || activeTab === 'diproses' || activeTab === 'baru') {
            // For now only 'selesai' has full detail view designed, but we can enable for others if needed
            // The request specifically asked for "detail pesanan untuk riwayat pesanan selesai"
            if (activeTab === 'selesai') {
                setSelectedOrder(order)
                setViewMode('detail')
            }
        }
    }

    if (viewMode === 'detail' && selectedOrder) {
        return (
            <MerchantOrderDetail
                order={selectedOrder}
                onBack={() => {
                    setViewMode('list')
                    setSelectedOrder(null)
                }}
            />
        )
    }

    // Success View
    if (showSuccess) {
        return (
            <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 min-h-screen flex flex-col justify-between items-center p-6 sm:p-8 animate-fade-in">
                <div className="flex-1"></div>
                <main className="w-full flex flex-col items-center text-center max-w-sm">
                    <div className="relative mb-10 group">
                        <div className="absolute inset-0 bg-green-400/20 blur-2xl rounded-full transform scale-150 animate-pulse-slow"></div>
                        <div className="absolute inset-0 bg-green-50 dark:bg-green-900/10 rounded-full scale-[1.6]"></div>
                        <div className="absolute inset-0 bg-green-100 dark:bg-green-900/20 rounded-full scale-[1.3]"></div>
                        <div className="w-32 h-32 relative z-10 bg-white dark:bg-card-dark rounded-full flex items-center justify-center shadow-soft border-4 border-white dark:border-gray-800">
                            <span className="material-symbols-outlined text-[64px] text-green-500 dark:text-green-400 fill" style={{ fontVariationSettings: "'FILL' 1, 'wght' 600" }}>check_circle</span>
                        </div>
                        <div className="absolute -top-4 -right-4 w-3 h-3 bg-orange-400 rounded-full opacity-80 shadow-sm animate-bounce"></div>
                        <div className="absolute top-2 -left-8 w-2 h-2 bg-blue-400 rounded-full opacity-60 animate-ping"></div>
                        <div className="absolute bottom-0 -right-8 w-2.5 h-2.5 bg-green-400 rounded-full opacity-60"></div>
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-2xl sm:text-3xl font-bold text-text-main dark:text-white tracking-tight">
                            Berhasil Diserahkan!
                        </h1>
                        <p className="text-sm sm:text-[15px] text-text-secondary dark:text-gray-400 leading-relaxed max-w-[280px] mx-auto">
                            Pesanan <span className="font-bold text-text-main dark:text-white">#{selectedOrder?.id}</span> sedang dalam perjalanan menuju pelanggan. Pantau status pengiriman di tab Selesai nanti.
                        </p>
                    </div>
                </main>
                <div className="flex-1"></div>
                <div className="w-full max-w-sm mt-8 pb-4">
                    <button
                        onClick={() => {
                            setShowSuccess(false)
                            setSelectedOrder(null)
                            setActiveTab('selesai')
                        }}
                        className="w-full py-4 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-base active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                    >
                        <span>Kembali ke Beranda</span>
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 relative min-h-screen flex flex-col overflow-x-hidden pb-bottom-nav">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 pt-12 pb-4 flex items-center justify-between border-b border-transparent dark:border-gray-800">
                <div className="w-8"></div>
                <h1 className="text-lg font-bold text-text-main dark:text-white leading-tight">Kelola Pesanan</h1>
                <button
                    onClick={handleSearch}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-text-main dark:text-white active:bg-gray-200 dark:active:bg-gray-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-[24px]">search</span>
                </button>
            </header>

            <main className="flex flex-col gap-5 px-4 pt-4">
                {/* Tabs */}
                {/* Tabs */}
                <div className="flex p-1 bg-gray-200/50 dark:bg-card-dark rounded-xl">
                    <button
                        onClick={() => setActiveTab('baru')}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === 'baru'
                            ? 'bg-white dark:bg-gray-700 text-text-main shadow-sm'
                            : 'text-text-secondary hover:bg-white/50 dark:hover:bg-gray-800'
                            }`}
                    >
                        Baru {activeTab === 'baru' ? `(${orders.length})` : ''}
                    </button>
                    <button
                        onClick={() => setActiveTab('diproses')}
                        className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${activeTab === 'diproses'
                            ? 'bg-white dark:bg-gray-700 text-text-main shadow-sm'
                            : 'text-text-secondary hover:bg-white/50 dark:hover:bg-gray-800'
                            }`}
                    >
                        Diproses {activeTab === 'diproses' ? `(${orders.length})` : ''}
                    </button>
                    <button
                        onClick={() => setActiveTab('selesai')}
                        className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${activeTab === 'selesai'
                            ? 'bg-white dark:bg-gray-700 text-text-main shadow-sm'
                            : 'text-text-secondary hover:bg-white/50 dark:hover:bg-gray-800'
                            }`}
                    >
                        Selesai {activeTab === 'selesai' ? `(${orders.length})` : ''}
                    </button>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="py-12 text-center text-text-secondary">
                        <span className="material-symbols-outlined text-5xl mb-2 animate-spin">refresh</span>
                        <p className="text-sm">Memuat pesanan...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="py-12 text-center text-red-500">
                        <span className="material-symbols-outlined text-5xl mb-2">error</span>
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {/* Orders List */}
                <div className="flex flex-col gap-3">
                    {!isLoading && !error && currentOrders.map(order => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            onAccept={() => handleAcceptClick(order)}
                            onReject={() => handleRejectClick(order)}
                            onHandover={() => handleHandoverClick(order)}
                            onClick={() => handleOrderClick(order)}
                            tab={activeTab}
                        />
                    ))}

                    {currentOrders.length === 0 && (
                        <div className="py-12 text-center text-text-secondary">
                            <span className="material-symbols-outlined text-5xl mb-2 opacity-30">receipt_long</span>
                            <p className="text-sm">Tidak ada pesanan di tab ini</p>
                        </div>
                    )}

                    {/* Driver Info Banner - only show on 'baru' tab */}
                    {activeTab === 'baru' && currentOrders.length > 0 && (
                        <section className="mt-2 bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-4 flex items-center gap-3 border border-blue-100 dark:border-blue-800/30">
                            <div className="w-10 h-10 rounded-full bg-white dark:bg-card-dark flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                                <span className="material-symbols-outlined text-[20px]">two_wheeler</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-semibold text-blue-800 dark:text-blue-300">Info Driver</p>
                                <p className="text-[10px] text-blue-600 dark:text-blue-400 leading-tight mt-0.5">Pesanan akan otomatis diteruskan ke driver terdekat setelah siap.</p>
                            </div>
                        </section>
                    )}
                </div>

                <div className="h-8"></div>
            </main>

            <BackToTopButton />
            <MerchantBottomNavigation activeTab="orders" />

            {/* Accept Order Modal (Bottom Sheet) */}
            {activeModal === 'accept' && (
                <>
                    <div className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-[1px]" onClick={closeModal}></div>
                    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-card-dark rounded-t-[24px] p-6 pb-8 z-[70] shadow-[0_-4px_20px_rgba(0,0,0,0.1)] transform transition-transform duration-300 ease-out animate-slide-up">
                        <div className="w-full flex justify-center mb-6">
                            <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        </div>
                        <h2 className="text-lg font-semibold text-text-main dark:text-white text-center mb-6">
                            Berapa lama waktu menyiapkan?
                        </h2>
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {[10, 20, 30, 45].map(time => (
                                <button
                                    key={time}
                                    onClick={() => setPrepTime(time)}
                                    className={`py-3 px-4 rounded-xl border transition-all active:scale-[0.98] flex flex-col items-center justify-center gap-1 group ${prepTime === time
                                        ? 'border-2 border-primary bg-orange-50/50 dark:bg-primary/10 text-primary ring-2 ring-primary/20'
                                        : 'border-border-color dark:border-gray-700 hover:border-primary/50 bg-white dark:bg-gray-800 text-text-main dark:text-white'
                                        }`}
                                >
                                    <span className={`text-base font-bold ${prepTime !== time ? 'group-hover:text-primary' : ''}`}>{time}</span>
                                    <span className={`text-xs ${prepTime === time ? 'font-medium opacity-80' : 'text-text-secondary'}`}>Menit</span>
                                </button>
                            ))}
                        </div>
                        <div className="flex items-start gap-2 mb-6 px-1">
                            <span className="material-symbols-outlined text-text-secondary text-[18px] mt-0.5">info</span>
                            <p className="text-xs text-text-secondary leading-relaxed">
                                Estimasi ini akan diinfokan ke pelanggan dan driver.
                            </p>
                        </div>
                        <button
                            onClick={confirmAcceptOrder}
                            disabled={!prepTime}
                            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center ${prepTime
                                ? 'bg-primary hover:bg-primary-dark active:scale-[0.99] text-white'
                                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            Konfirmasi & Terima
                        </button>
                    </div>
                </>
            )}

            {/* Reject Order Modal (Center Modal) */}
            {activeModal === 'reject' && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center px-4" role="dialog">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity" onClick={closeModal}></div>
                    <div className="relative w-full max-w-sm bg-white dark:bg-card-dark rounded-[24px] p-6 shadow-2xl flex flex-col gap-6 animate-fade-in">
                        <div className="flex flex-col gap-2 text-center">
                            <h2 className="text-lg font-semibold text-text-main dark:text-white">Tolak Pesanan ini?</h2>
                            <p className="text-sm text-text-secondary leading-relaxed px-2">
                                Pilih alasan pembatalan agar kami dapat menginformasikan kepada pelanggan.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3">
                            {['Stok menu habis', 'Warung terlalu ramai', 'Toko hampir tutup', 'Alasan lainnya'].map((reason, idx) => (
                                <label key={idx} className="group flex items-center gap-3 p-3 rounded-xl border border-border-color dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-[0.99]">
                                    <input
                                        type="radio"
                                        name="reject_reason"
                                        className="w-5 h-5 text-primary border-gray-300 dark:border-gray-600 focus:ring-primary focus:ring-offset-0 bg-transparent"
                                        checked={rejectReason === reason}
                                        onChange={() => setRejectReason(reason)}
                                    />
                                    <span className="text-sm font-medium text-text-main dark:text-gray-200 group-hover:text-primary dark:group-hover:text-primary-dark transition-colors">
                                        {reason}
                                    </span>
                                </label>
                            ))}
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={closeModal}
                                className="flex-1 py-3.5 rounded-xl border border-gray-300 dark:border-gray-600 text-text-secondary font-semibold text-sm active:bg-gray-50 dark:active:bg-gray-800 transition-colors"
                            >
                                Kembali
                            </button>
                            <button
                                onClick={confirmRejectOrder}
                                disabled={!rejectReason}
                                className={`flex-1 py-3.5 rounded-xl font-bold text-sm active:scale-95 transition-all ${rejectReason
                                    ? 'bg-primary hover:bg-primary-dark text-white'
                                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                Tolak Pesanan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Handover Modal (Center Modal) */}
            {activeModal === 'handover' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" role="dialog">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>
                    <div className="relative bg-white dark:bg-card-dark w-full max-w-[340px] rounded-[24px] p-6 shadow-2xl flex flex-col gap-6 transform transition-all scale-100 animate-fade-in">
                        <div className="text-center flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-primary mb-1">
                                <span className="material-symbols-outlined text-[28px] fill" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>
                                    {selectedOrder?.driver ? 'inventory_2' : 'soup_kitchen'}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-text-main dark:text-white">
                                {selectedOrder?.driver ? 'Serahkan ke Driver?' : 'Pesanan Sudah Siap?'}
                            </h3>
                            <p className="text-sm text-text-secondary dark:text-gray-400 leading-relaxed px-2">
                                {selectedOrder?.driver
                                    ? <>Pastikan nomor pesanan <span className="font-bold text-text-main dark:text-white">#{selectedOrder?.id}</span> sesuai dengan aplikasi Driver.</>
                                    : 'Pesanan akan ditandai siap dan sistem akan mencarikan driver.'
                                }
                            </p>
                        </div>
                        <div className="bg-background-light dark:bg-black/20 border border-border-color dark:border-gray-700 rounded-2xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                    <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">person</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Driver</span>
                                    <span className="text-sm font-bold text-text-main dark:text-white">{selectedOrder?.driver?.name || 'Menunggu Driver'}</span>
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-600 dark:text-green-400">
                                <span className="material-symbols-outlined text-[20px] font-bold">check</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 mt-1">
                            <button
                                onClick={confirmHandover}
                                className="w-full py-3.5 rounded-xl bg-primary hover:bg-blue-700 text-white font-bold text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <span>Konfirmasi Penyerahan</span>
                            </button>
                            <button
                                onClick={closeModal}
                                className="w-full py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 text-text-main dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-[0.98] transition-all"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Search Modal */}
            {activeModal === 'search' && (
                <div className="fixed inset-0 z-[60] flex items-start justify-center pt-20 px-4" role="dialog">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => {
                        setActiveModal(null)
                        setSearchQuery('')
                    }}></div>
                    <div className="relative bg-white dark:bg-card-dark w-full max-w-md rounded-[24px] shadow-2xl flex flex-col animate-fade-in">
                        {/* Search Header */}
                        <div className="p-4 border-b border-border-color dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => {
                                        setActiveModal(null)
                                        setSearchQuery('')
                                    }}
                                    className="text-text-secondary hover:text-text-main dark:hover:text-white transition-colors"
                                >
                                    <span className="material-symbols-outlined">arrow_back</span>
                                </button>
                                <div className="flex-1 flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2">
                                    <span className="material-symbols-outlined text-text-secondary text-[20px]">search</span>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Cari ID, menu, atau metode bayar..."
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-text-main dark:text-white placeholder:text-text-secondary p-0"
                                        autoFocus
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="text-text-secondary hover:text-text-main dark:hover:text-white"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">close</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Search Results */}
                        <div className="max-h-[60vh] overflow-y-auto p-4">
                            {searchQuery ? (
                                currentOrders.length > 0 ? (
                                    <div className="space-y-3">
                                        <p className="text-xs text-text-secondary mb-3">
                                            Ditemukan {currentOrders.length} hasil
                                        </p>
                                        {currentOrders.map(order => (
                                            <div
                                                key={order.id}
                                                onClick={() => {
                                                    setActiveModal(null)
                                                    setSearchQuery('')
                                                    handleOrderClick(order)
                                                }}
                                                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-sm font-bold text-text-main dark:text-white">#{order.id}</span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-md ${order.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                                        ['accepted', 'preparing', 'processing', 'ready', 'pickup', 'picked_up', 'delivering'].includes(order.status) ? 'bg-blue-100 text-blue-700' :
                                                            order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                                'bg-green-100 text-green-700'
                                                        }`}>
                                                        {order.status === 'pending' ? 'Baru' :
                                                            order.status === 'accepted' ? 'Diproses' :
                                                                order.status === 'preparing' || order.status === 'processing' ? 'Dimasak' :
                                                                    order.status === 'ready' ? 'Siap' :
                                                                        order.status === 'pickup' ? 'Driver' :
                                                                            order.status === 'picked_up' ? 'Diantar' :
                                                                                order.status === 'cancelled' ? 'Batal' :
                                                                                    'Selesai'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-text-secondary">
                                                    {order.items.map(item => item.name).join(', ')}
                                                </p>
                                                <div className="flex justify-between items-center mt-2">
                                                    <span className="text-xs text-text-secondary">{order.payment}</span>
                                                    <span className="text-sm font-bold text-text-main dark:text-white">
                                                        Rp {order.total.toLocaleString('id-ID')}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <span className="material-symbols-outlined text-5xl text-gray-300 mb-2">search_off</span>
                                        <p className="text-sm text-text-secondary">Tidak ada hasil untuk "{searchQuery}"</p>
                                    </div>
                                )
                            ) : (
                                <div className="text-center py-12">
                                    <span className="material-symbols-outlined text-5xl text-gray-300 mb-2">search</span>
                                    <p className="text-sm text-text-secondary">Mulai ketik untuk mencari pesanan</p>
                                    <p className="text-xs text-text-secondary mt-1">Cari berdasarkan ID, nama menu, atau metode pembayaran</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function OrderCard({ order, onAccept, onReject, onHandover, onClick, tab }) {
    const isDigitalPayment = order.payment !== 'Tunai'
    const isDiproses = tab === 'diproses'
    const isSelesai = tab === 'selesai'
    const isBaru = tab === 'baru'

    // Internal timer state for diproses orders
    const [timeLeftStr, setTimeLeftStr] = useState('00:00')
    const [isLate, setIsLate] = useState(false)

    useEffect(() => {
        if (!isDiproses || !order.accepted_at || !order.prep_time || (order.status !== 'preparing' && order.status !== 'processing')) return

        const calculateTimeLeft = () => {
            const acceptedTime = new Date(order.accepted_at).getTime()
            const targetTime = acceptedTime + (order.prep_time * 60 * 1000)
            const now = new Date().getTime()
            const diff = targetTime - now

            if (diff <= 0) {
                setIsLate(true)
                const overMatch = Math.abs(diff)
                const m = Math.floor((overMatch % (1000 * 60 * 60)) / (1000 * 60))
                const s = Math.floor((overMatch % (1000 * 60)) / 1000)
                return `-${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
            }

            setIsLate(false)
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)

            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        }

        setTimeLeftStr(calculateTimeLeft())

        const interval = setInterval(() => {
            setTimeLeftStr(calculateTimeLeft())
        }, 1000)

        return () => clearInterval(interval)
    }, [isDiproses, order.accepted_at, order.prep_time, order.status])

    const timerDisplay = order.timer || timeLeftStr

    return (
        <article
            onClick={isSelesai ? onClick : undefined}
            className={`bg-card-light dark:bg-card-dark rounded-2xl shadow-soft border border-border-color dark:border-gray-700 p-4 flex flex-col gap-3 ${isSelesai ? 'cursor-pointer active:scale-[0.99] transition-transform' : ''}`}
        >
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-text-main dark:text-white">Order #{order.id}</span>
                    <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] text-text-secondary">{order.time}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span className={`text-[10px] font-medium ${isDigitalPayment ? 'text-blue-600 dark:text-blue-400' : 'text-text-main dark:text-gray-300'}`}>
                            {order.payment}
                        </span>
                    </div>
                </div>
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${order.status === 'pending' ? 'bg-orange-50 dark:bg-orange-900/20 text-primary dark:text-orange-300 border-orange-100 dark:border-orange-800/30' :
                    ['accepted', 'preparing', 'processing', 'ready', 'pickup', 'picked_up', 'delivering'].includes(order.status) ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 border-blue-100 dark:border-blue-800/30' :
                        order.status === 'cancelled' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 border-red-100 dark:border-red-800/30' :
                            'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300 border-green-100 dark:border-green-800/30'
                    }`}>
                    {order.status === 'pending' ? 'Baru' :
                        order.status === 'accepted' ? 'Sedang Disiapkan' :
                            (order.status === 'preparing' || order.status === 'processing') ? 'Sedang Dimasak' :
                                order.status === 'ready' ? 'Menunggu Driver' :
                                    order.status === 'pickup' ? 'Driver Menuju Resto' :
                                        order.status === 'picked_up' ? 'Sedang Diantar' :
                                            order.status === 'delivering' ? 'Sedang Diantar' :
                                                order.status === 'delivered' ? 'Terkirim' :
                                                    order.status === 'cancelled' ? 'Dibatalkan' :
                                                        'Selesai'}
                </span>
            </div>

            {/* H4: Timeout countdown for pending orders */}
            {isBaru && order.status === 'pending' && order.created_at && (
                <TimeoutBadge createdAt={order.created_at} timeoutMinutes={orderService.ORDER_TIMEOUT_MINUTES} />
            )}

            {/* Timer for Diproses */}
            {isDiproses && (order.status === 'preparing' || order.status === 'processing') && (
                <div className={`flex items-center gap-1.5 ${isLate ? 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/30' : 'text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800/30'} px-3 py-1.5 rounded-lg border w-full sm:w-fit`}>
                    <span className="material-symbols-outlined text-[18px]">timer</span>
                    <span className="text-xs font-medium">Waktu tersisa: <span className="font-bold tabular-nums">{timerDisplay}</span></span>
                </div>
            )}

            <div className="h-px bg-border-color dark:bg-gray-800 w-full"></div>

            {/* Items */}
            <div className="flex flex-col gap-3">
                {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start text-sm">
                        <div className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-[10px] font-bold text-primary border border-orange-100 dark:border-orange-800/30 shrink-0">
                                {item.qty}x
                            </span>
                            <div className="flex flex-col">
                                <span className="text-text-main dark:text-white font-medium text-xs leading-relaxed">{item.name}</span>
                                {item.note && (
                                    <div className="mt-1 flex items-start gap-1">
                                        <span className="material-symbols-outlined text-[12px] text-text-secondary">edit_note</span>
                                        <p className="text-[10px] text-text-secondary italic leading-tight">"{item.note}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <span className="text-text-main dark:text-white font-semibold text-xs whitespace-nowrap">
                            Rp {item.price.toLocaleString('id-ID')}
                        </span>
                    </div>
                ))}
            </div>

            <div className="h-px bg-border-color dark:bg-gray-800 w-full"></div>

            {/* Footer */}
            <div className={`flex justify-between items-center pt-1 ${isDiproses ? 'gap-4' : ''}`}>
                <div className="flex flex-col shrink-0">
                    <span className="text-[10px] text-text-secondary">Total Harga</span>
                    <p className="text-base font-bold text-text-main dark:text-white">Rp {order.total.toLocaleString('id-ID')}</p>
                </div>
                {tab === 'baru' && (
                    <div className="flex gap-2.5">
                        <button
                            onClick={onReject}
                            className="px-5 py-2.5 rounded-xl border border-primary text-primary font-semibold text-xs active:bg-orange-50 transition-colors"
                        >
                            Tolak
                        </button>
                        <button
                            onClick={onAccept}
                            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs active:scale-95 transition-transform"
                        >
                            Terima
                        </button>
                    </div>
                )}
                {isDiproses && (
                    <>
                        {['accepted', 'preparing', 'processing'].includes(order.status) && (
                            <button
                                onClick={onHandover}
                                className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2"
                            >
                                <span>Siap Antar</span>
                            </button>
                        )}
                        {order.status === 'ready' && (
                            <div className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-text-secondary font-bold text-sm flex items-center justify-center gap-2 cursor-default">
                                <span className="material-symbols-outlined text-[18px]">hourglass_top</span>
                                <span>Menunggu Driver</span>
                            </div>
                        )}
                        {order.status === 'pickup' && (
                            <div className="flex-1 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold text-sm flex items-center justify-center gap-2 cursor-default border border-blue-100 dark:border-blue-800/30">
                                <span className="material-symbols-outlined text-[18px]">person_pin_circle</span>
                                <span>Driver Menuju Resto</span>
                            </div>
                        )}
                        {['picked_up', 'delivering'].includes(order.status) && (
                            <div className="flex-1 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 font-bold text-sm flex items-center justify-center gap-2 cursor-default border border-green-100 dark:border-green-800/30">
                                <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                                <span>Sedang Diantar</span>
                            </div>
                        )}
                    </>
                )}
                {isSelesai && (
                    <div className={`flex items-center gap-1 ${order.status === 'cancelled' ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
                        <span className="material-symbols-outlined text-[18px]">{order.status === 'cancelled' ? 'cancel' : 'check_circle'}</span>
                        <span className="text-xs font-bold">{order.status === 'cancelled' ? 'Dibatalkan' : 'Selesai'}</span>
                    </div>
                )}
            </div>
        </article>
    )
}

// H4: Live countdown badge for pending orders
function TimeoutBadge({ createdAt, timeoutMinutes }) {
    const [remaining, setRemaining] = useState('')
    const [isUrgent, setIsUrgent] = useState(false)

    useEffect(() => {
        const update = () => {
            const elapsed = Date.now() - new Date(createdAt).getTime()
            const totalMs = timeoutMinutes * 60 * 1000
            const left = totalMs - elapsed

            if (left <= 0) {
                setRemaining('00:00')
                setIsUrgent(true)
                return
            }

            const mins = Math.floor(left / 60000)
            const secs = Math.floor((left % 60000) / 1000)
            setRemaining(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`)
            setIsUrgent(left < 3 * 60 * 1000) // Urgent when < 3 min
        }

        update()
        const interval = setInterval(update, 1000)
        return () => clearInterval(interval)
    }, [createdAt, timeoutMinutes])

    return (
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border w-full sm:w-fit transition-colors ${isUrgent
            ? 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/30'
            : 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/30'
            }`}>
            <span className={`material-symbols-outlined text-[18px] ${isUrgent ? 'animate-pulse' : ''}`}>hourglass_top</span>
            <span className="text-xs font-medium">
                Batas respons: <span className="font-bold tabular-nums">{remaining}</span>
            </span>
        </div>
    )
}

export default MerchantOrdersPage
