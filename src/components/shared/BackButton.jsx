import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useBackNavigation } from '../../hooks/useBackNavigation'

function BackButton({
    to,
    confirmMessage,
    fallback = '/',
    className = '',
    onBack
}) {
    const goBackSmart = useBackNavigation({ fallbackRoute: fallback })
    const [showConfirm, setShowConfirm] = useState(false)

    const handleClick = (e) => {
        e.preventDefault()
        e.stopPropagation()

        if (confirmMessage) {
            setShowConfirm(true)
            return
        }

        handleNavigation()
    }

    const handleNavigation = () => {
        if (onBack) {
            onBack()
            return
        }

        goBackSmart()
    }

    const confirmAction = () => {
        setShowConfirm(false)

        if (onBack) {
            onBack()
            return
        }

        goBackSmart()
    }

    return (
        <>
            <button
                onClick={handleClick}
                className={`absolute left-0 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-text-main active:scale-95 transition-transform ${className}`}
                aria-label="Kembali"
            >
                <span className="material-symbols-outlined">arrow_back</span>
            </button>

            {/* Confirmation Modal - Portaled to body */}
            {showConfirm && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 animate-fade-in">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-scale-in">
                        <h3 className="font-bold text-lg mb-2 text-text-main">Konfirmasi</h3>
                        <p className="text-text-secondary mb-6">{confirmMessage}</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 py-2.5 rounded-xl border border-border-color font-medium text-text-main hover:bg-gray-50 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmAction}
                                className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-blue-700 transition-colors"
                            >
                                Ya, Keluar
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    )
}

export default BackButton
