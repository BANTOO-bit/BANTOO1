/**
 * EditProfileHelpPage — Content-only component for "How to edit profile" help article.
 * Rendered inside HelpArticlePage layout wrapper.
 */
function EditProfileHelpPage() {
    return (
        <article className="bg-white rounded-2xl p-5 shadow-soft border border-border-color">
            <h2 className="text-lg font-bold text-text-main mb-3">Bagaimana cara mengubah profil?</h2>
            <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                Anda dapat memperbarui informasi pribadi Anda seperti nama, foto, dan kontak kapan saja untuk memastikan data akun tetap akurat.
            </p>
            <div className="space-y-5">
                <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold mt-0.5">1</div>
                    <div className="text-sm text-text-main">
                        Buka menu <span className="font-semibold text-primary">Profil</span> pada navigasi di bagian bawah layar.
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold mt-0.5">2</div>
                    <div className="text-sm text-text-main">
                        Ketuk tombol <span className="font-semibold">Ubah Profil</span> yang terletak di samping atau di bawah foto profil Anda.
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold mt-0.5">3</div>
                    <div className="text-sm text-text-main">
                        Anda akan diarahkan ke halaman detail. Di sini, Anda dapat mengganti:
                        <ul className="list-disc ml-4 mt-2 text-text-secondary space-y-1">
                            <li>Foto Profil</li>
                            <li>Nama Lengkap</li>
                            <li>Informasi Kontak (Email/No. HP)</li>
                        </ul>
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold mt-0.5">4</div>
                    <div className="text-sm text-text-main">
                        Setelah selesai melakukan perubahan, jangan lupa tekan tombol <span className="font-semibold">Simpan</span>.
                    </div>
                </div>
            </div>
            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-base mt-0.5">info</span>
                    <p className="text-xs text-text-secondary leading-relaxed">
                        Perubahan pada nomor HP atau Email mungkin memerlukan verifikasi ulang melalui kode OTP untuk keamanan akun Anda.
                    </p>
                </div>
            </div>
        </article>
    )
}

export default EditProfileHelpPage
