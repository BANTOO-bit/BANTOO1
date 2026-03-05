function TermsModal({ onClose }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-h-[85vh] bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl animate-slide-up overflow-hidden flex flex-col">
                {/* Handle Bar */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                </div>

                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-text-main dark:text-white">Syarat & Ketentuan</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                    >
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 text-sm text-text-secondary dark:text-gray-400 leading-relaxed">
                    <section>
                        <h3 className="font-bold text-text-main dark:text-white mb-2">1. Ketentuan Umum</h3>
                        <p>
                            Dengan menggunakan aplikasi Bantoo!, Anda menyetujui untuk terikat dengan syarat dan ketentuan ini.
                            Bantoo! adalah platform pemesanan makanan online yang menghubungkan pengguna dengan merchant dan mitra driver.
                        </p>
                    </section>

                    <section>
                        <h3 className="font-bold text-text-main dark:text-white mb-2">2. Akun Pengguna</h3>
                        <p>
                            Pengguna wajib memberikan informasi yang benar saat mendaftar.
                            Setiap pengguna bertanggung jawab atas keamanan akun dan kata sandinya.
                            Bantoo! berhak menangguhkan atau menutup akun yang melanggar ketentuan.
                        </p>
                    </section>

                    <section>
                        <h3 className="font-bold text-text-main dark:text-white mb-2">3. Pemesanan & Pembayaran</h3>
                        <p>
                            Harga yang tertera sudah termasuk pajak yang berlaku.
                            Ongkos kirim dihitung berdasarkan jarak pengiriman.
                            Pembatalan pesanan dapat dilakukan sebelum merchant mengkonfirmasi pesanan.
                        </p>
                    </section>

                    <section>
                        <h3 className="font-bold text-text-main dark:text-white mb-2">4. Kebijakan Privasi</h3>
                        <p>
                            Bantoo! menghormati privasi Anda. Data pribadi yang dikumpulkan meliputi:
                            nama, nomor telepon, alamat, dan riwayat pesanan.
                            Data ini digunakan untuk meningkatkan layanan dan tidak dibagikan kepada pihak ketiga tanpa persetujuan.
                        </p>
                    </section>

                    <section>
                        <h3 className="font-bold text-text-main dark:text-white mb-2">5. Penyelesaian Sengketa</h3>
                        <p>
                            Jika terjadi masalah dengan pesanan, pengguna dapat menghubungi tim bantuan melalui menu Bantuan di aplikasi.
                            Bantoo! akan berusaha menyelesaikan setiap keluhan dalam waktu 1x24 jam.
                        </p>
                    </section>
                </div>

                {/* Footer Button */}
                <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                        onClick={onClose}
                        className="w-full h-12 bg-primary text-white font-bold rounded-2xl active:scale-[0.98] transition-all"
                    >
                        Saya Mengerti
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TermsModal
