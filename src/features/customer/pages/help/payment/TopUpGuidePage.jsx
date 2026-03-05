function TopUpGuidePage() {
    return (
<article className="flex flex-col gap-4">
    <p className="text-sm text-text-secondary dark:text-gray-400 mb-2">
        Berikut adalah panduan lengkap cara mengisi saldo Bantoo Pay Anda melalui berbagai metode yang tersedia.
    </p>
    <div className="bg-white dark:bg-card-dark rounded-2xl p-5 border border-border-color dark:border-gray-700 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <span className="material-symbols-outlined">account_balance</span>
            </div>
            <h2 className="text-base font-bold text-text-main dark:text-white">Transfer Bank <span className="text-sm font-normal text-gray-400 dark:text-gray-500 ml-1">(Coming Soon)</span></h2>
        </div>
        <ol className="list-decimal list-outside ml-4 space-y-3 text-sm text-text-secondary dark:text-gray-300">
            <li>Buka aplikasi Bantoo! dan masuk ke menu <strong>Isi Saldo</strong> di halaman utama.</li>
            <li>Pilih opsi pembayaran <strong>Transfer Bank</strong> (Virtual Account).</li>
            <li>Pilih bank tujuan Anda (BCA, Mandiri, BNI, atau BRI).</li>
            <li>Salin <strong>Nomor Virtual Account</strong> yang muncul di layar.</li>
            <li>Lakukan transfer melalui ATM, Mobile Banking, atau Internet Banking sesuai instruksi bank masing-masing.</li>
            <li>Saldo akan masuk otomatis setelah pembayaran berhasil.</li>
        </ol>
    </div>
    <div className="bg-white dark:bg-card-dark rounded-2xl p-5 border border-border-color dark:border-gray-700 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                <span className="material-symbols-outlined">storefront</span>
            </div>
            <h2 className="text-base font-bold text-text-main dark:text-white">Minimarket <span className="text-sm font-normal text-gray-400 dark:text-gray-500 ml-1">(Coming Soon)</span></h2>
        </div>
        <ol className="list-decimal list-outside ml-4 space-y-3 text-sm text-text-secondary dark:text-gray-300">
            <li>Kunjungi gerai <strong>Indomaret</strong> atau <strong>Alfamart</strong> terdekat.</li>
            <li>Informasikan kepada kasir bahwa Anda ingin melakukan <strong>Top Up Bantoo Pay</strong>.</li>
            <li>Sebutkan <strong>Nomor Handphone</strong> yang terdaftar di aplikasi Bantoo!.</li>
            <li>Pilih nominal top up yang tersedia (Min. Rp 50.000).</li>
            <li>Bayar sesuai nominal di kasir dan simpan struk sebagai bukti pembayaran.</li>
        </ol>
    </div>
    <div className="bg-white dark:bg-card-dark rounded-2xl p-5 border border-border-color dark:border-gray-700 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                <span className="material-symbols-outlined">support_agent</span>
            </div>
            <h2 className="text-base font-bold text-text-main dark:text-white">Bantuan Admin <span className="text-sm font-normal text-gray-400 dark:text-gray-500 ml-1">(Coming Soon)</span></h2>
        </div>
        <p className="text-sm text-text-secondary dark:text-gray-300 mb-3">Jika mengalami kendala pada metode otomatis, silakan hubungi admin kami:</p>
        <ol className="list-decimal list-outside ml-4 space-y-3 text-sm text-text-secondary dark:text-gray-300">
            <li>Klik tombol <strong>WhatsApp Support</strong> berwarna hijau di bagian bawah halaman ini.</li>
            <li>Sampaikan kepada Admin bahwa Anda ingin melakukan pengisian saldo.</li>
            <li>Ikuti instruksi pembayaran manual yang diberikan oleh Admin.</li>
            <li>Kirimkan bukti transfer, dan saldo akan diproses dalam 1x24 jam.</li>
        </ol>
    </div>
        </article>
    )
}

export default TopUpGuidePage
