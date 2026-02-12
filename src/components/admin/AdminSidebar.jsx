import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AdminSidebar({ isOpen, onClose }) {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [expandedGroups, setExpandedGroups] = useState({})

    const handleLogout = () => {
        logout()
        navigate('/manage/auth')
    }

    const toggleGroup = (groupLabel) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupLabel]: !prev[groupLabel]
        }))
    }

    // Grouped navigation structure
    const navSections = [
        {
            items: [
                { icon: 'dashboard', label: 'Dashboard', path: '/admin/dashboard' },
            ]
        },
        {
            heading: 'Manajemen Mitra',
            items: [
                {
                    icon: 'storefront', label: 'Warung', path: '/admin/merchants',
                    children: [
                        { label: 'Verifikasi', path: '/admin/merchants/verification' },
                    ]
                },
                {
                    icon: 'two_wheeler', label: 'Driver', path: '/admin/drivers',
                    children: [
                        { label: 'Verifikasi', path: '/admin/drivers/verification' },
                    ]
                },
            ]
        },
        {
            heading: 'Operasional',
            items: [
                { icon: 'shopping_bag', label: 'Pesanan', path: '/admin/orders', badge: 2, badgeColor: 'blue' },
                { icon: 'people', label: 'Pelanggan', path: '/admin/users' },
            ]
        },
        {
            heading: 'Keuangan',
            items: [
                { icon: 'payments', label: 'COD & Setoran', path: '/admin/cod', badge: 4, badgeColor: 'amber' },
                { icon: 'trending_up', label: 'Pendapatan', path: '/admin/revenue' },
                { icon: 'account_balance', label: 'Penarikan Dana', path: '/admin/withdrawals' },
            ]
        },
        {
            heading: 'Sistem',
            items: [
                { icon: 'local_offer', label: 'Promo', path: '/admin/promos' },
                { icon: 'report_problem', label: 'Laporan & Masalah', path: '/admin/issues', badge: 3, badgeColor: 'red' },
                { icon: 'settings', label: 'Pengaturan', path: '/admin/settings' },
            ]
        },
    ]

    const getBadgeStyles = (color) => {
        const styles = {
            red: 'bg-red-500 text-white',
            amber: 'bg-amber-500 text-white',
            blue: 'bg-blue-500 text-white',
        }
        return styles[color] || 'bg-gray-500 text-white'
    }

    // Dynamic user info from auth context
    const displayName = user?.fullName || user?.full_name || 'Admin'
    const displayAvatar = user?.avatar_url || user?.avatarUrl || null
    const displayInitials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-30
                flex flex-col w-[250px] h-screen bg-white dark:bg-[#1a2632] border-r border-[#e5e7eb] dark:border-[#2a3b4d]
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-4 pb-3">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-admin-primary/10 text-admin-primary">
                            <span className="material-symbols-outlined text-2xl">local_shipping</span>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-base font-bold leading-tight text-[#111418] dark:text-white">Panel Admin</h1>
                            <p className="text-[#617589] dark:text-[#94a3b8] text-xs font-medium">Pengiriman Regional</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 pb-6 flex flex-col gap-1 overflow-y-auto">
                    {navSections.map((section, sIdx) => (
                        <div key={sIdx} className={sIdx > 0 ? 'mt-4' : ''}>
                            {section.heading && (
                                <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#617589]/60 dark:text-[#94a3b8]/50">
                                    {section.heading}
                                </p>
                            )}
                            {section.items.map((item) => (
                                <div key={item.path}>
                                    <div className="flex items-center">
                                        <NavLink
                                            to={item.path}
                                            end={!!item.children}
                                            onClick={onClose}
                                            className={({ isActive }) => `flex-1 flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-colors group ${isActive
                                                ? 'bg-admin-primary/10 text-admin-primary font-medium'
                                                : 'text-[#617589] dark:text-[#94a3b8] hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d] hover:text-[#111418] dark:hover:text-white'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={`material-symbols-outlined text-[20px] ${item.icon === 'dashboard' ? 'filled' : ''}`}>
                                                    {item.icon}
                                                </span>
                                                <span className="text-sm font-medium">{item.label}</span>
                                            </div>
                                            {item.badge && (
                                                <span className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold ${getBadgeStyles(item.badgeColor)}`}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </NavLink>
                                        {item.children && (
                                            <button
                                                onClick={() => toggleGroup(item.label)}
                                                className="p-1.5 mr-1 rounded-md text-[#617589] dark:text-[#94a3b8] hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d] transition-colors"
                                            >
                                                <span className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${expandedGroups[item.label] ? 'rotate-180' : ''}`}>
                                                    expand_more
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                    {/* Sub-menu items */}
                                    {item.children && expandedGroups[item.label] && (
                                        <div className="ml-8 mt-0.5 flex flex-col gap-0.5">
                                            {item.children.map((child) => (
                                                <NavLink
                                                    key={child.path}
                                                    to={child.path}
                                                    onClick={onClose}
                                                    className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors ${isActive
                                                        ? 'text-admin-primary bg-admin-primary/5'
                                                        : 'text-[#617589] dark:text-[#94a3b8] hover:text-[#111418] dark:hover:text-white hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d]'
                                                        }`}
                                                >
                                                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></span>
                                                    {child.label}
                                                </NavLink>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </nav>

                <div className="p-4 border-t border-[#e5e7eb] dark:border-[#2a3b4d]">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 overflow-hidden">
                            {displayAvatar ? (
                                <div className="bg-center bg-no-repeat bg-cover rounded-full size-10 shrink-0"
                                    style={{ backgroundImage: `url("${displayAvatar}")` }}>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center size-10 rounded-full bg-admin-primary/10 text-admin-primary text-sm font-bold shrink-0">
                                    {displayInitials}
                                </div>
                            )}
                            <div className="flex flex-col overflow-hidden">
                                <p className="text-sm font-medium text-[#111418] dark:text-white truncate">{displayName}</p>
                                <p className="text-xs text-[#617589] dark:text-[#94a3b8] truncate">Administrator</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-[#617589] dark:text-[#94a3b8] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                            title="Keluar"
                        >
                            <span className="material-symbols-outlined text-[20px]">logout</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    )
}
