import { useEffect, useState } from 'react'

export default function AdminDonutChart({ segments = [], centerLabel = '', centerValue = '', size = 140 }) {
    const [animated, setAnimated] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setAnimated(true), 100)
        return () => clearTimeout(timer)
    }, [])

    const total = segments.reduce((sum, s) => sum + s.value, 0)
    const strokeWidth = 18
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const center = size / 2

    let cumulativeOffset = 0

    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="-rotate-90">
                    {/* Background circle */}
                    <circle
                        cx={center} cy={center} r={radius}
                        fill="none"
                        stroke="currentColor"
                        className="text-gray-100 dark:text-gray-700/30"
                        strokeWidth={strokeWidth}
                    />
                    {/* Segments */}
                    {segments.map((segment, index) => {
                        const pct = total > 0 ? segment.value / total : 0
                        const segmentLength = circumference * pct
                        const offset = circumference * cumulativeOffset
                        cumulativeOffset += pct

                        return (
                            <circle
                                key={index}
                                cx={center} cy={center} r={radius}
                                fill="none"
                                stroke={segment.color}
                                strokeWidth={strokeWidth}
                                strokeLinecap="round"
                                strokeDasharray={`${animated ? segmentLength - 2 : 0} ${animated ? circumference - segmentLength + 2 : circumference}`}
                                strokeDashoffset={-offset}
                                className="transition-all duration-700 ease-out"
                            />
                        )
                    })}
                </svg>
                {/* Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-[#111418] dark:text-white leading-none">{centerValue}</span>
                    {centerLabel && (
                        <span className="text-[10px] font-medium text-[#617589] dark:text-[#94a3b8] mt-0.5">{centerLabel}</span>
                    )}
                </div>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-4">
                {segments.map((segment, index) => (
                    <div key={index} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: segment.color }}></div>
                        <span className="text-[11px] font-medium text-[#617589] dark:text-[#94a3b8]">
                            {segment.label} ({segment.value})
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
