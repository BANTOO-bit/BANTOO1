import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * RoleLockRedirect — Redirects users to their active role dashboard
 * if they try to access Customer routes while locked into Merchant/Driver role.
 * 
 * Wrap Customer-only routes with this component to enforce role locking.
 */
function RoleLockRedirect({ children }) {
    const { user } = useAuth()

    // If user's activeRole is merchant, redirect to merchant dashboard
    if (user?.activeRole === 'merchant' && user?.merchantStatus === 'approved') {
        return <Navigate to="/merchant/dashboard" replace />
    }

    // If user's activeRole is driver, redirect to driver dashboard
    if (user?.activeRole === 'driver' && user?.driverStatus === 'approved') {
        return <Navigate to="/driver/dashboard" replace />
    }

    // activeRole is 'customer' or 'admin' — allow access
    return children
}

export default RoleLockRedirect
