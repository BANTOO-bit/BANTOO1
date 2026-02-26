/**
 * Routing Service — OSRM (Open Source Routing Machine)
 * 
 * Uses the free OSRM demo server for road distance and route calculation.
 * Falls back to haversine (straight-line) × 1.3 if OSRM fails.
 * 
 * OSRM API: https://router.project-osrm.org
 * No API key required, free for reasonable usage.
 */

import { haversineDistance } from './settingsService'

// Simple in-memory cache to avoid duplicate API calls
const routeCache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const ROAD_FACTOR = 1.3 // Haversine × 1.3 ≈ road distance approximation

/**
 * Generate cache key from coordinates (rounded to ~100m precision)
 */
function cacheKey(fromLat, fromLng, toLat, toLng) {
    const round = (n) => Math.round(n * 1000) / 1000
    return `${round(fromLat)},${round(fromLng)}-${round(toLat)},${round(toLng)}`
}

/**
 * Get route between two points using OSRM
 * 
 * @param {Array} from - [lat, lng] origin
 * @param {Array} to - [lat, lng] destination
 * @returns {Promise<Object>} { distance (km), duration (seconds), routeCoords [[lat,lng],...] }
 */
export async function getRoute(from, to) {
    const [fromLat, fromLng] = from
    const [toLat, toLng] = to

    // Check cache
    const key = cacheKey(fromLat, fromLng, toLat, toLng)
    const cached = routeCache.get(key)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data
    }

    try {
        // OSRM expects lng,lat order (opposite of Leaflet's lat,lng)
        const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`

        const response = await fetch(url, {
            signal: AbortSignal.timeout(5000) // 5 second timeout
        })

        if (!response.ok) throw new Error(`OSRM HTTP ${response.status}`)

        const data = await response.json()

        if (data.code !== 'Ok' || !data.routes?.length) {
            throw new Error(`OSRM error: ${data.code}`)
        }

        const route = data.routes[0]

        // Convert GeoJSON coordinates [lng,lat] to Leaflet [lat,lng]
        const routeCoords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng])

        const result = {
            distance: route.distance / 1000, // meters → km
            duration: route.duration,          // seconds
            routeCoords,                       // [[lat,lng], ...] for Leaflet Polyline
            source: 'osrm'
        }

        // Cache result
        routeCache.set(key, { data: result, timestamp: Date.now() })

        return result
    } catch (error) {
        console.warn('OSRM routing failed, falling back to haversine:', error.message)
        return getFallbackRoute(from, to)
    }
}

/**
 * Fallback route using haversine × road factor
 * Returns straight-line route with estimated road distance
 */
function getFallbackRoute(from, to) {
    const [fromLat, fromLng] = from
    const [toLat, toLng] = to

    const straightDistance = haversineDistance(fromLat, fromLng, toLat, toLng)
    const estimatedRoadDistance = straightDistance * ROAD_FACTOR

    // Estimate duration: average 30 km/h in city
    const estimatedDuration = (estimatedRoadDistance / 30) * 3600

    return {
        distance: estimatedRoadDistance,
        duration: estimatedDuration,
        routeCoords: [from, to], // Straight line fallback
        source: 'haversine'
    }
}

/**
 * Get road distance only (for delivery fee calculation)
 * 
 * @param {number} fromLat
 * @param {number} fromLng
 * @param {number} toLat
 * @param {number} toLng
 * @returns {Promise<number>} Distance in km
 */
export async function getRoadDistance(fromLat, fromLng, toLat, toLng) {
    const result = await getRoute([fromLat, fromLng], [toLat, toLng])
    return result.distance
}

/**
 * Format duration in seconds to human-readable string
 * @param {number} seconds
 * @returns {string} e.g. "5 menit", "1 jam 20 menit"
 */
export function formatDuration(seconds) {
    if (!seconds || seconds < 60) return '1 menit'
    const minutes = Math.round(seconds / 60)
    if (minutes < 60) return `${minutes} menit`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (remainingMinutes === 0) return `${hours} jam`
    return `${hours} jam ${remainingMinutes} menit`
}

/**
 * Clear the route cache
 */
export function clearRouteCache() {
    routeCache.clear()
}

const routingService = {
    getRoute,
    getRoadDistance,
    formatDuration,
    clearRouteCache
}

export default routingService
