function GPSLoadingOverlay({ isVisible, signalStrength = 65 }) {
    if (!isVisible) return null

    return (
        <>
            {/* Loading Overlay on Map */}
            <div className="absolute inset-0 bg-white/40 flex flex-col items-center justify-center z-10">
                <div className="p-6 bg-white rounded-2xl shadow-lg flex flex-col items-center gap-4">
                    <div className="relative size-12">
                        <span className="material-symbols-outlined text-primary text-5xl animate-spin">
                            progress_activity
                        </span>
                    </div>
                    <div className="text-center">
                        <p className="text-slate-900 text-sm font-semibold">Sedang mencari lokasimu...</p>
                        <p className="text-gray-500 text-xs mt-1">Pastikan GPS aktif</p>
                    </div>
                </div>
            </div>

            {/* GPS Signal Strength Progress */}
            <div className="px-4 py-2 bg-white">
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <p className="text-xs font-medium text-primary uppercase tracking-wider">GPS Signal Strength</p>
                        <p className="text-xs text-gray-500">{signalStrength}%</p>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary rounded-full transition-all duration-1000"
                            style={{ width: `${signalStrength}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default GPSLoadingOverlay
