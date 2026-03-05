function VoucherIssuesPage() {
    return (
<section>
    <div className="bg-white dark:bg-card-dark rounded-2xl p-5 shadow-soft border border-border-color dark:border-gray-700">
        <h2 className="text-xl font-bold text-text-main dark:text-white mb-4">Kenapa voucher tidak bisa dipakai?</h2>
        <p className="text-sm text-text-secondary dark:text-gray-400 mb-6 leading-relaxed">
            Jika kamu mengalami kendala saat menggunakan voucher, coba cek beberapa hal berikut ini:
        </p>
        <div className="space-y-6">
            <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold mt-0.5">1</div>
                <div>
                    <h3 className="text-sm font-semibold text-text-main dark:text-white mb-1">Periksa batas minimum pembelian</h3>
                    <p className="text-xs text-text-secondary dark:text-gray-400 leading-relaxed">Setiap voucher biasanya memiliki syarat minimal transaksi. Pastikan total belanjaanmu sudah mencukupi.</p>
                </div>
            </div>
            <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold mt-0.5">2</div>
                <div>
                    <h3 className="text-sm font-semibold text-text-main dark:text-white mb-1">Cek masa berlaku voucher</h3>
                    <p className="text-xs text-text-secondary dark:text-gray-400 leading-relaxed">Pastikan voucher yang ingin digunakan belum kadaluwarsa dan masih dalam periode promo yang aktif.</p>
                </div>
            </div>
            <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold mt-0.5">3</div>
                <div>
                    <h3 className="text-sm font-semibold text-text-main dark:text-white mb-1">Pastikan warung/menu termasuk dalam promo</h3>
                    <p className="text-xs text-text-secondary dark:text-gray-400 leading-relaxed">Beberapa promo hanya berlaku untuk warung atau kategori menu tertentu saja.</p>
                </div>
            </div>
            <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold mt-0.5">4</div>
                <div>
                    <h3 className="text-sm font-semibold text-text-main dark:text-white mb-1">Pastikan tidak menggabungkan dengan promo lain</h3>
                    <p className="text-xs text-text-secondary dark:text-gray-400 leading-relaxed">Umumnya, satu transaksi hanya bisa menggunakan satu jenis promo atau voucher.</p>
                </div>
            </div>
        </div>
    </div>
        </section>
    )
}

export default VoucherIssuesPage
