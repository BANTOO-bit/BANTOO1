function OrderDamagedPage() {
    return (
<section>
    <div className="bg-white rounded-2xl p-5 border border-border-color shadow-soft">
        <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-red-500 text-3xl">sentiment_dissatisfied</span>
            </div>
            <h2 className="text-lg font-bold text-center text-text-main mb-2">Maaf atas ketidaknyamanan ini</h2>
            <p className="text-sm text-text-secondary text-center leading-relaxed max-w-xs">
                Kami mengerti kekecewaan kamu. Ikuti langkah di bawah ini agar kami dapat segera membantu proses pengembalian dana.
            </p>
        </div>
        <div className="space-y-6">
            <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-50 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl">no_meals</span>
                </div>
                <div>
                    <h3 className="font-semibold text-text-main text-sm mb-1">Jangan Dikonsumsi</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">Demi keamanan kesehatan kamu, mohon untuk tidak mengonsumsi makanan yang sudah terkontaminasi atau rusak.</p>
                </div>
            </div>
            <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-50 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl">add_a_photo</span>
                </div>
                <div>
                    <h3 className="font-semibold text-text-main text-sm mb-1">Foto Kondisi Pesanan</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">Ambil foto yang jelas memperlihatkan kerusakan kemasan dan kondisi makanan sebagai bukti.</p>
                </div>
            </div>
            <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-50 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl">support_agent</span>
                </div>
                <div>
                    <h3 className="font-semibold text-text-main text-sm mb-1">Hubungi Pusat Bantuan</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">Hubungi kami lewat tombol WhatsApp di bawah. Kirimkan foto bukti untuk mempercepat proses refund.</p>
                </div>
            </div>
        </div>
    </div>
        </section>
    )
}

export default OrderDamagedPage
