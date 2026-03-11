import { useState, useEffect } from 'react'
import { chatService } from '../services/chatService'

/**
 * Hook to manage and subscribe to unread chat message counts for a specific order.
 * @param {string} orderId 
 * @param {string} role - 'driver' | 'customer'
 * @returns {number} unreadCount
 */
export function useUnreadChat(orderId, role = 'driver') {
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        if (!orderId) return

        let unsubscribe = () => {}

        const initUnreadCount = async () => {
            try {
                const count = await chatService.getUnreadCount(orderId, role)
                setUnreadCount(count)
                
                unsubscribe = chatService.subscribeToMessages(orderId, (newMsg) => {
                    // Only count incoming messages that are unread
                    // Since we check from our perspective (role), we want messages from the opposite role
                    const isFromOpposite = (role === 'driver' && newMsg.sender_role === 'customer') ||
                                        (role === 'customer' && newMsg.sender_role === 'driver');
                    
                    if (isFromOpposite && !newMsg.is_read) {
                        setUnreadCount(prev => prev + 1)
                    }
                })
            } catch (error) {
                console.error('Failed to init unread chat count:', error)
            }
        }

        initUnreadCount()

        return () => unsubscribe()
    }, [orderId, role])

    return unreadCount
}
