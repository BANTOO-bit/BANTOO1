function Skeleton({ className = '', variant = 'rectangular' }) {
    const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700'

    const variantClasses = {
        rectangular: 'rounded-lg',
        circular: 'rounded-full',
        text: 'rounded h-4',
    }

    return (
        <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
    )
}

// Preset skeleton components
export function MerchantCardSkeleton() {
    return (
        <div className="flex items-center p-3 gap-3 rounded-xl bg-card-light dark:bg-card-dark shadow-soft border border-border-color dark:border-gray-700">
            <Skeleton className="w-20 h-20 rounded-lg" />
            <div className="flex flex-col flex-1 gap-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex gap-4 mt-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </div>
        </div>
    )
}

export function MenuCardSkeleton() {
    return (
        <div className="flex-none w-[160px] bg-card-light dark:bg-card-dark rounded-xl shadow-soft border border-border-color dark:border-gray-700 overflow-hidden">
            <Skeleton className="h-32 w-full rounded-none" />
            <div className="p-3">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton variant="circular" className="w-7 h-7" />
                </div>
            </div>
        </div>
    )
}

export function CategorySkeleton() {
    return (
        <div className="flex flex-col items-center gap-2">
            <Skeleton variant="circular" className="w-16 h-16" />
            <Skeleton className="h-3 w-12" />
        </div>
    )
}

export function HomePageSkeleton() {
    return (
        <div className="px-4 pt-4 space-y-6">
            {/* Header skeleton */}
            <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-32" />
                <Skeleton variant="circular" className="w-10 h-10" />
            </div>

            {/* Address skeleton */}
            <Skeleton className="h-10 w-full rounded-full" />

            {/* Search skeleton */}
            <Skeleton className="h-11 w-full rounded-full" />

            {/* Categories skeleton */}
            <div className="grid grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                    <CategorySkeleton key={i} />
                ))}
            </div>

            {/* Menu populer skeleton */}
            <div>
                <Skeleton className="h-6 w-32 mb-3" />
                <div className="flex gap-4 overflow-hidden">
                    {[...Array(3)].map((_, i) => (
                        <MenuCardSkeleton key={i} />
                    ))}
                </div>
            </div>

            {/* Merchant list skeleton */}
            <div className="space-y-3">
                <Skeleton className="h-6 w-40" />
                {[...Array(3)].map((_, i) => (
                    <MerchantCardSkeleton key={i} />
                ))}
            </div>
        </div>
    )
} export function OrderHistoryCardSkeleton() {
    return (
        <div className="bg-card-light dark:bg-card-dark rounded-2xl p-4 shadow-soft border border-border-color dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-5 w-16 rounded-lg" />
            </div>
            <div className="flex items-center gap-3 mb-3">
                <Skeleton variant="circular" className="w-12 h-12" />
                <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-48" />
                </div>
            </div>
            <div className="border-t border-border-color dark:border-gray-700 pt-3 flex justify-between items-center">
                <div>
                    <Skeleton className="h-3 w-16 mb-1" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-24 rounded-xl" />
                    <Skeleton className="h-9 w-24 rounded-xl" />
                </div>
            </div>
        </div>
    )
}

export function OrderDetailSkeleton() {
    return (
        <div className="px-4 space-y-4 mt-4">
            {/* Status card */}
            <div className="bg-card-light dark:bg-card-dark rounded-2xl p-5 border border-border-color dark:border-gray-700 flex flex-col items-center gap-3">
                <Skeleton variant="circular" className="w-16 h-16" />
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-56" />
            </div>
            {/* Address */}
            <div className="bg-card-light dark:bg-card-dark rounded-2xl p-4 border border-border-color dark:border-gray-700">
                <Skeleton className="h-4 w-32 mb-3" />
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-3/4" />
            </div>
            {/* Items */}
            <div className="bg-card-light dark:bg-card-dark rounded-2xl p-4 border border-border-color dark:border-gray-700">
                <Skeleton className="h-4 w-28 mb-4" />
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-3">
                            <Skeleton className="w-10 h-10 rounded-lg" />
                            <div>
                                <Skeleton className="h-3 w-32 mb-1" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        </div>
                        <Skeleton className="h-4 w-20" />
                    </div>
                ))}
            </div>
            {/* Payment */}
            <div className="bg-card-light dark:bg-card-dark rounded-2xl p-4 border border-border-color dark:border-gray-700">
                <Skeleton className="h-4 w-36 mb-3" />
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-full mb-2" />
                <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-3" />
                <div className="flex justify-between">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-24" />
                </div>
            </div>
        </div>
    )
}

export default Skeleton
