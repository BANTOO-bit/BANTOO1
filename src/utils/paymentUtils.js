/**
 * Payment Utility Functions
 * Centralized payment method handling for consistent labels and checks
 */

const PAYMENT_LABELS = {
    cash: 'Tunai (COD)',
    cod: 'Tunai (COD)',
    bank_transfer: 'Transfer Bank',
    ewallet: 'E-Wallet',
    qris: 'QRIS',
    bantoo_pay: 'Bantoo Pay',
    wallet: 'Saldo',
    transfer: 'Transfer Bank'
}

/**
 * Check if payment method is Cash on Delivery
 * Handles all variants: 'cash', 'cod', 'COD', 'CASH', 'tunai'
 */
export function isCODPayment(method) {
    if (!method) return false
    return ['cash', 'cod', 'tunai'].includes(method.toLowerCase())
}

/**
 * Get human-readable payment method label in Indonesian
 * @param {string} method - Raw payment method from database
 * @returns {string} Localized label
 */
export function getPaymentLabel(method) {
    if (!method) return 'Bantoo Pay'
    return PAYMENT_LABELS[method.toLowerCase()] || method
}

/**
 * Get payment method icon name (Material Symbols)
 */
export function getPaymentIcon(method) {
    if (isCODPayment(method)) return 'payments'
    return 'account_balance_wallet'
}

export default { isCODPayment, getPaymentLabel, getPaymentIcon }
