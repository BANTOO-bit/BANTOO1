import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const promos = [
    {
        id: 1,
        title: 'Gratis Ongkir',
        subtitle: 'Untuk pesanan pertamamu!',
        icon: 'local_shipping',
        gradient: 'from-emerald-500 to-teal-600',
        dotColor: 'bg-emerald-500',
        action: '/merchants',
    },
    {
        id: 2,
        title: 'Diskon 30%',
        subtitle: 'Menu pilihan minggu ini',
        icon: 'percent',
        gradient: 'from-orange-500 to-red-500',
        dotColor: 'bg-orange-500',
        action: '/popular-menu',
    },
    {
        id: 3,
        title: 'Cashback 20%',
        subtitle: 'Bayar pakai e-wallet',
        icon: 'account_balance_wallet',
        gradient: 'from-violet-500 to-purple-600',
        dotColor: 'bg-violet-500',
        action: '/merchants',
    },
    {
        id: 4,
        title: 'Menu Baru! 🎉',
        subtitle: 'Coba menu spesial hari ini',
        icon: 'restaurant',
        gradient: 'from-blue-500 to-cyan-500',
        dotColor: 'bg-blue-500',
        action: '/popular-menu',
    },
]

function PromoBanner() {
    const navigate = useNavigate()
    const [activeIndex, setActiveIndex] = useState(0)
    const scrollRef = useRef(null)
    const timerRef = useRef(null)
    const isUserScrolling = useRef(false)

    const scrollToIndex = useCallback((index) => {
        if (scrollRef.current) {
            const cardWidth = scrollRef.current.children[0]?.offsetWidth || 0
            const gap = 12
            scrollRef.current.scrollTo({
                left: index * (cardWidth + gap),
                behavior: 'smooth',
            })
        }
    }, [])

    // Auto-scroll every 4 seconds
    useEffect(() => {
        const startAutoScroll = () => {
            timerRef.current = setInterval(() => {
                if (!isUserScrolling.current) {
                    setActiveIndex((prev) => {
                        const next = (prev + 1) % promos.length
                        scrollToIndex(next)
                        return next
                    })
                }
            }, 4000)
        }

        startAutoScroll()
        return () => clearInterval(timerRef.current)
    }, [scrollToIndex])

    // Detect manual scroll
    const handleScroll = () => {
        if (!scrollRef.current) return
        const cardWidth = scrollRef.current.children[0]?.offsetWidth || 0
        const gap = 12
        const scrollLeft = scrollRef.current.scrollLeft
        const newIndex = Math.round(scrollLeft / (cardWidth + gap))
        if (newIndex !== activeIndex && newIndex >= 0 && newIndex < promos.length) {
            setActiveIndex(newIndex)
        }
    }

    const handleTouchStart = () => {
        isUserScrolling.current = true
        clearInterval(timerRef.current)
    }

    const handleTouchEnd = () => {
        isUserScrolling.current = false
        // Restart auto-scroll after user stops
        timerRef.current = setInterval(() => {
            setActiveIndex((prev) => {
                const next = (prev + 1) % promos.length
                scrollToIndex(next)
                return next
            })
        }, 4000)
    }

    return (
        <section className="mt-1">
            {/* Carousel */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleTouchStart}
                onMouseUp={handleTouchEnd}
                className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 -mx-4 px-4"
            >
                {promos.map((promo) => (
                    <div
                        key={promo.id}
                        onClick={() => navigate(promo.action)}
                        className={`flex-none w-[85%] min-w-[280px] rounded-2xl bg-gradient-to-r ${promo.gradient} p-4 cursor-pointer active:scale-[0.98] transition-transform snap-start shadow-lg relative overflow-hidden`}
                    >
                        {/* Decorative circles */}
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full" />
                        <div className="absolute -right-2 -bottom-8 w-20 h-20 bg-white/5 rounded-full" />

                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <span className="material-symbols-outlined text-white text-2xl">{promo.icon}</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-white font-bold text-base leading-tight">{promo.title}</h3>
                                <p className="text-white/80 text-xs mt-0.5">{promo.subtitle}</p>
                            </div>
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-lg">arrow_forward</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Dot Indicators */}
            <div className="flex justify-center gap-1.5 mt-3">
                {promos.map((promo, index) => (
                    <button
                        key={promo.id}
                        onClick={() => {
                            setActiveIndex(index)
                            scrollToIndex(index)
                        }}
                        aria-label={`Promo ${index + 1}`}
                        className={`rounded-full transition-all duration-300 ${index === activeIndex
                                ? `w-5 h-1.5 ${promo.dotColor}`
                                : 'w-1.5 h-1.5 bg-gray-300'
                            }`}
                    />
                ))}
            </div>
        </section>
    )
}

export default PromoBanner
