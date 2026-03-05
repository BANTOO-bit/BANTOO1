function AccountSecurityPage() {
    return (
<section className="bg-white rounded-2xl p-6 shadow-soft border border-border-color">
    <div className="mb-6">
        <h2 className="text-xl font-bold text-text-main mb-2">Tips Menjaga Keamanan</h2>
        <p className="text-sm text-text-secondary leading-relaxed">
            Keamanan data dan akun Anda adalah prioritas utama kami. Ikuti panduan berikut untuk memastikan akun Anda tetap terlindungi.
        </p>
    </div>
    <div className="flex flex-col gap-6">
        <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">sms_failed</span>
            </div>
            <div>
                <h3 class="font-bold text-text-main text-sm mb-1">Jangan bagikan kode OTP</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                    Kode OTP adalah kunci rahasia akun Anda. Pihak Bantoo! tidak pernah meminta kode OTP untuk alasan apapun. Jangan berikan kepada siapapun, termasuk yang mengaku sebagai admin.
                </p>
            </div>
        </div>
        <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">password</span>
            </div>
            <div>
                <h3 className="font-bold text-text-main text-sm mb-1">Gunakan kata sandi yang kuat</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                    Buat kata sandi dengan kombinasi huruf besar, huruf kecil, angka, dan simbol. Hindari menggunakan tanggal lahir atau informasi pribadi yang mudah ditebak.
                </p>
            </div>
        </div>
        <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">verified_user</span>
            </div>
            <div>
                <h3 className="font-bold text-text-main text-sm mb-1">Aktifkan autentikasi dua faktor</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                    Tambahkan lapisan keamanan ekstra dengan mengaktifkan verifikasi 2 langkah. Ini akan mencegah akses tidak sah meskipun seseorang mengetahui kata sandi Anda.
                </p>
            </div>
        </div>
    </div>
        </section>
    )
}

export default AccountSecurityPage
