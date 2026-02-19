import { useState, useRef, useCallback } from 'react'

const onboardingData = [
    {
        id: 1,
        title: "Makanan Segar Diantar",
        description: "Temukan restoran terbaik di sekitarmu dan nikmati makanan segar langsung ke depan pintu.",
        image: "/images/onboarding-food.jpg",
        badge: "1000+ Restoran Partner",
        badgeIcon: "verified"
    },
    {
        id: 2,
        title: "Lacak Pesananmu",
        description: "Update real-time status pengiriman. Kamu selalu tahu di mana pesananmu berada.",
        image: null,
        isMapSlide: true,
        badge: null,
        badgeIcon: null
    },
    {
        id: 3,
        title: "Bayar Mudah & Aman",
        description: "Nikmati kemudahan pembayaran dengan berbagai metode. Keamananmu prioritas kami.",
        image: "/images/onboarding-payment.jpg",
        badge: "100% Transaksi Aman",
        badgeIcon: "verified_user"
    }
]

function MapIllustration() {
    return (
        <div className="w-full aspect-[4/3] relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 border border-blue-100/50 shadow-lg">
            {/* Grid pattern */}
            <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Horizontal streets */}
                <line x1="0" y1="80" x2="400" y2="80" stroke="#CBD5E1" strokeWidth="20" />
                <line x1="0" y1="160" x2="400" y2="160" stroke="#CBD5E1" strokeWidth="20" />
                <line x1="0" y1="240" x2="400" y2="240" stroke="#CBD5E1" strokeWidth="20" />
                {/* Vertical streets */}
                <line x1="100" y1="0" x2="100" y2="300" stroke="#CBD5E1" strokeWidth="20" />
                <line x1="200" y1="0" x2="200" y2="300" stroke="#CBD5E1" strokeWidth="20" />
                <line x1="300" y1="0" x2="300" y2="300" stroke="#CBD5E1" strokeWidth="20" />
                {/* Buildings (light rectangles) */}
                <rect x="30" y="20" width="40" height="30" rx="4" fill="#E2E8F0" />
                <rect x="130" y="100" width="40" height="30" rx="4" fill="#DBEAFE" />
                <rect x="230" y="20" width="40" height="30" rx="4" fill="#E2E8F0" />
                <rect x="330" y="180" width="40" height="30" rx="4" fill="#DBEAFE" />
                <rect x="30" y="180" width="40" height="30" rx="4" fill="#DBEAFE" />
                <rect x="130" y="260" width="40" height="20" rx="4" fill="#E2E8F0" />
                {/* Route dashed line */}
                <path d="M 100 280 L 100 160 Q 100 140 120 140 L 280 140 Q 300 140 300 120 L 300 80" stroke="#2979FF" strokeWidth="4" strokeDasharray="8 6" strokeLinecap="round" fill="none" />
            </svg>

            {/* Driver marker */}
            <div className="absolute z-10" style={{ top: '45%', left: '42%' }}>
                <div className="relative">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center border-3 border-white text-white shadow-lg shadow-primary/30">
                        <span className="material-symbols-outlined text-xl">two_wheeler</span>
                    </div>
                    <div className="absolute inset-0 rounded-full border-2 border-primary/40 animate-ping"></div>
                </div>
                {/* Label */}
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-lg shadow-md whitespace-nowrap">
                    <p className="text-[10px] font-bold text-gray-700">Dalam perjalanan</p>
                </div>
            </div>

            {/* Destination pin */}
            <div className="absolute z-10" style={{ top: '18%', left: '72%' }}>
                <span className="material-symbols-outlined text-4xl text-accent drop-shadow-lg" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
            </div>

            {/* Start pin */}
            <div className="absolute z-10" style={{ top: '82%', left: '22%' }}>
                <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-md flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
            </div>

            {/* Live badge */}
            <div className="absolute bottom-3 left-3 z-10">
                <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                    <span className="text-[10px] font-semibold text-gray-600">Live Tracking</span>
                </div>
            </div>

            {/* ETA badge */}
            <div className="absolute bottom-3 right-3 z-10">
                <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-sm">
                    <span className="material-symbols-outlined text-primary text-sm">schedule</span>
                    <span className="text-[10px] font-semibold text-gray-600">5 menit</span>
                </div>
            </div>
        </div>
    )
}

function OnboardingPage({ onComplete }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const isLastScreen = currentIndex === onboardingData.length - 1

    // Swipe gesture
    const touchStartX = useRef(0)
    const touchEndX = useRef(0)

    const handleNext = useCallback(() => {
        if (isLastScreen) {
            onComplete?.()
        } else {
            setCurrentIndex(prev => prev + 1)
        }
    }, [isLastScreen, onComplete])

    const handlePrev = useCallback(() => {
        if (currentIndex > 0) setCurrentIndex(prev => prev - 1)
    }, [currentIndex])

    const onTouchStart = (e) => {
        touchStartX.current = e.targetTouches[0].clientX
        touchEndX.current = e.targetTouches[0].clientX
    }
    const onTouchMove = (e) => { touchEndX.current = e.targetTouches[0].clientX }
    const onTouchEnd = () => {
        const distance = touchStartX.current - touchEndX.current
        if (Math.abs(distance) >= 50) {
            distance > 0 ? handleNext() : handlePrev()
        }
    }

    const slide = onboardingData[currentIndex]

    return (
        <div
            className="min-h-screen flex flex-col bg-white"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            {/* Top bar */}
            <div className="flex items-center justify-between px-5 pt-12 pb-3">
                <img src="/images/bantoo-logo.png" alt="Bantoo" className="h-10 object-contain" />
                <button
                    onClick={() => onComplete?.()}
                    className="text-sm font-medium text-gray-400 hover:text-primary transition-colors px-3 py-1.5 rounded-lg"
                >
                    Lewati
                </button>
            </div>

            {/* Slide Content */}
            <div className="flex-1 flex flex-col items-center px-5">
                {/* Image / Map */}
                <div className="w-full mt-4 mb-8">
                    {slide.isMapSlide ? (
                        <MapIllustration />
                    ) : (
                        <div className="w-full aspect-[4/3] relative rounded-3xl overflow-hidden shadow-lg">
                            <img
                                src={slide.image}
                                alt={slide.title}
                                className="w-full h-full object-cover"
                            />
                            {/* Soft gradient overlay at bottom for badge readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                            {/* Badge */}
                            {slide.badge && (
                                <div className="absolute bottom-4 left-4 right-4">
                                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30">
                                        <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{slide.badgeIcon}</span>
                                        <span className="text-white text-xs font-semibold">{slide.badge}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Text */}
                <div className="w-full text-center mb-auto">
                    <h1 className="text-[26px] font-extrabold text-gray-900 mb-3 leading-tight">
                        {slide.title}
                    </h1>
                    <p className="text-[15px] text-gray-500 leading-relaxed max-w-[300px] mx-auto">
                        {slide.description}
                    </p>
                </div>
            </div>

            {/* Bottom: Dots + Button */}
            <div className="px-5 pb-10 pt-6">
                {/* Pagination Dots */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    {onboardingData.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            className={`rounded-full transition-all duration-300 ${i === currentIndex
                                ? 'w-7 h-2.5 bg-primary'
                                : 'w-2.5 h-2.5 bg-gray-200'
                                }`}
                        ></button>
                    ))}
                </div>

                {/* CTA */}
                <button
                    onClick={handleNext}
                    className="w-full h-14 bg-primary hover:bg-blue-700 active:scale-[0.98] text-white text-base font-bold flex items-center justify-center transition-all rounded-2xl gap-2 shadow-md shadow-primary/20"
                >
                    {isLastScreen ? 'Mulai Sekarang' : 'Selanjutnya'}
                    <span className="material-symbols-outlined text-xl">
                        {isLastScreen ? 'rocket_launch' : 'arrow_forward'}
                    </span>
                </button>
            </div>
        </div>
    )
}

export default OnboardingPage
