import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../../services/supabaseClient'
import issueService from '../../../services/issueService'
import AdminLayout from '../../../components/admin/AdminLayout'
import logger from '../../../utils/logger'

export default function AdminIssuesPage() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('all') // all, open, closed
    const [filterCategory, setFilterCategory] = useState('Semua Kategori')
    const [issues, setIssues] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchIssues = async () => {
        try {
            const data = await issueService.getAllIssues()

            // Transform data to match component structure
            const transformedIssues = data.map(issue => ({
                id: issue.id,
                time: new Date(issue.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
                type: issue.category || 'Lainnya',
                typeIcon: getCategoryIcon(issue.category),
                typeColor: getCategoryColor(issue.category),
                description: issue.description,
                related: {
                    name: issue.reporter?.full_name || 'User',
                    role: issue.reporter_type || 'User',
                    initials: (issue.reporter?.full_name || 'U').substring(0, 2).toUpperCase(),
                    color: 'blue'
                },
                status: issue.status === 'open' ? 'Terbuka' : issue.status === 'resolved' ? 'Selesai' : 'Investigasi',
                statusColor: issue.status === 'open' ? 'red' : issue.status === 'resolved' ? 'green' : 'orange'
            }))

            setIssues(transformedIssues)
        } catch (error) {
            console.error('Error fetching issues:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchIssues()

        // Realtime subscription
        const channel = supabase.channel('admin-issues')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'issues' }, () => {
                logger.debug('Issues changed, refreshing...')
                fetchIssues()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'fraud': return 'warning'
            case 'food_quality': return 'restaurant_menu'
            case 'driver_behavior': return 'two_wheeler'
            case 'merchant_closed': return 'block'
            case 'payment': return 'payments'
            default: return 'help'
        }
    }

    const getCategoryColor = (category) => {
        switch (category) {
            case 'fraud': return 'red'
            case 'food_quality': return 'orange'
            case 'merchant_closed': return 'red'
            case 'driver_behavior': return 'purple'
            default: return 'gray'
        }
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Terbuka':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                        Terbuka
                    </span>
                )
            case 'Investigasi':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                        Investigasi
                    </span>
                )
            case 'Selesai':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        Selesai
                    </span>
                )
            default:
                return null
        }
    }

    const filteredIssues = issues.filter(issue => {
        if (activeTab === 'open' && issue.status === 'Selesai') return false
        if (activeTab === 'closed' && issue.status !== 'Selesai') return false
        return true
    })

    return (
        <AdminLayout title="Pusat Bantuan & Masalah Operasional">

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-[#1a2632] p-5 rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[#617589] dark:text-[#94a3b8] text-sm font-medium mb-1">Tiket Terbuka</p>
                        <p className="text-2xl font-bold text-[#111418] dark:text-white">{issues.filter(i => i.status === 'Terbuka').length} <span className="text-sm font-normal text-red-500 ml-1">Kasus</span></p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center">
                        <span className="material-symbols-outlined">warning</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1a2632] p-5 rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[#617589] dark:text-[#94a3b8] text-sm font-medium mb-1">Sedang Ditangani</p>
                        <p className="text-2xl font-bold text-[#111418] dark:text-white">{issues.filter(i => i.status === 'Investigasi').length}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined">engineering</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1a2632] p-5 rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[#617589] dark:text-[#94a3b8] text-sm font-medium mb-1">Diselesaikan</p>
                        <p className="text-2xl font-bold text-[#111418] dark:text-white">{issues.filter(i => i.status === 'Selesai').length}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center">
                        <span className="material-symbols-outlined">check_circle</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center p-1 bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg w-fit">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'all' ? 'bg-primary/10 text-primary' : 'text-[#617589] dark:text-[#94a3b8] hover:text-[#111418] dark:hover:text-white'}`}
                    >
                        Semua
                    </button>
                    <button
                        onClick={() => setActiveTab('open')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'open' ? 'bg-primary/10 text-primary' : 'text-[#617589] dark:text-[#94a3b8] hover:text-[#111418] dark:hover:text-white'}`}
                    >
                        Terbuka
                    </button>
                    <button
                        onClick={() => setActiveTab('closed')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'closed' ? 'bg-primary/10 text-primary' : 'text-[#617589] dark:text-[#94a3b8] hover:text-[#111418] dark:hover:text-white'}`}
                    >
                        Selesai
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="appearance-none pl-3 pr-8 py-2 bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg text-sm text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                            <option>Semua Kategori</option>
                            <option>Fraud</option>
                            <option>Layanan</option>
                            <option>Aplikasi</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-[#617589]">
                            <span className="material-symbols-outlined text-[18px]">expand_more</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <span className="material-symbols-outlined text-4xl animate-spin text-primary">sync</span>
                </div>
            ) : issues.length === 0 ? (
                <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm flex-1 flex flex-col items-center justify-center p-12 min-h-[400px]">
                    <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6 ring-8 ring-green-50/50 dark:ring-green-900/10">
                        <span className="material-symbols-outlined text-4xl text-green-600 dark:text-green-400">verified_user</span>
                    </div>
                    <h3 className="text-xl font-bold text-[#111418] dark:text-white mb-2 text-center">Belum Ada Laporan Masalah</h3>
                    <p className="text-[#617589] dark:text-[#94a3b8] text-sm text-center max-w-sm leading-relaxed">
                        Semua operasional berjalan lancar. Laporan dari pelanggan, warung, atau driver akan muncul di sini jika terjadi kendala.
                    </p>
                </div>
            ) : (
                <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm overflow-hidden flex-1">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#f9fafb] dark:bg-[#1e2c3a] border-b border-[#e5e7eb] dark:border-[#2a3b4d]">
                                    <th className="px-6 py-3.5 text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider whitespace-nowrap">Order ID</th>
                                    <th className="px-6 py-3.5 text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider whitespace-nowrap">Jenis Masalah</th>
                                    <th className="px-6 py-3.5 text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider whitespace-nowrap">Pihak Terkait</th>
                                    <th className="px-6 py-3.5 text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider whitespace-nowrap">Status</th>
                                    <th className="px-6 py-3.5 text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider text-right whitespace-nowrap">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#2a3b4d]">
                                {filteredIssues.map((issue) => (
                                    <tr key={issue.id} className="hover:bg-[#f9fafb] dark:hover:bg-[#202e3b] transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-[#111418] dark:text-white text-sm">#{issue.id}</span>
                                                <span className="text-xs text-[#617589] dark:text-[#94a3b8]">{issue.time}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`material-symbols-outlined text-${issue.typeColor}-500 text-[18px]`}>{issue.typeIcon}</span>
                                                <span className="text-sm text-[#111418] dark:text-white font-medium">{issue.type}</span>
                                            </div>
                                            <p className="text-xs text-[#617589] dark:text-[#94a3b8] mt-1 pl-6 line-clamp-1">{issue.description}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full bg-${issue.related.color}-100 text-${issue.related.color}-600 dark:bg-${issue.related.color}-900/30 dark:text-${issue.related.color}-300 flex items-center justify-center text-xs font-bold`}>
                                                    {issue.related.initials}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-[#111418] dark:text-white">{issue.related.name}</p>
                                                    <p className="text-xs text-[#617589] dark:text-[#94a3b8] capitalize">{issue.related.role}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(issue.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2">
                                                {issue.status === 'Selesai' ? (
                                                    <Link to={`/admin/issues/${issue.id}`} className="px-3 py-1.5 text-xs font-semibold text-primary border border-primary/20 hover:bg-primary/5 rounded-lg transition-colors">
                                                        Lihat Detail
                                                    </Link>
                                                ) : (
                                                    <>
                                                        <Link to={`/admin/issues/${issue.id}`} className="px-3 py-1.5 text-xs font-semibold text-primary border border-primary/20 hover:bg-primary/5 rounded-lg transition-colors">
                                                            Tindak Lanjut
                                                        </Link>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            {filteredIssues.length === 0 && (
                                <tbody>
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-[#617589]">Tidak ada tiket yang sesuai filter</td>
                                    </tr>
                                </tbody>
                            )}
                        </table>
                    </div>
                    <div className="px-6 py-4 border-t border-[#e5e7eb] dark:border-[#2a3b4d] flex items-center justify-between">
                        <p className="text-sm text-[#617589] dark:text-[#94a3b8]">Menampilkan <span className="font-semibold text-[#111418] dark:text-white">{filteredIssues.length > 0 ? '1' : '0'}-{filteredIssues.length}</span> dari <span className="font-semibold text-[#111418] dark:text-white">{issues.length}</span> masalah</p>
                        <div className="flex items-center gap-2">
                            <button className="p-2 rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] text-[#617589] dark:text-[#94a3b8] hover:bg-[#f0f2f4] dark:hover:bg-[#202e3b] disabled:opacity-50 transition-colors" disabled>
                                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                            </button>
                            <button className="p-2 rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] text-[#617589] dark:text-[#94a3b8] hover:bg-[#f0f2f4] dark:hover:bg-[#202e3b] transition-colors">
                                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    )
}
