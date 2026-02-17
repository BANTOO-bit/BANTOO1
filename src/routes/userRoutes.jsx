import { lazy } from 'react'
import { Route } from 'react-router-dom'

// ============================================
// LAZY LOADED USER PAGES
// ============================================

// Core User Pages
const HomePage = lazy(() => import('../pages/user/home/HomePage'))
const SearchPage = lazy(() => import('../pages/user/browse/SearchPage'))
const OrdersPage = lazy(() => import('../pages/user/order/OrdersPage'))
const ProfilePage = lazy(() => import('../pages/user/profile/ProfilePage'))

// Browse & Discovery
const MerchantDetailPage = lazy(() => import('../pages/user/browse/MerchantDetailPage'))
const AllMerchantsPage = lazy(() => import('../pages/user/browse/AllMerchantsPage'))
const AllPopularMenuPage = lazy(() => import('../pages/user/browse/AllPopularMenuPage'))
const AllCategoriesPage = lazy(() => import('../pages/user/browse/AllCategoriesPage'))
const CategoryDetailPage = lazy(() => import('../pages/user/browse/CategoryDetailPage'))

// Order Flow
const CartPage = lazy(() => import('../pages/user/order/CartPage'))
const CheckoutPage = lazy(() => import('../pages/user/order/CheckoutPage'))
const OrderSuccessPage = lazy(() => import('../pages/user/order/OrderSuccessPage'))
const OrderDetailPage = lazy(() => import('../pages/user/order/OrderDetailPage'))
const TrackingPage = lazy(() => import('../pages/user/order/TrackingPage'))
const ReviewPage = lazy(() => import('../pages/user/order/ReviewPage'))
const ChatDriverPage = lazy(() => import('../pages/user/order/ChatDriverPage'))

// Profile & Settings
const EditProfilePage = lazy(() => import('../pages/user/profile/EditProfilePage'))
const FavoritesPage = lazy(() => import('../pages/user/profile/FavoritesPage'))
const PaymentMethodsPage = lazy(() => import('../pages/user/profile/PaymentMethodsPage'))
const SecurityPage = lazy(() => import('../pages/user/profile/SecurityPage'))
const AboutPage = lazy(() => import('../pages/user/profile/AboutPage'))
const RegistrationStatusPage = lazy(() => import('../pages/user/profile/RegistrationStatusPage'))

// Address
const AddressListPage = lazy(() => import('../pages/user/address/AddressListPage'))
const AddAddressPage = lazy(() => import('../pages/user/address/AddAddressPage'))

// Notifications
const NotificationsPage = lazy(() => import('../pages/user/notifications/NotificationsPage'))

// Shared Pages
const TermsPage = lazy(() => import('../pages/shared/TermsPage'))
const PartnerRegistrationPage = lazy(() => import('../pages/shared/PartnerRegistrationPage'))

// Help Center - Main
const HelpCenterPage = lazy(() => import('../pages/user/help/HelpCenterPage'))
const HelpOrderPage = lazy(() => import('../pages/user/help/HelpOrderPage'))
const HelpPaymentPage = lazy(() => import('../pages/user/help/HelpPaymentPage'))
const HelpPromoPage = lazy(() => import('../pages/user/help/HelpPromoPage'))
const HelpAccountPage = lazy(() => import('../pages/user/help/HelpAccountPage'))
const HelpSecurityPage = lazy(() => import('../pages/user/help/HelpSecurityPage'))
const HelpDetailPage = lazy(() => import('../pages/user/help/HelpDetailPage'))

// Help - Order Issues
const OrderNotArrivedPage = lazy(() => import('../pages/user/help/order/OrderNotArrivedPage'))
const OrderIncompletePage = lazy(() => import('../pages/user/help/order/OrderIncompletePage'))
const OrderDamagedPage = lazy(() => import('../pages/user/help/order/OrderDamagedPage'))
const OrderIncorrectPage = lazy(() => import('../pages/user/help/order/OrderIncorrectPage'))
const OrderNotReceivedPage = lazy(() => import('../pages/user/help/order/OrderNotReceivedPage'))
const CancelOrderPage = lazy(() => import('../pages/user/help/order/CancelOrderPage'))
const DriverExpensesPage = lazy(() => import('../pages/user/help/order/DriverExpensesPage'))
const OrderNotArrivedFAQPage = lazy(() => import('../pages/user/help/order/OrderNotArrivedFAQPage'))
const DriverTrackingHelpPage = lazy(() => import('../pages/user/help/order/DriverTrackingHelpPage'))
const ChangePaymentHelpPage = lazy(() => import('../pages/user/help/order/ChangePaymentHelpPage'))

// Help - Payment
const TopUpGuidePage = lazy(() => import('../pages/user/help/payment/TopUpGuidePage'))
const TransactionFailedPage = lazy(() => import('../pages/user/help/payment/TransactionFailedPage'))
const RefundProcedurePage = lazy(() => import('../pages/user/help/payment/RefundProcedurePage'))
const VoucherPromoHelpPage = lazy(() => import('../pages/user/help/payment/VoucherPromoHelpPage'))

// Help - Promo
const VoucherIssuesPage = lazy(() => import('../pages/user/help/promo/VoucherIssuesPage'))
const NewUserPromoPage = lazy(() => import('../pages/user/help/promo/NewUserPromoPage'))
const RefundedVoucherPage = lazy(() => import('../pages/user/help/promo/RefundedVoucherPage'))
const WarungPromoPage = lazy(() => import('../pages/user/help/promo/WarungPromoPage'))

// Help - Account
const DeleteAccountPage = lazy(() => import('../pages/user/help/account/DeleteAccountPage'))
const AccountSecurityPage = lazy(() => import('../pages/user/help/account/AccountSecurityPage'))
const EditProfileHelpPage = lazy(() => import('../pages/user/help/account/EditProfileHelpPage'))
const ForgotPasswordHelpPage = lazy(() => import('../pages/user/help/account/ForgotPasswordHelpPage'))
const OtpIssuesHelpPage = lazy(() => import('../pages/user/help/account/OtpIssuesHelpPage'))

// Help - Security
const PermissionHelpPage = lazy(() => import('../pages/user/help/security/PermissionHelpPage'))

// Partner Registration - Driver
const DriverRegistrationStep1 = lazy(() => import('../pages/user/partner/DriverRegistrationStep1'))
const DriverRegistrationStep2 = lazy(() => import('../pages/user/partner/DriverRegistrationStep2'))
const DriverRegistrationStep3 = lazy(() => import('../pages/user/partner/DriverRegistrationStep3'))
const DriverRegistrationStatus = lazy(() => import('../pages/user/partner/DriverRegistrationStatus'))

// Partner Registration - Merchant
const MerchantRegistrationStep1 = lazy(() => import('../pages/user/partner/MerchantRegistrationStep1'))
const MerchantRegistrationStep2 = lazy(() => import('../pages/user/partner/MerchantRegistrationStep2'))
const MerchantRegistrationStatus = lazy(() => import('../pages/user/partner/MerchantRegistrationStatus'))


// ============================================
// USER ROUTES EXPORT
// ============================================

export default function UserRoutes({ logout }) {
    return (
        <>
            <Route path="/" element={<HomePage />} />

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
        </>
    )
}
