import { useState, useRef, useCallback } from 'react'

const onboardingData = [
    {
        id: 1,
        title: "Makanan Segar Diantar",
        description: "Temukan restoran terbaik di sekitarmu dan nikmati makanan segar langsung ke depan pintu.",
        image: "/images/onboarding-food.jpg",
        gradient: "from-blue-600/90 to-blue-800/90"
    },
    {
        id: 2,
        title: "Lacak Pesananmu",
        description: "Update real-time status pengiriman. Kamu selalu tahu di mana pesananmu berada.",
        image: null,
        isMapIllustration: true,
        gradient: "from-sky-50 to-blue-50"
    },
    {
        id: 3,
        title: "Bayar Mudah & Aman",
        description: "Nikmati kemudahan pembayaran dengan berbagai metode. Keamananmu prioritas kami.",
        image: "/images/onboarding-payment.jpg",
        gradient: "from-emerald-600/90 to-emerald-800/90"
    }
]

function MapIllustration() {
    return (
        <div className="w-full aspect-[4/3] relative overflow-hidden rounded-3xl shadow-2xl shadow-primary/20 bg-gradient-to-br from-blue-50 to-sky-50 border border-white/80 ring-1 ring-black/5">
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
                <rect className="fill-blue-50/80" height="300" width="400"></rect>
                <path className="fill-emerald-500/8" d="M 280 160 L 450 160 L 450 350 L 280 350 Z"></path>
                <circle className="fill-blue-500/5" cx="20" cy="20" r="100"></circle>
                <g className="stroke-white" strokeLinecap="round" strokeWidth="26">
                    <line x1="120" x2="120" y1="-20" y2="350"></line>
                    <line x1="280" x2="280" y1="-20" y2="350"></line>
                    <line x1="-20" x2="450" y1="100" y2="100"></line>
                    <line x1="-20" x2="450" y1="230" y2="230"></line>
                </g>
                <path className="drop-shadow-sm" d="M 120 350 L 120 230 Q 120 100 280 100 L 340 100" fill="none" stroke="#2979FF" strokeDasharray="10 6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5"></path>
            </svg>

            {/* Driver Icon */}
            <div className="absolute top-[33.3%] left-[55%] transform -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="relative">
                    <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center border-4 border-white text-white shadow-lg shadow-primary/30">
                        <span className="material-symbols-outlined text-[24px]">two_wheeler</span>
                    </div>
                    <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-30"></div>
                </div>
                <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-black/5">
                    <p className="text-[10px] font-bold text-gray-800 whitespace-nowrap tracking-wide">Dalam perjalanan</p>
                </div>
            </div>

            {/* Location Pin */}
            <div className="absolute top-[33.3%] left-[85%] transform -translate-x-1/2 -translate-y-[85%] z-20">
                <span className="material-symbols-outlined text-5xl text-accent drop-shadow-xl relative z-10">location_on</span>
                <div className="absolute top-[18px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white rounded-full z-20"></div>
            </div>

            {/* Live Badge */}
            <div className="absolute bottom-4 left-4">
                <div className="h-8 px-3 bg-white/90 backdrop-blur-sm rounded-lg flex items-center gap-2 border border-white/40 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                    <span className="text-[10px] font-semibold text-gray-600">Live</span>
                </div>
            </div>
        </div>
    )
}

function OnboardingScreen({ data, isActive }) {
    const isImageSlide = !data.isMapIllustration && data.image

    return (
        <div className={`flex-1 w-full flex flex-col items-center justify-center px-4 transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
            {/* Image Container */}
            <div className="w-full flex justify-center mb-10">
                {data.isMapIllustration ? (
                    <MapIllustration />
                ) : (
                    <div className="relative w-full aspect-[4/3] max-h-[35vh] rounded-3xl overflow-hidden shadow-2xl shadow-primary/20">
                        <div
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
                            style={{ backgroundImage: `url("${data.image}")` }}
                        ></div>
                        <div className={`absolute inset-0 bg-gradient-to-t ${data.gradient}`}></div>
                        {/* Overlay content badge */}
                        <div className="absolute bottom-4 left-4 right-4">
                            <div className="bg-white/20 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-white/20">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-white text-sm">verified</span>
                                    <span className="text-white text-xs font-medium">
                                        {data.id === 1 ? '1000+ Restoran Partner' : '100% Transaksi Aman'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Text Content */}
            <div className="w-full flex flex-col items-center text-center space-y-3">
                <h1 className="text-[28px] font-extrabold leading-tight tracking-tight text-text-main">
                    {data.title}
                </h1>
                <p className="text-[15px] font-normal leading-relaxed text-text-secondary max-w-[300px]">
                    {data.description}
                </p>
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
    const minSwipeDistance = 50

    const handleNext = useCallback(() => {
        if (isLastScreen) {
            onComplete?.()
        } else {
            setCurrentIndex(prev => prev + 1)
        }
    }, [isLastScreen, onComplete])

    const handlePrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1)
        }
    }, [currentIndex])

    const handleSkip = () => onComplete?.()

    const onTouchStart = (e) => {
        touchStartX.current = e.targetTouches[0].clientX
        touchEndX.current = e.targetTouches[0].clientX
    }
    const onTouchMove = (e) => {
        touchEndX.current = e.targetTouches[0].clientX
    }
    const onTouchEnd = () => {
        const distance = touchStartX.current - touchEndX.current
        if (Math.abs(distance) >= minSwipeDistance) {
            distance > 0 ? handleNext() : handlePrev()
        }
    }

    return (
        <div
            className="relative min-h-screen flex flex-col bg-gradient-to-b from-white via-blue-50/30 to-white overflow-hidden"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            {/* Decorative background shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-32 left-0 w-48 h-48 bg-accent/5 rounded-full -translate-x-1/2"></div>

            {/* Top bar: Logo + Skip */}
            <div className="flex items-center justify-between px-4 pt-12 pb-2 z-10">
                <img src="/images/bantoo-logo.png" alt="Bantoo" className="h-8 object-contain" />
                <button
                    onClick={handleSkip}
                    className="text-sm font-semibold text-text-secondary hover:text-primary transition-colors px-3 py-1.5 rounded-full hover:bg-primary/5"
                >
                    Lewati
                </button>
            </div>

            {/* Current Screen */}
            <OnboardingScreen
                data={onboardingData[currentIndex]}
                isActive={true}
            />

            {/* Bottom Section */}
            <div className="w-full flex flex-col items-center px-4 pb-12 z-10">
                {/* Pagination Dots */}
                <div className="flex flex-row items-center justify-center gap-2.5 mb-8">
                    {onboardingData.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`rounded-full transition-all duration-300 ${index === currentIndex
                                ? 'w-8 h-2.5 bg-primary shadow-md shadow-primary/30'
                                : 'w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400'
                                }`}
                        ></button>
                    ))}
                </div>

                {/* Action Button */}
                <button
                    onClick={handleNext}
                    className="w-full h-14 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary active:scale-[0.98] text-white text-base font-bold flex items-center justify-center transition-all rounded-2xl gap-2 shadow-lg shadow-primary/25"
                >
                    {isLastScreen ? 'Mulai Sekarang' : 'Selanjutnya'}
                    <span className="material-symbols-outlined text-[20px]">
                        {isLastScreen ? 'rocket_launch' : 'arrow_forward'}
                    </span>
                </button>
            </div>
        </div>
    )
}

export default OnboardingPage
