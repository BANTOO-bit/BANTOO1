export default function AdminEmptyState() {
    return (
        <div className="flex flex-col items-center justify-center flex-1 bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm p-12 lg:p-24 text-center h-full min-h-[500px]">
            <div className="w-32 h-32 bg-[#f6f7f8] dark:bg-[#2a3b4d] rounded-full flex items-center justify-center mb-8 ring-8 ring-[#f6f7f8]/50 dark:ring-[#2a3b4d]/50">
                <span className="material-symbols-outlined text-[64px] text-[#617589] dark:text-[#94a3b8]">storefront</span>
            </div>
            <h3 className="text-2xl lg:text-3xl font-bold text-[#111418] dark:text-white mb-3 tracking-tight">Belum Ada Aktivitas Hari Ini</h3>
            <p className="text-[#617589] dark:text-[#94a3b8] max-w-lg mb-10 text-base leading-relaxed">
                Data pesanan, driver, dan warung akan muncul di sini setelah operasional dimulai. Pastikan semua sistem siap menerima pesanan.
            </p>
            <button className="px-8 py-3 bg-admin-primary hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-3">
                <span className="material-symbols-outlined">play_arrow</span>
                Mulai Operasional
            </button>
        </div>
    )
}
