import { supabase } from './supabaseClient'

/**
 * Push Notification Service
 * Uses the Browser Notification API to show native notifications
 * when the app receives real-time updates from Supabase.
 */

const PERMISSION_GRANTED = 'granted'
const PERMISSION_DENIED = 'denied'

export const pushNotificationService = {
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
     * @param {string} title - Notification title
     * @param {Object} options - Notification options
     */
    show(title, options = {}) {
        if (!this.isSupported() || Notification.permission !== PERMISSION_GRANTED) {
            return null
        }

        // Only show if tab is not focused (avoid duplicate with in-app)
        if (document.hasFocus()) return null

        const notification = new Notification(title, {
            icon: '/bantoo-logo.png',
            badge: '/bantoo-logo.png',
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
