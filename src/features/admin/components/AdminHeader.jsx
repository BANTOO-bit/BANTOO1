import { useNavigate } from 'react-router-dom'
import AdminBreadcrumb from '@/features/admin/components/AdminBreadcrumb'
import AdminSearchBar from '@/features/admin/components/AdminSearchBar'
import AdminNotificationBell from '@/features/admin/components/AdminNotificationBell'

/**
 * AdminHeader — Top header bar with title, breadcrumb, search, and notifications.
 * Search and notification logic extracted to dedicated sub-components.
 */
export default function AdminHeader({ onMenuClick, title = "Ringkasan Dashboard", showBack, onBackClick, breadcrumb }) {
    const navigate = useNavigate()
    const handleBack = onBackClick || (() => navigate(-1))

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
                                onClick={handleBack}
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
                <AdminSearchBar />
                <AdminNotificationBell />
            </div>
        </header>
    )
}
