import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import TermsModal from '../../components/shared/TermsModal'

function WelcomePage() {
    const navigate = useNavigate()
    const [showTerms, setShowTerms] = useState(false)

    return (
        <div className="min-h-screen flex flex-col bg-white relative overflow-hidden">
            {/* Top Section */}
            <div className="flex-1 flex flex-col items-center justify-center px-5 pt-16 relative z-10">
                {/* Logo */}
                <div className="mb-8">
                    <img
                        src="/images/bantoo-logo.png"
                        alt="Bantoo!"
                        className="h-14 object-contain"
                    />
                </div>

                {/* Tagline */}
                <p className="text-sm font-medium text-gray-400 mb-10 tracking-wide">
                    Pesan Makanan, Lebih Mudah
                </p>

                {/* Illustration Card */}
                <div className="relative w-full max-w-[280px] aspect-square mb-10">
                    <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 border border-blue-100/50 shadow-lg overflow-hidden">
                        {/* Delivery illustration */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative">
                                {/* Outer ring */}
                                <div className="w-36 h-36 border-2 border-dashed border-primary/20 rounded-full flex items-center justify-center">
                                    {/* Inner circle */}
                                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary text-[52px]" style={{ fontVariationSettings: "'FILL' 1" }}>two_wheeler</span>
                                    </div>
                                </div>
                                {/* Food bag - bouncing */}
                                <div className="absolute -top-2 -right-2 w-12 h-12 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/25 animate-bounce" style={{ animationDuration: '3s' }}>
                                    <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_bag</span>
                                </div>
                                {/* Star */}
                                <div className="absolute -top-1 -left-4 w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center shadow-md rotate-12">
                                    <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                </div>
                                {/* Location pin */}
                                <div className="absolute -bottom-3 -right-5">
                                    <span className="material-symbols-outlined text-red-500 text-3xl drop-shadow-md" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                                </div>
                            </div>
                        </div>
                        {/* Bottom info bar */}
                        <div className="absolute bottom-3 left-3 right-3">
                            <div className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm">
                                <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                                <span className="text-[11px] font-semibold text-gray-600">1000+ restoran siap melayani</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Text */}
                <div className="text-center max-w-[300px]">
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Selamat Datang!</h2>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        Nikmati kemudahan pesan makanan dari restoran favoritmu dengan pengiriman cepat dan aman.
                    </p>
                </div>
            </div>

            {/* Bottom Buttons */}
            <div className="px-5 pb-10 pt-6 space-y-3 relative z-10">
                {/* Login */}
                <button
                    onClick={() => navigate('/login')}
                    className="w-full h-14 bg-primary hover:bg-blue-700 text-white font-bold rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20"
                >
                    <span className="material-symbols-outlined text-xl">login</span>
                    Masuk
                </button>

                {/* Register */}
                <button
                    onClick={() => navigate('/register')}
                    className="w-full h-14 bg-white text-primary font-bold rounded-2xl border-2 border-gray-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:border-primary/30 hover:bg-blue-50/50"
                >
                    <span className="material-symbols-outlined text-xl">person_add</span>
                    Daftar Baru
                </button>

                {/* Terms */}
                <p className="text-xs text-center text-gray-400 pt-3 leading-relaxed">
                    Dengan melanjutkan, Anda menyetujui{' '}
                    <button onClick={() => setShowTerms(true)} className="text-primary font-semibold">
                        Syarat & Ketentuan
                    </button>
                    {' '}dan{' '}
                    <button onClick={() => setShowTerms(true)} className="text-primary font-semibold">
                        Kebijakan Privasi
                    </button>
                </p>
            </div>

            {/* Terms Modal */}
            {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
        </div>
    )
}

export default WelcomePage
