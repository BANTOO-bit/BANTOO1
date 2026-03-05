import { useState, useEffect } from 'react'
import settingsService from '@/services/settingsService'

/**
 * useWhatsAppSupport — fetches the admin WhatsApp support number from app_settings.
 * 
 * The number is set by admin via Admin Panel > Pengaturan > Akun Admin > Nomor WhatsApp.
 * Stored in app_settings table as key='admin_profile', value.whatsapp.
 * 
 * @returns {{ waNumber: string, waLink: (message?: string) => string, isLoaded: boolean }}
 */
let cachedNumber = null

export default function useWhatsAppSupport() {
    const [waNumber, setWaNumber] = useState(cachedNumber || '')
    const [isLoaded, setIsLoaded] = useState(!!cachedNumber)

    useEffect(() => {
        if (cachedNumber) return

        async function fetchWaNumber() {
            try {
                const profile = await settingsService.get('admin_profile')
                const raw = profile?.whatsapp || ''
                // Normalize: remove leading 0, add 62 prefix if needed
                let normalized = raw.replace(/\D/g, '')
                if (normalized.startsWith('0')) {
                    normalized = '62' + normalized.slice(1)
                }
                cachedNumber = normalized
                setWaNumber(normalized)
            } catch {
                // Fallback — keep empty
            } finally {
                setIsLoaded(true)
            }
        }
        fetchWaNumber()
    }, [])

    /**
     * Generate a wa.me link with optional pre-filled message
     * @param {string} message - URL-encoded message text
     * @returns {string} Full WhatsApp URL
     */
    const waLink = (message = 'Halo Bantoo! Saya butuh bantuan') => {
        if (!waNumber) return ''
        return `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`
    }

    return { waNumber, waLink, isLoaded }
}
