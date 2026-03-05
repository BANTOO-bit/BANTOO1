import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import PageLoader from '@/features/shared/components/PageLoader'

// Auth Pages (loaded eagerly for fast initial experience)
import OnboardingPage from '@/features/shared/pages/OnboardingPage'
import WelcomePage from '@/features/shared/pages/WelcomePage'
import LoginPage from '@/features/shared/pages/LoginPage'
import RegisterPage from '@/features/shared/pages/RegisterPage'
import OTPVerificationPage from '@/features/shared/pages/OTPVerificationPage'
import ForgotPasswordHelpPage from '@/features/customer/pages/help/account/ForgotPasswordHelpPage'
import ResetPasswordPage from '@/features/shared/pages/ResetPasswordPage'
import VerifyEmailInstructionPage from '@/features/shared/pages/VerifyEmailInstructionPage'

const AdminLoginPage = lazy(() => import('@/features/admin/pages/dashboard/AdminLoginPage'))

export function AuthRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailInstructionPage />} />
            <Route path="/otp" element={<OTPVerificationPage />} />
            <Route path="/help/account/forgot-password" element={<ForgotPasswordHelpPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/manage/auth" element={<Suspense fallback={<PageLoader />}><AdminLoginPage /></Suspense>} />
            <Route path="/admin/login" element={<Suspense fallback={<PageLoader />}><AdminLoginPage /></Suspense>} />
            <Route path="*" element={<WelcomePage />} />
        </Routes>
    )
}

export { OnboardingPage }
export default AuthRoutes
