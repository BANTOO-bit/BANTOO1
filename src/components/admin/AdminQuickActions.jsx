import { Link } from 'react-router-dom'

export default function AdminQuickActions() {
    const quickActions = [
        {
            icon: 'report_problem',
            label: 'Masalah Aktif',
            count: 3,
            path: '/admin/issues',
            color: 'red',
            bgColor: 'bg-red-50 dark:bg-red-900/10',
            iconColor: 'text-red-600 dark:text-red-400',
            badgeColor: 'bg-red-500',
            hoverColor: 'hover:bg-red-100 dark:hover:bg-red-900/20'
        },
        {
            icon: 'account_balance_wallet',
            label: 'Penarikan Pending',
            count: 4,
            path: '/admin/withdrawals',
            color: 'amber',
            bgColor: 'bg-amber-50 dark:bg-amber-900/10',
            iconColor: 'text-amber-600 dark:text-amber-400',
            badgeColor: 'bg-amber-500',
            hoverColor: 'hover:bg-amber-100 dark:hover:bg-amber-900/20'
        },
        {
            icon: 'verified_user',
            label: 'Verifikasi Menunggu',
            count: 8,
            path: '/admin/drivers',
            color: 'blue',
            bgColor: 'bg-blue-50 dark:bg-blue-900/10',
            iconColor: 'text-blue-600 dark:text-blue-400',
            badgeColor: 'bg-blue-500',
            hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900/20'
        }
    ]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {quickActions.map((action) => (
                <Link
                    key={action.path}
                    to={action.path}
                    className={`relative flex items-center gap-4 p-5 rounded-xl border-2 border-transparent ${action.bgColor} ${action.hoverColor} transition-all group hover:border-${action.color}-200 dark:hover:border-${action.color}-800 hover:shadow-lg`}
                >
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full ${action.bgColor} ${action.iconColor} group-hover:scale-110 transition-transform`}>
                        <span className="material-symbols-outlined text-[28px]">{action.icon}</span>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-[#617589] dark:text-[#94a3b8] mb-1">{action.label}</p>
                        <p className="text-2xl font-bold text-[#111418] dark:text-white">{action.count}</p>
                    </div>
                    <div className={`absolute top-3 right-3 flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full ${action.badgeColor} text-white text-xs font-bold shadow-sm`}>
                        {action.count}
                    </div>
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-[#617589] dark:text-[#94a3b8] text-[20px]">arrow_forward</span>
                    </div>
                </Link>
            ))}
        </div>
    )
}
