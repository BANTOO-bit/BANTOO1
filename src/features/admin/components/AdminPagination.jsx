/**
 * AdminPagination — Reusable pagination for admin list pages
 * @param {{ currentPage: number, totalItems: number, itemsPerPage: number, onPageChange: (page: number) => void, label?: string }} props
 */
export default function AdminPagination({ currentPage, totalItems, itemsPerPage, onPageChange, label = 'item' }) {
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
    const start = (currentPage - 1) * itemsPerPage + 1
    const end = Math.min(currentPage * itemsPerPage, totalItems)

    if (totalItems === 0) return null

    return (
        <div className="px-6 py-4 border-t border-[#e5e7eb] dark:border-[#2a3b4d] flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-[#617589] dark:text-[#94a3b8]">
                Menampilkan <span className="font-semibold text-[#111418] dark:text-white">{start}-{end}</span> dari <span className="font-semibold text-[#111418] dark:text-white">{totalItems.toLocaleString()}</span> {label}
            </p>
            {totalPages > 1 && (
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="p-1.5 rounded-lg text-[#617589] dark:text-[#94a3b8] hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                        .reduce((acc, p, i, arr) => {
                            if (i > 0 && p - arr[i - 1] > 1) acc.push('...')
                            acc.push(p)
                            return acc
                        }, [])
                        .map((p, i) =>
                            p === '...' ? (
                                <span key={`dots-${i}`} className="px-1 text-[#617589] dark:text-[#94a3b8] text-sm">…</span>
                            ) : (
                                <button
                                    key={p}
                                    onClick={() => onPageChange(p)}
                                    className={`min-w-[32px] h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === p
                                            ? 'bg-primary text-white'
                                            : 'text-[#617589] dark:text-[#94a3b8] hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d]'
                                        }`}
                                >
                                    {p}
                                </button>
                            )
                        )}
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className="p-1.5 rounded-lg text-[#617589] dark:text-[#94a3b8] hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                    </button>
                </div>
            )}
        </div>
    )
}
