import { useLocation, useNavigate } from 'react'

function VerifyEmailInstructionPage() {
    const location = useLocation()
    const navigate = useNavigate()

    // Get the email that was passed from the RegisterPage
    const userEmail = location.state?.email || ''

    return (
        <div className="min-h-screen flex flex-col bg-white relative overflow-hidden">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md px-4 pt-12 pb-4">
                <div className="relative flex items-center justify-center">
                    <img src="/images/bantoo-logo.png" alt="Bantoo" className="h-7 object-contain" />
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 px-4 py-8 overflow-y-auto flex flex-col items-center justify-center relative z-10 w-full max-w-md mx-auto">

                {/* Email Illustration */}
                <div className="w-24 h-24 bg-blue-50 text-primary rounded-full flex items-center justify-center mb-8 relative">
                    <span className="material-symbols-outlined text-5xl">mark_email_unread</span>
                    <div className="absolute top-2 right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
                        <span className="text-white text-[10px] font-bold">1</span>
                    </div>
                </div>

                <div className="text-center mb-10 w-full px-2">
                    <h2 className="text-2xl font-extrabold text-text-main mb-4">Verifikasi Email Anda</h2>
                    <p className="text-sm text-text-secondary leading-relaxed">
                        Kami telah mengirimkan tautan konfirmasi pendaftaran ke alamat email:
                    </p>
                    {userEmail && (
                        <div className="mt-3 py-3 px-4 bg-gray-50 border border-gray-100 rounded-xl inline-block max-w-full overflow-hidden">
                            <p className="text-base font-bold text-gray-900 truncate">
                                {userEmail}
                            </p>
                        </div>
                    )}
                    <p className="text-sm text-text-secondary leading-relaxed mt-4">
                        Silakan periksa kotak masuk atau folder spam Anda, lalu klik tautan tersebut untuk menyelesaikan dan mengaktifkan akun Anda.
                    </p>
                </div>

                {/* Actions */}
                <div className="w-full space-y-4">
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full h-14 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary text-white font-bold rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm shadow-primary/10"
                    >
                        Sudah Konfirmasi? Lanjut Masuk
                        <span className="material-symbols-outlined text-[20px]">login</span>
                    </button>

                    <button
                        onClick={() => navigate('/help')}
                        className="w-full py-4 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        Butuh Bantuan?
                    </button>
                </div>
            </main>
        </div>
    )
}

export default VerifyEmailInstructionPage
