import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useNotifications } from '../../context/NotificationsContext'
import logo from '../../assets/logo.png'

function Header() {
    const navigate = useNavigate()
    const { cartCount } = useCart()
    const { unreadCount } = useNotifications()

    return (
        <header className="sticky top-0 z-20 bg-background-light/95 backdrop-blur-md px-4 pt-12 pb-2 flex items-center justify-between border-b border-transparent transition-colors">
            <img src={logo} alt="Bantoo!" className="h-8 w-auto object-contain" />
            <div className="flex items-center gap-2">
                {/* Notifications */}
                <button
                    aria-label="Notifications"
                    onClick={() => navigate('/notifications')}
                    className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-soft text-text-secondary hover:bg-gray-50 transition-colors"
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>notifications</span>
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>

                {/* Favorites */}
                <button
                    aria-label="Favorites"
                    onClick={() => navigate('/favorites')}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-soft text-text-secondary hover:bg-gray-50 transition-colors"
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>favorite</span>
                </button>

                {/* Cart */}
                <button
                    aria-label="Cart"
                    onClick={() => navigate('/cart')}
                    className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-soft text-primary hover:bg-gray-50 transition-colors"
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>shopping_cart</span>
                    {cartCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                            {cartCount > 9 ? '9+' : cartCount}
                        </span>
                    )}
                </button>
            </div>
        </header>
    )
}

export default Header
