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
    }
}

export default settingsService
