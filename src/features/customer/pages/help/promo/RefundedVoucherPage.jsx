function RefundedVoucherPage() {
    return (
<section>
    <div className="bg-white dark:bg-card-dark rounded-2xl p-5 border border-border-color dark:border-gray-700 shadow-soft">
        <h2 className="text-base font-bold text-text-main dark:text-white mb-4">Kenapa voucher saya hilang?</h2>
        <div className="flex flex-col gap-5">
            <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">store</span>
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-semibold text-text-main dark:text-white mb-1">Dibatalkan oleh Aplikasi / Warung</h3>
                    <p className="text-sm text-text-secondary dark:text-gray-400 leading-relaxed">
                        Jika pesanan dibatalkan oleh aplikasi atau merchant karena alasan tertentu, jangan khawatir. Voucher akan kembali ke akun kamu dalam waktu <strong>15 menit</strong>.
                    </p>
                </div>
            </div>
            <div className="w-full border-t border-dashed border-border-color dark:border-gray-700"></div>
            <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-red-500">person_cancel</span>
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-semibold text-text-main dark:text-white mb-1">Dibatalkan oleh Pengguna</h3>
                    <p className="text-sm text-text-secondary dark:text-gray-400 leading-relaxed">
                        Apabila pembatalan dilakukan oleh kamu (pengguna), maka voucher akan <strong>hangus</strong> dan tidak dapat digunakan kembali sesuai kebijakan yang berlaku.
                    </p>
                </div>
            </div>
        </div>
    </div>
        </section>
    )
}

export default RefundedVoucherPage
