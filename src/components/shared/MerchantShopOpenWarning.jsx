import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../services/supabaseClient'
import { useToast } from '../../context/ToastContext'
import { handleError } from '../../utils/errorHandler'

/**
 * Warning component that displays when a merchant tries to order as customer while shop is open
 * @param {boolean} blocking - If true, shows as error (red), else warning (yellow)
 * @param {function} onShopClosed - Callback function after shop is successfully closed
 */
function MerchantShopOpenWarning({ blocking = false, onShopClosed }) {
    const { user, setUser, isShopOpen, toggleShopStatus } = useAuth()
    const toast = useToast()
    const [isClosing, setIsClosing] = useState(false)

    // Only show if user is a merchant and shop is open
    if (!user?.isMerchant || !isShopOpen) {
        return null
    }

    const handleCloseShop = async () => {
        setIsClosing(true)
        try {
            await toggleShopStatus()
            // Call callback if provided
            if (onShopClosed) {
                onShopClosed()
            }
        } catch (error) {
            console.error('Error closing shop:', error)
            handleError(error, toast, { context: 'Close Shop' })
        } finally {
            setIsClosing(false)
        }
    }

    return (
        <div
            className={`rounded-2xl border p-4 flex items-start gap-3 ${blocking
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
        >
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
                <span
                    className={`material-symbols-outlined text-2xl ${blocking ? 'text-red-500' : 'text-yellow-600'
                        }`}
                >
                    {blocking ? 'error' : 'warning'}
                </span>
            </div>

            {/* Content */}
            <div className="flex-1">
                <h3
                    className={`font-bold text-sm mb-1 ${blocking ? 'text-red-900' : 'text-yellow-900'
                        }`}
                >
                    {blocking ? 'Tidak Dapat Memesan' : 'Warung Sedang Buka'}
                </h3>
                <p
                    className={`text-sm mb-3 ${blocking ? 'text-red-700' : 'text-yellow-700'
                        }`}
                >
                    Warung Anda sedang buka. Tutup warung terlebih dahulu untuk memesan sebagai pelanggan.
                </p>

                {/* Close Shop Button */}
                <button
                    onClick={handleCloseShop}
                    disabled={isClosing}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all ${blocking
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                        } ${isClosing ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'
                        }`}
                >
                    {isClosing ? (
                        <>
                            <span className="material-symbols-outlined text-[18px] animate-spin">
                                progress_activity
                            </span>
                            <span>Menutup...</span>
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-[18px]">store</span>
                            <span>Tutup Warung</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}

export default MerchantShopOpenWarning
