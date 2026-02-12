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
}

export default Skeleton
