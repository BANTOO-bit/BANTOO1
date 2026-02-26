import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import merchantService from '../services/merchantService'

const CartContext = createContext()

export function useCart() {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const saved = localStorage.getItem('bantoo_cart')
            return saved ? JSON.parse(saved) : []
        } catch { return [] }
    })

    const [merchantInfo, setMerchantInfo] = useState(() => {
        try {
            const saved = localStorage.getItem('bantoo_cart_merchant')
            return saved ? JSON.parse(saved) : null
        } catch { return null }
    })

    // Merchant notes (per-merchant, not per-item)
    const [merchantNotes, setMerchantNotes] = useState(() => {
        try {
            const saved = localStorage.getItem('bantoo_merchant_notes')
            return saved ? JSON.parse(saved) : {}
        } catch { return {} }
    })

    // Dynamic delivery fee state
    const [deliveryFeeOverride, setDeliveryFeeOverride] = useState(null)
    const [deliveryFeeLoading, setDeliveryFeeLoading] = useState(false)

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem('bantoo_cart', JSON.stringify(cartItems))
    }, [cartItems])

    useEffect(() => {
        localStorage.setItem('bantoo_merchant_notes', JSON.stringify(merchantNotes))
    }, [merchantNotes])

    useEffect(() => {
        if (merchantInfo) {
            localStorage.setItem('bantoo_cart_merchant', JSON.stringify(merchantInfo))
        }
    }, [merchantInfo])

    // Merchant switch dialog state
    const [switchDialog, setSwitchDialog] = useState(null) // { item, merchant, currentMerchant, newMerchant }

    const _doAddItem = (item, merchant) => {
        setCartItems(prev => {
            const existingIndex = prev.findIndex(i => i.id === item.id)
            if (existingIndex >= 0) {
                const updated = [...prev]
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    quantity: updated[existingIndex].quantity + 1
                }
                return updated
            }
            return [...prev, {
                ...item,
                quantity: 1,
                notes: '',
                merchantId: merchant?.id,
                merchantName: merchant?.name || item.merchantName
            }]
        })
        if (merchant) setMerchantInfo(merchant)
    }

    const addToCart = (item, merchant) => {
        // Multi-merchant guard: show dialog if switching merchants
        const currentMerchantId = cartItems.length > 0 ? cartItems[0]?.merchantId : null
        const newMerchantId = merchant?.id || item?.merchantId
        if (currentMerchantId && newMerchantId && currentMerchantId !== newMerchantId) {
            setSwitchDialog({
                item, merchant,
                currentMerchant: merchantInfo?.name || cartItems[0]?.merchantName || 'merchant lain',
                newMerchant: merchant?.name || item?.merchantName || 'merchant baru'
            })
            return { success: false, requiresClear: true }
        }
        _doAddItem(item, merchant)
        return { success: true }
    }

    const confirmSwitchMerchant = () => {
        if (switchDialog) {
            clearCart()
            _doAddItem(switchDialog.item, switchDialog.merchant)
            setSwitchDialog(null)
        }
    }

    const cancelSwitchMerchant = () => {
        setSwitchDialog(null)
    }

    const removeFromCart = (itemId) => {
        setCartItems(prev => prev.filter(item => item.id !== itemId))
    }

    const updateQuantity = (itemId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(itemId)
            return
        }

        setCartItems(prev => prev.map(item =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
        ))
    }

    const updateNotes = (itemId, notes) => {
        setCartItems(prev => prev.map(item =>
            item.id === itemId ? { ...item, notes } : item
        ))
    }

    const clearCart = () => {
        setCartItems([])
        setMerchantInfo(null)
        setMerchantNotes({})
        localStorage.removeItem('bantoo_cart')
        localStorage.removeItem('bantoo_cart_merchant')
        localStorage.removeItem('bantoo_merchant_notes')
    }

    // Merchant notes functions
    const updateMerchantNotes = (merchantName, notes) => {
        setMerchantNotes(prev => ({
            ...prev,
            [merchantName]: notes
        }))
    }

    const getMerchantNotes = (merchantName) => {
        return merchantNotes[merchantName] || ''
    }

    const getItemQuantity = (itemId) => {
        const item = cartItems.find(i => i.id === itemId)
        return item ? item.quantity : 0
    }

    const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

    // Dynamic delivery fee: use override if set, otherwise use first-tier default
    // The actual fee comes from calculateDeliveryFee() which uses Distance Tier Model from admin panel
    const baseDeliveryFee = cartItems.length > 0 ? 3500 : 0
    const [deliveryFeeDetails, setDeliveryFeeDetails] = useState(null)

    // Extract numeric fee for backward compatibility
    const deliveryFee = deliveryFeeDetails
        ? deliveryFeeDetails.totalFee
        : (deliveryFeeOverride !== null ? deliveryFeeOverride : baseDeliveryFee)

    // Calculate delivery fee from merchant
    const calculateDeliveryFee = useCallback(async (merchantId, userLat, userLng) => {
        if (!merchantId) return
        setDeliveryFeeLoading(true)
        try {
            const feeResult = await merchantService.getDeliveryFee(merchantId, userLat, userLng)
            // feeResult = { totalFee, adminFee, driverNet, distance, tierLabel, outOfRange }
            setDeliveryFeeDetails(feeResult)
            setDeliveryFeeOverride(feeResult.totalFee)
        } catch {
            // Keep current fee on error
        } finally {
            setDeliveryFeeLoading(false)
        }
    }, [])

    const setDeliveryFee = useCallback((fee) => {
        if (typeof fee === 'object' && fee.totalFee !== undefined) {
            setDeliveryFeeDetails(fee)
            setDeliveryFeeOverride(fee.totalFee)
        } else {
            setDeliveryFeeOverride(fee)
            setDeliveryFeeDetails(null)
        }
    }, [])

    const value = {
        cartItems,
        merchantInfo,
        merchantNotes,
        cartTotal,
        cartCount,
        deliveryFee,
        deliveryFeeDetails,
        deliveryFeeLoading,
        grandTotal: cartTotal + deliveryFee,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateNotes,
        clearCart,
        getItemQuantity,
        updateMerchantNotes,
        getMerchantNotes,
        setMerchantInfo,
        setDeliveryFee,
        calculateDeliveryFee,
        switchDialog,
        confirmSwitchMerchant,
        cancelSwitchMerchant,
    }

    return (
        <CartContext.Provider value={value}>
            {children}

            {/* Merchant Switch Confirmation Dialog */}
            {switchDialog && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                <span className="material-symbols-outlined text-amber-600">swap_horiz</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Ganti Merchant?</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                            Keranjang Anda berisi pesanan dari <strong>{switchDialog.currentMerchant}</strong>.
                            Ganti ke <strong>{switchDialog.newMerchant}</strong> akan menghapus keranjang saat ini.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={cancelSwitchMerchant}
                                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmSwitchMerchant}
                                className="flex-1 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:opacity-90 transition-colors"
                            >
                                Ya, Ganti
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </CartContext.Provider>
    )
}

export default CartContext
