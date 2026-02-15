import { useNavigate } from 'react-router-dom'

function MerchantRegistrationStatus() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark relative">
            <header className="bg-white dark:bg-card-dark px-4 py-4 flex items-center justify-center sticky top-0 z-20 shadow-sm border-b border-gray-100 dark:border-gray-800">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                    Status Pendaftaran
                </h1>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar p-5 flex flex-col items-center justify-center pb-32">
                {/* Animated Illustration */}
                <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
                    <div className="absolute inset-0 bg-primary/5 rounded-full animate-pulse"></div>
                    <div className="absolute inset-6 bg-primary/10 rounded-full"></div>
                    <div className="relative w-32 h-32 bg-white dark:bg-surface-dark rounded-full shadow-soft flex items-center justify-center z-10 border-4 border-white dark:border-gray-700">
                        <div className="relative">
                            <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600">
                                article
                            </span>
                            <div className="absolute -bottom-2 -right-2 bg-orange-50 dark:bg-gray-800 rounded-full p-2 shadow-sm border-2 border-white dark:border-gray-700 flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl text-primary animate-pulse">
                                    hourglass_top
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center leading-tight">
                    Pendaftaran Sedang Diproses
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center leading-relaxed max-w-xs mx-auto">
                    Terima kasih telah mendaftar! Tim kami sedang meninjau data warung Anda. Proses ini biasanya memakan waktu maksimal 24 jam.
                </p>
                <div className="mt-8 w-16 h-1 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
            </main>

            <div className="absolute bottom-0 left-0 right-0 p-5 bg-white/80 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 z-20 flex flex-col gap-3">
                <button
                    onClick={() => navigate('/')}
                    className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-2xl active:shadow-none active:scale-[0.99] transition-all flex items-center justify-center group"
                >
                    <span>Kembali ke Beranda</span>
                </button>
                <button
                    onClick={() => navigate('/help')}
                    className="w-full bg-transparent hover:bg-orange-50 dark:hover:bg-gray-800 text-primary font-bold py-4 px-6 rounded-2xl border border-primary/20 active:scale-[0.99] transition-all flex items-center justify-center"
                >
                    <span>Hubungi Bantuan</span>
                </button>
            </div>
        </div>
    )
}

export default MerchantRegistrationStatus
