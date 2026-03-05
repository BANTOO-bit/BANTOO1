function NewUserPromoPage() {
    return (
<section>
    <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-border-color dark:border-gray-700 shadow-soft">
        <h2 className="text-lg font-bold text-text-main dark:text-white mb-6">Syarat & Ketentuan Promo</h2>
        <div className="flex flex-col gap-6">
            <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-[22px]">verified</span>
                </div>
                <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-bold text-text-main dark:text-white">Khusus Transaksi Pertama</h3>
                    <p className="text-sm text-text-secondary dark:text-gray-400 leading-relaxed">
                        Promo ini eksklusif dan hanya berlaku satu kali untuk transaksi belanja pertama Anda di aplikasi Bantoo!.
                    </p>
                </div>
            </div>
            <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-[22px]">timer</span>
                </div>
                <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-bold text-text-main dark:text-white">Batas Waktu Penggunaan</h3>
                    <p className="text-sm text-text-secondary dark:text-gray-400 leading-relaxed">
                        Voucher promo memiliki batas waktu penggunaan tertentu setelah registrasi akun. Gunakan segera sebelum hangus.
                    </p>
                </div>
            </div>
            <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-[22px]">shopping_basket</span>
                </div>
                <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-bold text-text-main dark:text-white">Syarat Minimal Belanja</h3>
                    <p className="text-sm text-text-secondary dark:text-gray-400 leading-relaxed">
                        Promo hanya dapat digunakan apabila total belanja Anda memenuhi syarat minimal transaksi yang ditentukan.
                    </p>
                </div>
            </div>
        </div>
    </div>
        </section>
    )
}

export default NewUserPromoPage
