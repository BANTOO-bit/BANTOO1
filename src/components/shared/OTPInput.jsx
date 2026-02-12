import { useState, useRef, useEffect } from 'react'

function OTPInput({ length = 6, value = '', onChange, error, autoFocus = true }) {
    const [otp, setOtp] = useState(Array(length).fill(''))
    const inputRefs = useRef([])

    useEffect(() => {
        if (autoFocus && inputRefs.current[0]) {
            inputRefs.current[0].focus()
        }
    }, [autoFocus])

    useEffect(() => {
        // Sync external value with internal state
        if (value) {
            const chars = value.split('').slice(0, length)
            const newOtp = [...Array(length).fill('')]
            chars.forEach((char, i) => {
                newOtp[i] = char
            })
            setOtp(newOtp)
        }
    }, [value, length])

    const handleChange = (index, e) => {
        const val = e.target.value

        // Handle paste
        if (val.length > 1) {
            const pastedValue = val.replace(/\D/g, '').slice(0, length)
            const newOtp = [...Array(length).fill('')]
            pastedValue.split('').forEach((char, i) => {
                newOtp[i] = char
            })
            setOtp(newOtp)
            onChange?.(newOtp.join(''))

            // Focus last filled or first empty
            const focusIndex = Math.min(pastedValue.length, length - 1)
            inputRefs.current[focusIndex]?.focus()
            return
        }

        // Single character input
        const digit = val.replace(/\D/g, '').slice(-1)
        const newOtp = [...otp]
        newOtp[index] = digit
        setOtp(newOtp)
        onChange?.(newOtp.join(''))

        // Auto-focus next input
        if (digit && index < length - 1) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace') {
            if (!otp[index] && index > 0) {
                // If current is empty, go to previous
                inputRefs.current[index - 1]?.focus()
                const newOtp = [...otp]
                newOtp[index - 1] = ''
                setOtp(newOtp)
                onChange?.(newOtp.join(''))
            } else {
                // Clear current
                const newOtp = [...otp]
                newOtp[index] = ''
                setOtp(newOtp)
                onChange?.(newOtp.join(''))
            }
        }

        // Handle arrow keys
        if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
        if (e.key === 'ArrowRight' && index < length - 1) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleFocus = (e) => {
        e.target.select()
    }

    return (
        <div className="w-full">
            <div className="flex items-center justify-center gap-2 sm:gap-3">
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        ref={el => inputRefs.current[index] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength={length}
                        value={digit}
                        onChange={(e) => handleChange(index, e)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onFocus={handleFocus}
                        className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl border bg-white outline-none transition-all
                            ${digit ? 'border-primary bg-primary/5' : error ? 'border-red-400' : 'border-slate-200'}
                            focus:border-primary focus:ring-2 focus:ring-primary/20`}
                    />
                ))}
            </div>

            {error && (
                <p className="text-xs text-red-500 mt-3 text-center">{error}</p>
            )}
        </div>
    )
}

export default OTPInput
