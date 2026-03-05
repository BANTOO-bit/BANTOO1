import { supabase } from './supabaseClient'

/**
 * Menu Service - Handle merchant menu CRUD operations
 * Extracted from UI components for clean architecture.
 */
const menuService = {

    // ============================================================
    // MENU ITEMS (Merchant-side management)
    // ============================================================

    /**
     * Get all menu items for a merchant (by owner user ID)
     */
    async getMenuItemsByOwner(userId) {
        // 1. Resolve merchant ID
        const { data: merchant, error: mErr } = await supabase
            .from('merchants')
            .select('id')
            .eq('owner_id', userId)
            .single()
        if (mErr) throw mErr
        if (!merchant) throw new Error('Merchant not found')

        // 2. Fetch menu items
        const { data, error } = await supabase
            .from('menu_items')
            .select('*')
            .eq('merchant_id', merchant.id)
            .order('created_at', { ascending: false })
        if (error) throw error

        return { merchantId: merchant.id, items: data || [] }
    },

    /**
     * Get a single menu item by ID
     */
    async getMenuItem(menuId) {
        const { data, error } = await supabase
            .from('menu_items')
            .select('*')
            .eq('id', menuId)
            .single()
        if (error) throw error
        return data
    },

    /**
     * Add a new menu item
     */
    async addMenuItem(merchantId, menuData) {
        const { error } = await supabase
            .from('menu_items')
            .insert({
                merchant_id: merchantId,
                name: menuData.name,
                category: menuData.category,
                price: menuData.price,
                description: menuData.description,
                image_url: menuData.image_url,
                is_available: true,
            })
        if (error) throw error
        return true
    },

    /**
     * Update an existing menu item
     */
    async updateMenuItem(menuId, updates) {
        const { error } = await supabase
            .from('menu_items')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', menuId)
        if (error) throw error
        return true
    },

    /**
     * Toggle menu item availability
     */
    async toggleAvailability(menuId, newStatus) {
        const { error } = await supabase
            .from('menu_items')
            .update({ is_available: newStatus })
            .eq('id', menuId)
        if (error) throw error
        return true
    },

    /**
     * Delete a menu item
     */
    async deleteMenuItem(menuId) {
        const { error } = await supabase
            .from('menu_items')
            .delete()
            .eq('id', menuId)
        if (error) throw error
        return true
    },

    /**
     * Get merchant ID by owner (used by add menu)
     */
    async getMerchantIdByOwner(userId) {
        const { data, error } = await supabase
            .from('merchants')
            .select('id')
            .eq('owner_id', userId)
            .single()
        if (error || !data) throw error || new Error('Merchant profile not found')
        return data.id
    },
}

export default menuService
