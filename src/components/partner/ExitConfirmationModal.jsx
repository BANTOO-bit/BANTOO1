import { createPortal } from 'react-dom'

function ExitConfirmationModal({ isOpen, onClose, onConfirm }) {
    if (!isOpen) return null

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 animate-fade-in">
            <div className="bg-white dark:bg-card-dark rounded-2xl p-6 w-full max-w-sm shadow-xl animate-scale-in">
                {/* Icon */}
                <div className="w-14 h-14 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-3xl text-primary">
                        warning
                    </span>
                </div>

                {/* Content */}
                <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white text-center">
                    Keluar dari Pendaftaran?
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 text-center leading-relaxed">
                    Data yang sudah Anda isi akan hilang. Anda yakin ingin keluar dari proses pendaftaran?
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-3 rounded-xl bg-primary text-white font-bold hover:bg-orange-600 transition-colors"
                    >
                        Ya, Keluar
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}

export default ExitConfirmationModal
