function OrderIncorrectPage() {
    return (
<section className="bg-white p-5 rounded-2xl shadow-soft border border-border-color">
    <div className="flex items-start gap-4 mb-6">
        <div className="bg-red-50 p-3 rounded-full shrink-0">
            <span className="material-symbols-outlined text-red-500">restaurant_menu</span>
        </div>
        <div>
            <h2 className="text-base font-bold text-text-main mb-2 leading-snug">Pesanan tidak sesuai dengan aplikasi</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
                Kami mohon maaf jika menu yang kamu terima berbeda dengan yang kamu pesan.
            </p>
        </div>
    </div>
    <div className="border-t border-dashed border-gray-200 my-4"></div>
    <h3 className="text-sm font-semibold text-text-main mb-4">Mohon ikuti langkah berikut:</h3>
    <div className="flex flex-col gap-5">
        <div className="flex gap-4">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-light text-primary text-xs font-bold flex items-center justify-center">1</div>
            <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-text-main">Foto Produk</span>
                <p className="text-xs text-text-secondary leading-relaxed">
                    Ambil foto makanan atau minuman yang kamu terima secara jelas (seluruh item).
                </p>
            </div>
        </div>
        <div className="flex gap-4">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-light text-primary text-xs font-bold flex items-center justify-center">2</div>
            <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-text-main">Foto Struk</span>
                <p className="text-xs text-text-secondary leading-relaxed">
                    Ambil foto struk pembelian yang menempel pada kemasan atau kantong.
                </p>
            </div>
        </div>
        <div className="flex gap-4">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-light text-primary text-xs font-bold flex items-center justify-center">3</div>
            <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-text-main">Lapor ke Support</span>
                <p className="text-xs text-text-secondary leading-relaxed">
                    Kirimkan bukti foto tersebut kepada tim kami melalui tombol bantuan di bawah ini untuk proses investigasi.
                </p>
            </div>
        </div>
    </div>
        </section>
    )
}

export default OrderIncorrectPage
