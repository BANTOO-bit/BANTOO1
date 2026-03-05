function PhotoPickerModal({ isOpen, onClose, onTakePhoto, onChooseGallery, onDeletePhoto }) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end bg-black/50 backdrop-blur-[2px]">
            <div className="w-full rounded-t-2xl bg-white p-6 pb-8 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
                <h2 className="mb-6 text-center text-lg font-bold text-text-main tracking-tight">
                    Ganti Foto Profil
                </h2>
                <div className="flex flex-col">
                    {/* Ambil Foto */}
                    <button
                        onClick={onTakePhoto}
                        className="flex w-full items-center gap-4 px-2 py-3.5 active:bg-gray-50 rounded-lg transition-colors group"
                    >
                        <div className="flex w-10 h-10 items-center justify-center rounded-full bg-orange-50 text-primary group-hover:scale-105 transition-transform">
                            <span className="material-symbols-outlined text-[24px]">photo_camera</span>
                        </div>
                        <span className="text-base font-semibold text-text-main">Ambil Foto</span>
                    </button>

                    <div className="my-2 h-[1px] w-full bg-gray-100"></div>

                    {/* Pilih dari Galeri */}
                    <button
                        onClick={onChooseGallery}
                        className="flex w-full items-center gap-4 px-2 py-3.5 active:bg-gray-50 rounded-lg transition-colors group"
                    >
                        <div className="flex w-10 h-10 items-center justify-center rounded-full bg-orange-50 text-primary group-hover:scale-105 transition-transform">
                            <span className="material-symbols-outlined text-[24px]">photo_library</span>
                        </div>
                        <span className="text-base font-semibold text-text-main">Pilih dari Galeri</span>
                    </button>

                    <div className="my-2 h-[1px] w-full bg-gray-100"></div>

                    {/* Hapus Foto Profil */}
                    <button
                        onClick={onDeletePhoto}
                        className="flex w-full items-center gap-4 px-2 py-3.5 active:bg-gray-50 rounded-lg transition-colors group"
                    >
                        <div className="flex w-10 h-10 items-center justify-center rounded-full bg-red-50 text-red-600 group-hover:scale-105 transition-transform">
                            <span className="material-symbols-outlined text-[24px]">delete</span>
                        </div>
                        <span className="text-base font-semibold text-red-600">Hapus Foto Profil</span>
                    </button>
                </div>

                {/* Batal Button */}
                <button
                    onClick={onClose}
                    className="mt-6 w-full rounded-xl py-3 text-center text-base font-bold text-gray-500 hover:text-text-main hover:bg-gray-50 transition-all"
                >
                    Batal
                </button>
            </div>
        </div>
    )
}

export default PhotoPickerModal
