import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import DriverBottomNavigation from '@/features/driver/components/DriverBottomNavigation'
import TrackingMap from '@/features/customer/components/TrackingMap'
import { useAuth } from '@/context/AuthContext'
import { useOrder } from '@/context/OrderContext'
import { useToast } from '@/context/ToastContext'
import { handleError } from '@/utils/errorHandler'
import { formatId } from '@/utils/formatters'
import { isCODPayment } from '@/utils/paymentUtils'
import orderService from '@/services/orderService'
import { startBroadcastingLocation, stopBroadcasting } from '@/services/driverLocationService'
import { useWakeLock } from '@/hooks/useWakeLock'
import SlideToConfirm from '@/features/shared/components/SlideToConfirm'
import DriverIssueModal from '@/features/driver/components/DriverIssueModal'

function DriverDeliveryOrder() {
    const navigate = useNavigate()
    const { orderId } = useParams()
    const { user } = useAuth()
    const { activeOrder, setActiveOrder, loading } = useOrder()
    const toast = useToast()
    const [isConfirming, setIsConfirming] = useState(false)
    const [showIssueModal, setShowIssueModal] = useState(false)

    // Wake Lock to keep screen awake
    const { requestWakeLock } = useWakeLock({
        onVisibilityChangeWarning: () => {
            toast.warning('Aplikasi berjalan di latar. Mohon jaga layar tetap menyala agar GPS akurat.', {
                duration: 6000,
                icon: 'screen_lock_portrait'
            });
        }
    });

    const hasArrived = activeOrder?.hasArrivedAtCustomer || false
    const handleArriveAtCustomer = () => {
        setActiveOrder({ ...activeOrder, hasArrivedAtCustomer: true })
    }

    const handleReportIssue = async (reason) => {
        try {
            const dbOrderId = activeOrder.dbId || activeOrder.id
            const { driverService } = await import('@/services/driverService')
            await driverService.reportIssue(dbOrderId, reason, 'cancel')
        } catch (err) {
            console.error('Gagal melaporkan kendala:', err)
        }
        setShowIssueModal(false)
        stopBroadcasting()
        toast.info(`Laporan kendala "${reason}" terkirim. Pesanan dibatalkan.`)
        setActiveOrder(null)
        navigate('/driver/dashboard')
    }

    // Protected route: redirect if no active order
    useEffect(() => {
        if (!activeOrder && !loading) {
            navigate('/driver/dashboard')
        }
    }, [activeOrder, loading, navigate])

    useEffect(() => {
        // Automatically request wake lock when entering delivery mode
        requestWakeLock();
    }, []);

    // Start broadcasting GPS location for live tracking
    useEffect(() => {
        const currentOrderId = activeOrder?.id || activeOrder?.dbId
        if (currentOrderId) {
            const handle = startBroadcastingLocation(currentOrderId, user?.id)
            return () => {
                handle.stop()
            }
        }
    }, [activeOrder?.id, activeOrder?.dbId, user?.id])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                    <p className="text-sm font-medium text-slate-500">Memuat pesanan...</p>
                </div>
            </div>
        )
    }

    if (!activeOrder) return null

    // Data Access Helpers
    const customerName = activeOrder.customer?.full_name || activeOrder.customerName || 'Pelanggan'
    const customerAddress = activeOrder.delivery_address || activeOrder.customerAddress || ''
    const customerPhone = activeOrder.customer?.phone || activeOrder.customerPhone || null
    const merchantCoords = activeOrder.merchant?.latitude && activeOrder.merchant?.longitude
        ? [activeOrder.merchant.latitude, activeOrder.merchant.longitude]
        : (activeOrder.merchantCoords || [-7.0747, 110.8767])

    // Attempt to parse lat/lng from order if available directly, or fallback
    const customerCoords = activeOrder.customer_lat && activeOrder.customer_lng
        ? [activeOrder.customer_lat, activeOrder.customer_lng]
        : (activeOrder.customerCoords || [-6.2250, 106.8500])

    const paymentMethod = activeOrder.payment_method || activeOrder.paymentMethod
    const totalAmount = activeOrder.total_amount || activeOrder.totalAmount
    const isCOD = isCODPayment(paymentMethod)

    const handleConfirmDelivery = async () => {
        try {
            setIsConfirming(true)

            // Dapatkan lokasi GPS akurat sebelum memperbolehkan delivery (radius check)
            let lat = null, lng = null;
            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 10000
                    });
                });
                lat = position.coords.latitude;
                lng = position.coords.longitude;
            } catch (gpsError) {
                console.warn('Gagal mendapatkan GPS instan, mencoba fallback...', gpsError);
                if (activeOrder.driverCoords && activeOrder.driverCoords.length === 2) {
                    lat = activeOrder.driverCoords[0];
                    lng = activeOrder.driverCoords[1];
                    if (import.meta.env.DEV) console.log('Menggunakan fallback (lokasi terakhir):', lat, lng);
                } else {
                    toast.warning('GPS sulit dilacak. Pastikan sinyal GPS Anda kuat.', {
                        duration: 5000,
                        icon: 'gps_off'
                    });
                }
            }

            // Stop broadcasting GPS since delivery is complete
            stopBroadcasting()

            // Support both id and dbId — use dbId (UUID) for API calls
            const orderId = activeOrder.dbId || activeOrder.id

            if (isCOD) {
                // COD: Jangan update status dulu — biarkan payment page yang handle
                // Simpan GPS coords di context agar payment page bisa pakai
                setActiveOrder({ ...activeOrder, status: 'delivering', driverCoords: lat && lng ? [lat, lng] : activeOrder.driverCoords })
                navigate('/driver/order/payment')
            } else {
                // Wallet: Update status to delivered/completed via Driver Service
                const { driverService } = await import('@/services/driverService')
                await driverService.updateOrderStatus(orderId, 'delivered', lat, lng)

                setActiveOrder({ ...activeOrder, status: 'delivered' })
                navigate('/driver/order/complete')
            }
        } catch (error) {
            console.error('Error confirming delivery:', error)
            handleError(error, toast, { context: 'Confirm Delivery' })
        } finally {
            setIsConfirming(false)
        }
    }

    return (
        <div className="font-display bg-gray-100 text-slate-900 antialiased min-h-screen relative flex flex-col overflow-hidden max-w-md mx-auto bg-gray-100">
            {/* Header */}
            <header className="absolute top-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-sm border-b border-slate-200 p-4 flex items-center justify-between h-[72px]">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
                        <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-lg font-bold leading-tight">Antar Pesanan</h1>
                        <p className="text-xs font-medium text-slate-500">Order ID {formatId(activeOrder.id)}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowIssueModal(true)}
                        className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center transition-colors hover:bg-red-100 text-red-600"
                    >
                        <span className="material-symbols-outlined text-[24px]">warning</span>
                    </button>
                </div>
            </header>

            {/* Map Section (Top Half) - Real Leaflet Map */}
            <div className="absolute inset-x-0 top-[72px] bottom-0 z-0 bg-gray-200 w-full">
                <div className="w-full h-[55%] relative overflow-hidden">
                    <TrackingMap
                        merchantLocation={merchantCoords}
                        userLocation={customerCoords}
                        driverLocation={activeOrder.driverCoords || null}
                        height="100%"
                    />
                </div>
            </div>

            {/* Bottom Sheet (Draggable-like) */}
            <main className="absolute bottom-[72px] left-0 right-0 z-20 flex flex-col justify-end pointer-events-none h-full">
                <div className="bg-white rounded-t-3xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] border-t border-slate-200 pointer-events-auto max-h-[80vh] overflow-y-auto pb-4">
                    {/* Drag Handle */}
                    <div className="flex justify-center pt-3 pb-1">
                        <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
                    </div>

                    <div className="p-5 pt-2 space-y-5">
                        {/* Customer Info */}
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-blue-600 text-[24px]">person</span>
                            </div>
                            <div>
                                <h2 className="font-bold text-lg leading-tight mb-1">{customerName}</h2>
                                <div className="flex items-start gap-1 text-slate-500 text-sm">
                                    <span className="material-symbols-outlined text-[18px] mt-0.5 text-red-500">location_on</span>
                                    <span className="leading-snug">{customerAddress}</span>
                                </div>
                                {customerPhone && (
                                    <div className="flex items-center gap-1 text-slate-600 text-sm mt-1">
                                        <span className="material-symbols-outlined text-[16px] text-emerald-500">phone</span>
                                        <span className="leading-snug font-medium tracking-wide">{customerPhone}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Navigasi Maps Ke Customer */}
                        <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${customerCoords.join(',')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2.5 px-4 bg-blue-50 text-blue-600 font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px] rotate-45">navigation</span>
                            Buka di Google Maps
                        </a>

                        {/* Action Buttons */}
                        <div className="flex gap-3 w-full items-center">
                            <button
                                onClick={() => customerPhone && window.open(`tel:${customerPhone}`, '_self')}
                                className="w-12 h-12 flex-shrink-0 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors border border-blue-100">
                                <span className="material-symbols-outlined">call</span>
                            </button>
                            <button
                                onClick={() => navigate(`/driver/chat/${activeOrder.id}`)}
                                className="flex-1 py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                <span className="material-symbols-outlined">chat</span>
                                Chat Pelanggan
                            </button>
                        </div>

                        {/* Payment Status Card (Conditional) */}
                        {isCOD ? (
                            <div className="bg-red-50 rounded-xl p-4 border border-red-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-red-600">payments</span>
                                    <span className="font-bold text-sm text-red-700">TOTAL COD</span>
                                </div>
                                <div className="text-xl font-bold text-red-600">Rp {totalAmount?.toLocaleString('id-ID')}</div>
                            </div>
                        ) : (
                            <div className="bg-green-50 rounded-xl p-4 border border-green-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-green-600">verified</span>
                                    <span className="font-bold text-sm text-green-800">PEMBAYARAN NON-TUNAI</span>
                                </div>
                                <div className="text-sm font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full">LUNAS</div>
                            </div>
                        )}

                        {/* Instruction */}
                        <p className="text-xs text-center text-slate-500">
                            {isCOD ? 'Pastikan menagih uang tunai sesuai nominal.' : 'Jangan menagih uang tunai ke pelanggan!'}
                        </p>

                        {/* Complete Button */}
                        {!hasArrived ? (
                            <button
                                onClick={handleArriveAtCustomer}
                                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
                            >
                                <span className="material-symbols-outlined">location_on</span>
                                SAYA SUDAH DI LOKASI
                            </button>
                        ) : (
                            <SlideToConfirm
                                onConfirm={handleConfirmDelivery}
                                isConfirming={isConfirming}
                                text="GESER JIKA SUDAH SAMPAI"
                                processingText="MENCARI LOKASI GPS AKURAT..."
                            />
                        )}
                    </div>
                </div>
            </main>

            <DriverBottomNavigation activeTab="orders" />

            <DriverIssueModal
                isOpen={showIssueModal}
                onClose={() => setShowIssueModal(false)}
                onSubmit={handleReportIssue}
                type="delivery"
            />
        </div>
    )
}

export default DriverDeliveryOrder
