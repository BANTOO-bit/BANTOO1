import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AdminSidebar({ isOpen, onClose }) {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [expandedGroups, setExpandedGroups] = useState({})
    const [showLogoutModal, setShowLogoutModal] = useState(false)

    const handleLogout = () => {
        setShowLogoutModal(true)
    }

    const confirmLogout = async () => {
        setShowLogoutModal(false)
        await logout()
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
                { icon: 'shopping_bag', label: 'Pesanan', path: '/admin/orders' },
                { icon: 'people', label: 'Pelanggan', path: '/admin/users' },
            ]
        },
        {
            heading: 'Keuangan',
            items: [
                { icon: 'payments', label: 'COD & Setoran', path: '/admin/cod' },
                { icon: 'trending_up', label: 'Pendapatan', path: '/admin/revenue' },
                { icon: 'account_balance', label: 'Penarikan Dana', path: '/admin/withdrawals' },
            ]
        },
        {
            heading: 'Sistem',
            items: [
                { icon: 'local_offer', label: 'Promo', path: '/admin/promos' },
                { icon: 'report_problem', label: 'Laporan & Masalah', path: '/admin/issues' },
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
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50
                flex flex-col w-[240px] h-screen bg-white dark:bg-[#1a2632] border-r border-[#e5e7eb] dark:border-[#2a3b4d]
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Brand */}
                <div className="h-14 flex items-center gap-2.5 px-4 border-b border-[#e5e7eb] dark:border-[#2a3b4d]">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-admin-primary/10 text-admin-primary">
                        <span className="material-symbols-outlined text-xl">local_shipping</span>
                    </div>
                    <div className="flex flex-col leading-none">
                        <h1 className="text-sm font-bold text-[#111418] dark:text-white">Panel Admin</h1>
                        <p className="text-[10px] text-[#617589] dark:text-[#94a3b8] font-medium mt-0.5">Pengiriman Regional</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5 overflow-y-auto">
                    {navSections.map((section, sIdx) => (
                        <div key={sIdx} className={sIdx > 0 ? 'mt-3' : ''}>
                            {section.heading && (
                                <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#617589]/60 dark:text-[#94a3b8]/50">
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
                                            className={({ isActive }) => `flex-1 flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg transition-colors group text-[13px] ${isActive
                                                ? 'bg-admin-primary/10 text-admin-primary font-semibold'
                                                : 'text-[#617589] dark:text-[#94a3b8] hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d] hover:text-[#111418] dark:hover:text-white font-medium'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <span className={`material-symbols-outlined text-[18px] ${item.icon === 'dashboard' ? 'filled' : ''}`}>
                                                    {item.icon}
                                                </span>
                                                <span>{item.label}</span>
                                            </div>
                                            {item.badge && (
                                                <span className={`flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-bold ${getBadgeStyles(item.badgeColor)}`}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </NavLink>
                                        {item.children && (
                                            <button
                                                onClick={() => toggleGroup(item.label)}
                                                className="p-1 mr-1 rounded-md text-[#617589] dark:text-[#94a3b8] hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d] transition-colors"
                                            >
                                                <span className={`material-symbols-outlined text-[14px] transition-transform duration-200 ${expandedGroups[item.label] ? 'rotate-180' : ''}`}>
                                                    expand_more
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                    {/* Sub-menu items */}
                                    {item.children && expandedGroups[item.label] && (
                                        <div className="ml-7 mt-0.5 flex flex-col gap-0.5">
                                            {item.children.map((child) => (
                                                <NavLink
                                                    key={child.path}
                                                    to={child.path}
                                                    onClick={onClose}
                                                    className={({ isActive }) => `flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors ${isActive
                                                        ? 'text-admin-primary bg-admin-primary/5 font-semibold'
                                                        : 'text-[#617589] dark:text-[#94a3b8] hover:text-[#111418] dark:hover:text-white hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d] font-medium'
                                                        }`}
                                                >
                                                    <span className="w-1 h-1 rounded-full bg-current opacity-50"></span>
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

                {/* User Footer */}
                <div className="px-3 py-3 border-t border-[#e5e7eb] dark:border-[#2a3b4d]">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                            {displayAvatar ? (
                                <div className="bg-center bg-no-repeat bg-cover rounded-full w-8 h-8 shrink-0"
                                    style={{ backgroundImage: `url("${displayAvatar}")` }}>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-admin-primary/10 text-admin-primary text-xs font-bold shrink-0">
                                    {displayInitials}
                                </div>
                            )}
                            <div className="flex flex-col overflow-hidden leading-none">
                                <p className="text-xs font-semibold text-[#111418] dark:text-white truncate">{displayName}</p>
                                <p className="text-[10px] text-[#617589] dark:text-[#94a3b8] truncate mt-0.5">Administrator</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-1.5 text-[#617589] dark:text-[#94a3b8] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                            title="Keluar"
                        >
                            <span className="material-symbols-outlined text-[18px]">logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#111418]/60 backdrop-blur-sm">
                    <div className="w-full max-w-[380px] bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-2xl">
                        <div className="p-6 flex flex-col items-center text-center">
                            <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-red-500 text-3xl">logout</span>
                            </div>
                            <h3 className="text-lg font-bold text-[#111418] dark:text-white mb-2">Keluar dari Panel Admin?</h3>
                            <p className="text-sm text-[#617589] dark:text-[#94a3b8] mb-6">
                                Anda akan keluar dari sesi admin. Pastikan semua perubahan sudah tersimpan.
                            </p>
                            <div className="grid grid-cols-2 gap-3 w-full">
                                <button
                                    onClick={() => setShowLogoutModal(false)}
                                    className="px-4 py-2.5 bg-[#f0f2f4] hover:bg-[#e5e7eb] dark:bg-[#2a3b4d] dark:hover:bg-[#344658] text-[#617589] dark:text-[#94a3b8] font-semibold rounded-lg transition-colors text-sm"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={confirmLogout}
                                    className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors text-sm"
                                >
                                    Ya, Keluar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
