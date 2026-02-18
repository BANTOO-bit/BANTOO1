import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../../context/ToastContext'
import { handleError, handleSuccess, handleWarning } from '../../../utils/errorHandler'
import { authService } from '../../../services/authService'
import issueService from '../../../services/issueService'

function SecurityPage() {
    const navigate = useNavigate()
    const toast = useToast()
    const [showChangePassword, setShowChangePassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })

    const handleChangePassword = async () => {
        if (!passwords.new || !passwords.confirm) {
            toast.warning('Mohon isi semua kolom password')
            return
        }

        if (passwords.new !== passwords.confirm) {
            toast.warning('Password baru tidak cocok!')
            return
        }

        if (passwords.new.length < 6) {
            toast.warning('Password minimal 6 karakter!')
            return
        }

        try {
            setLoading(true)
            const { error } = await authService.updatePassword(passwords.new)

            if (error) throw error

            toast.success('Password berhasil diubah!')
            setShowChangePassword(false)
            setPasswords({ current: '', new: '', confirm: '' })
        } catch (error) {
            handleError(error, toast, { context: 'Ubah password' })
        } finally {
            setLoading(false)
        }

    }

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleteConfirmation, setDeleteConfirmation] = useState('')

    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== 'HAPUS') {
            toast.warning('Silakan ketik HAPUS untuk konfirmasi')
            return
        }

        try {
            setLoading(true)
            await issueService.reportIssue({
                category: 'Lainnya',
                description: 'PERMINTAAN HAPUS AKUN: User meminta penghapusan akun permanen.',
                priority: 'high'
            })

            toast.success('Permintaan penghapusan akun telah dikirim ke admin.')
            setShowDeleteConfirm(false)
            setDeleteConfirmation('')
        } catch (error) {
            handleError(error, toast, { context: 'Hapus akun' })
        } finally {
            setLoading(false)
        }
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
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="w-full p-4 flex items-center gap-3 text-red-500 hover:bg-red-50 transition-colors"
                        >
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
                                disabled={loading}
                                className="w-full py-4 bg-primary text-white font-bold rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Menyimpan...' : 'Simpan Password'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Account Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
                    <div className="w-full bg-white rounded-t-3xl p-5 animate-slide-up">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-red-500">
                                <span className="material-symbols-outlined">warning</span>
                                <h3 className="text-lg font-bold">Hapus Akun?</h3>
                            </div>
                            <button onClick={() => setShowDeleteConfirm(false)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="bg-red-50 p-4 rounded-xl mb-4 text-sm text-red-600 leading-relaxed border border-red-100">
                            Permintaan penghapusan akun tidak dapat dibatalkan. Semua data riwayat pesanan dan poin akan hilang permanen.
                            <br /><br />
                            Tim kami akan memproses permintaan Anda dalam 24 jam.
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                                    Ketik <span className="font-bold text-gray-900">HAPUS</span> untuk konfirmasi
                                </label>
                                <input
                                    type="text"
                                    placeholder="HAPUS"
                                    value={deleteConfirmation}
                                    onChange={(e) => setDeleteConfirmation(e.target.value.toUpperCase())}
                                    className="w-full p-4 border border-border-color rounded-xl font-bold tracking-widest text-center focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder:font-normal placeholder:tracking-normal"
                                />
                            </div>

                            <button
                                onClick={handleDeleteAccount}
                                disabled={loading || deleteConfirmation !== 'HAPUS'}
                                className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                            >
                                {loading ? 'Mengirim Permintaan...' : 'Ajukan Penghapusan Akun'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SecurityPage
