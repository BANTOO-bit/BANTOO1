import { lazy, Suspense } from 'react'
import AppProviders from '@/features/shared/components/AppProviders'
import ToastNotification from '@/features/shared/components/ToastNotification'
import PageLoader from '@/features/shared/components/PageLoader'

// Lazy load the entire routing layer to split the bundle
const AppRoutes = lazy(() => import('./routes'))

// ============================================
// ROOT APP COMPONENT
// ============================================

function App() {
    return (
        <AppProviders>
            <Suspense fallback={<PageLoader />}>
                <AppRoutes />
            </Suspense>
            <ToastNotification />
        </AppProviders>
    )
}

export default App
