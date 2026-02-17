import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import PageLoader from '../components/shared/PageLoader'

// Auth Pages (loaded eagerly for fast initial experience)
import OnboardingPage from '../pages/shared/OnboardingPage'
import WelcomePage from '../pages/shared/WelcomePage'
import LoginPage from '../pages/shared/LoginPage'
import RegisterPage from '../pages/shared/RegisterPage'
import OTPVerificationPage from '../pages/shared/OTPVerificationPage'
import CreateAdminPage from '../pages/shared/CreateAdminPage'

const AdminLoginPage = lazy(() => import('../pages/admin/dashboard/AdminLoginPage'))

export function AuthRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/otp" element={<OTPVerificationPage />} />
            <Route path="/create-admin-secret" element={<CreateAdminPage />} />
            <Route path="/manage/auth" element={<Suspense fallback={<PageLoader />}><AdminLoginPage /></Suspense>} />
            <Route path="/admin/login" element={<Suspense fallback={<PageLoader />}><AdminLoginPage /></Suspense>} />
            <Route path="*" element={<WelcomePage />} />
        </Routes>
    )
}

export { OnboardingPage }
export default AuthRoutes
