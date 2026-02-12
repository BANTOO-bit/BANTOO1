import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DriverBottomNavigation from '../../../components/driver/DriverBottomNavigation'
import { useToast } from '../../../context/ToastContext'
import { handleSuccess } from '../../../utils/errorHandler'

function DriverSecurityPage() {
    const navigate = useNavigate()
    const toast = useToast()
    const [showPasswordForm, setShowPasswordForm] = useState(false)
    const [showPinForm, setShowPinForm] = useState(false)

    // Password Form State
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' })

    // PIN Form State
    const [pinData, setPinData] = useState({ current: '', new: '', confirm: '' })

    const handlePasswordChange = (e) => {
        e.preventDefault()
        // Logic
        toast.success('Password berhasil diubah')
        setShowPasswordForm(false)
        setPasswordData({ current: '', new: '', confirm: '' })
    }

    const handlePinChange = (e) => {
        e.preventDefault()
        // Logic
        toast.success('PIN berhasil diubah')
        setShowPinForm(false)
        setPinData({ current: '', new: '', confirm: '' })
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
                        <h2 className="text-slate-900 text-lg font-bold leading-tight flex-1">Pusat Keamanan</h2>
                    </div>
                </header>

                <main className="flex-1 p-5 pb-12 flex flex-col gap-6">
                    {/* Password Section */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
                                <span className="material-symbols-outlined text-[24px]">lock</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-900">Kata Sandi</h3>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Digunakan untuk masuk ke akun aplikasi driver Anda.</p>
                            </div>
                        </div>
                        {showPasswordForm ? (
                            <form onSubmit={handlePasswordChange} className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <input
                                    type="password"
                                    placeholder="Kata Sandi Saat Ini"
                                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                                    value={passwordData.current}
                                    onChange={e => setPasswordData({ ...passwordData, current: e.target.value })}
                                />
                                <input
                                    type="password"
                                    placeholder="Kata Sandi Baru"
                                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                                    value={passwordData.new}
                                    onChange={e => setPasswordData({ ...passwordData, new: e.target.value })}
                                />
                                <input
                                    type="password"
                                    placeholder="Konfirmasi Kata Sandi Baru"
                                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                                    value={passwordData.confirm}
                                    onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                />
                                <div className="flex gap-2 mt-2">
                                    <button type="button" onClick={() => setShowPasswordForm(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-sm text-slate-600 hover:bg-slate-50">Batal</button>
                                    <button type="submit" className="flex-1 py-2.5 rounded-xl bg-purple-600 font-bold text-sm text-white hover:bg-purple-700 shadow-lg shadow-purple-500/20">Simpan</button>
                                </div>
                            </form>
                        ) : (
                            <button
                                onClick={() => setShowPasswordForm(true)}
                                className="w-full py-2.5 rounded-xl border border-slate-200 font-bold text-sm text-slate-600 hover:border-purple-500 hover:text-purple-600 transition-colors"
                            >
                                Ubah Kata Sandi
                            </button>
                        )}
                    </div>

                    {/* PIN Section */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center text-teal-600">
                                <span className="material-symbols-outlined text-[24px]">pin</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-900">PIN Keamanan</h3>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Digunakan untuk verifikasi penarikan saldo dan perubahan data sensitif.</p>
                            </div>
                        </div>
                        {showPinForm ? (
                            <form onSubmit={handlePinChange} className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <input
                                    type="password"
                                    maxLength="6"
                                    placeholder="PIN Saat Ini (6 digit)"
                                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                                    value={pinData.current}
                                    onChange={e => setPinData({ ...pinData, current: e.target.value })}
                                />
                                <input
                                    type="password"
                                    maxLength="6"
                                    placeholder="PIN Baru (6 digit)"
                                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                                    value={pinData.new}
                                    onChange={e => setPinData({ ...pinData, new: e.target.value })}
                                />
                                <input
                                    type="password"
                                    maxLength="6"
                                    placeholder="Konfirmasi PIN Baru"
                                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                                    value={pinData.confirm}
                                    onChange={e => setPinData({ ...pinData, confirm: e.target.value })}
                                />
                                <div className="flex gap-2 mt-2">
                                    <button type="button" onClick={() => setShowPinForm(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-sm text-slate-600 hover:bg-slate-50">Batal</button>
                                    <button type="submit" className="flex-1 py-2.5 rounded-xl bg-teal-600 font-bold text-sm text-white hover:bg-teal-700 shadow-lg shadow-teal-500/20">Simpan</button>
                                </div>
                            </form>
                        ) : (
                            <button
                                onClick={() => setShowPinForm(true)}
                                className="w-full py-2.5 rounded-xl border border-slate-200 font-bold text-sm text-slate-600 hover:border-teal-500 hover:text-teal-600 transition-colors"
                            >
                                Ubah PIN
                            </button>
                        )}
                    </div>

                    {/* Devices */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                        <h3 className="font-bold text-slate-900 text-sm mb-3">Perangkat Terhubung</h3>
                        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
                            <span className="material-symbols-outlined text-slate-400">smartphone</span>
                            <div className="flex-1">
                                <p className="text-xs font-bold text-slate-900">Samsung Galaxy S23</p>
                                <p className="text-[10px] text-slate-500">Jakarta, ID • Saat ini</p>
                            </div>
                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">Aktif</span>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default DriverSecurityPage
