import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNavigation from '../../../components/user/BottomNavigation'
import merchantService from '../../../services/merchantService'
import { useCart } from '../../../context/CartContext'
import { useToast } from '../../../context/ToastContext'
import { handleError } from '../../../utils/errorHandler'
import useDebounce from '../../../hooks/useDebounce'

// Categories for Search Page (6 main categories + Lainnya)
// Updated to match HTML: Makanan Berat, Jajanan, Kue, Makanan Ringan, Seafood, Lainnya
const searchCategories = [
    { id: 'makanan-berat', name: 'Makanan Berat', icon: 'dinner_dining' },
    { id: 'jajanan', name: 'Jajanan', icon: 'fastfood' },
    { id: 'kue', name: 'Kue', icon: 'cake' },
    { id: 'makanan-ringan', name: 'Makanan Ringan', icon: 'cookie' },
    { id: 'seafood', name: 'Seafood', icon: 'set_meal' },
    { id: 'lainnya', name: 'Lainnya', icon: 'grid_view' },
]

// New Popular Recommendation Card (List Style)
function SearchRecommendationCard({ menu, onClick }) {
    const { getItemQuantity, updateQuantity, addToCart } = useCart()
    const quantity = getItemQuantity(menu.id)

    // Format price
    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price)
    }

    return (
        <article
            onClick={() => onClick(menu)}
            className="flex items-center p-3 gap-3 rounded-xl bg-white shadow-soft border border-gray-100 active:bg-gray-50 transition-colors cursor-pointer"
        >
            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                {menu.image_url ? (
                    <img src={menu.image_url} alt={menu.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <span className="material-symbols-outlined text-3xl">restaurant</span>
                    </div>
                )}
            </div>
            <div className="flex flex-col flex-1 justify-center gap-1">
                <h3 className="text-base font-semibold text-gray-800 line-clamp-1">{menu.name}</h3>
                <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-yellow-500 fill">star</span>
                    <span className="text-xs font-medium text-gray-700">{menu.rating || '4.5'}</span>
                    <span className="text-xs text-gray-400 mx-1">•</span>
                    <span className="text-xs text-gray-500 line-clamp-1">{menu.merchantName || 'Merchant'}</span>
                </div>
                <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1 text-gray-500">
                        <span className="material-symbols-outlined text-[14px]">sell</span>
                        <span className="text-xs">{formatPrice(menu.price)}</span>
                    </div>
                    {/* Placeholder for time/shipping if not available in menu object */}
                    {/* <div className="flex items-center gap-1 text-gray-500">
                        <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                        <span className="text-xs">Gratis</span>
                    </div> */}
                </div>
            </div>
        </article>
    )
}

function CategoryItem({ category, onClick }) {
    // Determine display name
    const name = category.name
        ? category.name
        : category.id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')

    // Handle multi-word names with line breaks
    const nameParts = name.split(' ')
    const displayName = nameParts.length > 1
        ? <>{nameParts[0]}<br />{nameParts.slice(1).join(' ')}</>
        : name

    return (
        <div
            onClick={() => onClick(category)}
            className="flex flex-col items-center gap-2 cursor-pointer group"
        >
            <div className="w-16 h-16 rounded-full bg-white shadow-soft flex items-center justify-center text-primary border border-gray-100 group-active:scale-95 transition-transform hover:shadow-md">
                <span className="material-symbols-outlined text-[32px]">{category.icon}</span>
            </div>
            <span className="text-xs font-medium text-gray-800 text-center leading-tight">
                {displayName}
            </span>
        </div>
    )
}

function SearchPage() {
    const navigate = useNavigate()
    const { cartItems } = useCart()
    const toast = useToast()
    const [searchQuery, setSearchQuery] = useState('')
    const debouncedQuery = useDebounce(searchQuery, 500)
    const [merchantResults, setMerchantResults] = useState([]) // Actually menu results
    const [popularMenus, setPopularMenus] = useState([])
    const [displayCategories, setDisplayCategories] = useState(searchCategories)
    const [isSearching, setIsSearching] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

    // Load Initial Data
    useEffect(() => {
        async function loadInitialData() {
            try {
                let popular = await merchantService.getPopularMenus(10)

                // Fallback: If no popular menus, fetch latest menus (limit 10)
                // This synchronizes detailed behavior with Home and PopularMenu pages
                if (popular.length === 0) {
                    const allMenus = await merchantService.getAllMenus({ limit: 20 })
                    popular = allMenus.slice(0, 10)
                }

                // Render popular menus immediately
                setPopularMenus(popular)

                const dbCategories = await merchantService.getCategories()

                const combinedCategories = [...searchCategories]
                if (Array.isArray(dbCategories)) {
                    dbCategories.forEach(catName => {
                        if (!catName) return // Skip null/undefined categories
                        const id = catName.toLowerCase().replace(/\s+/g, '-')
                        const isKnown = searchCategories.some(sc => sc.id === id)
                        if (!isKnown) {
                            combinedCategories.push({
                                id: id,
                                name: catName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                                icon: 'restaurant'
                            })
                        }
                    })
                }
                // Limit to 9 to fill 3 rows nicely
                setDisplayCategories(combinedCategories.slice(0, 9))

            } catch (error) {
                handleError(error, toast, { context: 'Load search data' })
                setDisplayCategories(searchCategories)
            }
        }
        loadInitialData()
    }, [])

    // Search Logic
    useEffect(() => {
        async function fetchSearchResults() {
            if (!debouncedQuery.trim()) {
                setMerchantResults([])
                setIsSearching(false)
                return
            }
            setIsSearching(true)
            setIsLoading(true)
            try {
                const menus = await merchantService.getAllMenus({ search: debouncedQuery, limit: 50 })
                setMerchantResults(menus)
            } catch (error) {
                handleError(error, toast, { context: 'Search' })
            } finally {
                setIsLoading(false)
            }
        }
        fetchSearchResults()
    }, [debouncedQuery])

    const handleCategoryClick = (category) => {
        if (category.id === 'lainnya') {
            navigate('/categories')
        } else {
            navigate(`/category/${category.id}`)
        }
    }

    const handleMenuClick = (menu) => {
        navigate(`/merchant/${menu.merchant_id}`)
    }

    return (
        <div className="bg-background-light text-text-main relative min-h-screen flex flex-col overflow-x-hidden pb-[88px]">
            {/* Header - Updated Layout */}
            <header className="sticky top-0 z-20 bg-background-light/95 backdrop-blur-md px-4 pt-12 pb-4 flex items-center gap-3 border-b border-transparent transition-colors">


                <div className="relative flex items-center flex-1 h-11 rounded-full focus-within:ring-2 focus-within:ring-primary/50 transition-shadow bg-white shadow-soft overflow-hidden border border-gray-100">
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
                        <button
                            onClick={() => {
                                setSearchQuery('')
                                setMerchantResults([])
                                setIsSearching(false)
                            }}
                            className="mr-2 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-text-secondary hover:bg-gray-300 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                    )}
                </div>

                <button
                    onClick={() => navigate('/cart')}
                    className="relative w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center text-primary active:scale-95 transition-transform hover:bg-gray-50 border border-gray-100"
                >
                    <span className="material-symbols-outlined">shopping_cart</span>
                    {cartItemCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                            {cartItemCount > 99 ? '99+' : cartItemCount}
                        </span>
                    )}
                </button>
            </header>

            <main className="flex flex-col gap-8 px-4 pt-2">
                {isSearching ? (
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-text-main">Hasil Pencarian</h2>
                            <span className="text-xs text-gray-500">{merchantResults.length} ditemukan</span>
                        </div>
                        {isLoading ? (
                            <div className="flex flex-col gap-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : merchantResults.length > 0 ? (
                            <div className="flex flex-col gap-3">
                                {merchantResults.map(menu => (
                                    <SearchRecommendationCard
                                        key={menu.id}
                                        menu={menu}
                                        onClick={handleMenuClick}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-4xl text-gray-300">search_off</span>
                                </div>
                                <h3 className="font-bold text-gray-800 mb-1">Tidak ditemukan</h3>
                                <p className="text-sm text-gray-500">Coba kata kunci lain.</p>
                            </div>
                        )}
                    </section>
                ) : (
                    <>
                        {/* Categories - Grid 3 Cols */}
                        <section>
                            <h2 className="text-lg font-bold text-text-main mb-4">Kategori Makanan</h2>
                            <div className="grid grid-cols-3 gap-y-6 gap-x-4">
                                {displayCategories.map(category => (
                                    <CategoryItem
                                        key={category.id}
                                        category={category}
                                        onClick={handleCategoryClick}
                                    />
                                ))}
                            </div>
                        </section>

                        {/* Popular Recommendations - Vertical List */}
                        <section className="flex flex-col gap-4">
                            <h2 className="text-lg font-bold text-text-main">Rekomendasi Terpopuler</h2>
                            <div className="flex flex-col gap-3">
                                {popularMenus.length > 0 ? (
                                    popularMenus.map(menu => (
                                        <SearchRecommendationCard
                                            key={menu.id}
                                            menu={menu}
                                            onClick={handleMenuClick}
                                        />
                                    ))
                                ) : (
                                    <div className="h-32 bg-gray-50 rounded-xl flex items-center justify-center border border-dashed border-gray-200">
                                        <p className="text-xs text-gray-400">Belum ada menu populer</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </>
                )}

                <div className="h-4"></div>
            </main>

            <BottomNavigation activeTab="search" />
        </div>
    )
}

export default SearchPage
