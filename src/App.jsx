import { useState, useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AddressProvider } from './context/AddressContext'
import { FavoritesProvider } from './context/FavoritesContext'
import { NotificationsProvider } from './context/NotificationsContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { PartnerRegistrationProvider } from './context/PartnerRegistrationContext'
import { OrderProvider } from './context/OrderContext'
import { ToastProvider } from './context/ToastContext'

import ProtectedRoute from './components/shared/ProtectedRoute'
import AppErrorBoundary from './components/shared/AppErrorBoundary'
import PageLoader from './components/shared/PageLoader'
import ToastNotification from './components/shared/ToastNotification'

// ============================================
// LAZY LOADED PAGES - Grouped by Category
// ============================================

// Auth Pages (loaded eagerly for fast initial experience)
import OnboardingPage from './pages/shared/OnboardingPage'
import WelcomePage from './pages/shared/WelcomePage'
import LoginPage from './pages/shared/LoginPage'
import RegisterPage from './pages/shared/RegisterPage'
import OTPVerificationPage from './pages/shared/OTPVerificationPage'
import CreateAdminPage from './pages/shared/CreateAdminPage'
import SuspendedAccountPage from './pages/shared/SuspendedAccountPage'

// Error Pages
const NotFoundPage = lazy(() => import('./pages/shared/NotFoundPage'))

// Core User Pages (most frequently used - smaller lazy chunks)
const HomePage = lazy(() => import('./pages/user/HomePage'))
const SearchPage = lazy(() => import('./pages/user/SearchPage'))
const OrdersPage = lazy(() => import('./pages/user/OrdersPage'))
const ProfilePage = lazy(() => import('./pages/user/ProfilePage'))

// Merchant & Cart Flow
const MerchantDetailPage = lazy(() => import('./pages/user/MerchantDetailPage'))
const AllMerchantsPage = lazy(() => import('./pages/user/AllMerchantsPage'))
const AllPopularMenuPage = lazy(() => import('./pages/user/AllPopularMenuPage'))
const AllCategoriesPage = lazy(() => import('./pages/user/AllCategoriesPage'))
const CategoryDetailPage = lazy(() => import('./pages/user/CategoryDetailPage'))
const CartPage = lazy(() => import('./pages/user/CartPage'))
const CheckoutPage = lazy(() => import('./pages/user/CheckoutPage'))
const OrderSuccessPage = lazy(() => import('./pages/user/OrderSuccessPage'))

// Order Management
const OrderDetailPage = lazy(() => import('./pages/user/OrderDetailPage'))
const TrackingPage = lazy(() => import('./pages/user/TrackingPage'))
const ReviewPage = lazy(() => import('./pages/user/ReviewPage'))
const ChatDriverPage = lazy(() => import('./pages/user/ChatDriverPage'))

// Profile & Settings
const EditProfilePage = lazy(() => import('./pages/user/EditProfilePage'))
const AddressListPage = lazy(() => import('./pages/user/AddressListPage'))
const AddAddressPage = lazy(() => import('./pages/user/AddAddressPage'))
const FavoritesPage = lazy(() => import('./pages/user/FavoritesPage'))
const NotificationsPage = lazy(() => import('./pages/user/NotificationsPage'))
const PaymentMethodsPage = lazy(() => import('./pages/user/PaymentMethodsPage'))
const SecurityPage = lazy(() => import('./pages/user/SecurityPage'))
const AboutPage = lazy(() => import('./pages/user/AboutPage'))
const RegistrationStatusPage = lazy(() => import('./pages/user/RegistrationStatusPage'))

// Shared Pages
const TermsPage = lazy(() => import('./pages/shared/TermsPage'))
const PartnerRegistrationPage = lazy(() => import('./pages/shared/PartnerRegistrationPage'))

// Help Center - Main
const HelpCenterPage = lazy(() => import('./pages/user/HelpCenterPage'))
const HelpOrderPage = lazy(() => import('./pages/user/HelpOrderPage'))
const HelpPaymentPage = lazy(() => import('./pages/user/HelpPaymentPage'))
const HelpPromoPage = lazy(() => import('./pages/user/HelpPromoPage'))
const HelpAccountPage = lazy(() => import('./pages/user/HelpAccountPage'))
const HelpSecurityPage = lazy(() => import('./pages/user/HelpSecurityPage'))
const HelpDetailPage = lazy(() => import('./pages/user/HelpDetailPage'))

// Help - Order Issues
const OrderNotArrivedPage = lazy(() => import('./pages/user/OrderNotArrivedPage'))
const OrderIncompletePage = lazy(() => import('./pages/user/OrderIncompletePage'))
const OrderDamagedPage = lazy(() => import('./pages/user/OrderDamagedPage'))
const OrderIncorrectPage = lazy(() => import('./pages/user/OrderIncorrectPage'))
const OrderNotReceivedPage = lazy(() => import('./pages/user/OrderNotReceivedPage'))
const CancelOrderPage = lazy(() => import('./pages/user/CancelOrderPage'))
const DriverExpensesPage = lazy(() => import('./pages/user/DriverExpensesPage'))
const OrderNotArrivedFAQPage = lazy(() => import('./pages/user/OrderNotArrivedFAQPage'))
const DriverTrackingHelpPage = lazy(() => import('./pages/user/DriverTrackingHelpPage'))
const ChangePaymentHelpPage = lazy(() => import('./pages/user/ChangePaymentHelpPage'))

// Help - Payment
const TopUpGuidePage = lazy(() => import('./pages/user/TopUpGuidePage'))
const TransactionFailedPage = lazy(() => import('./pages/user/TransactionFailedPage'))
const RefundProcedurePage = lazy(() => import('./pages/user/RefundProcedurePage'))
const VoucherPromoHelpPage = lazy(() => import('./pages/user/VoucherPromoHelpPage'))

// Help - Promo
const VoucherIssuesPage = lazy(() => import('./pages/user/VoucherIssuesPage'))
const NewUserPromoPage = lazy(() => import('./pages/user/NewUserPromoPage'))
const RefundedVoucherPage = lazy(() => import('./pages/user/RefundedVoucherPage'))
const WarungPromoPage = lazy(() => import('./pages/user/WarungPromoPage'))

// Help - Account
const DeleteAccountPage = lazy(() => import('./pages/user/DeleteAccountPage'))
const AccountSecurityPage = lazy(() => import('./pages/user/AccountSecurityPage'))
const EditProfileHelpPage = lazy(() => import('./pages/user/EditProfileHelpPage'))
const ForgotPasswordHelpPage = lazy(() => import('./pages/user/ForgotPasswordHelpPage'))
const OtpIssuesHelpPage = lazy(() => import('./pages/user/OtpIssuesHelpPage'))
const PermissionHelpPage = lazy(() => import('./pages/user/PermissionHelpPage'))

// Partner Registration - Driver
const DriverRegistrationStep1 = lazy(() => import('./pages/user/partner/DriverRegistrationStep1'))
const DriverRegistrationStep2 = lazy(() => import('./pages/user/partner/DriverRegistrationStep2'))
const DriverRegistrationStep3 = lazy(() => import('./pages/user/partner/DriverRegistrationStep3'))
const DriverRegistrationStatus = lazy(() => import('./pages/user/partner/DriverRegistrationStatus'))

// Partner Registration - Merchant
const MerchantRegistrationStep1 = lazy(() => import('./pages/user/partner/MerchantRegistrationStep1'))
const MerchantRegistrationStep2 = lazy(() => import('./pages/user/partner/MerchantRegistrationStep2'))
const MerchantRegistrationStatus = lazy(() => import('./pages/user/partner/MerchantRegistrationStatus'))


// Role-specific Dashboards (separate bundles per role)
const MerchantDashboard = lazy(() => import('./pages/merchant/MerchantDashboard'))
const MerchantMenuPage = lazy(() => import('./pages/merchant/MerchantMenuPage'))
const MerchantAddMenuPage = lazy(() => import('./pages/merchant/MerchantAddMenuPage'))
const MerchantEditMenuPage = lazy(() => import('./pages/merchant/MerchantEditMenuPage'))
const MerchantCategoriesPage = lazy(() => import('./pages/merchant/MerchantCategoriesPage'))
const MerchantOrdersPage = lazy(() => import('./pages/merchant/MerchantOrdersPage'))
const MerchantProfilePage = lazy(() => import('./pages/merchant/MerchantProfilePage'))
const MerchantOrderHistoryPage = lazy(() => import('./pages/merchant/MerchantOrderHistoryPage'))
const MerchantTotalOrdersPage = lazy(() => import('./pages/merchant/MerchantTotalOrdersPage'))
const MerchantSalesReportPage = lazy(() => import('./pages/merchant/MerchantSalesReportPage'))

const MerchantTodayEarningsPage = lazy(() => import('./pages/merchant/MerchantTodayEarningsPage'))
// Merchant Profile Sub-pages
const MerchantEditProfilePage = lazy(() => import('./pages/merchant/MerchantEditProfilePage'))
const MerchantAccountInfoPage = lazy(() => import('./pages/merchant/MerchantAccountInfoPage'))
const MerchantChangePasswordPage = lazy(() => import('./pages/merchant/MerchantChangePasswordPage'))
const MerchantOperatingHoursPage = lazy(() => import('./pages/merchant/MerchantOperatingHoursPage'))
const MerchantBalancePage = lazy(() => import('./pages/merchant/MerchantBalancePage'))
const MerchantAddBankAccountPage = lazy(() => import('./pages/merchant/MerchantAddBankAccountPage'))
const MerchantEditBankAccountPage = lazy(() => import('./pages/merchant/MerchantEditBankAccountPage'))
const MerchantReviewsPage = lazy(() => import('./pages/merchant/MerchantReviewsPage'))
const DriverDashboard = lazy(() => import('./pages/driver/DriverDashboard'))
const DriverOrdersPage = lazy(() => import('./pages/driver/DriverOrdersPage'))
const DriverEarningsPage = lazy(() => import('./pages/driver/DriverEarningsPage'))
const DriverIncomingOrder = lazy(() => import('./pages/driver/order/DriverIncomingOrder'))
const DriverPickupOrder = lazy(() => import('./pages/driver/order/DriverPickupOrder'))
const DriverDeliveryOrder = lazy(() => import('./pages/driver/order/DriverDeliveryOrder'))
const DriverPaymentConfirmation = lazy(() => import('./pages/driver/order/DriverPaymentConfirmation'))
const DriverOrderComplete = lazy(() => import('./pages/driver/order/DriverOrderComplete'))
const DriverEditProfile = lazy(() => import('./pages/driver/DriverEditProfile'))
const DriverNotificationsPage = lazy(() => import('./pages/driver/DriverNotificationsPage'))
const DriverNotificationDetailPage = lazy(() => import('./pages/driver/DriverNotificationDetailPage'))
const DriverVehiclePage = lazy(() => import('./pages/driver/profile/DriverVehiclePage'))
const DriverBankPage = lazy(() => import('./pages/driver/profile/DriverBankPage'))
const DriverAddBankPage = lazy(() => import('./pages/driver/profile/DriverAddBankPage'))
const DriverSecurityPage = lazy(() => import('./pages/driver/profile/DriverSecurityPage'))

// Driver Financial Pages
const DriverTransactionDetail = lazy(() => import('./pages/driver/financial/DriverTransactionDetail'))
const DriverWithdrawalPage = lazy(() => import('./pages/driver/financial/DriverWithdrawalPage'))
const DriverWithdrawalAccount = lazy(() => import('./pages/driver/financial/DriverWithdrawalAccount'))
const DriverWithdrawalConfirm = lazy(() => import('./pages/driver/financial/DriverWithdrawalConfirm'))
const DriverWithdrawalStatus = lazy(() => import('./pages/driver/financial/DriverWithdrawalStatus'))
const DriverDepositPage = lazy(() => import('./pages/driver/financial/DriverDepositPage'))
const DriverDepositVerification = lazy(() => import('./pages/driver/financial/DriverDepositVerification'))

// ... inside App component ...


const DriverProfilePage = lazy(() => import('./pages/driver/DriverProfilePage'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'))
const AdminMerchantsPage = lazy(() => import('./pages/admin/AdminMerchantsPage'))
const AdminMerchantsVerificationPage = lazy(() => import('./pages/admin/AdminMerchantsVerificationPage'))
const AdminMerchantsReviewPage = lazy(() => import('./pages/admin/AdminMerchantsReviewPage'))
const AdminMerchantsEditPage = lazy(() => import('./pages/admin/AdminMerchantsEditPage'))
const AdminDriversPage = lazy(() => import('./pages/admin/AdminDriversPage'))
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'))
const AdminDriversVerificationPage = lazy(() => import('./pages/admin/AdminDriversVerificationPage'))
const AdminDriversReviewPage = lazy(() => import('./pages/admin/AdminDriversReviewPage'))
const AdminDriversEditPage = lazy(() => import('./pages/admin/AdminDriversEditPage'))
const AdminCODPage = lazy(() => import('./pages/admin/AdminCODPage'))
const AdminRevenuePage = lazy(() => import('./pages/admin/AdminRevenuePage'))
const AdminWithdrawalsPage = lazy(() => import('./pages/admin/AdminWithdrawalsPage'))
const AdminPromoPage = lazy(() => import('./pages/admin/AdminPromoPage'))
const AdminCreatePromoPage = lazy(() => import('./pages/admin/AdminCreatePromoPage'))
const AdminIssuesPage = lazy(() => import('./pages/admin/AdminIssuesPage'))
const AdminIssueDetailPage = lazy(() => import('./pages/admin/AdminIssueDetailPage'))
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'))
const AdminFinancesPage = lazy(() => import('./pages/admin/AdminFinancesPage'))
const AdminWithdrawalDetailPage = lazy(() => import('./pages/admin/AdminWithdrawalDetailPage'))
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'))

// ============================================
// APP CONTENT COMPONENT
// ============================================

function AppContent() {
    const { isAuthenticated, logout } = useAuth()
    const [showOnboarding, setShowOnboarding] = useState(true)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const hasCompletedOnboarding = localStorage.getItem('bantoo_onboarding_complete')
        if (hasCompletedOnboarding === 'true') {
            setShowOnboarding(false)
        }
        setIsLoading(false)
    }, [])

    const handleOnboardingComplete = () => {
        localStorage.setItem('bantoo_onboarding_complete', 'true')
        setShowOnboarding(false)
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background-light flex items-center justify-center">
                <div className="text-2xl font-bold text-primary">Bantoo!</div>
            </div>
        )
    }

    // Onboarding flow
    if (showOnboarding) {
        return <OnboardingPage onComplete={handleOnboardingComplete} />
    }

    // Authentication flow (loaded eagerly)
    if (!isAuthenticated) {
        return (
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/otp" element={<OTPVerificationPage />} />
                <Route path="/create-admin-secret" element={<CreateAdminPage />} />
                <Route path="/manage/auth" element={<Suspense fallback={<PageLoader />}><AdminLoginPage /></Suspense>} />
                <Route path="/admin/login" element={<Suspense fallback={<PageLoader />}><AdminLoginPage /></Suspense>} />
                <Route path="*" element={<WelcomePage />} />
            </Routes>
        )
    }

    // Main app routes with lazy loading
    return (
        <div className="bg-background-light min-h-screen">
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    <Route path="/" element={<HomePage />} />

                    {/* Redirect auth pages if already logged in */}
                    <Route path="/login" element={<Navigate to="/" replace />} />
                    <Route path="/register" element={<Navigate to="/" replace />} />

                    {/* Account Suspended */}
                    <Route path="/account-suspended" element={<SuspendedAccountPage />} />

                    {/* ============ MERCHANT ROUTES (Protected) ============ */}
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
                    {/* ============ DRIVER ROUTES (Protected) ============ */}
                    <Route path="/driver/dashboard" element={<ProtectedRoute allowedRoles={['driver']}><DriverDashboard /></ProtectedRoute>} />
                    <Route path="/driver/orders" element={<ProtectedRoute allowedRoles={['driver']}><DriverOrdersPage /></ProtectedRoute>} />
                    <Route path="/driver/earnings" element={<ProtectedRoute allowedRoles={['driver']}><DriverEarningsPage /></ProtectedRoute>} />
                    <Route path="/driver/profile" element={<ProtectedRoute allowedRoles={['driver']}><DriverProfilePage /></ProtectedRoute>} />
                    <Route path="/driver/profile/edit" element={<ProtectedRoute allowedRoles={['driver']}><DriverEditProfile /></ProtectedRoute>} />
                    <Route path="/driver/notifications" element={<ProtectedRoute allowedRoles={['driver']}><DriverNotificationsPage /></ProtectedRoute>} />
                    <Route path="/driver/notifications/:id" element={<ProtectedRoute allowedRoles={['driver']}><DriverNotificationDetailPage /></ProtectedRoute>} />
                    <Route path="/driver/help" element={<ProtectedRoute allowedRoles={['driver']}><HelpCenterPage /></ProtectedRoute>} />

                    {/* Driver Account Sub-Pages */}
                    <Route path="/driver/vehicle" element={<ProtectedRoute allowedRoles={['driver']}><DriverVehiclePage /></ProtectedRoute>} />
                    <Route path="/driver/bank" element={<ProtectedRoute allowedRoles={['driver']}><DriverBankPage /></ProtectedRoute>} />
                    <Route path="/driver/bank/add" element={<ProtectedRoute allowedRoles={['driver']}><DriverAddBankPage /></ProtectedRoute>} />
                    <Route path="/driver/security" element={<ProtectedRoute allowedRoles={['driver']}><DriverSecurityPage /></ProtectedRoute>} />

                    {/* Driver Financial Routes */}
                    <Route path="/driver/earnings/transaction/:id" element={<ProtectedRoute allowedRoles={['driver']}><DriverTransactionDetail /></ProtectedRoute>} />
                    <Route path="/driver/withdrawal" element={<ProtectedRoute allowedRoles={['driver']}><DriverWithdrawalPage /></ProtectedRoute>} />
                    <Route path="/driver/withdrawal/account" element={<ProtectedRoute allowedRoles={['driver']}><DriverWithdrawalAccount /></ProtectedRoute>} />
                    <Route path="/driver/withdrawal/confirm" element={<ProtectedRoute allowedRoles={['driver']}><DriverWithdrawalConfirm /></ProtectedRoute>} />
                    <Route path="/driver/withdrawal/status" element={<ProtectedRoute allowedRoles={['driver']}><DriverWithdrawalStatus /></ProtectedRoute>} />
                    <Route path="/driver/deposit" element={<ProtectedRoute allowedRoles={['driver']}><DriverDepositPage /></ProtectedRoute>} />
                    <Route path="/driver/deposit/verification" element={<ProtectedRoute allowedRoles={['driver']}><DriverDepositVerification /></ProtectedRoute>} />

                    {/* Driver Order Flow (COD) */}
                    <Route path="/driver/order/incoming/:orderId" element={<ProtectedRoute allowedRoles={['driver']}><DriverIncomingOrder /></ProtectedRoute>} />
                    <Route path="/driver/order/pickup" element={<ProtectedRoute allowedRoles={['driver']}><DriverPickupOrder /></ProtectedRoute>} />
                    <Route path="/driver/order/delivery" element={<ProtectedRoute allowedRoles={['driver']}><DriverDeliveryOrder /></ProtectedRoute>} />
                    <Route path="/driver/order/payment" element={<ProtectedRoute allowedRoles={['driver']}><DriverPaymentConfirmation /></ProtectedRoute>} />
                    <Route path="/driver/order/complete" element={<ProtectedRoute allowedRoles={['driver']}><DriverOrderComplete /></ProtectedRoute>} />


                    <Route path="/admin/login" element={<AdminLoginPage />} />
                    <Route path="/admin/dashboard" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/orders" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminOrdersPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/merchants" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminMerchantsPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/merchants/verification" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminMerchantsVerificationPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/merchants/verification/:id" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminMerchantsReviewPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/merchants/edit/:id" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminMerchantsEditPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/drivers" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminDriversPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/users" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminUsersPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/drivers/verification" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminDriversVerificationPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/drivers/verification/:id" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminDriversReviewPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/drivers/edit/:id" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminDriversEditPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/cod" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminCODPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/revenue" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminRevenuePage />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/withdrawals" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminWithdrawalsPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/promos" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminPromoPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/promos/new" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminCreatePromoPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/issues" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminIssuesPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/issues/:id" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminIssueDetailPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/settings" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminSettingsPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/finances" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminFinancesPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/finances/withdrawal/:id" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminWithdrawalDetailPage />
                        </ProtectedRoute>
                    } />


                    {/* Search & Browse */}
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/categories" element={<AllCategoriesPage />} />
                    <Route path="/category/:id" element={<CategoryDetailPage />} />
                    <Route path="/merchant/:id" element={<MerchantDetailPage />} />
                    <Route path="/merchants" element={<AllMerchantsPage />} />
                    <Route path="/popular-menu" element={<AllPopularMenuPage />} />

                    {/* Cart & Checkout Flow */}
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/order-success" element={<OrderSuccessPage />} />

                    {/* Order Management */}
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/order/:id" element={<OrderDetailPage />} />
                    <Route path="/order-detail" element={<OrderDetailPage />} />
                    <Route path="/tracking/:orderId?" element={<TrackingPage />} />
                    <Route path="/review" element={<ReviewPage />} />
                    <Route path="/chat-driver" element={<ChatDriverPage />} />

                    {/* Profile & Settings */}
                    <Route path="/profile" element={<ProfilePage onLogout={logout} />} />
                    <Route path="/profile/edit" element={<EditProfilePage />} />
                    <Route path="/address" element={<AddressListPage />} />
                    <Route path="/address/add" element={<AddAddressPage />} />
                    <Route path="/address/edit" element={<AddAddressPage />} />
                    <Route path="/favorites" element={<FavoritesPage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/payment-methods" element={<PaymentMethodsPage />} />
                    <Route path="/security" element={<SecurityPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/registration-status" element={<RegistrationStatusPage />} />

                    {/* Partner Registration - Driver */}
                    <Route path="/partner/driver/step-1" element={<DriverRegistrationStep1 />} />
                    <Route path="/partner/driver/step-2" element={<DriverRegistrationStep2 />} />
                    <Route path="/partner/driver/step-3" element={<DriverRegistrationStep3 />} />
                    <Route path="/partner/driver/status" element={<DriverRegistrationStatus />} />

                    {/* Partner Registration - Merchant */}
                    <Route path="/partner/merchant/step-1" element={<MerchantRegistrationStep1 />} />
                    <Route path="/partner/merchant/step-2" element={<MerchantRegistrationStep2 />} />
                    <Route path="/partner/merchant/status" element={<MerchantRegistrationStatus />} />

                    {/* Help Center - Main */}
                    <Route path="/help" element={<HelpCenterPage />} />
                    <Route path="/help/order" element={<HelpOrderPage />} />
                    <Route path="/help/payment" element={<HelpPaymentPage />} />
                    <Route path="/help/promo" element={<HelpPromoPage />} />
                    <Route path="/help/account" element={<HelpAccountPage />} />
                    <Route path="/help/security" element={<HelpSecurityPage />} />

                    {/* Help - Order Issues */}
                    <Route path="/help/order/not-arrived" element={<OrderNotArrivedPage />} />
                    <Route path="/help/order/incomplete" element={<OrderIncompletePage />} />
                    <Route path="/help/order/damaged" element={<OrderDamagedPage />} />
                    <Route path="/help/order/incorrect" element={<OrderIncorrectPage />} />
                    <Route path="/help/order/not-received" element={<OrderNotReceivedPage />} />
                    <Route path="/help/order/cancel" element={<CancelOrderPage />} />
                    <Route path="/help/order/driver-expenses" element={<DriverExpensesPage />} />

                    {/* Help - Payment */}
                    <Route path="/help/payment/methods" element={<PaymentMethodsPage />} />
                    <Route path="/help/payment/topup" element={<TopUpGuidePage />} />
                    <Route path="/help/payment/failed" element={<TransactionFailedPage />} />
                    <Route path="/help/payment/refund" element={<RefundProcedurePage />} />
                    <Route path="/help/payment/voucher" element={<VoucherPromoHelpPage />} />

                    {/* Help - Promo */}
                    <Route path="/help/promo/voucher-issues" element={<VoucherIssuesPage />} />
                    <Route path="/help/promo/new-user" element={<NewUserPromoPage />} />
                    <Route path="/help/promo/refunded-voucher" element={<RefundedVoucherPage />} />
                    <Route path="/help/promo/warung" element={<WarungPromoPage />} />

                    {/* Help - Account */}
                    <Route path="/help/account/delete" element={<DeleteAccountPage />} />
                    <Route path="/help/account/security" element={<AccountSecurityPage />} />
                    <Route path="/help/account/edit-profile" element={<EditProfileHelpPage />} />
                    <Route path="/help/account/forgot-password" element={<ForgotPasswordHelpPage />} />
                    <Route path="/help/account/otp-issues" element={<OtpIssuesHelpPage />} />

                    {/* Help - Security */}
                    <Route path="/help/security/permissions" element={<PermissionHelpPage />} />

                    {/* Help - Misc */}
                    <Route path="/help/partner-registration" element={<PartnerRegistrationPage />} />
                    <Route path="/help/driver-tracking" element={<DriverTrackingHelpPage />} />
                    <Route path="/help/change-payment" element={<ChangePaymentHelpPage />} />
                    <Route path="/help/order-not-arrived-faq" element={<OrderNotArrivedFAQPage />} />

                    {/* Fallback - 404 */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Suspense>
        </div>
    )
}

// ============================================
// ROOT APP COMPONENT
// ============================================

function App() {
    return (
        <AppErrorBoundary >
            <ToastProvider>
                <AuthProvider>
                    <CartProvider>
                        <AddressProvider>
                            <FavoritesProvider>
                                <NotificationsProvider>
                                    <PartnerRegistrationProvider>
                                        <OrderProvider>
                                            <AppContent />
                                            <ToastNotification />
                                        </OrderProvider>
                                    </PartnerRegistrationProvider>
                                </NotificationsProvider>
                            </FavoritesProvider>
                        </AddressProvider>
                    </CartProvider>
                </AuthProvider>
            </ToastProvider>
        </AppErrorBoundary >
    )
}

export default App
