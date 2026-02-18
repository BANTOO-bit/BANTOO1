import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { supabase } from '../services/supabaseClient'
import { useAuth } from './AuthContext'

const FavoritesContext = createContext()

export function useFavorites() {
    const context = useContext(FavoritesContext)
    if (!context) {
        throw new Error('useFavorites must be used within a FavoritesProvider')
    }
    return context
}

export function FavoritesProvider({ children }) {
    const { user } = useAuth()
    const [favorites, setFavorites] = useState(() => {
        // Start from localStorage for instant display
        const saved = localStorage.getItem('bantoo_favorites')
        return saved ? JSON.parse(saved) : []
    })
    const [loading, setLoading] = useState(false)
    const hasSynced = useRef(false)

    // Sync from Supabase when user is authenticated
    useEffect(() => {
        if (!user?.id) {
            hasSynced.current = false
            return
        }
        if (hasSynced.current) return

        async function syncFromSupabase() {
            setLoading(true)
            try {
                const { data, error } = await supabase
                    .from('favorites')
                    .select('id, merchant_id, created_at, merchants(id, name, image_url, category, rating, rating_count, is_open, address)')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })

                if (!error && data) {
                    const mapped = data.map(fav => ({
                        id: fav.merchants?.id || fav.merchant_id,
                        name: fav.merchants?.name || 'Merchant',
                        image_url: fav.merchants?.image_url,
                        category: fav.merchants?.category,
                        rating: fav.merchants?.rating,
                        rating_count: fav.merchants?.rating_count,
                        is_open: fav.merchants?.is_open,
                        address: fav.merchants?.address,
                        addedAt: fav.created_at,
                        favoriteRowId: fav.id
                    }))
                    setFavorites(mapped)
                    localStorage.setItem('bantoo_favorites', JSON.stringify(mapped))
                    hasSynced.current = true
                }
            } catch (err) {
                console.error('Failed to sync favorites:', err)
            } finally {
                setLoading(false)
            }
        }

        syncFromSupabase()
    }, [user?.id])

    // Persist to localStorage whenever favorites change
    useEffect(() => {
        localStorage.setItem('bantoo_favorites', JSON.stringify(favorites))
    }, [favorites])

    const addFavorite = async (merchant) => {
        // Optimistic update
        const existing = favorites.find(m => m.id === merchant.id)
        if (existing) return

        const newFav = { ...merchant, addedAt: new Date().toISOString() }
        setFavorites(prev => [newFav, ...prev])

        // Persist to Supabase if authenticated
        if (user?.id) {
            try {
                const { data, error } = await supabase
                    .from('favorites')
                    .insert({ user_id: user.id, merchant_id: merchant.id })
                    .select('id')
                    .single()

                if (!error && data) {
                    // Update with the DB row ID
                    setFavorites(prev =>
                        prev.map(f => f.id === merchant.id ? { ...f, favoriteRowId: data.id } : f)
                    )
                }
            } catch (err) {
                console.error('Failed to add favorite:', err)
            }
        }
    }

    const removeFavorite = async (merchantId) => {
        const fav = favorites.find(m => m.id === merchantId)
        setFavorites(prev => prev.filter(m => m.id !== merchantId))

        // Remove from Supabase if authenticated
        if (user?.id) {
            try {
                await supabase
                    .from('favorites')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('merchant_id', merchantId)
            } catch (err) {
                console.error('Failed to remove favorite:', err)
                // Restore on error
                if (fav) setFavorites(prev => [...prev, fav])
            }
        }
    }

    const toggleFavorite = (merchant) => {
        if (isFavorite(merchant.id)) {
            removeFavorite(merchant.id)
        } else {
            addFavorite(merchant)
        }
    }

    const isFavorite = (merchantId) => {
        return favorites.some(m => m.id === merchantId)
    }

    const value = {
        favorites,
        loading,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        isFavorite,
        favoritesCount: favorites.length,
    }

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    )
}

export default FavoritesContext
