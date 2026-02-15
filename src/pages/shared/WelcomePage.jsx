import { useNavigate } from 'react-router-dom'

function WelcomePage() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen flex flex-col bg-background-light">
            {/* Top Section with Illustration */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 pt-12">
                {/* Logo */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-primary tracking-tight">Bantoo!</h1>
                    <p className="text-center text-sm text-text-secondary mt-1">Pesan Makanan, Lebih Mudah</p>
                </div>

                {/* Illustration */}
                <div className="relative w-full max-w-[300px] aspect-square mb-8">
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-3xl shadow-xl"
                        style={{
                            backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAKaMnuzw6OCaQob-yCG0cAWzpkdkBKnNcPBouWzAkv-6Jku60d_1TZUgjk0Z4dHfUUt-ZObkmne78hquQP4qYoVjtiNX8WkHASpFbsszhnIbshY31ArlsTCGTmuPsdjHGzaAWWZuv7DqRJqLk2pitY0q4wP1Mh-mXEI8lPe_VPun3jBVx0Ol4QBOen8kD4-bo4r8RLtZiZ4si0Jk9qe_vxiOKK16OiGJDE0qvl-nff6aa0iVoJiPCW94nPieco6SV11AI7AcF8xb7p")'
                        }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-3xl"></div>
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
                    <span className="text-primary font-medium">Syarat & Ketentuan</span>
                    {' '}dan{' '}
                    <span className="text-primary font-medium">Kebijakan Privasi</span>
                </p>
            </div>
        </div>
    )
}

export default WelcomePage
