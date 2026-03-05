function TransactionFailedPage() {
    return (
<article className="bg-white dark:bg-card-dark p-5 rounded-2xl shadow-soft border border-border-color dark:border-gray-700">
    <p className="text-sm text-text-secondary dark:text-gray-400 mb-4 leading-relaxed">
        Mohon maaf atas ketidaknyamanan Anda. Transaksi yang gagal bisa disebabkan oleh beberapa hal. Berikut adalah penyebab umum dan solusinya:
    </p>
    <div className="space-y-4">
        <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-primary text-[18px]">account_balance_wallet</span>
            </div>
            <div>
                <h3 className="font-semibold text-text-main dark:text-white text-sm">Saldo Tidak Mencukupi</h3>
                <p className="text-xs text-text-secondary dark:text-gray-400 mt-1 leading-relaxed">Pastikan saldo Bantoo!Pay atau metode pembayaran yang Anda pilih memiliki saldo yang cukup sebelum melakukan transaksi.</p>
            </div>
        </div>
        <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-primary text-[18px]">wifi_off</span>
            </div>
            <div>
                <h3 className="font-semibold text-text-main dark:text-white text-sm">Koneksi Internet Tidak Stabil</h3>
                <p className="text-xs text-text-secondary dark:text-gray-400 mt-1 leading-relaxed">Periksa kembali koneksi internet Anda. Cobalah beralih antara Wi-Fi dan data seluler untuk memastikan jaringan stabil.</p>
            </div>
        </div>
        <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-primary text-[18px]">timer_off</span>
            </div>
            <div>
                <h3 className="font-semibold text-text-main dark:text-white text-sm">Voucher/Promo Kedaluwarsa</h3>
                <p className="text-xs text-text-secondary dark:text-gray-400 mt-1 leading-relaxed">Jika menggunakan voucher, pastikan masa berlakunya belum habis dan memenuhi syarat minimum transaksi.</p>
            </div>
        </div>
    </div>
    <div className="mt-6 pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-text-main dark:text-white text-sm mb-3">Langkah Penyelesaian</h3>
        <ol className="list-decimal list-outside ml-4 space-y-2 text-sm text-text-secondary dark:text-gray-400">
            <li>Tutup aplikasi Bantoo! sepenuhnya dan buka kembali (Restart App).</li>
            <li>Cek riwayat transaksi untuk memastikan status pesanan.</li>
            <li>Tunggu 10-15 menit jika terjadi gangguan sistem sementara.</li>
            <li>Lakukan pemesanan ulang jika saldo belum terpotong.</li>
        </ol>
    </div>
        </article>
    )
}

export default TransactionFailedPage
