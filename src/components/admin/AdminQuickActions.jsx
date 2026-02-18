import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../services/supabaseClient'

export default function AdminQuickActions() {
    const [counts, setCounts] = useState({ issues: 0, withdrawals: 0, verifications: 0 })

    const fetchCounts = async () => {
        try {
            const [issuesRes, withdrawalsRes, driversRes, merchantsRes] = await Promise.all([
                supabase.from('issues').select('id', { count: 'exact', head: true }).in('status', ['open', 'in_progress']),
                supabase.from('withdrawals').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
                supabase.from('drivers').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
                supabase.from('merchants').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
            ])

            setCounts({
                issues: issuesRes.count || 0,
                withdrawals: withdrawalsRes.count || 0,
                verifications: (driversRes.count || 0) + (merchantsRes.count || 0)
            })
        } catch (err) {
            console.error('Error fetching quick action counts:', err)
        }
    }

    useEffect(() => {
        fetchCounts()

        const channel = supabase.channel('admin-quick-actions')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawals' }, fetchCounts)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'drivers' }, fetchCounts)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'merchants' }, fetchCounts)
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [])

    const quickActions = [
        {
            icon: 'report_problem',
            label: 'Masalah Aktif',
            count: counts.issues,
            path: '/admin/issues',
            bgColor: 'bg-red-50 dark:bg-red-900/10',
            iconColor: 'text-red-600 dark:text-red-400',
            badgeColor: 'bg-red-500',
            hoverColor: 'hover:bg-red-100 dark:hover:bg-red-900/20'
        },
        {
            icon: 'account_balance_wallet',
            label: 'Penarikan Pending',
            count: counts.withdrawals,
            path: '/admin/withdrawals',
            bgColor: 'bg-amber-50 dark:bg-amber-900/10',
            iconColor: 'text-amber-600 dark:text-amber-400',
            badgeColor: 'bg-amber-500',
            hoverColor: 'hover:bg-amber-100 dark:hover:bg-amber-900/20'
        },
        {
            icon: 'verified_user',
            label: 'Verifikasi Menunggu',
            count: counts.verifications,
            path: '/admin/drivers',
            bgColor: 'bg-blue-50 dark:bg-blue-900/10',
            iconColor: 'text-blue-600 dark:text-blue-400',
            badgeColor: 'bg-blue-500',
            hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900/20'
        }
    ]

    return (
        <div className="grid grid-cols-3 gap-3">
            {quickActions.map((action) => (
                <Link
                    key={action.path}
                    to={action.path}
                    className={`relative flex items-center gap-3 p-4 rounded-xl border border-transparent ${action.bgColor} ${action.hoverColor} transition-all group hover:shadow-md`}
                >
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${action.bgColor} ${action.iconColor} group-hover:scale-105 transition-transform`}>
                        <span className="material-symbols-outlined text-xl">{action.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#617589] dark:text-[#94a3b8] truncate">{action.label}</p>
                        <p className="text-xl font-bold text-[#111418] dark:text-white">{action.count}</p>
                    </div>
                    {action.count > 0 && (
                        <div className={`absolute top-2.5 right-2.5 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full ${action.badgeColor} text-white text-[10px] font-bold`}>
                            {action.count}
                        </div>
                    )}
                </Link>
            ))}
        </div>
    )
}
