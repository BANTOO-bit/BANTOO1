import { lazy } from 'react'
import { Route } from 'react-router-dom'
import ProtectedRoute from '../components/shared/ProtectedRoute'

// ============================================
// LAZY LOADED DRIVER PAGES
// ============================================

// Dashboard & Core
const DriverDashboard = lazy(() => import('../pages/driver/DriverDashboard'))
const DriverOrdersPage = lazy(() => import('../pages/driver/DriverOrdersPage'))
const DriverEarningsPage = lazy(() => import('../pages/driver/DriverEarningsPage'))
const DriverAccountPage = lazy(() => import('../pages/driver/DriverAccountPage'))
const DriverProfilePage = lazy(() => import('../pages/driver/DriverProfilePage'))
const DriverEditProfile = lazy(() => import('../pages/driver/DriverEditProfile'))
const DriverNotificationsPage = lazy(() => import('../pages/driver/DriverNotificationsPage'))
const DriverNotificationDetailPage = lazy(() => import('../pages/driver/DriverNotificationDetailPage'))
const DriverReviewsPage = lazy(() => import('../pages/driver/DriverReviewsPage'))

// Help (reuse user help center)
const HelpCenterPage = lazy(() => import('../pages/user/help/HelpCenterPage'))

// Order Flow
const DriverIncomingOrder = lazy(() => import('../pages/driver/order/DriverIncomingOrder'))
const DriverPickupOrder = lazy(() => import('../pages/driver/order/DriverPickupOrder'))
const DriverDeliveryOrder = lazy(() => import('../pages/driver/order/DriverDeliveryOrder'))
const DriverPaymentConfirmation = lazy(() => import('../pages/driver/order/DriverPaymentConfirmation'))
const DriverOrderComplete = lazy(() => import('../pages/driver/order/DriverOrderComplete'))
const DriverChatPage = lazy(() => import('../pages/driver/order/DriverChatPage'))

// Profile Sub-Pages
const DriverVehiclePage = lazy(() => import('../pages/driver/profile/DriverVehiclePage'))
const DriverBankPage = lazy(() => import('../pages/driver/profile/DriverBankPage'))
const DriverEditBankPage = lazy(() => import('../pages/driver/profile/DriverEditBankPage'))
const DriverSecurityPage = lazy(() => import('../pages/driver/profile/DriverSecurityPage'))

// Financial Pages
const DriverTransactionDetail = lazy(() => import('../pages/driver/financial/DriverTransactionDetail'))
const DriverWithdrawalPage = lazy(() => import('../pages/driver/financial/DriverWithdrawalPage'))
const DriverWithdrawalAccount = lazy(() => import('../pages/driver/financial/DriverWithdrawalAccount'))
const DriverWithdrawalConfirm = lazy(() => import('../pages/driver/financial/DriverWithdrawalConfirm'))
const DriverWithdrawalStatus = lazy(() => import('../pages/driver/financial/DriverWithdrawalStatus'))
const DriverDepositPage = lazy(() => import('../pages/driver/financial/DriverDepositPage'))
const DriverDepositVerification = lazy(() => import('../pages/driver/financial/DriverDepositVerification'))


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
            <Route path="/driver/help" element={<ProtectedRoute allowedRoles={['driver']}><HelpCenterPage /></ProtectedRoute>} />

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
            <Route path="/driver/reviews" element={<ProtectedRoute allowedRoles={['driver']}><DriverReviewsPage /></ProtectedRoute>} />

            {/* Driver Order Flow (COD) */}
            <Route path="/driver/order/incoming/:orderId" element={<ProtectedRoute allowedRoles={['driver']}><DriverIncomingOrder /></ProtectedRoute>} />
            <Route path="/driver/order/pickup" element={<ProtectedRoute allowedRoles={['driver']}><DriverPickupOrder /></ProtectedRoute>} />
            <Route path="/driver/order/delivery" element={<ProtectedRoute allowedRoles={['driver']}><DriverDeliveryOrder /></ProtectedRoute>} />
            <Route path="/driver/order/payment" element={<ProtectedRoute allowedRoles={['driver']}><DriverPaymentConfirmation /></ProtectedRoute>} />
            <Route path="/driver/order/complete" element={<ProtectedRoute allowedRoles={['driver']}><DriverOrderComplete /></ProtectedRoute>} />
            <Route path="/driver/chat/:orderId" element={<ProtectedRoute allowedRoles={['driver']}><DriverChatPage /></ProtectedRoute>} />
        </>
    )
}
