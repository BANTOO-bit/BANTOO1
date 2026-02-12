import { useState } from 'react'

const onboardingData = [
    {
        id: 1,
        title: "Fresh Meals Delivered",
        description: "Discover the best local restaurants and get fresh meals delivered right to your doorstep.",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAKaMnuzw6OCaQob-yCG0cAWzpkdkBKnNcPBouWzAkv-6Jku60d_1TZUgjk0Z4dHfUUt-ZObkmne78hquQP4qYoVjtiNX8WkHASpFbsszhnIbshY31ArlsTCGTmuPsdjHGzaAWWZuv7DqRJqLk2pitY0q4wP1Mh-mXEI8lPe_VPun3jBVx0Ol4QBOen8kD4-bo4r8RLtZiZ4si0Jk9qe_vxiOKK16OiGJDE0qvl-nff6aa0iVoJiPCW94nPieco6SV11AI7AcF8xb7p",
        bgColor: "bg-[#FF6B00]"
    },
    {
        id: 2,
        title: "Track Your Order",
        description: "Real-time updates on your delivery status. Never wonder where your dinner is again.",
        image: null, // Will use custom SVG map illustration
        bgColor: "bg-[#fff8f2]",
        isMapIllustration: true
    },
    {
        id: 3,
        title: "Easy & Secure Payment",
        description: "Enjoy hassle-free payments with multiple gateways. Your security is our top priority.",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBzyl7pdLnnnw5iv5GVM77jryzEAWQ0A9eyXVfyN7nNECDqOg8dVD4UahFNU_b8_o3C92vCd3lqaNz882fs7lgbzIAio3JZsd-TIuHoukHtU0sH7OYehIbCm7VH1amCM2YjnFYGs7CTPlPw0sy53Nv21iVn3jvahIaK2JcuFiIqabgoMb_RQjbkJ2dYAPlgQfAqR1h8om_IBKjGM_p60wynGL2sxCmsxTdp9of0ZEQ2brMPFYsSCjpSOiDHyy5fXTgoBzXld8zGxk3B",
        bgColor: "bg-[#8CC9B8]"
    }
]

function MapIllustration() {
    return (
        <div className="w-full aspect-[4/3] relative overflow-hidden rounded-3xl shadow-2xl shadow-primary/10 bg-[#fff8f2] border border-white/60 ring-1 ring-black/5">
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
                <rect className="fill-[#fff8f2]" height="300" width="400"></rect>
                <path className="fill-green-500/10" d="M 280 160 L 450 160 L 450 350 L 280 350 Z"></path>
                <circle className="fill-blue-500/5" cx="20" cy="20" r="100"></circle>
                <g className="stroke-white" strokeLinecap="round" strokeWidth="26">
                    <line x1="120" x2="120" y1="-20" y2="350"></line>
                    <line x1="280" x2="280" y1="-20" y2="350"></line>
                    <line x1="-20" x2="450" y1="100" y2="100"></line>
                    <line x1="-20" x2="450" y1="230" y2="230"></line>
                </g>
                <path className="drop-shadow-sm" d="M 120 350 L 120 230 Q 120 100 280 100 L 340 100" fill="none" stroke="#ff6a00" strokeDasharray="10 6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5"></path>
            </svg>

            {/* Driver Icon */}
            <div className="absolute top-[33.3%] left-[55%] transform -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="relative">
                    <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30 border-4 border-white text-white">
                        <span className="material-symbols-outlined text-[24px]">two_wheeler</span>
                    </div>
                    <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-30"></div>
                </div>
                <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm border border-black/5">
                    <p className="text-[10px] font-bold text-gray-800 whitespace-nowrap tracking-wide">On the way</p>
                </div>
            </div>

            {/* Location Pin */}
            <div className="absolute top-[33.3%] left-[85%] transform -translate-x-1/2 -translate-y-[85%] z-20">
                <span className="material-symbols-outlined text-5xl text-primary drop-shadow-xl relative z-10">location_on</span>
                <div className="absolute top-[18px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white rounded-full z-20"></div>
            </div>

            {/* Live Badge */}
            <div className="absolute bottom-4 left-4">
                <div className="h-8 px-3 bg-white/80 backdrop-blur-sm rounded-lg flex items-center gap-2 border border-white/40">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[10px] font-semibold opacity-60">Live</span>
                </div>
            </div>
        </div>
    )
}

function OnboardingScreen({ data, currentIndex, totalScreens }) {
    return (
        <div className="flex-1 w-full flex flex-col items-center justify-center px-4">
            {/* Image Container */}
            <div className="w-full flex justify-center mb-10">
                {data.isMapIllustration ? (
                    <MapIllustration />
                ) : (
                    <div className={`relative w-full aspect-square max-h-[35vh] rounded-3xl overflow-hidden shadow-sm ${data.bgColor}`}>
                        <div
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                            style={{ backgroundImage: `url("${data.image}")` }}
                        ></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-background-light/20 via-transparent to-transparent"></div>
                    </div>
                )}
            </div>

            {/* Text Content */}
            <div className="w-full flex flex-col items-center text-center space-y-4">
                <h1 className="text-[28px] font-bold leading-tight tracking-tight text-text-main">
                    {data.title}
                </h1>
                <p className="text-base font-normal leading-relaxed text-gray-500 max-w-[310px]">
                    {data.description}
                </p>
            </div>
        </div>
    )
}

function OnboardingPage({ onComplete }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const isLastScreen = currentIndex === onboardingData.length - 1

    const handleNext = () => {
        if (isLastScreen) {
            onComplete?.()
        } else {
            setCurrentIndex(prev => prev + 1)
        }
    }

    const handleSkip = () => {
        onComplete?.()
    }

    return (
        <div className="relative min-h-screen flex flex-col bg-background-light overflow-hidden">
            {/* Skip Button */}
            <button
                onClick={handleSkip}
                className="absolute top-6 right-6 z-50 text-sm font-semibold text-text-secondary hover:text-primary transition-colors"
            >
                Lewati
            </button>

            {/* Current Screen */}
            <OnboardingScreen
                data={onboardingData[currentIndex]}
                currentIndex={currentIndex}
                totalScreens={onboardingData.length}
            />

            {/* Bottom Section */}
            <div className="w-full flex flex-col items-center px-4 pb-12">
                {/* Pagination Dots */}
                <div className="flex flex-row items-center justify-center gap-2 mb-8">
                    {onboardingData.map((_, index) => (
                        <div
                            key={index}
                            className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex
                                ? 'w-6 bg-primary'
                                : 'w-2 bg-gray-300'
                                }`}
                        ></div>
                    ))}
                </div>

                {/* Action Button */}
                <button
                    onClick={handleNext}
                    className="w-full h-14 bg-primary hover:opacity-90 active:scale-[0.98] text-white text-base font-medium flex items-center justify-center transition-all shadow-lg shadow-primary/20 rounded-[28px]"
                >
                    {isLastScreen ? 'Mulai' : 'Selanjutnya'}
                </button>
            </div>
        </div>
    )
}

export default OnboardingPage
