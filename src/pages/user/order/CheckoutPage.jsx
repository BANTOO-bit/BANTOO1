import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useCart } from '../../../context/CartContext'
import { useAddress } from '../../../context/AddressContext'
import orderService from '../../../services/orderService'
import dashboardService from '../../../services/dashboardService'
import BackButton from '../../../components/shared/BackButton'
import MerchantShopOpenWarning from '../../../components/shared/MerchantShopOpenWarning'
import { useToast } from '../../../context/ToastContext'
import { handleError, handleSuccess } from '../../../utils/errorHandler'

function CheckoutPage() {
    const navigate = useNavigate()
    const { user, isShopOpen } = useAuth()
    const { cartItems, merchantInfo, cartTotal, deliveryFee, grandTotal, clearCart, calculateDeliveryFee } = useCart()
    const { selectedAddress, addresses, selectAddress } = useAddress()
    const toast = useToast()
    const [selectedPayment, setSelectedPayment] = useState('cash')
    const [isProcessing, setIsProcessing] = useState(false)
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [showAddressModal, setShowAddressModal] = useState(false)
    const [paymentMethods, setPaymentMethods] = useState([])
    const [loadingPayments, setLoadingPayments] = useState(true)

    useEffect(() => {
        const effectiveMerchantId = merchantInfo?.id || (cartItems.length > 0 ? cartItems[0].merchantId : null)

        if (effectiveMerchantId && selectedAddress?.lat && selectedAddress?.lng) {
            calculateDeliveryFee(effectiveMerchantId, selectedAddress.lat, selectedAddress.lng)
        }
    }, [merchantInfo, cartItems, selectedAddress, calculateDeliveryFee])

    useEffect(() => {
        async function fetchPaymentMethods() {
            if (!user?.id) return

            try {
                const methods = await dashboardService.getPaymentMethods(user.id)
                setPaymentMethods(methods)
                setLoadingPayments(false)
            } catch (error) {
                handleError(error, toast, { context: 'Fetch payment methods' })
                // Fallback to basic payment methods
                setPaymentMethods([
                    { id: 'cash', name: 'Tunai (COD)', description: 'Bayar saat pesanan tiba', icon: 'payments' }
                ])
                setLoadingPayments(false)
            }
        }

        fetchPaymentMethods()
    }, [user?.id])

    const handlePlaceOrder = async () => {
        // Check if merchant shop is open
        if (user?.isMerchant && isShopOpen) {
            toast.error('Tutup warung terlebih dahulu untuk memesan sebagai pelanggan')
            return
        }

        if (!selectedAddress) {
            toast.error('Pilih alamat pengiriman terlebih dahulu')
            return
        }

        const effectiveMerchantId = merchantInfo?.id || (cartItems.length > 0 ? cartItems[0].merchantId : null)

        if (!effectiveMerchantId) {
            toast.error('Informasi merchant tidak ditemukan')
            return
        }

        setIsProcessing(true)

        try {
            // C4: Validate cart items are still available before creating order
            const validation = await orderService.validateCartItems(
                cartItems.map(item => ({ productId: item.id, name: item.name }))
            )
            if (!validation.valid) {
                const names = validation.unavailable_items.map(i => i.name).join(', ')
                toast.error(`Beberapa item tidak tersedia: ${names}. Hapus dari keranjang dan coba lagi.`)
                setIsProcessing(false)
                return
            }

            // Prepare order data
            const orderData = {
                merchantId: effectiveMerchantId,
                items: cartItems.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    price: item.price,
                    name: item.name,
                    notes: item.notes || null
                })),
                deliveryAddress: typeof selectedAddress === 'string' ? selectedAddress : selectedAddress.address,
                deliveryDetail: selectedAddress.detail || null,
                customerName: user?.profile?.full_name || selectedAddress.name || 'Customer',
                customerPhone: user?.profile?.phone || selectedAddress.phone || '',
                customerLat: selectedAddress.lat || null,
                customerLng: selectedAddress.lng || null,
                paymentMethod: selectedPayment,
                deliveryFee: deliveryFee || 8000,
                notes: null
            }

            // Create order via API
            const order = await orderService.createOrder(orderData)

            // Clear cart after successful order
            clearCart()

            // Navigate to success page with order ID
            navigate('/order-success', { state: { orderId: order.id } })
        } catch (error) {
            console.error('Error creating order:', error)
            handleError(error, toast, { context: 'Create Order' })
        } finally {
            setIsProcessing(false)
        }
    }

    const selectedPaymentMethod = paymentMethods.find(p => p.id === selectedPayment)

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background-light px-4">
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">shopping_cart</span>
                <p className="text-text-secondary mb-4">Keranjang kosong</p>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-primary text-white font-bold rounded-xl"
                >
                    Kembali ke Home
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-background-light pb-bottom-nav">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white px-4 pt-12 pb-4 border-b border-border-color">
                <div className="relative flex items-center justify-center min-h-[40px]">
                    <BackButton confirmMessage="Batal memesan? Data checkoutmu mungkin hilang." />
                    <h1 className="text-lg font-bold">Checkout</h1>
                </div>
            </header>

            {/* Merchant Shop Open Warning - Blocking */}
            <div className="px-4 mt-4">
                <MerchantShopOpenWarning blocking={true} />
            </div>

            <div className="flex-1 px-4 space-y-4 mt-4">
                {/* Delivery Address */}
                <div
                    className="bg-white rounded-2xl border border-border-color p-4 cursor-pointer active:bg-gray-50"
                    onClick={() => setShowAddressModal(true)}
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">location_on</span>
                            <span className="font-bold text-sm">Alamat Pengiriman</span>
                        </div>
                        <span className="material-symbols-outlined text-text-secondary text-sm">chevron_right</span>
                    </div>
                    {selectedAddress ? (
                        <div className="ml-7">
                            <p className="text-sm font-medium text-text-main">{selectedAddress.label}</p>
                            <p className="text-xs text-text-secondary mt-0.5">{selectedAddress.address}</p>
                            <p className="text-xs text-text-secondary">{selectedAddress.detail}</p>
                        </div>
                    ) : (
                        <p className="text-sm text-text-secondary ml-7">Pilih alamat pengiriman</p>
                    )}
                </div>

                {/* Delivery Time */}
                <div className="bg-white rounded-2xl border border-border-color p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-primary">schedule</span>
                        <span className="font-bold text-sm">Waktu Pengiriman</span>
                    </div>
                    <div className="ml-7 bg-orange-50 border border-orange-100 rounded-xl p-3 flex items-center justify-between">
                        <div>
                            <p className="font-bold text-sm text-primary">Kirim Sekarang</p>
                            <p className="text-xs text-text-secondary mt-0.5">Estimasi tiba 15-25 menit</p>
                        </div>
                        <span className="material-symbols-outlined text-primary">two_wheeler</span>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-2xl border border-border-color p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-primary">receipt_long</span>
                        <span className="font-bold text-sm">Rincian Pesanan</span>
                    </div>

                    {merchantInfo && (
                        <div className="ml-7 mb-3 pb-3 border-b border-border-color">
                            <p className="font-medium text-sm">{merchantInfo.name}</p>
                        </div>
                    )}

                    <div className="ml-7 space-y-2">
                        {cartItems.map(item => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span className="text-text-secondary">{item.quantity}x {item.name}</span>
                                <span className="font-medium">Rp {(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                        ))}
                        <div className="pt-2 border-t border-border-color space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Subtotal</span>
                                <span>Rp {cartTotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Ongkos Kirim</span>
                                <span>Rp {deliveryFee.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Method */}
                <div
                    className="bg-white rounded-2xl border border-border-color p-4 cursor-pointer active:bg-gray-50"
                    onClick={() => setShowPaymentModal(true)}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">credit_card</span>
                            <span className="font-bold text-sm">Metode Pembayaran</span>
                        </div>
                        <span className="material-symbols-outlined text-text-secondary text-sm">chevron_right</span>
                    </div>
                    <div className="flex items-center gap-2 ml-7 mt-2">
                        <span className="material-symbols-outlined text-text-main text-lg">{selectedPaymentMethod?.icon}</span>
                        <span className="text-sm font-medium">{selectedPaymentMethod?.name}</span>
                    </div>
                </div>
            </div>

            {/* Bottom Order Button */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border-color p-4 z-50">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-text-secondary">Total Pembayaran</span>
                    <span className="text-lg font-bold text-primary">Rp {grandTotal.toLocaleString()}</span>
                </div>
                <button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing || (user?.isMerchant && isShopOpen)}
                    className={`w-full py-4 rounded-2xl font-bold text-white transition-all ${isProcessing || (user?.isMerchant && isShopOpen)
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-primary active:scale-[0.98]'
                        }`}
                >
                    {isProcessing ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                            Memproses...
                        </span>
                    ) : user?.isMerchant && isShopOpen ? (
                        'Tutup Warung Untuk Memesan'
                    ) : (
                        'Pesan Sekarang'
                    )}
                </button>
            </div>

            {/* Payment Method Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
                    <div className="w-full bg-white rounded-t-3xl p-6 animate-slide-up">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Pilih Metode Pembayaran</h3>
                            <button onClick={() => setShowPaymentModal(false)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="space-y-2">
                            {paymentMethods.map(method => (
                                <button
                                    key={method.id}
                                    onClick={() => {
                                        setSelectedPayment(method.id)
                                        setShowPaymentModal(false)
                                    }}
                                    className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${selectedPayment === method.id
                                        ? 'border-primary bg-orange-50'
                                        : 'border-border-color'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-2xl text-primary">{method.icon}</span>
                                    <div className="flex-1 text-left">
                                        <p className="font-medium">{method.name}</p>
                                        <p className="text-xs text-text-secondary">{method.description}</p>
                                    </div>
                                    {selectedPayment === method.id && (
                                        <span className="material-symbols-outlined text-primary">check_circle</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Address Selection Modal */}
            {showAddressModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
                    <div className="w-full bg-white rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto animate-slide-up">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Pilih Alamat</h3>
                            <button onClick={() => setShowAddressModal(false)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="space-y-2">
                            {addresses.map(addr => (
                                <button
                                    key={addr.id}
                                    onClick={() => {
                                        selectAddress(addr.id)
                                        setShowAddressModal(false)
                                    }}
                                    className={`w-full text-left p-4 rounded-xl border transition-all ${selectedAddress?.id === addr.id
                                        ? 'border-primary bg-orange-50'
                                        : 'border-border-color'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium">{addr.label}</span>
                                        {addr.isDefault && (
                                            <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full">Utama</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-text-secondary">{addr.address}</p>
                                    <p className="text-xs text-text-secondary">{addr.detail}</p>
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => {
                                setShowAddressModal(false)
                                navigate('/address/add')
                            }}
                            className="w-full mt-4 py-3 border-2 border-dashed border-primary text-primary font-medium rounded-xl flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">add</span>
                            Tambah Alamat Baru
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CheckoutPage
