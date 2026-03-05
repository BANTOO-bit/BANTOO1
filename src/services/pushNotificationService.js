/**
 * Push Notification Service
 * Upgraded with Firebase Cloud Messaging for TRUE push notifications.
 * Supports background notifications via service worker + foreground via FCM onMessage.
 */
import { supabase } from './supabaseClient'
import { messaging, VAPID_KEY, getToken, onMessage } from './firebase'

const PERMISSION_GRANTED = 'granted'
const PERMISSION_DENIED = 'denied'
const TOKEN_STORAGE_KEY = 'bantoo_fcm_token'

export const pushNotificationService = {

    // ===== FCM Integration =====

    /**
     * Check if Firebase Cloud Messaging is supported.
     */
    isFCMSupported() {
        return (
            typeof window !== 'undefined' &&
            'Notification' in window &&
            'serviceWorker' in navigator &&
            messaging !== null
        )
    },

    /**
     * Request permission and register FCM token.
     * Called on login to ensure push notifications are set up.
     * @param {string} userId - The current user's ID
     * @param {string} userRole - 'customer' | 'driver' | 'merchant'
     * @returns {Promise<string|null>} FCM token or null
     */
    async registerFCM(userId, userRole = 'customer') {
        if (!this.isFCMSupported()) {
            console.warn('[Push] FCM not supported in this browser')
            return null
        }

        try {
            const permission = await Notification.requestPermission()
            if (permission !== PERMISSION_GRANTED) {
                if (import.meta.env.DEV) console.log('[Push] Permission denied by user')
                return null
            }

            // Register service worker
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
            await navigator.serviceWorker.ready

            // Get FCM token
            const token = await getToken(messaging, {
                vapidKey: VAPID_KEY,
                serviceWorkerRegistration: registration
            })

            if (token) {
                await this._saveToken(token, userId, userRole)
                localStorage.setItem(TOKEN_STORAGE_KEY, token)
                if (import.meta.env.DEV) console.log('[Push] FCM token registered')
                return token
            }

            return null
        } catch (error) {
            console.error('[Push] FCM registration error:', error)
            return null
        }
    },

    /**
     * Save FCM token to Supabase fcm_tokens table.
     */
    async _saveToken(token, userId, userRole) {
        try {
            const { error } = await supabase
                .from('fcm_tokens')
                .upsert({
                    user_id: userId,
                    token: token,
                    role: userRole,
                    device_info: navigator.userAgent.substring(0, 200),
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id,token'
                })

            if (error) console.error('[Push] Token save error:', error)
        } catch (err) {
            console.error('[Push] Token save failed:', err)
        }
    },

    /**
     * Remove FCM token on logout.
     */
    async unregisterFCM(userId) {
        const token = localStorage.getItem(TOKEN_STORAGE_KEY)
        if (!token || !userId) return

        try {
            await supabase
                .from('fcm_tokens')
                .delete()
                .eq('user_id', userId)
                .eq('token', token)

            localStorage.removeItem(TOKEN_STORAGE_KEY)
            if (import.meta.env.DEV) console.log('[Push] FCM token removed')
        } catch (err) {
            console.error('[Push] Token removal error:', err)
        }
    },

    /**
     * Listen for foreground FCM messages.
     * Shows in-app notification when app is in focus.
     * @param {Function} callback - Called with { title, body, data }
     * @returns {Function} Unsubscribe function
     */
    onForegroundMessage(callback) {
        if (!messaging) return () => { }

        return onMessage(messaging, (payload) => {
            const notification = payload.notification || {}
            const data = payload.data || {}

            // Show in-app notification
            callback({
                title: notification.title || 'Bantoo!',
                body: notification.body || '',
                data
            })

            // Also show browser notification if app is not focused
            if (document.hidden) {
                this.show(notification.title || 'Bantoo!', {
                    body: notification.body || '',
                    tag: data.type || 'fcm-foreground',
                    data
                })
            }
        })
    },

    // ===== Browser Notification API (existing) =====

    /**
     * Check if browser supports notifications
     */
    isSupported() {
        return 'Notification' in window
    },

    /**
     * Get current permission status
     */
    getPermission() {
        if (!this.isSupported()) return PERMISSION_DENIED
        return Notification.permission
    },

    /**
     * Request notification permission from user
     */
    async requestPermission() {
        if (!this.isSupported()) {
            console.warn('Push notifications not supported in this browser')
            return false
        }

        if (Notification.permission === PERMISSION_GRANTED) return true

        const result = await Notification.requestPermission()
        return result === PERMISSION_GRANTED
    },

    /**
     * Show a browser notification
     * Includes throttle to prevent duplicate notifications
     */
    show(title, options = {}) {
        if (Notification.permission !== 'granted') return null

        // Throttle — prevent same notification within 3 seconds
        const dedupKey = `${title}:${options.body || ''}:${options.tag || ''}`
        if (this._recentNotifs?.has(dedupKey)) return null
        if (!this._recentNotifs) this._recentNotifs = new Set()
        this._recentNotifs.add(dedupKey)
        setTimeout(() => this._recentNotifs.delete(dedupKey), 3000)

        const notification = new Notification(title, {
            icon: '/favicon.svg',
            badge: '/favicon.svg',
            tag: options.tag || 'bantoo-notification',
            renotify: true,
            ...options
        })

        // Auto-close after 8 seconds
        setTimeout(() => notification.close(), 8000)

        // Focus app when notification is clicked
        notification.onclick = () => {
            window.focus()
            notification.close()
            if (options.onClick) options.onClick()
        }

        return notification
    },

    /**
     * Show notification for new order (merchant)
     */
    showNewOrder(order) {
        return this.show('Pesanan Baru! 🛒', {
            body: `${order.customer_name || 'Pelanggan'} memesan ${order.items?.length || ''} item`,
            tag: `order-${order.id}`,
            data: { orderId: order.id, type: 'new_order' }
        })
    },

    /**
     * Show notification for order status update (customer)
     */
    showOrderUpdate(order) {
        const statusMessages = {
            'accepted': 'Pesananmu diterima warung! 👨‍🍳',
            'preparing': 'Makananmu sedang disiapkan 🍳',
            'ready': 'Makananmu siap, menunggu driver 📦',
            'pickup': 'Driver sedang menuju warung 🏍️',
            'picked_up': 'Driver sudah mengambil pesananmu 🛵',
            'delivering': 'Pesananmu sedang diantar! 🚀',
            'delivered': 'Pesananmu sudah sampai! 🎉',
            'completed': 'Pesanan selesai ✅',
            'cancelled': 'Pesanan dibatalkan ❌'
        }

        const message = statusMessages[order.status] || `Status: ${order.status}`

        return this.show('Update Pesanan', {
            body: message,
            tag: `order-update-${order.id}`,
            data: { orderId: order.id, type: 'order_update' }
        })
    },

    /**
     * Show notification for driver assignment
     */
    showDriverAssigned(order) {
        return this.show('Pesanan Ditugaskan! 🏍️', {
            body: `Segera pickup pesanan di ${order.merchant?.name || 'warung'}`,
            tag: `driver-assign-${order.id}`,
            data: { orderId: order.id, type: 'driver_assigned' }
        })
    },

    /**
     * Show notification for withdrawal update
     */
    showWithdrawalUpdate(withdrawal) {
        const status = withdrawal.status === 'approved' ? 'disetujui ✅' : 'ditolak ❌'
        return this.show('Update Penarikan Dana', {
            body: `Penarikan Rp ${withdrawal.amount?.toLocaleString()} ${status}`,
            tag: `withdrawal-${withdrawal.id}`,
            data: { type: 'withdrawal_update' }
        })
    },

    /**
     * Show generic notification from notifications table
     */
    showFromRecord(notification) {
        return this.show(notification.title || 'Bantoo', {
            body: notification.message || '',
            tag: `notif-${notification.id}`,
            data: { notificationId: notification.id }
        })
    },

    /**
     * Subscribe to real-time notifications and show browser push
     * @param {string} userId - Current user ID
     * @returns {Function} cleanup function
     */
    subscribeToNotifications(userId) {
        if (!userId || !this.isSupported()) return () => { }

        const channel = supabase
            .channel(`push-notifications-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    this.showFromRecord(payload.new)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }
}

export default pushNotificationService
