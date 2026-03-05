import { supabase } from './supabaseClient'

/**
 * Favorites Service — Handles customer favorites (bookmarked merchants).
 * Extracted from FavoritesContext to follow clean architecture.
 */
export const favoritesService = {
    /**
     * Get all favorites for a user with merchant details
     */
    async getFavorites(userId) {
        const { data, error } = await supabase
            .from('favorites')
            .select('id, merchant_id, created_at, merchants(id, name, image_url, category, rating, rating_count, is_open, address)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    },

    /**
     * Add a merchant to favorites
     */
    async addFavorite(userId, merchantId) {
        const { data, error } = await supabase
            .from('favorites')
            .insert({ user_id: userId, merchant_id: merchantId })
            .select('id')
            .single()

        if (error) throw error
        return data
    },

    /**
     * Remove a merchant from favorites
     */
    async removeFavorite(userId, merchantId) {
        const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('user_id', userId)
            .eq('merchant_id', merchantId)

        if (error) throw error
        return true
    },
}

export default favoritesService
