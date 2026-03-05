import { useState, useMemo } from 'react'

const BANKS = [
    { code: 'bca', name: 'Bank Central Asia (BCA)' },
    { code: 'mandiri', name: 'Bank Mandiri' },
    { code: 'bri', name: 'Bank Rakyat Indonesia (BRI)' },
    { code: 'bni', name: 'Bank Negara Indonesia (BNI)' },
    { code: 'cimb', name: 'CIMB Niaga' },
    { code: 'jago', name: 'Bank Jago' },
    { code: 'permata', name: 'Bank Permata' },
    { code: 'danamon', name: 'Bank Danamon' },
    { code: 'btn', name: 'Bank Tabungan Negara (BTN)' },
    { code: 'bsi', name: 'Bank Syariah Indonesia (BSI)' },
    { code: 'panin', name: 'Panin Bank' },
    { code: 'ocbc', name: 'OCBC NISP' },
    { code: 'uob', name: 'UOB Indonesia' },
    { code: 'maybank', name: 'Maybank Indonesia' },
    { code: 'gopay', name: 'GoPay' },
    { code: 'ovo', name: 'OVO' },
    { code: 'dana', name: 'DANA' },
    { code: 'shopeepay', name: 'ShopeePay' }
]

export function getBankDisplayName(code) {
    if (!code) return ''
    const bank = BANKS.find(b => b.code.toLowerCase() === code.toLowerCase())
    return bank ? bank.name : code
}

export default function BankSelectSheet({ isOpen, onClose, onSelect, selectedBankCode }) {
    const [searchQuery, setSearchQuery] = useState('')

    const filteredBanks = useMemo(() => {
        return BANKS.filter(bank =>
            bank.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [searchQuery])

    if (!isOpen) return null

    const handleSelect = (bank) => {
        onSelect(bank)
        onClose()
        setSearchQuery('')
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Sheet Content */}
            <div className="relative w-full max-w-md bg-white dark:bg-card-dark rounded-t-3xl sm:rounded-2xl p-4 shadow-xl animate-slide-up max-h-[85vh] flex flex-col h-[85vh] sm:h-auto">
                {/* Handle Bar (Mobile visual cue) */}
                <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4 shrink-0 sm:hidden" />

                <div className="flex items-center justify-between mb-4 shrink-0">
                    <h3 className="text-lg font-bold text-text-main dark:text-white">Pilih Bank / E-Wallet</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Search Input */}
                <div className="relative mb-4 shrink-0">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400">search</span>
                    <input
                        type="text"
                        placeholder="Cari bank atau e-wallet..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none text-text-main dark:text-white"
                        autoFocus
                    />
                </div>

                {/* Bank List */}
                <div className="overflow-y-auto -mx-4 px-4 flex-1">
                    <div className="flex flex-col">
                        {filteredBanks.length > 0 ? (
                            filteredBanks.map(bank => (
                                <button
                                    key={bank.code}
                                    onClick={() => handleSelect(bank)}
                                    className={`flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-800 last:border-none hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left ${selectedBankCode?.toLowerCase() === bank.code ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                >
                                    <span className={`text-sm font-medium ${selectedBankCode?.toLowerCase() === bank.code ? 'text-primary' : 'text-text-main dark:text-white'}`}>
                                        {bank.name}
                                    </span>
                                    {selectedBankCode?.toLowerCase() === bank.code && (
                                        <span className="material-symbols-outlined text-primary text-lg">check</span>
                                    )}
                                </button>
                            ))
                        ) : (
                            <div className="py-8 text-center text-text-secondary text-sm">
                                Bank tidak ditemukan
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
