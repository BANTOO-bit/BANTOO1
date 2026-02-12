import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function DriverAddBankPage() {
    const navigate = useNavigate()
    const toast = useToast()
    const [formData, setFormData] = useState({
        bank: '',
        number: '',
        holder: ''
    })

    const banks = [
        { id: 'bca', name: 'Bank BCA', icon: 'account_balance' },
        { id: 'mandiri', name: 'Bank Mandiri', icon: 'account_balance' },
        { id: 'bri', name: 'Bank BRI', icon: 'account_balance' },
        { id: 'gopay', name: 'GoPay', icon: 'account_balance_wallet' },
        { id: 'ovo', name: 'OVO', icon: 'account_balance_wallet' },
        { id: 'dana', name: 'DANA', icon: 'account_balance_wallet' }
    ]

    const handleSave = () => {
        if (!formData.bank || !formData.number || !formData.holder) {
            toast.warning('Mohon lengkapi semua data')
            return
        }
        // Logic to save
        navigate('/driver/bank')
    }

    return (
        <div className="font-display bg-background-light text-slate-900 antialiased min-h-screen">
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl bg-white">
                {/* Header */}
                <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
                    <div className="flex items-center px-4 h-[64px] gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full text-slate-700 hover:bg-slate-50 transition-colors active:scale-95"
                        >
                            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                        </button>
                        <h2 className="text-slate-900 text-lg font-bold leading-tight flex-1">Tambah Rekening</h2>
                    </div>
                </header>

                <main className="flex-1 p-5 pb-10 flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Pilih Bank / E-Wallet</label>
                        <select
                            value={formData.bank}
                            onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                            className="w-full p-4 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold focus:border-[#0d59f2] focus:ring-0 outline-none appearance-none"
                        >
                            <option value="">Pilih Bank Tujuan</option>
                            {banks.map(bank => (
                                <option key={bank.id} value={bank.id}>{bank.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Nomor Rekening / HP</label>
                        <input
                            type="number"
                            value={formData.number}
                            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                            placeholder="Contoh: 1234567890"
                            className="w-full p-4 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold placeholder:font-normal placeholder:text-slate-400 focus:border-[#0d59f2] focus:ring-0 outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Nama Pemilik Rekening</label>
                        <input
                            type="text"
                            value={formData.holder}
                            onChange={(e) => setFormData({ ...formData, holder: e.target.value.toUpperCase() })}
                            placeholder="Nama sesuai buku tabungan"
                            className="w-full p-4 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold placeholder:font-normal placeholder:text-slate-400 focus:border-[#0d59f2] focus:ring-0 outline-none uppercase"
                        />
                        <p className="text-xs text-slate-500 ml-1">Wajib sama dengan nama di KTP Anda.</p>
                    </div>

                    <div className="flex-1"></div>

                    <button
                        onClick={handleSave}
                        className="w-full bg-[#0d59f2] hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-base transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20"
                    >
                        SIMPAN REKENING
                    </button>
                </main>
            </div>
        </div>
    )
}

export default DriverAddBankPage
