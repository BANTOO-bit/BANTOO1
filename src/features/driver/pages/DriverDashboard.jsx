import { useAuth } from '@/context/AuthContext'
import useDriverDashboard from '@/hooks/useDriverDashboard'
import DriverDashboardHeader from '@/features/driver/components/DriverDashboardHeader'
import DriverEarningsCard from '@/features/driver/components/DriverEarningsCard'
import DriverPerformanceCard from '@/features/driver/components/DriverPerformanceCard'
import DriverAvailableOrders from '@/features/driver/components/DriverAvailableOrders'
import DriverBottomNavigation from '@/features/driver/components/DriverBottomNavigation'
import driverService from '@/services/driverService'
import { formatCurrency } from '@/utils/formatters'

function DriverDashboard() {
    const { user } = useAuth()
    const {
        isOnline, driverStatus, earnings, performanceStats, driverProfile, isLoadingProfile,
        availableOrders, hasUnreadNotification, codFeeBalance,
        isAutoAccept, autoAcceptRadius, toggleAutoAccept, updateAutoAcceptRadius,
        toggleOnline, navigate,
    } = useDriverDashboard(user)

    return (
        <div className="font-display bg-background-light text-slate-900 antialiased min-h-screen">
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl bg-white">
                {/* Header */}
                <DriverDashboardHeader
                    driverProfile={driverProfile}
                    isOnline={isOnline}
                    driverStatus={driverStatus}
                    hasUnreadNotification={hasUnreadNotification}
                />

                {/* Main Content */}
                <main className="flex-1 pb-bottom-nav bg-background-light">
                    {isLoadingProfile ? (
                        <div className="flex flex-col p-4 mt-2">
                            <div className="animate-pulse space-y-3 w-full">
                                <div className="h-24 bg-slate-200 rounded-xl w-full"></div>
                                <div className="flex gap-3 w-full">
                                    <div className="h-32 bg-slate-200 rounded-xl w-1/2"></div>
                                    <div className="h-32 bg-slate-200 rounded-xl w-1/2"></div>
                                </div>
                            </div>
                        </div>
                    ) : (driverStatus === 'suspended' || driverStatus === 'terminated') ? (
                        /* Suspended/Terminated State */
                        <div className="flex flex-col items-center justify-center text-center px-4 pt-8">
                            <div className="w-full bg-gray-200 rounded-xl p-4 flex items-center justify-between mb-8 opacity-75">
                                <div>
                                    <h2 className="text-base font-semibold text-gray-500 text-left">Anda Sedang Offline</h2>
                                    <p className="text-xs text-gray-400 mt-1 flex items-center">
                                        <span className="material-symbols-outlined text-sm mr-1">block</span>
                                        Akun dibatasi
                                    </p>
                                </div>
                                <div className="relative inline-block w-12 h-7 align-middle select-none transition duration-200 ease-in">
                                    <input className="absolute block w-5 h-5 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-not-allowed left-[2px] top-[2px]" disabled type="checkbox" />
                                    <label className="block overflow-hidden h-7 rounded-full bg-gray-300 cursor-not-allowed w-12" />
                                </div>
                            </div>
                            <div className={`w-48 h-48 rounded-full flex items-center justify-center mb-6 relative ${driverStatus === 'terminated' ? 'bg-red-50' : 'bg-red-50'}`}>
                                {driverStatus !== 'terminated' && <div className="absolute inset-0 bg-red-100 rounded-full animate-pulse" />}
                                <span className={`material-symbols-outlined text-7xl z-10 ${driverStatus === 'terminated' ? 'text-red-600' : 'text-red-500'}`}>
                                    {driverStatus === 'terminated' ? 'cancel' : 'gpp_bad'}
                                </span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                {driverStatus === 'terminated' ? 'Kemitraan Diputus' : 'Akun Ditangguhkan'}
                            </h2>
                            <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto mb-8">
                                {driverStatus === 'terminated'
                                    ? 'Kemitraan Anda dengan platform telah diputus secara permanen. Silakan hubungi admin untuk informasi lebih lanjut.'
                                    : 'Mohon maaf, Anda tidak dapat menerima pesanan saat ini karena akun sedang dalam penangguhan sementara. Silakan hubungi tim Admin untuk bantuan lebih lanjut.'
                                }
                            </p>
                            <button
                                onClick={() => navigate('/driver/help')}
                                className="w-full max-w-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 group"
                            >
                                <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform text-white">support_agent</span>
                                Hubungi Pusat Bantuan
                            </button>
                            <button
                                onClick={() => navigate('/driver/help')}
                                className="mt-4 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors border-b border-transparent hover:border-gray-400"
                            >
                                Baca Syarat & Ketentuan Mitra
                            </button>
                        </div>
                    ) : (
                        /* Normal Active State */
                        <>
                            {/* Online/Offline Toggle Card */}
                            <div className="p-4 pb-2">
                                <div className={`flex flex-col items-center justify-between gap-4 rounded-xl border ${isOnline ? 'border-green-200 bg-green-50/60' : 'border-slate-200 bg-white'} p-5 shadow-sm`}>
                                    <div className="flex w-full items-center justify-between">
                                        <div className="flex flex-col gap-1">
                                            <p className={`text-lg font-bold leading-tight ${isOnline ? 'text-green-700' : 'text-slate-500'}`}>
                                                {isOnline ? 'Anda Sedang Online' : 'Anda Sedang Offline'}
                                            </p>
                                            <p className={`text-sm font-bold leading-normal flex items-center gap-1 ${isOnline ? 'text-green-600/80' : 'text-slate-400'}`}>
                                                <span className="material-symbols-outlined text-[18px]">
                                                    {isOnline ? 'hourglass_top' : 'cloud_off'}
                                                </span>
                                                {isOnline ? 'Menunggu pesanan baru...' : 'Tidak menerima pesanan'}
                                            </p>
                                        </div>
                                        <label className={`relative flex h-8 w-14 cursor-pointer items-center rounded-full border-none ${isOnline ? 'bg-green-500' : 'bg-slate-200'} p-1 transition-all`}>
                                            <input
                                                type="checkbox"
                                                className="peer sr-only"
                                                checked={isOnline}
                                                onChange={toggleOnline}
                                            />
                                            <span className={`absolute h-6 w-6 rounded-full bg-white transition-all shadow-sm ${isOnline ? 'left-7' : 'left-1'}`} />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Performance Gamification Card */}
                            {!performanceStats?.loading && (
                                <DriverPerformanceCard stats={performanceStats} />
                            )}

                            {/* COD Admin Fee Warning Banner */}
                            {codFeeBalance && codFeeBalance.balance > 0 && (
                                <div className="px-4 pb-2">
                                    <div className={`rounded-xl p-4 border-2 ${codFeeBalance.isOverLimit ? 'bg-red-50 border-red-300' : codFeeBalance.percentage >= 70 ? 'bg-amber-50 border-amber-300' : 'bg-blue-50 border-blue-200'}`}>
                                        <div className="flex items-start gap-3">
                                            <span className={`material-symbols-outlined text-2xl mt-0.5 ${codFeeBalance.isOverLimit ? 'text-red-500' : codFeeBalance.percentage >= 70 ? 'text-amber-500' : 'text-blue-500'}`}>
                                                {codFeeBalance.isOverLimit ? 'error' : 'warning'}
                                            </span>
                                            <div className="flex-1">
                                                <p className={`text-sm font-bold mb-1 ${codFeeBalance.isOverLimit ? 'text-red-800' : codFeeBalance.percentage >= 70 ? 'text-amber-800' : 'text-blue-800'}`}>
                                                    {codFeeBalance.isOverLimit
                                                        ? (codFeeBalance.isOverTimeLimit ? 'Batas Waktu Setoran Terlampaui!' : 'Batas Fee COD Tercapai!')
                                                        : 'Fee COD Admin Belum Disetor'
                                                    }
                                                </p>
                                                <p className={`text-xs mb-1 ${codFeeBalance.isOverLimit ? 'text-red-600' : codFeeBalance.percentage >= 70 ? 'text-amber-600' : 'text-blue-600'}`}>
                                                    Saldo fee: {formatCurrency(codFeeBalance.balance)} / {formatCurrency(codFeeBalance.limit)}
                                                </p>
                                                {codFeeBalance.hoursElapsed > 0 && (() => {
                                                    const remaining = codFeeBalance.timeLimitHours - codFeeBalance.hoursElapsed
                                                    return (
                                                        <p className={`text-[11px] mb-2 flex items-center gap-1 ${codFeeBalance.isOverTimeLimit ? 'text-red-600 font-bold' : remaining <= 12 ? 'text-amber-600 font-bold' : 'text-slate-500'}`}>
                                                            <span className="material-symbols-outlined text-sm">{codFeeBalance.isOverTimeLimit ? 'error' : 'timer'}</span>
                                                            {codFeeBalance.isOverTimeLimit
                                                                ? `⚠️ Terlambat ${Math.abs(Math.round(remaining))} jam — segera setor!`
                                                                : `⏳ Setor dalam ${Math.round(remaining)} jam lagi`}
                                                        </p>
                                                    )
                                                })()}
                                                <div className="w-full h-2 rounded-full bg-white/60 mb-3">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${codFeeBalance.isOverLimit ? 'bg-red-500' : codFeeBalance.percentage >= 70 ? 'bg-amber-500' : 'bg-blue-500'}`}
                                                        style={{ width: `${Math.min(100, codFeeBalance.percentage)}%` }}
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => navigate('/driver/deposit', { state: { amount: codFeeBalance.balance } })}
                                                        className={`flex-1 py-2.5 rounded-lg text-white text-sm font-bold transition-colors ${codFeeBalance.isOverLimit ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'}`}
                                                    >
                                                        Setor Sekarang
                                                    </button>
                                                    <button
                                                        onClick={() => navigate('/driver/deposit/history')}
                                                        className="px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
                                                    >
                                                        Riwayat
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Auto Accept Settings */}
                            {isOnline && (
                                <div className="px-4 pb-2">
                                    <div className="bg-white rounded-xl border border-blue-100 p-4 shadow-sm flex flex-col gap-3">
                                        <div className="flex w-full items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`size-10 rounded-full flex items-center justify-center ${isAutoAccept ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                                                    <span className="material-symbols-outlined">bolt</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">Terima Otomatis</p>
                                                    <p className="text-xs text-slate-500">Ambil order tanpa pencet</p>
                                                </div>
                                            </div>
                                            <label className={`relative flex h-7 w-12 cursor-pointer items-center rounded-full border-none ${isAutoAccept ? 'bg-blue-600' : 'bg-slate-200'} p-1 transition-all`}>
                                                <input
                                                    type="checkbox"
                                                    className="peer sr-only"
                                                    checked={isAutoAccept}
                                                    onChange={toggleAutoAccept}
                                                />
                                                <span className={`absolute h-5 w-5 rounded-full bg-white transition-all shadow-sm ${isAutoAccept ? 'left-6' : 'left-1'}`} />
                                            </label>
                                        </div>
                                        {isAutoAccept && (
                                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-4 mt-1">
                                                <p className="text-xs font-medium text-slate-600">Radius Maksimal:</p>
                                                <div className="flex bg-slate-100 rounded-lg p-1">
                                                    {[1, 3, 5, 10].map(rad => (
                                                        <button
                                                            key={rad}
                                                            onClick={() => updateAutoAcceptRadius(rad)}
                                                            className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${autoAcceptRadius === rad ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                                        >
                                                            {rad} KM
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Stats Cards */}
                            <DriverEarningsCard earnings={earnings} />

                            {/* Online: Available Orders */}
                            {isOnline && (
                                <div className="flex flex-col items-center justify-center py-8 px-6 mt-2">
                                    <DriverAvailableOrders availableOrders={availableOrders} />
                                </div>
                            )}
                            {/* Offline State */}
                            {!isOnline && (
                                <div className="flex flex-col items-center justify-center py-12 px-6 mt-4">
                                    <div className="size-24 rounded-full bg-slate-50 flex items-center justify-center mb-5 ring-1 ring-slate-100">
                                        <span className="material-symbols-outlined text-[48px] text-slate-300">power_settings_new</span>
                                    </div>
                                    <h3 className="text-slate-900 text-xl font-bold leading-tight mb-2 text-center">Anda Sedang Offline</h3>
                                    <p className="text-slate-500 text-center max-w-[280px] leading-relaxed text-sm">
                                        Nyalakan tombol di atas untuk mulai menerima orderan masuk.
                                    </p>
                                </div>
                            )}
                        </>
                    )}

                    <div className="h-6" />
                </main>

                {/* Bottom Navigation */}
                <DriverBottomNavigation activeTab="home" />
            </div>
        </div>
    )
}

export default DriverDashboard
