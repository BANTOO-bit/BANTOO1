import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function SuspendedAccountPage() {
    const navigate = useNavigate()
    const { logout, user } = useAuth()

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    const handleContactAdmin = () => {
        // Open WhatsApp or email to admin
        window.open('mailto:support@bantoo.app?subject=Akun Disuspend - ' + (user?.phone || ''), '_blank')
    }

    return (
        <div className="min-h-screen bg-background-light flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                {/* Icon */}
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-rounded text-5xl text-red-500">block</span>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-text-primary mb-2">
                    Akun Disuspend
                </h1>

                {/* Description */}
                <p className="text-text-secondary text-sm mb-2">
                    Akun Anda telah ditangguhkan sementara oleh admin.
                </p>

                {/* Reason Box */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-left">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-rounded text-red-500 text-xl mt-0.5">info</span>
                        <div>
                            <p className="text-sm font-semibold text-red-800 mb-1">Kemungkinan Alasan:</p>
                            <ul className="text-xs text-red-700 space-y-1">
                                <li>• Pelanggaran ketentuan layanan</li>
                                <li>• Aktivitas mencurigakan terdeteksi</li>
                                <li>• Keluhan dari pengguna lain</li>
                                <li>• Verifikasi dokumen diperlukan</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-left">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-rounded text-amber-600 text-xl mt-0.5">help</span>
                        <div>
                            <p className="text-sm font-semibold text-amber-800 mb-1">Apa yang bisa dilakukan?</p>
                            <p className="text-xs text-amber-700">
                                Hubungi tim support kami untuk informasi lebih lanjut dan proses pemulihan akun. 
                                Kami akan meninjau kembali akun Anda dalam 1-3 hari kerja.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleContactAdmin}
                        className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-rounded text-xl">mail</span>
                        Hubungi Admin
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full bg-white border border-gray-200 text-text-secondary font-semibold py-3 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-rounded text-xl">logout</span>
                        Keluar
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SuspendedAccountPage
