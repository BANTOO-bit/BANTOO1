/**
 * OrderHistoryCard Component
 * Displays a completed or cancelled order in the history tab
 */
function OrderHistoryCard({ order, onReorder, onViewDetail, onReview, formatDate, getMerchantImage, isPreview = false }) {
    const isCancelled = order.status === 'cancelled'
    const hasReview = order.hasReview || false

    return (
        <div
            onClick={() => onViewDetail?.(order)}
            className={`bg-card-light dark:bg-card-dark rounded-2xl p-4 shadow-soft border border-border-color dark:border-gray-800 relative cursor-pointer active:bg-gray-50 dark:active:bg-gray-900/50 transition-colors ${isPreview ? 'opacity-60' : ''
                }`}
        >
            {/* Status badges and date */}
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-md ${isCancelled
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                        : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        }`}>
                        {isCancelled ? 'Dibatalkan' : 'Selesai'}
                    </span>
                    {hasReview && !isCancelled && (
                        <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-medium rounded-md">
                            Sudah Diulas
                        </span>
                    )}
                </div>
                <span className="text-[10px] text-text-secondary dark:text-gray-400">
                    {formatDate ? formatDate(order.createdAt || order.date) : order.date}
                </span>
            </div>

            {/* Merchant info */}
            <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
                    {getMerchantImage ? (
                        <img
                            src={getMerchantImage(order)}
                            alt={order.merchantName}
                            className="w-full h-full rounded-xl object-cover"
                        />
                    ) : (
                        <span className="material-symbols-outlined text-primary text-2xl">
                            {order.merchantType === 'grocery' ? 'shopping_bag' : 'restaurant'}
                        </span>
                    )}
                </div>
                <div>
                    <h3 className="font-bold text-sm truncate">{order.merchantName}</h3>
                    <p className="text-[11px] text-text-secondary dark:text-gray-400 mt-1 font-medium leading-relaxed line-clamp-2">
                        {order.items?.slice(0, 2).map(item => `${item.quantity}x ${item.name}`).join(', ')}
                        {order.items?.length > 2 && `, +${order.items.length - 2} lainnya`}
                    </p>
                </div>
            </div>

            {/* Bottom section with price and actions */}
            <div className="flex items-center justify-between pt-4 border-t border-dashed border-border-color dark:border-gray-800">
                <div className="flex flex-col">
                    <span className="text-[10px] text-text-secondary dark:text-gray-400 mb-0.5">Total Harga</span>
                    <span className="font-bold text-sm text-text-main dark:text-white">
                        Rp {order.total?.toLocaleString()}
                    </span>
                </div>
                <div className="flex gap-2">
                    {!isCancelled && !hasReview && onReview && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onReview?.(order)
                            }}
                            className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-text-main dark:text-gray-300 text-xs font-semibold rounded-full active:scale-95 transition-all hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            Beri Ulasan
                        </button>
                    )}
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onReorder?.(order)
                        }}
                        className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-full shadow-md active:scale-95 transition-all hover:bg-orange-600"
                    >
                        Pesan Lagi
                    </button>
                </div>
            </div>
        </div>
    )
}

export default OrderHistoryCard
