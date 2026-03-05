function ChangePaymentHelpPage() {
    return (
        <section className="bg-white dark:bg-card-dark rounded-2xl p-5 shadow-soft border border-border-color dark:border-gray-700">
            <h2 className="text-xl font-bold text-text-main dark:text-white mb-6">Langkah-langkah</h2>
            <div className="relative pl-2">
                <div className="absolute left-[19px] top-2 bottom-6 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                <div className="relative flex gap-4 mb-8">
                    <div className="flex-none w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 text-primary flex items-center justify-center font-bold z-10 border-4 border-white dark:border-card-dark shadow-sm">1</div>
                    <div className="pt-2">
                        <h3 className="font-semibold text-text-main dark:text-white text-sm mb-1">Buka 'Keranjang'</h3>
                        <p className="text-sm text-text-secondary dark:text-gray-400 leading-relaxed">Masuk ke menu keranjang belanja Anda untuk melihat pesanan.</p>
                    </div>
                </div>
                <div className="relative flex gap-4 mb-8">
                    <div className="flex-none w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 text-primary flex items-center justify-center font-bold z-10 border-4 border-white dark:border-card-dark shadow-sm">2</div>
                    <div className="pt-2">
                        <h3 className="font-semibold text-text-main dark:text-white text-sm mb-1">Klik 'Lanjut ke Pembayaran'</h3>
                        <p className="text-sm text-text-secondary dark:text-gray-400 leading-relaxed">Tekan tombol lanjut untuk menuju halaman ringkasan pembayaran.</p>
                    </div>
                </div>
                <div className="relative flex gap-4 mb-8">
                    <div className="flex-none w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 text-primary flex items-center justify-center font-bold z-10 border-4 border-white dark:border-card-dark shadow-sm">3</div>
                    <div className="pt-2">
                        <h3 className="font-semibold text-text-main dark:text-white text-sm mb-1">Ubah Metode Pembayaran</h3>
                        <p className="text-sm text-text-secondary dark:text-gray-400 leading-relaxed">Di bagian Metode Pembayaran, klik ikon panah atau tombol 'Ubah'.</p>
                    </div>
                </div>
                <div className="relative flex gap-4">
                    <div className="flex-none w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 text-primary flex items-center justify-center font-bold z-10 border-4 border-white dark:border-card-dark shadow-sm">4</div>
                    <div className="pt-2">
                        <h3 className="font-semibold text-text-main dark:text-white text-sm mb-1">Pilih Metode Baru</h3>
                        <p className="text-sm text-text-secondary dark:text-gray-400 leading-relaxed">Pilih metode yang diinginkan (Bantoo! Pay, E-wallet, atau Tunai).</p>
                    </div>
                </div>
            </div>
            <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 flex gap-3 items-start">
                <span className="material-symbols-outlined text-orange-500 mt-0.5 shrink-0">warning</span>
                <div className="text-xs text-text-secondary dark:text-gray-400 leading-relaxed">
                    <strong className="text-text-main dark:text-white block mb-1">Catatan Penting</strong>
                    Metode pembayaran tidak bisa diubah setelah pesanan mulai diproses oleh sistem atau mitra kami.
                </div>
            </div>
        </section>
    )
}

export default ChangePaymentHelpPage
