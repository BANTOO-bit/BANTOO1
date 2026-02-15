import { useNavigate } from 'react-router-dom'

/**
 * EmptyOrders - Specialized empty state for order lists
 * Shows when user has no orders
 */
export function EmptyOrders({ onAction }) {
    const navigate = useNavigate()

    const handleAction = () => {
        if (onAction) {
            onAction()
        } else {
            navigate('/')
        }
    }

    return (
        <div className="flex flex-col items-center justify-center text-center py-16 px-6">
            <div className="w-24 h-24 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-rounded text-5xl text-primary dark:text-primary-light">
                    shopping_bag
                </span>
            </div>
            <h3 className="text-xl font-bold text-text-main dark:text-white mb-2">
                Belum Ada Pesanan
            </h3>
            <p className="text-sm text-text-secondary dark:text-gray-400 max-w-sm mb-8 leading-relaxed">
                Yuk mulai pesan makanan favoritmu! Ribuan pilihan menu menanti untuk dipesan.
            </p>
            <button
                onClick={handleAction}
                className="px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold active:scale-95 transition-all flex items-center gap-2"
            >
                <span className="material-symbols-outlined text-[20px]">restaurant</span>
                <span>Mulai Belanja</span>
            </button>
        </div>
    )
}

/**
 * EmptyFavorites - Specialized empty state for favorites
 * Shows when user has no favorite merchants
 */
export function EmptyFavorites({ onAction }) {
    const navigate = useNavigate()

    const handleAction = () => {
        if (onAction) {
            onAction()
        } else {
            navigate('/merchants')
        }
    }

    return (
        <div className="flex flex-col items-center justify-center text-center py-16 px-6">
            <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-rounded text-5xl text-red-500 dark:text-red-400">
                    favorite
                </span>
            </div>
            <h3 className="text-xl font-bold text-text-main dark:text-white mb-2">
                Favorit Masih Kosong
            </h3>
            <p className="text-sm text-text-secondary dark:text-gray-400 max-w-sm mb-8 leading-relaxed">
                Tandai merchant favoritmu dengan menekan ikon ❤️ untuk akses cepat di sini.
            </p>
            <button
                onClick={handleAction}
                className="px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold active:scale-95 transition-all flex items-center gap-2"
            >
                <span className="material-symbols-outlined text-[20px]">explore</span>
                <span>Jelajahi Merchant</span>
            </button>
        </div>
    )
}

/**
 * EmptySearch - Specialized empty state for search results
 * Shows when search returns no results
 */
export function EmptySearch({ query = '', onClear, onBrowseAll }) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-16 px-6">
            <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-rounded text-5xl text-blue-500 dark:text-blue-400">
                    search_off
                </span>
            </div>
            <h3 className="text-xl font-bold text-text-main dark:text-white mb-2">
                Tidak Ditemukan
            </h3>
            <p className="text-sm text-text-secondary dark:text-gray-400 max-w-sm mb-2 leading-relaxed">
                {query ? (
                    <>Pencarian untuk <span className="font-semibold">"{query}"</span> tidak ditemukan.</>
                ) : (
                    'Tidak ada hasil yang sesuai dengan filter Anda.'
                )}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-8">
                Coba kata kunci lain atau hapus filter
            </p>
            <div className="flex gap-3">
                {onClear && (
                    <button
                        onClick={onClear}
                        className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 text-text-main dark:text-white rounded-xl font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 transition-all"
                    >
                        Hapus Filter
                    </button>
                )}
                {onBrowseAll && (
                    <button
                        onClick={onBrowseAll}
                        className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold text-sm active:scale-95 transition-all"
                    >
                        Lihat Semua
                    </button>
                )}
            </div>
        </div>
    )
}

/**
 * EmptyNotifications - Specialized empty state for notifications
 * Shows when user has no notifications
 */
export function EmptyNotifications() {
    return (
        <div className="flex flex-col items-center justify-center text-center py-16 px-6">
            <div className="w-24 h-24 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-rounded text-5xl text-green-500 dark:text-green-400">
                    notifications_off
                </span>
            </div>
            <h3 className="text-xl font-bold text-text-main dark:text-white mb-2">
                Semua Sudah Dibaca
            </h3>
            <p className="text-sm text-text-secondary dark:text-gray-400 max-w-sm leading-relaxed">
                Kamu sudah up to date! Notifikasi baru akan muncul di sini.
            </p>
        </div>
    )
}

/**
 * EmptyCart - Specialized empty state for shopping cart
 * Shows when cart is empty
 */
export function EmptyCart({ onAction }) {
    const navigate = useNavigate()

    const handleAction = () => {
        if (onAction) {
            onAction()
        } else {
            navigate('/')
        }
    }

    return (
        <div className="flex flex-col items-center justify-center text-center py-16 px-6">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-rounded text-5xl text-gray-400 dark:text-gray-500">
                    shopping_cart
                </span>
            </div>
            <h3 className="text-xl font-bold text-text-main dark:text-white mb-2">
                Keranjang Kosong
            </h3>
            <p className="text-sm text-text-secondary dark:text-gray-400 max-w-sm mb-8 leading-relaxed">
                Belum ada item di keranjang. Yuk tambahkan menu favoritmu!
            </p>
            <button
                onClick={handleAction}
                className="px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold active:scale-95 transition-all flex items-center gap-2"
            >
                <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
                <span>Mulai Belanja</span>
            </button>
        </div>
    )
}
