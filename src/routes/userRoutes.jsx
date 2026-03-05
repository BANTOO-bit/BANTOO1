import { lazy } from 'react'
import { Route } from 'react-router-dom'
import RoleLockRedirect from '@/features/shared/components/RoleLockRedirect'

// ============================================
// LAZY LOADED USER PAGES
// ============================================

// Core User Pages
const HomePage = lazy(() => import('@/features/customer/pages/home/HomePage'))
const SearchPage = lazy(() => import('@/features/customer/pages/browse/SearchPage'))
const OrdersPage = lazy(() => import('@/features/customer/pages/order/OrdersPage'))
const ProfilePage = lazy(() => import('@/features/customer/pages/profile/ProfilePage'))

// Browse & Discovery
const MerchantDetailPage = lazy(() => import('@/features/customer/pages/browse/MerchantDetailPage'))
const AllMerchantsPage = lazy(() => import('@/features/customer/pages/browse/AllMerchantsPage'))
const AllPopularMenuPage = lazy(() => import('@/features/customer/pages/browse/AllPopularMenuPage'))
const AllCategoriesPage = lazy(() => import('@/features/customer/pages/browse/AllCategoriesPage'))
const CategoryDetailPage = lazy(() => import('@/features/customer/pages/browse/CategoryDetailPage'))

// Order Flow
const CartPage = lazy(() => import('@/features/customer/pages/order/CartPage'))
const CheckoutPage = lazy(() => import('@/features/customer/pages/order/CheckoutPage'))
const PaymentSimulationPage = lazy(() => import('@/features/customer/pages/order/PaymentSimulationPage'))
const OrderSuccessPage = lazy(() => import('@/features/customer/pages/order/OrderSuccessPage'))
const OrderDetailPage = lazy(() => import('@/features/customer/pages/order/OrderDetailPage'))
const TrackingPage = lazy(() => import('@/features/customer/pages/order/TrackingPage'))
const ReviewPage = lazy(() => import('@/features/customer/pages/order/ReviewPage'))
const ChatDriverPage = lazy(() => import('@/features/customer/pages/order/ChatDriverPage'))

// Profile & Settings
const EditProfilePage = lazy(() => import('@/features/customer/pages/profile/EditProfilePage'))
const FavoritesPage = lazy(() => import('@/features/customer/pages/profile/FavoritesPage'))
const PaymentMethodsPage = lazy(() => import('@/features/customer/pages/profile/PaymentMethodsPage'))
const SecurityPage = lazy(() => import('@/features/customer/pages/profile/SecurityPage'))
const AboutPage = lazy(() => import('@/features/customer/pages/profile/AboutPage'))
const RegistrationStatusPage = lazy(() => import('@/features/customer/pages/profile/RegistrationStatusPage'))

// Address
const AddressListPage = lazy(() => import('@/features/customer/pages/address/AddressListPage'))
const AddAddressPage = lazy(() => import('@/features/customer/pages/address/AddAddressPage'))

// Notifications
const NotificationsPage = lazy(() => import('@/features/customer/pages/notifications/NotificationsPage'))

// Shared Pages
const TermsPage = lazy(() => import('@/features/shared/pages/TermsPage'))
const PartnerRegistrationPage = lazy(() => import('@/features/shared/pages/PartnerRegistrationPage'))

// Help Center - Main
const HelpCenterPage = lazy(() => import('@/features/customer/pages/help/HelpCenterPage'))
const HelpOrderPage = lazy(() => import('@/features/customer/pages/help/HelpOrderPage'))
const HelpPaymentPage = lazy(() => import('@/features/customer/pages/help/HelpPaymentPage'))
const HelpPromoPage = lazy(() => import('@/features/customer/pages/help/HelpPromoPage'))
const HelpAccountPage = lazy(() => import('@/features/customer/pages/help/HelpAccountPage'))
const HelpSecurityPage = lazy(() => import('@/features/customer/pages/help/HelpSecurityPage'))

// Help - Data-driven article page (replaces 23+ individual detail page imports)
const HelpArticlePage = lazy(() => import('@/features/customer/pages/help/HelpArticlePage'))

// Partner Registration - Driver
const DriverRegistrationStep1 = lazy(() => import('@/features/customer/pages/partner/DriverRegistrationStep1'))
const DriverRegistrationStep2 = lazy(() => import('@/features/customer/pages/partner/DriverRegistrationStep2'))
const DriverRegistrationStep3 = lazy(() => import('@/features/customer/pages/partner/DriverRegistrationStep3'))
const DriverRegistrationStatus = lazy(() => import('@/features/customer/pages/partner/DriverRegistrationStatus'))

// Partner Registration - Merchant
const MerchantRegistrationStep1 = lazy(() => import('@/features/customer/pages/partner/MerchantRegistrationStep1'))
const MerchantRegistrationStep2 = lazy(() => import('@/features/customer/pages/partner/MerchantRegistrationStep2'))
const MerchantRegistrationStatus = lazy(() => import('@/features/customer/pages/partner/MerchantRegistrationStatus'))


// ============================================
// USER ROUTES EXPORT
// ============================================

export default function UserRoutes({ logout }) {
    return (
        <>
            <Route path="/" element={<RoleLockRedirect><HomePage /></RoleLockRedirect>} />

            {/* Search & Browse */}
            <Route path="/search" element={<RoleLockRedirect><SearchPage /></RoleLockRedirect>} />
            <Route path="/categories" element={<RoleLockRedirect><AllCategoriesPage /></RoleLockRedirect>} />
            <Route path="/category/:id" element={<RoleLockRedirect><CategoryDetailPage /></RoleLockRedirect>} />
            <Route path="/merchant/:id" element={<RoleLockRedirect><MerchantDetailPage /></RoleLockRedirect>} />
            <Route path="/merchants" element={<RoleLockRedirect><AllMerchantsPage /></RoleLockRedirect>} />
            <Route path="/popular-menu" element={<RoleLockRedirect><AllPopularMenuPage /></RoleLockRedirect>} />

            {/* Cart & Checkout Flow */}
            <Route path="/cart" element={<RoleLockRedirect><CartPage /></RoleLockRedirect>} />
            <Route path="/checkout" element={<RoleLockRedirect><CheckoutPage /></RoleLockRedirect>} />
            <Route path="/payment-simulation/:orderId" element={<RoleLockRedirect><PaymentSimulationPage /></RoleLockRedirect>} />
            <Route path="/order-success" element={<RoleLockRedirect><OrderSuccessPage /></RoleLockRedirect>} />

            {/* Order Management */}
            <Route path="/orders" element={<RoleLockRedirect><OrdersPage /></RoleLockRedirect>} />
            <Route path="/order/:id" element={<RoleLockRedirect><OrderDetailPage /></RoleLockRedirect>} />
            <Route path="/order-detail/:orderId?" element={<RoleLockRedirect><OrderDetailPage /></RoleLockRedirect>} />
            <Route path="/tracking/:orderId?" element={<RoleLockRedirect><TrackingPage /></RoleLockRedirect>} />
            <Route path="/review/:orderId?" element={<RoleLockRedirect><ReviewPage /></RoleLockRedirect>} />
            <Route path="/chat-driver/:orderId" element={<RoleLockRedirect><ChatDriverPage /></RoleLockRedirect>} />

            {/* Profile & Settings */}
            <Route path="/profile" element={<RoleLockRedirect><ProfilePage onLogout={logout} /></RoleLockRedirect>} />
            <Route path="/profile/edit" element={<RoleLockRedirect><EditProfilePage /></RoleLockRedirect>} />
            <Route path="/address" element={<RoleLockRedirect><AddressListPage /></RoleLockRedirect>} />
            <Route path="/address/add" element={<RoleLockRedirect><AddAddressPage /></RoleLockRedirect>} />
            <Route path="/address/edit" element={<RoleLockRedirect><AddAddressPage /></RoleLockRedirect>} />
            <Route path="/favorites" element={<RoleLockRedirect><FavoritesPage /></RoleLockRedirect>} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/payment-methods" element={<RoleLockRedirect><PaymentMethodsPage /></RoleLockRedirect>} />
            <Route path="/security" element={<RoleLockRedirect><SecurityPage /></RoleLockRedirect>} />
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

            {/* Help - Dynamic detail articles (data-driven) */}
            <Route path="/help/partner-registration" element={<PartnerRegistrationPage />} />
            <Route path="/help/payment/methods" element={<PaymentMethodsPage />} />
            <Route path="/help/:category/:slug" element={<HelpArticlePage />} />
            <Route path="/help/:category" element={<HelpArticlePage />} />
        </>
    )
}
