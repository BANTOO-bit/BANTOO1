/**
 * VirtualList — Lightweight virtual scrolling for long lists
 * Only renders items visible in the viewport + a buffer zone.
 * No external dependencies — uses IntersectionObserver.
 *
 * Usage:
 *   <VirtualList
 *     items={orders}
 *     itemHeight={120}
 *     renderItem={(order) => <OrderCard key={order.id} order={order} />}
 *     overscan={3}
 *   />
 */
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'

function VirtualList({
    items = [],
    itemHeight = 120,
    renderItem,
    overscan = 5,
    className = '',
    emptyState = null,
    threshold = 50, // only virtualize if items exceed this count
}) {
    const containerRef = useRef(null)
    const [scrollTop, setScrollTop] = useState(0)
    const [containerHeight, setContainerHeight] = useState(0)

    // Don't virtualize small lists — render directly for simplicity
    if (items.length <= threshold) {
        if (items.length === 0) return emptyState
        return (
            <div className={className}>
                {items.map((item, index) => renderItem(item, index))}
            </div>
        )
    }

    const totalHeight = items.length * itemHeight

    // Calculate visible range
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
        items.length - 1,
        Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
    )

    const visibleItems = items.slice(startIndex, endIndex + 1)
    const offsetY = startIndex * itemHeight

    const handleScroll = useCallback((e) => {
        setScrollTop(e.target.scrollTop)
    }, [])

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setContainerHeight(entry.contentRect.height)
            }
        })

        resizeObserver.observe(container)
        setContainerHeight(container.clientHeight)

        return () => resizeObserver.disconnect()
    }, [])

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            className={`overflow-y-auto ${className}`}
            style={{ height: '100%' }}
        >
            <div style={{ height: totalHeight, position: 'relative' }}>
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        transform: `translateY(${offsetY}px)`,
                    }}
                >
                    {visibleItems.map((item, index) =>
                        renderItem(item, startIndex + index)
                    )}
                </div>
            </div>
        </div>
    )
}

export default VirtualList
