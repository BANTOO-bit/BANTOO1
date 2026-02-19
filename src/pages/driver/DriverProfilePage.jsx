import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import driverService from '../../services/driverService'
import DriverBottomNavigation from '../../components/driver/DriverBottomNavigation'
import logger from '../../utils/logger'

function DriverProfilePage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [driverData, setDriverData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [debugError, setDebugError] = useState(null)

    useEffect(() => {
        const fetchDriverData = async () => {
            if (!user?.id) return
            try {
                logger.debug('Fetching driver profile...')
                const profile = await driverService.getProfile()
                logger.debug('Driver profile loaded:', profile)
                setDriverData(profile)
            } catch (error) {
                if (process.env.NODE_ENV === 'development') console.error('Failed to fetch driver profile:', error)
                setDebugError(error.message)
            } finally {
                setLoading(false)
            }
        }
        fetchDriverData()
    }, [user])

    if (loading) {
        return (
            <div className="min-h-screen bg-background-light flex flex-col pb-bottom-nav">
                <div className="bg-primary/10 px-4 pt-14 pb-8 flex flex-col items-center gap-3">
                    <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse" />
                    <div className="h-5 w-36 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="px-4 pt-4 flex flex-col gap-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="bg-white p-4 rounded-xl flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                            <div className="flex-1">
                                <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    // Defensive handling
    const d = driverData || {}

    // Safety helper that handles EVERYTHING including Objects/Arrays
    const safeRender = (val) => {
        try {
            if (val === null || val === undefined) return '-'
            if (typeof val === 'string') return val
            if (typeof val === 'number') return String(val)
            if (typeof val === 'object') {
                return JSON.stringify(val).slice(0, 20) + '...' // Truncate objects for safety
            }
            return String(val)
        } catch (e) {
            return 'Error'
        }
    }

    const getAvatarUrl = () => {
        try {
            if (d.avatar_url && typeof d.avatar_url === 'string') return d.avatar_url
            // Handle if avatar_url is somehow an object
            if (typeof d.avatar_url === 'object') return 'https://via.placeholder.com/150'

            const rawName = d.full_name
            const safeName = (rawName && typeof rawName === 'string') ? rawName : 'User'
            return `https://ui-avatars.com/api/?name=${encodeURIComponent(safeName)}&background=0D8ABC&color=fff`
        } catch (e) {
            return 'https://via.placeholder.com/150'
        }
    }

    return (
        <div className="font-display bg-background-light text-slate-900 antialiased min-h-screen">
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl bg-background-light">
                {/* Header */}
                <header className="bg-white pt-12 pb-4 px-4 sticky top-0 z-30 flex items-center gap-4 border-b border-slate-100 shadow-sm">
                    <button
                        onClick={() => navigate('/driver/account')}
                        className="flex items-center justify-center w-8 h-8 -ml-2 rounded-full text-slate-700 hover:bg-slate-50"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-xl font-bold text-slate-900 flex-1">Profil Saya</h1>
                    <button
                        onClick={() => navigate('/driver/profile/edit')}
                        className="text-[#0d59f2] text-sm font-bold hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        Ubah
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto pb-8">
                    {/* DEBUG SECTION - Remove later */}
                    {/* 
                    <div className="p-4 bg-gray-100 text-xs overflow-auto max-h-40 mb-4 border-b border-gray-200">
                        <p className="font-bold text-red-500">DEBUG DATA:</p>
                        <pre>{JSON.stringify(d, null, 2)}</pre>
                    </div> 
                    */}

                    {/* Profile Photo Section */}
                    <div className="flex flex-col items-center pt-8 pb-8 px-4 bg-white border-b border-slate-100 mb-4">
                        <div className="relative">
                            <div
                                className="bg-center bg-no-repeat bg-cover rounded-full size-32 ring-4 ring-slate-50 shadow-xl"
                                style={{ backgroundImage: `url("${getAvatarUrl()}")` }}
                            ></div>
                            <div className="absolute bottom-1 right-1 bg-green-500 text-white p-1.5 rounded-full ring-4 ring-white flex items-center justify-center shadow-md">
                                <span className="material-symbols-outlined text-[20px] font-bold">check</span>
                            </div>
                        </div>
                    </div>

                    {/* Personal Info List */}
                    <div className="px-4 space-y-4">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            {/* Name */}
                            <div className="p-5 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nama Lengkap</p>
                                <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-full bg-blue-50 flex items-center justify-center text-[#0d59f2] flex-none">
                                        <span className="material-symbols-outlined text-[20px]">person</span>
                                    </div>
                                    <span className="text-slate-900 font-bold text-base">{safeRender(d.full_name)}</span>
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="p-5 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nomor Telepon</p>
                                <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-full bg-blue-50 flex items-center justify-center text-[#0d59f2] flex-none">
                                        <span className="material-symbols-outlined text-[20px]">call</span>
                                    </div>
                                    <span className="text-slate-900 font-bold text-base">{safeRender(d.phone)}</span>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="p-5 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email</p>
                                <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-full bg-blue-50 flex items-center justify-center text-[#0d59f2] flex-none">
                                        <span className="material-symbols-outlined text-[20px]">mail</span>
                                    </div>
                                    <span className="text-slate-900 font-bold text-base break-all">{safeRender(d.email)}</span>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="p-5 hover:bg-slate-50 transition-colors">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Alamat Domisili</p>
                                <div className="flex items-start gap-4">
                                    <div className="size-10 rounded-full bg-blue-50 flex items-center justify-center text-[#0d59f2] flex-none mt-1">
                                        <span className="material-symbols-outlined text-[20px]">home_pin</span>
                                    </div>
                                    <span className="text-slate-900 font-bold text-base leading-relaxed">
                                        {d.address ? safeRender(d.address) : 'Alamat belum diatur'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <p className="text-center text-xs text-slate-400 pt-4">ID Driver: {user?.id ? user.id.slice(0, 8).toUpperCase() : '-'}</p>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default DriverProfilePage
