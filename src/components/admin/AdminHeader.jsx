import { useState, useRef, useEffect } from 'react'
import AdminBreadcrumb from './AdminBreadcrumb'

export default function AdminHeader({ onMenuClick, title = "Ringkasan Dashboard", showBack, onBackClick, breadcrumb }) {
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)
    const notificationRef = useRef(null)

    // Close notification dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [notificationRef])

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
                <div className="hidden md:flex relative group w-56">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-[#617589]">
                        <span className="material-symbols-outlined text-lg">search</span>
                    </div>
                    <input
                        className="block w-full pl-9 pr-3 py-1.5 border-none rounded-lg bg-[#f0f2f4] dark:bg-[#2a3b4d] text-[#111418] dark:text-white placeholder-[#617589] focus:ring-2 focus:ring-primary text-xs outline-none transition-all"
                        placeholder="Cari pesanan, driver..."
                        type="text"
                    />
                </div>

                <div className="relative" ref={notificationRef}>
                    <button
                        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                        className="relative p-1.5 text-[#617589] dark:text-[#94a3b8] hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d] rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">notifications</span>
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#1a2632]"></span>
                    </button>

                    {/* Notification Dropdown */}
                    {isNotificationOpen && (
                        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-lg overflow-hidden z-50">
                            <div className="px-4 py-3 border-b border-[#e5e7eb] dark:border-[#2a3b4d] flex items-center justify-between">
                                <h3 className="font-semibold text-sm text-[#111418] dark:text-white">Notifikasi</h3>
                                <button className="text-xs text-primary hover:underline">Tandai semua dibaca</button>
                            </div>
                            <div className="max-h-[360px] overflow-y-auto">
                                <div className="p-3 border-b border-[#e5e7eb] dark:border-[#2a3b4d] hover:bg-[#f9fafb] dark:hover:bg-[#2a3b4d]/30 transition-colors cursor-pointer relative group">
                                    <div className="flex gap-2.5">
                                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-base">warning</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-[#111418] dark:text-white mb-0.5">Stok Warung Habis</p>
                                            <p className="text-[11px] text-[#617589] dark:text-[#94a3b8] leading-relaxed">Warung "Sate Madura Cak Dul" melaporkan kehabisan stok.</p>
                                            <p className="text-[10px] text-[#94a3b8] mt-1">2 menit yang lalu</p>
                                        </div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shrink-0"></div>
                                    </div>
                                </div>
                                <div className="p-3 border-b border-[#e5e7eb] dark:border-[#2a3b4d] hover:bg-[#f9fafb] dark:hover:bg-[#2a3b4d]/30 transition-colors cursor-pointer group">
                                    <div className="flex gap-2.5">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-base">person_add</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-[#111418] dark:text-white mb-0.5">Pendaftaran Driver Baru</p>
                                            <p className="text-[11px] text-[#617589] dark:text-[#94a3b8] leading-relaxed">Budi Santoso menunggu verifikasi.</p>
                                            <p className="text-[10px] text-[#94a3b8] mt-1">15 menit yang lalu</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 hover:bg-[#f9fafb] dark:hover:bg-[#2a3b4d]/30 transition-colors cursor-pointer group">
                                    <div className="flex gap-2.5">
                                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-base">payments</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-[#111418] dark:text-white mb-0.5">Penarikan Dana Berhasil</p>
                                            <p className="text-[11px] text-[#617589] dark:text-[#94a3b8] leading-relaxed">Transfer ke Warung "Geprek Bensu" Rp 500.000 berhasil.</p>
                                            <p className="text-[10px] text-[#94a3b8] mt-1">1 jam yang lalu</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-2.5 bg-[#f9fafb] dark:bg-[#2a3b4d]/50 text-center border-t border-[#e5e7eb] dark:border-[#2a3b4d]">
                                <button className="text-xs font-medium text-primary hover:underline">Lihat Semua Notifikasi</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
