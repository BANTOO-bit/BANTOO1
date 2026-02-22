import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useSWR from 'swr'
import merchantService from '../../../services/merchantService'
import { useFavorites } from '../../../context/FavoritesContext'
import { useCart } from '../../../context/CartContext'
import BottomNavigation from '../../../components/user/BottomNavigation'
import LoadingState from '../../../components/shared/LoadingState'
import ErrorState from '../../../components/shared/ErrorState'
import EmptyState from '../../../components/shared/EmptyState'
import { supabase } from '../../../services/supabaseClient'

const filters = [
    { id: 'all', label: 'Semua', active: true },
    { id: 'rating', label: 'Rating 4.5+', icon: 'star', active: false },
    { id: 'promo', label: 'Promo', active: false },
    { id: 'popular', label: 'Terpopuler', active: false },
    { id: 'free', label: 'Gratis Ongkir', active: false },
]

function AllMerchantsPage() {
    const navigate = useNavigate()
    const [activeFilter, setActiveFilter] = useState('all')
    const { isFavorite, toggleFavorite } = useFavorites()
    const { cartItems } = useCart()

    const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

    const { data: fetchedMerchants = [], error, isLoading, mutate } = useSWR(
        'all_merchants_list',
        () => merchantService.getMerchants({ limit: 50 }),
        { revalidateOnFocus: false }
    )

    useEffect(() => {
        // Set up Supabase Realtime subscription
        const subscription = supabase
            .channel('merchant_updates_all')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'merchants'
                },
                (payload) => {
                    mutate(currentList => {
                        if (!currentList) return []
                        return currentList.map(m =>
                            m.id === payload.new.id ? { ...m, ...payload.new } : m
                        )
                    }, false)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(subscription)
        }
    }, [mutate])

    const handleFilterClick = (filterId) => {
        setActiveFilter(filterId)
    }

    const handleFavoriteClick = (e, merchant) => {
        e.stopPropagation()
        toggleFavorite(merchant)
    }

    const merchants = (() => {
        switch (activeFilter) {
            case 'rating':
                return fetchedMerchants.filter(m => m.rating >= 4.5)
            case 'promo':
                return fetchedMerchants.filter(m => m.hasPromo || m.has_promo)
            case 'popular':
                return [...fetchedMerchants].sort((a, b) => b.rating - a.rating)
            case 'free':
                return fetchedMerchants.filter(m => m.deliveryFee === 'Gratis' || m.delivery_fee === 0)
            default:
                return fetchedMerchants
        }
    })()

    if (isLoading) {
        return <LoadingState message="Memuat merchant..." />
    }

    if (error) {
        return <ErrorState message="Gagal Memuat Merchant" detail={error} onRetry={() => mutate()} />
    }

    return (
        <div className="min-h-screen flex flex-col bg-background-light pb-bottom-nav">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-background-light/95 backdrop-blur-md px-4 pt-12 pb-4 flex items-center justify-between border-b border-border-color">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-soft text-text-main active:scale-95 transition-transform"
                >
                    <span className="material-symbols-outlined">arrow_back_ios_new</span>
                </button>
                <h1 className="text-text-main text-lg font-bold">Semua Merchant</h1>
                {/* Cart Button */}
                <button
                    onClick={() => navigate('/cart')}
                    className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-soft text-primary active:scale-95 transition-transform"
                >
                    <span className="material-symbols-outlined">shopping_cart</span>
                    {cartItemCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {cartItemCount > 99 ? '99+' : cartItemCount}
                        </span>
                    )}
                </button>
            </header>

            {/* Filter Pills */}
            <div className="sticky top-[108px] z-10 bg-background-light/95 backdrop-blur-md pb-4 pt-4 border-b border-border-color">
                <div className="flex overflow-x-auto gap-2 px-4 no-scrollbar">
                    {filters.map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => handleFilterClick(filter.id)}
                            className={`flex-none px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-1 transition-all ${activeFilter === filter.id
                                ? 'bg-primary text-white'
                                : 'bg-white border border-border-color text-text-main'
                                }`}
                        >
                            {filter.icon && (
                                <span className={`material-symbols-outlined text-[18px] ${activeFilter === filter.id ? '' : 'text-yellow-500'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                                    {filter.icon}
                                </span>
                            )}
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Merchant List */}
            <main className="flex flex-col gap-3 px-4 py-6">
                {merchants.map(merchant => {
                    const isFav = isFavorite(merchant.id)
                    return (
                        <article
                            key={merchant.id}
                            onClick={() => navigate(`/merchant/${merchant.id}`)}
                            className={`flex items-start p-3 gap-3 rounded-xl bg-card-light shadow-soft border border-border-color active:bg-gray-50 transition-colors cursor-pointer ${!merchant.is_open ? 'opacity-80' : ''}`}
                        >
                            {/* Merchant Image */}
                            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                <img
                                    src={merchant.image}
                                    alt={merchant.name}
                                    className="w-full h-full object-cover"
                                    style={!merchant.is_open ? { filter: 'grayscale(100%) blur(1px)' } : {}}
                                    loading="lazy"
                                />
                            </div>

                            {/* Merchant Info */}
                            <div className="flex flex-col flex-1 justify-center gap-1 mt-1">
                                <div className="flex items-start justify-between gap-1">
                                    <h3 className="text-base font-semibold text-text-main leading-tight line-clamp-2">{merchant.name}</h3>
                                    {!merchant.is_open && (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200 shrink-0">
                                            Tutup
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px] text-yellow-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                    <span className="text-xs font-medium text-text-main">{merchant.rating}</span>
                                    <span className="text-xs text-text-secondary mx-1">•</span>
                                    <span className="text-xs text-text-secondary">{merchant.category}</span>
                                </div>
                                <div className="flex items-center gap-4 mt-1">
                                    <div className="flex items-center gap-1 text-text-secondary">
                                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                                        <span className="text-xs">{merchant.deliveryTime || merchant.delivery_time}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-text-secondary">
                                        <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                                        <span className="text-xs">{merchant.deliveryFee || merchant.delivery_fee}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Promo Badge & Favorite Button */}
                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                {(merchant.hasPromo || merchant.has_promo) && (
                                    <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                                        PROMO
                                    </div>
                                )}
                                {/* Favorite Button */}
                                <button
                                    onClick={(e) => handleFavoriteClick(e, merchant)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 active:scale-95 transition-all"
                                >
                                    <span
                                        className={`material-symbols-outlined text-[22px] ${isFav ? 'text-red-500' : 'text-gray-300'}`}
                                        style={{ fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0" }}
                                    >
                                        favorite
                                    </span>
                                </button>
                            </div>
                        </article>
                    )
                })}

                {/* Empty State */}
                {merchants.length === 0 && (
                    <EmptyState
                        icon="store"
                        title="Tidak ada merchant"
                        message="Tidak ada merchant yang sesuai dengan filter yang dipilih."
                        actionLabel="Reset Filter"
                        onAction={() => handleFilterClick('all')}
                    />
                )}
            </main>

            {/* Bottom Navigation */}
            <BottomNavigation activeTab="home" />
        </div>
    )
}

export default AllMerchantsPage
