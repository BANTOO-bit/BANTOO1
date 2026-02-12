import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../context/ToastContext'
import { handleSuccess, handleWarning } from '../../utils/errorHandler'

function SecurityPage() {
    const navigate = useNavigate()
    const toast = useToast()
    const [showChangePassword, setShowChangePassword] = useState(false)
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })

    const handleChangePassword = () => {
        if (passwords.new !== passwords.confirm) {
            toast.warning('Password baru tidak cocok!')
            return
        }
        if (passwords.new.length < 6) {
            toast.warning('Password minimal 6 karakter!')
            return
        }
        toast.success('Password berhasil diubah!')
        setShowChangePassword(false)
        setPasswords({ current: '', new: '', confirm: '' })
    }

    return (
        <div className="min-h-screen flex flex-col bg-background-light">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white px-4 pt-12 pb-4 border-b border-border-color">
                <div className="relative flex items-center justify-center min-h-[40px]">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute left-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-text-main active:scale-95 transition-transform"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-bold">Keamanan Akun</h1>
                </div>
            </header>

            {/* Security Options */}
            <main className="flex-1 px-4 py-4">
                <div className="bg-white rounded-xl border border-border-color overflow-hidden">
                    {/* Change Password */}
                    <button
                        onClick={() => setShowChangePassword(true)}
                        className="w-full p-4 flex items-center justify-between border-b border-border-color hover:bg-gray-50"
                    >
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">lock</span>
                            <div className="text-left">
                                <p className="font-medium text-sm">Ubah Password</p>
                                <p className="text-xs text-text-secondary">Ganti password akunmu</p>
                            </div>
                        </div>
                        <span className="material-symbols-outlined text-text-secondary">chevron_right</span>
                    </button>

                    {/* Two-Factor Auth */}
                    <div className="p-4 flex items-center justify-between border-b border-border-color">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">security</span>
                            <div>
                                <p className="font-medium text-sm">Verifikasi 2 Langkah</p>
                                <p className="text-xs text-text-secondary">Tambahkan keamanan ekstra</p>
                            </div>
                        </div>
                        <div className="w-12 h-7 bg-gray-300 rounded-full relative">
                            <span className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow" />
                        </div>
                    </div>

                    {/* Biometric */}
                    <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">fingerprint</span>
                            <div>
                                <p className="font-medium text-sm">Login dengan Sidik Jari</p>
                                <p className="text-xs text-text-secondary">Login lebih cepat dan aman</p>
                            </div>
                        </div>
                        <div className="w-12 h-7 bg-gray-300 rounded-full relative">
                            <span className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow" />
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="mt-6">
                    <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider px-2 mb-3">
                        Zona Bahaya
                    </h2>
                    <div className="bg-white rounded-xl border border-red-200 overflow-hidden">
                        <button className="w-full p-4 flex items-center gap-3 text-red-500 hover:bg-red-50">
                            <span className="material-symbols-outlined">delete_forever</span>
                            <span className="font-medium text-sm">Hapus Akun</span>
                        </button>
                    </div>
                </div>
            </main>

            {/* Change Password Modal */}
            {showChangePassword && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
                    <div className="w-full bg-white rounded-t-3xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Ubah Password</h3>
                            <button onClick={() => setShowChangePassword(false)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="space-y-4">
                            <input
                                type="password"
                                placeholder="Password Saat Ini"
                                value={passwords.current}
                                onChange={(e) => setPasswords(p => ({ ...p, current: e.target.value }))}
                                className="w-full p-4 border border-border-color rounded-xl"
                            />
                            <input
                                type="password"
                                placeholder="Password Baru"
                                value={passwords.new}
                                onChange={(e) => setPasswords(p => ({ ...p, new: e.target.value }))}
                                className="w-full p-4 border border-border-color rounded-xl"
                            />
                            <input
                                type="password"
                                placeholder="Konfirmasi Password Baru"
                                value={passwords.confirm}
                                onChange={(e) => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                                className="w-full p-4 border border-border-color rounded-xl"
                            />
                            <button
                                onClick={handleChangePassword}
                                className="w-full py-4 bg-primary text-white font-bold rounded-xl"
                            >
                                Simpan Password
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SecurityPage
