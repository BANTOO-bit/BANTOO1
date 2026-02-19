import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import DriverBottomNavigation from '../../../components/driver/DriverBottomNavigation'
import TrackingMap from '../../../components/user/TrackingMap'
import { useAuth } from '../../../context/AuthContext'
import { useOrder } from '../../../context/OrderContext'
import { useToast } from '../../../context/ToastContext'
import { handleError, handleWarning } from '../../../utils/errorHandler'
import orderService from '../../../services/orderService'

function DriverPickupOrder() {
    const navigate = useNavigate()
    const { orderId } = useParams()
    const { user } = useAuth()
    const { activeOrder, setActiveOrder, loading } = useOrder()
    const toast = useToast()
    const [checkedItems, setCheckedItems] = useState({})
    const [isConfirming, setIsConfirming] = useState(false)

    // Protected route: redirect if no active order
    useEffect(() => {
        if (!activeOrder && !loading) {
            navigate('/driver/dashboard')
        }
    }, [activeOrder, loading, navigate])

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

    const handleCheckItem = (index) => {
        setCheckedItems(prev => ({
            ...prev,
            [index]: !prev[index]
        }))
    }

    // Handle both flat and nested data structures
    const orderItems = activeOrder.items || []
    const allItemsChecked = orderItems.every((_, index) => checkedItems[index])

    // Data Access Helpers
    const merchantName = activeOrder.merchant?.name || activeOrder.merchantName || 'Merchant'
    const merchantAddress = activeOrder.merchant?.address || activeOrder.merchantAddress || ''
    const merchantCoords = activeOrder.merchant?.latitude && activeOrder.merchant?.longitude
        ? [activeOrder.merchant.latitude, activeOrder.merchant.longitude]
        : (activeOrder.merchantCoords || [-7.0747, 110.8767])

    const customerCoords = activeOrder.customer_lat && activeOrder.customer_lng
        ? [activeOrder.customer_lat, activeOrder.customer_lng]
        : (activeOrder.customerCoords || [-6.2250, 106.8500])

    const paymentMethod = activeOrder.payment_method || activeOrder.paymentMethod
    const totalAmount = activeOrder.total_amount || activeOrder.totalAmount
    const customerNote = activeOrder.notes || activeOrder.customerNote

    const handleConfirmPickup = async () => {
        if (!allItemsChecked) {
            toast.warning('Mohon periksa dan checklist semua item pesanan.')
            return
        }

        try {
            setIsConfirming(true)

            // Update order status to picked_up via Driver Service
            const { driverService } = await import('../../../services/driverService')
            // Support both id and dbId
            const orderId = activeOrder.id
            await driverService.updateOrderStatus(orderId, 'picked_up')

            // Update context
            setActiveOrder({ ...activeOrder, status: 'picked_up' })

            toast.success('Status diupdate: Menuju Customer')
            // Navigate to delivery page
            navigate(`/driver/order/delivery/${orderId}`)
        } catch (error) {
            console.error('Error confirming pickup:', error)
            handleError(error, toast, { context: 'Confirm Pickup' })
        } finally {
            setIsConfirming(false)
        }
    }

    return (
        <div className="font-display bg-background-light text-slate-900 antialiased min-h-screen relative flex flex-col overflow-x-hidden max-w-md mx-auto bg-white border-x border-slate-100">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
                <div className="flex items-center justify-between p-4 h-[72px]">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="rounded-full p-2 -ml-2 hover:bg-slate-100 transition-colors">
                            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 leading-tight">Ambil Pesanan</h1>
                            <p className="text-xs font-medium text-slate-500">Order ID #{activeOrder.id?.slice(0, 8)}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate(`/driver/chat/${activeOrder.id}`)}
                            className="flex items-center justify-center rounded-full size-10 bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[24px]">chat</span>
                        </button>
                        <button className="flex items-center justify-center rounded-full size-10 bg-slate-100 text-slate-900 hover:bg-slate-200 transition-colors">
                            <span className="material-symbols-outlined text-[24px]">help</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 pb-bottom-nav bg-background-light px-4 pt-4 flex flex-col gap-4">
                {/* Map: Route to Merchant */}
                <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm" style={{ height: '200px' }}>
                    <TrackingMap
                        merchantLocation={merchantCoords}
                        userLocation={customerCoords}
                        driverLocation={activeOrder.driverCoords || null}
                        height="200px"
                    />
                </div>

                {/* Merchant Info */}
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                    <div className="flex gap-4">
                        <div className="bg-orange-100 text-orange-600 rounded-xl size-14 shrink-0 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[28px]">storefront</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 leading-tight mb-1">{merchantName}</h2>
                            <div className="flex items-start gap-1 text-slate-500 text-sm">
                                <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">location_on</span>
                                <p className="leading-snug">{merchantAddress}</p>
                            </div>
                        </div>
                    </div>
                    <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${merchantCoords.join(',')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 w-full py-2.5 px-4 bg-blue-50 text-blue-600 font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px] rotate-45">navigation</span>
                        Buka di Google Maps
                    </a>
                </div>

                {/* COD Warning (Conditional) */}
                {paymentMethod === 'COD' && (
                    <div className="bg-red-50 rounded-xl p-5 border border-red-100 text-center animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center justify-center gap-2 text-red-600 font-bold text-sm mb-1">
                            <span className="material-symbols-outlined text-[20px]">payments</span>
                            TOTAL COD
                        </div>
                        <div className="text-3xl font-bold text-red-600 mb-1">Rp {totalAmount?.toLocaleString('id-ID')}</div>
                        <p className="text-xs text-red-500 opacity-90">Bayar tunai ke Merchant saat ambil pesanan</p>
                    </div>
                )}

                {/* Service/Payment Info (Non-COD fallback/additional info) */}
                {paymentMethod !== 'COD' && (
                    <div className="bg-green-50 rounded-xl p-4 border border-green-100 flex items-center gap-3">
                        <span className="material-symbols-outlined text-green-600 text-[24px]">verified</span>
                        <div>
                            <h3 className="text-sm font-bold text-green-800">Pembayaran Non-Tunai</h3>
                            <p className="text-xs text-green-700">Tidak perlu bayar ke Merchant.</p>
                        </div>
                    </div>
                )}


                {/* Customer Note */}
                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100 flex gap-3">
                    <span className="material-symbols-outlined text-yellow-600 shrink-0 text-[24px]">sticky_note_2</span>
                    <div>
                        <h3 className="text-sm font-bold text-yellow-700 mb-1 sm:mb-0">CATATAN PELANGGAN</h3>
                        <p className="text-sm text-slate-800 leading-relaxed italic">"{customerNote || '-'}"</p>
                    </div>
                </div>

                {/* Item List */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-4 bg-slate-50 flex justify-between items-center border-b border-slate-200">
                        <h3 className="font-bold text-slate-800">Daftar Item</h3>
                        <span className="bg-slate-200 text-xs font-semibold px-2 py-1 rounded text-slate-600">{orderItems.length} Item</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {orderItems.map((item, index) => (
                            <div key={index} className="p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => handleCheckItem(index)}>
                                <div className="pt-1">
                                    <input
                                        type="checkbox"
                                        checked={!!checkedItems[index]}
                                        onChange={() => handleCheckItem(index)}
                                        className="w-6 h-6 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                                    />
                                </div>
                                <div>
                                    <h4 className="font-bold text-base text-slate-900">{item.quantity}x {item.name}</h4>
                                    {item.notes && <p className="text-sm text-slate-500 mt-0.5">{item.notes}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="bg-slate-50 p-3 text-center border-t border-slate-200">
                        <p className="text-xs text-slate-500">Pastikan semua item sudah sesuai sebelum konfirmasi.</p>
                    </div>
                </div>
            </main>

            {/* Bottom Floating Action */}
            <div className="fixed bottom-[72px] left-0 right-0 px-4 pb-2 z-40 bg-gradient-to-t from-background-light via-background-light to-transparent pt-4 max-w-md mx-auto">
                <button
                    onClick={handleConfirmPickup}
                    disabled={!allItemsChecked || isConfirming}
                    className={`w - full font - bold py - 3.5 rounded - xl flex items - center justify - center gap - 2 shadow - sm transition - all active: scale - [0.98] ${allItemsChecked && !isConfirming
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        } `}
                >
                    <span className="material-symbols-outlined">{isConfirming ? 'refresh' : 'check_circle'}</span>
                    {isConfirming ? 'MEMPROSES...' : 'SAYA SUDAH AMBIL PESANAN'}
                </button>
            </div>

            <DriverBottomNavigation activeTab="orders" />
        </div>
    )
}

export default DriverPickupOrder
