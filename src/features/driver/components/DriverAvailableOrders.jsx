import { useNavigate } from 'react-router-dom'
import { formatCurrency } from '@/utils/formatters'

/**
 * DriverAvailableOrders — Shows available orders list or searching animation.
 */
function DriverAvailableOrders({ availableOrders }) {
    const navigate = useNavigate()

    if (availableOrders.length > 0) {
        return (
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
                                <p className="text-sm font-bold text-slate-900">{formatCurrency(order.total_amount || 0)}</p>
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
        )
    }

    // Searching animation
    return (
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
    )
}

export default DriverAvailableOrders
