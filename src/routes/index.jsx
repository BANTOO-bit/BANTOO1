import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

import PageLoader from '@/features/shared/components/PageLoader'
import SuspendedAccountPage from '@/features/shared/pages/SuspendedAccountPage'
import TerminatedAccountPage from '@/features/shared/pages/TerminatedAccountPage'

import { AuthRoutes, OnboardingPage } from './authRoutes'
import UserRoutes from './userRoutes'
import MerchantRoutes from './merchantRoutes'
import DriverRoutes from './driverRoutes'
import AdminRoutes from './adminRoutes'

const NotFoundPage = lazy(() => import('@/features/shared/pages/NotFoundPage'))

export default function AppRoutes() {
    const { isAuthenticated, user, logout, refreshProfile } = useAuth()

    // Authentication flow
    if (!isAuthenticated) {
        return <AuthRoutes />
    }

    // Onboarding state (Wait until profile is loaded)
    const hasCompletedOnboarding = user?.has_completed_onboarding

    // Show onboarding for authenticated users who haven't completed it
    if (hasCompletedOnboarding === false) {
        return (
            <div className="bg-white min-h-screen">
                <OnboardingPage onComplete={async () => {
                    const { supabase } = await import('@/services/supabaseClient')
                    if (user?.id) {
                        await supabase.from('profiles').update({ has_completed_onboarding: true }).eq('id', user.id)
                        await refreshProfile()
                    }
                }} />
            </div>
        )
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
                    <Route path="/account-terminated" element={
                        isAdmin ? <Navigate to="/admin/dashboard" replace /> : <TerminatedAccountPage />
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
