import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DriverBottomNavigation from '../../../components/driver/DriverBottomNavigation'
import { driverService } from '../../../services/driverService'

function DriverWithdrawalAccount() {
    const navigate = useNavigate()
    const [selectedAccount, setSelectedAccount] = useState(null)
    const [accounts, setAccounts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadAccounts() {
            try {
                const data = await driverService.getBankDetails()
                if (data && data.bank_name) {
                    const acc = {
                        id: 'primary',
                        name: data.bank_name,
                        number: data.bank_account_number || '-',
                        holder: data.bank_account_name || '-',
                        isPrimary: true
                    }
                    setAccounts([acc])
                    setSelectedAccount('primary')
                }
            } catch (err) {
                if (import.meta.env.DEV) console.error('Failed to load accounts:', err)
            } finally {
                setLoading(false)
            }
        }
        loadAccounts()
    }, [])

    const handleSelect = (id) => {
        setSelectedAccount(id)
        setTimeout(() => navigate('/driver/withdrawal'), 300)
    }

    return (
        <div className="font-display bg-white text-slate-900 antialiased min-h-screen">
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl bg-white">
                <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100">
                    <div className="flex items-center px-4 justify-between h-[64px]">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 -ml-2 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded-full transition-colors active:scale-95"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <h2 className="text-slate-900 text-lg font-bold">Tarik Saldo</h2>
                        <div className="w-10"></div>
                    </div>
                </header>

                <main className="flex-1 px-4 pt-4 pb-bottom-nav flex flex-col gap-6 relative">
                    {/* Background Content (Blurred/Overlayed) */}
                    <div className="absolute inset-0 bg-slate-900/60 z-10 backdrop-blur-sm transition-opacity"></div>

                    {/* Bottom Sheet */}
                    <div className="absolute bottom-0 left-0 right-0 z-20 bg-white rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.2)] pb-safe animate-slide-up duration-300">
                        <div className="w-full flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
                            <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
                        </div>
                        <div className="px-6 pb-8 flex flex-col gap-6 pt-2">
                            <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                                <h3 className="text-lg font-bold text-slate-900">Pilih Tujuan Penarikan</h3>
                                <button
                                    onClick={() => navigate(-1)}
                                    className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-xl">close</span>
                                </button>
                            </div>

                            <div className="flex flex-col gap-3">
                                {loading ? (
                                    [1, 2].map(i => (
                                        <div key={i} className="flex items-center p-4 rounded-2xl border border-slate-200 animate-pulse">
                                            <div className="w-12 h-12 rounded-full bg-slate-200 mr-4"></div>
                                            <div className="flex-1">
                                                <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
                                                <div className="h-3 bg-slate-200 rounded w-36"></div>
                                            </div>
                                        </div>
                                    ))
                                ) : accounts.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
                                        <span className="material-symbols-outlined text-[48px] mb-2 opacity-50">credit_card_off</span>
                                        <p className="text-sm">Belum ada rekening tersimpan</p>
                                    </div>
                                ) : (
                                    accounts.map(acc => (
                                        <label key={acc.id} className={`relative flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedAccount === acc.id
                                            ? 'border-[#0d59f2] bg-blue-50/40'
                                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                                            }`}>
                                            <input
                                                type="radio"
                                                name="account_select"
                                                className="peer sr-only"
                                                checked={selectedAccount === acc.id}
                                                onChange={() => handleSelect(acc.id)}
                                            />
                                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#0d59f2] shrink-0 mr-4 shadow-sm ring-1 ring-slate-100">
                                                <span className="material-symbols-outlined">account_balance</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-bold text-slate-900">{acc.name}</p>
                                                    {acc.isPrimary && <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold">Utama</span>}
                                                </div>
                                                <p className="text-xs font-medium text-slate-500 mt-0.5">{acc.holder} • {acc.number.slice(-4).padStart(acc.number.length, '*')}</p>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all bg-white ${selectedAccount === acc.id
                                                ? 'border-[#0d59f2] bg-[#0d59f2]'
                                                : 'border-slate-300'
                                                }`}>
                                                <span className={`material-symbols-outlined text-white text-[16px] font-bold ${selectedAccount === acc.id ? 'opacity-100' : 'opacity-0'}`}>check</span>
                                            </div>
                                        </label>
                                    ))
                                )}

                                <div className="h-px bg-slate-100 my-1"></div>

                                <button
                                    onClick={() => navigate('/driver/bank/add')}
                                    className="flex items-center gap-4 p-2 rounded-xl text-left group hover:bg-slate-50 transition-colors -mx-2 px-4"
                                >
                                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 group-hover:border-[#0d59f2] group-hover:text-[#0d59f2] transition-colors bg-slate-50">
                                        <span className="material-symbols-outlined">add</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-700 group-hover:text-[#0d59f2] transition-colors">Tambah Rekening Lain</p>
                                        <p className="text-xs text-slate-400">Hubungkan Bank atau E-Wallet baru</p>
                                    </div>
                                    <span className="material-symbols-outlined text-slate-300 group-hover:text-[#0d59f2]">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </main>

                <DriverBottomNavigation activeTab="earnings" />
            </div>
        </div>
    )
}

export default DriverWithdrawalAccount
