import { useState } from 'react'
import AdminSidebar from '@/features/admin/components/AdminSidebar'
import AdminHeader from '@/features/admin/components/AdminHeader'
import AdminErrorBoundary from '@/features/admin/components/AdminErrorBoundary'
import { AdminToastProvider } from '@/features/admin/components/AdminToast'
import useAdminSessionTimeout from '@/hooks/useAdminSessionTimeout'

/**
 * AdminLayout — Wrapper component for all admin pages.
 * Centralizes sidebar, header, and content layout to ensure consistency.
 * Includes session timeout (30 min idle = auto-logout).
 * 
 * Usage:
 *   <AdminLayout title="Manajemen Warung">
 *     {content}
 *   </AdminLayout>
 */
export default function AdminLayout({ children, title, showBack, onBackClick, breadcrumb }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    useAdminSessionTimeout(30) // Auto-logout after 30 minutes idle

    return (
        <AdminToastProvider>
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
                        <AdminErrorBoundary>
                            <div className="flex flex-col gap-5">
                                {children}
                            </div>
                        </AdminErrorBoundary>
                    </div>
                </main>
            </div>
        </AdminToastProvider>
    )
}

