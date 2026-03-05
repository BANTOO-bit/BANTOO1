/**
 * helpArticles.js — Central registry mapping route slugs to help article metadata.
 * Each article has a title and a lazy-loaded content component.
 * Used by HelpArticlePage.jsx for data-driven rendering.
 */

const helpArticles = {
    // === Order Issues ===
    'order/not-arrived': {
        title: 'Pesanan Belum Sampai',
        content: () => import('@/features/customer/pages/help/order/OrderNotArrivedPage'),
    },
    'order/incomplete': {
        title: 'Pesanan Tidak Lengkap',
        content: () => import('@/features/customer/pages/help/order/OrderIncompletePage'),
    },
    'order/damaged': {
        title: 'Pesanan Rusak',
        content: () => import('@/features/customer/pages/help/order/OrderDamagedPage'),
    },
    'order/incorrect': {
        title: 'Pesanan Tidak Sesuai',
        content: () => import('@/features/customer/pages/help/order/OrderIncorrectPage'),
    },
    'order/not-received': {
        title: 'Pesanan Belum Diterima',
        content: () => import('@/features/customer/pages/help/order/OrderNotReceivedPage'),
    },
    'order/cancel': {
        title: 'Batalkan Pesanan',
        content: () => import('@/features/customer/pages/help/order/CancelOrderPage'),
    },
    'order/driver-expenses': {
        title: 'Biaya Antar Driver',
        content: () => import('@/features/customer/pages/help/order/DriverExpensesPage'),
    },

    // === Payment ===
    'payment/topup': {
        title: 'Cara Top Up',
        content: () => import('@/features/customer/pages/help/payment/TopUpGuidePage'),
    },
    'payment/failed': {
        title: 'Transaksi Gagal',
        content: () => import('@/features/customer/pages/help/payment/TransactionFailedPage'),
    },
    'payment/refund': {
        title: 'Prosedur Refund',
        content: () => import('@/features/customer/pages/help/payment/RefundProcedurePage'),
    },
    'payment/voucher': {
        title: 'Voucher & Promo',
        content: () => import('@/features/customer/pages/help/payment/VoucherPromoHelpPage'),
    },

    // === Promo ===
    'promo/voucher-issues': {
        title: 'Masalah Voucher',
        content: () => import('@/features/customer/pages/help/promo/VoucherIssuesPage'),
    },
    'promo/new-user': {
        title: 'Promo Pengguna Baru',
        content: () => import('@/features/customer/pages/help/promo/NewUserPromoPage'),
    },
    'promo/refunded-voucher': {
        title: 'Voucher Dikembalikan',
        content: () => import('@/features/customer/pages/help/promo/RefundedVoucherPage'),
    },
    'promo/warung': {
        title: 'Promo Warung',
        content: () => import('@/features/customer/pages/help/promo/WarungPromoPage'),
    },

    // === Account ===
    'account/delete': {
        title: 'Hapus Akun',
        content: () => import('@/features/customer/pages/help/account/DeleteAccountPage'),
    },
    'account/security': {
        title: 'Keamanan Akun',
        content: () => import('@/features/customer/pages/help/account/AccountSecurityPage'),
    },
    'account/edit-profile': {
        title: 'Mengubah Profil',
        content: () => import('@/features/customer/pages/help/account/EditProfileHelpPage'),
    },
    'account/otp-issues': {
        title: 'Masalah Kode OTP',
        content: () => import('@/features/customer/pages/help/account/OtpIssuesHelpPage'),
    },

    // === Security ===
    'security/permissions': {
        title: 'Izin Lokasi & Notifikasi',
        content: () => import('@/features/customer/pages/help/security/PermissionHelpPage'),
    },

    // === Misc (top-level help routes) ===
    'driver-tracking': {
        title: 'Lacak Driver',
        content: () => import('@/features/customer/pages/help/order/DriverTrackingHelpPage'),
    },
    'change-payment': {
        title: 'Ubah Metode Pembayaran',
        content: () => import('@/features/customer/pages/help/order/ChangePaymentHelpPage'),
    },
    'order-not-arrived-faq': {
        title: 'FAQ Pesanan Belum Sampai',
        content: () => import('@/features/customer/pages/help/order/OrderNotArrivedFAQPage'),
    },
}

export default helpArticles
