import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNavigation from '../../components/user/BottomNavigation'
import { useCart } from '../../context/CartContext'
import merchantService from '../../services/merchantService'

// Metadata for categories (ID & Icon mapping)
const categoryMetadata = [
    { id: 'makanan-berat', name: 'Makanan Berat', icon: 'dinner_dining' },
    { id: 'jajanan', name: 'Jajanan', icon: 'fastfood' },
    { id: 'kue', name: 'Kue', icon: 'cake' },
    { id: 'makanan-ringan', name: 'Makanan Ringan', icon: 'cookie' },
    { id: 'seafood', name: 'Seafood', icon: 'set_meal' },
    { id: 'frozenfood', name: 'Frozen Food', icon: 'kitchen' },
    { id: 'minuman', name: 'Minuman', icon: 'local_drink' },
    { id: 'kopi-teh', name: 'Kopi & Teh', icon: 'coffee' },
    { id: 'dessert', name: 'Dessert', icon: 'icecream' },
    { id: 'makanan-sehat', name: 'Makanan Sehat', icon: 'spa' },
    { id: 'makanan-bayi', name: 'Makanan Bayi', icon: 'child_care' },
    { id: 'sarapan', name: 'Sarapan', icon: 'breakfast_dining' },
    { id: 'buah-sayur', name: 'Buah & Sayur', icon: 'eco' },
    { id: 'sembako', name: 'Sembako', icon: 'shopping_basket' },
]

// Category Item Component
function CategoryItem({ category, onClick }) {
    // Handle multi-word names with line breaks
    const nameParts = category.name.split(' ')
    const displayName = nameParts.length > 1
        ? <>{nameParts[0]}<br />{nameParts.slice(1).join(' ')}</>
        : category.name

    return (
        <div
            className="flex flex-col items-center gap-2 cursor-pointer group"
            onClick={() => onClick?.(category)}
        >
            <div className="w-14 h-14 rounded-full bg-white shadow-soft flex items-center justify-center text-primary border border-border-color group-active:scale-95 transition-transform hover:shadow-md">
                <span className="material-symbols-outlined text-[28px]">{category.icon}</span>
            </div>
            <span className="text-[11px] font-medium text-text-main text-center leading-tight">
                {displayName}
            </span>
        </div>
    )
}

function AllCategoriesPage() {
    const navigate = useNavigate()
    const { cartItems } = useCart()
    const [searchQuery, setSearchQuery] = useState('')
    const [activeCategories, setActiveCategories] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

    useEffect(() => {
        async function fetchCategories() {
            try {
                // Get unique category names from DB
                const dbCategories = await merchantService.getCategories()

                // Map to metadata to get icons and IDs
                const mappedCategories = dbCategories.map(catName => {
                    // Try to find matching metadata
                    const meta = categoryMetadata.find(
                        m => m.name.toLowerCase() === catName.toLowerCase()
                    )

                    if (meta) {
                        return meta
                    } else {
                        // Fallback for new categories not in metadata
                        return {
                            id: catName.toLowerCase().replace(/\s+/g, '-'),
                            name: catName,
                            icon: 'restaurant' // Default icon
                        }
                    }
                })

                setActiveCategories(mappedCategories)
            } catch (error) {
                console.error('Failed to fetch categories:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchCategories()
    }, [])

    // Filter categories based on search
    const filteredCategories = searchQuery.trim()
        ? activeCategories.filter(cat =>
            cat.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : activeCategories

    const handleCategoryClick = (category) => {
        navigate(`/category/${category.id}`)
    }

    return (
        <div className="relative min-h-screen flex flex-col overflow-x-hidden pb-[88px] bg-background-light">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-background-light/95 backdrop-blur-md px-4 pt-12 pb-4 flex flex-col gap-4 border-b border-transparent">
                <div className="relative flex items-center justify-center w-full">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute left-0 w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center text-text-main active:scale-95 transition-transform hover:bg-gray-50 border border-border-color"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-bold text-text-main">Semua Kategori</h1>
                    {/* Cart Button */}
                    <button
                        onClick={() => navigate('/cart')}
                        className="absolute right-0 w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center text-primary active:scale-95 transition-transform hover:bg-gray-50 border border-border-color"
                    >
                        <span className="material-symbols-outlined">shopping_cart</span>
                        {cartItemCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                {cartItemCount > 99 ? '99+' : cartItemCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Search Category */}
                <div className="relative flex items-center w-full h-11 rounded-full focus-within:ring-2 focus-within:ring-primary/50 transition-shadow bg-white shadow-soft overflow-hidden border border-border-color">
                    <div className="grid place-items-center h-full w-10 text-text-secondary pl-1">
                        <span className="material-symbols-outlined text-[20px]">search</span>
                    </div>
                    <input
                        className="peer h-full w-full outline-none bg-transparent text-sm text-text-main placeholder:text-text-secondary font-normal pr-4"
                        id="category-search"
                        placeholder="Cari kategori makanan..."
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="p-2">
                            <span className="material-symbols-outlined text-text-secondary text-[18px]">close</span>
                        </button>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex flex-col gap-8 px-4 pt-4 flex-grow">
                <section>
                    {isLoading ? (
                        <div className="grid grid-cols-4 gap-y-6 gap-x-2">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} className="flex flex-col items-center gap-2">
                                    <div className="w-14 h-14 rounded-full bg-gray-200 animate-pulse"></div>
                                    <div className="w-12 h-3 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                            ))}
                        </div>
                    ) : filteredCategories.length === 0 ? (
                        <div className="flex flex-col items-center py-12">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-4xl text-gray-400">search_off</span>
                            </div>
                            <h3 className="font-bold text-text-main mb-1">Kategori tidak ditemukan</h3>
                            <p className="text-sm text-text-secondary text-center">
                                {activeCategories.length === 0
                                    ? "Belum ada merchant yang aktif saat ini."
                                    : "Coba kata kunci lain"
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-4 gap-y-6 gap-x-2">
                            {filteredCategories.map(category => (
                                <CategoryItem
                                    key={category.id}
                                    category={category}
                                    onClick={handleCategoryClick}
                                />
                            ))}
                        </div>
                    )}
                </section>
                <div className="h-4"></div>
            </main>

            {/* Bottom Navigation */}
            <BottomNavigation activeTab="search" />
        </div>
    )
}

export default AllCategoriesPage
