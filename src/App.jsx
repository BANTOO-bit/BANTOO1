import { lazy, Suspense } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { CartProvider } from './context/CartContext'
import { AddressProvider } from './context/AddressContext'
import { FavoritesProvider } from './context/FavoritesContext'
import { NotificationsProvider } from './context/NotificationsContext'
import { AuthProvider } from './context/AuthContext'
import { PartnerRegistrationProvider } from './context/PartnerRegistrationContext'
import { OrderProvider } from './context/OrderContext'
import { ToastProvider } from './context/ToastContext'

import AppErrorBoundary from './components/shared/AppErrorBoundary'
import ToastNotification from './components/shared/ToastNotification'
import PageLoader from './components/shared/PageLoader'

// Lazy load the entire routing layer to split the bundle
const AppRoutes = lazy(() => import('./routes'))

// ============================================
// ROOT APP COMPONENT
// ============================================

function App() {
    return (
        <HelmetProvider>
            <AppErrorBoundary >
                <ToastProvider>
                    <AuthProvider>
                        <CartProvider>
                            <AddressProvider>
                                <FavoritesProvider>
                                    <NotificationsProvider>
                                        <PartnerRegistrationProvider>
                                            <OrderProvider>
                                                <Suspense fallback={<PageLoader />}>
                                                    <AppRoutes />
                                                </Suspense>
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
        </HelmetProvider>
    )
}

export default App
