export default function AdminEmptyState({
    title = "Belum Ada Data",
    description = "Data akan muncul di sini setelah tersedia.",
    icon = "inbox",
    actionLabel,
    onAction,
    secondaryAction
}) {
    return (
        <div className="flex flex-col items-center justify-center flex-1 bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm p-12 lg:p-24 text-center h-full min-h-[400px]">
            <div className="w-24 h-24 lg:w-32 lg:h-32 bg-[#f6f7f8] dark:bg-[#2a3b4d] rounded-full flex items-center justify-center mb-6 lg:mb-8 ring-8 ring-[#f6f7f8]/50 dark:ring-[#2a3b4d]/50">
                <span className="material-symbols-outlined text-[48px] lg:text-[64px] text-[#617589] dark:text-[#94a3b8]">{icon}</span>
            </div>
            <h3 className="text-xl lg:text-2xl font-bold text-[#111418] dark:text-white mb-2 lg:mb-3 tracking-tight">{title}</h3>
            <p className="text-[#617589] dark:text-[#94a3b8] max-w-md mb-8 lg:mb-10 text-sm lg:text-base leading-relaxed">
                {description}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
                {actionLabel && onAction && (
                    <button
                        onClick={onAction}
                        className="px-6 py-2.5 bg-admin-primary hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        {actionLabel}
                    </button>
                )}
                {secondaryAction}
            </div>
        </div>
    )
}
