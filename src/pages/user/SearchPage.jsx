import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNavigation from '../../components/user/BottomNavigation'
import merchantService from '../../services/merchantService'
import { getMerchantById } from '../../data/merchantsData'
import { useCart } from '../../context/CartContext'

// Categories for Search Page (6 main categories + Lainnya)
const searchCategories = [
    { id: 'makanan-berat', name: 'Makanan Berat', icon: 'dinner_dining' },
    { id: 'jajanan', name: 'Jajanan', icon: 'fastfood' },
    { id: 'kue', name: 'Kue', icon: 'cake' },
    { id: 'makanan-ringan', name: 'Makanan Ringan', icon: 'cookie' },
    { id: 'seafood', name: 'Seafood', icon: 'set_meal' },
    { id: 'lainnya', name: 'Lainnya', icon: 'grid_view' },
]

// Menu Card for popular recommendations
function PopularMenuCard({ menu, onMerchantClick }) {
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
        onMerchantClick?.(merchant)
    }

    return (
        <article
            onClick={handleCardClick}
            className="flex items-center p-3 gap-3 rounded-xl bg-card-light shadow-soft border border-border-color active:bg-gray-50 transition-colors cursor-pointer"
        >
            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                <img
                    src={menu.image}
                    alt={menu.name}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="flex flex-col flex-1 justify-center gap-1 min-w-0">
                <h3 className="text-base font-semibold text-text-main truncate">{menu.name}</h3>
                <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-yellow-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="text-xs font-medium text-text-main">4.5</span>
                    <span className="text-xs text-text-secondary mx-1">•</span>
                    <span className="text-xs text-text-secondary truncate">{menu.merchantName}</span>
                </div>
                <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1 text-text-secondary">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        <span className="text-xs">15-25 min</span>
                    </div>
                    <span className="text-sm font-bold text-primary">
                        Rp {menu.price.toLocaleString()}
                    </span>
                </div>
            </div>
            {/* Add to Cart Button */}
            <div className="flex-shrink-0">
                {quantity === 0 ? (
                    <button
                        onClick={handleAdd}
                        className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                ) : (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleDecrease}
                            className="w-7 h-7 rounded-full bg-gray-100 text-text-main flex items-center justify-center active:scale-95 transition-transform"
                        >
                            <span className="material-symbols-outlined text-[14px]">remove</span>
                        </button>
                        <span className="text-sm font-bold w-5 text-center">{quantity}</span>
                        <button
                            onClick={handleAdd}
                            className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center active:scale-95 transition-transform"
                        >
                            <span className="material-symbols-outlined text-[14px]">add</span>
                        </button>
                    </div>
                )}
            </div>
        </article>
    )
}

// Category Item Component
function CategoryItem({ category, onClick }) {
    const displayName = category.name.includes(' ')
        ? category.name.split(' ').map((word, i) => <span key={i}>{word}{i === 0 && <br />}</span>)
        : category.name

    return (
        <div
            className="flex flex-col items-center gap-2 cursor-pointer group"
            onClick={() => onClick?.(category)}
        >
            <div className="w-16 h-16 rounded-full bg-white shadow-soft flex items-center justify-center text-primary border border-border-color group-active:scale-95 transition-transform hover:shadow-md">
                <span className="material-symbols-outlined text-[32px]">{category.icon}</span>
            </div>
            <span className="text-xs font-medium text-text-main text-center leading-tight">
                {displayName}
            </span>
        </div>
    )
}

// Search Result Menu Card
function MenuSearchCard({ menu, onMerchantClick }) {
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

    return (
        <div
            onClick={() => onMerchantClick?.(merchant)}
            className="flex items-center gap-3 p-3 bg-card-light rounded-xl shadow-soft border border-border-color active:bg-gray-50 transition-colors cursor-pointer"
        >
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                <img src={menu.image} alt={menu.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-text-main truncate">{menu.name}</h3>
                <div className="flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-[14px] text-primary">storefront</span>
                    <span className="text-xs text-text-secondary truncate">{menu.merchantName}</span>
                </div>
                <span className="font-bold text-primary text-sm mt-1 block">
                    Rp {menu.price.toLocaleString()}
                </span>
            </div>
            <div className="flex-shrink-0">
                {quantity === 0 ? (
                    <button
                        onClick={handleAdd}
                        className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                ) : (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleDecrease}
                            className="w-7 h-7 rounded-full bg-gray-100 text-text-main flex items-center justify-center active:scale-95 transition-transform"
                        >
                            <span className="material-symbols-outlined text-[14px]">remove</span>
                        </button>
                        <span className="text-sm font-bold w-5 text-center">{quantity}</span>
                        <button
                            onClick={handleAdd}
                            className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center active:scale-95 transition-transform"
                        >
                            <span className="material-symbols-outlined text-[14px]">add</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

function SearchPage() {
    const navigate = useNavigate()
    const { cartItems } = useCart()
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedQuery, setDebouncedQuery] = useState('')
    const [menuResults, setMenuResults] = useState([])
    const [merchantResults, setMerchantResults] = useState([])
    const [popularMenus, setPopularMenus] = useState([])
    const [isSearching, setIsSearching] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [recentSearches, setRecentSearches] = useState(() => {
        const saved = localStorage.getItem('bantoo_recent_searches')
        return saved ? JSON.parse(saved) : []
    })

    const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

    // Debounce search query
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchQuery)
        }, 500) // 500ms debounce

        return () => {
            clearTimeout(handler)
        }
    }, [searchQuery])

    // Load initial data (popular menus)
    useEffect(() => {
        async function loadInitialData() {
            try {
                const popular = await merchantService.getPopularMenus(15)
                setPopularMenus(popular)
            } catch (error) {
                console.error('Failed to load popular menus:', error)
            }
        }
        loadInitialData()
    }, [])

    // Search effect
    useEffect(() => {
        async function performSearch() {
            if (debouncedQuery.trim().length >= 2) {
                setIsSearching(true)
                setIsLoading(true)
                try {
                    // Parallel search for better performance
                    const [menus, merchants] = await Promise.all([
                        merchantService.getAllMenus({ search: debouncedQuery }),
                        merchantService.getMerchants({ search: debouncedQuery })
                    ])

                    setMenuResults(menus)
                    setMerchantResults(merchants)
                } catch (error) {
                    console.error('Search failed:', error)
                    // Optionally set error state here if needed
                } finally {
                    setIsLoading(false)
                }
            } else {
                setMenuResults([])
                setMerchantResults([])
                setIsSearching(false)
            }
        }

        performSearch()
    }, [debouncedQuery])

    const handleCategoryClick = (category) => {
        if (category.id === 'lainnya') {
            navigate('/categories')
        } else {
            navigate(`/category/${category.id}`, { state: { category } })
        }
    }

    const handleMerchantClick = (merchant) => {
        // Save to recent searches
        const newRecent = [
            merchant.name,
            ...recentSearches.filter(s => s !== merchant.name)
        ].slice(0, 5)
        setRecentSearches(newRecent)
        localStorage.setItem('bantoo_recent_searches', JSON.stringify(newRecent))
        navigate(`/merchant/${merchant.id}`)
    }

    const handleRecentClick = (query) => {
        setSearchQuery(query)
    }

    const clearRecentSearches = () => {
        setRecentSearches([])
        localStorage.removeItem('bantoo_recent_searches')
    }

    const clearSearch = () => {
        setSearchQuery('')
        setMenuResults([])
        setMerchantResults([])
        setIsSearching(false)
    }

    const totalResults = menuResults.length + merchantResults.length

    return (
        <div className="relative min-h-screen flex flex-col overflow-x-hidden pb-[88px] bg-background-light">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-background-light/95 backdrop-blur-md px-4 pt-12 pb-4 flex items-center gap-3 border-b border-transparent">
                <div className="relative flex items-center flex-1 h-11 rounded-full focus-within:ring-2 focus-within:ring-primary/50 transition-shadow bg-white shadow-soft overflow-hidden border border-border-color">
                    <div className="grid place-items-center h-full w-10 text-text-secondary pl-1">
                        <span className="material-symbols-outlined text-[20px]">search</span>
                    </div>
                    <input
                        className="peer h-full w-full outline-none bg-transparent text-sm text-text-main placeholder:text-text-secondary font-normal pr-4"
                        id="search"
                        placeholder="Cari makanan atau resto..."
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button onClick={clearSearch} className="p-2">
                            <span className="material-symbols-outlined text-text-secondary text-[18px]">close</span>
                        </button>
                    )}
                </div>
                {/* Cart Button */}
                <button
                    onClick={() => navigate('/cart')}
                    className="relative w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center text-primary active:scale-95 transition-transform hover:bg-gray-50 border border-border-color"
                >
                    <span className="material-symbols-outlined">shopping_cart</span>
                    {cartItemCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {cartItemCount > 9 ? '9+' : cartItemCount}
                        </span>
                    )}
                </button>
            </header>

            {/* Main Content */}
            <main className="flex flex-col gap-8 px-4 pt-2 flex-grow">
                {isSearching ? (
                    isLoading ? (
                        /* Loading State */
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-sm text-text-secondary">Mencari...</p>
                        </div>
                    ) : (
                        /* Search Results */
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-bold text-text-secondary">
                                    {totalResults} hasil ditemukan
                                </h2>
                            </div>

                            {totalResults === 0 ? (
                                <div className="flex flex-col items-center py-12">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <span className="material-symbols-outlined text-4xl text-gray-400">search_off</span>
                                    </div>
                                    <h3 className="font-bold text-text-main mb-1">Tidak ditemukan</h3>
                                    <p className="text-sm text-text-secondary text-center">
                                        Coba kata kunci lain atau kategori berbeda
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Menu Results */}
                                    {menuResults.length > 0 && (
                                        <section>
                                            <h3 className="text-xs font-bold text-text-secondary mb-2 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">restaurant_menu</span>
                                                Menu ({menuResults.length})
                                            </h3>
                                            <div className="flex flex-col gap-2">
                                                {menuResults.map(menu => (
                                                    <MenuSearchCard
                                                        key={menu.id}
                                                        menu={menu}
                                                        onMerchantClick={handleMerchantClick}
                                                    />
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {/* Merchant Results */}
                                    {merchantResults.length > 0 && (
                                        <section>
                                            <h3 className="text-xs font-bold text-text-secondary mb-2 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">storefront</span>
                                                Restoran ({merchantResults.length})
                                            </h3>
                                            <div className="flex flex-col gap-2">
                                                {merchantResults.map(merchant => (
                                                    <article
                                                        key={merchant.id}
                                                        onClick={() => handleMerchantClick(merchant)}
                                                        className="flex items-center p-3 gap-3 rounded-xl bg-card-light shadow-soft border border-border-color active:bg-gray-50 transition-colors cursor-pointer"
                                                    >
                                                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                                            <img src={merchant.image} alt={merchant.name} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-sm text-text-main truncate">{merchant.name}</h3>
                                                            <div className="flex items-center gap-1 mt-0.5">
                                                                <span className="material-symbols-outlined text-[14px] text-yellow-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                                <span className="text-xs font-medium text-text-main">{merchant.rating}</span>
                                                                <span className="text-xs text-text-secondary mx-1">•</span>
                                                                <span className="text-xs text-text-secondary">{merchant.category}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3 mt-1 text-text-secondary">
                                                                <div className="flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                                                                    <span className="text-xs">{merchant.deliveryTime || merchant.delivery_time}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                                                                    <span className="text-xs">{merchant.deliveryFee || merchant.delivery_fee}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </article>
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </>
                            )}
                        </div>
                    )
                ) : (
                    <>
                        {/* Recent Searches */}
                        {recentSearches.length > 0 && (
                            <section>
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="text-sm font-bold text-text-secondary">Pencarian Terakhir</h2>
                                    <button
                                        onClick={clearRecentSearches}
                                        className="text-xs text-primary font-medium"
                                    >
                                        Hapus Semua
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {recentSearches.map((query, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleRecentClick(query)}
                                            className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-full border border-border-color text-sm text-text-main hover:bg-gray-50 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[16px] text-text-secondary">history</span>
                                            {query}
                                        </button>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Categories Section */}
                        <section>
                            <h2 className="text-lg font-bold text-text-main mb-4">Kategori Makanan</h2>
                            <div className="grid grid-cols-3 gap-y-6 gap-x-4">
                                {searchCategories.map(category => (
                                    <CategoryItem
                                        key={category.id}
                                        category={category}
                                        onClick={handleCategoryClick}
                                    />
                                ))}
                            </div>
                        </section>

                        {/* Popular Recommendations Section */}
                        <section className="flex flex-col gap-4">
                            <h2 className="text-lg font-bold text-text-main">Rekomendasi Terpopuler</h2>
                            {popularMenus.length > 0 ? (
                                <div className="flex flex-col gap-3">
                                    {popularMenus.map(menu => (
                                        <PopularMenuCard
                                            key={menu.id}
                                            menu={menu}
                                            onMerchantClick={handleMerchantClick}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-sm text-gray-500">
                                    Belum ada menu populer saat ini.
                                </div>
                            )}
                        </section>
                    </>
                )}

                <div className="h-4"></div>
            </main>

            {/* Bottom Navigation */}
            <BottomNavigation activeTab="search" />
        </div>
    )
}

export default SearchPage
