import { useEffect, useRef } from 'react'
import { supabase } from '../services/supabaseClient'

/**
 * Generic hook for Supabase Realtime subscriptions.
 * Handles channel creation, subscription, and cleanup automatically.
 *
 * @param {string} channelName - Unique channel name
 * @param {Object} config - Subscription configuration
 * @param {string} config.table - Table to listen to
 * @param {string} [config.event='*'] - Event type: 'INSERT', 'UPDATE', 'DELETE', or '*'
 * @param {string} [config.schema='public'] - Schema name
 * @param {string} [config.filter] - Filter string, e.g. 'customer_id=eq.123'
 * @param {Function} callback - Called with (payload) on each event
 * @param {boolean} [enabled=true] - Whether the subscription is active
 *
 * @example
 * useRealtime(`orders-${userId}`, {
 *     table: 'orders',
 *     event: '*',
 *     filter: `customer_id=eq.${userId}`
 * }, (payload) => {
 *     console.log('Order changed:', payload)
 * })
 */
export function useRealtime(channelName, config, callback, enabled = true) {
    const callbackRef = useRef(callback)
    callbackRef.current = callback

    useEffect(() => {
        if (!enabled || !channelName) return

        const { table, event = '*', schema = 'public', filter } = config

        const subscriptionConfig = {
            event,
            schema,
            table,
        }

        if (filter) {
            subscriptionConfig.filter = filter
        }

        const channel = supabase
            .channel(channelName)
            .on('postgres_changes', subscriptionConfig, (payload) => {
                callbackRef.current(payload)
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [channelName, config.table, config.event, config.filter, enabled])
}

/**
 * Subscribe to multiple tables on a single channel.
 *
 * @param {string} channelName - Unique channel name
 * @param {Array<Object>} subscriptions - Array of { table, event, filter, callback }
 * @param {boolean} [enabled=true] - Whether subscriptions are active
 *
 * @example
 * useRealtimeMulti('admin-dashboard', [
 *     { table: 'orders', event: 'INSERT', callback: handleNewOrder },
 *     { table: 'withdrawals', event: '*', filter: 'status=eq.pending', callback: handleWithdrawal },
 * ])
 */
export function useRealtimeMulti(channelName, subscriptions, enabled = true) {
    const subsRef = useRef(subscriptions)
    subsRef.current = subscriptions

    useEffect(() => {
        if (!enabled || !channelName || !subscriptions.length) return

        let channel = supabase.channel(channelName)

        for (const sub of subsRef.current) {
            const config = {
                event: sub.event || '*',
                schema: sub.schema || 'public',
                table: sub.table,
            }
            if (sub.filter) config.filter = sub.filter

            channel = channel.on('postgres_changes', config, (payload) => {
                sub.callback(payload)
            })
        }

        channel.subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [channelName, enabled])
}

export default useRealtime
