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
        const saved = localStorage.getItem('bantoo_cart')
        return saved ? JSON.parse(saved) : []
    })

    const [merchantInfo, setMerchantInfo] = useState(() => {
        const saved = localStorage.getItem('bantoo_cart_merchant')
        return saved ? JSON.parse(saved) : null
    })

    // Merchant notes (per-merchant, not per-item)
    const [merchantNotes, setMerchantNotes] = useState(() => {
        const saved = localStorage.getItem('bantoo_merchant_notes')
        return saved ? JSON.parse(saved) : {}
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

    const addToCart = (item, merchant) => {
        // No merchant restriction - allow items from multiple merchants

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
            // Include merchant info with each item
            return [...prev, {
                ...item,
                quantity: 1,
                notes: '',
                merchantId: merchant?.id,
                merchantName: merchant?.name || item.merchantName
            }]
        })

        return { success: true }
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

    // Dynamic delivery fee: use override if set, otherwise calculate from merchant distance
    const baseDeliveryFee = cartItems.length > 0 ? 8000 : 0
    const deliveryFee = deliveryFeeOverride !== null ? deliveryFeeOverride : baseDeliveryFee

    // Calculate delivery fee from merchant 
    const calculateDeliveryFee = useCallback(async (merchantId, userLat, userLng) => {
        if (!merchantId) return
        setDeliveryFeeLoading(true)
        try {
            const fee = await merchantService.getDeliveryFee(merchantId, userLat, userLng)
            setDeliveryFeeOverride(fee)
        } catch {
            // Keep current fee on error
        } finally {
            setDeliveryFeeLoading(false)
        }
    }, [])

    const setDeliveryFee = useCallback((fee) => {
        setDeliveryFeeOverride(fee)
    }, [])

    const value = {
        cartItems,
        merchantInfo,
        merchantNotes,
        cartTotal,
        cartCount,
        deliveryFee,
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
    }

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    )
}

export default CartContext
