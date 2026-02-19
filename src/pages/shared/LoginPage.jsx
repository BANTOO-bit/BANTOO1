import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import PhoneInput from '../../components/shared/PhoneInput'
import useForm from '../../hooks/useForm'
import { loginSchema } from '../../utils/validation'
import ButtonLoader from '../../components/shared/ButtonLoader'
import logger from '../../utils/logger'

function LoginPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const { login } = useAuth()
    const [showPassword, setShowPassword] = useState(false)

    const {
        values,
        errors,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting,
        setFormErrors
    } = useForm({
        initialValues: {
            phone: location.state?.phone || '',
            password: '',
        },
        validationSchema: loginSchema,
        onSubmit: async (formValues) => {
            try {
                const { user } = await login(formValues.phone, formValues.password)
                navigate('/')
            } catch (err) {
                logger.error('Login failed', err, 'LoginPage')
                if (err.message && err.message.includes('Invalid')) {
                    setFormErrors({ general: 'Nomor HP atau kata sandi salah' })
                } else {
                    setFormErrors({ general: 'Gagal login. Silakan coba lagi.' })
                }
            }
        }
    })

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-blue-50/30 to-white relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute top-[-40px] right-[-30px] w-44 h-44 bg-primary/5 rounded-full blur-2xl"></div>
            <div className="absolute bottom-20 left-[-40px] w-56 h-56 bg-accent/5 rounded-full blur-2xl"></div>

            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md px-4 pt-12 pb-4">
                <div className="relative flex items-center justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute left-0 w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100/80 text-gray-700 active:scale-95 transition-transform"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <img src="/images/bantoo-logo.png" alt="Bantoo" className="h-7 object-contain" />
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 px-4 py-6 overflow-y-auto relative z-10">
                <div className="mb-8">
                    <h2 className="text-2xl font-extrabold text-text-main mb-2">Selamat Datang Kembali!</h2>
                    <p className="text-sm text-text-secondary">
                        Masuk untuk melanjutkan pesanan Anda
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Phone Input */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 pl-1 mb-2 block">
                            Nomor Telepon
                        </label>
                        <PhoneInput
                            value={values.phone}
                            onChange={(val) => handleChange('phone', val)}
                            error={errors.phone}
                        />
                    </div>

                    {/* Password Input */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 pl-1 mb-2 block">
                            Kata Sandi
                        </label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <span className="material-symbols-outlined text-[20px]">lock</span>
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={values.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                                onBlur={() => handleBlur('password')}
                                placeholder="Masukkan kata sandi"
                                className={`w-full rounded-xl border bg-white/80 backdrop-blur-sm pl-12 pr-12 py-3.5 text-base text-gray-900 placeholder:text-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm
                                    ${errors.password ? 'border-red-400' : 'border-gray-200'}`}
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
                        {errors.password && <p className="text-xs text-red-500 mt-1.5 pl-1">{errors.password}</p>}
                    </div>

                    {/* General Error Message */}
                    {errors.general && (
                        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-sm text-red-600 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">error</span>
                                {errors.general}
                            </p>
                        </div>
                    )}

                    {/* Forgot Password */}
                    <div className="flex justify-end">
                        <Link to="/help/account/forgot-password" className="text-sm font-semibold text-primary hover:underline">
                            Lupa Kata Sandi?
                        </Link>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-14 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary text-white font-bold rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-lg shadow-primary/25"
                    >
                        {isSubmitting ? (
                            <ButtonLoader />
                        ) : (
                            <>
                                Masuk
                                <span className="material-symbols-outlined text-[20px]">login</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Register Link */}
                <div className="mt-8 text-center pb-8">
                    <p className="text-sm text-text-secondary">
                        Belum punya akun?{' '}
                        <Link to="/register" className="text-primary font-bold hover:underline">
                            Daftar Sekarang
                        </Link>
                    </p>
                </div>
            </main>
        </div>
    )
}

export default LoginPage
