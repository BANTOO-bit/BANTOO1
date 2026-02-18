import { supabase } from './supabaseClient'

export const chatService = {
    /**
     * Get all messages for an order
     * @param {string} orderId
     * @returns {Array} messages sorted by created_at ASC
     */
    async getMessages(orderId) {
        try {
            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('order_id', orderId)
                .order('created_at', { ascending: true })

            if (error) throw error
            return data || []
        } catch (error) {
            console.error('Error fetching chat messages:', error)
            return []
        }
    },

    /**
     * Send a message
     * @param {string} orderId
     * @param {string} message
     * @param {string} senderRole - 'customer' or 'driver'
     * @returns {Object} the inserted message
     */
    async sendMessage(orderId, message, senderRole) {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { data, error } = await supabase
                .from('chat_messages')
                .insert({
                    order_id: orderId,
                    sender_id: user.id,
                    sender_role: senderRole,
                    message: message.trim()
                })
                .select()
                .single()

            if (error) throw error
            return data
        } catch (error) {
            console.error('Error sending message:', error)
            throw error
        }
    },

    /**
     * Subscribe to new messages in real-time
     * @param {string} orderId
     * @param {function} onNewMessage - callback when new message arrives
     * @returns {function} unsubscribe function
     */
    subscribeToMessages(orderId, onNewMessage) {
        const channel = supabase
            .channel(`chat-${orderId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages',
                    filter: `order_id=eq.${orderId}`
                },
                (payload) => {
                    onNewMessage(payload.new)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    },

    /**
     * Mark all messages from the other party as read
     * @param {string} orderId
     * @param {string} myRole - 'customer' or 'driver'
     */
    async markAsRead(orderId, myRole) {
        try {
            const oppositeRole = myRole === 'customer' ? 'driver' : 'customer'

            const { error } = await supabase
                .from('chat_messages')
                .update({ is_read: true })
                .eq('order_id', orderId)
                .eq('sender_role', oppositeRole)
                .eq('is_read', false)

            if (error) throw error
        } catch (error) {
            console.error('Error marking messages read:', error)
        }
    },

    /**
     * Get unread message count
     * @param {string} orderId
     * @param {string} myRole - 'customer' or 'driver'
     * @returns {number}
     */
    async getUnreadCount(orderId, myRole) {
        try {
            const oppositeRole = myRole === 'customer' ? 'driver' : 'customer'

            const { count, error } = await supabase
                .from('chat_messages')
                .select('*', { count: 'exact', head: true })
                .eq('order_id', orderId)
                .eq('sender_role', oppositeRole)
                .eq('is_read', false)

            if (error) throw error
            return count || 0
        } catch (error) {
            console.error('Error getting unread count:', error)
            return 0
        }
    }
}

export default chatService
