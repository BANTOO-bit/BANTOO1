import { memo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

function BottomNavigation({ activeTab }) {
    const navigate = useNavigate()
    const location = useLocation()

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
        { id: 'orders', icon: 'receipt_long', label: 'Pesanan', path: '/orders' },
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
                        className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors
                            ${effectiveActiveTab === item.id
                                ? 'text-primary'
                                : 'text-text-secondary dark:text-gray-400 hover:text-primary'
                            }`}
                    >
                        <span className={`material-symbols-outlined ${effectiveActiveTab === item.id ? 'fill' : ''}`} aria-hidden="true">{item.icon}</span>
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    )
}

export default memo(BottomNavigation)
