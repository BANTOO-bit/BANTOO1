import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BottomNavigation from '../../components/user/BottomNavigation'
import merchantService from '../../services/merchantService'
import { useCart } from '../../context/CartContext'
import { useFavorites } from '../../context/FavoritesContext'
import LoadingState from '../../components/shared/LoadingState'
import ErrorState from '../../components/shared/ErrorState'
import EmptyState from '../../components/shared/EmptyState'

// Sub-categories mapping for each main category
const subCategoriesMap = {
    'makanan-berat': ['Semua', 'Nasi Goreng', 'Ayam & Bebek', 'Bakmi', 'Sate', 'Padang'],
    'jajanan': ['Semua', 'Gorengan', 'Martabak', 'Roti', 'Bakso'],
    'kue': ['Semua', 'Kue Basah', 'Kue Kering', 'Roti Manis'],
    'makanan-ringan': ['Semua', 'Keripik', 'Snack', 'Crackers'],
    'seafood': ['Semua', 'Ikan', 'Udang', 'Cumi', 'Kepiting'],
    'frozenfood': ['Semua', 'Nugget', 'Sosis', 'Dimsum', 'Frozen Meat'],
    'minuman': ['Semua', 'Es Teh', 'Jus', 'Boba', 'Smoothie'],
    'kopi-teh': ['Semua', 'Kopi', 'Teh', 'Matcha'],
    'dessert': ['Semua', 'Es Krim', 'Cake', 'Puding'],
    'makanan-sehat': ['Semua', 'Salad', 'Grain Bowl', 'Vegan'],
    'makanan-bayi': ['Semua', 'Bubur', 'Puree', 'Snack Bayi'],
    'sarapan': ['Semua', 'Nasi Uduk', 'Bubur', 'Lontong'],
    'buah-sayur': ['Semua', 'Buah Segar', 'Sayur Segar', 'Salad'],
    'sembako': ['Semua', 'Beras', 'Minyak', 'Bumbu'],
}

// Helper to format category name
const formatCategoryName = (slug) => {
    return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

// Merchant Card Component
function MerchantCard({ merchant, onClick }) {
    const { isFavorite, toggleFavorite } = useFavorites()
    const isFav = isFavorite(merchant.id)

    const handleFavoriteClick = (e) => {
        e.stopPropagation()
        toggleFavorite(merchant)
    }

    return (
        <div
            onClick={() => onClick?.(merchant)}
            className="group flex flex-col rounded-xl bg-white p-3 shadow-soft hover:shadow-lg transition-all duration-300 cursor-pointer border border-transparent hover:border-primary/10"
        >
            <div
                className="w-full aspect-[2/1] bg-cover bg-center rounded-lg mb-3 relative overflow-hidden bg-gray-100"
                style={{ backgroundImage: `url('${merchant.image}')` }}
            >
                {/* Favorite Button */}
                <button
                    onClick={handleFavoriteClick}
                    className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm active:scale-95 transition-transform"
                >
                    <span
                        className={`material-symbols-outlined block text-[20px] ${isFav ? 'text-red-500' : 'text-gray-400'}`}
                        style={{ fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0" }}
                    >
                        favorite
                    </span>
                </button>

                {/* Promo Badge */}
                {merchant.hasPromo && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-green-500 text-white text-[10px] font-medium rounded">
                        Promo
                    </div>
                )}
            </div>

            <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1.5 flex-1">
                    <p className="text-base font-bold leading-tight text-text-main">{merchant.name}</p>
                    <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                        <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="font-bold text-text-main">{merchant.rating}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full mx-0.5"></span>
                        <span>{merchant.distance}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full mx-0.5"></span>
                        <span>{merchant.deliveryTime}</span>
                    </div>
                    <div className="flex gap-2 mt-1">
                        {merchant.hasPromo && (
                            <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-medium rounded">Promo</span>
                        )}
                        {merchant.deliveryFee === 'Gratis' && (
                            <span className="px-2 py-0.5 bg-orange-50 text-orange-700 text-[10px] font-medium rounded">Gratis Ongkir</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function CategoryDetailPage() {
    const navigate = useNavigate()
    const { id } = useParams()

    // Safety check just in case
    const categoryId = id || 'makanan-berat'
    const categoryName = formatCategoryName(categoryId)

    const { cartItems } = useCart()
    const [activeFilter, setActiveFilter] = useState('Semua')
    const [allMerchants, setAllMerchants] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

    const fetchMerchants = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await merchantService.getMerchants()
            setAllMerchants(data)
        } catch (err) {
            setError(err.message || 'Gagal memuat data merchant')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchMerchants()
    }, [fetchMerchants])

    // Get sub-categories for this category and add Promo/Terlaris after Semua
    const baseSubCategories = subCategoriesMap[categoryId] || ['Semua']
    // Insert Promo and Terlaris after Semua
    const subCategories = [
        baseSubCategories[0], // 'Semua'
        'Promo',
        'Terlaris',
        ...baseSubCategories.slice(1) // Rest of sub-categories
    ]

    const filteredMerchants = useMemo(() => {
        let merchants = allMerchants

        // Category Mapping for broader categories
        const categoryMapping = {
            'makanan-berat': ['makanan berat', 'bakso', 'mie', 'nasi', 'sate', 'soto', 'bebek', 'ayam', 'seblak', 'steak', 'pizza', 'burger', 'pasta', 'chinese', 'japanese', 'korea', 'padang', 'warteg', 'rice bowl', 'gudeg', 'rawon'],
            'jajanan': ['jajanan', 'martabak', 'gorengan', 'roti bakar', 'pisang', 'cimol', 'cilok', 'minuman', 'kopi', 'teh', 'boba', 'es', 'jus', 'thai tea'],
            'kue': ['kue', 'bolu', 'brownies', 'donat', 'bread', 'pudding', 'tart'],
            'makanan-ringan': ['makanan ringan', 'keripik', 'snack', 'kerupuk', 'makaroni', 'basreng'],
            'seafood': ['seafood', 'ikan', 'kepiting', 'udang', 'cumi', 'kerang', 'lobster'],
            'lainnya': []
        }

        // Filter by category (Dynamic matching + Mapping)
        if (categoryId !== 'all') {
            merchants = merchants.filter(m => {
                const merchantCat = (m.category || '').toLowerCase().trim()
                const merchantCatSlug = merchantCat.replace(/\s+/g, '-')
                // IMPORTANT: Normalize targetSlug to kebab-case to match categoryMapping keys (e.g. "makanan berat" -> "makanan-berat")
                const targetSlug = categoryId.toLowerCase().trim().replace(/\s+/g, '-')

                // 1. Direct Match (Exact slug)
                if (merchantCatSlug === targetSlug) return true

                // 2. Mapping Match (Check if merchant category is in the mapping list)
                const allowedCategories = categoryMapping[targetSlug]
                if (allowedCategories) {
                    // Check if merchant category is in allowed list
                    if (allowedCategories.includes(merchantCat)) return true
                    // Check if merchant category contains any of the allowed terms (e.g. "Warung Bakso" contains "bakso")
                    if (allowedCategories.some(ac => merchantCat.includes(ac))) return true
                    // Check if any allowed term contains the merchant category (reverse check, rare but possible)
                    if (allowedCategories.some(ac => ac.includes(merchantCat))) return true
                }

                return false
            })
        }

        // Filter by Promo
        if (activeFilter === 'Promo') {
            merchants = merchants.filter(m => m.hasPromo || m.has_promo)
        }

        // Filter by Terlaris (using rating as proxy)
        if (activeFilter === 'Terlaris') {
            merchants = merchants.filter(m => m.rating >= 4.5)
            merchants = [...merchants].sort((a, b) => b.rating - a.rating)
        }

        return merchants
    }, [categoryId, activeFilter, allMerchants])

    if (loading) return <LoadingState message="Memuat merchant..." />
    if (error) return <ErrorState message="Gagal Memuat Data" detail={error} onRetry={fetchMerchants} />

    return (
        <div className="relative flex h-full min-h-screen w-full flex-col overflow-hidden mx-auto max-w-md bg-background-light shadow-2xl">
            {/* Status Bar Space */}
            <div className="h-12 w-full bg-white shrink-0"></div>

            {/* Header */}
            <div className="flex items-center bg-white px-4 py-3 justify-between sticky top-0 z-20 shadow-sm">
                <button
                    onClick={() => navigate(-1)}
                    className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer text-text-main"
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>arrow_back_ios_new</span>
                </button>
                <h2 className="text-text-main text-lg font-bold leading-tight tracking-tight flex-1 text-center">
                    {categoryName}
                </h2>
                {/* Cart Button */}
                <button
                    onClick={() => navigate('/cart')}
                    className="relative flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer text-primary"
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>shopping_cart</span>
                    {cartItemCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {cartItemCount > 99 ? '99+' : cartItemCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Filter Chips */}
            <div className="sticky top-[60px] z-10 bg-background-light py-4 pl-4 overflow-hidden">
                <div className="flex gap-3 overflow-x-auto no-scrollbar pr-4 items-center">
                    {/* Sub-category Filters */}
                    {subCategories.map((subCat) => (
                        <button
                            key={subCat}
                            onClick={() => setActiveFilter(subCat)}
                            className={`flex h-9 shrink-0 items-center justify-center px-5 gap-1.5 rounded-lg cursor-pointer transition-all ${activeFilter === subCat
                                ? 'bg-primary text-white shadow-md shadow-primary/20'
                                : 'bg-white border border-gray-100'
                                }`}
                        >
                            {/* Show tag icon for Promo */}
                            {subCat === 'Promo' && (
                                <span
                                    className={`material-symbols-outlined ${activeFilter === subCat ? 'text-white' : 'text-primary'}`}
                                    style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}
                                >
                                    local_offer
                                </span>
                            )}
                            <p className={`text-sm font-medium leading-normal ${activeFilter === subCat ? 'text-white font-semibold' : 'text-text-main'}`}>
                                {subCat}
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Merchant List */}
            <div className="flex flex-col gap-4 px-4 pb-24 flex-grow">
                {filteredMerchants.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-red-50/50">
                            <span className="material-symbols-outlined text-5xl text-red-400" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>restaurant_off</span>
                        </div>
                        <h3 className="text-lg font-bold text-text-main mb-2">Belum Ada Menu Disini</h3>
                        <p className="text-sm text-text-secondary max-w-[260px] mx-auto mb-8">
                            Maaf, belum ada merchant untuk kategori ini. Coba cek kategori lain yang mungkin kamu suka.
                        </p>

                        <div className="flex flex-col gap-3 w-full max-w-[280px]">
                            <button
                                onClick={() => navigate('/categories')}
                                className="w-full py-2.5 px-4 bg-primary text-white font-medium rounded-full shadow-lg shadow-primary/20 hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[20px]">category</span>
                                Lihat Kategori Lain
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="w-full py-2.5 px-4 bg-white border border-gray-200 text-text-main font-medium rounded-full hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[20px]">home</span>
                                Ke Beranda
                            </button>
                        </div>
                    </div>
                ) : (
                    filteredMerchants.map(merchant => (
                        <MerchantCard
                            key={merchant.id}
                            merchant={merchant}
                            onClick={() => navigate(`/merchant/${merchant.id}`)}
                        />
                    ))
                )}
            </div>

            {/* Bottom Navigation */}
            <BottomNavigation activeTab="search" />
        </div>
    )
}

export default CategoryDetailPage
