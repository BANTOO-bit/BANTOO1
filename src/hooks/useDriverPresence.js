import { useEffect } from 'react'

/**
 * useDriverPresence — Auto-offline driver when closing/refreshing the browser.
 * Extracted from AuthContext to follow Single Responsibility Principle.
 * 
 * Uses `fetch + keepalive` pattern to reliably send the offline request during page unload.
 * 
 * Usage:
 *   useDriverPresence(user) // Call in DriverDashboard or a driver layout
 */
export function useDriverPresence(user) {
    useEffect(() => {
        if (!user?.id || user?.activeRole !== 'driver') return

        const handleBeforeUnload = () => {
            // Use fetch with keepalive for reliable delivery during page unload
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
            const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
            if (supabaseUrl && supabaseKey) {
                const url = `${supabaseUrl}/rest/v1/drivers?user_id=eq.${user.id}`
                // Get auth token from session
                const projectRef = supabaseUrl.match(/\/\/([^.]+)/)?.[1] || ''
                const tokenData = sessionStorage.getItem(`sb-${projectRef}-auth-token`)
                const accessToken = tokenData ? JSON.parse(tokenData)?.access_token : null

                fetch(url, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${accessToken || supabaseKey}`,
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({ is_active: false }),
                    keepalive: true
                }).catch(() => { }) // Ignore errors during unload
            }
            sessionStorage.removeItem('driver_isOnline')
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [user?.id, user?.activeRole])
}

export default useDriverPresence
