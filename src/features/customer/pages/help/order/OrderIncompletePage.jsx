function OrderIncompletePage() {
    return (
<section>
    <div className="bg-white rounded-2xl p-5 border border-border-color shadow-soft mb-6">
        <p className="text-sm text-text-main leading-relaxed">
            Mohon maaf jika pesanan Anda tidak lengkap. Untuk membantu kami memproses keluhan Anda dengan cepat, silakan ikuti langkah-langkah pelaporan di bawah ini:
        </p>
    </div>
    <h2 className="text-sm font-bold text-text-main mb-4 uppercase tracking-wider text-xs">Langkah Pelaporan</h2>
    <div className="flex flex-col gap-4 relative">
        <div className="absolute left-[1.65rem] top-8 bottom-8 w-0.5 bg-gray-200 -z-10"></div>
        <div className="flex gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-full bg-white border-4 border-background-light flex items-center justify-center text-primary shadow-sm z-10">
                <span className="material-symbols-outlined">receipt_long</span>
            </div>
            <div className="flex-grow pt-1 pb-2">
                <h3 className="font-bold text-text-main text-sm mb-1">Foto Struk Belanja</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                    Ambil foto struk belanja fisik yang menempel pada kemasan. Pastikan nomor pesanan dan daftar item terlihat jelas.
                </p>
            </div>
        </div>
        <div className="flex gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-full bg-white border-4 border-background-light flex items-center justify-center text-primary shadow-sm z-10">
                <span className="material-symbols-outlined">fastfood</span>
            </div>
            <div className="flex-grow pt-1 pb-2">
                <h3 className="font-bold text-text-main text-sm mb-1">Foto Produk Diterima</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                    Foto seluruh makanan/minuman yang Anda terima. Keluarkan dari kantong agar terlihat semua itemnya.
                </p>
            </div>
        </div>
        <div className="flex gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-full bg-white border-4 border-background-light flex items-center justify-center text-primary shadow-sm z-10">
                <span className="material-symbols-outlined">report_problem</span>
            </div>
            <div className="flex-grow pt-1 pb-2">
                <h3 className="font-bold text-text-main text-sm mb-1">Laporkan di Aplikasi</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                    Buka halaman <b>Rincian Pesanan</b> Anda, lalu klik tombol <b>'Laporkan Masalah'</b> untuk mengunggah bukti foto tersebut.
                </p>
            </div>
        </div>
    </div>
    <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-100 flex gap-3">
        <span className="material-symbols-outlined text-primary text-xl mt-0.5">info</span>
        <p className="text-xs text-text-main">
            Laporan akan kami proses dalam waktu 1x24 jam setelah bukti diterima lengkap.
        </p>
    </div>
        </section>
    )
}

export default OrderIncompletePage
