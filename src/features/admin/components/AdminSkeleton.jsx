/**
 * AdminSkeleton — Reusable skeleton loading components for admin panel.
 * Provides shimmer animation placeholders instead of spinners.
 */

export function SkeletonLine({ width = 'w-full', height = 'h-4', className = '' }) {
    return (
        <div className={`${width} ${height} bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${className}`} />
    )
}

export function SkeletonCircle({ size = 'w-10 h-10', className = '' }) {
    return (
        <div className={`${size} bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse ${className}`} />
    )
}

export function SkeletonCard({ className = '' }) {
    return (
        <div className={`bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] p-5 ${className}`}>
            <div className="flex items-center gap-2 mb-4">
                <SkeletonCircle size="w-8 h-8" />
                <SkeletonLine width="w-24" height="h-3" />
            </div>
            <SkeletonLine width="w-20" height="h-8" className="mb-2" />
            <SkeletonLine width="w-32" height="h-3" />
        </div>
    )
}

export function SkeletonTable({ rows = 5, cols = 4, className = '' }) {
    return (
        <div className={`bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] overflow-hidden ${className}`}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#e5e7eb] dark:border-[#2a3b4d] bg-[#f9fafb] dark:bg-[#1e2c3a]">
                <div className="flex gap-6">
                    {Array.from({ length: cols }).map((_, i) => (
                        <SkeletonLine key={i} width="w-20" height="h-3" />
                    ))}
                </div>
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIdx) => (
                <div key={rowIdx} className="px-6 py-4 border-b border-[#e5e7eb] dark:border-[#2a3b4d] last:border-b-0">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 flex-1">
                            <SkeletonCircle size="w-9 h-9" />
                            <div className="flex-1">
                                <SkeletonLine width="w-28" height="h-3.5" className="mb-1.5" />
                                <SkeletonLine width="w-16" height="h-2.5" />
                            </div>
                        </div>
                        {Array.from({ length: cols - 1 }).map((_, colIdx) => (
                            <SkeletonLine key={colIdx} width="w-20" height="h-3" />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

export function SkeletonChart({ className = '' }) {
    return (
        <div className={`bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] p-5 ${className}`}>
            <SkeletonLine width="w-32" height="h-3" className="mb-6" />
            <div className="flex items-end gap-2 h-40">
                {[40, 65, 30, 80, 55, 45, 70].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                        <div
                            className="w-full bg-gray-200 dark:bg-gray-700 rounded-t-md animate-pulse"
                            style={{ height: `${h}%` }}
                        />
                        <SkeletonLine width="w-6" height="h-2" />
                    </div>
                ))}
            </div>
        </div>
    )
}

/**
 * Full page skeleton for admin pages with stats + table
 */
export function AdminPageSkeleton() {
    return (
        <div className="flex flex-col gap-5 animate-in fade-in duration-300">
            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
            {/* Table */}
            <SkeletonTable rows={6} cols={5} />
        </div>
    )
}
