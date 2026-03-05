function OrderNotArrivedPage() {
    return (
<section>
    <div className="bg-white rounded-2xl p-5 shadow-soft border border-border-color">
        <p className="text-sm text-text-secondary mb-6 leading-relaxed">
            Kami mohon maaf atas keterlambatan pesananmu. Berikut beberapa langkah yang bisa kamu lakukan jika pesanan belum tiba:
        </p>
        <div className="space-y-6">
            <div className="flex gap-4">
                <div className="shrink-0 w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-primary border border-orange-100">
                    <span className="material-symbols-outlined text-[20px]">map</span>
                </div>
                <div>
                    <h3 className="text-sm font-bold text-text-main mb-1">Cek Posisi Driver</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                        Pantau lokasi driver secara real-time melalui peta di halaman pesanan. Mungkin driver sedang mencari alamatmu.
                    </p>
                </div>
            </div>
            <div className="flex gap-4">
                <div className="shrink-0 w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-primary border border-orange-100">
                    <span className="material-symbols-outlined text-[20px]">chat</span>
                </div>
                <div>
                    <h3 className="text-sm font-bold text-text-main mb-1">Hubungi Driver</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                        Gunakan fitur <b>Chat</b> atau <b>Telepon</b> di aplikasi untuk menanyakan status pesanan langsung kepada driver.
                    </p>
                </div>
            </div>
            <div className="flex gap-4">
                <div className="shrink-0 w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-primary border border-orange-100">
                    <span className="material-symbols-outlined text-[20px]">schedule</span>
                </div>
                <div>
                    <h3 className="text-sm font-bold text-text-main mb-1">Tunggu 10 Menit</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                        Mohon tunggu hingga 10 menit setelah estimasi waktu tiba, karena kondisi lalu lintas mungkin tidak terduga.
                    </p>
                </div>
            </div>
        </div>
    </div>
        </section>
    )
}

export default OrderNotArrivedPage
