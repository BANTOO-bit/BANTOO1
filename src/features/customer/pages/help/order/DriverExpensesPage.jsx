function DriverExpensesPage() {
    return (
<section className="flex flex-col gap-4">
    <div className="bg-white p-5 rounded-2xl border border-border-color shadow-soft">
        <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">verified_user</span>
            </div>
            <div className="flex-1">
                <h2 className="text-base font-bold text-text-main mb-2">Kebijakan Biaya Bantoo!</h2>
                <p className="text-sm text-text-secondary leading-relaxed">
                    Total biaya yang tertera pada aplikasi saat pemesanan bersifat final. Mitra Driver dilarang meminta biaya tambahan di luar aplikasi.
                </p>
            </div>
        </div>
    </div>
    <div className="bg-white p-5 rounded-2xl border border-border-color shadow-soft">
        <h3 className="text-base font-bold text-text-main mb-4">Ketentuan Parkir &amp; Biaya Lain</h3>
        <div className="space-y-4">
            <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-green-600 text-[20px] mt-0.5">check_circle</span>
                <div className="flex-1">
                    <p className="text-sm font-medium text-text-main">Parkir Resmi</p>
                    <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                        Biaya parkir resmi (mall, gedung kantor, stasiun) ditanggung oleh penumpang jika driver harus masuk ke area berbayar.
                    </p>
                </div>
            </div>
            <div className="w-full h-px bg-border-color"></div>
            <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-red-500 text-[20px] mt-0.5">cancel</span>
                <div className="flex-1">
                    <p className="text-sm font-medium text-text-main">Pungutan Liar</p>
                    <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                        Driver dilarang meminta uang parkir liar, uang rokok, atau biaya bensin tambahan.
                    </p>
                </div>
            </div>
        </div>
    </div>
    <div className="px-2">
        <h3 className="text-base font-bold text-text-main mb-2">Cara Melaporkan</h3>
        <p className="text-sm text-text-secondary leading-relaxed mb-4">
            Jika Anda merasa dipaksa membayar biaya yang tidak wajar, simpan bukti pembayaran atau rekaman percakapan jika ada, lalu hubungi tim Support kami melalui tombol di bawah ini.
        </p>
    </div>
        </section>
    )
}

export default DriverExpensesPage
