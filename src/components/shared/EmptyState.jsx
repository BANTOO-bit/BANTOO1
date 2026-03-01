export default function EmptyState({
    icon = 'inbox',
    title = 'Tidak Ada Data',
    message = 'Data yang Anda cari tidak ditemukan atau masih kosong.',
    actionLabel = null,
    onAction = null,
    className = ''
}) {
    return (
        <div className={`flex flex-col items-center justify-center p-8 text-center min-h-[300px] w-full ${className}`}>
            {/* Illustration Circle */}
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse blur-xl scale-125"></div>
                <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-primary/10 rounded-full flex items-center justify-center shadow-inner relative z-10">
                    <span
                        className="material-symbols-outlined text-primary drop-shadow-sm"
                        style={{ fontSize: '48px', fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 48" }}
                    >
                        {icon}
                    </span>
                </div>
            </div>

            {/* Texts */}
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-500 max-w-[280px] leading-relaxed mb-6">
                {message}
            </p>

            {/* Optional Action Button */}
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="h-12 px-6 bg-primary text-white font-bold rounded-xl active:scale-95 transition-transform flex items-center justify-center shadow-md shadow-primary/20"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
