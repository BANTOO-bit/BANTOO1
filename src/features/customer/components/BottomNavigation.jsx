import { memo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useOrder } from '@/context/OrderContext'

function BottomNavigation({ activeTab }) {
    const navigate = useNavigate()
    const location = useLocation()
    const { getActiveOrders } = useOrder()

    const activeOrderCount = getActiveOrders().length

    // Determine active tab from location if not provided
    const currentPath = location.pathname
    const effectiveActiveTab = activeTab || (
        currentPath === '/' ? 'home' :
            currentPath.includes('/search') ? 'search' :
                currentPath.includes('/orders') ? 'orders' :
                    currentPath.includes('/profile') ? 'profile' : 'home'
    )

    const navItems = [
        { id: 'home', icon: 'home', label: 'Beranda', path: '/' },
        { id: 'search', icon: 'search', label: 'Cari', path: '/search' },
        { id: 'orders', icon: 'receipt_long', label: 'Pesanan', path: '/orders', badge: activeOrderCount },
        { id: 'profile', icon: 'person', label: 'Profil', path: '/profile' },
    ]

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-card-dark border-t border-border-color dark:border-gray-800 pb-safe pt-2 z-50" role="navigation" aria-label="Navigasi utama">
            <div className="flex justify-around items-center h-16 pb-2">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => navigate(item.path)}
                        aria-label={item.label}
                        aria-current={effectiveActiveTab === item.id ? 'page' : undefined}
                        className={`relative flex flex-col items-center justify-center w-full h-full gap-1 transition-colors
                            ${effectiveActiveTab === item.id
                                ? 'text-primary'
                                : 'text-gray-500 hover:text-primary'
                            }`}
                    >
                        <span className="relative">
                            <span className={`material-symbols-outlined ${effectiveActiveTab === item.id ? 'fill' : ''}`} aria-hidden="true">{item.icon}</span>
                            {item.badge > 0 && (
                                <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-[16px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 animate-pulse">
                                    {item.badge > 9 ? '9+' : item.badge}
                                </span>
                            )}
                        </span>
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    )
}

export default memo(BottomNavigation)
