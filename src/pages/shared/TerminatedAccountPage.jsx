import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function TerminatedAccountPage() {
    const navigate = useNavigate()
    const { logout, user } = useAuth()

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    const handleContactAdmin = () => {
        window.open('mailto:support@bantoo.app?subject=Kemitraan Diputus - ' + (user?.phone || ''), '_blank')
    }

    return (
        <div className="min-h-screen bg-background-light flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                {/* Icon */}
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-rounded text-5xl text-red-600">cancel</span>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-text-primary mb-2">
                    Kemitraan Diputus
                </h1>

                {/* Description */}
                <p className="text-text-secondary text-sm mb-2">
                    Kemitraan Anda dengan platform telah diputus secara permanen oleh admin.
                </p>

                {/* Reason Box */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-left">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-rounded text-red-600 text-xl mt-0.5">gavel</span>
                        <div>
                            <p className="text-sm font-semibold text-red-800 mb-1">Apa yang terjadi?</p>
                            <ul className="text-xs text-red-700 space-y-1">
                                <li>• Akun Anda telah dihentikan dari platform</li>
                                <li>• Anda tidak bisa menerima pesanan atau order</li>
                                <li>• Tindakan ini bersifat permanen</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-8 text-left">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-rounded text-gray-500 text-xl mt-0.5">help</span>
                        <div>
                            <p className="text-sm font-semibold text-gray-700 mb-1">Merasa ada kesalahan?</p>
                            <p className="text-xs text-gray-600">
                                Jika Anda merasa keputusan ini tidak tepat, silakan hubungi tim support kami
                                untuk mengajukan banding. Proses peninjauan membutuhkan waktu 3-7 hari kerja.
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

export default TerminatedAccountPage
