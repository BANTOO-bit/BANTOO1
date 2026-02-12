import { useEffect, useState } from 'react'

export default function AdminBarChart({ data = [], title = '', color = 'blue' }) {
    const [animated, setAnimated] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setAnimated(true), 100)
        return () => clearTimeout(timer)
    }, [])

    const maxValue = Math.max(...data.map(d => d.value), 1)

    const colorMap = {
        blue: { bar: 'bg-gradient-to-t from-blue-500 to-blue-400', bg: 'bg-blue-500/10' },
        green: { bar: 'bg-gradient-to-t from-emerald-500 to-emerald-400', bg: 'bg-emerald-500/10' },
        amber: { bar: 'bg-gradient-to-t from-amber-500 to-amber-400', bg: 'bg-amber-500/10' },
        indigo: { bar: 'bg-gradient-to-t from-indigo-500 to-indigo-400', bg: 'bg-indigo-500/10' },
    }

    const colors = colorMap[color] || colorMap.blue

    return (
        <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] p-5 shadow-sm">
            {title && (
                <h4 className="text-sm font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wide mb-4">{title}</h4>
            )}
            <div className="flex items-end gap-2 h-40">
                {data.map((item, index) => {
                    const heightPct = (item.value / maxValue) * 100
                    return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-1.5">
                            <span className="text-[10px] font-bold text-[#111418] dark:text-white">
                                {item.value}
                            </span>
                            <div className={`w-full rounded-t-md ${colors.bg} relative overflow-hidden`} style={{ height: '120px' }}>
                                <div
                                    className={`absolute bottom-0 left-0 right-0 ${colors.bar} rounded-t-md transition-all duration-700 ease-out`}
                                    style={{ height: animated ? `${heightPct}%` : '0%' }}
                                ></div>
                            </div>
                            <span className="text-[10px] font-medium text-[#617589] dark:text-[#94a3b8] truncate w-full text-center">
                                {item.label}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
