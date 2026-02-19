import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import TermsModal from '../../components/shared/TermsModal'

function WelcomePage() {
    const navigate = useNavigate()
    const [showTerms, setShowTerms] = useState(false)

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-blue-50/40 to-white relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-[-60px] right-[-40px] w-56 h-56 bg-primary/5 rounded-full blur-xl"></div>
            <div className="absolute bottom-40 left-[-60px] w-72 h-72 bg-accent/5 rounded-full blur-xl"></div>
            <div className="absolute top-1/3 right-[-30px] w-20 h-20 bg-primary/10 rounded-full"></div>

            {/* Top Section */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 pt-16 relative z-10">
                {/* Logo Image */}
                <div className="mb-6">
                    <img
                        src="/images/bantoo-logo.png"
                        alt="Bantoo!"
                        className="h-16 object-contain drop-shadow-sm"
                    />
                </div>

                {/* Tagline */}
                <p className="text-sm font-medium text-text-secondary mb-10 tracking-wide">
                    Pesan Makanan, Lebih Mudah
                </p>

                {/* Hero Illustration Card */}
                <div className="relative w-full max-w-[300px] aspect-[4/3] mb-10">
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 via-blue-100/50 to-accent/10 border border-white/60 shadow-xl overflow-hidden">
                        {/* Animated delivery illustration */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative">
                                {/* Circle backdrop */}
                                <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
                                    <div className="w-24 h-24 bg-primary/15 rounded-full flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary text-[56px]">two_wheeler</span>
                                    </div>
                                </div>
                                {/* Food bag floating */}
                                <div className="absolute -top-3 -right-3 w-14 h-14 bg-accent rounded-2xl flex items-center justify-center shadow-lg shadow-accent/30 animate-bounce" style={{ animationDuration: '3s' }}>
                                    <span className="material-symbols-outlined text-white text-2xl">shopping_bag</span>
                                </div>
                                {/* Location pin */}
                                <div className="absolute -bottom-2 -right-6 animate-pulse">
                                    <span className="material-symbols-outlined text-red-500 text-3xl drop-shadow-md">location_on</span>
                                </div>
                                {/* Speed lines */}
                                <div className="absolute left-[-24px] top-1/2 -translate-y-1/2 space-y-1.5 opacity-60">
                                    <div className="w-5 h-[3px] bg-primary/40 rounded-full"></div>
                                    <div className="w-7 h-[3px] bg-primary/25 rounded-full"></div>
                                    <div className="w-4 h-[3px] bg-primary/40 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                        {/* Badge */}
                        <div className="absolute bottom-3 left-3 right-3">
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm">
                                <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                                <span className="text-[11px] font-semibold text-text-main">1000+ restoran siap melayani</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Welcome Text */}
                <div className="text-center max-w-[300px]">
                    <h2 className="text-2xl font-extrabold text-text-main mb-2">Selamat Datang!</h2>
                    <p className="text-sm text-text-secondary leading-relaxed">
                        Nikmati kemudahan pesan makanan dari restoran favoritmu dengan pengiriman cepat dan aman.
                    </p>
                </div>
            </div>

            {/* Bottom Section with Buttons */}
            <div className="px-4 pb-12 pt-8 space-y-3 relative z-10">
                {/* Login Button */}
                <button
                    onClick={() => navigate('/login')}
                    className="w-full h-14 bg-gradient-to-r from-primary to-blue-600 text-white font-bold rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
                >
                    <span className="material-symbols-outlined text-[20px]">login</span>
                    Masuk
                </button>

                {/* Register Button */}
                <button
                    onClick={() => navigate('/register')}
                    className="w-full h-14 bg-white text-primary font-bold rounded-2xl border-2 border-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:border-primary/40 hover:bg-primary/5"
                >
                    <span className="material-symbols-outlined text-[20px]">person_add</span>
                    Daftar Baru
                </button>

                {/* Terms Text */}
                <p className="text-xs text-center text-text-secondary pt-4 leading-relaxed">
                    Dengan melanjutkan, Anda menyetujui{' '}
                    <button onClick={() => setShowTerms(true)} className="text-primary font-semibold hover:underline">
                        Syarat & Ketentuan
                    </button>
                    {' '}dan{' '}
                    <button onClick={() => setShowTerms(true)} className="text-primary font-semibold hover:underline">
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
