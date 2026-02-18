import { useNavigate, useLocation } from 'react-router-dom'

function MerchantBottomNavigation({ activeTab }) {
    const navigate = useNavigate()
    const location = useLocation()

    // Determine active tab from location if not provided
    const currentPath = location.pathname
    const effectiveActiveTab = activeTab || (
        currentPath.includes('/merchant/dashboard') ? 'home' :
            currentPath.includes('/merchant/menu') ? 'menu' :
                currentPath.includes('/merchant/orders') ? 'orders' :
                    currentPath.includes('/merchant/profile') ? 'profile' : 'home'
    )

    const navItems = [
        { id: 'home', icon: 'storefront', label: 'Beranda', path: '/merchant/dashboard' },
        { id: 'menu', icon: 'restaurant_menu', label: 'Menu', path: '/merchant/menu' },
        { id: 'orders', icon: 'receipt_long', label: 'Pesanan', path: '/merchant/orders' },
        { id: 'profile', icon: 'person', label: 'Profil', path: '/merchant/profile' },
    ]

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-card-dark pb-safe pt-2 z-50" role="navigation" aria-label="Navigasi merchant">
            <div className="flex justify-around items-center h-16 pb-2">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => navigate(item.path)}
                        aria-label={item.label}
                        aria-current={effectiveActiveTab === item.id ? 'page' : undefined}
                        className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors
              ${effectiveActiveTab === item.id
                                ? 'text-primary'
                                : 'text-text-secondary dark:text-gray-400 hover:text-primary'
                            }`}
                    >
                        <span className={`material-symbols-outlined ${effectiveActiveTab === item.id ? 'fill' : ''}`} aria-hidden="true">
                            {item.icon}
                        </span>
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    )
}

export default MerchantBottomNavigation
