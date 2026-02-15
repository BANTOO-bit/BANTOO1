import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationsContext'
import logoMerchant from '../../assets/logo-merchant.png'

function MerchantHeader() {
    const navigate = useNavigate()
    const { user, isShopOpen, toggleShopStatus } = useAuth()
    const { unreadCount } = useNotifications()

    return (
        <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 pt-12 pb-4 flex items-start justify-between border-b border-transparent dark:border-gray-800 transition-colors">
            <div className="flex flex-col">
                <div className="flex items-center gap-2 select-none mb-1">
                    <img src={logoMerchant} alt="Bantoo! Warung" className="h-8 w-auto object-contain" />
                </div>
                <div className="flex flex-col mt-2">
                    <span className="text-xs text-text-secondary font-medium">Halo,</span>
                    <h1 className="text-xl font-bold text-text-main dark:text-white leading-tight">{user?.merchantName || 'Nama Warung'}</h1>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate('/notifications')}
                    className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 shadow-sm active:scale-95 transition-transform"
                >
                    <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">notifications</span>
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-card-dark"></span>
                    )}
                </button>

                <button
                    onClick={toggleShopStatus}
                    className="flex items-center gap-2 bg-white dark:bg-card-dark px-3 py-1.5 rounded-full shadow-sm border border-border-color dark:border-gray-700 mt-1 active:scale-95 transition-transform"
                >
                    <div className={`relative w-8 h-4 rounded-full transition-colors ${isShopOpen ? 'bg-green-100 dark:bg-green-900/40' : 'bg-red-100 dark:bg-red-900/40'}`}>
                        <div className={`absolute top-0.5 w-3 h-3 rounded-full shadow-sm transition-all ${isShopOpen ? 'right-0.5 bg-green-500' : 'left-0.5 bg-red-500'}`}></div>
                    </div>
                    <span className={`text-xs font-semibold ${isShopOpen ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {isShopOpen ? 'Buka' : 'Tutup'}
                    </span>
                </button>
            </div>
        </header>
    )
}

export default MerchantHeader
