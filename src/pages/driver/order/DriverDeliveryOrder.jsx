import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import DriverBottomNavigation from '../../../components/driver/DriverBottomNavigation'
import TrackingMap from '../../../components/user/TrackingMap'
import { useAuth } from '../../../context/AuthContext'
import { useOrder } from '../../../context/OrderContext'
import { useToast } from '../../../context/ToastContext'
import { handleError } from '../../../utils/errorHandler'
import orderService from '../../../services/orderService'
import { startBroadcastingLocation, stopBroadcasting } from '../../../services/driverLocationService'

function DriverDeliveryOrder() {
    const navigate = useNavigate()
    const { orderId } = useParams()
    const { user } = useAuth()
    const { activeOrder, setActiveOrder } = useOrder()
    const { orders } = useOrder()
    const toast = useToast()
    const [isConfirming, setIsConfirming] = useState(false)

    // Protected route: redirect if no active order
    useEffect(() => {
        if (!activeOrder) {
            navigate('/driver/dashboard')
        }
    }, [activeOrder, navigate])

    if (!activeOrder) return null

    // Start broadcasting GPS location for live tracking
    useEffect(() => {
        if (activeOrder?.dbId) {
            const handle = startBroadcastingLocation(activeOrder.dbId)
            return () => {
                handle.stop()
            }
        }
    }, [activeOrder?.dbId])

    const handleConfirmDelivery = async () => {
        try {
            setIsConfirming(true)

            // Stop broadcasting GPS since delivery is complete
            stopBroadcasting()

            // Update order status to delivered
            await orderService.updateStatus(activeOrder.dbId, 'delivered')

            // Update context
            setActiveOrder({ ...activeOrder, status: 'delivered' })

            // Navigate based on payment method
            if (activeOrder.paymentMethod === 'COD') {
                // COD: Go to payment confirmation (cash verification)
                navigate('/driver/order/payment')
            } else {
                // Wallet: Skip cash verification, go directly to completion
                navigate('/driver/order/complete')
            }
        } catch (error) {
            console.error('Error confirming delivery:', error)
            handleError(error, toast, { context: 'Confirm Delivery' })
        } finally {
            setIsConfirming(false)
        }
    }

    const isCOD = activeOrder.paymentMethod === 'COD'

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
                        <p className="text-xs font-medium text-slate-500">Order ID #{activeOrder.id.split('-')[2]}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center transition-colors hover:bg-slate-200">
                        <span className="material-symbols-outlined text-slate-900">help_outline</span>
                    </button>
                </div>
            </header>

            {/* Map Section (Top Half) - Real Leaflet Map */}
            <div className="absolute inset-x-0 top-[72px] bottom-0 z-0 bg-gray-200 w-full">
                <div className="w-full h-[55%] relative overflow-hidden">
                    <TrackingMap
                        merchantLocation={activeOrder.merchantCoords || [-6.2088, 106.8456]}
                        userLocation={activeOrder.customerCoords || [-6.2250, 106.8500]}
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
                                <h2 className="font-bold text-lg leading-tight mb-1">{activeOrder.customerName}</h2>
                                <div className="flex items-start gap-1 text-slate-500 text-sm">
                                    <span className="material-symbols-outlined text-[18px] mt-0.5 text-red-500">location_on</span>
                                    <span className="leading-snug">{activeOrder.customerAddress}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 w-full items-center">
                            <button className="w-12 h-12 flex-shrink-0 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors border border-blue-100">
                                <span className="material-symbols-outlined">call</span>
                            </button>
                            <button className="flex-1 py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-sm">
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
                                <div className="text-xl font-bold text-red-600">Rp {activeOrder.totalAmount?.toLocaleString('id-ID')}</div>
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
                        <button
                            onClick={handleConfirmDelivery}
                            disabled={isConfirming}
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined">{isConfirming ? 'refresh' : 'check_circle'}</span>
                            {isConfirming ? 'MEMPROSES...' : 'SAYA SUDAH SAMPAI'}
                        </button>
                    </div>
                </div>
            </main>

            <DriverBottomNavigation activeTab="orders" />
        </div>
    )
}

export default DriverDeliveryOrder
