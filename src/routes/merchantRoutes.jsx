import { lazy } from 'react'
import { Route } from 'react-router-dom'
import ProtectedRoute from '@/features/shared/components/ProtectedRoute'

// ============================================
// LAZY LOADED MERCHANT PAGES
// ============================================

// Dashboard
const MerchantDashboard = lazy(() => import('@/features/merchant/pages/dashboard/MerchantDashboard'))

// Menu Management
const MerchantMenuPage = lazy(() => import('@/features/merchant/pages/menu/MerchantMenuPage'))
const MerchantAddMenuPage = lazy(() => import('@/features/merchant/pages/menu/MerchantAddMenuPage'))
const MerchantEditMenuPage = lazy(() => import('@/features/merchant/pages/menu/MerchantEditMenuPage'))
const MerchantCategoriesPage = lazy(() => import('@/features/merchant/pages/menu/MerchantCategoriesPage'))

// Orders
const MerchantOrdersPage = lazy(() => import('@/features/merchant/pages/orders/MerchantOrdersPage'))
const MerchantOrderHistoryPage = lazy(() => import('@/features/merchant/pages/orders/MerchantOrderHistoryPage'))
const MerchantTotalOrdersPage = lazy(() => import('@/features/merchant/pages/orders/MerchantTotalOrdersPage'))

// Profile
const MerchantProfilePage = lazy(() => import('@/features/merchant/pages/profile/MerchantProfilePage'))
const MerchantEditProfilePage = lazy(() => import('@/features/merchant/pages/profile/MerchantEditProfilePage'))
const MerchantAccountInfoPage = lazy(() => import('@/features/merchant/pages/profile/MerchantAccountInfoPage'))
const MerchantChangePasswordPage = lazy(() => import('@/features/merchant/pages/profile/MerchantChangePasswordPage'))
const MerchantOperatingHoursPage = lazy(() => import('@/features/merchant/pages/profile/MerchantOperatingHoursPage'))

// Financial
const MerchantBalancePage = lazy(() => import('@/features/merchant/pages/financial/MerchantBalancePage'))
const MerchantAddBankAccountPage = lazy(() => import('@/features/merchant/pages/financial/MerchantAddBankAccountPage'))
const MerchantEditBankAccountPage = lazy(() => import('@/features/merchant/pages/financial/MerchantEditBankAccountPage'))
const MerchantTodayEarningsPage = lazy(() => import('@/features/merchant/pages/financial/MerchantTodayEarningsPage'))
const MerchantSalesReportPage = lazy(() => import('@/features/merchant/pages/financial/MerchantSalesReportPage'))

// Reviews
const MerchantReviewsPage = lazy(() => import('@/features/merchant/pages/reviews/MerchantReviewsPage'))

// Help (reuse customer help center)
const HelpCenterPage = lazy(() => import('@/features/customer/pages/help/HelpCenterPage'))


// ============================================
// MERCHANT ROUTES EXPORT
// ============================================

export default function MerchantRoutes() {
    return (
        <>
            <Route path="/merchant/dashboard" element={<ProtectedRoute allowedRoles={['merchant']}><MerchantDashboard /></ProtectedRoute>} />
            <Route path="/merchant/menu" element={<ProtectedRoute allowedRoles={['merchant']}><MerchantMenuPage /></ProtectedRoute>} />
            <Route path="/merchant/menu/add" element={<ProtectedRoute allowedRoles={['merchant']}><MerchantAddMenuPage /></ProtectedRoute>} />
            <Route path="/merchant/menu/edit/:id" element={<ProtectedRoute allowedRoles={['merchant']}><MerchantEditMenuPage /></ProtectedRoute>} />
            <Route path="/merchant/menu/categories" element={<ProtectedRoute allowedRoles={['merchant']}><MerchantCategoriesPage /></ProtectedRoute>} />
            <Route path="/merchant/orders" element={<ProtectedRoute allowedRoles={['merchant']}><MerchantOrdersPage /></ProtectedRoute>} />
            <Route path="/merchant/profile" element={<ProtectedRoute allowedRoles={['merchant']}><MerchantProfilePage /></ProtectedRoute>} />
            <Route path="/merchant/order-history" element={<ProtectedRoute allowedRoles={['merchant']}><MerchantOrderHistoryPage /></ProtectedRoute>} />
            <Route path="/merchant/total-orders" element={<ProtectedRoute allowedRoles={['merchant']}><MerchantTotalOrdersPage /></ProtectedRoute>} />
            <Route path="/merchant/sales-report" element={<ProtectedRoute allowedRoles={['merchant']}><MerchantSalesReportPage /></ProtectedRoute>} />
            <Route path="/merchant/today-earnings" element={<ProtectedRoute allowedRoles={['merchant']}><MerchantTodayEarningsPage /></ProtectedRoute>} />
            <Route path="/merchant/profile/edit" element={<ProtectedRoute allowedRoles={['merchant']}><MerchantEditProfilePage /></ProtectedRoute>} />
            <Route path="/merchant/profile/account" element={<ProtectedRoute allowedRoles={['merchant']}><MerchantAccountInfoPage /></ProtectedRoute>} />
            <Route path="/merchant/profile/password" element={<ProtectedRoute allowedRoles={['merchant']}><MerchantChangePasswordPage /></ProtectedRoute>} />
            <Route path="/merchant/profile/hours" element={<ProtectedRoute allowedRoles={['merchant']}><MerchantOperatingHoursPage /></ProtectedRoute>} />
            <Route path="/merchant/balance" element={<ProtectedRoute allowedRoles={['merchant']}><MerchantBalancePage /></ProtectedRoute>} />
            <Route path="/merchant/balance/add-bank" element={<ProtectedRoute allowedRoles={['merchant']}><MerchantAddBankAccountPage /></ProtectedRoute>} />
            <Route path="/merchant/balance/edit-bank" element={<ProtectedRoute allowedRoles={['merchant']}><MerchantEditBankAccountPage /></ProtectedRoute>} />
            <Route path="/merchant/reviews" element={<ProtectedRoute allowedRoles={['merchant']}><MerchantReviewsPage /></ProtectedRoute>} />
            <Route path="/merchant/help" element={<ProtectedRoute allowedRoles={['merchant']}><HelpCenterPage /></ProtectedRoute>} />
        </>
    )
}
