function VoucherPromoHelpPage() {
    return (
        <section className="bg-white dark:bg-card-dark rounded-2xl p-5 shadow-soft border border-border-color dark:border-gray-700">
            <h2 className="text-lg font-bold text-text-main dark:text-white mb-4">Mengapa voucher saya tidak bisa digunakan?</h2>
            <p className="text-sm text-text-secondary dark:text-gray-300 leading-relaxed mb-6">
                Jika Anda mengalami kesulitan saat menggunakan kode promo atau voucher, mohon periksa beberapa kemungkinan penyebab berikut ini:
            </p>
            <div className="space-y-6">
                <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 mt-0.5">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">1</span>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-text-main dark:text-white mb-1">Syarat Minimum Belanja</h3>
                        <p className="text-xs text-text-secondary dark:text-gray-400 leading-relaxed">
                            Pastikan total nilai transaksi Anda telah memenuhi syarat minimum pembelian yang tertera pada detail S&K voucher.
                        </p>
                    </div>
                </div>
                <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 mt-0.5">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">2</span>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-text-main dark:text-white mb-1">Masa Berlaku Habis</h3>
                        <p className="text-xs text-text-secondary dark:text-gray-400 leading-relaxed">
                            Cek kembali tanggal kedaluwarsa voucher Anda. Voucher yang sudah melewati masa berlaku otomatis hangus dan tidak dapat digunakan.
                        </p>
                    </div>
                </div>
                <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 mt-0.5">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">3</span>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-text-main dark:text-white mb-1">Batasan Warung atau Kategori</h3>
                        <p className="text-xs text-text-secondary dark:text-gray-400 leading-relaxed">
                            Beberapa voucher bersifat spesifik dan hanya berlaku untuk merchant, toko, atau kategori layanan tertentu saja.
                        </p>
                    </div>
                </div>
                <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 mt-0.5">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">4</span>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-text-main dark:text-white mb-1">Metode Pembayaran Tidak Sesuai</h3>
                        <p className="text-xs text-text-secondary dark:text-gray-400 leading-relaxed">
                            Promo tertentu mungkin mewajibkan penggunaan metode pembayaran khusus (misal: E-Wallet atau Kartu Kredit Bank tertentu).
                        </p>
                    </div>
                </div>
            </div>
            <div className="mt-6 pt-4 border-t border-dashed border-gray-100 dark:border-gray-700">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex gap-3 items-center">
                    <span className="material-symbols-outlined text-blue-500 text-xl">info</span>
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                        Tips: Selalu cek halaman "Detail Voucher" untuk informasi lengkap syarat dan ketentuan.
                    </p>
                </div>
            </div>
        </section>
    )
}

export default VoucherPromoHelpPage
