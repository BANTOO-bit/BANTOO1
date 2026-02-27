// Order ID utilities for Bantoo! App
// This module handles Order ID formatting
// Order numbers are generated server-side via trigger (BTN-YYMMDD-XXXX)

/**
 * Format Order ID for display
 * Prefers human-readable order_number (BTN-YYMMDD-XXXX) if available,
 * falls back to truncated UUID format for backward compatibility.
 * 
 * @param {string} orderId - UUID or order_number from database
 * @param {string} [orderNumber] - Human-readable order number (BTN-260228-0042)
 * @returns {string} Formatted Order ID (e.g., "#BTN-260228-0042" or "#ORD-A8F2B1")
 */
export function formatOrderId(orderId, orderNumber = null) {
    // Prefer human-readable order_number
    if (orderNumber) {
        return orderNumber.startsWith('#') ? orderNumber : `#${orderNumber}`
    }

    if (!orderId) return '#ORD-0000'

    const idString = orderId.toString()

    // If it already looks like a human-readable format, use as-is
    if (idString.startsWith('BTN-') || idString.startsWith('#BTN-')) {
        return idString.startsWith('#') ? idString : `#${idString}`
    }

    // If already in ORD- format
    if (idString.includes('ORD-')) {
        return idString.startsWith('#') ? idString : `#${idString}`
    }

    // Fallback: UUID → truncate to last 6 chars
    if (idString.length > 10) {
        return `#ORD-${idString.slice(-6).toUpperCase()}`
    }

    // Legacy numeric ID
    return `#ORD-${idString.padStart(4, '0')}`
}

/**
 * Generate a display Order ID from a database order object or raw UUID.
 * Backward-compatible wrapper used across the app.
 * 
 * @param {string|Object} orderIdOrObj - UUID string, or order object with order_number
 * @returns {string} Formatted display ID (e.g., "BTN-260228-0042" or "ORD-A8F2B1")
 */
export function generateOrderId(orderIdOrObj) {
    if (!orderIdOrObj) return 'ORD-0000'

    // If passed an object with order_number, use it
    if (typeof orderIdOrObj === 'object' && orderIdOrObj.order_number) {
        return orderIdOrObj.order_number
    }

    const idString = String(orderIdOrObj)

    // If already in BTN- format
    if (idString.startsWith('BTN-')) return idString

    // UUID → truncate  
    if (idString.length > 10) {
        return `ORD-${idString.slice(-6).toUpperCase()}`
    }

    return `ORD-${idString.padStart(4, '0')}`
}

/**
 * Get the short display version of an order ID
 * Used in compact UI like notifications, chat headers, etc.
 * 
 * @param {Object} order - Order object with id and optional order_number
 * @returns {string} Short display string
 */
export function getOrderDisplayId(order) {
    if (!order) return '#ORD-0000'
    return formatOrderId(order.id, order.order_number)
}

/**
 * Parse Order ID to get numeric value (for backward compatibility)
 * 
 * @param {string} formattedOrderId - Formatted order ID
 * @returns {number} Numeric portion (e.g., 42 from BTN-260228-0042)
 */
export function parseOrderId(formattedOrderId) {
    if (!formattedOrderId) return 0
    // Try to match the sequence number at the end (BTN-YYMMDD-XXXX)
    const btnMatch = formattedOrderId.match(/BTN-\d{6}-(\d+)/)
    if (btnMatch) return parseInt(btnMatch[1])
    // Fallback
    const match = formattedOrderId.match(/\d+/)
    return match ? parseInt(match[0]) : 0
}

/**
 * Validate Order ID format
 * Accepts both BTN-YYMMDD-XXXX and legacy ORD-XXXX formats
 * 
 * @param {string} orderId - Order ID to validate
 * @returns {boolean} True if valid format
 */
export function isValidOrderId(orderId) {
    if (!orderId) return false
    const str = orderId.toString().replace(/^#/, '')
    return /^BTN-\d{6}-\d{4,}$/.test(str) || /^[A-Z]{3}-\d{4,}$/.test(str)
}
