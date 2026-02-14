import { useAuth } from '../../context/AuthContext'

function MerchantHeader() {
    const { user, isShopOpen, toggleShopStatus } = useAuth()

    return (
        <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 pt-12 pb-4 flex items-start justify-between border-b border-transparent dark:border-gray-800 transition-colors">
            <div className="flex flex-col">
                <div className="flex items-baseline gap-px select-none">
                    <span className="text-2xl font-black tracking-tighter text-blue-600 dark:text-blue-500 italic">Bant</span>
                    <div className="relative inline-block mx-px">
                        <span className="text-2xl font-black tracking-tighter text-green-500 dark:text-green-400">oo</span>
                        <span className="material-symbols-outlined fill absolute -top-2.5 left-1/2 -translate-x-1/2 text-green-600 dark:text-green-300 text-[18px] -rotate-12">two_wheeler</span>
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-blue-600 dark:text-blue-500 italic">!</span>
                </div>
                <div className="flex flex-col mt-2">
                    <span className="text-xs text-text-secondary font-medium">Halo,</span>
                    <h1 className="text-xl font-bold text-text-main dark:text-white leading-tight">{user?.merchantName || 'Nama Warung'}</h1>
                </div>
            </div>

            <button
                onClick={toggleShopStatus}
                className="flex items-center gap-2 bg-white dark:bg-card-dark px-3 py-1.5 rounded-full shadow-sm border border-border-color dark:border-gray-700 mt-1 active:scale-95 transition-transform"
            >
                <div className={`relative w-8 h-4 rounded-full transition-colors ${isShopOpen ? 'bg-green-100 dark:bg-green-900/40' : 'bg-red-100 dark:bg-red-900/40'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 rounded-full shadow-sm transition-all ${isShopOpen ? 'right-0.5 bg-green-500' : 'left-0.5 bg-red-500'}`}></div>
                </div>
                <span className={`text-xs font-semibold ${isShopOpen ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {isShopOpen ? 'Buka' : 'Tutup'}
                </span>
            </button>
        </header>
    )
}

export default MerchantHeader
