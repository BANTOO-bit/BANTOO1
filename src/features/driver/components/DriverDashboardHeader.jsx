import { useNavigate } from 'react-router-dom'

/**
 * DriverDashboardHeader — Header section with avatar, name, status, notification bell.
 */
function DriverDashboardHeader({ driverProfile, isOnline, driverStatus, hasUnreadNotification }) {
    const navigate = useNavigate()

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-colors duration-300">
            <div className="flex items-center p-4 pb-3 justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div
                            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-2 ring-[#0d59f2]/20"
                            style={{ backgroundImage: `url("${driverProfile?.avatar_url || 'https://ui-avatars.com/api/?name=' + (driverProfile?.full_name || 'Driver') + '&background=0D8ABC&color=fff'}")` }}
                        />
                        <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'} ring-2 ring-white`} />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-slate-900 text-base font-bold leading-tight tracking-tight">
                            {driverProfile?.full_name || 'Memuat...'}
                        </h2>
                        <span className={`text-xs font-bold ${driverStatus === 'suspended'
                            ? 'text-red-500'
                            : isOnline ? 'text-green-600' : 'text-gray-500'
                            }`}>
                            Status: {driverStatus === 'suspended' ? 'Suspended' : isOnline ? 'Online' : 'Offline'}
                        </span>
                    </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => navigate('/driver/notifications')}
                        className="flex items-center justify-center rounded-full size-10 bg-slate-100 text-slate-900 hover:bg-slate-200 transition-colors relative"
                    >
                        <span className="material-symbols-outlined text-[24px]">notifications</span>
                        {hasUnreadNotification && (
                            <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        )}
                    </button>
                </div>
            </div>
        </header>
    )
}

export default DriverDashboardHeader
