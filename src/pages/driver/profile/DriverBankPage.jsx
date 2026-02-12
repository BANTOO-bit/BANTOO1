import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function DriverBankPage() {
    const navigate = useNavigate()

    // Mock Data
    const [accounts, setAccounts] = useState([
        { id: 1, type: 'bank', name: 'Bank BCA', number: '8271234567', holder: 'BUDI SANTOSO', icon: 'account_balance', color: 'text-[#0d59f2]', bgColor: 'bg-blue-50' },
        { id: 2, type: 'wallet', name: 'GoPay', number: '081299887766', holder: 'BUDI SANTOSO', icon: 'account_balance_wallet', color: 'text-green-600', bgColor: 'bg-green-50' }
    ])

    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedId, setSelectedId] = useState(null)

    const confirmDelete = (id) => {
        setSelectedId(id)
        setShowDeleteModal(true)
    }

    const handleDelete = () => {
        if (selectedId) {
            setAccounts(accounts.filter(acc => acc.id !== selectedId))
            setShowDeleteModal(false)
            setSelectedId(null)
        }
    }

    return (
        <div className="font-display bg-background-light text-slate-900 antialiased min-h-screen">
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl bg-white">
                {/* Header */}
                <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
                    <div className="flex items-center px-4 h-[64px] gap-4">
                        <button
                            onClick={() => navigate('/driver/profile')}
                            className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full text-slate-700 hover:bg-slate-50 transition-colors active:scale-95"
                        >
                            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                        </button>
                        <h2 className="text-slate-900 text-lg font-bold leading-tight flex-1">Rekening Bank & Wallet</h2>
                        <button
                            onClick={() => navigate('/driver/bank/add')}
                            className="bg-slate-50 text-[#0d59f2] w-9 h-9 flex items-center justify-center rounded-full hover:bg-blue-50 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[22px]">add</span>
                        </button>
                    </div>
                </header>

                <main className="flex-1 p-4 pb-12 flex flex-col gap-4">
                    {accounts.length > 0 ? (
                        accounts.map(account => (
                            <div key={account.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-full ${account.bgColor} flex items-center justify-center ${account.color}`}>
                                            <span className="material-symbols-outlined text-[24px]">{account.icon}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">{account.name}</h3>
                                            <p className="text-sm font-mono text-slate-600 tracking-wide">{account.number}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => confirmDelete(account.id)}
                                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                    </button>
                                </div>
                                <div className="h-px w-full bg-slate-100"></div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500">Pemilik Rekening</span>
                                    <span className="font-bold text-slate-800 uppercase">{account.holder}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                            <span className="material-symbols-outlined text-[48px] mb-2 opacity-50">credit_card_off</span>
                            <p className="text-sm">Belum ada rekening tersimpan</p>
                        </div>
                    )}

                    <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                        <span className="material-symbols-outlined text-blue-600 shrink-0">info</span>
                        <div>
                            <p className="text-xs font-bold text-blue-800 mb-1">Informasi Penting</p>
                            <p className="text-[11px] text-blue-700 leading-relaxed">
                                Pastikan nama pemilik rekening sesuai dengan nama di KTP Anda untuk mempercepat proses penarikan saldo.
                            </p>
                        </div>
                    </div>
                </main>

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl scale-100 animate-in zoom-in-95 duration-200">
                            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4 mx-auto">
                                <span className="material-symbols-outlined text-[28px]">delete</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2 text-center">Hapus Rekening?</h3>
                            <p className="text-sm text-slate-500 mb-6 text-center leading-relaxed">
                                Apakah Anda yakin ingin menghapus rekening ini? Tindakan ini tidak dapat dibatalkan.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all active:scale-95"
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default DriverBankPage
