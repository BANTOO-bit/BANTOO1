import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import './OfflineBanner.css'

/**
 * FIX-U1: Offline Banner Component
 * Shows a persistent banner when the user is offline
 * and a brief "reconnected" message when coming back online
 */
function OfflineBanner() {
    const { isOnline, wasOffline } = useNetworkStatus()

    if (isOnline && !wasOffline) return null

    return (
        <div className={`offline-banner ${isOnline ? 'offline-banner--reconnected' : 'offline-banner--offline'}`}>
            <span className="material-symbols-outlined offline-banner__icon">
                {isOnline ? 'wifi' : 'wifi_off'}
            </span>
            <span className="offline-banner__text">
                {isOnline
                    ? 'Koneksi kembali terhubung'
                    : 'Tidak ada koneksi internet'
                }
            </span>
        </div>
    )
}

export default OfflineBanner
