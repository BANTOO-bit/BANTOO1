import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import TermsModal from '../../components/shared/TermsModal'

function WelcomePage() {
    const navigate = useNavigate()
    const [showTerms, setShowTerms] = useState(false)

    return (
        <div className="min-h-screen flex flex-col bg-background-light">
            {/* Top Section with Illustration */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 pt-12">
                {/* Logo */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-primary tracking-tight">Bantoo!</h1>
                    <p className="text-center text-sm text-text-secondary mt-1">Pesan Makanan, Lebih Mudah</p>
                </div>

                {/* Illustration — unique SVG for Welcome (food delivery on motorbike) */}
                <div className="relative w-full max-w-[280px] aspect-square mb-8">
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/10 dark:to-orange-900/20 border border-orange-100 dark:border-orange-900/30 shadow-xl flex items-center justify-center">
                        {/* Delivery motorbike illustration */}
                        <div className="relative">
                            <div className="w-28 h-28 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-[72px]">two_wheeler</span>
                            </div>
                            {/* Food bag */}
                            <div className="absolute -top-2 -right-2 w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg transform rotate-12">
                                <span className="material-symbols-outlined text-white text-3xl">shopping_bag</span>
                            </div>
                            {/* Speed lines */}
                            <div className="absolute left-[-30px] top-1/2 -translate-y-1/2 space-y-2">
                                <div className="w-6 h-0.5 bg-primary/30 rounded-full"></div>
                                <div className="w-8 h-0.5 bg-primary/20 rounded-full"></div>
                                <div className="w-5 h-0.5 bg-primary/30 rounded-full"></div>
                            </div>
                            {/* Location pin */}
                            <div className="absolute -bottom-4 right-[-20px]">
                                <span className="material-symbols-outlined text-red-500 text-3xl">location_on</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Welcome Text */}
                <div className="text-center max-w-[280px]">
                    <h2 className="text-2xl font-bold text-text-main mb-2">Selamat Datang!</h2>
                    <p className="text-sm text-text-secondary leading-relaxed">
                        Nikmati kemudahan pesan makanan dari restoran favoritmu dengan pengiriman cepat.
                    </p>
                </div>
            </div>

            {/* Bottom Section with Buttons */}
            <div className="px-4 pb-12 pt-8 space-y-3">
                {/* Login Button */}
                <button
                    onClick={() => navigate('/login')}
                    className="w-full h-14 bg-primary text-white font-bold rounded-[28px] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined">login</span>
                    Masuk
                </button>

                {/* Register Button */}
                <button
                    onClick={() => navigate('/register')}
                    className="w-full h-14 bg-white text-primary font-bold rounded-[28px] border-2 border-primary active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined">person_add</span>
                    Daftar
                </button>

                {/* Terms Text */}
                <p className="text-xs text-center text-text-secondary pt-4">
                    Dengan melanjutkan, Anda menyetujui{' '}
                    <button onClick={() => setShowTerms(true)} className="text-primary font-medium hover:underline">
                        Syarat & Ketentuan
                    </button>
                    {' '}dan{' '}
                    <button onClick={() => setShowTerms(true)} className="text-primary font-medium hover:underline">
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
