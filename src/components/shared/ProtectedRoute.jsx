import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function ProtectedRoute({ children, allowedRoles = [] }) {
    const { isAuthenticated, user } = useAuth()
    const location = useLocation()

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    // Check if account is suspended
    if (user?.status === 'suspended' || user?.merchantStatus === 'suspended' || user?.driverStatus === 'suspended') {
        // Allow access to the suspended page and logout flow
        if (location.pathname !== '/account-suspended') {
            return <Navigate to="/account-suspended" replace />
        }
    }

    // If roles are specified, check if user has required role
    if (allowedRoles.length > 0) {
        const hasRole = allowedRoles.some(role => {
            if (role === 'admin' && user?.role === 'admin') return true
            if (role === 'merchant' && user?.merchantStatus === 'approved') return true
            if (role === 'driver' && user?.driverStatus === 'approved') return true
            if (role === 'customer' && user?.role === 'customer') return true
            return false
        })

        if (!hasRole) {
            // Check if they are pending/rejected and redirect appropriately
            if (allowedRoles.includes('merchant') && ['pending', 'reviewing'].includes(user?.merchantStatus)) {
                return <Navigate to="/registration-status" replace />
            }
            if (allowedRoles.includes('driver') && ['pending', 'reviewing'].includes(user?.driverStatus)) {
                return <Navigate to="/registration-status" replace />
            }

            // Redirect to appropriate dashboard based on their actual status or home
            if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />
            if (user?.merchantStatus === 'approved') return <Navigate to="/merchant/dashboard" replace />
            if (user?.driverStatus === 'approved') return <Navigate to="/driver/dashboard" replace />

            return <Navigate to="/" replace />
        }
    }

    return children
}

export default ProtectedRoute
