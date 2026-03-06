import { useNavigate } from 'react-router-dom'
import { useCart } from '@/context/CartContext'
import { useNotifications } from '@/context/NotificationsContext'
import { useAuth } from '@/context/AuthContext'
import logo from '@/assets/logo.png'

function getGreeting() {
    const hour = new Date().getHours()
    if (hour >= 4 && hour < 11) return 'Selamat Pagi'
    if (hour >= 11 && hour < 15) return 'Selamat Siang'
    if (hour >= 15 && hour < 18) return 'Selamat Sore'
    return 'Selamat Malam'
}

function Header() {
    const navigate = useNavigate()
    const { cartCount } = useCart()
    const { unreadCount } = useNotifications()
    const { user } = useAuth()

    const firstName = user?.name?.split(' ')[0] || user?.full_name?.split(' ')[0] || ''
    const greeting = getGreeting()

    return (
        <header className="sticky top-0 z-20 bg-white px-4 pt-12 pb-3">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                    <img src={logo} alt="Bantoo!" className="h-7 w-auto object-contain" />
                    {firstName && (
                        <p className="text-[13px] text-text-secondary mt-1">
                            {greeting}, <span className="font-semibold text-text-main">{firstName}</span> 👋
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-1.5">
                    {/* Notifications */}
                    <button
                        aria-label="Notifications"
                        onClick={() => navigate('/notifications')}
                        className="relative flex items-center justify-center w-9 h-9 rounded-full bg-gray-50 text-text-secondary hover:bg-gray-100 transition-colors"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>notifications</span>
                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Favorites */}
                    <button
                        aria-label="Favorites"
                        onClick={() => navigate('/favorites')}
                        className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-50 text-text-secondary hover:bg-gray-100 transition-colors"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>favorite</span>
                    </button>

                    {/* Cart */}
                    <button
                        aria-label="Cart"
                        onClick={() => navigate('/cart')}
                        className="relative flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary hover:bg-primary/15 transition-colors"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>shopping_cart</span>
                        {cartCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                                {cartCount > 9 ? '9+' : cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Header
