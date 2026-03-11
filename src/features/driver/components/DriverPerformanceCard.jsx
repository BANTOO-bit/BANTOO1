import { useMemo } from 'react'

/**
 * Komponen untuk menampilkan performa pengemudi (Gamifikasi)
 * Menampilkan Level Tier (Bronze/Silver/Gold), Rating Bintang, dan Tingkat Penerimaan.
 */
function DriverPerformanceCard({ stats }) {
    // stats example: { rating: "4.8", trips: 120 }
    
    // 1. Calculate Tier based on trips
    const tier = useMemo(() => {
        const trips = stats?.trips || 0
        if (trips >= 150) return { name: 'Gold', current: trips, target: 500, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: 'military_tech', iconColor: 'text-yellow-500' }
        if (trips >= 50) return { name: 'Silver', current: trips, target: 150, color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-300', icon: 'workspace_premium', iconColor: 'text-slate-500' }
        return { name: 'Bronze', current: trips, target: 50, color: 'text-amber-800', bg: 'bg-amber-50', border: 'border-amber-200', icon: 'stars', iconColor: 'text-amber-700' }
    }, [stats?.trips])

    // Calculate progress percentage
    const progressPercent = Math.min(100, Math.max(0, (tier.current / tier.target) * 100))
    const ratingNum = parseFloat(stats?.rating || 0)

    return (
        <div className="px-4 pb-2">
            <div className={`bg-white rounded-xl border ${tier.border} p-4 shadow-sm flex flex-col gap-4 relative overflow-hidden`}>
                {/* Background Decoration */}
                <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${tier.bg} opacity-50`}></div>
                
                {/* Top Section: Tier & Rating */}
                <div className="flex justify-between items-start relative z-10">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl ${tier.bg} flex items-center justify-center border ${tier.border}`}>
                            <span className={`material-symbols-outlined text-[28px] ${tier.iconColor}`}>{tier.icon}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Status Mitra</span>
                            <span className={`text-lg font-extrabold ${tier.color} tracking-tight leading-tight mt-0.5`}>{tier.name}</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Rating</span>
                        <div className="flex items-center gap-1 mt-0.5">
                            <span className="material-symbols-outlined text-yellow-400 text-[18px]">star</span>
                            <span className="text-lg font-extrabold text-slate-800 leading-tight">
                                {stats?.rating && stats.rating !== '-' ? stats.rating : 'Baru'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Progress Bar Container */}
                <div className="flex flex-col gap-1.5 relative z-10 mt-1">
                    <div className="flex justify-between items-end">
                        <span className="text-xs font-bold text-slate-600">Penyelesaian Pesanan</span>
                        <span className="text-[10px] font-semibold text-slate-500">
                            <span className="text-slate-800 font-bold">{tier.current}</span> / {tier.target} trip
                        </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                        <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-blue-500 to-blue-400`}
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                    {tier.name !== 'Gold' && (
                        <p className="text-[10px] text-slate-400 font-medium self-end">Selesaikan {tier.target - tier.current} trip lagi menuju tier berikutnya</p>
                    )}
                </div>

                {/* Optional: Acceptance Rate (Mocking it to 98% for now if real data not tracked, or could connect to rejection table) */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 relative z-10">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-500 text-[18px]">check_circle</span>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Performa Saldo</span>
                            <span className="text-xs font-bold text-slate-800">Sangat Baik</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-500 text-[18px]">thumb_up</span>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Kepuasan Pelanggan</span>
                            <span className="text-xs font-bold text-slate-800">{(ratingNum >= 4.5 || isNaN(ratingNum)) ? 'Tinggi' : 'Perlu Ditingkatkan'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DriverPerformanceCard
