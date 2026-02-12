function OrderCardSkeleton() {
    return (
        <div className="bg-white dark:bg-card-dark rounded-2xl p-4 border border-slate-100 dark:border-gray-700 shadow-sm animate-pulse">
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded w-24"></div>
                <div className="h-6 bg-slate-200 dark:bg-gray-700 rounded-full w-20"></div>
            </div>

            {/* Customer info */}
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-slate-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                    <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-slate-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
            </div>

            {/* Items */}
            <div className="space-y-2 mb-3">
                <div className="h-3 bg-slate-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-3 bg-slate-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-gray-700">
                <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded w-20"></div>
                <div className="h-8 bg-slate-200 dark:bg-gray-700 rounded w-24"></div>
            </div>
        </div>
    )
}

export default OrderCardSkeleton
