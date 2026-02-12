import { supabase } from './supabaseClient'

/**
 * Notification Service - Handle in-app notifications
 */
export const notificationService = {
    /**
     * Get notifications for current user
     */
    async getNotifications(limit = 50, unreadOnly = false) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        let query = supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(limit)

        if (unreadOnly) {
            query = query.eq('is_read', false)
        }

        const { data, error } = await query
        if (error) throw error
        return data
    },

    /**
     * Get unread count
     */
    async getUnreadCount() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return 0

        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('is_read', false)

        if (error) return 0
        return count || 0
    },

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId)
            .eq('user_id', user.id)

        if (error) throw error
        return true
    },

    /**
     * Mark all as read
     */
    async markAllAsRead() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false)

        if (error) throw error
        return true
    },

    /**
     * Delete notification
     */
    async deleteNotification(notificationId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', notificationId)
            .eq('user_id', user.id)

        if (error) throw error
        return true
    },

    /**
     * Clear all notifications
     */
    async clearAll() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('user_id', user.id)

        if (error) throw error
        return true
    },

    /**
     * Subscribe to real-time notifications for a specific user
     * @param {string} userId - The user ID to subscribe for (passed by caller)
     * @param {Function} callback - Called when a new notification arrives
     * @returns {Function} Unsubscribe function
     */
    subscribeToNotifications(userId, callback) {
        if (!userId) {
            console.warn('subscribeToNotifications: no userId provided, skipping subscription')
            return () => { } // no-op unsubscribe
        }

        const channel = supabase
            .channel(`notifications-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    callback(payload.new)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }
}

export default notificationService
