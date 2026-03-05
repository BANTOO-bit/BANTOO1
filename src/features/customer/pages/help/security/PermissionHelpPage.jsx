function PermissionHelpPage() {
    return (
        <>
<section>
    <div className="bg-white rounded-2xl p-5 shadow-soft border border-border-color">
        <h2 className="text-lg font-bold text-text-main mb-4">Mengapa Izin Diperlukan?</h2>
        <div className="space-y-4">
            <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl">location_on</span>
                </div>
                <div>
                    <h3 className="font-semibold text-text-main text-sm mb-1">Akses Lokasi</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                        Diperlukan agar driver dapat menjemput dan mengantar pesanan ke titik yang akurat. Aktifkan mode "Izinkan Hanya Saat Aplikasi Digunakan".
                    </p>
                </div>
            </div>
            <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl">notifications</span>
                </div>
                <div>
                    <h3 className="font-semibold text-text-main text-sm mb-1">Notifikasi</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                        Agar kamu tidak ketinggalan update status pesanan, promo terbaru, dan chat dari driver.
                    </p>
                </div>
            </div>
        </div>
    </div>
        </section>

        <section>
    <div className="bg-white rounded-2xl p-5 shadow-soft border border-border-color">
        <h2 className="text-lg font-bold text-text-main mb-4">Cara Mengaktifkan</h2>
        <div className="space-y-4">
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-text-main mt-0.5">1</div>
                <p className="text-sm text-text-secondary leading-relaxed">Buka menu <b>Pengaturan (Settings)</b> di HP kamu.</p>
            </div>
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-text-main mt-0.5">2</div>
                <p className="text-sm text-text-secondary leading-relaxed">Pilih <b>Aplikasi</b>, lalu cari dan pilih <b>Bantoo!</b>.</p>
            </div>
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-text-main mt-0.5">3</div>
                <p className="text-sm text-text-secondary leading-relaxed">Masuk ke menu <b>Izin (Permissions)</b>.</p>
            </div>
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-text-main mt-0.5">4</div>
                <p className="text-sm text-text-secondary leading-relaxed">Aktifkan izin untuk <b>Lokasi</b> dan <b>Notifikasi</b>.</p>
            </div>
        </div>
        <div className="mt-6">
            <button className="w-full py-3 rounded-xl bg-gray-900 text-white font-semibold text-sm shadow-md active:scale-[0.98] transition-transform">
                Buka Pengaturan Aplikasi
            </button>
            <p className="text-[10px] text-center text-text-secondary mt-2">*Tombol ini akan membawamu ke pengaturan sistem HP.</p>
        </div>
    </div>
        </section>
        </>
    )
}

export default PermissionHelpPage
