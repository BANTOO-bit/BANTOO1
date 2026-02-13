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

                // Always navigate to Customer Home for role selection
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
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm px-4 pt-4 pb-4 shadow-sm">
                <div className="relative flex items-center justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute left-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 active:scale-95 transition-transform"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">Masuk</h1>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 px-6 py-8 overflow-y-auto">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Selamat Datang Kembali!</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Masuk untuk melanjutkan pesanan Anda
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Phone Input */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 pl-1 mb-2 block">
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
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 pl-1 mb-2 block">
                            Kata Sandi
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={values.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                                onBlur={() => handleBlur('password')}
                                placeholder="Masukkan kata sandi"
                                className={`w-full rounded-2xl border bg-white dark:bg-gray-800 px-4 py-3.5 pr-12 text-base text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm
                                    ${errors.password ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
                        <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
                            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">error</span>
                                {errors.general}
                            </p>
                        </div>
                    )}

                    {/* Forgot Password */}
                    <div className="flex justify-end">
                        <Link to="/help/account/forgot-password" className="text-sm font-medium text-primary hover:underline">
                            Lupa Kata Sandi?
                        </Link>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-14 bg-primary hover:bg-orange-600 text-white font-bold rounded-[28px] shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        {isSubmitting ? (
                            <ButtonLoader />
                        ) : (
                            <>
                                Masuk
                                <span className="material-symbols-outlined">login</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Register Link */}
                <div className="mt-8 text-center pb-8">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
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
