/**
 * Notification Helper Utilities
 * Centralized functions for showing notifications and playing sounds
 */
import { playNewOrderSound } from '@/utils/soundManager'

/**
 * Show a toast notification
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - Notification type: 'success', 'error', 'info', 'warning'
 */
export const showNotification = (title, message = '', type = 'info') => {
    const event = new CustomEvent('show-toast', {
        detail: { title, message, type }
    })
    window.dispatchEvent(event)
}

/**
 * Play notification sound
 * Uses Web Audio API (local, no file dependency)
 */
export const playNotificationSound = () => {
    try {
        playNewOrderSound()
    } catch (error) {
        // Silent fail — audio not critical
    }
}

/**
 * Request notification permission (for browser notifications)
 */
export const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
        if (import.meta.env.DEV) console.log('Browser does not support notifications')
        return false
    }

    if (Notification.permission === 'granted') {
        return true
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission()
        return permission === 'granted'
    }

    return false
}

/**
 * Show browser notification
 * @param {string} title - Notification title
 * @param {object} options - Notification options
 */
export const showBrowserNotification = (title, options = {}) => {
    if (Notification.permission === 'granted') {
        new Notification(title, {
            icon: '/favicon.svg',
            badge: '/favicon.svg',
            ...options
        })
    }
}
