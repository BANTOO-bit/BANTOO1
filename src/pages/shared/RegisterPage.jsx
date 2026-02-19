import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import PhoneInput from '../../components/shared/PhoneInput'
import useForm from '../../hooks/useForm'
import { registerSchema } from '../../utils/validation'
import FormField from '../../components/shared/FormField'
import ButtonLoader from '../../components/shared/ButtonLoader'
import TermsModal from '../../components/shared/TermsModal'
import logger from '../../utils/logger'

function RegisterPage() {
    const navigate = useNavigate()
    const { register } = useAuth()
    const [showPassword, setShowPassword] = useState(false)
    const [acceptTerms, setAcceptTerms] = useState(false)
    const [showTerms, setShowTerms] = useState(false)

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
            name: '',
            email: '',
            phone: '',
            password: '',
        },
        validationSchema: {
            ...registerSchema,
            terms: acceptTerms ? [] : [(value) => !acceptTerms ? 'Anda harus menyetujui syarat & ketentuan' : null]
        },
        onSubmit: async (formValues) => {
            try {
                await register(formValues.name, formValues.phone, formValues.password, 'customer', formValues.email)
                navigate('/login', { state: { phone: formValues.phone } })
            } catch (err) {
                logger.error('Registration failed', err, 'RegisterPage')
                if (err.message && err.message.includes('already registered')) {
                    setFormErrors({ phone: 'Nomor HP sudah terdaftar. Silakan login.' })
                } else {
                    setFormErrors({ general: 'Gagal mendaftar. Silakan coba lagi.' })
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
                <div className="mb-6">
                    <h2 className="text-2xl font-extrabold text-text-main mb-2">Buat Akun Baru</h2>
                    <p className="text-sm text-text-secondary">
                        Isi data diri Anda untuk mulai memesan
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <FormField
                        label="Nama Lengkap"
                        name="name"
                        type="text"
                        value={values.name}
                        onChange={(val) => handleChange('name', val)}
                        onBlur={() => handleBlur('name')}
                        error={errors.name}
                        placeholder="Masukkan nama lengkap"
                        icon="person"
                        required
                    />

                    {/* Email */}
                    <FormField
                        label="Email"
                        name="email"
                        type="email"
                        value={values.email}
                        onChange={(val) => handleChange('email', val)}
                        onBlur={() => handleBlur('email')}
                        error={errors.email}
                        placeholder="Masukkan alamat email"
                        icon="mail"
                        required
                    />

                    {/* Phone */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 pl-1 mb-2 block">
                            Nomor Telepon <span className="text-red-500">*</span>
                        </label>
                        <PhoneInput
                            value={values.phone}
                            onChange={(val) => handleChange('phone', val)}
                            error={errors.phone}
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 pl-1 mb-2 block">
                            Buat Kata Sandi <span className="text-red-500">*</span>
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
                                placeholder="Minimal 6 karakter"
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

                    {/* Terms Checkbox */}
                    <div className="pt-2">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <div className="relative mt-0.5">
                                <input
                                    type="checkbox"
                                    checked={acceptTerms}
                                    onChange={(e) => {
                                        setAcceptTerms(e.target.checked)
                                        if (errors.terms) setErrors(prev => ({ ...prev, terms: '' }))
                                    }}
                                    className="sr-only peer"
                                />
                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
                                    ${acceptTerms ? 'bg-primary border-primary' : errors.terms ? 'border-red-400' : 'border-gray-300'}
                                    peer-focus:ring-2 peer-focus:ring-primary/20`}
                                >
                                    {acceptTerms && (
                                        <span className="material-symbols-outlined text-white text-sm">check</span>
                                    )}
                                </div>
                            </div>
                            <span className="text-sm text-text-secondary leading-relaxed">
                                Saya menyetujui <button type="button" onClick={() => setShowTerms(true)} className="text-primary font-semibold hover:underline">Syarat & Ketentuan</button> Bantoo!
                            </span>
                        </label>
                        {errors.terms && <p className="text-xs text-red-500 mt-1.5 pl-8">{errors.terms}</p>}
                    </div>

                    {/* General Error */}
                    {errors.general && (
                        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-sm text-red-600 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">error</span>
                                {errors.general}
                            </p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-14 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary text-white font-bold rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
                    >
                        {isSubmitting ? (
                            <ButtonLoader />
                        ) : (
                            <>
                                Daftar Sekarang
                                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center pb-8">
                    <p className="text-sm text-text-secondary">
                        Sudah punya akun?{' '}
                        <Link to="/login" className="text-primary font-bold hover:underline">
                            Masuk
                        </Link>
                    </p>
                </div>
            </main>

            {/* Terms Modal */}
            {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
        </div>
    )
}

export default RegisterPage
