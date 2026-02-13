import { useState } from 'react'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'

/**
 * AdminLayout — Wrapper component for all admin pages.
 * Centralizes sidebar, header, and content layout to ensure consistency.
 * 
 * Usage:
 *   <AdminLayout title="Manajemen Warung">
 *     {content}
 *   </AdminLayout>
 */
export default function AdminLayout({ children, title, showBack, onBackClick, breadcrumb }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    return (
        <div className="flex min-h-screen w-full bg-[#f6f7f8] dark:bg-[#101922] font-display text-[#111418] dark:text-white overflow-x-hidden">
            <AdminSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <main className="flex-1 lg:ml-[240px] flex flex-col min-w-0">
                <AdminHeader
                    onMenuClick={() => setIsSidebarOpen(true)}
                    title={title}
                    showBack={showBack}
                    onBackClick={onBackClick}
                    breadcrumb={breadcrumb}
                />

                <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
                    <div className="flex flex-col gap-5">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    )
}
