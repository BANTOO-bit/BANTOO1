import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MerchantCard from './MerchantCard'
import { getAllMerchants, getAllMenus, getMerchantById } from '../../data/merchantsData'
import { useCart } from '../../context/CartContext'

// Menu Card for search results
function MenuSearchCard({ menu, onMerchantClick, onClose }) {
    const { addToCart, getItemQuantity, updateQuantity } = useCart()
    const merchant = getMerchantById(menu.merchantId)
    const quantity = getItemQuantity(menu.id)

    const handleAdd = (e) => {
        e.stopPropagation()
        addToCart({
            ...menu,
            merchantName: menu.merchantName
        }, merchant)
    }

    const handleDecrease = (e) => {
        e.stopPropagation()
        if (quantity > 0) {
            updateQuantity(menu.id, quantity - 1)
        }
    }

    const handleCardClick = () => {
        onClose?.()
        onMerchantClick?.(merchant)
    }

    return (
        <div
            onClick={handleCardClick}
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
        >
            {/* Menu Image */}
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                <img
                    src={menu.image}
                    alt={menu.name}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Menu Info */}
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-text-main truncate">{menu.name}</h3>
                <div className="flex items-center gap-1">
                    <span className="text-[10px] text-text-secondary truncate">{menu.merchantName}</span>
                    <span className="text-[10px] text-text-secondary">•</span>
                    <span className="font-bold text-primary text-xs">
                        Rp {menu.price.toLocaleString()}
                    </span>
                </div>
            </div>

            {/* Add to Cart Button */}
            <div className="flex-shrink-0">
                {quantity === 0 ? (
                    <button
                        onClick={handleAdd}
                        className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-sm active:scale-95 transition-transform"
                    >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                ) : (
                    <div className="flex items-center gap-0.5">
                        <button
                            onClick={handleDecrease}
                            className="w-6 h-6 rounded-full bg-gray-100 text-text-main flex items-center justify-center active:scale-95"
                        >
                            <span className="material-symbols-outlined text-[14px]">remove</span>
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{quantity}</span>
                        <button
                            onClick={handleAdd}
                            className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center active:scale-95"
                        >
                            <span className="material-symbols-outlined text-[14px]">add</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

function SearchBar() {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')
    const [menuResults, setMenuResults] = useState([])
    const [merchantResults, setMerchantResults] = useState([])
    const [isSearching, setIsSearching] = useState(false)

    // Get data from centralized source
    const allMerchants = getAllMerchants()
    const allMenus = getAllMenus()

    // Search effect
    useEffect(() => {
        if (searchQuery.trim().length >= 2) {
            const query = searchQuery.toLowerCase()

            // Search menus (limit to 5)
            const menus = allMenus.filter(menu =>
                menu.name.toLowerCase().includes(query) ||
                menu.description?.toLowerCase().includes(query)
            ).slice(0, 5)
            setMenuResults(menus)

            // Search merchants (limit to 3)
            const merchants = allMerchants.filter(merchant =>
                merchant.name.toLowerCase().includes(query) ||
                merchant.category.toLowerCase().includes(query)
            ).slice(0, 3)
            setMerchantResults(merchants)

            setIsSearching(true)
        } else {
            setMenuResults([])
            setMerchantResults([])
            setIsSearching(false)
        }
    }, [searchQuery])

    const handleMerchantClick = (merchant) => {
        // Save to recent searches
        const saved = localStorage.getItem('bantoo_recent_searches')
        const recentSearches = saved ? JSON.parse(saved) : []
        const newRecent = [
            merchant.name,
            ...recentSearches.filter(s => s !== merchant.name)
        ].slice(0, 5)
        localStorage.setItem('bantoo_recent_searches', JSON.stringify(newRecent))

        // Clear search and navigate
        setSearchQuery('')
        setIsSearching(false)
        navigate(`/merchant/${merchant.id}`)
    }

    const handleClear = () => {
        setSearchQuery('')
        setMenuResults([])
        setMerchantResults([])
        setIsSearching(false)
    }

    const handleViewAll = () => {
        handleClear()
        navigate('/search')
    }

    const totalResults = menuResults.length + merchantResults.length

    return (
        <div className="relative px-4 pb-4 pt-2 w-full z-30">
            <div className="relative flex items-center w-full h-12 rounded-lg focus-within:ring-2 focus-within:ring-primary/50 transition-shadow bg-white shadow-soft overflow-hidden border border-border-color">
                <div className="grid place-items-center h-full w-12 text-text-secondary">
                    <span className="material-symbols-outlined">search</span>
                </div>
                <input
                    className="peer h-full w-full outline-none bg-transparent text-sm text-text-main placeholder:text-text-secondary font-normal pr-10"
                    id="search"
                    placeholder="Cari makanan atau resto..."
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                    <button
                        onClick={handleClear}
                        className="absolute right-3 p-1 text-text-secondary hover:text-text-main"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                )}
            </div>

            {/* Search Results Dropdown */}
            {isSearching && (
                <div className="absolute left-4 right-4 top-full mt-1 bg-white rounded-xl shadow-lg border border-border-color max-h-[60vh] overflow-y-auto z-50">
                    {totalResults === 0 ? (
                        <div className="flex flex-col items-center py-8 px-4">
                            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">search_off</span>
                            <p className="text-sm text-text-secondary">Tidak ditemukan hasil untuk "{searchQuery}"</p>
                        </div>
                    ) : (
                        <div className="p-3">
                            {/* Menu Results */}
                            {menuResults.length > 0 && (
                                <div className="mb-3">
                                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wide px-1 mb-1 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[12px]">restaurant_menu</span>
                                        Menu
                                    </p>
                                    <div className="divide-y divide-gray-50">
                                        {menuResults.map(menu => (
                                            <MenuSearchCard
                                                key={menu.id}
                                                menu={menu}
                                                onMerchantClick={handleMerchantClick}
                                                onClose={handleClear}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Merchant Results */}
                            {merchantResults.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wide px-1 mb-1 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[12px]">storefront</span>
                                        Restoran
                                    </p>
                                    <div className="space-y-2">
                                        {merchantResults.map(merchant => (
                                            <MerchantCard
                                                key={merchant.id}
                                                merchant={merchant}
                                                onClick={handleMerchantClick}
                                                showFavoriteButton={false}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* View All Button */}
                            <button
                                onClick={handleViewAll}
                                className="w-full mt-3 py-2.5 text-sm font-medium text-primary hover:bg-orange-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                            >
                                Lihat semua hasil
                                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Overlay to close search when clicking outside */}
            {isSearching && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={handleClear}
                />
            )}
        </div>
    )
}

export default SearchBar
