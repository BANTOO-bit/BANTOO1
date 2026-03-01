import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../../context/AuthContext'
import FormField from '../../../../components/shared/FormField'
import ButtonLoader from '../../../../components/shared/ButtonLoader'
import logger from '../../../../utils/logger'

function ForgotPasswordHelpPage() {
    const navigate = useNavigate()
    const { resetPassword } = useAuth()

    const [identifier, setIdentifier] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!identifier.trim()) {
            setError('Nomor HP atau Email tidak boleh kosong')
            return
        }

        setIsSubmitting(true)
        setError('')

        try {
            await resetPassword(identifier)
            setIsSuccess(true)
        } catch (err) {
            logger.error('Reset password failed', err, 'ForgotPasswordHelpPage')
            setError(err.message || 'Gagal mengirim email pemulihan. Silakan periksa kembali data Anda.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-white relative overflow-hidden">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md px-4 pt-12 pb-4">
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
                    <h2 className="text-2xl font-extrabold text-text-main mb-2">Lupa Kata Sandi?</h2>
                    <p className="text-sm text-text-secondary">
                        Masukkan Email atau Nomor HP yang terdaftar. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda.
                    </p>
                </div>

                {isSuccess ? (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center shadow-sm">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-3xl">mark_email_read</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Periksa Email Anda</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Tautan pemulihan kata sandi telah dikirimkan ke email Anda. Silakan periksa kotak masuk atau folder spam.
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="mt-6 w-full py-3.5 bg-green-600 text-white font-bold rounded-xl active:scale-[0.98] transition-transform"
                        >
                            Kembali ke Masuk
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <FormField
                            label="Email atau Nomor Telepon"
                            name="identifier"
                            type="text"
                            value={identifier}
                            onChange={(val) => {
                                setIdentifier(val)
                                if (error) setError('')
                            }}
                            error={error}
                            placeholder="Contoh: budi@email.com atau 0812345678"
                            icon="account_circle"
                            required
                        />

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
                            disabled={isSubmitting || !identifier}
                            className="w-full h-14 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary text-white font-bold rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-sm shadow-primary/10"
                        >
                            {isSubmitting ? (
                                <ButtonLoader />
                            ) : (
                                <>
                                    Kirim Tautan Pemulihan
                                    <span className="material-symbols-outlined text-[20px]">send</span>
                                </>
                            )}
                        </button>
                    </form>
                )}
            </main>
        </div>
    )
}

export default ForgotPasswordHelpPage
