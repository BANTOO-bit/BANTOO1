import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MerchantBottomNavigation from '@/features/merchant/components/MerchantBottomNavigation'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { useMerchantShop } from '@/hooks/useMerchantShop'
import merchantService from '@/services/merchantService'
import orderService from '@/services/orderService'
import driverService from '@/services/driverService'
import RoleSwitchOverlay from '@/features/shared/components/RoleSwitchOverlay'
import { APP_VERSION_STRING } from '@/config/appConfig'

function MerchantProfilePage() {
    const navigate = useNavigate()
    const { user, logout, switchRole } = useAuth()
    const { isShopOpen, toggleShopStatus } = useMerchantShop()
    const toast = useToast()
    const [showLogoutModal, setShowLogoutModal] = useState(false)
    const [activeOrderCount, setActiveOrderCount] = useState(0)
    const [merchantInfo, setMerchantInfo] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [switchingRole, setSwitchingRole] = useState(null)
    const [switchConfirm, setSwitchConfirm] = useState(null)
    const [driverAvailableCount, setDriverAvailableCount] = useState(0)
    const [driverProfile, setDriverProfile] = useState(null)

    useEffect(() => {
        async function fetchMerchantProfile() {
            if (user?.merchantId) {
                try {
                    const data = await merchantService.getMerchantById(user.merchantId)
                    setMerchantInfo(data)
                } catch (error) {
                    if (import.meta.env.DEV) console.error('Failed to load merchant profile', error)
                } finally {
                    setIsLoading(false)
                }
            } else {
                setIsLoading(false)
            }
        }
        fetchMerchantProfile()
    }, [user?.merchantId])

    // Fetch driver available orders for badge
    useEffect(() => {
        if (user?.roles?.includes('driver') && user?.driverStatus === 'approved') {
            driverService.getAvailableOrders({ lat: 0, lng: 0 })
                .then(orders => setDriverAvailableCount(orders?.length || 0))
                .catch(() => { })
            // Fetch driver profile for is_active check (online status)
            driverService.getProfile()
                .then(profile => setDriverProfile(profile))
                .catch(() => { })
        }
    }, [user?.id, user?.roles, user?.driverStatus])

    const handleEditProfile = () => {
        navigate('/merchant/profile/edit')
    }

    const handleLogoutClick = async () => {
        // Check for active orders before showing logout modal
        try {
            if (user?.merchantId) {
                const activeOrders = await orderService.getMerchantOrders(user.merchantId, ['pending', 'accepted', 'preparing', 'ready', 'pickup'])
                setActiveOrderCount(activeOrders?.length || 0)
            }
        } catch {
            setActiveOrderCount(0)
        }
        setShowLogoutModal(true)
    }

    const confirmLogout = async () => {
        try {
            await logout()
            navigate('/login')
        } catch (error) {
            if (import.meta.env.DEV) console.error('Logout failed:', error)
        }
    }

    // Safety check before switching role — warn instead of block
    const handleSwitchRole = async (targetRole, targetPath) => {
        try {
            let warnings = []

            // 1. Check for active orders — warn (not block)
            if (user?.merchantId) {
                const activeOrders = await orderService.getMerchantOrders(user.merchantId, ['pending', 'accepted', 'preparing', 'ready', 'pickup'])
                if (activeOrders && activeOrders.length > 0) {
                    warnings.push(`${activeOrders.length} pesanan aktif yang masih berjalan`)
                }
            }

            // 2. If driver is online, add to warning
            if (targetRole === 'driver' && driverProfile?.is_active) {
                warnings.push('status driver menjadi Offline')
            }

            // 3. Show confirmation if there are warnings
            if (warnings.length > 0) {
                setSwitchConfirm({ targetRole, targetPath, warnings })
                return
            }

            // 4. No warnings — proceed directly
            await executeSwitchRole(targetRole, targetPath)
        } catch (err) {
            if (import.meta.env.DEV) console.error('Error checking before switch:', err)
            toast.error('Terjadi kesalahan. Coba lagi.')
        }
    }

    const executeSwitchRole = async (targetRole, targetPath) => {
        try {
            setSwitchingRole(targetRole)
            setSwitchConfirm(null)
            await switchRole(targetRole)
            navigate(targetPath, { replace: true })
        } catch (err) {
            if (import.meta.env.DEV) console.error('Failed to switch role:', err)
            toast.error(`Gagal pindah role. Coba lagi.`)
        } finally {
            setSwitchingRole(null)
        }
    }

    if (isLoading) {
        return <div className="min-h-screen bg-background-light dark:bg-background-dark"></div>
    }

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark transition-colors duration-200 relative min-h-screen max-w-md mx-auto overflow-hidden">

            <div className={`relative z-0 h-full overflow-y-auto pb-bottom-nav ${showLogoutModal || switchConfirm ? 'opacity-40 dark:opacity-30 filter blur-[1px] pointer-events-none' : ''}`}>
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
                                onClick={() => navigate('/merchant/wallet')}
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
                            <div
                                onClick={() => navigate('/merchant/help')}
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
                                        <span className="material-icons-round text-lg">help</span>
                                    </div>
                                    <span className="font-medium text-sm">Pusat Bantuan</span>
                                </div>
                                <span className="material-icons-round text-gray-400 text-lg">chevron_right</span>
                            </div>
                            <div
                                onClick={() => navigate('/about')}
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
                                        <span className="material-icons-round text-lg">info</span>
                                    </div>
                                    <span className="font-medium text-sm">Tentang Bantoo!</span>
                                </div>
                                <span className="material-icons-round text-gray-400 text-lg">chevron_right</span>
                            </div>
                            <div
                                onClick={() => navigate('/terms')}
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
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

                    {/* Ganti Akun (Role Switch) */}
                    <div>
                        <h3 className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider mb-2 ml-2">Ganti Akun</h3>
                        <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft divide-y divide-border-light dark:divide-border-dark overflow-hidden">
                            <div
                                onClick={switchingRole ? undefined : () => handleSwitchRole('customer', '/')}
                                className={`flex items-center justify-between p-4 cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors ${switchingRole ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                        <span className="material-icons-round text-lg">person</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm">{switchingRole === 'customer' ? 'Memindahkan...' : 'Kembali ke Customer'}</span>
                                        <span className="text-[10px] text-gray-400">Pesan makanan sebagai pembeli</span>
                                    </div>
                                </div>
                                <span className="material-icons-round text-gray-400 text-lg">{switchingRole === 'customer' ? '' : 'login'}</span>
                                {switchingRole === 'customer' && <span className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></span>}
                            </div>

                            {user?.roles?.includes('driver') && user?.driverStatus === 'approved' && (
                                <div
                                    onClick={switchingRole ? undefined : () => handleSwitchRole('driver', '/driver/dashboard')}
                                    className={`flex items-center justify-between p-4 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${switchingRole ? 'opacity-50 pointer-events-none' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                            <span className="material-icons-round text-lg">two_wheeler</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">{switchingRole === 'driver' ? 'Memindahkan...' : 'Masuk ke Driver'}</span>
                                            <span className="text-[10px] text-gray-400">Mulai terima orderan</span>
                                        </div>
                                    </div>
                                    {driverAvailableCount > 0 && !switchingRole && (
                                        <span className="min-w-5 h-5 px-1.5 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                            {driverAvailableCount}
                                        </span>
                                    )}
                                    <span className="material-icons-round text-gray-400 text-lg">{switchingRole === 'driver' ? '' : 'login'}</span>
                                    {switchingRole === 'driver' && <span className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></span>}
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleLogoutClick}
                        className="w-full py-3 bg-card-light dark:bg-card-dark text-red-600 dark:text-red-400 font-medium rounded-xl shadow-soft mb-2 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                    >
                        Keluar dari Akun
                    </button>
                    <p className="text-center text-[10px] text-gray-400 dark:text-gray-600 mb-6">
                        {APP_VERSION_STRING}
                    </p>
                </div>
            </div>

            {/* Logout Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/40 backdrop-blur-[2px] transition-opacity">
                    <div className="bg-white dark:bg-card-dark w-full max-w-sm rounded-2xl p-6 shadow-xl transform transition-all scale-100 animate-fade-in relative">
                        <div className="text-center">
                            <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark mb-2">
                                {activeOrderCount > 0 ? 'Ada Pesanan Aktif!' : 'Keluar dari Akun?'}
                            </h3>
                            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-6 leading-relaxed">
                                {activeOrderCount > 0
                                    ? `Anda masih punya ${activeOrderCount} pesanan aktif. Pesanan tetap berjalan meski Anda logout.`
                                    : 'Apakah Anda yakin ingin keluar dari Dashboard Warung?'
                                }
                            </p>
                            <div className="flex flex-col space-y-3">
                                <button
                                    onClick={confirmLogout}
                                    className={`w-full py-3 ${activeOrderCount > 0 ? 'bg-amber-500 hover:bg-amber-600' : 'bg-red-600 hover:bg-red-700'} text-white font-semibold rounded-xl transition-colors duration-200 shadow-md`}
                                >
                                    {activeOrderCount > 0 ? 'Tetap Keluar' : 'Ya, Keluar'}
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

            <div className={`${showLogoutModal || switchConfirm ? 'opacity-40 dark:opacity-30 filter blur-[1px]' : ''}`}>
                <MerchantBottomNavigation activeTab="profile" />
            </div>

            {/* Switch Role Confirmation Modal (Active Orders / Driver Online) */}
            {switchConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-card-dark rounded-2xl w-full max-w-sm p-6 shadow-2xl transform transition-all scale-100">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-amber-500 text-[32px]">warning</span>
                            </div>
                            <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark mb-2">Perhatian</h3>
                            <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-6 space-y-2">
                                <p>Jika Anda pindah sekarang:</p>
                                <ul className="text-left space-y-1.5 pl-1">
                                    {switchConfirm.warnings.map((w, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span className="material-symbols-outlined text-amber-500 text-[16px] mt-0.5 shrink-0">info</span>
                                            <span>{w}</span>
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-xs text-gray-400 mt-3">
                                    Anda bisa kembali kapan saja untuk mengelola pesanan.
                                </p>
                            </div>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setSwitchConfirm(null)}
                                    className="flex-1 py-2.5 rounded-xl font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={() => executeSwitchRole(switchConfirm.targetRole, switchConfirm.targetPath)}
                                    className="flex-1 py-2.5 rounded-xl font-bold text-white bg-amber-500 hover:bg-amber-600 transition-colors"
                                >
                                    Ya, Pindah
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Role Switch Overlay */}
            {switchingRole && <RoleSwitchOverlay targetRole={switchingRole} />}
        </div>
    )
}

export default MerchantProfilePage
