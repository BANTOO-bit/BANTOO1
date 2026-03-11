import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { useMerchantShop } from '@/hooks/useMerchantShop'
import dashboardService from '@/services/dashboardService'
import merchantService from '@/services/merchantService'
import orderService from '@/services/orderService'
import { useRealtime } from '@/hooks/useRealtime'
import MerchantHeader from '@/features/merchant/components/MerchantHeader'
import MerchantBottomNavigation from '@/features/merchant/components/MerchantBottomNavigation'
import { generateOrderId } from '@/utils/orderUtils'

import useWhatsAppSupport from '@/hooks/useWhatsAppSupport'

function MerchantDashboard() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { isShopOpen } = useMerchantShop()
    const toast = useToast()
    const [activeTab, setActiveTab] = useState('baru') // baru, diproses, selesai
    const [rejectModalOpen, setRejectModalOpen] = useState(false)
    const [rejectReason, setRejectReason] = useState('')
    const [customRejectReason, setCustomRejectReason] = useState('')
    const [rejectOrderId, setRejectOrderId] = useState(null)
    const [rejectLoading, setRejectLoading] = useState(false)
    const [merchantStatus, setMerchantStatus] = useState('approved')
    const [availableDriversCount, setAvailableDriversCount] = useState(0)
    const [stats, setStats] = useState({
        todayEarnings: 0,
        totalOrders: 0,
        newOrders: 0,
        loading: true
    })
    const [recentOrders, setRecentOrders] = useState([])
    const { waNumber: whatsappSupport, waLink } = useWhatsAppSupport()

    useEffect(() => {
        async function fetchMerchantStatus() {
            if (!user?.merchantId) return
            try {
                const status = await merchantService.getMerchantStatus(user.merchantId)
                setMerchantStatus(status)
            } catch (err) {
                if (import.meta.env.DEV) console.error('Error fetching merchant status:', err)
            }
        }

        async function fetchData() {
            if (!user?.merchantId) return

            try {
                // Fetch Stats
                const statsData = await dashboardService.getMerchantStats(user.merchantId)
                setStats({
                    ...statsData,
                    loading: false
                })

                // Fetch Available Drivers
                const driversCount = await merchantService.getAvailableDriversCount()
                setAvailableDriversCount(driversCount)

                // Fetch Pending Orders for 'Baru' tab
                const ordersData = await orderService.getMerchantOrders(user.merchantId, ['pending'])

                // Transform data for OrderCard
                const transformedOrders = ordersData.map(order => ({
                    id: generateOrderId(order.order_number ? order : order.id),
                    orderId: order.id, // real UUID for API calls
                    time: new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                    payment: order.payment_method === 'cod' ? 'Tunai' : order.payment_method,
                    status: 'Baru',
                    total: `Rp ${order.total_amount.toLocaleString('id-ID')}`,
                    items: order.items?.map(item => ({
                        qty: item.quantity,
                        name: item.product_name,
                        price: `Rp ${item.price_at_time.toLocaleString('id-ID')}`,
                        note: item.notes
                    })) || []
                }))

                setRecentOrders(transformedOrders)

            } catch (error) {
                if (import.meta.env.DEV) console.error('Error fetching merchant dashboard data:', error)
                setStats(prev => ({ ...prev, loading: false }))
            }
        }

        fetchMerchantStatus()
        fetchData()
        // Refresh data every 30 seconds
        const interval = setInterval(fetchData, 30000)

        // Merchant heartbeat — keep merchant marked as online (every 60s)
        if (user?.merchantId) {
            orderService.merchantHeartbeat(user.merchantId).catch(() => { })
            const heartbeatInterval = setInterval(() => {
                orderService.merchantHeartbeat(user.merchantId).catch(() => { })
            }, 60000)
            return () => { clearInterval(interval); clearInterval(heartbeatInterval) }
        }

        return () => {
            clearInterval(interval)
        }
    }, [user?.merchantId])

    // Realtime subscription for driver status changes
    useRealtime('driver-status-merchant-dash', {
        table: 'drivers',
        event: 'UPDATE',
    }, () => {
        merchantService.getAvailableDriversCount().then(setAvailableDriversCount)
    }, !!user?.merchantId)

    // Blocked screens for suspended/terminated merchants
    if (merchantStatus === 'suspended' || merchantStatus === 'terminated') {
        const isTerminated = merchantStatus === 'terminated'
        return (
            <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 relative min-h-screen flex flex-col overflow-x-hidden">
                <MerchantHeader />
                <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
                    <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 relative ${isTerminated ? 'bg-red-50' : 'bg-yellow-50'}`}>
                        {!isTerminated && <div className="absolute inset-0 bg-yellow-100 rounded-full animate-pulse" />}
                        <span className={`material-symbols-outlined text-7xl z-10 ${isTerminated ? 'text-red-500' : 'text-yellow-500'}`}>
                            {isTerminated ? 'cancel' : 'pause_circle'}
                        </span>
                    </div>
                    <h2 className="text-2xl font-bold text-text-main dark:text-white mb-3">
                        {isTerminated ? 'Kemitraan Diputus' : 'Warung Disuspend'}
                    </h2>
                    <p className="text-sm text-text-secondary leading-relaxed max-w-xs mx-auto mb-8">
                        {isTerminated
                            ? 'Kemitraan warung Anda dengan platform telah diputus secara permanen. Silakan hubungi admin untuk informasi lebih lanjut.'
                            : 'Warung Anda sedang dalam penangguhan sementara. Anda tidak dapat menerima pesanan saat ini. Silakan hubungi tim Admin untuk bantuan.'
                        }
                    </p>
                    <button
                        onClick={() => window.open('mailto:support@bantoo.app', '_blank')}
                        className="w-full max-w-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-xl text-white">support_agent</span>
                        Hubungi Pusat Bantuan
                    </button>
                </main>
            </div>
        )
    }

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 relative min-h-screen flex flex-col overflow-x-hidden pb-bottom-nav">
            <MerchantHeader />

            <main className="flex flex-col gap-6 px-4 pt-2">
                {/* Offline Status Banner / Toggle Button */}
                <div className={`p-4 rounded-xl shadow-sm flex items-start gap-3 animate-fade-in border ${isShopOpen ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/30' : 'bg-gray-100 dark:bg-gray-800 border-l-4 border-gray-500 text-gray-700 dark:text-gray-300'}`}>
                    <span className={`material-symbols-outlined mt-0.5 ${isShopOpen ? 'text-green-600 dark:text-green-500' : 'text-gray-500'}`}>
                        {isShopOpen ? 'storefront' : 'store_closed'}
                    </span>
                    <div className="flex-1">
                        <p className={`font-bold text-sm ${isShopOpen ? 'text-green-800 dark:text-green-400' : ''}`}>
                            {isShopOpen ? 'Warung Buka (Online)' : 'Warung Tutup (Offline)'}
                        </p>
                        <p className={`text-xs mt-0.5 ${isShopOpen ? 'text-green-700 dark:text-green-500' : ''}`}>
                            {isShopOpen ? 'Warung Anda siap menerima pesanan masuk.' : 'Anda tidak akan menerima pesanan baru. Gunakan waktu ini untuk rehat.'}
                        </p>
                    </div>
                    <button 
                        onClick={async () => {
                            try {
                                await toggleShopStatus()
                                if (!isShopOpen) {
                                    toast.success('Warung berhasil BUKA')
                                } else {
                                    toast.success('Warung berhasil TUTUP')
                                }
                            } catch (err) {
                                // Akan ditangkap otomatis dari errorHandler.js (lewat useMerchantShop/orderService)
                                toast.error(err)
                            }
                        }}
                        className={`shrink-0 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${isShopOpen ? 'bg-red-100 hover:bg-red-200 text-red-700' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                    >
                        {isShopOpen ? 'TUTUP WARUNG' : 'BUKA WARUNG'}
                    </button>
                </div>
                {/* Stats Section */}
                <section className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => navigate('/merchant/today-earnings')}
                        className="bg-white dark:bg-card-dark p-4 rounded-2xl shadow-soft border border-border-color dark:border-gray-700 flex flex-col justify-between h-[100px] hover:border-primary dark:hover:border-primary transition-colors cursor-pointer active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-2 text-text-secondary">
                            <span className="material-symbols-outlined text-[20px] text-primary">payments</span>
                            <span className="text-xs font-medium">Pendapatan</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text-main dark:text-white">
                                {stats.loading ? 'Loading...' : `Rp ${((stats.todayGrossEarnings || 0) / 1000).toFixed(0)}k`}
                            </h2>
                            <p className="text-[10px] text-text-secondary font-medium">Kotor Hari Ini</p>
                        </div>
                    </button>
                    <button
                        onClick={() => navigate('/merchant/total-orders')}
                        className="bg-white dark:bg-card-dark p-4 rounded-2xl shadow-soft border border-border-color dark:border-gray-700 flex flex-col justify-between h-[100px] hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-2 text-text-secondary">
                            <span className="material-symbols-outlined text-[20px] text-blue-500">receipt_long</span>
                            <span className="text-xs font-medium">Pesanan</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text-main dark:text-white">
                                {stats.loading ? 'Loading...' : `${stats.totalOrders} Order`}
                            </h2>
                            <p className="text-[10px] text-text-secondary font-medium">Hari ini</p>
                        </div>
                    </button>
                </section>

                <section>
                    <h3 className="text-sm font-semibold text-text-main dark:text-white mb-3">Kelola Warung</h3>
                    <div className="grid grid-cols-4 gap-3">
                        <ActionButton icon="restaurant_menu" label="Kelola Menu" color="orange" onClick={() => navigate('/merchant/menu')} />
                        <ActionButton icon="bar_chart" label="Laporan Penjualan" color="blue" onClick={() => navigate('/merchant/sales-report')} />
                        <ActionButton icon="schedule" label="Jam Operasional" color="purple" onClick={() => navigate('/merchant/profile/hours')} />
                        <ActionButton icon="account_balance_wallet" label="Saldo Saya" color="green" onClick={() => navigate('/merchant/balance')} />
                    </div>
                </section>

                {/* Active Orders */}
                <section className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-text-main dark:text-white">Pesanan Aktif</h3>
                        <button
                            onClick={() => navigate('/merchant/orders', { state: { activeTab: 'selesai' } })}
                            className="text-xs font-medium text-primary"
                        >
                            Riwayat
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex p-1 bg-gray-100 dark:bg-card-dark rounded-xl">
                        <TabButton
                            active={activeTab === 'baru'}
                            onClick={() => setActiveTab('baru')}
                            label={`Baru (${recentOrders.length})`}
                        />
                        <TabButton
                            active={activeTab === 'diproses'}
                            onClick={() => {
                                setActiveTab('diproses')
                                navigate('/merchant/orders', { state: { activeTab: 'diproses' } })
                            }}
                            label="Diproses"
                        />
                        <TabButton
                            active={activeTab === 'selesai'}
                            onClick={() => {
                                setActiveTab('selesai')
                                navigate('/merchant/orders', { state: { activeTab: 'selesai' } })
                            }}
                            label="Selesai"
                        />
                    </div>

                    {/* Order List */}
                    <div className="flex flex-col gap-4">
                        {activeTab === 'baru' && (
                            <>
                                {recentOrders.length > 0 ? (
                                    recentOrders.map(order => (
                                        <OrderCard
                                            key={order.orderId}
                                            {...order}
                                            onAccept={async () => {
                                                try {
                                                    await orderService.updateStatus(order.orderId, 'accepted')
                                                    toast.success('Pesanan diterima!')
                                                    setRecentOrders(prev => prev.filter(o => o.orderId !== order.orderId))
                                                } catch (err) {
                                                    toast.error(err.message || 'Gagal menerima pesanan')
                                                }
                                            }}
                                            onReject={() => {
                                                setRejectOrderId(order.orderId)
                                                setRejectReason('')
                                                setCustomRejectReason('')
                                                setRejectModalOpen(true)
                                            }}
                                        />
                                    ))
                                ) : (
                                    <div className="py-8 text-center text-text-secondary text-sm">
                                        Tidak ada pesanan baru saat ini.
                                    </div>
                                )}
                            </>
                        )}
                        {/* We redirect for other tabs, so this might not be reached, but good fallback */}
                        {activeTab !== 'baru' && (
                            <div className="py-8 text-center text-text-secondary text-sm">
                                Memuat...
                            </div>
                        )}
                    </div>
                </section>

                {/* Driver Info Banner */}
                <section className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-4 flex items-center gap-3 border border-blue-100 dark:border-blue-800/30">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-card-dark flex items-center justify-center text-blue-600 shadow-sm">
                        <span className="material-symbols-outlined text-[20px]">two_wheeler</span>
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-semibold text-blue-800 dark:text-blue-300">Driver Tersedia</p>
                        <p className="text-[10px] text-blue-600 dark:text-blue-400">
                            {availableDriversCount > 0
                                ? `Ada ${availableDriversCount} driver di sekitar area warungmu.`
                                : 'Belum ada driver yang aktif saat ini.'}
                        </p>
                    </div>
                </section>

                {/* Help Section */}
                <section className="flex flex-col items-center justify-center py-8 gap-5 mt-4 border-t border-border-color dark:border-gray-800">
                    <div className="text-center">
                        <h3 className="font-bold text-lg text-text-main dark:text-white">Pusat Bantuan Merchant</h3>
                        <p className="text-xs text-text-secondary mt-1">Tim CS Bantoo siap membantu operasional warung Anda</p>
                    </div>
                    {whatsappSupport && (
                        <div className="flex flex-col gap-3 w-full max-w-sm">
                            <button
                                onClick={() => window.open(waLink('Halo Admin Bantoo, saya butuh bantuan terkait suatu Pesanan di warung saya...'), '_blank')}
                                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl py-3.5 px-6 flex items-center justify-center gap-2.5 font-bold shadow-md active:scale-95 transition-all"
                            >
                                <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                                Bantuan Pesanan
                            </button>
                            <button
                                onClick={() => window.open(waLink('Halo Admin Bantoo, saya mengalami kendala pencairan dana / pengaturan akun warung saya...'), '_blank')}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3.5 px-6 flex items-center justify-center gap-2.5 font-bold shadow-md active:scale-95 transition-all"
                            >
                                <span className="material-symbols-outlined text-[20px]">support_agent</span>
                                Kendala Dana & Akun
                            </button>
                        </div>
                    )}
                    <p className="text-[10px] text-text-secondary font-medium">Jam Operasional CS: Setiap Hari (08:00 - 22:00 WIB)</p>
                </section>
            </main>

            {/* Reject Order Modal */}
            {rejectModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center px-4" role="dialog">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity" onClick={() => !rejectLoading && setRejectModalOpen(false)}></div>
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
                                        name="dashboard_reject_reason"
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
                        {rejectReason === 'Alasan lainnya' && (
                            <textarea
                                value={customRejectReason}
                                onChange={(e) => setCustomRejectReason(e.target.value)}
                                placeholder="Tulis alasan penolakan..."
                                rows={3}
                                className="w-full p-3 rounded-xl border border-border-color dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-text-main dark:text-white placeholder:text-text-secondary focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all"
                                autoFocus
                            />
                        )}
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setRejectModalOpen(false)}
                                disabled={rejectLoading}
                                className="flex-1 py-3.5 rounded-xl border border-gray-300 dark:border-gray-600 text-text-secondary font-semibold text-sm active:bg-gray-50 dark:active:bg-gray-800 transition-colors"
                            >
                                Kembali
                            </button>
                            <button
                                onClick={async () => {
                                    if (!rejectReason || !rejectOrderId || rejectLoading) return
                                    const finalReason = rejectReason === 'Alasan lainnya' ? (customRejectReason.trim() || 'Alasan lainnya') : rejectReason
                                    setRejectLoading(true)
                                    try {
                                        const result = await orderService.rejectOrder(rejectOrderId, finalReason)
                                        toast.success('Pesanan berhasil ditolak')
                                        if (result && result._autoClosed) {
                                            toast.error('PERHATIAN: Warung otomatis DITUTUP karena terlalu banyak pesanan ditolak hari ini!')
                                            setTimeout(() => window.location.reload(), 2000)
                                        }
                                        setRecentOrders(prev => prev.filter(o => o.orderId !== rejectOrderId))
                                        setRejectModalOpen(false)
                                    } catch (err) {
                                        toast.error(err.message || 'Gagal menolak pesanan')
                                    } finally {
                                        setRejectLoading(false)
                                    }
                                }}
                                disabled={!rejectReason || rejectLoading || (rejectReason === 'Alasan lainnya' && !customRejectReason.trim())}
                                className={`flex-1 py-3.5 rounded-xl font-bold text-sm active:scale-95 transition-all ${rejectReason && !rejectLoading
                                    ? 'bg-primary hover:bg-primary-dark text-white'
                                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                {rejectLoading ? 'Menolak...' : 'Tolak Pesanan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <MerchantBottomNavigation activeTab="home" />
        </div>
    )
}

// Sub-components to keep code clean
function ActionButton({ icon, label, color, onClick }) {
    const colorClasses = {
        orange: 'bg-orange-50 text-orange-600 border-orange-100',
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
        green: 'bg-green-50 text-green-600 border-green-100'
    }

    return (
        <button onClick={onClick} className="flex flex-col items-center gap-2 group">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border group-active:scale-95 transition-transform shadow-sm ${colorClasses[color]}`}>
                <span className="material-symbols-outlined text-[26px]">{icon}</span>
            </div>
            <span className="text-[11px] font-medium text-center leading-tight whitespace-pre-line">{label.replace(' ', '\n')}</span>
        </button>
    )
}

function TabButton({ active, onClick, label }) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${active
                ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                : 'text-text-secondary hover:bg-white/50 dark:hover:bg-gray-800'
                }`}
        >
            {label}
        </button>
    )
}

function OrderCard({ id, time, payment, status, total, items, note, onAccept, onReject }) {
    const [isProcessing, setIsProcessing] = useState(false)

    const handleAccept = async () => {
        if (isProcessing) return
        setIsProcessing(true)
        try {
            await onAccept()
        } finally {
            setIsProcessing(false)
        }
    }

    const handleReject = async () => {
        if (isProcessing) return
        setIsProcessing(true)
        try {
            await onReject()
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <article className={`bg-white dark:bg-card-dark rounded-2xl shadow-soft border border-border-color dark:border-gray-700 p-4 flex flex-col gap-3 ${isProcessing ? 'opacity-60 pointer-events-none' : ''}`}>
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <span className="text-xs text-text-secondary font-medium">Order ID #{id}</span>
                    <span className="text-[10px] text-text-secondary mt-0.5">{time} • {payment}</span>
                </div>
                <span className="px-2 py-1 rounded-md bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-[10px] font-bold uppercase tracking-wider">{status}</span>
            </div>
            <div className="h-px bg-border-color dark:bg-gray-800 w-full"></div>
            <div className="flex flex-col gap-2">
                {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold text-text-secondary">{item.qty}x</span>
                            <span className="text-text-main dark:text-white font-medium">{item.name}</span>
                        </div>
                        <span className="text-text-main dark:text-white font-semibold">{item.price}</span>
                    </div>
                ))}

                {note && (
                    <div className="mt-1 flex items-start gap-2">
                        <span className="material-symbols-outlined text-[14px] text-text-secondary mt-0.5">edit_note</span>
                        <p className="text-xs text-text-secondary italic">"{note}"</p>
                    </div>
                )}
            </div>
            <div className="h-px bg-border-color dark:bg-gray-800 w-full"></div>
            <div className="flex justify-between items-center">
                <div>
                    <span className="text-xs text-text-secondary">Total</span>
                    <p className="text-base font-bold text-text-main dark:text-white">{total}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleReject}
                        disabled={isProcessing}
                        className="px-4 py-2 rounded-xl border border-red-200 dark:border-red-900/50 text-red-500 font-semibold text-xs active:bg-red-50 transition-colors disabled:opacity-50"
                    >
                        {isProcessing ? '...' : 'Tolak'}
                    </button>
                    <button
                        onClick={handleAccept}
                        disabled={isProcessing}
                        className="px-6 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md active:scale-95 transition-transform disabled:opacity-50"
                    >
                        {isProcessing ? '...' : 'Terima'}
                    </button>
                </div>
            </div>
        </article>
    )
}

export default MerchantDashboard
