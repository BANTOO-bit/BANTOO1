import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationsContext'
import { supabase } from '../../services/supabaseClient'
import dashboardService from '../../services/dashboardService'
import driverService from '../../services/driverService'
import DriverBottomNavigation from '../../components/driver/DriverBottomNavigation'

import { useOrder } from '../../context/OrderContext'

function DriverDashboard() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { addNotification } = useNotification()
    const { setActiveOrder } = useOrder() // Import setActiveOrder
    const [isOnline, setIsOnline] = useState(false)
    const [driverStatus, setDriverStatus] = useState('active') // 'active' or 'suspended'
    const [earnings, setEarnings] = useState({
        todayIncome: 0,
        codFee: 0,
        completedOrders: 0,
        loading: true
    })

    useEffect(() => {
        async function fetchEarnings() {
            if (!user?.id) return
            try {
                const data = await dashboardService.getDriverStats(user.id)
                setEarnings({ ...data, loading: false })
            } catch (error) {
                console.error('Error fetching driver stats:', error)
                setEarnings(prev => ({ ...prev, loading: false }))
            }
        }

        // Check for active order on mount (Session Resume)
        async function checkActiveOrder() {
            if (!user?.id) return
            const activeOrder = await driverService.getActiveOrder()
            if (activeOrder) {
                console.log('Found active order, resuming...', activeOrder)
                // Normalize data structure to match what UI expects
                const normalizedOrder = {
                    id: `ORD-${new Date(activeOrder.created_at).getTime()}-${activeOrder.id.substring(0, 8)}`, // activeOrder.id is UUID, UI expects generated format sometimes or we adapt
                    dbId: activeOrder.id,
                    merchantName: activeOrder.merchant_name,
                    merchantAddress: activeOrder.merchant_address,
                    customerName: activeOrder.customer_name || 'Customer',
                    customerAddress: activeOrder.customer_address,
                    totalAmount: activeOrder.total_amount,
                    paymentMethod: activeOrder.payment_method === 'cod' ? 'COD' : activeOrder.payment_method?.toUpperCase(),
                    status: activeOrder.status,
                    items: activeOrder.items,
                    customerNote: activeOrder.customer_note || '',
                    // Coordinates for map
                    merchantCoords: [activeOrder.merchant_lat, activeOrder.merchant_lng],
                    customerCoords: [activeOrder.customer_lat, activeOrder.customer_lng],
                }

                // We need to set this in OrderContext, but we can't access setActiveOrder here easily without importing useOrder
                // So we'll navigate to a "resume" handler or just navigate and let the pages re-fetch?
                // The pages (Pickup/Delivery) use `useOrder` context which might be empty on refresh.
                // We need to populate the context or make the pages capable of fetching by themselves.
                // Current implementation of Pickup/Delivery checks `if (!activeOrder) navigate('/dashboard')`.
                // This creates a loop if we just navigate.

                // SOLUTION: We should store the active order ID in localStorage or allow the pages to fetch by ID.
                // But for now, let's navigate to a special route or just pass state?
                // Better: Navigate with state, and modify the pages to accept state or fetch if context is missing.
                // Actually, the best way in this codebase is to likely use the OrderContext's setActiveOrder.
                // I need to import useOrder hook.
            }
        }
        fetchEarnings()
        // Refresh every 30 seconds
        const interval = setInterval(fetchEarnings, 30000)
        return () => clearInterval(interval)
        const updateDriverStatus = async () => {
            if (!user?.id) return

            try {
                // Update online status in DB
                await driverService.toggleStatus(isOnline)

                if (isOnline) {
                    // Start watching location
                    if ('geolocation' in navigator) {
                        locationWatchId = navigator.geolocation.watchPosition(
                            (position) => {
                                const { latitude, longitude } = position.coords
                                driverService.updateLocation(latitude, longitude)

                                // Poll for orders if we have location
                                checkAvailableOrders(latitude, longitude)
                            },
                            (error) => console.error('Location error:', error),
                            { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
                        )
                    }
                }
            } catch (error) {
                console.error('Error updating driver status:', error)
                addNotification({
                    type: 'error',
                    message: 'Gagal mengupdate status driver',
                    duration: 3000
                })
                setIsOnline(false) // Revert if failed
            }
        }

        updateDriverStatus()

        return () => {
            if (locationWatchId) navigator.geolocation.clearWatch(locationWatchId)
        }
    }, [isOnline, user?.id])

    // Specific function to check orders
    const checkAvailableOrders = async (lat, lng) => {
        try {
            const orders = await driverService.getAvailableOrders({ lat, lng })

            if (orders && orders.length > 0) {
                // Determine layout for incoming order
                // Ideally prompt user or show list. For MVP, we'll notify and navigate to incoming page
                // We'll pick the first one for now
                const order = orders[0]

                // Avoid spamming notifications
                // Only notify if we haven't seen this order recently (could use ref/state)
                addNotification({
                    type: 'order',
                    title: 'Pesanan Baru Masuk!',
                    message: `Jarak: ${order.distance_to_merchant.toFixed(1)}km - ${order.merchant_name}`,
                    actionLabel: 'Ambil Order',
                    actionUrl: `/driver/order/incoming/${order.id}`, // Pass ID
                    sticky: true
                })
            }
        } catch (error) {
            console.error('Error checking orders:', error)
        }
    }

    // Realtime subscription for NEW ready orders (Push)
    useEffect(() => {
        if (!isOnline || driverStatus !== 'active') return

        const channel = supabase
            .channel('driver-available-orders')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'orders',
                filter: 'status=eq.ready'
            }, (payload) => {
                // When a new order becomes ready, trigger a check (if we have location)
                // We rely on the poll/watchPosition primarily but this speeds it up
                // Ideally we get location here too, but for now just notify generic
                if (!payload.new.driver_id && payload.old.status !== 'ready') {
                    addNotification({
                        type: 'info',
                        message: 'Pesanan baru tersedia di sekitar Anda!',
                        duration: 3000
                    })
                }
            })
            .subscribe()

        return () => {
            channel.unsubscribe()
        }
    }, [isOnline, driverStatus])

    // Helper to format currency
    const formatCurrency = (value) => {
        return `Rp ${value.toLocaleString('id-ID')}`
    }

    return (
        <div className="font-display bg-background-light text-slate-900 antialiased min-h-screen">
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl bg-white">
                {/* Header */}
                <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-colors duration-300">
                    <div className="flex items-center p-4 pb-3 justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div
                                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-2 ring-[#0d59f2]/20"
                                    style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBbrWfUKf0v3ygsHK1Gd08zoduoiOHyK-AzHdSjbcrg-uJJcqfeBou-uEGP9nsqoEjQe_HeTGeRfUq3tMA0xDsdoeQbX_WQr9RZDIlAbT4u29ITJuCJAq8hXRZmjfPm4Vh2VJP7RZ0urGXOPUvNj1H_ggdF-JS0OBQ0Cf6ld73t9kKCtRoecNq0qHmHIJNL9AyMPKeZhZMzVlWfQ6NbVlkNe7LPVQjnVKIpSMVCeRGY_zCv2G4v9EDM6KFZq-jHgctmifnVATzUlQ")' }}
                                />
                                <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'} ring-2 ring-white`} />
                            </div>
                            <div className="flex flex-col">
                                <h2 className="text-slate-900 text-base font-bold leading-tight tracking-tight">Distrik Pusat Kota</h2>
                                <span className={`text-xs font-bold ${driverStatus === 'suspended'
                                    ? 'text-red-500'
                                    : isOnline ? 'text-green-600' : 'text-gray-500'
                                    }`}>
                                    Status: {driverStatus === 'suspended' ? 'Suspended' : isOnline ? 'Online' : 'Offline'}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                            {/* Dev Only: Status Toggle */}
                            <button
                                onClick={() => setDriverStatus(prev => prev === 'active' ? 'suspended' : 'active')}
                                className="text-[10px] px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 font-medium text-gray-600"
                                title="Dev: Toggle Suspended"
                            >
                                {driverStatus === 'suspended' ? '🔴' : '🟢'}
                            </button>
                            <button
                                onClick={() => navigate('/driver/notifications')}
                                className="flex items-center justify-center rounded-full size-10 bg-slate-100 text-slate-900 hover:bg-slate-200 transition-colors relative"
                            >
                                <span className="material-symbols-outlined text-[24px]">notifications</span>
                                <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 pb-24 bg-background-light">
                    {driverStatus === 'suspended' ? (
                        /* Suspended State UI */
                        <div className="flex flex-col items-center justify-center text-center px-4 pt-8">
                            {/* Disabled Toggle Card */}
                            <div className="w-full bg-gray-200 rounded-xl p-4 flex items-center justify-between mb-8 opacity-75">
                                <div>
                                    <h2 className="text-base font-semibold text-gray-500 text-left">Anda Sedang Offline</h2>
                                    <p className="text-xs text-gray-400 mt-1 flex items-center">
                                        <span className="material-symbols-outlined text-sm mr-1">block</span>
                                        Akun dibatasi
                                    </p>
                                </div>
                                <div className="relative inline-block w-12 h-7 align-middle select-none transition duration-200 ease-in">
                                    <input
                                        className="absolute block w-5 h-5 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-not-allowed left-[2px] top-[2px]"
                                        disabled
                                        type="checkbox"
                                    />
                                    <label className="block overflow-hidden h-7 rounded-full bg-gray-300 cursor-not-allowed w-12" />
                                </div>
                            </div>

                            {/* Suspended Icon & Message */}
                            <div className="w-48 h-48 bg-red-50 rounded-full flex items-center justify-center mb-6 relative">
                                <div className="absolute inset-0 bg-red-100 rounded-full animate-pulse" />
                                <span className="material-symbols-outlined text-red-500 text-7xl z-10">gpp_bad</span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">Akun Ditangguhkan</h2>
                            <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto mb-8">
                                Mohon maaf, Anda tidak dapat menerima pesanan saat ini karena akun sedang dalam penangguhan sementara. Silakan hubungi tim Admin untuk bantuan lebih lanjut.
                            </p>
                            <button className="w-full max-w-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 group">
                                <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform text-white">support_agent</span>
                                Hubungi Pusat Bantuan
                            </button>
                            <a className="mt-4 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors border-b border-transparent hover:border-gray-400" href="#">
                                Baca Syarat & Ketentuan Mitra
                            </a>
                        </div>
                    ) : (
                        /* Normal Active State UI */
                        <>
                            {/* Offline Status Card */}
                            <div className="p-4 pb-2">
                                <div className={`flex flex-col items-center justify-between gap-4 rounded-xl border ${isOnline ? 'border-green-200 bg-green-50/60' : 'border-slate-200 bg-white'} p-5 shadow-sm`}>
                                    <div className="flex w-full items-center justify-between">
                                        <div className="flex flex-col gap-1">
                                            <p className={`text-lg font-bold leading-tight ${isOnline ? 'text-green-700' : 'text-slate-500'}`}>
                                                {isOnline ? 'Anda Sedang Online' : 'Anda Sedang Offline'}
                                            </p>
                                            <p className={`text-sm font-bold leading-normal flex items-center gap-1 ${isOnline ? 'text-green-600/80' : 'text-slate-400'}`}>
                                                <span className="material-symbols-outlined text-[18px]">
                                                    {isOnline ? 'hourglass_top' : 'cloud_off'}
                                                </span>
                                                {isOnline ? 'Menunggu pesanan baru...' : 'Tidak menerima pesanan'}
                                            </p>
                                        </div>
                                        <label className={`relative flex h-8 w-14 cursor-pointer items-center rounded-full border-none ${isOnline ? 'bg-green-500' : 'bg-slate-200'} p-1 transition-all`}>
                                            <input
                                                type="checkbox"
                                                className="peer sr-only"
                                                checked={isOnline}
                                                onChange={() => setIsOnline(!isOnline)}
                                            />
                                            <span className={`absolute h-6 w-6 rounded-full bg-white transition-all shadow-sm ${isOnline ? 'left-7' : 'left-1'}`} />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Stats Cards */}
                    <div className="px-4 pb-2">
                        <div className="grid grid-cols-2 gap-3">
                            {/* COD Fee Card */}
                            <div className={`flex flex-col gap-2 rounded-xl p-4 bg-white border-2 shadow-sm relative overflow-hidden group ${earnings.codFee === 0 ? 'border-green-500' : 'border-red-600'}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`flex items-center justify-center size-8 rounded-full shrink-0 ${earnings.codFee === 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        <span className="material-symbols-outlined text-[20px]">payments</span>
                                    </span>
                                    <p className={`text-[10px] font-bold tracking-wider leading-tight ${earnings.codFee === 0 ? 'text-green-700' : 'text-red-700'}`}>POTONGAN ONGKIR COD (Fee Admin)</p>
                                </div>
                                <p className={`tracking-tight text-2xl font-black leading-tight ${earnings.codFee === 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {earnings.codFee === 0 ? 'Rp 0' : formatCurrency(earnings.codFee)}
                                </p>
                                <p className={`text-xs font-bold px-2 py-1 rounded w-fit mt-1 ${earnings.codFee === 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                                    {earnings.codFee === 0 ? 'Tidak ada tagihan' : 'Wajib setor segera'}
                                </p>
                            </div>

                            {/* Earnings Card */}
                            <div
                                onClick={() => navigate('/driver/earnings')}
                                className="flex flex-col gap-2 rounded-xl p-4 bg-white border border-slate-200 shadow-sm relative overflow-hidden cursor-pointer hover:border-blue-300 transition-colors group"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="flex items-center justify-center size-8 rounded-full bg-blue-100 text-blue-600 transition-transform group-hover:scale-110">
                                        <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                                    </span>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Pendapatan Driver</p>
                                </div>
                                <p className="text-slate-900 tracking-tight text-xl font-bold leading-tight">{formatCurrency(earnings.todayIncome)}</p>
                                <p className="text-xs text-slate-400 font-medium">Hari ini</p>
                            </div>
                        </div>
                    </div>

                    {/* Orders Today */}
                    <div className="px-4 pb-6">
                        <div className="flex items-center justify-between rounded-lg bg-white border border-slate-200 px-4 py-3 shadow-sm">
                            <span className="text-sm font-medium text-slate-600">Order Selesai Hari Ini</span>
                            <span className="text-base font-bold text-slate-900">0</span>
                        </div>
                    </div>

                    {/* Searching Animation (Online) */}
                    {isOnline && (
                        <div className="flex flex-col items-center justify-center py-8 px-6 mt-2">
                            <div className="relative flex items-center justify-center size-36 mb-6">
                                <div className="absolute inset-0 rounded-full bg-[#0d59f2]/20 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                                <div className="absolute inset-4 rounded-full border border-[#0d59f2]/30" />
                                <div className="absolute inset-8 rounded-full bg-blue-50 flex items-center justify-center ring-4 ring-blue-100 shadow-lg z-10">
                                    <span className="material-symbols-outlined text-[40px] text-[#0d59f2] animate-pulse">radar</span>
                                </div>
                            </div>
                            <h3 className="text-slate-900 text-xl font-bold leading-tight mb-2 text-center">Mencari Orderan...</h3>
                            <p className="text-slate-500 text-center max-w-[280px] leading-relaxed text-sm mb-6">
                                Tetap buka aplikasi agar tidak melewatkan pesanan di area Pusat Makanan
                            </p>

                            {/* Dev Only: Simulate Order */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        addNotification({
                                            type: 'order',
                                            title: 'Pesanan Baru Masuk!',
                                            message: 'Order #OD-99282 - Nasi Goreng Spesial (COD) - 2.5km',
                                            actionLabel: 'Lihat Order',
                                            actionUrl: '/driver/order/incoming',
                                            sticky: true
                                        })
                                    }}
                                    className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-xs font-bold border border-blue-100 hover:bg-blue-100 transition-colors"
                                >
                                    🔍 Simulasi (COD)
                                </button>
                                <button
                                    onClick={() => {
                                        addNotification({
                                            type: 'order',
                                            title: 'Pesanan Baru Masuk!',
                                            message: 'Order #OD-99283 - Sate Ayam Madura (Wallet) - 1.2km',
                                            actionLabel: 'Lihat Order',
                                            actionUrl: '/driver/order/incoming-wallet',
                                            sticky: true
                                        })
                                    }}
                                    className="bg-sky-50 text-sky-600 px-4 py-2 rounded-lg text-xs font-bold border border-sky-100 hover:bg-sky-100 transition-colors"
                                >
                                    💳 Simulasi (Wallet)
                                </button>
                                <button
                                    onClick={() => {
                                        addNotification({
                                            type: 'success',
                                            title: 'Setoran Berhasil',
                                            message: 'Setoran harian sebesar Rp 50.000 telah berhasil dikonfirmasi.',
                                            duration: 5000
                                        })
                                    }}
                                    className="bg-green-50 text-green-600 px-4 py-2 rounded-lg text-xs font-bold border border-green-100 hover:bg-green-100 transition-colors"
                                >
                                    ✅ Test Alert
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Offline State (Updated) */}
                    {!isOnline && (
                        <div className="flex flex-col items-center justify-center py-12 px-6 mt-4">
                            <div className="size-24 rounded-full bg-slate-50 flex items-center justify-center mb-5 ring-1 ring-slate-100">
                                <span className="material-symbols-outlined text-[48px] text-slate-300">power_settings_new</span>
                            </div>
                            <h3 className="text-slate-900 text-xl font-bold leading-tight mb-2 text-center">Anda Sedang Offline</h3>
                            <p className="text-slate-500 text-center max-w-[280px] leading-relaxed text-sm">
                                Nyalakan tombol di atas untuk mulai menerima orderan masuk.
                            </p>
                        </div>
                    )}

                    <div className="h-6" />
                </main>

                {/* Bottom Navigation */}
                <DriverBottomNavigation activeTab="home" />
            </div>
        </div>
    )
}

export default DriverDashboard
