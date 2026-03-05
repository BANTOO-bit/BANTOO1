import { HelmetProvider } from 'react-helmet-async'
import { CartProvider } from '@/context/CartContext'
import { AddressProvider } from '@/context/AddressContext'
import { FavoritesProvider } from '@/context/FavoritesContext'
import { NotificationsProvider } from '@/context/NotificationsContext'
import { AuthProvider } from '@/context/AuthContext'
import { PartnerRegistrationProvider } from '@/context/PartnerRegistrationContext'
import { OrderProvider } from '@/context/OrderContext'
import { ToastProvider, useToast } from '@/context/ToastContext'
import { SWRConfig } from 'swr'
import AppErrorBoundary from '@/features/shared/components/AppErrorBoundary'
import { handleError } from '@/utils/errorHandler'

/**
 * AppProviders — Consolidates all context providers into a single wrapper.
 * Eliminates pyramid-of-doom nesting in App.jsx.
 * 
 * Provider order matters: each provider can depend on providers above it.
 * - ToastProvider: independent, used by everything
 * - AuthProvider: depends on Toast (for error messages)
 * - CartProvider: depends on Auth (user-scoped cart)
 * - AddressProvider: depends on Auth
 * - FavoritesProvider: depends on Auth
 * - NotificationsProvider: depends on Auth
 * - PartnerRegistrationProvider: depends on Auth
 * - OrderProvider: depends on Auth
 */
const providers = [
    HelmetProvider,
    AppErrorBoundary,
    ToastProvider,
    AuthProvider,
    CartProvider,
    AddressProvider,
    FavoritesProvider,
    NotificationsProvider,
    PartnerRegistrationProvider,
    OrderProvider,
]

function AppProviders({ children }) {
    // We render ToastProvider first manually so that SWR can use the toast context locally
    return (
        <HelmetProvider>
            <AppErrorBoundary>
                <ToastProvider>
                    <SWRProviderWrapper>
                        {
                            providers.slice(3).reduceRight(
                                (acc, Provider) => <Provider>{acc}</Provider>,
                                children
                            )
                        }
                    </SWRProviderWrapper>
                </ToastProvider>
            </AppErrorBoundary>
        </HelmetProvider>
    )
}

// Inner wrapper to inject Toast context into SWR global error handler
function SWRProviderWrapper({ children }) {
    const toast = useToast()

    return (
        <SWRConfig
            value={{
                revalidateOnFocus: false, // Prevent aggressive re-fetching on tab switch
                shouldRetryOnError: true,
                errorRetryCount: 3,
                onError: (error, key) => {
                    if (error.status !== 403 && error.status !== 404) {
                        handleError(error, toast, { context: `SWR Fetch: ${key}` })
                    }
                }
            }}
        >
            {children}
        </SWRConfig>
    )
}

export default AppProviders
