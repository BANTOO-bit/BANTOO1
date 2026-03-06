import { useNavigate } from 'react-router-dom'
import { useCart } from '@/context/CartContext'
import useSWR from 'swr'
import merchantService from '@/services/merchantService'
import Skeleton, { MenuCardSkeleton } from '@/features/shared/components/Skeleton'

function MenuCard({ item }) {
    const navigate = useNavigate()
    const { addToCart, getItemQuantity, updateQuantity } = useCart()
    const quantity = getItemQuantity(item.id)

    // Construct merchant object from item data
    const merchant = {
        id: item.merchantId,
        name: item.merchantName,
        image: item.merchantImage
    }

    const handleAdd = (e) => {
        e.stopPropagation()
        addToCart({
            ...item,
            merchantName: item.merchantName
        }, merchant)
    }

    const handleDecrease = (e) => {
        e.stopPropagation()
        if (quantity > 0) {
            updateQuantity(item.id, quantity - 1)
        }
    }

    const handleCardClick = () => {
        if (item.merchantId) {
            navigate(`/merchant/${item.merchantId}`)
        }
    }

    return (
        <div
            onClick={handleCardClick}
            className="flex-none w-[185px] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col transition-transform active:scale-[0.98] cursor-pointer"
        >
            <div className="h-32 w-full p-2 relative">
                <div
                    className="absolute inset-2 rounded-xl bg-cover bg-center overflow-hidden bg-gray-100"
                    style={{ backgroundImage: `url('${item.image}')` }}
                />
            </div>
            <div className="p-3 pt-1 flex flex-col flex-1">
                <h3 className="text-[15px] font-bold text-gray-900 leading-tight truncate">{item.name}</h3>
                <p className="text-[11px] font-medium text-gray-500 truncate mt-1">{item.merchantName || 'Warung'}</p>
                <div className="flex items-center justify-between mt-auto pt-3">
                    <span className="text-sm font-extrabold text-primary whitespace-nowrap mr-1">
                        Rp {item.price.toLocaleString('id-ID')}
                    </span>
                    {quantity === 0 ? (
                        <button
                            onClick={handleAdd}
                            className="w-8 h-8 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center active:scale-90 transition-all shrink-0"
                        >
                            <span className="material-symbols-outlined text-[18px] font-bold">add</span>
                        </button>
                    ) : (
                        <div className="flex items-center gap-1 shrink-0 bg-gray-50 rounded-xl p-0.5 border border-gray-100">
                            <button
                                onClick={handleDecrease}
                                className="w-7 h-7 rounded-lg bg-white shadow-sm text-gray-600 flex items-center justify-center active:scale-90 transition-transform"
                            >
                                <span className="material-symbols-outlined text-[16px]">remove</span>
                            </button>
                            <span className="text-xs font-bold w-5 text-center text-gray-900">{quantity}</span>
                            <button
                                onClick={handleAdd}
                                className="w-7 h-7 rounded-lg bg-primary shadow-sm text-white flex items-center justify-center active:scale-90 transition-transform"
                            >
                                <span className="material-symbols-outlined text-[16px]">add</span>
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

    const fetcher = async () => {
        let data = await merchantService.getPopularMenus(10)
        if (!data || data.length === 0) {
            data = await merchantService.getAllMenus()
            data = data.slice(0, 10)
        }
        return data
    }

    const { data: popularMenus = [], isLoading } = useSWR(
        'popular_menus',
        fetcher
    )

    if (isLoading) {
        return (
            <section className="mt-2">
                <div className="flex justify-between items-center mb-3">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex gap-4 overflow-hidden -mx-4 px-4 pb-4">
                    {[1, 2, 3].map(i => (
                        <MenuCardSkeleton key={i} />
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
        <section>
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-[15px] font-bold text-text-main">Rekomendasi Untukmu</h2>
                <button
                    onClick={() => navigate('/popular-menu')}
                    className="text-sm text-primary font-medium hover:text-primary/80"
                >
                    Lihat Semua
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
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
