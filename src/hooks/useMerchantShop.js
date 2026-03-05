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
