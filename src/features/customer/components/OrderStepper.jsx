/**
 * OrderStepper Component
 * Displays a horizontal progress stepper for order status
 * Shows: Dipesan → Disiapkan → Diantar → Sampai
 */

const STEPS = [
    { id: 'ordered', label: 'Dipesan' },
    { id: 'preparing', label: 'Disiapkan' },
    { id: 'delivering', label: 'Diantar' },
    { id: 'delivered', label: 'Sampai' }
]

function OrderStepper({ currentStep = 0 }) {
    // currentStep: 0 (ordered), 1 (preparing), 2 (delivering), 3 (delivered)

    return (
        <div className="mb-5 px-1">
            <div className="flex items-start justify-between">
                {STEPS.map((step, index) => {
                    const isCompleted = index < currentStep
                    const isCurrent = index === currentStep
                    const isActive = index <= currentStep
                    const isLast = index === STEPS.length - 1

                    return (
                        <div key={step.id} className="flex items-start flex-1">
                            {/* Step indicator */}
                            <div className="flex flex-col items-center gap-1.5 flex-1">
                                <div
                                    className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${isCompleted
                                            ? 'bg-primary'
                                            : isCurrent
                                                ? 'border-2 border-primary bg-white dark:bg-card-dark'
                                                : 'bg-gray-200 dark:bg-gray-700'
                                        }`}
                                >
                                    {isCompleted && (
                                        <span className="material-symbols-outlined text-[10px] text-white fill">
                                            check
                                        </span>
                                    )}
                                    {isCurrent && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                                    )}
                                </div>
                                <span
                                    className={`text-[9px] font-medium ${isActive
                                            ? 'text-primary font-bold'
                                            : 'text-text-secondary'
                                        }`}
                                >
                                    {step.label}
                                </span>
                            </div>

                            {/* Connector line */}
                            {!isLast && (
                                <div
                                    className={`h-0.5 flex-grow mt-2 mx-1 ${isCompleted
                                            ? 'bg-primary'
                                            : 'bg-gray-200 dark:bg-gray-700'
                                        }`}
                                ></div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default OrderStepper
