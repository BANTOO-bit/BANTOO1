import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../../../services/supabaseClient'
import AdminLayout from '../../../components/admin/AdminLayout'

export default function AdminIssueDetailPage() {
    const { id } = useParams()
    const [issue, setIssue] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchIssue = async () => {
        try {
            const { data, error: fetchErr } = await supabase
                .from('issues')
                .select(`
                    *,
                    reporter:profiles!issues_reporter_id_fkey(id, full_name, phone, email),
                    assigned_to:profiles!issues_assigned_to_fkey(id, full_name)
                `)
                .eq('id', id)
                .single()

            if (fetchErr) throw fetchErr
            setIssue(data)
        } catch (err) {
            console.error('Error fetching issue:', err)
            setError('Gagal memuat detail masalah')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchIssue() }, [id])

    const formatDate = (dateStr) => {
        if (!dateStr) return '-'
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        })
    }

    const formatShortDate = (dateStr) => {
        if (!dateStr) return '-'
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        })
    }

    const getInitials = (name) => {
        if (!name) return '??'
        return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
    }

    const getStatusInfo = (status) => {
        const map = {
            open: { label: 'Baru', icon: 'error', color: 'red' },
            in_progress: { label: 'Ditangani', icon: 'pending', color: 'orange' },
            resolved: { label: 'Selesai', icon: 'check_circle', color: 'green' },
            closed: { label: 'Ditutup', icon: 'cancel', color: 'gray' }
        }
        return map[status] || map.open
    }

    const getPriorityInfo = (priority) => {
        const map = {
            low: { label: 'Rendah', color: 'text-blue-500' },
            medium: { label: 'Sedang', color: 'text-orange-500' },
            high: { label: 'Tinggi', color: 'text-red-500' },
            critical: { label: 'Kritis', color: 'text-red-700' }
        }
        return map[priority] || map.medium
    }

    if (loading) {
        return (
            <AdminLayout title="Detail Masalah">
                <div className="flex items-center justify-center py-20">
                    <span className="material-symbols-outlined animate-spin text-4xl text-[#617589]">progress_activity</span>
                </div>
            </AdminLayout>
        )
    }

    if (error || !issue) {
        return (
            <AdminLayout title="Detail Masalah">
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <span className="material-symbols-outlined text-5xl text-red-400 mb-4">error</span>
                    <h3 className="text-lg font-bold text-[#111418] dark:text-white mb-2">{error || 'Masalah tidak ditemukan'}</h3>
                    <Link to="/admin/issues" className="text-sm text-primary hover:underline mt-4">← Kembali ke Daftar</Link>
                </div>
            </AdminLayout>
        )
    }

    const statusInfo = getStatusInfo(issue.status)
    const priorityInfo = getPriorityInfo(issue.priority)

    return (
        <AdminLayout title="Detail Riwayat Penyelesaian Masalah">

            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <Link to="/admin/issues" className="flex items-center gap-2 text-[#617589] dark:text-[#94a3b8] hover:text-[#111418] dark:hover:text-white transition-colors group">
                    <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform text-[20px]">arrow_back</span>
                    <span className="font-medium">Kembali ke Daftar</span>
                </Link>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

                {/* Left Column (Detail) */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm p-6 relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-full h-1 ${statusInfo.color === 'green' ? 'bg-green-500' : statusInfo.color === 'red' ? 'bg-red-500' : statusInfo.color === 'orange' ? 'bg-orange-500' : 'bg-gray-400'}`}></div>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-2xl font-bold text-[#111418] dark:text-white">#{issue.id?.substring(0, 8)}</h1>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${statusInfo.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800' :
                                            statusInfo.color === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800' :
                                                statusInfo.color === 'orange' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800' :
                                                    'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-800'
                                        }`}>
                                        <span className="material-symbols-outlined text-[16px] filled">{statusInfo.icon}</span>
                                        {statusInfo.label}
                                    </span>
                                </div>
                                <p className="text-[#617589] dark:text-[#94a3b8] text-sm flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                                    Dilaporkan: {formatDate(issue.created_at)}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <h3 className="text-xs font-bold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider mb-2">Kategori</h3>
                                <div className="flex items-center gap-2 p-3 bg-[#f6f7f8] dark:bg-[#202e3b] rounded-lg">
                                    <span className="material-symbols-outlined text-[#617589]">category</span>
                                    <span className="font-medium text-[#111418] dark:text-white">{issue.category || '-'}</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider mb-2">Prioritas</h3>
                                <div className="flex items-center gap-2 p-3 bg-[#f6f7f8] dark:bg-[#202e3b] rounded-lg">
                                    <span className={`material-symbols-outlined ${priorityInfo.color}`}>flag</span>
                                    <span className="font-medium text-[#111418] dark:text-white">{priorityInfo.label}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider mb-2">Deskripsi Masalah</h3>
                            <p className="text-[#111418] dark:text-white leading-relaxed text-sm">
                                {issue.description || 'Tidak ada deskripsi'}
                            </p>
                        </div>
                    </div>

                    {/* Resolution Notes */}
                    {issue.resolution_notes && (
                        <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm p-6">
                            <h2 className="text-lg font-bold text-[#111418] dark:text-white mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">fact_check</span>
                                Catatan Penyelesaian
                            </h2>
                            <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/30 rounded-lg p-5">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300 flex shrink-0 items-center justify-center">
                                        <span className="material-symbols-outlined">person</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-bold text-[#111418] dark:text-white text-sm">
                                                {issue.assigned_to?.full_name || 'Admin'}
                                            </h4>
                                            <span className="text-xs text-[#617589] dark:text-[#94a3b8]">{formatShortDate(issue.resolved_at || issue.updated_at)}</span>
                                        </div>
                                        <p className="text-sm text-[#111418] dark:text-white">{issue.resolution_notes}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column (Sidebar Info) */}
                <div className="flex flex-col gap-6">
                    {/* Reporter Info */}
                    {issue.reporter && (
                        <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm p-6">
                            <h3 className="text-sm font-bold text-[#111418] dark:text-white uppercase tracking-wider mb-4">Pelapor</h3>
                            <div className="flex items-start gap-3 p-3 rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] bg-[#f9fafb] dark:bg-[#202e3b]">
                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 flex shrink-0 items-center justify-center font-bold text-sm">
                                    {getInitials(issue.reporter.full_name)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-[#111418] dark:text-white truncate">{issue.reporter.full_name || '-'}</p>
                                    {issue.reporter.phone && (
                                        <p className="text-xs text-[#617589] dark:text-[#94a3b8] mt-1">{issue.reporter.phone}</p>
                                    )}
                                    {issue.reporter.email && (
                                        <p className="text-xs text-[#617589] dark:text-[#94a3b8]">{issue.reporter.email}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Related Order */}
                    {issue.order_id && (
                        <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm p-6">
                            <h3 className="text-sm font-bold text-[#111418] dark:text-white uppercase tracking-wider mb-4">Pesanan Terkait</h3>
                            <Link to={`/admin/orders`} className="flex items-center gap-2 p-3 rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] bg-[#f9fafb] dark:bg-[#202e3b] hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                                <span className="material-symbols-outlined text-primary">receipt</span>
                                <span className="text-sm font-medium text-primary">#{issue.order_id?.substring(0, 8)}</span>
                            </Link>
                        </div>
                    )}

                    {/* Metadata */}
                    <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm p-6">
                        <h3 className="text-sm font-bold text-[#111418] dark:text-white uppercase tracking-wider mb-4">Info Lainnya</h3>
                        <div className="flex flex-col gap-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-[#617589] dark:text-[#94a3b8]">Dibuat</span>
                                <span className="font-medium text-[#111418] dark:text-white">{formatShortDate(issue.created_at)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#617589] dark:text-[#94a3b8]">Diperbarui</span>
                                <span className="font-medium text-[#111418] dark:text-white">{formatShortDate(issue.updated_at)}</span>
                            </div>
                            {issue.resolved_at && (
                                <div className="flex justify-between">
                                    <span className="text-[#617589] dark:text-[#94a3b8]">Diselesaikan</span>
                                    <span className="font-medium text-green-600 dark:text-green-400">{formatShortDate(issue.resolved_at)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
