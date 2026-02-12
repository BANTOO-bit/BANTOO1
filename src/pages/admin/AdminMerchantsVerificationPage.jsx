import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminHeader from '../../components/admin/AdminHeader'
import merchantService from '../../services/merchantService'

export default function AdminMerchantsVerificationPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [verificationQueue, setVerificationQueue] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchMerchants()
    }, [])

    const fetchMerchants = async () => {
        try {
            setLoading(true)
            const data = await merchantService.getMerchantsForVerification('pending')
            setVerificationQueue(data)
            setError(null)
        } catch (err) {
            console.error('Failed to fetch merchants:', err)
            setError('Gagal memuat data warung')
        } finally {
            setLoading(false)
        }
    }

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    const getColorClass = (index) => {
        const colors = ['blue', 'green', 'orange', 'purple', 'pink']
        return colors[index % colors.length]
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    const formatTime = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        }) + ' WIB'
    }

    return (
        <div className="flex min-h-screen w-full bg-[#f6f7f8] dark:bg-[#101922] font-display text-[#111418] dark:text-white overflow-x-hidden">
            <AdminSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <main className="flex-1 lg:ml-[240px] flex flex-col min-w-0 relative">
                <AdminHeader
                    onMenuClick={() => setIsSidebarOpen(true)}
                    title="Antrean Verifikasi Warung Baru"
                    showBack={true}
                    onBackClick={() => window.history.back()}
                />

                <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
                    <div className="max-w-[1200px] mx-auto flex flex-col gap-6">

                        {/* Filter Tabs */}
                        <div className="flex border-b border-[#e5e7eb] dark:border-[#2a3b4d] gap-8">
                            <button className="pb-4 text-sm font-medium text-[#617589] dark:text-[#94a3b8] hover:text-[#111418] dark:hover:text-white transition-colors relative">
                                Semua Pendaftar
                            </button>
                            <button className="pb-4 text-sm font-bold text-primary border-b-2 border-primary relative">
                                Menunggu Verifikasi ({verificationQueue.length})
                            </button>
                            <button className="pb-4 text-sm font-medium text-[#617589] dark:text-[#94a3b8] hover:text-[#111418] dark:hover:text-white transition-colors relative">
                                Perlu Revisi (0)
                            </button>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl p-8 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                <p className="mt-4 text-[#617589] dark:text-[#94a3b8]">Memuat data...</p>
                            </div>
                        )}

                        {/* Error State */}
                        {error && !loading && (
                            <div className="bg-white dark:bg-[#1a2632] border border-red-200 dark:border-red-900/30 rounded-xl p-6">
                                <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                                    <span className="material-symbols-outlined">error</span>
                                    <p>{error}</p>
                                </div>
                            </div>
                        )}

                        {/* List Table */}
                        {!loading && !error && (
                            <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-[#f9fafb] dark:bg-[#1e2c3a] border-b border-[#e5e7eb] dark:border-[#2a3b4d]">
                                                <th className="px-6 py-4 text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider">Nama Warung</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider">Pemilik</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider">Tanggal Daftar</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#2a3b4d]">
                                            {verificationQueue.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-12 text-center text-[#617589] dark:text-[#94a3b8]">
                                                        Tidak ada warung yang menunggu verifikasi
                                                    </td>
                                                </tr>
                                            ) : (
                                                verificationQueue.map((item, index) => {
                                                    const color = getColorClass(index)
                                                    const initials = getInitials(item.name)

                                                    return (
                                                        <tr key={item.id} className="hover:bg-[#f9fafb] dark:hover:bg-[#202e3b] transition-colors group">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-10 h-10 rounded-lg bg-${color}-100 dark:bg-${color}-900/30 text-${color}-600 dark:text-${color}-300 flex items-center justify-center font-bold text-lg shrink-0`}>
                                                                        {initials}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-medium text-[#111418] dark:text-white">{item.name}</p>
                                                                        <p className="text-xs text-[#617589] dark:text-[#94a3b8]">{item.address}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex flex-col">
                                                                    <p className="text-sm text-[#111418] dark:text-white">{item.owner?.full_name || 'N/A'}</p>
                                                                    <p className="text-xs text-[#617589] dark:text-[#94a3b8]">{item.owner?.phone || 'N/A'}</p>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="text-sm text-[#111418] dark:text-white">{formatDate(item.created_at)}</span>
                                                                <p className="text-xs text-[#617589] dark:text-[#94a3b8]">{formatTime(item.created_at)}</p>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <Link to={`/admin/merchants/verification/${item.id}`} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors">
                                                                    Tinjau
                                                                </Link>
                                                            </td>
                                                        </tr>
                                                    )
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <div className="flex items-center justify-between px-6 py-4 border-t border-[#e5e7eb] dark:border-[#2a3b4d] bg-[#f9fafb] dark:bg-[#1e2c3a]">
                                    <p className="text-xs text-[#617589] dark:text-[#94a3b8]">Menampilkan 1-{verificationQueue.length} dari {verificationQueue.length} antrean</p>
                                    <div className="flex gap-2">
                                        <button className="p-1 rounded hover:bg-[#e5e7eb] dark:hover:bg-[#2a3b4d] text-[#617589] dark:text-[#94a3b8] disabled:opacity-50" disabled>
                                            <span className="material-symbols-outlined text-lg">chevron_left</span>
                                        </button>
                                        <button className="p-1 rounded hover:bg-[#e5e7eb] dark:hover:bg-[#2a3b4d] text-[#617589] dark:text-[#94a3b8] disabled:opacity-50" disabled>
                                            <span className="material-symbols-outlined text-lg">chevron_right</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </main>
        </div>
    )
}
