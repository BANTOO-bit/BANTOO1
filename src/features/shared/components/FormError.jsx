/**
 * FormError - Display validation error message
 * Shows error with icon and smooth animation
 */
function FormError({ message, className = '' }) {
    if (!message) return null

    return (
        <div className={`flex items-start gap-1.5 mt-1.5 animate-in fade-in slide-in-from-top-1 duration-200 ${className}`}>
            <span className="material-symbols-outlined text-red-500 text-[16px] mt-0.5">
                error
            </span>
            <p className="text-xs text-red-500 leading-relaxed flex-1">
                {message}
            </p>
        </div>
    )
}

export default FormError
