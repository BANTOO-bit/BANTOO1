import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationsContext'
import { supabase } from '../../services/supabaseClient'
import dashboardService from '../../services/dashboardService'
import driverService from '../../services/driverService'
import DriverBottomNavigation from '../../components/driver/DriverBottomNavigation'

import { useOrder } from '../../context/OrderContext'
import logger from '../../utils/logger'

function DriverDashboard() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { addNotification } = useNotification()
    const { setActiveOrder } = useOrder() // Import setActiveOrder
    const [isOnline, setIsOnline] = useState(false)
    const [driverStatus, setDriverStatus] = useState('active') // 'active', 'suspended', or 'terminated'
    const [earnings, setEarnings] = useState({
        todayIncome: 0,
        codFee: 0,
        completedOrders: 0,
        loading: true
    })

    const [driverProfile, setDriverProfile] = useState(null)
    const [availableOrders, setAvailableOrders] = useState([])

    useEffect(() => {
        let mounted = true

        async function fetchEarnings() {
            if (!user?.id) return
            try {
                const data = await dashboardService.getDriverStats(user.id)
                if (mounted) {
                    setEarnings({ ...data, loading: false })
                }
            } catch (error) {
                if (import.meta.env.DEV) console.error('Error fetching driver stats:', error)
                if (mounted) {
                    setEarnings(prev => ({ ...prev, loading: false }))
                }
            }
        }

        async function fetchProfile() {
            if (!user?.id) return
            try {
                const profile = await driverService.getProfile()
                if (mounted && profile) {
                    setDriverProfile(profile)
                    // Sync local state with DB state
                    setIsOnline(profile.is_active)
                    setDriverStatus(profile.status === 'terminated' ? 'terminated' : (profile.status === 'suspended' || profile.status === 'rejected') ? 'suspended' : 'active')
                }
            } catch (error) {
                if (import.meta.env.DEV) console.error('Error fetching driver profile:', error)
            }
        }

        // Check for active order on mount (Session Resume)
        async function checkActiveOrder() {
            if (!user?.id) return
            try {
                const activeOrder = await driverService.getActiveOrder()
                if (mounted && activeOrder) {
                    logger.debug('Found active order, resuming...', activeOrder)

                    if (activeOrder.status === 'pickup') {
                        navigate(`/driver/order/pickup/${activeOrder.id}`, { replace: true })
                    } else if (['picked_up', 'delivering'].includes(activeOrder.status)) {
                        navigate(`/driver/order/delivery/${activeOrder.id}`, { replace: true })
                    }
                }
            } catch (error) {
                if (import.meta.env.DEV) console.error('Error checking active order:', error)
            }
        }

        if (user?.id) {
            fetchEarnings()
            fetchProfile()
            checkActiveOrder()
        }

        // Refresh every 30 seconds
        const interval = setInterval(() => {
            if (user?.id) {
                fetchEarnings()
                checkActiveOrder()
            }
        }, 30000)

        return () => {
            mounted = false
            clearInterval(interval)
        }
    }, [user?.id, navigate])

    // Track mount status to prevent leaks
    const isMountedRef = useRef(true)

    useEffect(() => {
        return () => {
            isMountedRef.current = false
        }
    }, [])

    // Specific function to check orders and update local state
    // Defined outside to be accessible if needed, but primarily used in Location effect
    const checkAvailableOrders = async (lat, lng) => {
        if (!user?.id || !isMountedRef.current) return

        try {
            const orders = await driverService.getAvailableOrders({ lat, lng })

            if (!isMountedRef.current) return

            setAvailableOrders(orders || []) // Update state for list view

            if (orders && orders.length > 0) {
                const order = orders[0]
                // Only notify if new/unseen (simple check)
                addNotification({
                    type: 'order',
                    title: 'Pesanan Baru Masuk!',
                    message: `Jarak: ${order.distance_to_merchant?.toFixed(1) || '?'}km - ${order.merchant_name}`,
                    actionLabel: 'Ambil Order',
                    actionUrl: `/driver/order/incoming/${order.id}`,
                    sticky: true
                })
            }
        } catch (error) {
            if (import.meta.env.DEV) console.error('Error checking orders:', error)
        }
    }

    // Location Tracking & Availability Status
    useEffect(() => {
        let locationWatchId = null
        let isMounted = true

        const updateDriverStatus = async () => {
            if (!user?.id) return

            try {
                // Update online status in DB
                // Only if mounted
                if (isMounted) {
                    await driverService.toggleStatus(isOnline)
                }

                if (!isMounted) return

                if (isOnline) {
                    // Start watching location
                    if ('geolocation' in navigator) {
                        locationWatchId = navigator.geolocation.watchPosition(
                            (position) => {
                                if (!isMounted) return
                                const { latitude, longitude } = position.coords
                                driverService.updateLocation(latitude, longitude)

                                // Poll for orders if we have location
                                checkAvailableOrders(latitude, longitude)
                            },
                            (error) => { if (import.meta.env.DEV) console.error('Location error:', error) },
                            { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
                        )
                    } else {
                        console.warn('Geolocation not supported, checking orders with default Jakarta location')
                        // Fallback: Check orders with default Jakarta location for testing
                        checkAvailableOrders(-6.200000, 106.816666)
                    }
                }
            } catch (error) {
                if (!isMounted) return
                if (import.meta.env.DEV) console.error('Error updating driver status:', error)
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
            isMounted = false
            if (locationWatchId !== null) {
                navigator.geolocation.clearWatch(locationWatchId)
            }
        }
    }, [isOnline, user?.id, navigate])

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
                // When a new order becomes ready, refresh the list + notify
                if (!payload.new.driver_id && payload.old.status !== 'ready') {
                    addNotification({
                        type: 'info',
                        message: 'Pesanan baru tersedia di sekitar Anda!',
                        duration: 3000
                    })

                    // Refresh available orders list immediately
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                            (pos) => checkAvailableOrders(pos.coords.latitude, pos.coords.longitude),
                            () => checkAvailableOrders(-6.200000, 106.816666) // fallback
                        )
                    } else {
                        checkAvailableOrders(-6.200000, 106.816666)
                    }
                }
            })
            // Also listen for orders being taken (driver_id set) to remove from list
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'orders',
                filter: 'status=eq.pickup'
            }, (payload) => {
                // An order was taken by a driver â€” remove from available list
                if (payload.new.driver_id) {
                    setAvailableOrders(prev => prev.filter(o => o.id !== payload.new.id))
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
                                    style={{ backgroundImage: `url("${driverProfile?.avatar_url || 'https://ui-avatars.com/api/?name=' + (driverProfile?.full_name || 'Driver') + '&background=0D8ABC&color=fff'}")` }}
                                />
                                <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'} ring-2 ring-white`} />
                            </div>
                            <div className="flex flex-col">
                                <h2 className="text-slate-900 text-base font-bold leading-tight tracking-tight">
                                    {driverProfile?.full_name || 'Memuat...'}
                                </h2>
                                <span className={`text-xs font-bold ${driverStatus === 'suspended'
                                    ? 'text-red-500'
                                    : isOnline ? 'text-green-600' : 'text-gray-500'
                                    }`}>
                                    Status: {driverStatus === 'suspended' ? 'Suspended' : isOnline ? 'Online' : 'Offline'}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-2">
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
                <main className="flex-1 pb-bottom-nav bg-background-light">
                    {(driverStatus === 'suspended' || driverStatus === 'terminated') ? (
                        /* Suspended/Terminated State UI */
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

                            {/* Suspended/Terminated Icon & Message */}
                            <div className={`w-48 h-48 rounded-full flex items-center justify-center mb-6 relative ${driverStatus === 'terminated' ? 'bg-red-50' : 'bg-red-50'}`}>
                                {driverStatus !== 'terminated' && <div className="absolute inset-0 bg-red-100 rounded-full animate-pulse" />}
                                <span className={`material-symbols-outlined text-7xl z-10 ${driverStatus === 'terminated' ? 'text-red-600' : 'text-red-500'}`}>
                                    {driverStatus === 'terminated' ? 'cancel' : 'gpp_bad'}
                                </span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                {driverStatus === 'terminated' ? 'Kemitraan Diputus' : 'Akun Ditangguhkan'}
                            </h2>
                            <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto mb-8">
                                {driverStatus === 'terminated'
                                    ? 'Kemitraan Anda dengan platform telah diputus secara permanen. Silakan hubungi admin untuk informasi lebih lanjut.'
                                    : 'Mohon maaf, Anda tidak dapat menerima pesanan saat ini karena akun sedang dalam penangguhan sementara. Silakan hubungi tim Admin untuk bantuan lebih lanjut.'
                                }
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
                                                {isOnline ? `Menunggu pesanan baru...` : 'Tidak menerima pesanan'}
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
                                    {/* AVAILABLE ORDERS LIST */}
                                    {availableOrders.length > 0 ? (
                                        <div className="w-full space-y-4">
                                            <h3 className="text-slate-900 text-lg font-bold leading-tight text-center mb-2">
                                                {availableOrders.length} Order Tersedia!
                                            </h3>
                                            {availableOrders.map(order => (
                                                <div key={order.id} className="bg-white rounded-xl border border-blue-200 shadow-md p-4 animate-in fade-in slide-in-from-bottom-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h4 className="font-bold text-slate-900">{order.merchant_name}</h4>
                                                            <p className="text-xs text-slate-500 line-clamp-1">
                                                                {order.merchant_address?.includes('Lokasi Terpilih')
                                                                    ? 'Lokasi via Peta (Klik untuk detail)'
                                                                    : order.merchant_address}
                                                            </p>
                                                        </div>
                                                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">
                                                            {order.distance_to_merchant ? `${order.distance_to_merchant.toFixed(1)} km` : '? km'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center mt-3">
                                                        <div>
                                                            <p className="text-xs font-semibold text-slate-400">Total Harga</p>
                                                            <p className="text-sm font-bold text-slate-900">{formatCurrency(order.total_amount)}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => navigate(`/driver/order/incoming/${order.id}`)}
                                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition"
                                                        >
                                                            Ambil Order
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <>
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
                                        </>
                                    )}

                                    {/* Dev Only: Simulate Order - REMOVED FOR PRODUCTION */}
                                </div>
                            )}
                        </>
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
