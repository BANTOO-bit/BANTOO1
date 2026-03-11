import { lazy, Suspense } from 'react'
import AppProviders from '@/features/shared/components/AppProviders'
import ToastNotification from '@/features/shared/components/ToastNotification'
import OfflineBanner from '@/features/shared/components/OfflineBanner'
import PageLoader from '@/features/shared/components/PageLoader'
import GlobalErrorBoundary from '@/features/shared/components/GlobalErrorBoundary'

// Lazy load the entire routing layer to split the bundle
const AppRoutes = lazy(() => import('./routes'))

// ============================================
// ROOT APP COMPONENT
// ============================================

function App() {
    return (
        <AppProviders>
            <OfflineBanner />
            <GlobalErrorBoundary>
                <Suspense fallback={<PageLoader />}>
                    <AppRoutes />
                </Suspense>
            </GlobalErrorBoundary>
            <ToastNotification />
        </AppProviders>
    )
}

export default App
