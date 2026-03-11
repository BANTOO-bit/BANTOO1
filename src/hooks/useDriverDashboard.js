import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotification } from '../context/NotificationsContext'
import { useOrder } from '../context/OrderContext'
import { useRealtimeMulti } from './useRealtime'
import { useDriverPresence } from './useDriverPresence'
import dashboardService from '../services/dashboardService'
import driverService from '../services/driverService'
import logger from '../utils/logger'

/**
 * useDriverDashboard — Extracts all state management and side effects from DriverDashboard.
 * Handles: online toggle, earnings, profile, available orders, COD fee, GPS, realtime.
 */
export function useDriverDashboard(user) {
    const navigate = useNavigate()
    const { addNotification } = useNotification()
    const { setActiveOrder } = useOrder()

    // Auto-offline driver when closing/refreshing browser
    useDriverPresence(user)

    // State
    const initialOnlineState = sessionStorage.getItem('driver_isOnline') === 'true'
    const initialDriverStatus = sessionStorage.getItem('driver_status') || 'active'
    const initialAutoAccept = localStorage.getItem('driver_autoAccept') === 'true'
    const initialRadius = parseFloat(localStorage.getItem('driver_autoAcceptRadius')) || 3.0 // Default 3km

    const [isOnline, setIsOnline] = useState(initialOnlineState)
    const [driverStatus, setDriverStatus] = useState(initialDriverStatus)
    const [earnings, setEarnings] = useState({
        todayIncome: 0, codFee: 0, completedOrders: 0, loading: true
    })
    const [performanceStats, setPerformanceStats] = useState({
        rating: '-', trips: 0, joinDate: '-', loading: true
    })
    const [driverProfile, setDriverProfile] = useState(null)
    const [isLoadingProfile, setIsLoadingProfile] = useState(true)
    const [availableOrders, setAvailableOrders] = useState([])
    const [hasUnreadNotification, setHasUnreadNotification] = useState(false)
    const [codFeeBalance, setCodFeeBalance] = useState(null)
    const [isAutoAccept, setIsAutoAccept] = useState(initialAutoAccept)
    const [autoAcceptRadius, setAutoAcceptRadius] = useState(initialRadius)
    const seenOrderIdsRef = useRef(new Set())
    const isMountedRef = useRef(true)

    useEffect(() => {
        isMountedRef.current = true
        return () => { isMountedRef.current = false }
    }, [])

    // Data fetchers
    const fetchEarnings = async () => {
        if (!user?.id) return
        try {
            const data = await dashboardService.getDriverStats(user.id)
            if (isMountedRef.current) setEarnings({ ...data, loading: false })
            
            // Also fetch long-term stats for Performance Card
            const stats = await driverService.getDriverStats(user.id)
            if (isMountedRef.current) setPerformanceStats({ ...stats, loading: false })
        } catch (err) {
            if (isMountedRef.current) {
                setEarnings(prev => ({ ...prev, loading: false }))
                setPerformanceStats(prev => ({ ...prev, loading: false }))
            }
        }
    }

    const fetchProfile = async () => {
        if (!user?.id) return
        try {
            setIsLoadingProfile(true)
            const data = await driverService.getProfile()
            if (isMountedRef.current) {
                setDriverProfile(data)
                const status = data?.status || 'active'
                setDriverStatus(status)
                sessionStorage.setItem('driver_status', status)
                if (status === 'suspended' || status === 'terminated') {
                    setIsOnline(false)
                    sessionStorage.setItem('driver_isOnline', 'false')
                }
            }
        } catch (err) {
            logger.error('Error fetching driver profile:', err)
        } finally {
            if (isMountedRef.current) setIsLoadingProfile(false)
        }
    }

    const checkNotifications = async () => {
        if (!user?.id) return
        try {
            const notifs = await driverService.getNotifications(user.id)
            if (isMountedRef.current) setHasUnreadNotification(notifs?.length > 0)
        } catch (err) {
            // silent
        }
    }

    const checkActiveOrder = async () => {
        if (!user?.id) return
        try {
            const order = await driverService.getActiveOrder()
            if (isMountedRef.current && order) {
                setActiveOrder(order)
                navigate(`/driver/order/pickup/${order.id}`)
            }
        } catch (err) {
            // silent
        }
    }

    const checkCodFeeBalance = async () => {
        if (!user?.id) return
        try {
            const balance = await driverService.getCodAdminFeeBalance(user.id)
            if (isMountedRef.current) setCodFeeBalance(balance)
        } catch (err) {
            // silent
        }
    }

    const checkAvailableOrders = async (lat, lng) => {
        if (!user?.id || !isMountedRef.current) return
        try {
            const orders = await driverService.getAvailableOrders({ lat, lng })
            if (!isMountedRef.current) return
            setAvailableOrders(orders || [])
            if (orders?.length > 0) {
                const order = orders[0]
                if (!seenOrderIdsRef.current.has(order.id)) {
                    seenOrderIdsRef.current.add(order.id)
                    
                    const distance = parseFloat(order.distance_to_merchant) || 999
                    
                    if (isAutoAccept && distance <= autoAcceptRadius) {
                        // Auto-Accept logic
                        try {
                            if (import.meta.env.DEV) console.log(`Auto-accepting order ${order.id} (Distance: ${distance}km <= ${autoAcceptRadius}km)`)
                            await driverService.acceptOrder(order.id)
                            addNotification({
                                type: 'success',
                                title: 'Pesanan Diterima Otomatis',
                                message: `Menuju Warung ${order.merchant_name} (${distance.toFixed(1)}km)`,
                                duration: 4000
                            })
                            // Fetch active order and navigate
                            await checkActiveOrder()
                        } catch (acceptErr) {
                            if (import.meta.env.DEV) console.error('Auto-accept failed:', acceptErr)
                        }
                    } else {
                        // Manual accept notification
                        addNotification({
                            type: 'order',
                            title: 'Pesanan Baru Masuk!',
                            message: `Jarak: ${distance.toFixed(1)}km - Warung ${order.merchant_name}`,
                            actionLabel: 'Ambil Order',
                            actionUrl: `/driver/order/incoming/${order.id}`,
                            sticky: true
                        })
                    }
                }
            }
        } catch (error) {
            if (import.meta.env.DEV) console.error('Error checking orders:', error)
        }
    }

    // Initial fetch + periodic refresh
    useEffect(() => {
        let mounted = true
        if (user?.id) {
            fetchEarnings(); fetchProfile(); checkActiveOrder()
            checkNotifications(); checkCodFeeBalance()
        }
        const interval = setInterval(() => {
            if (user?.id) {
                fetchEarnings(); checkActiveOrder()
                checkNotifications(); checkCodFeeBalance()
            }
        }, 30000)
        return () => { mounted = false; clearInterval(interval) }
    }, [user?.id, navigate])

    // Location tracking & availability
    useEffect(() => {
        let locationWatchId = null
        let isMounted = true
        let pollInterval = null

        const updateDriverStatus = async () => {
            if (!user?.id || !isMounted) return
            try {
                if (isOnline) {
                    pollInterval = setInterval(() => {
                        if (!isMounted || !isOnline) { clearInterval(pollInterval); return }
                        if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                                (pos) => checkAvailableOrders(pos.coords.latitude, pos.coords.longitude),
                                () => checkAvailableOrders(-7.0674066, 110.8715891)
                            )
                        } else {
                            checkAvailableOrders(-7.0674066, 110.8715891)
                        }
                    }, 5000)

                    if ('geolocation' in navigator) {
                        checkAvailableOrders(-7.0674066, 110.8715891)
                        locationWatchId = navigator.geolocation.watchPosition(
                            (position) => {
                                if (!isMounted) return
                                const { latitude, longitude } = position.coords
                                driverService.updateLocation(latitude, longitude)
                                checkAvailableOrders(latitude, longitude)
                            },
                            (error) => {
                                if (import.meta.env.DEV) console.error('Location error:', error)
                                if (!isMounted) return
                                checkAvailableOrders(-7.0674066, 110.8715891)
                            },
                            { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
                        )
                    } else {
                        checkAvailableOrders(-7.0674066, 110.8715891)
                    }
                }
            } catch (error) {
                if (!isMounted) return
                addNotification({ type: 'error', message: 'Gagal mengupdate status driver', duration: 3000 })
                setIsOnline(false)
            }
        }

        updateDriverStatus()
        return () => {
            isMounted = false
            if (locationWatchId !== null) navigator.geolocation.clearWatch(locationWatchId)
            if (pollInterval) clearInterval(pollInterval)
        }
    }, [isOnline, user?.id, navigate])

    // Realtime subscription
    useRealtimeMulti(
        isOnline && driverStatus === 'active' ? 'driver-available-orders' : null,
        [
            {
                table: 'orders', event: 'UPDATE', filter: 'status=eq.ready',
                callback: (payload) => {
                    if (!payload.new.driver_id && payload.old.status !== 'ready') {
                        addNotification({ type: 'info', message: 'Pesanan baru tersedia di sekitar Anda!', duration: 3000 })
                        if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                                (pos) => checkAvailableOrders(pos.coords.latitude, pos.coords.longitude),
                                () => checkAvailableOrders(-7.0674066, 110.8715891)
                            )
                        } else { checkAvailableOrders(-7.0674066, 110.8715891) }
                    }
                }
            },
            {
                table: 'orders', event: 'UPDATE', filter: 'status=eq.pickup',
                callback: (payload) => {
                    if (payload.new.driver_id) {
                        setAvailableOrders(prev => prev.filter(o => o.id !== payload.new.id))
                    }
                }
            }
        ],
        isOnline && driverStatus === 'active'
    )

    // Toggle handler
    const toggleOnline = async () => {
        // Jika driver sedang ONLINE dan ingin OFFLINE
        if (isOnline) {
            try {
                // Periksa apakah driver memiliki order aktif (Pickup/Delivering)
                const activeOrder = await driverService.getActiveOrder()
                if (activeOrder) {
                    addNotification({ 
                        type: 'error', 
                        message: 'Selesaikan pesanan aktif Anda terlebih dahulu sebelum offline', 
                        duration: 4000,
                        sticky: true
                    })
                    return // Batal toggle
                }
            } catch (err) {
                if (import.meta.env.DEV) console.error('Gagal cek pesanan aktif driver', err)
            }
        } else {
            // Jika driver sedang OFFLINE dan ingin ONLINE
            // Tambahkan proteksi limit COD jika nilainya sudah di-fetch melalui checkCodFeeBalance()
            if (codFeeBalance && codFeeBalance.isLimitExceeded) {
                addNotification({
                    type: 'error',
                    message: 'Limit saldo COD melebihi batas. Segera Setor tunai ke Admin untuk bisa Online kembali.',
                    duration: 5000,
                    sticky: true
                })
                return // Batal toggle
            }
        }

        const newValue = !isOnline
        setIsOnline(newValue)
        try {
            await driverService.toggleStatus(newValue)
            if (newValue) {
                checkAvailableOrders(-7.0674066, 110.8715891)
            } else {
                setAvailableOrders([])
            }
        } catch (err) {
            setIsOnline(!newValue)
            addNotification({ type: 'error', message: 'Gagal mengupdate status driver', duration: 3000 })
        }
    }

    // Toggle Auto Accept
    const toggleAutoAccept = () => {
        const newValue = !isAutoAccept
        setIsAutoAccept(newValue)
        localStorage.setItem('driver_autoAccept', newValue)
    }

    const updateAutoAcceptRadius = (radius) => {
        setAutoAcceptRadius(radius)
        localStorage.setItem('driver_autoAcceptRadius', radius)
    }

    return {
        isOnline, driverStatus, earnings, performanceStats, driverProfile, isLoadingProfile,
        availableOrders, hasUnreadNotification, codFeeBalance,
        isAutoAccept, autoAcceptRadius, toggleAutoAccept, updateAutoAcceptRadius,
        toggleOnline, checkAvailableOrders, navigate,
    }
}

export default useDriverDashboard
