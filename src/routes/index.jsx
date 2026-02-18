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
    const { isAuthenticated, user, logout } = useAuth()

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

    // ============ ADMIN ROLE LOCK ============
    // Admin users are permanently locked to admin routes.
    // They cannot access customer/merchant/driver apps under any condition.
    const isAdmin = user?.roles?.includes('admin')

    // Main app routes with lazy loading
    return (
        <div className="bg-background-light min-h-screen">
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    {/* Redirect auth pages if already logged in */}
                    <Route path="/login" element={<Navigate to={isAdmin ? '/admin/dashboard' : '/'} replace />} />
                    <Route path="/register" element={<Navigate to={isAdmin ? '/admin/dashboard' : '/'} replace />} />

                    {/* Account Suspended — admin never goes here */}
                    <Route path="/account-suspended" element={
                        isAdmin ? <Navigate to="/admin/dashboard" replace /> : <SuspendedAccountPage />
                    } />

                    {/* ============ ROLE-SPECIFIC ROUTES ============ */}
                    {MerchantRoutes()}
                    {DriverRoutes()}
                    {AdminRoutes()}

                    {/* ============ USER (CUSTOMER) ROUTES ============ */}
                    {UserRoutes({ logout })}

                    {/* Fallback - Admin goes to admin dashboard, others get 404 */}
                    <Route path="*" element={
                        isAdmin
                            ? <Navigate to="/admin/dashboard" replace />
                            : <NotFoundPage />
                    } />
                </Routes>
            </Suspense>
        </div>
    )
}
