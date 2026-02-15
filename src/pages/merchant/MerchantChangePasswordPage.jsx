import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/authService'
import { useToast } from '../../context/ToastContext'

function MerchantChangePasswordPage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const toast = useToast()

    const [showOldPassword, setShowOldPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validation
        if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
            toast.error('Mohon lengkapi semua bidang')
            return
        }

        if (formData.newPassword.length < 8) {
            toast.error('Kata sandi baru minimal 8 karakter')
            return
        }

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('Konfirmasi kata sandi tidak cocok')
            return
        }

        if (formData.oldPassword === formData.newPassword) {
            toast.error('Kata sandi baru tidak boleh sama dengan yang lama')
            return
        }

        setLoading(true)

        try {
            // 1. Verify Old Password
            // We use signInWithPhone because that's how merchants login
            const { error: verifyError } = await authService.signInWithPhone(user.phone, formData.oldPassword)

            if (verifyError) {
                console.error('Password verification failed:', verifyError)
                toast.error('Kata sandi lama salah')
                setLoading(false)
                return
            }

            // 2. Update Password
            const { error: updateError } = await authService.updatePassword(formData.newPassword)

            if (updateError) {
                throw updateError
            }

            toast.success('Kata sandi berhasil diperbarui')
            navigate(-1)

        } catch (error) {
            console.error('Change password failed:', error)
            toast.error('Gagal memperbarui kata sandi')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 relative min-h-screen flex flex-col overflow-x-hidden pb-[88px]">
            <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 pt-12 pb-4 flex items-center justify-between border-b border-transparent dark:border-gray-800">
                <button
                    onClick={() => navigate(-1)}
                    className="w-8 h-8 flex items-center justify-center -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-text-main dark:text-white"
                >
                    <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <h1 className="text-lg font-bold text-text-main dark:text-white leading-tight">Ganti Kata Sandi</h1>
                <div className="w-8"></div>
            </header>

            <main className="flex flex-col px-4 pt-6">
                <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-text-main dark:text-gray-200 ml-1">Kata Sandi Saat Ini</label>
                        <div className="relative group">
                            <input
                                name="oldPassword"
                                value={formData.oldPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark text-text-main dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm"
                                placeholder="Masukkan kata sandi lama"
                                type={showOldPassword ? "text" : "password"}
                            />
                            <button
                                type="button"
                                onClick={() => setShowOldPassword(!showOldPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary dark:hover:text-primary transition-colors p-1"
                            >
                                <span className="material-symbols-outlined text-[22px]">
                                    {showOldPassword ? 'visibility' : 'visibility_off'}
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-text-main dark:text-gray-200 ml-1">Kata Sandi Baru</label>
                        <div className="relative group">
                            <input
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark text-text-main dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm"
                                placeholder="Masukkan kata sandi baru"
                                type={showNewPassword ? "text" : "password"}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary dark:hover:text-primary transition-colors p-1"
                            >
                                <span className="material-symbols-outlined text-[22px]">
                                    {showNewPassword ? 'visibility' : 'visibility_off'}
                                </span>
                            </button>
                        </div>
                        <div className="flex items-start gap-2 px-1 mt-1">
                            <span className="material-symbols-outlined text-gray-400 text-[16px] mt-0.5">info</span>
                            <p className="text-xs text-text-secondary dark:text-gray-500 leading-tight">Kata sandi minimal 8 karakter dengan kombinasi huruf dan angka untuk keamanan maksimal.</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-text-main dark:text-gray-200 ml-1">Konfirmasi Kata Sandi Baru</label>
                        <div className="relative group">
                            <input
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark text-text-main dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm"
                                placeholder="Ulangi kata sandi baru"
                                type={showConfirmPassword ? "text" : "password"}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary dark:hover:text-primary transition-colors p-1"
                            >
                                <span className="material-symbols-outlined text-[22px]">
                                    {showConfirmPassword ? 'visibility' : 'visibility_off'}
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="pt-8">
                        <button
                            className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-[15px] hover:bg-primary-dark active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[20px]">lock_reset</span>
                                    Update Kata Sandi
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    )
}

export default MerchantChangePasswordPage
