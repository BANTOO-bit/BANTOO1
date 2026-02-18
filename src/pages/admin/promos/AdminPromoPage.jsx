import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../../services/supabaseClient'
import AdminLayout from '../../../components/admin/AdminLayout'
import AdminActionMenu from '../../../components/admin/AdminActionMenu'

export default function AdminPromoPage() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('all')
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedPromo, setSelectedPromo] = useState(null)
    const [promos, setPromos] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeRowId, setActiveRowId] = useState(null)

    const fetchPromos = async () => {
        try {
            const { data, error } = await supabase
                .from('promos')
                .select('*')
                .order('created_at', { ascending: false })

            if (!error) {
                const now = new Date()
                const mapped = (data || []).map(p => {
                    const start = p.valid_from ? new Date(p.valid_from) : null
                    const end = p.valid_until ? new Date(p.valid_until) : null
                    let status = 'active'
                    if (end && end < now) status = 'ended'
                    else if (start && start > now) status = 'upcoming'
                    else if (!p.is_active) status = 'ended'

                    return {
                        ...p,
                        status,
                        value: p.discount_type === 'percentage' ? `${p.discount_value}%` : `Rp ${(p.discount_value || 0).toLocaleString('id-ID')}`,
                        type: p.discount_type === 'percentage' ? 'discount' : 'amount',
                        period: start && end ? `${start.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })} - ${end.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}` : 'Tanpa batas',
                        used: p.used_count || 0,
                        limit: p.max_usage || 'Unlimited'
                    }
                })
                setPromos(mapped)
            }
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    useEffect(() => { fetchPromos() }, [])

    const handleDeleteClick = (promo) => { setSelectedPromo(promo); setShowDeleteModal(true) }

    const confirmDelete = async () => {
        if (!selectedPromo) return
        const { error } = await supabase.from('promos').delete().eq('id', selectedPromo.id)
        if (!error) setPromos(promos.filter(p => p.id !== selectedPromo.id))
        setShowDeleteModal(false); setSelectedPromo(null)
    }

    const filteredPromos = promos.filter(p => {
        if (activeTab === 'all') return true
        if (activeTab === 'active') return p.status === 'active'
        if (activeTab === 'upcoming') return p.status === 'upcoming'
        if (activeTab === 'history') return p.status === 'ended'
        return true
    })

    const getStatusBadge = (status) => {
        if (status === 'active') return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"><span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-1.5 animate-pulse"></span>Aktif</span>
        if (status === 'upcoming') return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"><span className="material-symbols-outlined text-[14px] mr-1">schedule</span>Akan Datang</span>
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">Berakhir</span>
    }

    const getIcon = (type) => type === 'shipping' ? 'local_shipping' : type === 'amount' ? 'account_balance_wallet' : 'percent'
    const getProgressColor = (p) => p.status === 'ended' ? 'bg-gray-400' : p.status === 'upcoming' ? 'bg-gray-300' : 'bg-green-500'
    const calculateProgress = (used, limit) => limit === 'Unlimited' ? 30 : Math.min((used / limit) * 100, 100)

    if (loading) return <AdminLayout title="Manajemen Promo"><div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div></AdminLayout>

    return (
        <AdminLayout title="Manajemen Promo">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#111418] dark:text-white">Daftar Promo & Diskon</h1>
                    <p className="text-[#617589] dark:text-[#94a3b8] text-sm mt-1">Kelola semua penawaran aktif dan yang akan datang untuk pelanggan.</p>
                </div>
                <Link to="/admin/promos/new" className="bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors w-fit">
                    <span className="material-symbols-outlined text-[20px]">add</span>Buat Promo Baru
                </Link>
            </div>

            <div className="flex items-center gap-2 border-b border-[#e5e7eb] dark:border-[#2a3b4d] overflow-x-auto">
                {[{ id: 'all', label: 'Semua Promo' }, { id: 'active', label: 'Sedang Aktif', count: promos.filter(p => p.status === 'active').length }, { id: 'upcoming', label: 'Akan Datang' }, { id: 'history', label: 'Riwayat' }].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${activeTab === tab.id ? 'text-primary border-primary' : 'text-[#617589] dark:text-[#94a3b8] hover:text-[#111418] dark:hover:text-white border-transparent'}`}>
                        {tab.label}
                        {tab.count !== undefined && <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>{tab.count}</span>}
                    </button>
                ))}
            </div>

            {promos.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm p-12 text-center">
                    <div className="w-32 h-32 mb-6 bg-primary/5 rounded-full flex items-center justify-center relative">
                        <span className="material-symbols-outlined text-[64px] text-primary/40 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-12">redeem</span>
                    </div>
                    <h2 className="text-xl font-bold text-[#111418] dark:text-white mb-3">Belum Ada Promo yang Dibuat</h2>
                    <p className="text-[#617589] dark:text-[#94a3b8] text-sm max-w-md mx-auto mb-8 leading-relaxed">Tarik lebih banyak pelanggan dengan membuat promo menarik.</p>
                    <Link to="/admin/promos/new" className="bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2 transition-all">
                        <span className="material-symbols-outlined text-[20px]">add_circle</span>Buat Promo Pertama
                    </Link>
                </div>
            ) : filteredPromos.length === 0 ? (
                <div className="p-12 text-center text-[#617589] dark:text-[#94a3b8]">Tidak ada promo di tab ini</div>
            ) : (
                <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-[#f6f7f8] dark:bg-[#23303d] border-b border-[#e5e7eb] dark:border-[#2a3b4d]">
                                    <th className="py-4 px-6 text-xs font-bold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider">Nama Promo</th>
                                    <th className="py-4 px-6 text-xs font-bold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider">Jenis</th>
                                    <th className="py-4 px-6 text-xs font-bold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider">Periode</th>
                                    <th className="py-4 px-6 text-xs font-bold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider">Penggunaan</th>
                                    <th className="py-4 px-6 text-xs font-bold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider">Status</th>
                                    <th className="py-4 px-6 text-xs font-bold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#2a3b4d]">
                                {filteredPromos.map((promo) => (
                                    <tr key={promo.id} className={`transition-colors ${promo.status === 'ended' ? 'opacity-60' : ''} ${activeRowId === promo.id ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-[#f9fafb] dark:hover:bg-[#1f2b37]'}`}>
                                        <td className="py-4 px-6">
                                            <span className="font-semibold text-[#111418] dark:text-white text-sm">{promo.name || promo.code}</span>
                                            <br /><span className="text-xs text-[#617589] dark:text-[#94a3b8] font-mono">KODE: {promo.code}</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-1.5 rounded-md"><span className="material-symbols-outlined text-[18px]">{getIcon(promo.type)}</span></div>
                                                <span className="text-sm text-[#111418] dark:text-white">{promo.value}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6"><span className="text-sm text-[#111418] dark:text-white">{promo.period}</span></td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"><div className={`${getProgressColor(promo)} h-full`} style={{ width: `${calculateProgress(promo.used, promo.limit)}%` }}></div></div>
                                                <span className="text-xs text-[#617589] dark:text-[#94a3b8]">{promo.used}/{promo.limit}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">{getStatusBadge(promo.status)}</td>
                                        <td className="py-4 px-6 text-right">
                                            <AdminActionMenu
                                                items={[
                                                    { icon: 'edit', label: 'Edit Promo', onClick: () => navigate(`/admin/promos/edit/${promo.id}`) },
                                                    { icon: 'content_copy', label: 'Salin Kode', onClick: () => navigator.clipboard.writeText(promo.code) },
                                                    { separator: true },
                                                    { icon: 'delete', label: 'Hapus', onClick: () => handleDeleteClick(promo), danger: true },
                                                ]}
                                                onOpenChange={(open) => setActiveRowId(open ? promo.id : null)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#111418]/60 backdrop-blur-sm">
                    <div className="w-full max-w-[400px] bg-white dark:bg-[#1a2632] rounded-xl p-8 text-center">
                        <h3 className="text-xl font-bold text-[#111418] dark:text-white mb-4">Hapus Promo?</h3>
                        <p className="text-[#617589] dark:text-[#94a3b8] mb-8">Promo <strong>{selectedPromo?.name || selectedPromo?.code}</strong> akan dihapus permanen.</p>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setShowDeleteModal(false)} className="px-4 py-3 bg-[#f0f2f4] dark:bg-[#2a3b4d] rounded-lg font-bold text-[#617589] dark:text-[#94a3b8]">Batal</button>
                            <button onClick={confirmDelete} className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold">Ya, Hapus</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    )
}
