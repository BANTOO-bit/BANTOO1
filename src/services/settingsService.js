/**
 * Settings Service — CRUD for app_settings table
 * 
 * Settings are stored as key-value pairs with JSONB values.
 * Keys: 'operational', 'financial', 'bank', 'admin_profile'
 */

import { supabase } from './supabaseClient'

export const settingsService = {

    /**
     * Get all settings as a flat object keyed by setting key
     * @returns {Promise<Object>} { operational: {...}, financial: {...}, bank: {...}, admin_profile: {...} }
     */
    async getAll() {
        const { data, error } = await supabase
            .from('app_settings')
            .select('key, value')

        if (error) throw error

        const result = {}
            ; (data || []).forEach(row => {
                result[row.key] = row.value
            })
        return result
    },

    /**
     * Get a single setting by key
     * @param {string} key - Setting key (e.g. 'operational')
     * @returns {Promise<Object|null>}
     */
    async get(key) {
        const { data, error } = await supabase
            .from('app_settings')
            .select('value')
            .eq('key', key)
            .single()

        if (error) {
            if (error.code === 'PGRST116') return null // Not found
            throw error
        }
        return data?.value || null
    },

    /**
     * Upsert a setting (insert or update)
     * @param {string} key - Setting key
     * @param {Object} value - Setting value object
     */
    async save(key, value) {
        const { data: { user } } = await supabase.auth.getUser()

        const { error } = await supabase
            .from('app_settings')
            .upsert({
                key,
                value,
                updated_at: new Date().toISOString(),
                updated_by: user?.id || null
            }, { onConflict: 'key' })

        if (error) throw error
        return { success: true }
    },

    /**
     * Save multiple settings at once
     * @param {Object} settings - { key: value, key2: value2, ... }
     */
    async saveAll(settings) {
        const { data: { user } } = await supabase.auth.getUser()
        const now = new Date().toISOString()

        const rows = Object.entries(settings).map(([key, value]) => ({
            key,
            value,
            updated_at: now,
            updated_by: user?.id || null
        }))

        const { error } = await supabase
            .from('app_settings')
            .upsert(rows, { onConflict: 'key' })

        if (error) throw error
        return { success: true }
    },
    // ============================================
    // DELIVERY FEE TIERS
    // ============================================

    /** Default delivery fee tiers (used when DB has no config yet) */
    DEFAULT_DELIVERY_FEE_TIERS: {
        max_radius_km: 15,
        tiers: [
            { min_km: 0, max_km: 1, total_fee: 3500, admin_fee: 500 },
            { min_km: 1, max_km: 2, total_fee: 5000, admin_fee: 700 },
            { min_km: 2, max_km: 3, total_fee: 6500, admin_fee: 1000 },
            { min_km: 3, max_km: 5, total_fee: 8000, admin_fee: 1200 },
            { min_km: 5, max_km: 7, total_fee: 10000, admin_fee: 1500 },
            { min_km: 7, max_km: 10, total_fee: 13000, admin_fee: 2000 },
            { min_km: 10, max_km: 15, total_fee: 17000, admin_fee: 2500 },
        ]
    },

    /**
     * Get delivery fee tiers config
     * @returns {Promise<Object>} { max_radius_km, tiers: [...] }
     */
    async getDeliveryFeeTiers() {
        try {
            const config = await this.get('delivery_fee_tiers')
            if (config && config.tiers && config.tiers.length > 0) {
                return config
            }
            return this.DEFAULT_DELIVERY_FEE_TIERS
        } catch {
            return this.DEFAULT_DELIVERY_FEE_TIERS
        }
    },

    /**
     * Save delivery fee tiers config
     * @param {Object} tiersConfig - { max_radius_km, tiers: [...] }
     */
    async saveDeliveryFeeTiers(tiersConfig) {
        // Validate tiers before saving
        if (!tiersConfig?.tiers || tiersConfig.tiers.length === 0) {
            throw new Error('Minimal harus ada 1 tier ongkos kirim')
        }
        if (!tiersConfig.max_radius_km || tiersConfig.max_radius_km <= 0) {
            throw new Error('Radius maksimal harus lebih dari 0')
        }

        // Validate each tier
        for (const tier of tiersConfig.tiers) {
            if (tier.total_fee < 0 || tier.admin_fee < 0) {
                throw new Error('Ongkir dan admin fee tidak boleh negatif')
            }
            if (tier.admin_fee >= tier.total_fee) {
                throw new Error(`Admin fee (Rp ${tier.admin_fee}) tidak boleh >= ongkir total (Rp ${tier.total_fee}) pada tier ${tier.min_km}-${tier.max_km} km`)
            }
            if (tier.min_km >= tier.max_km) {
                throw new Error(`Jarak min (${tier.min_km}) harus lebih kecil dari max (${tier.max_km})`)
            }
        }

        return this.save('delivery_fee_tiers', tiersConfig)
    },

    /**
     * Calculate delivery fee from distance using tier config
     * Pure function — no DB calls, takes tiers as parameter
     *
     * @param {number} distanceKm - Distance in kilometers
     * @param {Object} tiersConfig - { max_radius_km, tiers: [...] }
     * @returns {Object} { totalFee, adminFee, driverNet, distance, tierLabel, outOfRange }
     */
    calculateFeeFromTiers(distanceKm, tiersConfig) {
        const config = tiersConfig || this.DEFAULT_DELIVERY_FEE_TIERS
        const distance = Math.max(0, distanceKm)

        // Out of range
        if (distance > config.max_radius_km) {
            return {
                totalFee: 0,
                adminFee: 0,
                driverNet: 0,
                distance,
                tierLabel: `> ${config.max_radius_km} km`,
                outOfRange: true
            }
        }

        // Sort tiers by min_km ascending
        const sortedTiers = [...config.tiers].sort((a, b) => a.min_km - b.min_km)

        // Find matching tier
        for (const tier of sortedTiers) {
            if (distance >= tier.min_km && distance < tier.max_km) {
                return {
                    totalFee: tier.total_fee,
                    adminFee: tier.admin_fee,
                    driverNet: tier.total_fee - tier.admin_fee,
                    distance,
                    tierLabel: `${tier.min_km}-${tier.max_km} km`,
                    outOfRange: false
                }
            }
        }

        // Edge case: distance exactly equals the last tier's max_km
        // Use the last tier
        const lastTier = sortedTiers[sortedTiers.length - 1]
        if (distance <= lastTier.max_km) {
            return {
                totalFee: lastTier.total_fee,
                adminFee: lastTier.admin_fee,
                driverNet: lastTier.total_fee - lastTier.admin_fee,
                distance,
                tierLabel: `${lastTier.min_km}-${lastTier.max_km} km`,
                outOfRange: false
            }
        }

        // Fallback (shouldn't reach here)
        return { totalFee: 0, adminFee: 0, driverNet: 0, distance, tierLabel: '-', outOfRange: true }
    },
}

/**
 * Haversine formula — calculate distance between two lat/lng points
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lng1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lng2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
export function haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371 // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

export default settingsService
