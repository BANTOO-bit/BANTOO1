import { useEffect, useRef, useCallback } from 'react'

function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Konfirmasi',
    message = 'Apakah Anda yakin?',
    confirmLabel = 'Ya',
    cancelLabel = 'Batal',
    icon = 'warning',
    confirmColor = 'primary', // primary, red
    loading = false
}) {
    const cancelRef = useRef(null)
    const confirmRef = useRef(null)

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
            // Auto-focus cancel button when modal opens
            setTimeout(() => cancelRef.current?.focus(), 50)
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    // Escape key to close
    useEffect(() => {
        if (!isOpen) return
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && !loading) {
                onClose()
            }
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose, loading])

    // Focus trap — Tab cycles between Cancel and Confirm buttons
    const handleKeyDown = useCallback((e) => {
        if (e.key !== 'Tab') return
        const focusableEls = [cancelRef.current, confirmRef.current].filter(Boolean)
        if (focusableEls.length === 0) return

        const firstEl = focusableEls[0]
        const lastEl = focusableEls[focusableEls.length - 1]

        if (e.shiftKey) {
            if (document.activeElement === firstEl) {
                e.preventDefault()
                lastEl.focus()
            }
        } else {
            if (document.activeElement === lastEl) {
                e.preventDefault()
                firstEl.focus()
            }
        }
    }, [])

    if (!isOpen) return null

    const getIconColor = () => {
        if (confirmColor === 'red') return 'text-red-500 bg-red-50'
        return 'text-primary bg-orange-50'
    }

    const getButtonColor = () => {
        if (confirmColor === 'red') return 'bg-red-500 hover:bg-red-600'
        return 'bg-primary hover:bg-[#e65f00]'
    }

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-[2px] animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            aria-describedby="confirm-modal-desc"
            onKeyDown={handleKeyDown}
        >
            <div className="w-full max-w-[320px] bg-white rounded-2xl shadow-2xl p-6 flex flex-col items-center text-center relative overflow-hidden animate-scale-in">
                {/* Header Icon */}
                <div className={`mb-5 h-14 w-14 rounded-full flex items-center justify-center shrink-0 ${getIconColor()}`} aria-hidden="true">
                    <span className="material-symbols-outlined text-[32px]">{icon}</span>
                </div>

                {/* Title */}
                <h2 id="confirm-modal-title" className="text-[18px] font-bold text-slate-900 mb-2 leading-tight">
                    {title}
                </h2>

                {/* Body Text */}
                <p id="confirm-modal-desc" className="text-[14px] text-slate-500 font-normal leading-relaxed mb-8">
                    {message}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-row gap-3 w-full">
                    {/* Cancel Button */}
                    <button
                        ref={cancelRef}
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 h-[44px] flex items-center justify-center rounded-xl border border-gray-200 bg-white text-slate-700 text-[14px] font-bold active:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>
                    {/* Confirm Button */}
                    <button
                        ref={confirmRef}
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex-1 h-[44px] flex items-center justify-center rounded-xl text-white text-[14px] font-bold shadow-lg active:shadow-none active:translate-y-[1px] transition-all disabled:opacity-70 disabled:cursor-not-allowed ${getButtonColor()}`}
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" role="status" aria-label="Loading"></div>
                        ) : (
                            confirmLabel
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmationModal
