import { lazy } from 'react'
import { Route } from 'react-router-dom'
import ProtectedRoute from '../components/shared/ProtectedRoute'

// ============================================
// LAZY LOADED ADMIN PAGES
// ============================================

// Dashboard
const AdminDashboard = lazy(() => import('../pages/admin/dashboard/AdminDashboard'))
const AdminLoginPage = lazy(() => import('../pages/admin/dashboard/AdminLoginPage'))

const AdminOrdersPage = lazy(() => import('../pages/admin/orders/AdminOrdersPage'))
const AdminOrderDetailPage = lazy(() => import('../pages/admin/orders/AdminOrderDetailPage'))
const AdminCODPage = lazy(() => import('../pages/admin/orders/AdminCODPage'))

// Merchants
const AdminMerchantsPage = lazy(() => import('../pages/admin/merchants/AdminMerchantsPage'))
const AdminMerchantDetailPage = lazy(() => import('../pages/admin/merchants/AdminMerchantDetailPage'))
const AdminMerchantsVerificationPage = lazy(() => import('../pages/admin/merchants/AdminMerchantsVerificationPage'))
const AdminMerchantsReviewPage = lazy(() => import('../pages/admin/merchants/AdminMerchantsReviewPage'))
const AdminMerchantsEditPage = lazy(() => import('../pages/admin/merchants/AdminMerchantsEditPage'))

// Drivers
const AdminDriversPage = lazy(() => import('../pages/admin/drivers/AdminDriversPage'))
const AdminDriverDetailPage = lazy(() => import('../pages/admin/drivers/AdminDriverDetailPage'))
const AdminDriversVerificationPage = lazy(() => import('../pages/admin/drivers/AdminDriversVerificationPage'))
const AdminDriversReviewPage = lazy(() => import('../pages/admin/drivers/AdminDriversReviewPage'))
const AdminDriversEditPage = lazy(() => import('../pages/admin/drivers/AdminDriversEditPage'))

// Users
const AdminUsersPage = lazy(() => import('../pages/admin/users/AdminUsersPage'))
const AdminUserDetailPage = lazy(() => import('../pages/admin/users/AdminUserDetailPage'))

// Financial
const AdminFinancesPage = lazy(() => import('../pages/admin/financial/AdminFinancesPage'))
const AdminRevenuePage = lazy(() => import('../pages/admin/financial/AdminRevenuePage'))
const AdminWithdrawalsPage = lazy(() => import('../pages/admin/financial/AdminWithdrawalsPage'))
const AdminWithdrawalDetailPage = lazy(() => import('../pages/admin/financial/AdminWithdrawalDetailPage'))

// Promos
const AdminPromoPage = lazy(() => import('../pages/admin/promos/AdminPromoPage'))
const AdminCreatePromoPage = lazy(() => import('../pages/admin/promos/AdminCreatePromoPage'))
const AdminEditPromoPage = lazy(() => import('../pages/admin/promos/AdminEditPromoPage'))

// Issues
const AdminIssuesPage = lazy(() => import('../pages/admin/issues/AdminIssuesPage'))
const AdminIssueDetailPage = lazy(() => import('../pages/admin/issues/AdminIssueDetailPage'))

// Settings
const AdminSettingsPage = lazy(() => import('../pages/admin/settings/AdminSettingsPage'))

// Notifications
const AdminNotificationsPage = lazy(() => import('../pages/admin/notifications/AdminNotificationsPage'))


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
            <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={['admin']}><AdminNotificationsPage /></ProtectedRoute>} />
            <Route path="/admin/finances" element={<ProtectedRoute allowedRoles={['admin']}><AdminFinancesPage /></ProtectedRoute>} />
            <Route path="/admin/finances/withdrawal/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminWithdrawalDetailPage /></ProtectedRoute>} />
        </>
    )
}
