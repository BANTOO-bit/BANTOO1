import { lazy } from 'react'
import { Route } from 'react-router-dom'
import ProtectedRoute from '@/features/shared/components/ProtectedRoute'

// ============================================
// LAZY LOADED DRIVER PAGES
// ============================================

// Dashboard & Core
const DriverDashboard = lazy(() => import('@/features/driver/pages/DriverDashboard'))
const DriverOrdersPage = lazy(() => import('@/features/driver/pages/DriverOrdersPage'))
const DriverEarningsPage = lazy(() => import('@/features/driver/pages/DriverEarningsPage'))
const DriverAccountPage = lazy(() => import('@/features/driver/pages/DriverAccountPage'))
const DriverProfilePage = lazy(() => import('@/features/driver/pages/DriverProfilePage'))
const DriverEditProfile = lazy(() => import('@/features/driver/pages/DriverEditProfile'))
const DriverNotificationsPage = lazy(() => import('@/features/driver/pages/DriverNotificationsPage'))
const DriverNotificationDetailPage = lazy(() => import('@/features/driver/pages/DriverNotificationDetailPage'))
const DriverReviewsPage = lazy(() => import('@/features/driver/pages/DriverReviewsPage'))

// Help (driver specific chatbot)
const DriverHelpCenterPage = lazy(() => import('@/features/driver/pages/help/DriverHelpCenterPage'))

// Order Flow
const DriverIncomingOrder = lazy(() => import('@/features/driver/pages/order/DriverIncomingOrder'))
const DriverPickupOrder = lazy(() => import('@/features/driver/pages/order/DriverPickupOrder'))
const DriverDeliveryOrder = lazy(() => import('@/features/driver/pages/order/DriverDeliveryOrder'))
const DriverPaymentConfirmation = lazy(() => import('@/features/driver/pages/order/DriverPaymentConfirmation'))
const DriverOrderComplete = lazy(() => import('@/features/driver/pages/order/DriverOrderComplete'))
const DriverChatPage = lazy(() => import('@/features/driver/pages/order/DriverChatPage'))

// Profile Sub-Pages
const DriverVehiclePage = lazy(() => import('@/features/driver/pages/profile/DriverVehiclePage'))
const DriverBankPage = lazy(() => import('@/features/driver/pages/profile/DriverBankPage'))
const DriverEditBankPage = lazy(() => import('@/features/driver/pages/profile/DriverEditBankPage'))
const DriverSecurityPage = lazy(() => import('@/features/driver/pages/profile/DriverSecurityPage'))

// Financial Pages
const DriverTransactionDetail = lazy(() => import('@/features/driver/pages/financial/DriverTransactionDetail'))
const DriverWithdrawalPage = lazy(() => import('@/features/driver/pages/financial/DriverWithdrawalPage'))
const DriverWithdrawalAccount = lazy(() => import('@/features/driver/pages/financial/DriverWithdrawalAccount'))
const DriverWithdrawalConfirm = lazy(() => import('@/features/driver/pages/financial/DriverWithdrawalConfirm'))
const DriverWithdrawalStatus = lazy(() => import('@/features/driver/pages/financial/DriverWithdrawalStatus'))
const DriverDepositPage = lazy(() => import('@/features/driver/pages/financial/DriverDepositPage'))
const DriverDepositVerification = lazy(() => import('@/features/driver/pages/financial/DriverDepositVerification'))
const DriverDepositHistoryPage = lazy(() => import('@/features/driver/pages/financial/DriverDepositHistoryPage'))


// ============================================
// DRIVER ROUTES EXPORT
// ============================================

export default function DriverRoutes() {
    return (
        <>
            {/* Core Pages */}
            <Route path="/driver/dashboard" element={<ProtectedRoute allowedRoles={['driver']}><DriverDashboard /></ProtectedRoute>} />
            <Route path="/driver/orders" element={<ProtectedRoute allowedRoles={['driver']}><DriverOrdersPage /></ProtectedRoute>} />
            <Route path="/driver/earnings" element={<ProtectedRoute allowedRoles={['driver']}><DriverEarningsPage /></ProtectedRoute>} />
            <Route path="/driver/account" element={<ProtectedRoute allowedRoles={['driver']}><DriverAccountPage /></ProtectedRoute>} />
            <Route path="/driver/profile" element={<ProtectedRoute allowedRoles={['driver']}><DriverProfilePage /></ProtectedRoute>} />
            <Route path="/driver/profile/edit" element={<ProtectedRoute allowedRoles={['driver']}><DriverEditProfile /></ProtectedRoute>} />
            <Route path="/driver/notifications" element={<ProtectedRoute allowedRoles={['driver']}><DriverNotificationsPage /></ProtectedRoute>} />
            <Route path="/driver/notifications/:id" element={<ProtectedRoute allowedRoles={['driver']}><DriverNotificationDetailPage /></ProtectedRoute>} />
            <Route path="/driver/help" element={<ProtectedRoute allowedRoles={['driver']}><DriverHelpCenterPage /></ProtectedRoute>} />

            {/* Driver Account Sub-Pages */}
            <Route path="/driver/vehicle" element={<ProtectedRoute allowedRoles={['driver']}><DriverVehiclePage /></ProtectedRoute>} />
            <Route path="/driver/bank" element={<ProtectedRoute allowedRoles={['driver']}><DriverBankPage /></ProtectedRoute>} />
            <Route path="/driver/bank/edit" element={<ProtectedRoute allowedRoles={['driver']}><DriverEditBankPage /></ProtectedRoute>} />
            <Route path="/driver/bank/add" element={<ProtectedRoute allowedRoles={['driver']}><DriverEditBankPage /></ProtectedRoute>} />
            <Route path="/driver/security" element={<ProtectedRoute allowedRoles={['driver']}><DriverSecurityPage /></ProtectedRoute>} />

            {/* Driver Financial Routes */}
            <Route path="/driver/earnings/transaction/:id" element={<ProtectedRoute allowedRoles={['driver']}><DriverTransactionDetail /></ProtectedRoute>} />
            <Route path="/driver/withdrawal" element={<ProtectedRoute allowedRoles={['driver']}><DriverWithdrawalPage /></ProtectedRoute>} />
            <Route path="/driver/withdrawal/account" element={<ProtectedRoute allowedRoles={['driver']}><DriverWithdrawalAccount /></ProtectedRoute>} />
            <Route path="/driver/withdrawal/confirm" element={<ProtectedRoute allowedRoles={['driver']}><DriverWithdrawalConfirm /></ProtectedRoute>} />
            <Route path="/driver/withdrawal/status" element={<ProtectedRoute allowedRoles={['driver']}><DriverWithdrawalStatus /></ProtectedRoute>} />
            <Route path="/driver/deposit" element={<ProtectedRoute allowedRoles={['driver']}><DriverDepositPage /></ProtectedRoute>} />
            <Route path="/driver/deposit/verification" element={<ProtectedRoute allowedRoles={['driver']}><DriverDepositVerification /></ProtectedRoute>} />
            <Route path="/driver/deposit/history" element={<ProtectedRoute allowedRoles={['driver']}><DriverDepositHistoryPage /></ProtectedRoute>} />
            <Route path="/driver/reviews" element={<ProtectedRoute allowedRoles={['driver']}><DriverReviewsPage /></ProtectedRoute>} />

            {/* Driver Order Flow (COD) */}
            <Route path="/driver/order/incoming/:orderId" element={<ProtectedRoute allowedRoles={['driver']}><DriverIncomingOrder /></ProtectedRoute>} />
            <Route path="/driver/order/pickup/:orderId" element={<ProtectedRoute allowedRoles={['driver']}><DriverPickupOrder /></ProtectedRoute>} />
            <Route path="/driver/order/delivery/:orderId" element={<ProtectedRoute allowedRoles={['driver']}><DriverDeliveryOrder /></ProtectedRoute>} />
            <Route path="/driver/order/payment" element={<ProtectedRoute allowedRoles={['driver']}><DriverPaymentConfirmation /></ProtectedRoute>} />
            <Route path="/driver/order/complete" element={<ProtectedRoute allowedRoles={['driver']}><DriverOrderComplete /></ProtectedRoute>} />
            <Route path="/driver/chat/:orderId" element={<ProtectedRoute allowedRoles={['driver']}><DriverChatPage /></ProtectedRoute>} />
        </>
    )
}
