import { supabase } from './supabaseClient'

/**
 * Driver Location Service
 * 
 * Handles real-time driver GPS broadcasting and subscription
 * using Supabase Realtime Broadcast channels (no database table needed).
 * 
 * Flow:
 * 1. Driver starts delivery → startBroadcastingLocation(orderId)
 *    - Uses navigator.geolocation.watchPosition for continuous GPS
 *    - Broadcasts {lat, lng, heading, speed, timestamp} every 5s via Supabase channel
 * 
 * 2. Customer opens tracking → subscribeToDriverLocation(orderId, callback)
 *    - Subscribes to same channel by orderId
 *    - Receives driver location updates in real-time
 * 
 * Uses Supabase Broadcast (peer-to-peer via server), no DB writes needed.
 */

let broadcastChannel = null
let watchId = null
let broadcastInterval = null
let lastPosition = null

/**
 * Start broadcasting driver's GPS location for a specific order.
 * Should be called when driver begins delivery.
 * @param {string} orderId - The order ID to broadcast location for
 * @returns {{ stop: Function }} Cleanup handle
 */
export function startBroadcastingLocation(orderId) {
    // Clean up any existing broadcast
    stopBroadcasting()

    const channelName = `driver-location-${orderId}`

    broadcastChannel = supabase.channel(channelName)
    broadcastChannel.subscribe()

    // Start watching GPS position
    if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
            (position) => {
                lastPosition = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    heading: position.coords.heading || 0,
                    speed: position.coords.speed || 0,
                    accuracy: position.coords.accuracy,
                    timestamp: Date.now()
                }
            },
            (error) => {
                console.error('[DriverLocation] GPS error:', error.message)
            },
            {
                enableHighAccuracy: true,
                maximumAge: 3000,
                timeout: 10000
            }
        )

        // Broadcast position every 5 seconds
        broadcastInterval = setInterval(() => {
            if (lastPosition && broadcastChannel) {
                broadcastChannel.send({
                    type: 'broadcast',
                    event: 'location_update',
                    payload: lastPosition
                })
            }
        }, 5000)
    } else {
        console.warn('[DriverLocation] Geolocation not supported')
    }

    return { stop: stopBroadcasting }
}

/**
 * Stop broadcasting driver location. Cleans up GPS watch and channel.
 */
export function stopBroadcasting() {
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
        watchId = null
    }
    if (broadcastInterval) {
        clearInterval(broadcastInterval)
        broadcastInterval = null
    }
    if (broadcastChannel) {
        supabase.removeChannel(broadcastChannel)
        broadcastChannel = null
    }
    lastPosition = null
}

/**
 * Subscribe to a driver's location updates for a specific order.
 * Used by the customer's TrackingPage.
 * @param {string} orderId - The order ID to track
 * @param {Function} onLocationUpdate - Callback receiving { lat, lng, heading, speed, timestamp }
 * @returns {{ unsubscribe: Function }} Cleanup handle
 */
export function subscribeToDriverLocation(orderId, onLocationUpdate) {
    const channelName = `driver-location-${orderId}`

    const channel = supabase
        .channel(channelName)
        .on('broadcast', { event: 'location_update' }, (payload) => {
            if (payload.payload) {
                onLocationUpdate(payload.payload)
            }
        })
        .subscribe()

    return {
        unsubscribe: () => {
            supabase.removeChannel(channel)
        }
    }
}

/**
 * Calculate distance between two points using Haversine formula.
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lng1 - Longitude of point 1 
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lng2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371 // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

/**
 * Estimate delivery time based on distance.
 * Assumes average speed of 25 km/h for city driving (motor).
 * @param {number} distanceKm - Distance in kilometers
 * @returns {number} Estimated time in minutes
 */
export function estimateDeliveryTime(distanceKm) {
    const AVG_SPEED_KMH = 25
    const minutes = (distanceKm / AVG_SPEED_KMH) * 60
    return Math.max(1, Math.round(minutes)) // Minimum 1 minute
}

export default {
    startBroadcastingLocation,
    stopBroadcasting,
    subscribeToDriverLocation,
    calculateDistance,
    estimateDeliveryTime
}
