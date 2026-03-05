/**
 * ============================================================
 * BANTOO APP — CENTRALIZED CONSTANTS & ENUMS
 * ============================================================
 *
 * Single Source of Truth untuk seluruh aplikasi.
 * JANGAN mendefinisikan enum/status secara hardcode di file lain.
 * Selalu import dari file ini.
 *
 * Jika menambahkan status baru:
 * 1. Tambahkan di file ini
 * 2. Tambahkan migrasi SQL untuk mengupdate CHECK constraint di database
 * 3. Update RLS policies jika diperlukan
 */

// ============================================================
// USER ROLES
// ============================================================

export const ROLES = Object.freeze({
    CUSTOMER: 'customer',
    MERCHANT: 'merchant',
    DRIVER: 'driver',
    ADMIN: 'admin',
})

export const ALL_ROLES = Object.freeze(Object.values(ROLES))

/**
 * Urutan prioritas role untuk fallback active role.
 * Admin > Merchant > Driver > Customer
 */
export const ROLE_PRIORITY = Object.freeze([
    ROLES.ADMIN,
    ROLES.MERCHANT,
    ROLES.DRIVER,
    ROLES.CUSTOMER,
])

// ============================================================
// ORDER STATUSES
// ============================================================
// PENTING: Database menggunakan 'processing' sebagai status internal,
// tapi frontend menampilkan 'preparing'. RPC `update_order_status`
// melakukan mapping preparing → processing secara otomatis.
//
// Di frontend, selalu gunakan konstanta di bawah ini.
// ============================================================

export const ORDER_STATUS = Object.freeze({
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    PREPARING: 'preparing',      // Frontend label; mapped to 'processing' in DB
    READY: 'ready',
    PICKUP: 'pickup',
    PICKED_UP: 'picked_up',
    DELIVERING: 'delivering',
    DELIVERED: 'delivered',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    TIMEOUT: 'timeout',          // Frontend-only; tidak ada di DB CHECK constraint
})

/** Semua order statuses (sebagai array, untuk validasi) */
export const ALL_ORDER_STATUSES = Object.freeze(Object.values(ORDER_STATUS))

/** Status yang dianggap "selesai" — order tidak aktif lagi */
export const TERMINAL_ORDER_STATUSES = Object.freeze([
    ORDER_STATUS.COMPLETED,
    ORDER_STATUS.CANCELLED,
    ORDER_STATUS.TIMEOUT,
])

/** Status yang bisa di-cancel oleh customer/merchant */
export const CANCELLABLE_ORDER_STATUSES = Object.freeze([
    ORDER_STATUS.PENDING,
    ORDER_STATUS.ACCEPTED,
    ORDER_STATUS.PREPARING,
])

/** Status yang bisa di-reject oleh merchant */
export const REJECTABLE_ORDER_STATUSES = Object.freeze([
    ORDER_STATUS.PENDING,
    ORDER_STATUS.ACCEPTED,
    ORDER_STATUS.PREPARING,
])

/** Status aktif (digunakan untuk filter & realtime) */
export const ACTIVE_ORDER_STATUSES = Object.freeze(
    ALL_ORDER_STATUSES.filter(s => !TERMINAL_ORDER_STATUSES.includes(s))
)

// ============================================================
// ORDER STATUS LABELS (Indonesian)
// ============================================================

export const ORDER_STATUS_LABELS = Object.freeze({
    [ORDER_STATUS.PENDING]: 'Menunggu Konfirmasi',
    [ORDER_STATUS.ACCEPTED]: 'Diterima',
    [ORDER_STATUS.PREPARING]: 'Sedang Disiapkan',
    [ORDER_STATUS.READY]: 'Siap di Pickup',
    [ORDER_STATUS.PICKUP]: 'Sedang Dijemput',
    [ORDER_STATUS.PICKED_UP]: 'Sudah Diambil',
    [ORDER_STATUS.DELIVERING]: 'Sedang Diantar',
    [ORDER_STATUS.DELIVERED]: 'Terkirim',
    [ORDER_STATUS.COMPLETED]: 'Selesai',
    [ORDER_STATUS.CANCELLED]: 'Dibatalkan',
    [ORDER_STATUS.TIMEOUT]: 'Waktu Habis',
})

// ============================================================
// PAYMENT
// ============================================================

export const PAYMENT_METHOD = Object.freeze({
    COD: 'cod',
    CASH: 'cash',
    WALLET: 'wallet',
    BANK_TRANSFER: 'bank_transfer',
    EWALLET: 'ewallet',
    QRIS: 'qris',
})

export const PAYMENT_STATUS = Object.freeze({
    PENDING: 'pending',
    PAID: 'paid',
    REFUNDED: 'refunded',
})

/** Semua metode COD (cash-based) */
export const COD_METHODS = Object.freeze([
    PAYMENT_METHOD.COD,
    PAYMENT_METHOD.CASH,
])

// ============================================================
// PARTNER STATUSES (Merchant & Driver)
// ============================================================

export const PARTNER_STATUS = Object.freeze({
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    ACTIVE: 'active',
    SUSPENDED: 'suspended',
})

// ============================================================
// WITHDRAWAL STATUSES
// ============================================================

export const WITHDRAWAL_STATUS = Object.freeze({
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    COMPLETED: 'completed',
})

// ============================================================
// DEPOSIT STATUSES
// ============================================================

export const DEPOSIT_STATUS = Object.freeze({
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
})

// ============================================================
// TRANSACTION TYPES
// ============================================================

export const TRANSACTION_TYPE = Object.freeze({
    DEPOSIT: 'deposit',
    WITHDRAWAL: 'withdrawal',
    PAYMENT: 'payment',
    REFUND: 'refund',
    EARNINGS: 'earnings',
})

// ============================================================
// PROMO TYPES
// ============================================================

export const PROMO_TYPE = Object.freeze({
    FIXED: 'fixed',
    PERCENTAGE: 'percentage',
})

// ============================================================
// VEHICLE TYPES
// ============================================================

export const VEHICLE_TYPE = Object.freeze({
    MOTORCYCLE: 'motorcycle',
})

// ============================================================
// TIMEOUTS & LIMITS
// ============================================================

export const TIMEOUTS = Object.freeze({
    /** Menit sebelum order pending otomatis di-cancel */
    ORDER_TIMEOUT_MINUTES: 15,
    /** Menit sebelum driver dianggap stale/inactive */
    DRIVER_STALE_MINUTES: 30,
    /** Milidetik untuk rate limit auth (5 menit) */
    AUTH_RATE_LIMIT_WINDOW_MS: 5 * 60 * 1000,
    /** Maksimum percobaan auth dalam window */
    AUTH_MAX_ATTEMPTS: 5,
    /** Interval refresh profile (5 menit) */
    PROFILE_REFRESH_INTERVAL_MS: 5 * 60 * 1000,
})

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Cek apakah sebuah order status dianggap terminal (selesai).
 * @param {string} status
 * @returns {boolean}
 */
export function isTerminalStatus(status) {
    return TERMINAL_ORDER_STATUSES.includes(status)
}

/**
 * Cek apakah sebuah order bisa di-cancel.
 * @param {string} status
 * @returns {boolean}
 */
export function isCancellableStatus(status) {
    return CANCELLABLE_ORDER_STATUSES.includes(status)
}

/**
 * Cek apakah payment method termasuk COD.
 * @param {string} method
 * @returns {boolean}
 */
export function isCODMethod(method) {
    if (!method) return false
    return COD_METHODS.includes(method.toLowerCase())
}

/**
 * Get label dari order status.
 * @param {string} status
 * @returns {string}
 */
export function getOrderStatusLabel(status) {
    return ORDER_STATUS_LABELS[status] || status
}
