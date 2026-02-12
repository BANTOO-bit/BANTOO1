import { createContext, useContext, useState, useEffect } from 'react'

const FavoritesContext = createContext()

export function useFavorites() {
    const context = useContext(FavoritesContext)
    if (!context) {
        throw new Error('useFavorites must be used within a FavoritesProvider')
    }
    return context
}

export function FavoritesProvider({ children }) {
    const [favorites, setFavorites] = useState(() => {
        const saved = localStorage.getItem('bantoo_favorites')
        return saved ? JSON.parse(saved) : []
    })

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem('bantoo_favorites', JSON.stringify(favorites))
    }, [favorites])

    const addFavorite = (merchant) => {
        setFavorites(prev => {
            if (prev.find(m => m.id === merchant.id)) {
                return prev // Already exists
            }
            return [...prev, { ...merchant, addedAt: new Date().toISOString() }]
        })
    }

    const removeFavorite = (merchantId) => {
        setFavorites(prev => prev.filter(m => m.id !== merchantId))
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
