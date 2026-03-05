function OrderNotArrivedFAQPage() {
    return (
        <section>
            <div className="bg-white dark:bg-card-dark rounded-2xl p-5 shadow-soft border border-border-color dark:border-gray-700">
                <h2 className="text-base font-bold text-text-main dark:text-white mb-6">Panduan Tindakan</h2>
                <div className="space-y-8 relative">
                    <div className="absolute left-[15px] top-3 bottom-6 w-0.5 bg-gray-100 dark:bg-gray-800"></div>
                    <div className="relative flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-900/30 border border-orange-100 dark:border-orange-800 flex items-center justify-center z-10 text-primary font-bold text-sm">1</div>
                        <div className="pt-1">
                            <h3 className="text-sm font-semibold text-text-main dark:text-white mb-1">Tunggu sebentar</h3>
                            <p className="text-sm text-text-secondary dark:text-gray-400 leading-relaxed">Tunggu 10-15 menit setelah estimasi waktu tiba.</p>
                        </div>
                    </div>
                    <div className="relative flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-900/30 border border-orange-100 dark:border-orange-800 flex items-center justify-center z-10 text-primary font-bold text-sm">2</div>
                        <div className="pt-1">
                            <h3 className="text-sm font-semibold text-text-main dark:text-white mb-1">Periksa sekitar lokasi</h3>
                            <p className="text-sm text-text-secondary dark:text-gray-400 leading-relaxed">Cek apakah pesanan dititipkan ke orang rumah, tetangga, satpam, atau resepsionis.</p>
                        </div>
                    </div>
                    <div className="relative flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-900/30 border border-orange-100 dark:border-orange-800 flex items-center justify-center z-10 text-primary font-bold text-sm">3</div>
                        <div className="pt-1">
                            <h3 className="text-sm font-semibold text-text-main dark:text-white mb-1">Hubungi driver</h3>
                            <p className="text-sm text-text-secondary dark:text-gray-400 leading-relaxed">Hubungi driver melalui chat atau telepon di aplikasi.</p>
                        </div>
                    </div>
                    <div className="relative flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-900/30 border border-orange-100 dark:border-orange-800 flex items-center justify-center z-10 text-primary font-bold text-sm">4</div>
                        <div className="pt-1">
                            <h3 className="text-sm font-semibold text-text-main dark:text-white mb-1">Laporkan Masalah</h3>
                            <p className="text-sm text-text-secondary dark:text-gray-400 leading-relaxed">Jika tetap tidak diterima, klik 'Laporkan Masalah' di rincian pesanan.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default OrderNotArrivedFAQPage
