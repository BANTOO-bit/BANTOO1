import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MerchantBottomNavigation from '../../../components/merchant/MerchantBottomNavigation'
import { useAuth } from '../../../context/AuthContext'
import merchantService from '../../../services/merchantService'

function MerchantProfilePage() {
    const navigate = useNavigate()
    const { user, logout, isShopOpen, toggleShopStatus } = useAuth()
    const [showLogoutModal, setShowLogoutModal] = useState(false)
    const [merchantInfo, setMerchantInfo] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchMerchantProfile() {
            if (user?.merchantId) {
                try {
                    const data = await merchantService.getMerchantById(user.merchantId)
                    setMerchantInfo(data)
                } catch (error) {
                    if (process.env.NODE_ENV === 'development') console.error('Failed to load merchant profile', error)
                } finally {
                    setIsLoading(false)
                }
            } else {
                setIsLoading(false)
            }
        }
        fetchMerchantProfile()
    }, [user?.merchantId])

    const handleEditProfile = () => {
        navigate('/merchant/profile/edit')
    }

    const confirmLogout = async () => {
        try {
            await logout()
            navigate('/login')
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error('Logout failed:', error)
        }
    }

    if (isLoading) {
        return <div className="min-h-screen bg-background-light dark:bg-background-dark"></div>
    }

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark transition-colors duration-200 relative min-h-screen max-w-md mx-auto overflow-hidden">

            <div className={`relative z-0 h-full overflow-y-auto pb-24 ${showLogoutModal ? 'opacity-40 dark:opacity-30 filter blur-[1px] pointer-events-none' : ''}`}>
                <header className="pt-8 pb-4 text-center">
                    <h1 className="text-lg font-bold">Profil Warung</h1>
                </header>

                <div className="flex flex-col items-center px-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-card-dark shadow-sm mb-4 bg-gray-200 dark:bg-gray-700">
                        {merchantInfo?.image ? (
                            <img
                                alt="Foto Profil Warung"
                                className="w-full h-full object-cover"
                                src={merchantInfo.image}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <span className="material-symbols-outlined text-4xl">store</span>
                            </div>
                        )}
                    </div>
                    <h2 className="text-xl font-bold mb-1">{merchantInfo?.name || user?.merchantName || 'Nama Warung'}</h2>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-6">
                        {merchantInfo?.category || 'Kategori'} • {merchantInfo?.address || 'Lokasi'}
                    </p>
                    <button
                        onClick={handleEditProfile}
                        className="px-8 py-2.5 rounded-full border border-primary text-primary font-medium text-sm bg-transparent hover:bg-orange-50 transition-colors"
                    >
                        Ubah Profil
                    </button>
                </div>

                <div className="px-4 mt-8 space-y-6">
                    {/* Operasional */}
                    <div>
                        <h3 className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider mb-2 ml-2">Operasional</h3>
                        <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft divide-y divide-border-light dark:divide-border-dark overflow-hidden">
                            <div
                                onClick={() => navigate('/merchant/reviews')}
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                                        <span className="material-symbols-outlined text-lg">star</span>
                                    </div>
                                    <span className="font-medium text-sm">Ulasan Pembeli</span>
                                </div>
                                <span className="material-icons-round text-gray-400 text-lg">chevron_right</span>
                            </div>
                            <div
                                onClick={() => navigate('/merchant/profile/hours')}
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <span className="material-icons-round text-lg">schedule</span>
                                    </div>
                                    <span className="font-medium text-sm">Jam Operasional</span>
                                </div>
                                <span className="material-icons-round text-gray-400 text-lg">chevron_right</span>
                            </div>
                            <div
                                onClick={toggleShopStatus}
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                        <span className="material-icons-round text-lg">storefront</span>
                                    </div>
                                    <span className="font-medium text-sm">Status Toko</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-medium ${isShopOpen ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {isShopOpen ? 'Buka' : 'Tutup'}
                                    </span>
                                    {/* Optional: Add a switch icon or similar visual indicator if needed, but text update is sufficient for now */}
                                    <span className="material-icons-round text-gray-400 text-lg">chevron_right</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Keuangan */}
                    <div>
                        <h3 className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider mb-2 ml-2">Keuangan</h3>
                        <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft divide-y divide-border-light dark:divide-border-dark overflow-hidden">
                            <div
                                onClick={() => navigate('/merchant/balance')}
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                        <span className="material-icons-round text-lg">account_balance_wallet</span>
                                    </div>
                                    <span className="font-medium text-sm">Saldo & Penghasilan</span>
                                </div>
                                <span className="material-icons-round text-gray-400 text-lg">chevron_right</span>
                            </div>
                            <div
                                onClick={() => navigate('/merchant/balance/add-bank')}
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                        <span className="material-icons-round text-lg">account_balance</span>
                                    </div>
                                    <span className="font-medium text-sm">Rekening Bank</span>
                                </div>
                                <span className="material-icons-round text-gray-400 text-lg">chevron_right</span>
                            </div>
                        </div>
                    </div>

                    {/* Akun & Keamanan */}
                    <div>
                        <h3 className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider mb-2 ml-2">Akun & Keamanan</h3>
                        <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft divide-y divide-border-light dark:divide-border-dark overflow-hidden">
                            <div
                                onClick={() => navigate('/merchant/profile/account')}
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400">
                                        <span className="material-icons-round text-lg">badge</span>
                                    </div>
                                    <span className="font-medium text-sm">Informasi Akun</span>
                                </div>
                                <span className="material-icons-round text-gray-400 text-lg">chevron_right</span>
                            </div>
                            <div
                                onClick={() => navigate('/merchant/profile/password')}
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400">
                                        <span className="material-icons-round text-lg">lock</span>
                                    </div>
                                    <span className="font-medium text-sm">Ganti Kata Sandi</span>
                                </div>
                                <span className="material-icons-round text-gray-400 text-lg">chevron_right</span>
                            </div>
                        </div>
                    </div>

                    {/* Lainnya */}
                    <div>
                        <h3 className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider mb-2 ml-2">Lainnya</h3>
                        <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft divide-y divide-border-light dark:divide-border-dark overflow-hidden">
                            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
                                        <span className="material-icons-round text-lg">help</span>
                                    </div>
                                    <span className="font-medium text-sm">Pusat Bantuan</span>
                                </div>
                                <span className="material-icons-round text-gray-400 text-lg">chevron_right</span>
                            </div>
                            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
                                        <span className="material-icons-round text-lg">info</span>
                                    </div>
                                    <span className="font-medium text-sm">Tentang Bantoo!</span>
                                </div>
                                <span className="material-icons-round text-gray-400 text-lg">chevron_right</span>
                            </div>
                            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
                                        <span className="material-icons-round text-lg">description</span>
                                    </div>
                                    <span className="font-medium text-sm">Syarat & Ketentuan</span>
                                </div>
                                <span className="material-icons-round text-gray-400 text-lg">chevron_right</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className="w-full py-3 bg-card-light dark:bg-card-dark text-red-600 dark:text-red-400 font-medium rounded-xl shadow-soft mb-8 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                    >
                        Keluar dari Akun
                    </button>
                </div>
            </div>

            {/* Logout Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/40 backdrop-blur-[2px] transition-opacity">
                    <div className="bg-white dark:bg-card-dark w-full max-w-sm rounded-2xl p-6 shadow-xl transform transition-all scale-100 animate-fade-in relative">
                        <div className="text-center">
                            <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark mb-2">
                                Keluar dari Akun?
                            </h3>
                            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-6 leading-relaxed">
                                Apakah Anda yakin ingin keluar dari Dashboard Warung?
                            </p>
                            <div className="flex flex-col space-y-3">
                                <button
                                    onClick={confirmLogout}
                                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors duration-200 shadow-md"
                                >
                                    Ya, Keluar
                                </button>
                                <button
                                    onClick={() => setShowLogoutModal(false)}
                                    className="w-full py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-text-secondary-light dark:text-text-primary-dark font-medium rounded-xl transition-colors duration-200"
                                >
                                    Batal
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className={`${showLogoutModal ? 'opacity-40 dark:opacity-30 filter blur-[1px]' : ''}`}>
                <MerchantBottomNavigation activeTab="profile" />
            </div>
        </div>
    )
}

export default MerchantProfilePage
