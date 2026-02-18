import { useState, useEffect } from 'react'

/**
 * BackToTopButton — Floating button that appears after scrolling 400px.
 * Smooth-scrolls back to top when clicked.
 */
function BackToTopButton() {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setVisible(window.scrollY > 400)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    if (!visible) return null

    return (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-24 right-4 z-40 w-11 h-11 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-full shadow-lg flex items-center justify-center text-primary active:scale-90 transition-all animate-fade-in"
            aria-label="Kembali ke atas"
        >
            <span className="material-symbols-outlined text-[22px]">keyboard_arrow_up</span>
        </button>
    )
}

export default BackToTopButton
