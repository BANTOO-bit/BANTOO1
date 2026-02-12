import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import OTPInput from '../../components/shared/OTPInput'

function OTPVerificationPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const { verifyOTP, sendOTP, pendingPhone } = useAuth()
    const [otp, setOtp] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [countdown, setCountdown] = useState(60)
    const [canResend, setCanResend] = useState(false)

    // Get phone and redirect from navigation state
    const phoneNumber = location.state?.phone
    const redirectPath = location.state?.redirectPath || '/';
    const phone = phoneNumber || pendingPhone || '+62 812 xxxx xxxx'

    // Countdown timer
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        } else {
            setCanResend(true)
        }
    }, [countdown])

    // Auto-submit when OTP is complete
    useEffect(() => {
        if (otp.length === 6) {
            handleVerify()
        }
    }, [otp])

    const handleVerify = async () => {
        if (otp.length !== 6) {
            setError('Masukkan 6 digit kode OTP')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const result = await verifyOTP(otp)
            if (result.success) {
                // Navigate to the intended dashboard or home
                navigate(redirectPath, { replace: true })
            } else {
                setError(result.error || 'Kode OTP tidak valid')
                setOtp('')
            }
        } catch (err) {
            setError('Terjadi kesalahan. Silakan coba lagi.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleResend = async () => {
        if (!canResend) return

        setCanResend(false)
        setCountdown(60)
        setOtp('')
        setError('')

        try {
            await sendOTP(phone)
        } catch (err) {
            setError('Gagal mengirim ulang kode')
        }
    }

    const formatPhone = (phone) => {
        // Mask middle digits: +62 812 **** 7890
        if (!phone) return ''
        const cleaned = phone.replace(/\D/g, '')
        if (cleaned.length >= 10) {
            return `+62 ${cleaned.slice(2, 5)} **** ${cleaned.slice(-4)}`
        }
        return phone
    }

    return (
        <div className="min-h-screen flex flex-col bg-background-light">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background-light/95 backdrop-blur-sm px-4 pt-12 pb-4">
                <div className="relative flex items-center justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute left-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-text-main active:scale-95 transition-transform"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-bold">Verifikasi OTP</h1>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 px-4 py-8 overflow-y-auto flex flex-col items-center">
                {/* Illustration */}
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-primary text-5xl">sms</span>
                </div>

                {/* Title */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-text-main mb-2">Masukkan Kode OTP</h2>
                    <p className="text-sm text-text-secondary">
                        Kode verifikasi telah dikirim ke
                    </p>
                    <p className="text-sm font-bold text-text-main mt-1">
                        {formatPhone(phone)}
                    </p>
                </div>

                {/* OTP Input */}
                <div className="w-full max-w-xs mb-6">
                    <OTPInput
                        length={6}
                        value={otp}
                        onChange={setOtp}
                        error={error}
                        autoFocus
                    />
                </div>

                {/* Loading Indicator */}
                {isLoading && (
                    <div className="flex items-center gap-2 text-primary mb-6">
                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        <span className="text-sm font-medium">Memverifikasi...</span>
                    </div>
                )}

                {/* Resend Section */}
                <div className="text-center">
                    {canResend ? (
                        <button
                            onClick={handleResend}
                            className="text-primary font-bold text-sm"
                        >
                            Kirim Ulang Kode
                        </button>
                    ) : (
                        <p className="text-sm text-text-secondary">
                            Kirim ulang kode dalam{' '}
                            <span className="font-bold text-primary">{countdown}</span>
                            {' '}detik
                        </p>
                    )}
                </div>

                {/* Help Text */}
                <div className="mt-auto pt-8">
                    <p className="text-xs text-center text-text-secondary">
                        Tidak menerima kode?{' '}
                        <span className="text-primary font-medium">Hubungi Bantuan</span>
                    </p>
                </div>
            </main>

            {/* Bottom Section */}
            <div className="px-4 pb-8">
                <button
                    onClick={handleVerify}
                    disabled={isLoading || otp.length !== 6}
                    className="w-full h-14 bg-primary text-white font-bold rounded-[28px] shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    ) : (
                        'Verifikasi'
                    )}
                </button>
            </div>
        </div>
    )
}

export default OTPVerificationPage
