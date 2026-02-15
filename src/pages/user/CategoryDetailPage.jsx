import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BottomNavigation from '../../components/user/BottomNavigation'
import merchantService from '../../services/merchantService'
import { useCart } from '../../context/CartContext'
import LoadingState from '../../components/shared/LoadingState'
import ErrorState from '../../components/shared/ErrorState'

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

// Menu Item Card Component
function MenuItemCard({ item, onClick }) {
    const { addToCart } = useCart()

    const handleAdd = (e) => {
        e.stopPropagation()

        // Construct merchant object for cart context
        const merchant = {
            id: item.merchant_id,
            name: item.merchant_name,
            image: item.merchant_image,
            deliveryFee: item.merchant_delivery_fee,
            deliveryTime: item.merchant_delivery_time,
            rating: item.merchant_rating
        }

        addToCart(item, merchant)
    }

    return (
        <div
            onClick={() => onClick?.(item)}
            className="group flex gap-3 rounded-xl bg-white p-3 shadow-soft hover:shadow-lg transition-all duration-300 cursor-pointer border border-transparent hover:border-primary/10"
        >
            <div
                className="w-24 h-24 bg-cover bg-center rounded-lg relative overflow-hidden bg-gray-100 shrink-0"
                style={{ backgroundImage: `url('${item.image}')` }}
            >
                {/* Promo Badge if applicable - assuming item level promo or merchant promo */}
                {/* For now not showing promo badge on item image unless data exists */}
            </div>

            <div className="flex flex-col flex-1 justify-between">
                <div>
                    <div className="flex justify-between items-start">
                        <h3 className="text-sm font-bold leading-tight text-text-main line-clamp-2">{item.name}</h3>
                    </div>
                    <p className="text-xs text-text-secondary line-clamp-1 mt-1">{item.description}</p>

                    {/* Merchant Info */}
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-500">
                        <span className="material-symbols-outlined text-[12px]">store</span>
                        <span className="truncate max-w-[120px] font-medium">{item.merchant_name}</span>
                        <span className="w-0.5 h-0.5 bg-gray-300 rounded-full mx-0.5"></span>
                        <span className="flex items-center gap-0.5 text-primary">
                            <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            {item.merchant_rating}
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-2">
                    <p className="text-sm font-bold text-gray-900">
                        Rp {parseInt(item.price).toLocaleString('id-ID')}
                    </p>
                    <button
                        onClick={handleAdd}
                        className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center hover:bg-orange-600 transition-colors shadow-sm active:scale-90"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
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
    const [allMenus, setAllMenus] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

    const fetchMenus = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await merchantService.getMenusByCategory(categoryId)
            setAllMenus(data)
        } catch (err) {
            setError(err.message || 'Gagal memuat menu makanan')
        } finally {
            setLoading(false)
        }
    }, [categoryId])

    useEffect(() => {
        fetchMenus()
        setActiveFilter('Semua') // Reset filter on category change
    }, [fetchMenus])

    // Get sub-categories for this category and add Promo/Terlaris after Semua
    const baseSubCategories = subCategoriesMap[categoryId] || ['Semua']
    const subCategories = [
        baseSubCategories[0], // 'Semua'
        // 'Promo', // Hide special filters for now to simplify
        // 'Terlaris',
        ...baseSubCategories.slice(1) // Rest of sub-categories
    ]

    const filteredMenus = useMemo(() => {
        let menus = allMenus

        // Filter by Sub-Category filtering logic
        // "Semua", "Promo", "Terlaris" are special cases.
        // Others are text matching against Item Name or Description or even Merchant Name?
        // Usually filtering by Item Category if available, but our items don't strictly have sub-cats yet.
        // We will do a text search on Item Name + Description for the sub-category keyword.

        if (activeFilter !== 'Semua') {
            const keyword = activeFilter.toLowerCase()
            menus = menus.filter(item => {
                const nameMatch = (item.name || '').toLowerCase().includes(keyword)
                const descMatch = (item.description || '').toLowerCase().includes(keyword)
                // const catMatch = (item.category || '').toLowerCase().includes(keyword) // If item has category
                return nameMatch || descMatch
            })
        }

        // Additional sorting/filtering for Promo/Terlaris if we enable them
        // if (activeFilter === 'Terlaris') { ... }

        return menus
    }, [activeFilter, allMenus])

    if (loading) return <LoadingState message="Sedang memuat menu..." />
    if (error) return <ErrorState message="Gagal Memuat Menu" detail={error} onRetry={fetchMenus} />

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
                <div className="flex-1 text-center">
                    <p className="text-xs text-text-secondary">Kategori</p>
                    <h2 className="text-text-main text-lg font-bold leading-tight tracking-tight">
                        {categoryName}
                    </h2>
                </div>
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
                                ? 'bg-primary text-white'
                                : 'bg-white border border-gray-100'
                                }`}
                        >
                            <p className={`text-sm font-medium leading-normal ${activeFilter === subCat ? 'text-white font-semibold' : 'text-text-main'}`}>
                                {subCat}
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Menu List */}
            <div className="flex flex-col gap-4 px-4 pb-24 flex-grow">
                {filteredMenus.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-orange-50/50">
                            <span className="material-symbols-outlined text-5xl text-orange-400" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>lunch_dining</span>
                        </div>
                        <h3 className="text-lg font-bold text-text-main mb-2">Menu Tidak Ditemukan</h3>
                        <p className="text-sm text-text-secondary max-w-[260px] mx-auto mb-8">
                            Belum ada menu yang cocok untuk kategori ini. Coba cek filter lain atau kategori berbeda.
                        </p>

                        <div className="flex flex-col gap-3 w-full max-w-[280px]">
                            <button
                                onClick={() => navigate('/categories')}
                                className="w-full py-2.5 px-4 bg-primary text-white font-medium rounded-full hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[20px]">category</span>
                                Lihat Kategori Lain
                            </button>
                        </div>
                    </div>
                ) : (
                    filteredMenus.map(item => (
                        <MenuItemCard
                            key={item.id}
                            item={item}
                            onClick={() => navigate(`/merchant/${item.merchant_id}`)}
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
