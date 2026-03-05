function OtpIssuesHelpPage() {
    return (
<section className="bg-white rounded-2xl p-5 shadow-soft border border-border-color">
    <h2 className="text-lg font-bold text-text-main mb-4">Saya tidak menerima kode OTP</h2>
    <p className="text-sm text-text-secondary mb-6 leading-relaxed">
        Jika Anda mengalami kesulitan menerima kode OTP saat login atau verifikasi, silakan coba langkah-langkah berikut:
    </p>
    <ul className="flex flex-col gap-5">
        <li className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-lg">signal_cellular_alt</span>
            </div>
            <div>
                <h3 className="text-sm font-semibold text-text-main">Cek sinyal ponsel</h3>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">Pastikan bar sinyal di ponsel Anda penuh atau cukup kuat untuk menerima SMS.</p>
            </div>
        </li>
        <li className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-lg">dialpad</span>
            </div>
            <div>
                <h3 className="text-sm font-semibold text-text-main">Pastikan nomor benar</h3>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">Periksa kembali nomor handphone yang Anda masukkan. Pastikan nomor tersebut aktif.</p>
            </div>
        </li>
        <li className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-lg">schedule</span>
            </div>
            <div>
                <h3 className="text-sm font-semibold text-text-main">Tunggu beberapa menit</h3>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">Jaringan operator mungkin sedang sibuk. Tunggu 1-2 menit sebelum menekan tombol kirim ulang.</p>
            </div>
        </li>
        <li className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-lg">mail</span>
            </div>
            <div>
                <h3 className="text-sm font-semibold text-text-main">Cek folder spam email</h3>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">Jika OTP dikirimkan melalui email, jangan lupa untuk memeriksa folder Spam atau Junk Anda.</p>
            </div>
        </li>
        <li className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-lg">sms</span>
            </div>
            <div>
                <h3 className="text-sm font-semibold text-text-main">Cek pesan di nomor telepon</h3>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">Periksa kotak masuk SMS Anda secara berkala dan pastikan memori pesan ponsel Anda tidak penuh.</p>
            </div>
        </li>
        <li className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-[#25D366]">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"></path>
                </svg>
            </div>
            <div>
                <h3 className="text-sm font-semibold text-text-main">Cek pesan di WhatsApp</h3>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">Beberapa kode verifikasi mungkin dikirimkan melalui akun resmi WhatsApp Bantoo!.</p>
            </div>
        </li>
    </ul>
        </section>
    )
}

export default OtpIssuesHelpPage
