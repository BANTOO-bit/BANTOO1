import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminBreadcrumb from './AdminBreadcrumb'
import { useAuth } from '../../context/AuthContext'
import notificationService from '../../services/notificationService'
import { supabase } from '../../services/supabaseClient'

// Map notification type to icon + color
const getNotifStyle = (type) => {
    const map = {
        order: { icon: 'shopping_bag', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
        driver: { icon: 'two_wheeler', bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400' },
        merchant: { icon: 'storefront', bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' },
        withdrawal: { icon: 'payments', bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
        warning: { icon: 'warning', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' },
        system: { icon: 'info', bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400' },
    }
    return map[type] || map.system
}

// Relative time helper
const timeAgo = (dateStr) => {
    if (!dateStr) return ''
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
    if (diff < 60) return 'Baru saja'
    if (diff < 3600) return `${Math.floor(diff / 60)} menit yang lalu`
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam yang lalu`
    return `${Math.floor(diff / 86400)} hari yang lalu`
}

export default function AdminHeader({ onMenuClick, title = "Ringkasan Dashboard", showBack, onBackClick, breadcrumb }) {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const notificationRef = useRef(null)

    // Global Search
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [isSearching, setIsSearching] = useState(false)
    const [showSearchResults, setShowSearchResults] = useState(false)
    const searchRef = useRef(null)
    const searchTimerRef = useRef(null)

    // Fetch notifications from Supabase
    useEffect(() => {
        let unsubscribe = () => { }

        async function loadNotifications() {
            try {
                const data = await notificationService.getNotifications(10)
                setNotifications(data || [])
                const count = await notificationService.getUnreadCount()
                setUnreadCount(count)
            } catch (err) {
                console.error('Failed to load notifications:', err)
            }
        }

        loadNotifications()

        if (user?.id) {
            unsubscribe = notificationService.subscribeToNotifications(user.id, (newNotif) => {
                setNotifications(prev => [newNotif, ...prev].slice(0, 10))
                setUnreadCount(prev => prev + 1)
            })
        }

        return () => unsubscribe()
    }, [user?.id])

    // Debounced global search
    useEffect(() => {
        if (!searchQuery || searchQuery.length < 2) {
            setSearchResults([])
            setShowSearchResults(false)
            return
        }

        clearTimeout(searchTimerRef.current)
        searchTimerRef.current = setTimeout(async () => {
            setIsSearching(true)
            try {
                const q = `%${searchQuery}%`
                const [merchants, drivers] = await Promise.all([
                    supabase.from('merchants').select('id, name, status').ilike('name', q).limit(4),
                    supabase.from('drivers').select('id, profiles!drivers_user_id_fkey(full_name)').limit(10)
                ])

                const results = []
                if (merchants.data?.length) {
                    merchants.data.forEach(m => results.push({ type: 'Warung', icon: 'storefront', label: m.name, sub: m.status === 'approved' ? 'Aktif' : m.status, path: `/admin/merchants/${m.id}` }))
                }
                if (drivers.data?.length) {
                    const dq = searchQuery.toLowerCase()
                    drivers.data.filter(d => d.profiles?.full_name?.toLowerCase().includes(dq))
                        .slice(0, 4)
                        .forEach(d => results.push({ type: 'Driver', icon: 'two_wheeler', label: d.profiles?.full_name || 'Driver', sub: 'Driver', path: `/admin/drivers/${d.id}` }))
                }

                setSearchResults(results)
                setShowSearchResults(true)
            } catch (err) {
                console.error('Search error:', err)
            } finally {
                setIsSearching(false)
            }
        }, 400)

        return () => clearTimeout(searchTimerRef.current)
    }, [searchQuery])

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead()
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
            setUnreadCount(0)
        } catch (err) {
            console.error('Failed to mark all as read:', err)
        }
    }

    // Close dropdowns on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) setIsNotificationOpen(false)
            if (searchRef.current && !searchRef.current.contains(event.target)) setShowSearchResults(false)
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleSearchSelect = (result) => {
        setShowSearchResults(false)
        setSearchQuery('')
        navigate(result.path)
    }

    return (
        <header className="sticky top-0 z-20 flex items-center justify-between h-14 px-4 lg:px-6 bg-white dark:bg-[#1a2632] border-b border-[#e5e7eb] dark:border-[#2a3b4d]">
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-1.5 -ml-1 text-[#617589] hover:bg-[#f0f2f4] rounded-lg"
                >
                    <span className="material-symbols-outlined text-xl">menu</span>
                </button>
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        {showBack && (
                            <button
                                onClick={onBackClick}
                                className="p-1 text-[#617589] dark:text-[#94a3b8] hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d] rounded-full transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">arrow_back</span>
                            </button>
                        )}
                        <h2 className="text-base font-bold text-[#111418] dark:text-white tracking-tight">{title}</h2>
                    </div>
                    {breadcrumb && <AdminBreadcrumb items={breadcrumb} />}
                </div>
            </div>

            <div className="flex items-center gap-2">
                {/* Global Search */}
                <div className="hidden md:flex relative w-56" ref={searchRef}>
                    <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-[#617589]">
                        {isSearching
                            ? <span className="material-symbols-outlined text-lg animate-spin">sync</span>
                            : <span className="material-symbols-outlined text-lg">search</span>
                        }
                    </div>
                    <input
                        className="block w-full pl-9 pr-3 py-1.5 border-none rounded-lg bg-[#f0f2f4] dark:bg-[#2a3b4d] text-[#111418] dark:text-white placeholder-[#617589] focus:ring-2 focus:ring-primary text-xs outline-none transition-all"
                        placeholder="Cari warung, driver..."
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                    />

                    {/* Search Results Dropdown */}
                    {showSearchResults && (
                        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl shadow-lg overflow-hidden z-50">
                            {searchResults.length === 0 ? (
                                <div className="p-4 text-center text-xs text-[#617589]">Tidak ditemukan</div>
                            ) : (
                                <div className="max-h-[280px] overflow-y-auto divide-y divide-[#e5e7eb] dark:divide-[#2a3b4d]">
                                    {searchResults.map((r, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSearchSelect(r)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#f9fafb] dark:hover:bg-[#2a3b4d]/50 transition-colors text-left"
                                        >
                                            <div className="w-7 h-7 rounded-lg bg-[#f0f2f4] dark:bg-[#2a3b4d] flex items-center justify-center text-[#617589]">
                                                <span className="material-symbols-outlined text-sm">{r.icon}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-[#111418] dark:text-white truncate">{r.label}</p>
                                                <p className="text-[10px] text-[#617589] capitalize">{r.type} • {r.sub}</p>
                                            </div>
                                            <span className="material-symbols-outlined text-[#94a3b8] text-sm">arrow_forward</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                    <button
                        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                        className="relative p-1.5 text-[#617589] dark:text-[#94a3b8] hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d] rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">notifications</span>
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#1a2632]"></span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {isNotificationOpen && (
                        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-lg overflow-hidden z-50">
                            <div className="px-4 py-3 border-b border-[#e5e7eb] dark:border-[#2a3b4d] flex items-center justify-between">
                                <h3 className="font-semibold text-sm text-[#111418] dark:text-white">Notifikasi</h3>
                                {unreadCount > 0 && (
                                    <button onClick={handleMarkAllRead} className="text-xs text-primary hover:underline">Tandai semua dibaca</button>
                                )}
                            </div>
                            <div className="max-h-[360px] overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-6 text-center">
                                        <span className="material-symbols-outlined text-3xl text-[#94a3b8] mb-2">notifications_off</span>
                                        <p className="text-sm text-[#617589] dark:text-[#94a3b8]">Belum ada notifikasi</p>
                                    </div>
                                ) : (
                                    notifications.map((notif, idx) => {
                                        const style = getNotifStyle(notif.type)
                                        return (
                                            <div key={notif.id || idx} className={`p-3 ${idx < notifications.length - 1 ? 'border-b border-[#e5e7eb] dark:border-[#2a3b4d]' : ''} hover:bg-[#f9fafb] dark:hover:bg-[#2a3b4d]/30 transition-colors cursor-pointer`}>
                                                <div className="flex gap-2.5">
                                                    <div className={`w-8 h-8 rounded-full ${style.bg} ${style.text} flex items-center justify-center flex-shrink-0`}>
                                                        <span className="material-symbols-outlined text-base">{style.icon}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs font-medium text-[#111418] dark:text-white mb-0.5">{notif.title || 'Notifikasi'}</p>
                                                        <p className="text-[11px] text-[#617589] dark:text-[#94a3b8] leading-relaxed">{notif.message || notif.body || ''}</p>
                                                        <p className="text-[10px] text-[#94a3b8] mt-1">{timeAgo(notif.created_at)}</p>
                                                    </div>
                                                    {!notif.is_read && (
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shrink-0"></div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                            {notifications.length > 0 && (
                                <div className="p-2.5 bg-[#f9fafb] dark:bg-[#2a3b4d]/50 text-center border-t border-[#e5e7eb] dark:border-[#2a3b4d]">
                                    <button onClick={() => navigate('/admin/notifications')} className="text-xs font-medium text-primary hover:underline">Lihat Semua Notifikasi</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
