import { useEffect } from 'react'

function DeleteConfirmModal({ isOpen, onClose, onConfirm, addressLabel }) {
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-[2px]">
            <div className="w-full max-w-[320px] bg-white rounded-2xl shadow-2xl p-6 flex flex-col items-center text-center relative overflow-hidden animate-scale-in">
                {/* Top Decoration */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50"></div>
                
                {/* Header Icon */}
                <div className="mb-5 h-14 w-14 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-[32px]">delete</span>
                </div>
                
                {/* Title */}
                <h2 className="text-[18px] font-semibold text-slate-900 mb-2 leading-tight">
                    Hapus Alamat ini?
                </h2>
                
                {/* Body Text */}
                <p className="text-[14px] text-slate-500 font-normal leading-relaxed mb-8 max-w-[260px]">
                    Alamat yang dihapus tidak dapat dipulihkan. Apakah Anda yakin?
                </p>
                
                {/* Action Buttons */}
                <div className="flex flex-row gap-3 w-full">
                    {/* Cancel Button */}
                    <button 
                        onClick={onClose}
                        className="flex-1 h-[44px] flex items-center justify-center rounded-lg border border-gray-300 bg-white text-slate-700 text-[14px] font-medium active:bg-gray-50 transition-colors"
                    >
                        Batal
                    </button>
                    {/* Delete Button */}
                    <button 
                        onClick={onConfirm}
                        className="flex-1 h-[44px] flex items-center justify-center rounded-lg bg-primary text-white text-[14px] font-semibold shadow-lg shadow-primary/30 active:shadow-none active:translate-y-[1px] transition-all hover:bg-[#e65f00]"
                    >
                        Hapus
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DeleteConfirmModal
