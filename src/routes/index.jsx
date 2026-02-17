import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

import PageLoader from '../components/shared/PageLoader'
import SuspendedAccountPage from '../pages/shared/SuspendedAccountPage'

import { AuthRoutes, OnboardingPage } from './authRoutes'
import UserRoutes from './userRoutes'
import MerchantRoutes from './merchantRoutes'
import DriverRoutes from './driverRoutes'
import AdminRoutes from './adminRoutes'

const NotFoundPage = lazy(() => import('../pages/shared/NotFoundPage'))

export default function AppRoutes() {
    const { isAuthenticated, logout } = useAuth()

    // Onboarding state
    const hasCompletedOnboarding = typeof window !== 'undefined'
        ? localStorage.getItem('bantoo_onboarding_complete') === 'true'
        : false

    // Show onboarding for new users
    if (!hasCompletedOnboarding) {
        return (
            <OnboardingPage onComplete={() => {
                localStorage.setItem('bantoo_onboarding_complete', 'true')
                window.location.reload()
            }} />
        )
    }

    // Authentication flow
    if (!isAuthenticated) {
        return <AuthRoutes />
    }

    // Main app routes with lazy loading
    return (
        <div className="bg-background-light min-h-screen">
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    {/* Redirect auth pages if already logged in */}
                    <Route path="/login" element={<Navigate to="/" replace />} />
                    <Route path="/register" element={<Navigate to="/" replace />} />

                    {/* Account Suspended */}
                    <Route path="/account-suspended" element={<SuspendedAccountPage />} />

                    {/* ============ ROLE-SPECIFIC ROUTES ============ */}
                    {MerchantRoutes()}
                    {DriverRoutes()}
                    {AdminRoutes()}

                    {/* ============ USER (CUSTOMER) ROUTES ============ */}
                    {UserRoutes({ logout })}

                    {/* Fallback - 404 */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Suspense>
        </div>
    )
}
