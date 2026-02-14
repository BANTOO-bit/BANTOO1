import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import merchantService from '../../services/merchantService'

function MenuCard({ item }) {
    const { addToCart, getItemQuantity, updateQuantity } = useCart()
    const quantity = getItemQuantity(item.id)

    // Construct merchant object from item data
    const merchant = {
        id: item.merchantId,
        name: item.merchantName,
        image: item.merchantImage
    }

    const handleAdd = () => {
        // No merchant restriction - just add to cart
        addToCart({
            ...item,
            merchantName: item.merchantName
        }, merchant)
    }

    const handleDecrease = () => {
        if (quantity > 0) {
            updateQuantity(item.id, quantity - 1)
        }
    }

    return (
        <div className="flex-none w-[160px] bg-card-light rounded-xl shadow-soft border border-border-color overflow-hidden flex flex-col">
            <div className="h-32 w-full bg-gray-200 relative">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${item.image}')` }}
                />
            </div>
            <div className="p-3 flex flex-col flex-1">
                <h3 className="text-sm font-semibold text-text-main truncate">{item.name}</h3>
                <p className="text-[10px] text-text-secondary truncate mt-0.5">{item.merchantName}</p>
                <div className="flex items-center justify-between mt-auto pt-2">
                    <span className="text-sm font-bold text-primary">
                        Rp {item.price.toLocaleString().replace(',', '.')}
                    </span>
                    {quantity === 0 ? (
                        <button
                            onClick={handleAdd}
                            className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
                        >
                            <span className="material-symbols-outlined text-[16px] font-bold">add</span>
                        </button>
                    ) : (
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleDecrease}
                                className="w-6 h-6 rounded-full bg-gray-100 text-text-main flex items-center justify-center active:scale-95 transition-transform"
                            >
                                <span className="material-symbols-outlined text-[14px]">remove</span>
                            </button>
                            <span className="text-xs font-bold w-4 text-center">{quantity}</span>
                            <button
                                onClick={handleAdd}
                                className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center active:scale-95 transition-transform"
                            >
                                <span className="material-symbols-outlined text-[14px]">add</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function MenuPopuler() {
    const navigate = useNavigate()
    const [popularMenus, setPopularMenus] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchPopularMenus() {
            try {
                // Try fetching popular menus first
                let data = await merchantService.getPopularMenus(10)

                // Fallback: If no popular menus, fetch latest menus
                if (data.length === 0) {
                    data = await merchantService.getAllMenus()
                    data = data.slice(0, 10)
                }

                setPopularMenus(data)
            } catch (error) {
                console.error('Failed to fetch popular menus:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchPopularMenus()
    }, [])

    if (isLoading) {
        return (
            <section>
                <div className="flex justify-between items-center mb-3">
                    <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex-none w-[160px] h-[220px] bg-gray-100 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            </section>
        )
    }

    if (popularMenus.length === 0) {
        return (
            <section className="py-4 text-center">
                <p className="text-sm text-gray-500">Belum ada menu populer saat ini.</p>
            </section>
        )
    }

    return (
        <section className="mt-2">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold text-text-main">Rekomendasi Untukmu</h2>
                <button
                    onClick={() => navigate('/popular-menu')}
                    className="text-sm text-primary font-medium hover:text-primary/80"
                >
                    Lihat Semua
                </button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar">
                {popularMenus.map(item => (
                    <MenuCard key={item.id} item={item} />
                ))}
            </div>
        </section>
    )
}

export default MenuPopuler
