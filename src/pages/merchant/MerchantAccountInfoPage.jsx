import { useNavigate } from 'react-router-dom'

function MerchantAccountInfoPage() {
    const navigate = useNavigate()

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 relative min-h-screen flex flex-col overflow-x-hidden pb-[88px]">
            <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 pt-12 pb-4 flex items-center justify-between border-b border-transparent dark:border-gray-800">
                <button
                    onClick={() => navigate(-1)}
                    className="w-8 h-8 flex items-center justify-center text-text-main dark:text-white"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-lg font-bold text-text-main dark:text-white leading-tight">Informasi Akun</h1>
                <div className="w-8"></div>
            </header>

            <main className="flex flex-col gap-6 px-4 pt-4">
                <div className="bg-card-light dark:bg-card-dark rounded-2xl shadow-soft overflow-hidden">
                    <div className="divide-y divide-border-color dark:divide-gray-800">
                        <div className="flex items-center justify-between p-4">
                            <span className="text-sm font-medium text-text-secondary dark:text-gray-400">ID Mitra</span>
                            <span className="text-sm font-semibold text-text-main dark:text-white">MTR-9921004</span>
                        </div>
                        <div className="flex items-center justify-between p-4">
                            <span className="text-sm font-medium text-text-secondary dark:text-gray-400">Username</span>
                            <span className="text-sm font-semibold text-text-main dark:text-white">warungbuningsih</span>
                        </div>
                        <div className="flex items-center justify-between p-4">
                            <span className="text-sm font-medium text-text-secondary dark:text-gray-400">Email Terdaftar</span>
                            <span className="text-sm font-semibold text-text-main dark:text-white text-right">buningsih@example.com</span>
                        </div>
                        <div className="flex items-center justify-between p-4">
                            <span className="text-sm font-medium text-text-secondary dark:text-gray-400">Nomor Telepon Owner</span>
                            <span className="text-sm font-semibold text-text-main dark:text-white text-right">0812-3456-7890</span>
                        </div>
                        <div className="flex items-center justify-between p-4">
                            <span className="text-sm font-medium text-text-secondary dark:text-gray-400">Tanggal Bergabung</span>
                            <span className="text-sm font-semibold text-text-main dark:text-white">12 Januari 2023</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 mt-2">
                    <p className="text-xs text-center text-text-secondary dark:text-gray-500 px-4">
                        Informasi di atas hanya dapat diubah melalui verifikasi Admin untuk keamanan akun Anda.
                    </p>
                    <button className="w-full py-4 bg-primary hover:bg-primary-dark active:scale-[0.99] transition-all text-white font-semibold rounded-2xl shadow-md flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">support_agent</span>
                        Hubungi Admin
                    </button>
                </div>
                <div className="h-4"></div>
            </main>
        </div>
    )
}

export default MerchantAccountInfoPage
