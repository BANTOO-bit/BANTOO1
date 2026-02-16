import { useNavigate, useLocation } from 'react-router-dom'

function DriverBottomNavigation({ activeTab }) {
    const navigate = useNavigate()
    const location = useLocation()

    // Determine active tab from location if not provided
    const currentPath = location.pathname
    const effectiveActiveTab = activeTab || (
        currentPath.includes('/driver/dashboard') ? 'home' :
            currentPath.includes('/driver/orders') ? 'orders' :
                currentPath.includes('/driver/earnings') ? 'earnings' :
                    (currentPath.includes('/driver/profile') || currentPath.includes('/driver/account')) ? 'profile' : 'home'
    )

    const navItems = [
        { id: 'home', icon: 'home', label: 'Beranda', path: '/driver/dashboard' },
        { id: 'orders', icon: 'assignment', label: 'Order', path: '/driver/orders' },
        { id: 'earnings', icon: 'account_balance_wallet', label: 'Pendapatan', path: '/driver/earnings' },
        { id: 'profile', icon: 'person', label: 'Akun', path: '/driver/account' },
    ]

    return (
        <nav className="fixed bottom-0 z-50 w-full max-w-md bg-white border-t border-slate-200 pb-safe">
            <div className="flex justify-around items-center h-16 px-2">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => navigate(item.path)}
                        className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors
                            ${effectiveActiveTab === item.id
                                ? 'text-[#0d59f2]'
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        <span className={`material-symbols-outlined text-[24px] ${effectiveActiveTab === item.id ? 'filled' : ''}`}>
                            {item.icon}
                        </span>
                        <span className="text-[10px] font-bold">{item.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    )
}

export default DriverBottomNavigation
