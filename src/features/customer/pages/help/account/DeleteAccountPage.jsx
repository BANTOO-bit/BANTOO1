function DeleteAccountPage() {
    return (
        <>
<section className="bg-white rounded-2xl p-5 shadow-soft border border-border-color">
    <h2 className="text-base font-bold text-text-main mb-3">Konsekuensi Penghapusan</h2>
    <div className="text-sm text-text-secondary space-y-3 leading-relaxed">
        <p>
            Menghapus akun Anda bersifat permanen dan tidak dapat dibatalkan. Setelah akun dihapus, Anda akan kehilangan akses ke semua data dan layanan Bantoo!.
        </p>
        <ul className="list-disc pl-5 space-y-1">
            <li>Saldo yang tersisa di dompet akan hangus.</li>
            <li>Riwayat transaksi dan pesanan akan hilang.</li>
            <li>Poin reward dan voucher yang belum digunakan akan hangus.</li>
            <li>Akses login ke aplikasi akan dicabut sepenuhnya.</li>
        </ul>
    </div>
        </section>

        <section className="bg-white rounded-2xl p-5 shadow-soft border border-border-color">
    <h2 className="text-base font-bold text-text-main mb-3">Langkah Pengajuan</h2>
    <div className="text-sm text-text-secondary space-y-4">
        <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">1</div>
            <p className="pt-0.5">Pastikan tidak ada pesanan yang sedang berlangsung atau tagihan yang belum dibayar.</p>
        </div>
        <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">2</div>
            <p className="pt-0.5">Kosongkan saldo atau tarik dana yang masih tersedia di akun Anda.</p>
        </div>
        <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">3</div>
            <p className="pt-0.5">Hubungi tim dukungan kami melalui WhatsApp di bawah ini untuk memproses penutupan akun secara manual.</p>
        </div>
        <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">4</div>
            <p className="pt-0.5">Tim kami akan memverifikasi identitas Anda dan memproses permintaan dalam 1-3 hari kerja.</p>
        </div>
    </div>
        </section>
        </>
    )
}

export default DeleteAccountPage
