import { useNavigate } from 'react-router-dom'

function TermsPage() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen flex flex-col bg-background-light">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white px-4 pt-12 pb-4 border-b border-border-color">
                <div className="relative flex items-center justify-center min-h-[40px]">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute left-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-text-main active:scale-95 transition-transform"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-bold">Syarat & Ketentuan</h1>
                </div>
            </header>

            <main className="flex-1 px-4 py-6">
                <div className="bg-white rounded-2xl border border-border-color p-5">
                    <p className="text-xs text-text-secondary mb-4">Terakhir diperbarui: 20 Januari 2026</p>

                    <div className="space-y-6">
                        <section>
                            <h3 className="font-bold text-text-main mb-2">1. Ketentuan Umum</h3>
                            <p className="text-sm text-text-secondary leading-relaxed">
                                Dengan menggunakan aplikasi Bantoo!, Anda menyetujui untuk terikat dengan syarat dan ketentuan ini.
                                Aplikasi ini hanya boleh digunakan untuk tujuan yang sah dan sesuai dengan hukum yang berlaku di Indonesia.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-bold text-text-main mb-2">2. Akun Pengguna</h3>
                            <p className="text-sm text-text-secondary leading-relaxed">
                                Anda bertanggung jawab untuk menjaga kerahasiaan informasi akun Anda, termasuk password.
                                Setiap aktivitas yang terjadi melalui akun Anda adalah tanggung jawab Anda sepenuhnya.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-bold text-text-main mb-2">3. Pemesanan & Pembayaran</h3>
                            <p className="text-sm text-text-secondary leading-relaxed">
                                Harga yang tertera sudah termasuk pajak yang berlaku. Biaya pengiriman akan ditampilkan sebelum Anda menyelesaikan pesanan.
                                Pembayaran dapat dilakukan melalui metode yang tersedia di aplikasi.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-bold text-text-main mb-2">4. Pembatalan Pesanan</h3>
                            <p className="text-sm text-text-secondary leading-relaxed">
                                Pembatalan pesanan hanya dapat dilakukan sebelum restoran mengonfirmasi pesanan.
                                Setelah dikonfirmasi, pembatalan akan dikenakan biaya sesuai kebijakan yang berlaku.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-bold text-text-main mb-2">5. Kebijakan Privasi</h3>
                            <p className="text-sm text-text-secondary leading-relaxed">
                                Kami menghormati privasi Anda. Data pribadi yang Anda berikan akan digunakan sesuai dengan Kebijakan Privasi kami.
                                Kami tidak akan membagikan data Anda kepada pihak ketiga tanpa persetujuan Anda.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-bold text-text-main mb-2">6. Batasan Tanggung Jawab</h3>
                            <p className="text-sm text-text-secondary leading-relaxed">
                                Bantoo! bertindak sebagai perantara antara pengguna dan merchant.
                                Kami tidak bertanggung jawab atas kualitas makanan yang disediakan oleh merchant.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-bold text-text-main mb-2">7. Perubahan Ketentuan</h3>
                            <p className="text-sm text-text-secondary leading-relaxed">
                                Kami berhak mengubah syarat dan ketentuan ini kapan saja.
                                Perubahan akan diberitahukan melalui aplikasi atau email yang terdaftar.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-bold text-text-main mb-2">8. Kontak</h3>
                            <p className="text-sm text-text-secondary leading-relaxed">
                                Jika Anda memiliki pertanyaan tentang syarat dan ketentuan ini, silakan hubungi kami melalui:
                            </p>
                            <ul className="mt-2 space-y-1 text-sm text-text-secondary">
                                <li>📧 Email: support@bantoo.id</li>
                                <li>📞 Telepon: 021-1234-5678</li>
                                <li>💬 Live Chat: tersedia di aplikasi</li>
                            </ul>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default TermsPage
