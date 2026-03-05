import { useEffect } from 'react'

function LocationFailedModal({ isOpen, onClose, onRetry, onManual }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-[2px] px-6">
            {/* Popup */}
            <div className="w-full max-w-sm bg-white rounded-[16px] p-6 shadow-2xl flex flex-col items-center animate-scale-in">
                {/* Icon Container */}
                <div className="size-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-primary text-4xl font-bold">error</span>
                </div>

                {/* Title */}
                <h4 className="text-slate-900 text-lg font-bold leading-normal tracking-[0.015em] text-center mb-2">
                    Gagal Menemukan Lokasi
                </h4>

                {/* Body Text */}
                <p className="text-gray-600 text-sm font-normal leading-relaxed text-center mb-8">
                    Sinyal GPS lemah atau izin lokasi ditolak. Silakan coba lagi atau pilih lokasi secara manual di peta.
                </p>

                {/* Action Buttons */}
                <div className="w-full space-y-3">
                    {/* Primary Action */}
                    <button
                        onClick={onRetry}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                        <span className="material-symbols-outlined text-xl">refresh</span>
                        Coba Lagi
                    </button>

                    {/* Secondary Action */}
                    <button
                        onClick={onManual || onClose}
                        className="w-full bg-white border border-gray-300 text-gray-700 font-semibold py-3.5 rounded-xl transition-colors hover:bg-gray-50 active:scale-[0.98]"
                    >
                        Pilih Manual
                    </button>
                </div>
            </div>
        </div>
    )
}

export default LocationFailedModal
