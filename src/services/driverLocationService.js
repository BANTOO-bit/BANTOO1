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

// Minimum distance (meters) driver must move before broadcasting a new position.
// Prevents redundant updates when stationary (e.g., at a traffic light).
const MIN_BROADCAST_DISTANCE_METERS = 10

let broadcastChannel = null
let watchId = null
let broadcastInterval = null
let historyInterval = null
let lastPosition = null
let lastBroadcastedPosition = null

/**
 * Start broadcasting driver's GPS location for a specific order.
 * Should be called when driver begins delivery.
 * @param {string} orderId - The order ID to broadcast location for
 * @param {string} [driverId] - The driver's user ID (for history logging)
 * @returns {{ stop: Function }} Cleanup handle
 */
export function startBroadcastingLocation(orderId, driverId = null) {
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

        // Broadcast position every 5 seconds (realtime, no DB write)
        // Only broadcast if GPS accuracy is within 100 meters AND driver moved ≥ MIN distance
        broadcastInterval = setInterval(() => {
            if (lastPosition && broadcastChannel) {
                if (lastPosition.accuracy && lastPosition.accuracy > 100) {
                    console.warn('[DriverLocation] GPS accuracy too low:', lastPosition.accuracy, 'm — skipping broadcast')
                    return
                }

                // Skip broadcast if driver hasn't moved significantly
                if (lastBroadcastedPosition) {
                    const dist = _haversineMeters(
                        lastBroadcastedPosition.lat, lastBroadcastedPosition.lng,
                        lastPosition.lat, lastPosition.lng
                    )
                    if (dist < MIN_BROADCAST_DISTANCE_METERS) {
                        return // stationary — don't waste bandwidth
                    }
                }

                broadcastChannel.send({
                    type: 'broadcast',
                    event: 'location_update',
                    payload: lastPosition
                })
                lastBroadcastedPosition = { lat: lastPosition.lat, lng: lastPosition.lng }
            }
        }, 5000)

        // Save location snapshot to DB every 60 seconds (for audit/history)
        if (driverId) {
            historyInterval = setInterval(() => {
                if (lastPosition) {
                    saveLocationSnapshot(orderId, driverId, lastPosition)
                }
            }, 60000)

            // Also save initial position after 5s (first snapshot)
            setTimeout(() => {
                if (lastPosition) {
                    saveLocationSnapshot(orderId, driverId, lastPosition)
                }
            }, 5000)
        }
    } else {
        console.warn('[DriverLocation] Geolocation not supported')
    }

    return { stop: stopBroadcasting }
}

/**
 * Save a location snapshot to driver_location_history table.
 * Non-blocking — failures are logged but don't interrupt delivery.
 */
async function saveLocationSnapshot(orderId, driverId, position) {
    try {
        const { error } = await supabase
            .from('driver_location_history')
            .insert({
                order_id: orderId,
                driver_id: driverId,
                lat: position.lat,
                lng: position.lng,
                speed: position.speed || 0,
                heading: position.heading || 0
            })

        if (error) {
            console.warn('[DriverLocation] History save failed:', error.message)
        }
    } catch (e) {
        console.warn('[DriverLocation] History save error:', e.message)
    }
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
    if (historyInterval) {
        clearInterval(historyInterval)
        historyInterval = null
    }
    if (broadcastChannel) {
        supabase.removeChannel(broadcastChannel)
        broadcastChannel = null
    }
    lastPosition = null
    lastBroadcastedPosition = null
}

/**
 * Fast Haversine in meters (internal helper).
 * Used only for min-distance filtering — not for user-facing ETA.
 */
function _haversineMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000 // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
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
 * Re-exported from settingsService to avoid code duplication.
 */
export { haversineDistance as calculateDistance } from './settingsService'

// Local import for use in default export object
import { haversineDistance } from './settingsService'

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
    calculateDistance: haversineDistance,
    estimateDeliveryTime
}
