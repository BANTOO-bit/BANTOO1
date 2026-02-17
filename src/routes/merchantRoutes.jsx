import { lazy } from 'react'
import { Route } from 'react-router-dom'
import ProtectedRoute from '../components/shared/ProtectedRoute'

// ============================================
// LAZY LOADED MERCHANT PAGES
// ============================================

// Dashboard
const MerchantDashboard = lazy(() => import('../pages/merchant/dashboard/MerchantDashboard'))

// Menu Management
const MerchantMenuPage = lazy(() => import('../pages/merchant/menu/MerchantMenuPage'))
const MerchantAddMenuPage = lazy(() => import('../pages/merchant/menu/MerchantAddMenuPage'))
const MerchantEditMenuPage = lazy(() => import('../pages/merchant/menu/MerchantEditMenuPage'))
const MerchantCategoriesPage = lazy(() => import('../pages/merchant/menu/MerchantCategoriesPage'))

// Orders
const MerchantOrdersPage = lazy(() => import('../pages/merchant/orders/MerchantOrdersPage'))
const MerchantOrderHistoryPage = lazy(() => import('../pages/merchant/orders/MerchantOrderHistoryPage'))
const MerchantTotalOrdersPage = lazy(() => import('../pages/merchant/orders/MerchantTotalOrdersPage'))

// Profile
const MerchantProfilePage = lazy(() => import('../pages/merchant/profile/MerchantProfilePage'))
const MerchantEditProfilePage = lazy(() => import('../pages/merchant/profile/MerchantEditProfilePage'))
const MerchantAccountInfoPage = lazy(() => import('../pages/merchant/profile/MerchantAccountInfoPage'))
const MerchantChangePasswordPage = lazy(() => import('../pages/merchant/profile/MerchantChangePasswordPage'))
const MerchantOperatingHoursPage = lazy(() => import('../pages/merchant/profile/MerchantOperatingHoursPage'))

// Financial
const MerchantBalancePage = lazy(() => import('../pages/merchant/financial/MerchantBalancePage'))
const MerchantAddBankAccountPage = lazy(() => import('../pages/merchant/financial/MerchantAddBankAccountPage'))
const MerchantEditBankAccountPage = lazy(() => import('../pages/merchant/financial/MerchantEditBankAccountPage'))
const MerchantTodayEarningsPage = lazy(() => import('../pages/merchant/financial/MerchantTodayEarningsPage'))
const MerchantSalesReportPage = lazy(() => import('../pages/merchant/financial/MerchantSalesReportPage'))

// Reviews
const MerchantReviewsPage = lazy(() => import('../pages/merchant/reviews/MerchantReviewsPage'))


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
        </>
    )
}
