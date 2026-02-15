import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import driverService from '../../services/driverService'
import { reviewService } from '../../services/reviewService'
import DriverBottomNavigation from '../../components/driver/DriverBottomNavigation'

function DriverProfilePage() {
    const navigate = useNavigate()
    const { logout, user } = useAuth()
    const [showLogoutModal, setShowLogoutModal] = useState(false)
    const [driverData, setDriverData] = useState(null)
    const [stats, setStats] = useState(null)
    const [ratingData, setRatingData] = useState({ averageRating: 0, totalReviews: 0 })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDriverData = async () => {
            if (!user?.id) return
            try {
                // Get user role first to find driver record
                const profile = await driverService.getProfile()
                if (!profile) return

                const [drvStats, rating] = await Promise.all([
                    driverService.getStats(),
                    reviewService.getDriverRating(profile.id)
                ])

                setDriverData(profile)
                setStats(drvStats)
                setRatingData(rating)
            } catch (error) {
                console.error('Failed to fetch driver profile:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchDriverData()
    }, [user])

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const menuItems = [
        { icon: 'person', label: 'Profil Saya', bgColor: 'bg-blue-50', iconColor: 'text-blue-600', path: '/driver/profile/edit' },
        { icon: 'two_wheeler', label: 'Detail Kendaraan', bgColor: 'bg-orange-50', iconColor: 'text-orange-600', path: '/driver/vehicle' },
        { icon: 'account_balance', label: 'Rekening Bank & Wallet', bgColor: 'bg-emerald-50', iconColor: 'text-emerald-600', path: '/driver/bank' },
    ]

    const supportItems = [
        { icon: 'support_agent', label: 'Bantuan & Dukungan', bgColor: 'bg-purple-50', iconColor: 'text-purple-600', path: '/driver/help' },
        { icon: 'security', label: 'Pusat Keamanan', bgColor: 'bg-teal-50', iconColor: 'text-teal-600', path: '/driver/security' },
    ]

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background-light">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="font-display bg-background-light text-slate-900 antialiased min-h-screen">
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl bg-background-light">
                {/* Header */}
                <header className="bg-white pb-6 pt-10 px-6 rounded-b-[2rem] shadow-sm border-b border-slate-100">
                    <div className="flex flex-col items-center text-center gap-4">
                        {/* Profile Photo */}
                        <div className="relative">
                            <div
                                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-24 ring-4 ring-white shadow-lg bg-gray-200"
                                style={{ backgroundImage: `url("${driverData?.profile?.avatar_url || 'https://via.placeholder.com/150'}")` }}
                            />
                            {driverData?.status === 'approved' && (
                                <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1.5 ring-4 ring-white shadow-sm flex items-center justify-center" title="Terverifikasi">
                                    <span className="material-symbols-outlined text-white text-[16px] font-bold">check</span>
                                </div>
                            )}
                        </div>

                        {/* Driver Info */}
                        <div className="flex flex-col gap-1 items-center">
                            <h1 className="text-2xl font-bold text-slate-900">{driverData?.profile?.full_name || 'Driver'}</h1>
                            <p className="text-slate-500 text-sm font-medium">
                                {driverData?.vehicle_plate || 'No Plat'} • {driverData?.vehicle_brand || 'Kendaraan'}
                            </p>
                            {driverData?.status === 'approved' && (
                                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-100">
                                    <span className="material-symbols-outlined text-[14px]">verified</span>
                                    Mitra Resmi
                                </div>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="flex w-full justify-center gap-8 mt-2">
                            <div
                                className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform"
                                onClick={() => navigate('/driver/reviews')}
                            >
                                <div className="flex items-center gap-1">
                                    <span className="text-lg font-bold text-slate-900">
                                        {ratingData?.averageRating ? ratingData.averageRating.toFixed(1) : '5.0'}
                                    </span>
                                    <span className="material-symbols-outlined text-amber-500 text-sm">star</span>
                                </div>
                                <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                                    Rating ({ratingData?.totalReviews || 0})
                                </span>
                            </div>
                            <div className="w-px h-8 bg-slate-200" />
                            <div className="flex flex-col items-center">
                                <span className="text-lg font-bold text-slate-900">{stats?.completedOrders || 0}</span>
                                <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Order</span>
                            </div>
                            <div className="w-px h-8 bg-slate-200" />
                            <div className="flex flex-col items-center">
                                <span className="text-lg font-bold text-slate-900">
                                    {new Date(driverData?.created_at).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })}
                                </span>
                                <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Gabung</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 px-4 py-6 flex flex-col gap-4 pb-24">
                    {/* Profile Menu */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                        {menuItems.map((item, index) => (
                            <a
                                key={item.label}
                                onClick={() => navigate(item.path)}
                                className={`flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group cursor-pointer ${index !== menuItems.length - 1 ? 'border-b border-slate-100' : ''}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`size-10 rounded-full ${item.bgColor} ${item.iconColor} flex items-center justify-center`}>
                                        <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                                    </div>
                                    <span className="text-base font-semibold text-slate-700 group-hover:text-[#0d59f2] transition-colors">{item.label}</span>
                                </div>
                                <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                            </a>
                        ))}
                    </div>

                    {/* Support Menu */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                        {supportItems.map((item, index) => (
                            <a
                                key={item.label}
                                onClick={() => navigate(item.path)}
                                className={`flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group cursor-pointer ${index !== supportItems.length - 1 ? 'border-b border-slate-100' : ''}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`size-10 rounded-full ${item.bgColor} ${item.iconColor} flex items-center justify-center`}>
                                        <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                                    </div>
                                    <span className="text-base font-semibold text-slate-700 group-hover:text-[#0d59f2] transition-colors">{item.label}</span>
                                </div>
                                <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                            </a>
                        ))}
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className="mt-4 w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                        Keluar
                    </button>

                    <p className="text-center text-xs text-slate-400 mt-2">Versi Aplikasi 2.4.0 (Build 2023)</p>
                </main>

                {/* Logout Modal */}
                {showLogoutModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Keluar dari Akun?</h3>
                            <p className="text-sm text-slate-500 mb-6">Anda yakin ingin keluar dari akun driver Anda?</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowLogoutModal(false)}
                                    className="flex-1 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl"
                                >
                                    Keluar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bottom Navigation */}
                <DriverBottomNavigation activeTab="profile" />
            </div>
        </div>
    )
}

export default DriverProfilePage
