function OrderNotReceivedPage() {
    return (
        <>
<section>
    <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex gap-3 items-start">
        <span className="material-symbols-outlined text-orange-600 mt-0.5">warning</span>
        <div>
            <h3 className="text-sm font-bold text-orange-800 mb-1">Penting: Lapor dalam 1x24 Jam</h3>
            <p className="text-xs leading-relaxed text-orange-700">
                Jika status pesanan sudah selesai tapi barang belum diterima, mohon segera laporkan maksimal 1x24 jam setelah pesanan diselesaikan.
            </p>
        </div>
    </div>
        </section>

        <section className="flex flex-col gap-4">
    <div className="p-5 bg-white rounded-2xl shadow-soft border border-border-color">
        <h2 className="text-base font-bold text-text-main mb-3">Cek Sekitar Lokasi</h2>
        <p className="text-sm text-text-secondary mb-4 leading-relaxed">
            Terkadang driver menitipkan pesanan di tempat aman. Pastikan Anda sudah melakukan hal berikut:
        </p>
        <ul className="space-y-3">
            <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold mt-0.5">1</span>
                <span className="text-sm text-text-main">Pastikan titik lokasi pengantaran di aplikasi sudah sesuai.</span>
            </li>
            <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold mt-0.5">2</span>
                <span className="text-sm text-text-main">Tanyakan kepada orang rumah, tetangga, resepsionis, atau satpam.</span>
            </li>
            <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold mt-0.5">3</span>
                <span className="text-sm text-text-main">Cek apakah ada foto bukti pengantaran di halaman <span className="font-medium">Riwayat Pesanan</span>.</span>
            </li>
        </ul>
    </div>
    <div className="p-5 bg-white rounded-2xl shadow-soft border border-border-color">
        <h2 className="text-base font-bold text-text-main mb-3">Hubungi Driver</h2>
        <p className="text-sm text-text-secondary mb-4 leading-relaxed">
            Jika pesanan baru saja diselesaikan, Anda masih bisa mencoba menghubungi driver melalui fitur Chat atau Telepon.
        </p>
        <button className="w-full py-3 rounded-xl border border-primary text-primary font-semibold text-sm hover:bg-orange-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-lg">chat</span>
            <span>Chat Driver dari Riwayat</span>
        </button>
    </div>
        </section>
        </>
    )
}

export default OrderNotReceivedPage
