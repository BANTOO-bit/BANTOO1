import { useNavigate } from 'react-router-dom'

function HelpDetailPage({ title = "Detail Bantuan" }) {
    const navigate = useNavigate()
    return (
        <div className="relative min-h-screen flex flex-col bg-background-light pb-6">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-background-light/95 backdrop-blur-md px-4 pt-12 pb-4 flex items-center justify-between border-b border-transparent transition-colors">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <span className="material-symbols-outlined text-text-main">arrow_back</span>
                </button>
                <div className="w-10 h-10"></div>
            </header>

            <main className="flex-1 px-4 pt-2">
                <h1 className="text-xl font-bold text-text-main mb-4 leading-snug">
                    {title}
                </h1>

                <div className="prose prose-sm text-text-secondary">
                    <p className="mb-4">
                        Berikut adalah penjelasan detail untuk kendala yang Anda alami. Tim kami akan terus memantau situasi ini untuk memastikan kenyamanan Anda.
                    </p>
                    <p className="mb-4">
                        1. Pastikan koneksi internet Anda stabil.<br />
                        2. Coba refresh aplikasi atau log out dan log in kembali.<br />
                        3. Jika masalah berlanjut, silakan hubungi tim Customer Service kami melalui WhatsApp.
                    </p>
                    <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 mb-6">
                        <p className="text-xs text-primary font-medium">
                            Catatan: Informasi ini diperbarui secara berkala sesuai dengan kebijakan dan fitur terbaru Bantoo!
                        </p>
                    </div>
                </div>
            </main>

            {/* Floating Action */}
            <div className="p-4 bg-background-light border-t border-border-color">
                <div className="flex flex-col gap-3">
                    <p className="text-center text-xs text-text-secondary">Apakah artikel ini membantu?</p>
                    <div className="flex gap-3">
                        <button className="flex-1 h-10 rounded-full border border-border-color bg-white flex items-center justify-center gap-2 active:bg-gray-50">
                            <span className="material-symbols-outlined text-sm">thumb_up</span>
                            <span className="text-sm font-medium">Ya</span>
                        </button>
                        <button className="flex-1 h-10 rounded-full border border-border-color bg-white flex items-center justify-center gap-2 active:bg-gray-50">
                            <span className="material-symbols-outlined text-sm">thumb_down</span>
                            <span className="text-sm font-medium">Tidak</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HelpDetailPage
