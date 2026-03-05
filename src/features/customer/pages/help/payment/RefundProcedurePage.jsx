function RefundProcedurePage() {
    return (
<section className="flex flex-col gap-6">
    <div className="bg-white dark:bg-card-dark rounded-2xl p-5 border border-border-color dark:border-gray-700 shadow-sm">
        <p className="text-sm text-text-main dark:text-gray-200 leading-relaxed mb-6">
            Kami memahami bahwa kendala transaksi dapat terjadi. Berikut adalah informasi lengkap mengenai prosedur pengembalian dana (refund) di aplikasi Bantoo!.
        </p>
        <div className="mb-6">
            <h3 className="text-base font-bold text-text-main dark:text-white mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">schedule</span>
                Estimasi Waktu Refund
            </h3>
            <p className="text-sm text-text-secondary dark:text-gray-400 leading-relaxed ml-7">
                Proses verifikasi dan pengembalian dana membutuhkan waktu estimasi <span className="font-semibold text-text-main dark:text-gray-200">1x24 jam kerja</span> setelah pengajuan disetujui oleh tim kami.
            </p>
        </div>
        <div>
            <h3 className="text-base font-bold text-text-main dark:text-white mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">payments</span>
                Metode Pengembalian Dana
            </h3>
            <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                    <span className="material-symbols-outlined text-primary mt-0.5">account_balance_wallet</span>
                    <div>
                        <h4 className="text-sm font-semibold text-text-main dark:text-white">
                            Bantoo Pay <span className="text-xs font-normal text-text-secondary dark:text-gray-500 ml-1">(Coming Soon)</span>
                        </h4>
                        <p className="text-xs text-text-secondary dark:text-gray-400 mt-1 leading-relaxed">
                            Jika Anda membayar menggunakan saldo, dana akan otomatis dikembalikan ke akun Bantoo Pay Anda.
                        </p>
                    </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                    <span className="material-symbols-outlined text-[#25D366] mt-0.5">support_agent</span>
                    <div>
                        <h4 className="text-sm font-semibold text-text-main dark:text-white">Transfer Manual via Admin</h4>
                        <p className="text-xs text-text-secondary dark:text-gray-400 mt-1 leading-relaxed">
                            Untuk pembayaran via Transfer Bank atau E-Wallet lain, pengembalian dana dilakukan manual. Silakan hubungi Admin via WhatsApp.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
        </section>
    )
}

export default RefundProcedurePage
