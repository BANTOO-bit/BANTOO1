import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { pushNotificationService } from '@/services/pushNotificationService'
import orderService from '@/services/orderService'
import driverService from '@/services/driverService'
import { APP_VERSION_STRING } from '@/config/appConfig'
import ProfileMenuItem from '@/features/customer/components/ProfileMenuItem'
import BottomNavigation from '@/features/customer/components/BottomNavigation'
import RoleSwitchOverlay from '@/features/shared/components/RoleSwitchOverlay'

function LogoutConfirmModal({ isOpen, onClose, onConfirm, activeOrderCount = 0 }) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-[2px]">
            <div className="w-full max-w-[320px] bg-white rounded-2xl shadow-2xl p-5 flex flex-col items-center text-center animate-scale-in">
                {/* Icon */}
                <div className={`mb-5 h-14 w-14 rounded-full ${activeOrderCount > 0 ? 'bg-amber-50' : 'bg-red-50'} flex items-center justify-center shrink-0`}>
                    <span className={`material-symbols-outlined ${activeOrderCount > 0 ? 'text-amber-500' : 'text-red-500'} text-[32px]`}>
                        {activeOrderCount > 0 ? 'warning' : 'logout'}
                    </span>
                </div>

                {/* Title */}
                <h2 className="text-[18px] font-semibold text-slate-900 mb-2 leading-tight">
                    {activeOrderCount > 0 ? 'Ada Pesanan Aktif!' : 'Keluar dari Akun?'}
                </h2>

                {/* Body Text */}
                <p className="text-[14px] text-slate-500 font-normal leading-relaxed mb-8 max-w-[260px]">
                    {activeOrderCount > 0
                        ? `Anda masih memiliki ${activeOrderCount} pesanan yang sedang diproses. Pesanan akan tetap berjalan meski Anda logout.`
                        : 'Anda perlu masuk kembali untuk menggunakan aplikasi'
                    }
                </p>

                {/* Action Buttons */}
                <div className="flex flex-row gap-3 w-full">
                    <button
                        onClick={onClose}
                        className="flex-1 h-[44px] flex items-center justify-center rounded-lg border border-gray-300 bg-white text-slate-700 text-[14px] font-medium active:bg-gray-50 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 h-[44px] flex items-center justify-center rounded-lg ${activeOrderCount > 0 ? 'bg-amber-500 hover:bg-amber-600' : 'bg-red-500 hover:bg-red-600'} text-white text-[14px] font-semibold active:shadow-none active:translate-y-[1px] transition-all`}
                    >
                        {activeOrderCount > 0 ? 'Tetap Keluar' : 'Keluar'}
                    </button>
                </div>
            </div>
        </div>
    )
}

function ProfilePage() {
    const navigate = useNavigate()
    const { user, logout, switchRole } = useAuth()
    const { cartItems } = useCart()
    const toast = useToast()
    const [showLogoutModal, setShowLogoutModal] = useState(false)
    const [switchingRole, setSwitchingRole] = useState(null)
    const [merchantPendingCount, setMerchantPendingCount] = useState(0)
    const [driverAvailableCount, setDriverAvailableCount] = useState(0)
    const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
    const [notifPermission, setNotifPermission] = useState(
        pushNotificationService.isSupported() ? pushNotificationService.getPermission() : 'denied'
    )

    // Fetch merchant pending orders for badge
    useEffect(() => {
        if (user?.roles?.includes('merchant') && user?.merchantStatus === 'approved' && user?.merchantId) {
            orderService.getMerchantOrders(user.merchantId, ['pending'])
                .then(orders => setMerchantPendingCount(orders?.length || 0))
                .catch(() => { })
        }
    }, [user])

    // Fetch driver available orders for badge
    useEffect(() => {
        if (user?.roles?.includes('driver') && user?.driverStatus === 'approved') {
            driverService.getAvailableOrders({ lat: 0, lng: 0 })
                .then(orders => setDriverAvailableCount(orders?.length || 0))
                .catch(() => { })
        }
    }, [user])

    // Construct display data
    const userData = user ? {
        name: user.user_metadata?.full_name || user.user_metadata?.name || 'Pengguna',
        phone: user.phone || user.user_metadata?.phone || '-',
        avatar: user.user_metadata?.avatar_url || "https://ui-avatars.com/api/?name=" + (user.user_metadata?.full_name || 'User') + "&background=random",
        ...user // Include other props like merchantStatus
    } : null // Return null during logout to avoid rendering stale data

    // Helper to check if user is primarily a driver
    useEffect(() => {
        if (user?.driverStatus === 'approved' && window.location.pathname === '/profile') {
            if (!user?.roles?.includes('customer')) {
                navigate('/driver/profile', { replace: true })
            }
        }
    }, [user, navigate])

    // If logging out or no user, don't render profile content to avoid flash/crash
    if (!userData) return null

    const handleEditProfile = () => {
        navigate('/profile/edit')
    }

    const [activeOrderCount, setActiveOrderCount] = useState(0)

    const handleLogout = async () => {
        // FIX-U2: Check for active orders before showing logout modal
        try {
            const activeOrders = await orderService.getCustomerOrders(['pending', 'accepted', 'preparing', 'ready', 'pickup', 'picked_up', 'delivering'])
            setActiveOrderCount(activeOrders?.length || 0)
        } catch {
            setActiveOrderCount(0)
        }
        setShowLogoutModal(true)
    }

    const confirmLogout = async () => {
        setShowLogoutModal(false)
        if (logout) await logout()
        navigate('/login', { replace: true })
    }

    // Safety check before switching role
    const handleSwitchRole = async (targetRole, targetPath) => {
        try {
            // Check for active customer orders before leaving
            const activeOrders = await orderService.getCustomerOrders(['pending', 'confirmed', 'preparing', 'ready', 'pickup'])
            if (activeOrders?.length > 0) {
                toast.error(`Anda masih punya ${activeOrders.length} pesanan aktif. Selesaikan dulu sebelum pindah role.`)
                return
            }
            await executeSwitchRole(targetRole, targetPath)
        } catch (err) {
            if (import.meta.env.DEV) console.error('Error checking before switch:', err)
            toast.error('Terjadi kesalahan. Coba lagi.')
        }
    }

    const executeSwitchRole = async (targetRole, targetPath) => {
        try {
            setSwitchingRole(targetRole)
            await switchRole(targetRole)
            navigate(targetPath, { replace: true })
        } catch (err) {
            if (import.meta.env.DEV) console.error('Failed to switch role:', err)
            toast.error(`Gagal pindah ke ${targetRole === 'merchant' ? 'Warung' : 'Driver'}. Coba lagi.`)
        } finally {
            setSwitchingRole(null)
        }
    }


    return (
        <div className="relative min-h-screen flex flex-col overflow-x-hidden pb-bottom-nav bg-background-light">
            {/* Header with Profile Info */}
            <header className="px-4 pt-12 pb-4">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full overflow-hidden shadow-sm bg-white dark:bg-card-dark">
                            <img
                                alt={userData.name}
                                className="w-full h-full object-cover"
                                src={userData.avatar}
                            />
                        </div>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{userData.name}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{userData.phone}</p>
                        <button
                            onClick={handleEditProfile}
                            className="text-sm font-medium text-primary hover:text-blue-700 transition-colors mt-0.5"
                        >
                            Ubah Profil
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate('/cart')}
                            className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-primary hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors relative shadow-sm border border-gray-200 dark:border-gray-700"
                        >
                            <span className="material-symbols-outlined text-xl">shopping_cart</span>
                            {cartItemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                    {cartItemCount > 9 ? '9+' : cartItemCount}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={handleEditProfile}
                            className="w-10 h-10 rounded-full bg-gray-200/50 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto w-full px-4 pt-4 flex flex-col gap-8 pb-bottom-nav">
                {/* Aktivitas Saya */}
                <div>
                    <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 pl-1">
                        Aktivitas Saya
                    </h3>
                    <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                        <button
                            onClick={() => navigate('/orders')}
                            className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-800 active:bg-gray-100"
                        >
                            <span className="material-symbols-outlined text-primary text-2xl">receipt_long</span>
                            <span className="flex-1 text-left font-medium text-gray-900 dark:text-white">Pesanan Saya</span>
                            <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                        </button>
                        <button
                            onClick={() => navigate('/registration-status')}
                            className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors active:bg-gray-100"
                        >
                            <span className="material-symbols-outlined text-primary text-2xl">badge</span>
                            <span className="flex-1 text-left font-medium text-gray-900 dark:text-white">Status Pendaftaran</span>
                            <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                        </button>
                    </div>
                </div>

                {/* Mitra Area (Role Entry Points -> Only if Approved) */}
                {(user?.roles?.includes('merchant') && user?.merchantStatus === 'approved') || (user?.roles?.includes('driver') && user?.driverStatus === 'approved') ? (
                    <div className="mt-0">
                        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 pl-1">
                            Akses Mitra
                        </h3>
                        <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">

                            {/* Merchant Entry */}
                            {user?.roles?.includes('merchant') && user?.merchantStatus === 'approved' ? (
                                <button
                                    disabled={switchingRole !== null}
                                    onClick={() => handleSwitchRole('merchant', '/merchant/dashboard')}
                                    className={`w-full flex items-center gap-4 p-4 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors border-b border-gray-100 dark:border-gray-800 active:bg-orange-100 ${switchingRole ? 'opacity-50 pointer-events-none' : ''}`}
                                >
                                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-lg">store</span>
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-bold text-gray-900 dark:text-white leading-tight">{switchingRole === 'merchant' ? 'Memindahkan...' : 'Masuk ke Warung'}</p>
                                        <p className="text-[10px] text-gray-500">Kelola menu dan pesanan</p>
                                    </div>
                                    {merchantPendingCount > 0 && !switchingRole && (
                                        <span className="min-w-5 h-5 px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                            {merchantPendingCount}
                                        </span>
                                    )}
                                    <span className="material-symbols-outlined text-gray-400">{switchingRole === 'merchant' ? '' : 'login'}</span>
                                    {switchingRole === 'merchant' && <span className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></span>}
                                </button>
                            ) : null}

                            {/* Driver Entry */}
                            {user?.roles?.includes('driver') && user?.driverStatus === 'approved' ? (
                                <button
                                    disabled={switchingRole !== null}
                                    onClick={() => handleSwitchRole('driver', '/driver/dashboard')}
                                    className={`w-full flex items-center gap-4 p-4 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors active:bg-blue-100 ${switchingRole ? 'opacity-50 pointer-events-none' : ''}`}
                                >
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-lg">two_wheeler</span>
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-bold text-gray-900 dark:text-white leading-tight">{switchingRole === 'driver' ? 'Memindahkan...' : 'Masuk ke Driver'}</p>
                                        <p className="text-[10px] text-gray-500">Mulai terima orderan</p>
                                    </div>
                                    {driverAvailableCount > 0 && !switchingRole && (
                                        <span className="min-w-5 h-5 px-1.5 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                            {driverAvailableCount}
                                        </span>
                                    )}
                                    <span className="material-symbols-outlined text-gray-400">{switchingRole === 'driver' ? '' : 'login'}</span>
                                    {switchingRole === 'driver' && <span className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></span>}
                                </button>
                            ) : null}
                        </div>
                    </div>
                ) : null}


                {/* Mitra Bantoo - Only show if Approved */}


                {/* Pengaturan Akun */}
                <div>
                    <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 pl-1">
                        Pengaturan Akun
                    </h3>
                    <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                        {/* Push Notification Toggle */}
                        <button
                            onClick={async () => {
                                if (notifPermission === 'granted') {
                                    // Already granted, nothing to do
                                    return
                                }
                                if (notifPermission === 'denied') {
                                    alert('Notifikasi diblokir oleh browser. Buka pengaturan browser → izinkan notifikasi untuk situs ini.')
                                    return
                                }
                                // Request permission (user gesture)
                                const token = await pushNotificationService.registerFCM(user?.id, user?.activeRole || 'customer')
                                if (token) {
                                    setNotifPermission('granted')
                                } else {
                                    setNotifPermission(pushNotificationService.getPermission())
                                }
                            }}
                            className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-800 active:bg-gray-100"
                        >
                            <span className="material-symbols-outlined text-primary text-2xl">notifications</span>
                            <span className="flex-1 text-left font-medium text-gray-900 dark:text-white">Notifikasi Push</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${notifPermission === 'granted'
                                ? 'bg-green-100 text-green-700'
                                : notifPermission === 'denied'
                                    ? 'bg-red-100 text-red-600'
                                    : 'bg-gray-100 text-gray-500'
                                }`}>
                                {notifPermission === 'granted' ? 'Aktif' : notifPermission === 'denied' ? 'Diblokir' : 'Nonaktif'}
                            </span>
                        </button>
                        <button
                            onClick={() => navigate('/address')}
                            className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-800 active:bg-gray-100"
                        >
                            <span className="material-symbols-outlined text-primary text-2xl">location_on</span>
                            <span className="flex-1 text-left font-medium text-gray-900 dark:text-white">Daftar Alamat</span>
                            <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                        </button>
                        <button
                            onClick={() => navigate('/payment-methods')}
                            className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-800 active:bg-gray-100"
                        >
                            <span className="material-symbols-outlined text-primary text-2xl">account_balance_wallet</span>
                            <span className="flex-1 text-left font-medium text-gray-900 dark:text-white">Metode Pembayaran</span>
                            <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                        </button>
                        <button
                            onClick={() => navigate('/security')}
                            className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors active:bg-gray-100"
                        >
                            <span className="material-symbols-outlined text-primary text-2xl">security</span>
                            <span className="flex-1 text-left font-medium text-gray-900 dark:text-white">Keamanan Akun</span>
                            <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                        </button>
                    </div>
                </div>

                {/* Dukungan & Lainnya */}
                <div>
                    <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 pl-1">
                        Dukungan & Lainnya
                    </h3>
                    <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                        <button
                            onClick={() => navigate('/help')}
                            className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-800 active:bg-gray-100"
                        >
                            <span className="material-symbols-outlined text-primary text-2xl">help</span>
                            <span className="flex-1 text-left font-medium text-gray-900 dark:text-white">Pusat Bantuan</span>
                            <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                        </button>
                        <button
                            onClick={() => navigate('/about')}
                            className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-800 active:bg-gray-100"
                        >
                            <span className="material-symbols-outlined text-primary text-2xl">info</span>
                            <span className="flex-1 text-left font-medium text-gray-900 dark:text-white">Tentang Bantoo!</span>
                            <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                        </button>
                        <button
                            onClick={() => navigate('/terms')}
                            className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors active:bg-gray-100"
                        >
                            <span className="material-symbols-outlined text-primary text-2xl">description</span>
                            <span className="flex-1 text-left font-medium text-gray-900 dark:text-white">Syarat & Ketentuan</span>
                            <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                        </button>
                    </div>
                </div>

                {/* Logout */}
                <div className="mt-2">
                    <button
                        onClick={handleLogout}
                        className="w-full bg-white dark:bg-card-dark hover:bg-red-50 dark:hover:bg-red-900/10 text-red-500 font-bold py-4 rounded-2xl border border-gray-100 dark:border-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">logout</span>
                        <span>Keluar</span>
                    </button>
                    <p className="text-center text-[10px] text-gray-400 dark:text-gray-600 mt-6">
                        {APP_VERSION_STRING}
                    </p>
                </div>
            </main>

            {/* Bottom Navigation */}
            <BottomNavigation activeTab="profile" />

            {/* Logout Confirmation Modal */}
            <LogoutConfirmModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={confirmLogout}
                activeOrderCount={activeOrderCount}
            />

            {/* Role Switch Overlay */}
            {switchingRole && <RoleSwitchOverlay targetRole={switchingRole} />}
        </div>
    )
}

export default ProfilePage
