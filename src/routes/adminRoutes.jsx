import { lazy } from 'react'
import { Route } from 'react-router-dom'
import ProtectedRoute from '@/features/shared/components/ProtectedRoute'

// ============================================
// LAZY LOADED ADMIN PAGES
// ============================================

// Dashboard
const AdminDashboard = lazy(() => import('@/features/admin/pages/dashboard/AdminDashboard'))
const AdminLoginPage = lazy(() => import('@/features/admin/pages/dashboard/AdminLoginPage'))

const AdminOrdersPage = lazy(() => import('@/features/admin/pages/orders/AdminOrdersPage'))
const AdminOrderDetailPage = lazy(() => import('@/features/admin/pages/orders/AdminOrderDetailPage'))
const AdminCODPage = lazy(() => import('@/features/admin/pages/orders/AdminCODPage'))

// Merchants
const AdminMerchantsPage = lazy(() => import('@/features/admin/pages/merchants/AdminMerchantsPage'))
const AdminMerchantDetailPage = lazy(() => import('@/features/admin/pages/merchants/AdminMerchantDetailPage'))
const AdminMerchantsVerificationPage = lazy(() => import('@/features/admin/pages/merchants/AdminMerchantsVerificationPage'))
const AdminMerchantsReviewPage = lazy(() => import('@/features/admin/pages/merchants/AdminMerchantsReviewPage'))
const AdminMerchantsEditPage = lazy(() => import('@/features/admin/pages/merchants/AdminMerchantsEditPage'))

// Drivers
const AdminDriversPage = lazy(() => import('@/features/admin/pages/drivers/AdminDriversPage'))
const AdminDriverDetailPage = lazy(() => import('@/features/admin/pages/drivers/AdminDriverDetailPage'))
const AdminDriversVerificationPage = lazy(() => import('@/features/admin/pages/drivers/AdminDriversVerificationPage'))
const AdminDriversReviewPage = lazy(() => import('@/features/admin/pages/drivers/AdminDriversReviewPage'))
const AdminDriversEditPage = lazy(() => import('@/features/admin/pages/drivers/AdminDriversEditPage'))

// Users
const AdminUsersPage = lazy(() => import('@/features/admin/pages/users/AdminUsersPage'))
const AdminUserDetailPage = lazy(() => import('@/features/admin/pages/users/AdminUserDetailPage'))

// Financial
const AdminFinancesPage = lazy(() => import('@/features/admin/pages/financial/AdminFinancesPage'))
const AdminRevenuePage = lazy(() => import('@/features/admin/pages/financial/AdminRevenuePage'))
const AdminWithdrawalsPage = lazy(() => import('@/features/admin/pages/financial/AdminWithdrawalsPage'))
const AdminWithdrawalDetailPage = lazy(() => import('@/features/admin/pages/financial/AdminWithdrawalDetailPage'))

// Promos
const AdminPromoPage = lazy(() => import('@/features/admin/pages/promos/AdminPromoPage'))
const AdminCreatePromoPage = lazy(() => import('@/features/admin/pages/promos/AdminCreatePromoPage'))
const AdminEditPromoPage = lazy(() => import('@/features/admin/pages/promos/AdminEditPromoPage'))

// Issues
const AdminIssuesPage = lazy(() => import('@/features/admin/pages/issues/AdminIssuesPage'))
const AdminIssueDetailPage = lazy(() => import('@/features/admin/pages/issues/AdminIssueDetailPage'))

// Settings
const AdminSettingsPage = lazy(() => import('@/features/admin/pages/settings/AdminSettingsPage'))
const AdminAuditLogPage = lazy(() => import('@/features/admin/pages/settings/AdminAuditLogPage'))

// Notifications
const AdminNotificationsPage = lazy(() => import('@/features/admin/pages/notifications/AdminNotificationsPage'))


// ============================================
// ADMIN ROUTES EXPORT
// ============================================

export default function AdminRoutes() {
    return (
        <>
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={['admin']}><AdminOrdersPage /></ProtectedRoute>} />
            <Route path="/admin/orders/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminOrderDetailPage /></ProtectedRoute>} />
            <Route path="/admin/merchants" element={<ProtectedRoute allowedRoles={['admin']}><AdminMerchantsPage /></ProtectedRoute>} />
            <Route path="/admin/merchants/verification" element={<ProtectedRoute allowedRoles={['admin']}><AdminMerchantsVerificationPage /></ProtectedRoute>} />
            <Route path="/admin/merchants/verification/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminMerchantsReviewPage /></ProtectedRoute>} />
            <Route path="/admin/merchants/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminMerchantDetailPage /></ProtectedRoute>} />
            <Route path="/admin/merchants/edit/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminMerchantsEditPage /></ProtectedRoute>} />
            <Route path="/admin/drivers" element={<ProtectedRoute allowedRoles={['admin']}><AdminDriversPage /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
            <Route path="/admin/users/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminUserDetailPage /></ProtectedRoute>} />
            <Route path="/admin/drivers/verification" element={<ProtectedRoute allowedRoles={['admin']}><AdminDriversVerificationPage /></ProtectedRoute>} />
            <Route path="/admin/drivers/verification/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminDriversReviewPage /></ProtectedRoute>} />
            <Route path="/admin/drivers/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminDriverDetailPage /></ProtectedRoute>} />
            <Route path="/admin/drivers/edit/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminDriversEditPage /></ProtectedRoute>} />
            <Route path="/admin/cod" element={<ProtectedRoute allowedRoles={['admin']}><AdminCODPage /></ProtectedRoute>} />
            <Route path="/admin/revenue" element={<ProtectedRoute allowedRoles={['admin']}><AdminRevenuePage /></ProtectedRoute>} />
            <Route path="/admin/withdrawals" element={<ProtectedRoute allowedRoles={['admin']}><AdminWithdrawalsPage /></ProtectedRoute>} />
            <Route path="/admin/promos" element={<ProtectedRoute allowedRoles={['admin']}><AdminPromoPage /></ProtectedRoute>} />
            <Route path="/admin/promos/new" element={<ProtectedRoute allowedRoles={['admin']}><AdminCreatePromoPage /></ProtectedRoute>} />
            <Route path="/admin/promos/edit/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminEditPromoPage /></ProtectedRoute>} />
            <Route path="/admin/issues" element={<ProtectedRoute allowedRoles={['admin']}><AdminIssuesPage /></ProtectedRoute>} />
            <Route path="/admin/issues/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminIssueDetailPage /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettingsPage /></ProtectedRoute>} />
            <Route path="/admin/audit-log" element={<ProtectedRoute allowedRoles={['admin']}><AdminAuditLogPage /></ProtectedRoute>} />
            <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={['admin']}><AdminNotificationsPage /></ProtectedRoute>} />
            <Route path="/admin/finances" element={<ProtectedRoute allowedRoles={['admin']}><AdminFinancesPage /></ProtectedRoute>} />
            <Route path="/admin/finances/withdrawal/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminWithdrawalDetailPage /></ProtectedRoute>} />
        </>
    )
}
