import { useNavigate } from 'react-router-dom'
import BottomNavigation from '@/features/customer/components/BottomNavigation'
import MerchantCard from '@/features/customer/components/MerchantCard'
import { useFavorites } from '@/context/FavoritesContext'
import EmptyState from '@/features/shared/components/EmptyState'

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
                    <div className="flex-1 flex flex-col items-center justify-center mt-8">
                        <EmptyState
                            icon="favorite"
                            title="Belum Ada Favorit"
                            message="Simpan warung favoritmu di sini agar lebih mudah memesannya kembali nanti."
                            actionLabel="Jelajahi Warung"
                            onAction={() => onNavigate?.('home')}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        <p className="text-sm text-text-secondary mb-2">
                            {favorites.length} warung favorit
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
