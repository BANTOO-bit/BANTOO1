import { useNavigate } from 'react-router-dom'
import { useOrder } from '@/context/OrderContext'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'

function ReorderSection() {
    const navigate = useNavigate()
    const { getCompletedOrders } = useOrder()
    const { addToCart, clearCart, setMerchantInfo } = useCart()
    const toast = useToast()

    // Get last 5 completed/delivered orders
    const completedOrders = getCompletedOrders()
        .filter(o => o.status === 'delivered' || o.status === 'completed')
        .slice(0, 5)

    if (completedOrders.length === 0) return null

    const handleReorder = (order) => {
        clearCart()

        const merchantName = order.merchant?.name || order.merchants?.name || 'Warung'
        const merchantId = order.merchant_id

        if (merchantName) {
            setMerchantInfo({ name: merchantName, id: merchantId })
        }

        const items = order.items || order.order_items || []
        items.forEach(item => {
            for (let i = 0; i < (item.quantity || 1); i++) {
                addToCart({
                    id: item.product_id || item.id,
                    name: item.product_name || item.name,
                    price: item.price_at_time || item.price,
                    image: item.menu_items?.image_url || item.image,
                })
            }
        })

        toast.success('Item ditambahkan ke keranjang!')
        setTimeout(() => navigate('/cart'), 800)
    }

    return (
        <section className="animate-fade-in-up stagger-3">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold text-text-main">Pesan Lagi</h2>
                <button
                    onClick={() => navigate('/orders')}
                    className="text-sm text-primary font-medium hover:text-primary/80 flex items-center gap-0.5"
                >
                    Riwayat
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-2">
                {completedOrders.map(order => {
                    const merchantName = order.merchant?.name || order.merchants?.name || 'Warung'
                    const merchantImage = order.merchant?.image_url || order.merchants?.image_url
                    const itemCount = (order.items || order.order_items || []).reduce((sum, i) => sum + (i.quantity || 1), 0)
                    const totalAmount = order.total_amount

                    return (
                        <div
                            key={order.id}
                            className="flex-none w-[200px] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                        >
                            {/* Merchant Image */}
                            <div className="h-20 w-full relative bg-gray-100">
                                {merchantImage ? (
                                    <img
                                        src={merchantImage}
                                        alt={merchantName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-3xl text-orange-400">storefront</span>
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-3">
                                <h3 className="text-sm font-bold text-text-main truncate">{merchantName}</h3>
                                <p className="text-[11px] text-text-secondary mt-0.5">
                                    {itemCount} item • Rp {(totalAmount || 0).toLocaleString('id-ID')}
                                </p>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleReorder(order)
                                    }}
                                    className="mt-2 w-full py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg active:scale-95 transition-transform flex items-center justify-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-[14px]">replay</span>
                                    Pesan Lagi
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}

export default ReorderSection
