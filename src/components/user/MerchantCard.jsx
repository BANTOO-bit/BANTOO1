import { useFavorites } from '../../context/FavoritesContext'

function MerchantCard({ merchant, onClick, showFavoriteButton = true }) {
    const { isFavorite, toggleFavorite } = useFavorites()
    const isFav = isFavorite(merchant.id)

    const handleFavoriteClick = (e) => {
        e.stopPropagation()
        toggleFavorite(merchant)
    }

    return (
        <article
            onClick={() => onClick?.(merchant)}
            className="relative flex items-center p-3 gap-3 rounded-xl bg-card-light shadow-soft border border-border-color active:bg-gray-50 transition-colors cursor-pointer"
        >
            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url('${merchant.image}')` }}
                />
            </div>
            <div className="flex flex-col flex-1 justify-center gap-1">
                <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-text-main">{merchant.name}</h3>
                    {!merchant.is_open && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
                            Tutup
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined fill text-[14px] text-yellow-500">star</span>
                    <span className="text-xs font-medium text-text-main">{merchant.rating}</span>
                    <span className="text-xs text-text-secondary mx-1">•</span>
                    <span className="text-xs text-text-secondary">{merchant.category?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
                </div>
                <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1 text-text-secondary">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        <span className="text-xs">{merchant.deliveryTime}</span>
                    </div>
                    <div className="flex items-center gap-1 text-text-secondary">
                        <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                        <span className="text-xs">{merchant.deliveryFee}</span>
                    </div>
                </div>
            </div>

            {/* Favorite Button */}
            {showFavoriteButton && (
                <button
                    onClick={handleFavoriteClick}
                    className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full shadow-sm flex items-center justify-center active:scale-95 transition-transform"
                >
                    <span
                        className={`material-symbols-outlined text-lg ${isFav ? 'text-red-500' : 'text-gray-400'}`}
                        style={isFav ? { fontVariationSettings: "'FILL' 1" } : {}}
                    >
                        favorite
                    </span>
                </button>
            )}
        </article>
    )
}

export default MerchantCard
