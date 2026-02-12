import { useState, forwardRef } from 'react'

const PhoneInput = forwardRef(function PhoneInput({ value, onChange, error, ...props }, ref) {
    const [focused, setFocused] = useState(false)

    const handleChange = (e) => {
        let input = e.target.value

        // Remove non-numeric characters
        input = input.replace(/\D/g, '')

        // Remove leading 0 or 62
        if (input.startsWith('0')) {
            input = input.substring(1)
        } else if (input.startsWith('62')) {
            input = input.substring(2)
        }

        // Limit to 12 digits (Indonesian phone max)
        input = input.substring(0, 12)

        onChange?.(input)
    }

    const formatDisplayValue = (val) => {
        if (!val) return ''
        // Format: 812 3456 7890
        const parts = []
        if (val.length > 0) parts.push(val.substring(0, 3))
        if (val.length > 3) parts.push(val.substring(3, 7))
        if (val.length > 7) parts.push(val.substring(7, 12))
        return parts.join(' ')
    }

    return (
        <div className="w-full">
            <div
                className={`flex items-center rounded-2xl border bg-white transition-all shadow-sm overflow-hidden
                    ${focused ? 'border-primary ring-1 ring-primary' : error ? 'border-red-400' : 'border-slate-200'}`}
            >
                {/* Country Code Prefix */}
                <div className="flex items-center gap-2 pl-4 pr-3 py-3.5 bg-gray-50 border-r border-slate-200">
                    <span className="text-lg">🇮🇩</span>
                    <span className="text-base font-medium text-slate-700">+62</span>
                </div>

                {/* Phone Input */}
                <input
                    ref={ref}
                    type="tel"
                    inputMode="numeric"
                    value={formatDisplayValue(value)}
                    onChange={handleChange}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder="812 3456 7890"
                    className="flex-1 px-4 py-3.5 text-base text-slate-900 placeholder:text-slate-400 outline-none bg-transparent"
                    {...props}
                />
            </div>

            {error && (
                <p className="text-xs text-red-500 mt-1.5 pl-1">{error}</p>
            )}
        </div>
    )
})

export default PhoneInput
