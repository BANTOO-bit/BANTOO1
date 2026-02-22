import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import DriverBottomNavigation from '../../components/driver/DriverBottomNavigation'
import { useEffect, useState } from 'react'
import driverService from '../../services/driverService'

function DriverAccountPage() {
    const navigate = useNavigate()
    const { user, logout } = useAuth()
    const [stats, setStats] = useState({ rating: '-', trips: 0, joinDate: '-' })
    const [showLogoutModal, setShowLogoutModal] = useState(false)

    const [profile, setProfile] = useState(null)

    useEffect(() => {
        async function fetchData() {
            if (user?.id) {
                try {
                    const [statsData, profileData] = await Promise.all([
                        driverService.getDriverStats(user.id),
                        driverService.getProfile()
                    ])
                    setStats(statsData)
                    setProfile(profileData)
                } catch (error) {
                    if (import.meta.env.DEV) console.error('Failed to load data', error)
                }
            }
        }
        fetchData()
    }, [user])

    const handleLogoutClick = () => {
        setShowLogoutModal(true)
    }

    const confirmLogout = async () => {
        try {
            await logout()
            navigate('/login')
        } catch (error) {
            if (import.meta.env.DEV) console.error('Logout failed', error)
        }
    }

    return (
        <div className="font-display bg-background-light text-slate-900 antialiased selection:bg-primary selection:text-white">
            <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl bg-background-light">

                {/* Header */}
                <header className="bg-white pb-6 pt-10 px-4 rounded-b-[2rem] shadow-sm border-b border-slate-100">
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className="relative">
                            <div
                                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-24 ring-4 ring-white shadow-lg"
                                style={{ backgroundImage: `url("${profile?.avatar_url || user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || user?.user_metadata?.full_name || 'Driver')}&background=0D8ABC&color=fff`}")` }}
                            >
                            </div>
                            <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1.5 ring-4 ring-white shadow-sm flex items-center justify-center" title="Terverifikasi">
                                <span className="material-symbols-outlined text-white text-[16px] font-bold">check</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 items-center">
                            <h1 className="text-2xl font-bold text-slate-900">{profile?.full_name || user?.user_metadata?.full_name || 'Driver'}</h1>
                            <p className="text-slate-500 text-sm font-medium">ID: {user?.id?.slice(0, 8).toUpperCase() || '-'}</p>
                            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-100">
                                <span className="material-symbols-outlined text-[14px]">verified</span>
                                Terverifikasi
                            </div>
                        </div>
                        <div className="flex w-full justify-center gap-8 mt-2">
                            <div className="flex flex-col items-center">
                                <span className="text-lg font-bold text-slate-900">{stats.rating}</span>
                                <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Rating</span>
                            </div>
                            <div className="w-px h-8 bg-slate-200"></div>
                            <div className="flex flex-col items-center">
                                <span className="text-lg font-bold text-slate-900">{stats.trips}</span>
                                <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Trip</span>
                            </div>
                            <div className="w-px h-8 bg-slate-200"></div>
                            <div className="flex flex-col items-center">
                                <span className="text-lg font-bold text-slate-900">{stats.joinDate}</span>
                                <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Gabung</span>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 px-4 py-6 flex flex-col gap-4 pb-bottom-nav">
                    {/* Menu Group 1 */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                        <button
                            onClick={() => navigate('/driver/profile')}
                            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group border-b border-slate-100"
                        >
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[20px]">person</span>
                                </div>
                                <span className="text-base font-semibold text-slate-700 group-hover:text-primary transition-colors">Profil Saya</span>
                            </div>
                            <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                        </button>

                        <button
                            onClick={() => navigate('/driver/vehicle')}
                            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group border-b border-slate-100"
                        >
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[20px]">two_wheeler</span>
                                </div>
                                <span className="text-base font-semibold text-slate-700 group-hover:text-primary transition-colors">Detail Kendaraan</span>
                            </div>
                            <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                        </button>

                        <button
                            onClick={() => navigate('/driver/bank')}
                            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[20px]">account_balance</span>
                                </div>
                                <span className="text-base font-semibold text-slate-700 group-hover:text-primary transition-colors">Rekening Bank & Wallet</span>
                            </div>
                            <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                        </button>
                    </div>

                    {/* Menu Group 2 */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                        <button
                            onClick={() => navigate('/driver/help')}
                            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group border-b border-slate-100"
                        >
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[20px]">support_agent</span>
                                </div>
                                <span className="text-base font-semibold text-slate-700 group-hover:text-primary transition-colors">Bantuan & Dukungan</span>
                            </div>
                            <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                        </button>

                        <button
                            onClick={() => navigate('/driver/security')}
                            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[20px]">security</span>
                                </div>
                                <span className="text-base font-semibold text-slate-700 group-hover:text-primary transition-colors">Pusat Keamanan</span>
                            </div>
                            <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                        </button>
                    </div>

                    <button
                        onClick={handleLogoutClick}
                        className="mt-4 w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                        Keluar
                    </button>

                    <p className="text-center text-xs text-slate-400 mt-2">Versi Aplikasi 1.0.0 (Build 2024)</p>
                </main>

                <DriverBottomNavigation activeTab="account" />

                {/* Logout Modal */}
                {showLogoutModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl transform transition-all scale-100">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-red-500 text-[32px]">logout</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Konfirmasi Keluar</h3>
                                <p className="text-slate-500 text-sm mb-6">
                                    Apakah Anda yakin ingin keluar dari akun Anda? Anda harus login kembali untuk menerima order.
                                </p>
                                <div className="flex gap-3 w-full">
                                    <button
                                        onClick={() => setShowLogoutModal(false)}
                                        className="flex-1 py-2.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={confirmLogout}
                                        className="flex-1 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors"
                                    >
                                        Ya, Keluar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default DriverAccountPage
