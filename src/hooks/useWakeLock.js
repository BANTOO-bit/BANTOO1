import { useEffect, useState, useRef } from 'react';

/**
 * Custom hook to manage the Screen Wake Lock API and handle visibility changes
 * Useful for keeping the screen on during delivery and warning the driver if they minimize the app.
 */
export function useWakeLock({ onVisibilityChangeWarning }) {
    const [isSupported, setIsSupported] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const wakeLockRef = useRef(null);

    useEffect(() => {
        setIsSupported('wakeLock' in navigator);
    }, []);

    const requestWakeLock = async () => {
        if (!isSupported) return;

        try {
            wakeLockRef.current = await navigator.wakeLock.request('screen');
            setIsLocked(true);
            
            wakeLockRef.current.addEventListener('release', () => {
                setIsLocked(false);
                console.log('Screen Wake Lock was released');
            });
            console.log('Screen Wake Lock is active');
        } catch (err) {
            console.error(`${err.name}, ${err.message}`);
        }
    };

    const releaseWakeLock = async () => {
        if (wakeLockRef.current !== null) {
            await wakeLockRef.current.release();
            wakeLockRef.current = null;
        }
    };

    // Handle visibility changes (e.g. user minimizing the app or locking the screen)
    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (wakeLockRef.current !== null && document.visibilityState === 'visible') {
                // The wake lock is released automatically when the window is minimized or the screen is turned off.
                // We need to re-request it when the window becomes visible again.
                await requestWakeLock();
            }

            if (document.visibilityState === 'hidden' && onVisibilityChangeWarning) {
                // Warn the user that backgrounding might kill the GPS.
                // Note: The toast might only visually appear when they return to the app.
                onVisibilityChangeWarning();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            releaseWakeLock(); // Cleanup on unmount
        };
    }, [isSupported, onVisibilityChangeWarning]);

    return { isSupported, isLocked, requestWakeLock, releaseWakeLock };
}
