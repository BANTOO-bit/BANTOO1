function DriverTrackingHelpPage() {
    return (
        <article className="bg-white dark:bg-card-dark rounded-2xl p-6 shadow-soft border border-border-color dark:border-gray-700">
            <h2 className="text-xl font-bold text-text-main dark:text-white mb-6 leading-tight">Bagaimana lacak posisi driver?</h2>
            <div className="flex flex-col gap-8 relative">
                <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-gray-100 dark:bg-gray-800 -z-10"></div>
                <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-md ring-4 ring-white dark:ring-card-dark">1</div>
                    <div className="flex flex-col gap-1 pt-0.5">
                        <h3 className="font-semibold text-text-main dark:text-white text-sm">Masuk ke tab 'Pesanan'</h3>
                        <p className="text-text-secondary text-sm leading-relaxed">Buka menu navigasi di bagian bawah layar dan ketuk ikon Pesanan.</p>
                    </div>
                </div>
                <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-md ring-4 ring-white dark:ring-card-dark">2</div>
                    <div className="flex flex-col gap-1 pt-0.5">
                        <h3 className="font-semibold text-text-main dark:text-white text-sm">Pilih pesanan aktif Anda</h3>
                        <p className="text-text-secondary text-sm leading-relaxed">Cari pesanan yang sedang berlangsung dalam daftar, lalu ketuk untuk melihat rincian.</p>
                    </div>
                </div>
                <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-md ring-4 ring-white dark:ring-card-dark">3</div>
                    <div className="flex flex-col gap-1 pt-0.5">
                        <h3 className="font-semibold text-text-main dark:text-white text-sm">Klik tombol 'Lacak di Peta'</h3>
                        <p className="text-text-secondary text-sm leading-relaxed">Tekan tombol berwarna oranye bertuliskan <span className="font-semibold text-primary">Lacak di Peta</span> yang ada di halaman rincian.</p>
                    </div>
                </div>
                <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-md ring-4 ring-white dark:ring-card-dark">4</div>
                    <div className="flex flex-col gap-1 pt-0.5">
                        <h3 className="font-semibold text-text-main dark:text-white text-sm">Peta real-time muncul</h3>
                        <p className="text-text-secondary text-sm leading-relaxed">Anda akan melihat peta interaktif yang menunjukkan pergerakan driver menuju lokasi Anda secara langsung.</p>
                    </div>
                </div>
            </div>
            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex gap-3 items-start border border-blue-100 dark:border-blue-800/30">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px] mt-0.5">info</span>
                <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                    Pastikan koneksi internet Anda stabil dan GPS/lokasi Anda telah aktif agar posisi driver dapat diperbarui secara akurat di peta.
                </p>
            </div>
        </article>
    )
}

export default DriverTrackingHelpPage
