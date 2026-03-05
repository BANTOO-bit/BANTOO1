import { useNavigate } from 'react-router-dom'

function NotFoundPage() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-background-light flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                {/* 404 Illustration */}
                <div className="mb-6 relative">
                    <div className="text-[120px] font-black text-gray-100 leading-none select-none">
                        404
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-5xl text-primary">
                                explore_off
                            </span>
                        </div>
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-text-primary mb-2">
                    Halaman Tidak Ditemukan
                </h1>

                {/* Description */}
                <p className="text-text-secondary text-sm mb-8 max-w-xs mx-auto">
                    Ups! Halaman yang kamu cari tidak ada atau mungkin sudah dipindahkan.
                </p>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-xl">home</span>
                        Kembali ke Beranda
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full bg-white border border-gray-200 text-text-secondary font-semibold py-3 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-xl">arrow_back</span>
                        Halaman Sebelumnya
                    </button>
                </div>
            </div>
        </div>
    )
}

export default NotFoundPage
