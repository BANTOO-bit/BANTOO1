import { useState, useRef, useCallback } from 'react'

/**
 * Pull-to-Refresh hook for mobile-like refresh behavior.
 * Returns { pullRef, isPulling, isRefreshing, pullProgress, PullIndicator }
 * 
 * Usage:
 *   const { pullRef, PullIndicator } = usePullToRefresh(async () => { await refetchData() })
 *   return <div ref={pullRef}><PullIndicator />{children}</div>
 */
export default function usePullToRefresh(onRefresh, { threshold = 80 } = {}) {
    const [isPulling, setIsPulling] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [pullDistance, setPullDistance] = useState(0)
    const startY = useRef(0)
    const pullRef = useRef(null)

    const pullProgress = Math.min(pullDistance / threshold, 1)

    const handleTouchStart = useCallback((e) => {
        // Only activate if scrolled to top
        if (pullRef.current && pullRef.current.scrollTop <= 0) {
            startY.current = e.touches[0].clientY
            setIsPulling(true)
        }
    }, [])

    const handleTouchMove = useCallback((e) => {
        if (!isPulling || isRefreshing) return
        const currentY = e.touches[0].clientY
        const diff = currentY - startY.current
        if (diff > 0) {
            setPullDistance(Math.min(diff * 0.5, threshold * 1.5)) // Dampen the pull
        }
    }, [isPulling, isRefreshing, threshold])

    const handleTouchEnd = useCallback(async () => {
        if (!isPulling) return
        setIsPulling(false)

        if (pullDistance >= threshold && onRefresh) {
            setIsRefreshing(true)
            setPullDistance(threshold * 0.6) // Keep indicator visible while refreshing
            try {
                await onRefresh()
            } finally {
                setIsRefreshing(false)
                setPullDistance(0)
            }
        } else {
            setPullDistance(0)
        }
    }, [isPulling, pullDistance, threshold, onRefresh])

    // Attach handlers to pullRef
    const setRef = useCallback((node) => {
        pullRef.current = node
        if (node) {
            node.addEventListener('touchstart', handleTouchStart, { passive: true })
            node.addEventListener('touchmove', handleTouchMove, { passive: true })
            node.addEventListener('touchend', handleTouchEnd, { passive: true })
        }
    }, [handleTouchStart, handleTouchMove, handleTouchEnd])

    // Pull indicator component
    const PullIndicator = () => {
        if (pullDistance <= 0 && !isRefreshing) return null
        return (
            <div
                className="flex justify-center items-center overflow-hidden transition-all duration-200"
                style={{ height: `${pullDistance}px`, minHeight: isRefreshing ? '48px' : '0px' }}
            >
                <div
                    className={`w-8 h-8 rounded-full border-2 border-primary border-t-transparent ${isRefreshing ? 'animate-spin-smooth' : ''}`}
                    style={{
                        opacity: pullProgress,
                        transform: `rotate(${pullProgress * 360}deg) scale(${0.5 + pullProgress * 0.5})`,
                        transition: isPulling ? 'none' : 'all 0.3s ease-out'
                    }}
                />
            </div>
        )
    }

    return {
        pullRef: setRef,
        isPulling,
        isRefreshing,
        pullProgress,
        PullIndicator,
    }
}
