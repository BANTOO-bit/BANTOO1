import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { merchantService } from '../services/merchantService'

/**
 * useMerchantShop — Manages merchant shop open/close status.
 * Extracted from AuthContext to follow Single Responsibility Principle.
 * 
 * Usage:
 *   const { isShopOpen, toggleShopStatus } = useMerchantShop()
 */
export function useMerchantShop() {
    const { user } = useAuth()
    const [isShopOpen, setIsShopOpen] = useState(false)

    // Load merchant shop status when merchantId is available
    useEffect(() => {
        if (!user?.merchantId) return

        const loadStatus = async () => {
            try {
                const status = await merchantService.getShopStatus(user.merchantId)
                setIsShopOpen(status)
            } catch (err) {
                console.error('Failed to load shop status:', err)
            }
        }

        loadStatus()
    }, [user?.merchantId])

    const toggleShopStatus = async () => {
        if (!user?.merchantId) return

        // Jika akan menutup warung (kondisi isShopOpen bernilai true)
        if (isShopOpen) {
            try {
                // Gunakan orderService untuk mencari pesanan yang belum selesai
                const { orderService } = await import('../services/orderService')
                // Ambil semua daftar order, filter array
                const orders = await orderService.getMerchantOrders(user.merchantId, ['pending', 'accepted', 'preparing'])
                
                if (orders && orders.length > 0) {
                    throw new Error('merchant_has_active_orders')
                }
            } catch (err) {
                // Lempar ke UI agar bisa di-toast
                throw err
            }
        }

        const newStatus = !isShopOpen
        try {
            await merchantService.setShopOpen(user.merchantId, newStatus)
            setIsShopOpen(newStatus)
        } catch (err) {
            console.error('Failed to toggle shop status:', err)
            throw err
        }
    }

    return {
        isShopOpen,
        toggleShopStatus
    }
}

export default useMerchantShop
