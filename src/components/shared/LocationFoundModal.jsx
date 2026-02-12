import { useEffect } from 'react'

function LocationFoundModal({ isOpen, onClose, onConfirm }) {
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
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center px-8">
            {/* Popup Modal */}
            <div className="bg-white w-full max-w-xs rounded-xl overflow-hidden shadow-2xl p-6 flex flex-col items-center text-center animate-scale-in">
                {/* Success Icon */}
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-5">
                    <span
                        className="material-symbols-outlined text-green-500 text-4xl"
                        style={{ fontVariationSettings: "'wght' 600" }}
                    >
                        check_circle
                    </span>
                </div>

                {/* Text Content */}
                <h2 className="text-xl font-bold text-slate-900 mb-2">Lokasi Ditemukan</h2>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                    Titik pengiriman telah disesuaikan dengan lokasimu saat ini.
                </p>

                {/* Action Button */}
                <button
                    onClick={onConfirm || onClose}
                    className="w-full bg-primary hover:bg-[#e65f00] text-white font-bold py-4 rounded-xl transition-colors active:scale-[0.98]"
                >
                    Oke, Lanjutkan
                </button>
            </div>
        </div>
    )
}

export default LocationFoundModal
