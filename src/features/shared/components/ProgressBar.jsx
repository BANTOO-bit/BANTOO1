function ProgressBar({ currentStep, totalSteps, labels = [] }) {
    return (
        <div className="mb-6">
            {/* Progress bars */}
            <div className="flex gap-2 w-full mb-2">
                {Array.from({ length: totalSteps }).map((_, index) => (
                    <div
                        key={index}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${index < currentStep
                                ? 'bg-primary'
                                : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                        aria-label={`Step ${index + 1} ${index < currentStep ? 'completed' : 'pending'}`}
                    />
                ))}
            </div>

            {/* Labels (optional) */}
            {labels.length === totalSteps && (
                <div className="flex justify-between mt-2 text-[10px] uppercase tracking-wider font-semibold">
                    {labels.map((label, index) => (
                        <span
                            key={index}
                            className={
                                index < currentStep
                                    ? 'text-primary'
                                    : index === currentStep - 1
                                        ? 'text-primary'
                                        : 'text-gray-400 dark:text-gray-500'
                            }
                        >
                            {label}
                        </span>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ProgressBar
