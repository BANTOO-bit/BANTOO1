import { useState, useRef, useEffect } from 'react'
import {
    useFloating,
    autoUpdate,
    offset,
    flip,
    shift,
    useClick,
    useDismiss,
    useRole,
    useInteractions,
    FloatingPortal,
    FloatingFocusManager,
    useListNavigation,
} from '@floating-ui/react'

/**
 * AdminActionMenu — Production-grade portal-based action menu
 * 
 * @param {Object} props
 * @param {Array} props.items - Menu items: { icon, label, onClick, danger?, separator? }
 * @param {Function} props.onOpenChange - Callback when menu opens/closes (for row highlight)
 * 
 * Usage:
 * <AdminActionMenu
 *   items={[
 *     { icon: 'visibility', label: 'Lihat Detail', onClick: () => {} },
 *     { separator: true },
 *     { icon: 'delete', label: 'Hapus', onClick: () => {}, danger: true },
 *   ]}
 *   onOpenChange={(isOpen) => setActiveRow(isOpen ? rowId : null)}
 * />
 */
export default function AdminActionMenu({ items = [], onOpenChange }) {
    const [isOpen, setIsOpen] = useState(false)
    const listRef = useRef([])
    const [activeIndex, setActiveIndex] = useState(null)

    // Get only actionable (non-separator) items for keyboard nav
    const actionableIndices = items.reduce((acc, item, i) => {
        if (!item.separator) acc.push(i)
        return acc
    }, [])

    const { refs, floatingStyles, context } = useFloating({
        open: isOpen,
        onOpenChange: (open) => {
            setIsOpen(open)
            onOpenChange?.(open)
        },
        middleware: [
            offset(4),
            flip({ fallbackAxisSideDirection: 'start' }),
            shift({ padding: 8 }),
        ],
        placement: 'bottom-end',
        whileElementsMounted: autoUpdate,
    })

    const click = useClick(context)
    const dismiss = useDismiss(context, {
        ancestorScroll: true, // Close on scroll
    })
    const role = useRole(context, { role: 'menu' })
    const listNavigation = useListNavigation(context, {
        listRef,
        activeIndex,
        onNavigate: setActiveIndex,
        focusItemOnOpen: false,
    })

    const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
        click,
        dismiss,
        role,
        listNavigation,
    ])

    // Reset active index when menu closes
    useEffect(() => {
        if (!isOpen) setActiveIndex(null)
    }, [isOpen])

    return (
        <>
            {/* Trigger Button */}
            <button
                ref={refs.setReference}
                {...getReferenceProps()}
                className={`p-1.5 rounded-lg transition-all duration-150 ${isOpen
                    ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
                    : 'text-[#617589] hover:text-[#111418] dark:text-[#94a3b8] dark:hover:text-white hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d]'
                    }`}
                aria-label="Menu aksi"
            >
                <span className="material-symbols-outlined text-[20px]">more_vert</span>
            </button>

            {/* Portal-rendered dropdown */}
            {isOpen && (
                <FloatingPortal>
                    <FloatingFocusManager context={context} modal={false}>
                        <div
                            ref={refs.setFloating}
                            style={floatingStyles}
                            {...getFloatingProps()}
                            className="z-[9999] w-56 bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl shadow-xl overflow-hidden"
                        >
                            <div className="py-1.5">
                                {items.map((item, index) => {
                                    if (item.separator) {
                                        return (
                                            <div
                                                key={`sep-${index}`}
                                                className="h-px bg-[#e5e7eb] dark:bg-[#2a3b4d] my-1.5 mx-3"
                                            />
                                        )
                                    }

                                    const isActive = activeIndex === index

                                    return (
                                        <button
                                            key={index}
                                            ref={(node) => { listRef.current[index] = node }}
                                            {...getItemProps({
                                                onClick: () => {
                                                    item.onClick?.()
                                                    setIsOpen(false)
                                                    onOpenChange?.(false)
                                                },
                                            })}
                                            className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors text-left outline-none ${item.danger
                                                ? `text-red-600 dark:text-red-400 ${isActive ? 'bg-red-50 dark:bg-red-900/20' : 'hover:bg-red-50 dark:hover:bg-red-900/20'}`
                                                : `text-[#111418] dark:text-white ${isActive ? 'bg-[#f0f2f4] dark:bg-[#2a3b4d]' : 'hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d]'}`
                                                }`}
                                            tabIndex={isActive ? 0 : -1}
                                            role="menuitem"
                                        >
                                            <span
                                                className={`material-symbols-outlined text-[18px] ${item.danger
                                                    ? ''
                                                    : 'text-[#617589] dark:text-[#94a3b8]'
                                                    }`}
                                            >
                                                {item.icon}
                                            </span>
                                            {item.label}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </FloatingFocusManager>
                </FloatingPortal>
            )}
        </>
    )
}
