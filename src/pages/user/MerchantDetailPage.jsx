import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import merchantService from '../../services/merchantService'
import LoadingState from '../../components/shared/LoadingState'
import ErrorState from '../../components/shared/ErrorState'
import EmptyState from '../../components/shared/EmptyState'

// Menu categories for filtering
const menuCategories = [
    { id: 'all', name: 'Semua' },
    { id: 'makanan', name: 'Makanan' },
    { id: 'minuman', name: 'Minuman' },
]

function MenuItemCard({ item, merchant }) {
    const { addToCart, getItemQuantity, updateQuantity } = useCart()
    const quantity = getItemQuantity(item.id)

    const handleAdd = () => {
        // No merchant restriction - just add to cart
        addToCart({
            ...item,
            merchantName: merchant.name
        }, merchant)
    }

    const handleDecrease = () => {
        if (quantity > 0) {
            updateQuantity(item.id, quantity - 1)
        }
    }

    const handleIncrease = () => {
        addToCart({
            ...item,
            merchantName: merchant.name
        }, merchant)
    }

    return (
        <div className="flex gap-3 p-3 bg-white rounded-xl border border-border-color">
            {/* Item Image */}
            <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Item Details */}
            <div className="flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm text-text-main leading-tight">{item.name}</h3>
                        {item.isPopular && (
                            <span className="text-[9px] bg-orange-100 text-primary px-1.5 py-0.5 rounded font-medium shrink-0">
                                Populer
                            </span>
                        )}
                    </div>
                    <p className="text-[11px] text-text-secondary mt-1 leading-relaxed line-clamp-2">{item.description}</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-primary text-sm">Rp {item.price.toLocaleString()}</span>

                    {quantity === 0 ? (
                        <button
                            onClick={handleAdd}
                            className="w-7 h-7 flex items-center justify-center bg-primary text-white rounded-full active:scale-95 transition-transform shadow-md"
                        >
                            <span className="material-symbols-outlined text-base">add</span>
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleDecrease}
                                className="w-7 h-7 flex items-center justify-center bg-gray-100 text-text-main rounded-full active:scale-95 transition-transform"
                            >
                                <span className="material-symbols-outlined text-base">remove</span>
                            </button>
                            <span className="font-bold text-sm w-5 text-center">{quantity}</span>
                            <button
                                onClick={handleIncrease}
                                className="w-7 h-7 flex items-center justify-center bg-primary text-white rounded-full active:scale-95 transition-transform"
                            >
                                <span className="material-symbols-outlined text-base">add</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function MerchantDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [activeCategory, setActiveCategory] = useState('all')
    const [currentMerchant, setCurrentMerchant] = useState(null)
    const [merchantMenus, setMerchantMenus] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { cartCount, cartTotal, merchantInfo } = useCart()

    const fetchMerchantData = useCallback(async () => {
        if (!id) return
        setLoading(true)
        setError(null)
        try {
            const [merchant, menus] = await Promise.all([
                merchantService.getMerchantById(id),
                merchantService.getMenusByMerchantId(id)
            ])
            if (!merchant) {
                navigate('/')
                return
            }
            setCurrentMerchant(merchant)
            setMerchantMenus(menus)
        } catch (err) {
            setError(err.message || 'Gagal memuat data merchant')
        } finally {
            setLoading(false)
        }
    }, [id, navigate])

    useEffect(() => {
        fetchMerchantData()
    }, [fetchMerchantData])

    const filteredItems = activeCategory === 'all'
        ? merchantMenus
        : merchantMenus.filter(item => item.category === activeCategory)

    const showCartButton = cartCount > 0 && merchantInfo?.id === currentMerchant?.id

    if (loading) return <LoadingState message="Memuat merchant..." />
    if (error) return <ErrorState message="Gagal Memuat" detail={error} onRetry={fetchMerchantData} />
    if (!currentMerchant) return null

    return (
        <div className="relative min-h-screen flex flex-col bg-background-light pb-24">
            {/* Hero Image with Back Button */}
            <div className="relative h-48 w-full">
                <img
                    src={currentMerchant?.image}
                    alt={currentMerchant?.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent" />
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-12 left-4 w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur rounded-full shadow-md active:scale-95 transition-transform"
                >
                    <span className="material-symbols-outlined text-text-main">arrow_back</span>
                </button>
            </div>

            {/* Merchant Info Card */}
            <div className="relative -mt-6 mx-4 bg-white rounded-2xl p-4 shadow-soft border border-border-color">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-text-main">{currentMerchant?.name}</h1>
                        <p className="text-xs text-text-secondary mt-0.5">{currentMerchant?.category}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-[10px] font-bold ${currentMerchant?.isOpen ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {currentMerchant?.isOpen ? 'Buka' : 'Tutup'}
                    </div>
                </div>

                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border-color">
                    <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-yellow-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="text-sm font-bold">{currentMerchant?.rating}</span>
                        <span className="text-xs text-text-secondary">({currentMerchant?.ratingCount})</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-text-secondary text-sm">location_on</span>
                        <span className="text-xs text-text-secondary">{currentMerchant?.distance}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-text-secondary text-sm">schedule</span>
                        <span className="text-xs text-text-secondary">{currentMerchant?.deliveryTime}</span>
                    </div>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="sticky top-0 z-10 bg-background-light px-4 py-3 border-b border-border-color mt-4">
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {menuCategories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat.id
                                ? 'bg-primary text-white shadow-md'
                                : 'bg-white text-text-secondary border border-border-color'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Menu Items */}
            <div className="flex-1 p-4">
                <div className="flex flex-col gap-3">
                    {filteredItems.length > 0 ? (
                        filteredItems.map(item => (
                            <MenuItemCard
                                key={item.id}
                                item={item}
                                merchant={currentMerchant}
                            />
                        ))
                    ) : (
                        <div className="flex flex-col items-center py-12">
                            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">restaurant_menu</span>
                            <p className="text-text-secondary text-sm">Tidak ada menu di kategori ini</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Cart Button */}
            {showCartButton && (
                <div className="fixed bottom-6 left-4 right-4 z-50">
                    <button
                        onClick={() => navigate('/cart')}
                        className="w-full flex items-center justify-between bg-primary text-white p-4 rounded-2xl shadow-lg active:scale-[0.98] transition-transform"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-full">
                                <span className="material-symbols-outlined text-lg">shopping_cart</span>
                            </div>
                            <span className="font-bold">{cartCount} item</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold">Rp {cartTotal.toLocaleString()}</span>
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </div>
                    </button>
                </div>
            )}
        </div>
    )
}

export default MerchantDetailPage
