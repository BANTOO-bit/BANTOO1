import { useState, useEffect } from 'react'
import AdminLayout from '@/features/admin/components/AdminLayout'
import { auditLogService } from '@/services/auditLogService'
import AdminPagination from '@/features/admin/components/AdminPagination'
import { SkeletonTable } from '@/features/admin/components/AdminSkeleton'

const ITEMS_PER_PAGE = 20

const ACTION_LABELS = {
    approve_merchant: { label: 'Approve Warung', icon: 'check_circle', color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
    reject_merchant: { label: 'Reject Warung', icon: 'cancel', color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
    suspend_merchant: { label: 'Suspend Warung', icon: 'pause_circle', color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' },
    unsuspend_merchant: { label: 'Aktifkan Warung', icon: 'play_circle', color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
    terminate_merchant: { label: 'Putus Mitra Warung', icon: 'shopping_cart_off', color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
    approve_driver: { label: 'Approve Driver', icon: 'check_circle', color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
    reject_driver: { label: 'Reject Driver', icon: 'cancel', color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
    suspend_driver: { label: 'Suspend Driver', icon: 'pause_circle', color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' },
    unsuspend_driver: { label: 'Aktifkan Driver', icon: 'play_circle', color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
    terminate_driver: { label: 'Putus Mitra Driver', icon: 'person_off', color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
    approve_withdrawal: { label: 'Approve Penarikan', icon: 'payments', color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
    reject_withdrawal: { label: 'Reject Penarikan', icon: 'money_off', color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
    update_settings: { label: 'Update Pengaturan', icon: 'settings', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
}

const getActionInfo = (action) => ACTION_LABELS[action] || {
    label: action?.replace(/_/g, ' ') || 'Unknown',
    icon: 'history',
    color: 'text-gray-600 bg-gray-50 dark:bg-gray-800'
}

const timeAgo = (dateStr) => {
    if (!dateStr) return ''
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
    if (diff < 60) return 'Baru saja'
    if (diff < 3600) return `${Math.floor(diff / 60)}m lalu`
    if (diff < 86400) return `${Math.floor(diff / 3600)}j lalu`
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function AdminAuditLogPage() {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [filterType, setFilterType] = useState('')

    useEffect(() => {
        async function fetchLogs() {
            setLoading(true)
            try {
                const data = await auditLogService.getAll({
                    page: currentPage,
                    limit: ITEMS_PER_PAGE,
                    targetType: filterType || null
                })
                setLogs(data)
            } catch (err) {
                console.error('Error fetching audit logs:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchLogs()
    }, [currentPage, filterType])

    const breadcrumb = [
        { label: 'Dashboard', path: '/admin/dashboard' },
        { label: 'Pengaturan', path: '/admin/settings' },
        { label: 'Log Aktivitas' }
    ]

    return (
        <AdminLayout title="Log Aktivitas Admin" showBack breadcrumb={breadcrumb}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <p className="text-sm text-[#617589] dark:text-[#94a3b8]">
                        Catatan semua aktivitas administrator di platform
                    </p>
                </div>

                {/* Filter */}
                <div className="relative">
                    <select
                        value={filterType}
                        onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1) }}
                        className="appearance-none bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg pl-4 pr-10 py-2.5 text-sm text-[#111418] dark:text-white focus:outline-none focus:border-primary cursor-pointer"
                    >
                        <option value="">Semua Tipe</option>
                        <option value="merchant">Warung</option>
                        <option value="driver">Driver</option>
                        <option value="withdrawal">Penarikan</option>
                        <option value="order">Pesanan</option>
                        <option value="setting">Pengaturan</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#617589]">
                        <span className="material-symbols-outlined text-lg">keyboard_arrow_down</span>
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            {loading ? (
                <SkeletonTable rows={8} cols={4} />
            ) : logs.length === 0 ? (
                <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] flex flex-col items-center justify-center p-16">
                    <div className="w-16 h-16 bg-[#f0f2f4] dark:bg-[#2a3b4d] rounded-full flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-3xl text-[#94a3b8]">history</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#111418] dark:text-white mb-1">Belum Ada Log</h3>
                    <p className="text-sm text-[#617589] dark:text-[#94a3b8]">Aktivitas admin akan tercatat secara otomatis</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[#e5e7eb] dark:border-[#2a3b4d] text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase bg-[#f9fafb] dark:bg-[#1e2c3a]">
                                    <th className="px-6 py-4">Aktivitas</th>
                                    <th className="px-6 py-4">Admin</th>
                                    <th className="px-6 py-4">Target</th>
                                    <th className="px-6 py-4">Waktu</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#2a3b4d]">
                                {logs.map((log) => {
                                    const info = getActionInfo(log.action)
                                    return (
                                        <tr key={log.id} className="hover:bg-[#f9fafb] dark:hover:bg-[#202e3b] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-lg ${info.color} flex items-center justify-center shrink-0`}>
                                                        <span className="material-symbols-outlined text-lg">{info.icon}</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-[#111418] dark:text-white">{info.label}</p>
                                                        {log.details?.reason && (
                                                            <p className="text-xs text-[#617589] dark:text-[#94a3b8] mt-0.5">
                                                                Alasan: {log.details.reason}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-[#111418] dark:text-white">
                                                    {log.admin?.full_name || 'Admin'}
                                                </p>
                                                <p className="text-xs text-[#617589] dark:text-[#94a3b8]">
                                                    {log.admin?.email || '-'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#f0f2f4] dark:bg-[#2a3b4d] text-[#617589] dark:text-[#94a3b8]">
                                                    {log.target_type || '-'}
                                                </span>
                                                {log.target_id && (
                                                    <p className="text-xs text-[#617589] dark:text-[#94a3b8] mt-1 font-mono">
                                                        #{log.target_id.substring(0, 8)}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-[#617589] dark:text-[#94a3b8] whitespace-nowrap">
                                                    {timeAgo(log.created_at)}
                                                </p>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                    <AdminPagination
                        currentPage={currentPage}
                        totalItems={logs.length === ITEMS_PER_PAGE ? currentPage * ITEMS_PER_PAGE + 1 : (currentPage - 1) * ITEMS_PER_PAGE + logs.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setCurrentPage}
                        label="log"
                    />
                </div>
            )}
        </AdminLayout>
    )
}
