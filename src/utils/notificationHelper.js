/**
 * Notification Helper Utilities
 * Centralized functions for showing notifications and playing sounds
 */

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
 * Note: Requires user interaction first due to browser autoplay policies
 */
export const playNotificationSound = () => {
    try {
        const audio = new Audio('/notification.mp3')
        audio.volume = 0.5
        audio.play().catch(e => {
            console.log('Audio play failed (user interaction required):', e.message)
        })
    } catch (error) {
        console.error('Error playing notification sound:', error)
    }
}

/**
 * Request notification permission (for browser notifications)
 */
export const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
        console.log('Browser does not support notifications')
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
            icon: '/logo.png',
            badge: '/logo.png',
            ...options
        })
    }
}
