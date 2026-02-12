import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useOrder } from '../../../context/OrderContext'
import { useToast } from '../../../context/ToastContext'
import orderService from '../../../services/orderService'
import { generateOrderId } from '../../../utils/orderUtils'
import { handleError } from '../../../utils/errorHandler'

function DriverIncomingOrder() {
    const navigate = useNavigate()
    const { orderId } = useParams()
    const { user } = useAuth()
    const { setActiveOrder } = useOrder()
    const toast = useToast()
    const [timeLeft, setTimeLeft] = useState(25)
    const [availableOrder, setAvailableOrder] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isAccepting, setIsAccepting] = useState(false)

    // Fetch available orders
    useEffect(() => {
        async function fetchAvailableOrders() {
            try {
                setIsLoading(true)
                const orders = await orderService.getAvailableOrders()

                if (orders && orders.length > 0) {
                    // Show first available order
                    setAvailableOrder(orders[0])
                } else {
                    // No orders available, go back to dashboard
                    setTimeout(() => navigate('/driver/dashboard'), 2000)
                }
            } catch (error) {
                console.error('Error fetching available orders:', error)
                setTimeout(() => navigate('/driver/dashboard'), 2000)
            } finally {
                setIsLoading(false)
            }
        }

        fetchAvailableOrders()
    }, [])

    // Timer countdown
    useEffect(() => {
        if (timeLeft > 0 && availableOrder) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
            return () => clearTimeout(timer)
        } else if (timeLeft === 0) {
            // Time's up, go back to dashboard
            navigate('/driver/dashboard')
        }
    }, [timeLeft, availableOrder, navigate])

    const handleAcceptOrder = async () => {
        if (!availableOrder || isAccepting) return

        try {
            setIsAccepting(true)

            // Accept order via API
            await orderService.acceptOrder(availableOrder.id)

            // Set active order in context
            setActiveOrder({
                id: generateOrderId(availableOrder.id),
                dbId: availableOrder.id,
                merchantName: availableOrder.merchant?.name || 'Merchant',
                merchantAddress: availableOrder.merchant?.address || '',
                customerName: availableOrder.customer?.full_name || 'Customer',
                customerAddress: availableOrder.delivery_address || '',
                totalAmount: availableOrder.total_amount,
                paymentMethod: availableOrder.payment_method === 'cod' ? 'COD' : availableOrder.payment_method.toUpperCase(),
                status: 'accepted',
                items: availableOrder.items?.map(item => ({
                    name: item.product_name,
                    quantity: item.quantity,
                    notes: item.notes
                })) || [],
                distances: {
                    toMerchant: '-- km',
                    toCustomer: '-- km'
                },
                customerNote: availableOrder.notes || ''
            })

            // Navigate to pickup page (handles both COD and Wallet)
            navigate('/driver/order/pickup')
        } catch (error) {
            console.error('Error accepting order:', error)
            handleError(error, toast, { context: 'Accept Order' })
            setIsAccepting(false)
        }
    }

    const handleRejectOrder = () => {
        navigate('/driver/dashboard')
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light">
                <div className="text-center">
                    <span className="material-symbols-outlined text-5xl text-gray-300 mb-2 animate-spin">refresh</span>
                    <p className="text-sm text-text-secondary">Mencari pesanan...</p>
                </div>
            </div>
        )
    }

    if (!availableOrder) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light">
                <div className="text-center">
                    <span className="material-symbols-outlined text-5xl text-gray-300 mb-2">search_off</span>
                    <p className="text-sm text-text-secondary">Tidak ada pesanan tersedia</p>
                </div>
            </div>
        )
    }

    return (
        <div className="font-display bg-background-light text-slate-900 antialiased min-h-screen relative flex flex-col overflow-x-hidden max-w-md mx-auto bg-white shadow-none sm:shadow-2xl">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-colors duration-300">
                <div className="flex items-center p-4 pb-3 justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-2 ring-[#0d59f2]/20" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBbrWfUKf0v3ygsHK1Gd08zoduoiOHyK-AzHdSjbcrg-uJJcqfeBou-uEGP9nsqoEjQe_HeTGeRfUq3tMA0xDsdoeQbX_WQr9RZDIlAbT4u29ITJuCJAq8hXRZmjfPm4Vh2VJP7RZ0urGXOPUvNj1H_ggdF-JS0OBQ0Cf6ld73t9kKCtRoecNq0qHmHIJNL9AyMPKeZhZMzVlWfQ6NbVlkNe7LPVQjnVKIpSMVCeRGY_zCv2G4v9EDM6KFZq-jHgctmifnVATzUlQ")' }}>
                            </div>
                            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white"></span>
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-slate-900 text-base font-bold leading-tight tracking-tight">Distrik Pusat Kota</h2>
                            <span className="text-xs text-green-600 font-bold">Status: Online</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content (Blurred) */}
            <main className="flex-1 pb-24 bg-background-light opacity-50 blur-[2px] pointer-events-none select-none">
                <div className="p-4 pb-2">
                    <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-green-200 bg-green-50/60 p-5 shadow-none">
                        <div className="flex w-full items-center justify-between">
                            <div className="flex flex-col gap-1">
                                <p className="text-green-700 text-lg font-bold leading-tight">Anda Sedang Online</p>
                                <p className="text-green-600/80 text-sm font-bold leading-normal flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[18px]">hourglass_top</span>
                                    Menunggu pesanan baru...
                                </p>
                            </div>
                            <label className="relative flex h-8 w-14 cursor-pointer items-center rounded-full border-none bg-green-500 p-1 transition-all">
                                <span className="absolute left-1 h-6 w-6 rounded-full bg-white transition-all translate-x-6 shadow-none"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </main>

            {/* Incoming Order Overlay */}
            <div className="fixed inset-0 z-[100] w-full max-w-md mx-auto flex flex-col justify-end sm:justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
                <div className="relative w-full bg-white rounded-2xl shadow-none overflow-hidden border border-slate-200 animate-slide-up">
                    <div className="bg-slate-50 border-b border-slate-100 p-3 pt-4 flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2 text-red-600 text-xs font-bold uppercase tracking-wide">
                            <span className="material-symbols-outlined text-[18px] animate-pulse">timer</span>
                            Pesanan akan hilang dalam {timeLeft} detik
                        </div>
                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 transition-all duration-1000 ease-linear" style={{ width: `${(timeLeft / 30) * 100}% ` }}></div>
                        </div>
                    </div>
                    <div className="p-4 flex flex-col gap-3">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-start gap-3">
                                <div className="bg-orange-100 text-orange-600 rounded-lg p-2.5 shrink-0 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[24px]">storefront</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-slate-900 leading-tight">
                                        {availableOrder.merchant?.name || 'Merchant'}
                                    </h3>
                                    <p className="text-slate-500 text-xs mt-1">
                                        {availableOrder.merchant?.address || 'Alamat merchant'}
                                    </p>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-2 border border-slate-100 shadow-none">
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex flex-col items-center gap-0.5">
                                        <span className="text-slate-400 text-[10px] font-bold uppercase">Ke Warung</span>
                                        <span className="text-slate-900 font-bold text-base">1.2 km</span>
                                    </div>
                                    <div className="h-px w-12 bg-slate-300 relative">
                                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 size-2 bg-slate-300 rounded-full"></div>
                                    </div>
                                    <div className="flex flex-col items-center gap-0.5">
                                        <span className="text-slate-400 text-[10px] font-bold uppercase">Ke Customer</span>
                                        <span className="text-slate-900 font-bold text-base">3.5 km</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="h-px bg-slate-100 w-full my-1"></div>
                        <div className="text-center space-y-1">
                            <div className="inline-flex items-center gap-1.5 bg-red-600 text-white px-3 py-1 rounded-full shadow-none border border-red-600">
                                <span className="material-symbols-outlined text-[16px]">payments</span>
                                <span className="text-xs font-bold tracking-wide">
                                    METODE: {availableOrder.payment_method === 'cod' ? 'TUNAI (COD)' : availableOrder.payment_method.toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-0.5">Total Bayar</p>
                                <p className="text-3xl font-black text-red-600 leading-none tracking-tight">
                                    Rp {availableOrder.total_amount?.toLocaleString('id-ID') || '0'}
                                </p>
                            </div>
                            {availableOrder.payment_method === 'cod' && (
                                <div className="bg-red-50 text-red-700 text-[10px] font-medium px-3 py-1.5 rounded-lg inline-block">
                                    ⚠️ Pastikan menagih uang tunai ke pelanggan
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-2 mt-2">
                            <button
                                onClick={handleAcceptOrder}
                                disabled={isAccepting}
                                className="w-full bg-green-600 hover:bg-green-700 active:scale-[0.98] transition-all text-white font-bold text-lg h-12 rounded-xl shadow-none flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="group-hover:scale-110 transition-transform">
                                    {isAccepting ? 'MEMPROSES...' : 'TERIMA ORDER'}
                                </span>
                            </button>
                            <button
                                onClick={handleRejectOrder}
                                disabled={isAccepting}
                                className="w-full text-slate-400 font-semibold text-sm py-2 hover:text-slate-600 transition-colors disabled:opacity-50"
                            >
                                Tolak pesanan ini
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DriverIncomingOrder
