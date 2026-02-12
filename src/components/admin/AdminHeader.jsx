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
        <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-white dark:bg-[#1a2632] border-b border-[#e5e7eb] dark:border-[#2a3b4d]">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 -ml-2 text-[#617589] hover:bg-[#f0f2f4] rounded-lg"
                >
                    <span className="material-symbols-outlined">menu</span>
                </button>
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        {showBack && (
                            <button
                                onClick={onBackClick}
                                className="p-2 text-[#617589] dark:text-[#94a3b8] hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d] rounded-full transition-colors"
                            >
                                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                            </button>
                        )}
                        <h2 className="text-xl font-bold text-[#111418] dark:text-white tracking-tight">{title}</h2>
                    </div>
                    {breadcrumb && <AdminBreadcrumb items={breadcrumb} />}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden md:flex relative group w-64">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#617589]">
                        <span className="material-symbols-outlined text-[20px]">search</span>
                    </div>
                    <input
                        className="block w-full pl-10 pr-3 py-2 border-none rounded-lg bg-[#f0f2f4] dark:bg-[#2a3b4d] text-[#111418] dark:text-white placeholder-[#617589] focus:ring-2 focus:ring-primary text-sm outline-none transition-all"
                        placeholder="Cari pesanan, driver..."
                        type="text"
                    />
                </div>

                <div className="relative" ref={notificationRef}>
                    <button
                        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                        className="relative p-2 text-[#617589] dark:text-[#94a3b8] hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d] rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#1a2632]"></span>
                    </button>

                    {/* Notification Dropdown */}
                    {isNotificationOpen && (
                        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-lg overflow-hidden z-50">
                            <div className="p-4 border-b border-[#e5e7eb] dark:border-[#2a3b4d] flex items-center justify-between">
                                <h3 className="font-semibold text-[#111418] dark:text-white">Notifikasi</h3>
                                <button className="text-xs text-primary hover:underline">Tandai semua dibaca</button>
                            </div>
                            <div className="max-h-[360px] overflow-y-auto">
                                <div className="p-4 border-b border-[#e5e7eb] dark:border-[#2a3b4d] hover:bg-[#f9fafb] dark:hover:bg-[#2a3b4d]/30 transition-colors cursor-pointer relative group">
                                    <div className="flex gap-3">
                                        <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-[20px]">warning</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-[#111418] dark:text-white mb-1">Stok Warung Habis</p>
                                            <p className="text-xs text-[#617589] dark:text-[#94a3b8] leading-relaxed">Warung "Sate Madura Cak Dul" melaporkan kehabisan stok bahan baku utama.</p>
                                            <p className="text-[10px] text-[#94a3b8] mt-2">2 menit yang lalu</p>
                                        </div>
                                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5"></div>
                                    </div>
                                </div>
                                <div className="p-4 border-b border-[#e5e7eb] dark:border-[#2a3b4d] hover:bg-[#f9fafb] dark:hover:bg-[#2a3b4d]/30 transition-colors cursor-pointer group">
                                    <div className="flex gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-[20px]">person_add</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-[#111418] dark:text-white mb-1">Pendaftaran Driver Baru</p>
                                            <p className="text-xs text-[#617589] dark:text-[#94a3b8] leading-relaxed">Budi Santoso telah melengkapi dokumen pendaftaran dan menunggu verifikasi.</p>
                                            <p className="text-[10px] text-[#94a3b8] mt-2">15 menit yang lalu</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 hover:bg-[#f9fafb] dark:hover:bg-[#2a3b4d]/30 transition-colors cursor-pointer group">
                                    <div className="flex gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-[20px]">payments</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-[#111418] dark:text-white mb-1">Penarikan Dana Berhasil</p>
                                            <p className="text-xs text-[#617589] dark:text-[#94a3b8] leading-relaxed">Transfer ke Warung "Geprek Bensu" sebesar Rp 500.000 telah berhasil.</p>
                                            <p className="text-[10px] text-[#94a3b8] mt-2">1 jam yang lalu</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-3 bg-[#f9fafb] dark:bg-[#2a3b4d]/50 text-center border-t border-[#e5e7eb] dark:border-[#2a3b4d]">
                                <button className="text-xs font-medium text-primary hover:underline">Lihat Semua Notifikasi</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
