import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../../context/CartContext'
import merchantService from '../../../services/merchantService'
import BottomNavigation from '../../../components/user/BottomNavigation'
import LoadingState from '../../../components/shared/LoadingState'
import ErrorState from '../../../components/shared/ErrorState'
import EmptyState from '../../../components/shared/EmptyState'
import useDebounce from '../../../hooks/useDebounce'

function AllPopularMenuPage() {
    const navigate = useNavigate()
    const { addToCart, setMerchantInfo, cartItems } = useCart()
    const [searchQuery, setSearchQuery] = useState('')
    const debouncedSearch = useDebounce(searchQuery, 300)
    const [addedItems, setAddedItems] = useState({})
    const [allMenus, setAllMenus] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchPopularMenus = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            let data = await merchantService.getAllMenus({ popular: true })

            // Fallback: If no popular menus, fetch all menus (newest first)
            if (data.length === 0) {
                data = await merchantService.getAllMenus()
            }

            setAllMenus(data)
        } catch (err) {
            setError(err.message || 'Gagal memuat menu populer')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchPopularMenus()
    }, [fetchPopularMenus])

    const filteredItems = debouncedSearch
        ? allMenus.filter(item =>
            item.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            item.merchantName.toLowerCase().includes(debouncedSearch.toLowerCase())
        )
        : allMenus

    const handleAddToCart = async (item) => {
        const merchant = await merchantService.getMerchantById(item.merchantId)
        setMerchantInfo(merchant)
        addToCart({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            merchantName: item.merchantName
        }, merchant)

        // Show added animation
        setAddedItems(prev => ({ ...prev, [item.id]: true }))
        setTimeout(() => {
            setAddedItems(prev => ({ ...prev, [item.id]: false }))
        }, 1000)
    }

    const formatPrice = (price) => {
        return `Rp ${price.toLocaleString()}`
    }

    const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

    if (loading) return <LoadingState message="Memuat menu populer..." />
    if (error) return <ErrorState message="Gagal Memuat Menu" detail={error} onRetry={fetchPopularMenus} />

    return (
        <div className="min-h-screen flex flex-col bg-background-light pb-bottom-nav">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-background-light/95 backdrop-blur-md px-4 pt-12 pb-4 flex items-center gap-3 border-b border-transparent">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-soft text-text-main active:scale-95 transition-transform"
                >
                    <span className="material-symbols-outlined">arrow_back_ios_new</span>
                </button>
                <h1 className="flex-1 text-center text-lg font-bold tracking-tight text-text-main">Menu Populer</h1>
                {/* Cart Button */}
                <button
                    onClick={() => navigate('/cart')}
                    className="relative w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center text-primary active:scale-95 transition-transform"
                >
                    <span className="material-symbols-outlined">shopping_cart</span>
                    {cartItemCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {cartItemCount > 9 ? '9+' : cartItemCount}
                        </span>
                    )}
                </button>
            </header>

            {/* Search Bar */}
            <div className="px-4 py-4 w-full sticky top-[88px] z-20 bg-background-light/95 backdrop-blur-md">
                <div className="relative flex items-center w-full h-12 rounded-lg focus-within:ring-2 focus-within:ring-primary/50 transition-shadow bg-white shadow-soft overflow-hidden border border-border-color">
                    <div className="grid place-items-center h-full w-12 text-text-secondary">
                        <span className="material-symbols-outlined">search</span>
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="peer h-full w-full outline-none bg-transparent text-sm text-text-main placeholder:text-text-secondary font-normal"
                        placeholder="Cari menu populer..."
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="w-10 h-full flex items-center justify-center text-text-secondary"
                        >
                            <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors">
                                <span className="material-symbols-outlined text-[14px]">close</span>
                            </div>
                        </button>
                    )}
                </div>
            </div>

            {/* Menu Grid */}
            <main className="flex flex-col gap-6 px-4">
                <div className="grid grid-cols-2 gap-4">
                    {filteredItems.map(item => (
                        <div
                            key={item.id}
                            className="bg-card-light rounded-xl shadow-soft border border-border-color overflow-hidden flex flex-col"
                        >
                            {/* Image */}
                            <div className="h-40 w-full bg-gray-200 relative">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    loading="lazy"
                                />
                            </div>

                            {/* Info */}
                            <div className="p-3 flex flex-col flex-1">
                                <h3 className="text-sm font-bold text-text-main">{item.name}</h3>
                                <p className="text-[10px] text-text-secondary mt-1">{item.merchantName}</p>
                                <div className="flex items-center justify-between mt-3 pt-1">
                                    <span className="text-sm font-bold text-primary">{formatPrice(item.price)}</span>
                                    <button
                                        onClick={() => handleAddToCart(item)}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all ${addedItems[item.id]
                                            ? 'bg-green-500 text-white'
                                            : 'bg-primary text-white'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-[20px] font-bold">
                                            {addedItems[item.id] ? 'check' : 'add'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredItems.length === 0 && (
                    <div className="flex flex-col items-center py-12">
                        <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">search_off</span>
                        <p className="text-text-secondary text-sm">Tidak ada menu yang ditemukan</p>
                    </div>
                )}

                <div className="h-8"></div>
            </main>

            {/* Bottom Navigation */}
            <BottomNavigation activeTab="home" />
        </div>
    )
}

export default AllPopularMenuPage
