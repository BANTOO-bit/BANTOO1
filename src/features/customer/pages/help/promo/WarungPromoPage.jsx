function WarungPromoPage() {
    return (
<section className="bg-white dark:bg-card-dark rounded-2xl p-5 shadow-soft border border-border-color dark:border-gray-700">
    <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">storefront</span>
            </div>
            <h2 className="text-lg font-bold text-text-main dark:text-white">Tentang Promo Ini</h2>
        </div>
        <p className="text-sm text-text-secondary dark:text-gray-300 leading-relaxed">
            Promo ini dibuat dan diatur langsung oleh pemilik warung atau merchant (UMKM) sebagai bentuk apresiasi kepada pelanggan setia Bantoo!.
        </p>
        <div className="h-px w-full bg-border-color dark:bg-gray-700 my-1"></div>
        <ul className="flex flex-col gap-4">
            <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-[20px] mt-0.5 shrink-0">restaurant_menu</span>
                <div>
                    <span className="text-sm font-semibold text-text-main dark:text-white block mb-0.5">Hanya Menu Tertentu</span>
                    <p className="text-xs text-text-secondary dark:text-gray-400 leading-relaxed">Promo hanya berlaku untuk menu makanan atau minuman tertentu yang telah dipilih oleh warung.</p>
                </div>
            </li>
            <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-[20px] mt-0.5 shrink-0">price_check</span>
                <div>
                    <span className="text-sm font-semibold text-text-main dark:text-white block mb-0.5">Potongan Langsung</span>
                    <p className="text-xs text-text-secondary dark:text-gray-400 leading-relaxed">Harga menu sudah otomatis terpotong (diskon langsung) di halaman detail warung.</p>
                </div>
            </li>
            <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-[20px] mt-0.5 shrink-0">no_encryption</span>
                <div>
                    <span className="text-sm font-semibold text-text-main dark:text-white block mb-0.5">Tanpa Kode Voucher</span>
                    <p className="text-xs text-text-secondary dark:text-gray-400 leading-relaxed">Anda tidak perlu memasukkan kode voucher tambahan apapun saat checkout.</p>
                </div>
            </li>
        </ul>
    </div>
        </section>
    )
}

export default WarungPromoPage
