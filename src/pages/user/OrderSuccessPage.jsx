import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import orderService from '../../services/orderService'
import { formatOrderId } from '../../utils/orderUtils'

function OrderSuccessPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchOrder() {
            // Priority 1: Get ID from router state (passed from Checkout)
            const orderId = location.state?.orderId

            if (orderId) {
                try {
                    const data = await orderService.getOrder(orderId)
                    setOrder({
                        ...data,
                        merchantName: data.merchant?.name,
                        total: data.total_amount,
                        paymentMethod: { name: data.payment_method === 'wallet' ? 'Saldo Bantoo' : 'Tunai (COD)' }
                    })
                } catch (error) {
                    console.error('Failed to fetch order:', error)
                } finally {
                    setLoading(false)
                }
                return
            }

            // Priority 2: Fallback to localStorage (legacy/refresh case)
            const savedOrder = localStorage.getItem('bantoo_current_order')
            if (savedOrder) {
                const parsed = JSON.parse(savedOrder)
                // Ensure payment method name is consistent
                if (parsed.payment_method !== 'wallet' && parsed.paymentMethod?.name === 'Tunai') {
                    parsed.paymentMethod.name = 'Tunai (COD)'
                }
                setOrder(parsed)
            }
            setLoading(false)
        }

        fetchOrder()
    }, [location.state])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-background-light">
            {/* Success Animation Area */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
                {/* Success Icon */}
                <div className="relative mb-6">
                    <div className="w-28 h-28 bg-green-100 rounded-full flex items-center justify-center animate-bounce-gentle">
                        <span className="material-symbols-outlined text-green-500 text-6xl">check_circle</span>
                    </div>
                    {/* Confetti-like decorations */}
                    <div className="absolute -top-2 -left-2 w-4 h-4 bg-primary rounded-full animate-ping" />
                    <div className="absolute -top-1 -right-3 w-3 h-3 bg-yellow-400 rounded-full animate-ping delay-100" />
                    <div className="absolute -bottom-1 -left-3 w-3 h-3 bg-blue-400 rounded-full animate-ping delay-200" />
                </div>

                <h1 className="text-2xl font-bold text-text-main mb-2">Pesanan Berhasil!</h1>
                <p className="text-text-secondary mb-2">
                    Terima kasih sudah memesan di Bantoo!
                </p>

                {order && (
                    <div className="bg-white rounded-2xl border border-border-color p-4 w-full max-w-sm mt-6 text-left">
                        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-border-color">
                            <div className="w-10 h-10 flex items-center justify-center bg-orange-50 rounded-lg">
                                <span className="material-symbols-outlined text-primary">storefront</span>
                            </div>
                            <div>
                                <p className="font-bold text-sm">{order.merchantName}</p>
                                <p className="text-xs text-text-secondary">{formatOrderId(order.id)}</p>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Total Pembayaran</span>
                                <span className="font-bold text-primary">Rp {order.total?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Metode Pembayaran</span>
                                <span className="font-medium">{order.paymentMethod?.name || 'Tunai (COD)'}</span>
                            </div>
                        </div>

                        <div className="mt-4 p-3 bg-orange-50 rounded-xl">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-sm">schedule</span>
                                <span className="text-xs font-medium text-primary">Estimasi tiba 15-25 menit</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Actions */}
            <div className="p-5 space-y-3">
                <button
                    onClick={() => navigate(order?.id ? `/tracking/${order.id}` : '/tracking')}
                    className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined">location_on</span>
                    Lacak Pesanan
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="w-full py-4 bg-white text-text-main font-medium rounded-2xl border border-border-color active:scale-[0.98] transition-transform"
                >
                    Kembali ke Beranda
                </button>
            </div>

            <style>{`
                @keyframes bounce-gentle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-bounce-gentle {
                    animation: bounce-gentle 2s infinite;
                }
                .delay-100 { animation-delay: 0.1s; }
                .delay-200 { animation-delay: 0.2s; }
            `}</style>
        </div>
    )
}

export default OrderSuccessPage
