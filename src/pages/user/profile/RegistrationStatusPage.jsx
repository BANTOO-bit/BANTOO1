import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNavigation from '../../../components/user/BottomNavigation'
import { useAuth } from '../../../context/AuthContext'

function RegistrationStatusPage() {
    const navigate = useNavigate()
    const { user, refreshProfile } = useAuth()

    // Refresh profile on mount to get latest status
    useEffect(() => {
        refreshProfile()
    }, [])

    const driverStatus = user?.driverStatus || 'none'
    const merchantStatus = user?.merchantStatus || 'none'
    // Rejection reasons not yet implemented in backend
    const driverRejectionReasons = []
    const merchantRejectionReasons = []

    const handleGoToProfile = () => {
        navigate('/profile')
    }

    const handleFixDriverRegistration = () => {
        navigate('/partner/driver/step-1')
    }

    const handleFixMerchantRegistration = () => {
        navigate('/partner/merchant/step-1')
    }

    const handleRegisterDriver = () => {
        navigate('/partner/driver/step-1')
    }

    const handleRegisterMerchant = () => {
        navigate('/partner/merchant/step-1')
    }

    return (
        <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark relative pb-bottom-nav">
            {/* Header */}
            <header className="bg-white dark:bg-card-dark px-4 pt-12 pb-4 sticky top-0 z-20 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Status Pendaftaran</h1>
                <div className="w-10"></div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto w-full p-5 flex flex-col gap-4 mt-4">
                {/* Driver Registration Card */}
                <DriverRegistrationCard
                    status={driverStatus}
                    rejectionReasons={driverRejectionReasons}
                    onGoToProfile={handleGoToProfile}
                    onFixRegistration={handleFixDriverRegistration}
                    onRegister={handleRegisterDriver}
                />

                {/* Merchant Registration Card */}
                <MerchantRegistrationCard
                    status={merchantStatus}
                    rejectionReasons={merchantRejectionReasons}
                    onGoToProfile={handleGoToProfile}
                    onRegister={handleRegisterMerchant}
                />
            </main>

            {/* Bottom Navigation */}
            <BottomNavigation activeTab="profile" />
        </div>
    )
}

// Driver Registration Card Component
function DriverRegistrationCard({ status, rejectionReasons, onGoToProfile, onFixRegistration, onRegister }) {
    return (
        <div className="bg-white dark:bg-card-dark p-5 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-3xl">two_wheeler</span>
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1">Pendaftaran Driver</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Dapatkan penghasilan tambahan dengan kendaraan Anda.
                    </p>
                </div>
            </div>

            {/* Status: Processing/Pending */}
            {(status === 'processing' || status === 'pending') && (
                <>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 flex gap-3 items-start">
                        <span className="material-symbols-outlined text-blue-500 text-lg mt-0.5">schedule</span>
                        <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                            Pendaftaran Anda sedang ditinjau oleh Admin. Estimasi waktu 1-2 hari kerja.
                        </p>
                    </div>
                    <div className="w-full bg-yellow-500 text-white font-medium py-3 rounded-xl cursor-default transition-colors text-sm flex items-center justify-center gap-2 select-none">
                        <span className="material-symbols-outlined text-sm">hourglass_top</span>
                        <span>Sedang Diproses</span>
                    </div>
                </>
            )}

            {/* Status: Approved */}
            {status === 'approved' && (
                <>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 flex gap-3 items-start">
                        <span className="material-symbols-outlined text-green-500 text-lg mt-0.5">check_circle</span>
                        <p className="text-xs text-green-800 dark:text-green-200 leading-relaxed">
                            Selamat! Akun Driver Anda telah aktif.
                        </p>
                    </div>
                    <div className="w-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 font-medium py-2 rounded-xl cursor-default transition-colors text-sm flex items-center justify-center gap-2 select-none border border-green-200 dark:border-green-800/50">
                        <span className="material-symbols-outlined text-sm">check</span>
                        <span>Disetujui</span>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                            Akses Dashboard Driver melalui menu <strong>Profil &gt; Akses Mitra</strong>.
                        </p>
                        <button
                            onClick={onGoToProfile}
                            className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 active:scale-[0.98]"
                        >
                            <span>Kembali ke Profil</span>
                        </button>
                    </div>
                </>
            )}

            {/* Status: Rejected */}
            {status === 'rejected' && (
                <>
                    <div className="w-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 font-medium py-2 rounded-xl cursor-default transition-colors text-sm flex items-center justify-center gap-2 select-none border border-red-200 dark:border-red-800/50">
                        <span className="material-symbols-outlined text-sm">close</span>
                        <span>Ditolak</span>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 flex flex-col gap-2">
                        <p className="text-xs font-semibold text-red-800 dark:text-red-200">Alasan Penolakan:</p>
                        <div className="flex flex-col gap-1">
                            {rejectionReasons && rejectionReasons.map((reason, index) => (
                                <p key={index} className="text-xs text-red-700 dark:text-red-300 flex items-start gap-1">
                                    <span>-</span> <span>{reason}</span>
                                </p>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={onFixRegistration}
                        className="w-full bg-primary hover:bg-orange-600 text-white font-medium py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
                    >
                        <span>Perbaiki Pendaftaran</span>
                    </button>
                </>
            )}

            {/* Status: None (Not registered yet) */}
            {status === 'none' && (
                <button
                    onClick={onRegister}
                    className="w-full bg-primary hover:bg-orange-600 text-white font-medium py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
                >
                    <span>Daftar Sekarang</span>
                </button>
            )}
        </div>
    )
}

// Merchant Registration Card Component
function MerchantRegistrationCard({ status, rejectionReasons, onGoToProfile, onRegister }) {
    return (
        <div className="bg-white dark:bg-card-dark p-5 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-3xl">storefront</span>
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1">Pendaftaran Warung</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Jangkau lebih banyak pelanggan dengan mendaftarkan warung Anda.
                    </p>
                </div>
            </div>

            {/* Status: Processing/Pending */}
            {(status === 'processing' || status === 'pending') && (
                <>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 flex gap-3 items-start">
                        <span className="material-symbols-outlined text-blue-500 text-lg mt-0.5">schedule</span>
                        <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                            Pendaftaran Anda sedang ditinjau oleh Admin. Estimasi waktu 1-2 hari kerja.
                        </p>
                    </div>
                    <div className="w-full bg-yellow-500 text-white font-medium py-3 rounded-xl cursor-default transition-colors text-sm flex items-center justify-center gap-2 select-none">
                        <span className="material-symbols-outlined text-sm">hourglass_top</span>
                        <span>Sedang Diproses</span>
                    </div>
                </>
            )}

            {/* Status: Approved */}
            {status === 'approved' && (
                <>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 flex gap-3 items-start">
                        <span className="material-symbols-outlined text-green-500 text-lg mt-0.5">check_circle</span>
                        <p className="text-xs text-green-800 dark:text-green-200 leading-relaxed">
                            Selamat! Akun Warung Anda telah aktif.
                        </p>
                    </div>
                    <div className="w-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 font-medium py-2 rounded-xl cursor-default transition-colors text-sm flex items-center justify-center gap-2 select-none border border-green-200 dark:border-green-800/50">
                        <span className="material-symbols-outlined text-sm">check</span>
                        <span>Disetujui</span>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                            Akses Dashboard Warung melalui menu <strong>Profil &gt; Akses Mitra</strong>.
                        </p>
                        <button
                            onClick={onGoToProfile}
                            className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 active:scale-[0.98]"
                        >
                            <span>Kembali ke Profil</span>
                        </button>
                    </div>
                </>
            )}

            {/* Status: Rejected */}
            {status === 'rejected' && (
                <>
                    <div className="w-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 font-medium py-2 rounded-xl cursor-default transition-colors text-sm flex items-center justify-center gap-2 select-none border border-red-200 dark:border-red-800/50">
                        <span className="material-symbols-outlined text-sm">close</span>
                        <span>Ditolak</span>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 flex flex-col gap-2">
                        <p className="text-xs font-semibold text-red-800 dark:text-red-200">Alasan Penolakan:</p>
                        <div className="flex flex-col gap-1">
                            {rejectionReasons && rejectionReasons.map((reason, index) => (
                                <p key={index} className="text-xs text-red-700 dark:text-red-300 flex items-start gap-1">
                                    <span>-</span> <span>{reason}</span>
                                </p>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={onRegister}
                        className="w-full bg-primary hover:bg-orange-600 text-white font-medium py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
                    >
                        <span>Perbaiki Pendaftaran</span>
                    </button>
                </>
            )}

            {/* Status: None (Not registered yet) */}
            {status === 'none' && (
                <button
                    onClick={onRegister}
                    className="w-full bg-primary hover:bg-orange-600 text-white font-medium py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
                >
                    <span>Daftar Sekarang</span>
                </button>
            )}
        </div>
    )
}

export default RegistrationStatusPage
