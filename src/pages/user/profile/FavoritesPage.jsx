import { useNavigate } from 'react-router-dom'
import BottomNavigation from '../../../components/user/BottomNavigation'
import MerchantCard from '../../../components/user/MerchantCard'
import { useFavorites } from '../../../context/FavoritesContext'

function FavoritesPage({ onNavigate, onMerchantClick }) {
    const navigate = useNavigate()
    const { favorites, removeFavorite } = useFavorites()

    return (
        <div className="relative min-h-screen flex flex-col overflow-x-hidden pb-bottom-nav bg-background-light">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white px-4 pt-12 pb-4 border-b border-border-color">
                <div className="relative flex items-center justify-center min-h-[40px]">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute left-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-text-main active:scale-95 transition-transform"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-bold">Favorit Saya</h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-4 py-4">
                {favorites.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-5xl text-red-300">favorite</span>
                        </div>
                        <h2 className="text-lg font-bold text-text-main mb-2">Belum Ada Favorit</h2>
                        <p className="text-sm text-text-secondary text-center max-w-xs mb-6">
                            Simpan resto favoritmu agar lebih mudah ditemukan nanti
                        </p>
                        <button
                            onClick={() => onNavigate?.('home')}
                            className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-md active:scale-95 transition-transform"
                        >
                            Jelajahi Resto
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        <p className="text-sm text-text-secondary mb-2">
                            {favorites.length} resto favorit
                        </p>
                        {favorites.map(merchant => (
                            <div key={merchant.id} className="relative">
                                <MerchantCard
                                    merchant={merchant}
                                    onClick={onMerchantClick}
                                />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        removeFavorite(merchant.id)
                                    }}
                                    className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center active:scale-95 transition-transform"
                                >
                                    <span className="material-symbols-outlined text-red-500 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                                        favorite
                                    </span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Bottom Navigation */}
            <BottomNavigation activeTab="home" onNavigate={onNavigate} />
        </div>
    )
}

export default FavoritesPage
