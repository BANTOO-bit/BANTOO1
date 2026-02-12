export default function AdminStatCard({ title, value, subtext, icon, trend, trendValue, color = 'blue' }) {
    const getColorClasses = (c) => {
        const classes = {
            blue: {
                bg: 'bg-blue-50 dark:bg-blue-900/20',
                text: 'text-blue-600 dark:text-blue-400',
                trend: 'text-emerald-600 dark:text-emerald-400'
            },
            amber: {
                bg: 'bg-amber-50 dark:bg-amber-900/20',
                text: 'text-amber-600 dark:text-amber-400',
                trend: 'text-amber-600 dark:text-amber-400'
            },
            indigo: {
                bg: 'bg-indigo-50 dark:bg-indigo-900/20',
                text: 'text-indigo-600 dark:text-indigo-400',
                trend: 'text-indigo-600 dark:text-indigo-400'
            },
            green: {
                bg: 'bg-emerald-50 dark:bg-emerald-900/20',
                text: 'text-emerald-600 dark:text-emerald-400',
                trend: 'text-emerald-600 dark:text-emerald-400'
            },
            red: {
                bg: 'bg-red-50 dark:bg-red-900/20',
                text: 'text-red-600 dark:text-red-400',
                trend: 'text-red-600 dark:text-red-400'
            }
        };
        return classes[c] || classes.blue;
    };

    const colors = getColorClasses(color);

    return (
        <div className="bg-white dark:bg-[#1a2632] p-3.5 rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm flex flex-col gap-2 relative overflow-hidden">
            {color === 'red' && (
                <div className="absolute right-0 top-0 w-16 h-16 bg-red-500/5 rounded-bl-full -mr-8 -mt-8 z-0"></div>
            )}
            <div className="flex items-center justify-between relative z-10">
                <p className="text-[#617589] dark:text-[#94a3b8] text-xs font-medium leading-tight">{title}</p>
                <div className={`${colors.bg} ${colors.text} p-1 rounded-lg shrink-0`}>
                    <span className="material-symbols-outlined text-base">{icon}</span>
                </div>
            </div>
            <div className="flex items-end justify-between relative z-10">
                <p className="text-xl font-bold text-[#111418] dark:text-white tracking-tight leading-none">{value}</p>
                {trend ? (
                    <div className={`flex items-center gap-0.5 text-[11px] font-medium ${colors.trend}`}>
                        <span className="material-symbols-outlined text-xs">trending_up</span>
                        <span>{trendValue}</span>
                    </div>
                ) : (
                    <span className={`text-[11px] font-medium leading-tight text-right ${color === 'red' ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-[#617589] dark:text-[#94a3b8]'}`}>
                        {subtext}
                    </span>
                )}
            </div>
        </div>
    )
}
