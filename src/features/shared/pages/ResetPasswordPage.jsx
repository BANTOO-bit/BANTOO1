import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import ButtonLoader from '@/features/shared/components/ButtonLoader'
import logger from '@/utils/logger'

function ResetPasswordPage() {
    const navigate = useNavigate()
    const { updatePassword } = useAuth()

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (password.length < 6) {
            setError('Kata sandi minimal terdiri dari 6 karakter')
            return
        }

        if (password !== confirmPassword) {
            setError('Konfirmasi kata sandi tidak cocok')
            return
        }

        setIsSubmitting(true)
        setError('')

        try {
            await updatePassword(password)
            setIsSuccess(true)

            // Redirect after 3 seconds
            setTimeout(() => {
                navigate('/login')
            }, 3000)

        } catch (err) {
            logger.error('Update password failed', err, 'ResetPasswordPage')
            setError(err.message || 'Gagal mengubah kata sandi. Tautan mungkin telah kadaluarsa.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-white relative overflow-hidden">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md px-4 pt-12 pb-4">
                <div className="relative flex items-center justify-center">
                    <img src="/images/bantoo-logo.png" alt="Bantoo" className="h-7 object-contain" />
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 px-4 py-6 overflow-y-auto relative z-10 w-full max-w-md mx-auto">
                <div className="mb-8 text-center pt-4">
                    <h2 className="text-2xl font-extrabold text-text-main mb-2">Buat Sandi Baru</h2>
                    <p className="text-sm text-text-secondary">
                        Silakan buat kata sandi baru yang kuat untuk mengamankan akun Anda.
                    </p>
                </div>

                {isSuccess ? (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center shadow-sm">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-3xl">check_circle</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Berhasil Diubah!</h3>
                        <p className="text-sm text-gray-600 leading-relaxed mb-6">
                            Kata sandi Anda telah berhasil diperbarui. Anda akan segera dialihkan ke halaman Masuk.
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full py-3.5 bg-green-600 text-white font-bold rounded-xl active:scale-[0.98] transition-transform"
                        >
                            Masuk Sekarang
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* New Password */}
                        <div>
                            <label className="text-sm font-semibold text-gray-700 pl-1 mb-2 block">
                                Kata Sandi Baru <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <span className="material-symbols-outlined text-[20px]">lock</span>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value)
                                        if (error) setError('')
                                    }}
                                    placeholder="Minimal 6 karakter"
                                    className={`w-full rounded-xl border bg-white/80 backdrop-blur-sm pl-12 pr-12 py-3.5 text-base text-gray-900 placeholder:text-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${error ? 'border-red-400' : 'border-gray-200'}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <span className="material-symbols-outlined text-[20px]">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="text-sm font-semibold text-gray-700 pl-1 mb-2 block">
                                Konfirmasi Kata Sandi Baru <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <span className="material-symbols-outlined text-[20px]">lock_reset</span>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value)
                                        if (error) setError('')
                                    }}
                                    placeholder="Ulangi kata sandi baru"
                                    className={`w-full rounded-xl border bg-white/80 backdrop-blur-sm pl-12 pr-12 py-3.5 text-base text-gray-900 placeholder:text-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${error ? 'border-red-400' : 'border-gray-200'}`}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl">
                                <p className="text-sm text-red-600 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">error</span>
                                    {error}
                                </p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting || !password || !confirmPassword}
                            className="w-full h-14 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary text-white font-bold rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-sm shadow-primary/10"
                        >
                            {isSubmitting ? (
                                <ButtonLoader />
                            ) : (
                                <>
                                    Simpan Kata Sandi
                                    <span className="material-symbols-outlined text-[20px]">save</span>
                                </>
                            )}
                        </button>
                    </form>
                )}
            </main>
        </div>
    )
}

export default ResetPasswordPage
