/**
 * Lightweight geo utilities — replaces @turf/turf for simple distance calculations.
 * Eliminates the large turf.js vendor bundle (~200KB).
 */

/**
 * Calculate distance between two lat/lng coordinates using the Haversine formula.
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lng1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lng2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
export function distanceKm(lat1, lng1, lat2, lng2) {
    const R = 6371 // Earth radius in km
    const dLat = toRad(lat2 - lat1)
    const dLng = toRad(lng2 - lng1)
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2)
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function toRad(deg) {
    return deg * (Math.PI / 180)
}
