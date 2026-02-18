import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../../services/supabaseClient'
import AdminLayout from '../../../components/admin/AdminLayout'
import AdminEmptyState from '../../../components/admin/AdminEmptyState'
import AdminActionMenu from '../../../components/admin/AdminActionMenu'
import AdminPagination from '../../../components/admin/AdminPagination'
import { useToast } from '../../../components/admin/AdminToast'
import { exportToCSV } from '../../../utils/exportCSV'

const ITEMS_PER_PAGE = 15

export default function AdminMerchantsPage() {
    const navigate = useNavigate()
    const { addToast } = useToast()
    const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false)
    const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false)
    const [selectedMerchant, setSelectedMerchant] = useState(null)
    const [confirmText, setConfirmText] = useState('')
    const [merchants, setMerchants] = useState([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ total: 0, open: 0, closed: 0, pending: 0, suspended: 0 })
    const [activeRowId, setActiveRowId] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)

    const fetchMerchants = async () => {
        try {
            const { data, error } = await supabase
                .from('merchants')
                .select('*, profiles!merchants_owner_id_fkey(full_name, phone, email)')
                .in('status', ['approved', 'suspended'])
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching merchants:', error)
                return
            }

            setMerchants(data || [])
        } catch (err) {
            console.error('Unexpected error:', err)
        } finally {
            setLoading(false)
        }
    }

    const fetchStats = async () => {
        try {
            const { count: total } = await supabase.from('merchants').select('id', { count: 'exact', head: true }).eq('status', 'approved')
            const { count: open } = await supabase.from('merchants').select('id', { count: 'exact', head: true }).eq('status', 'approved').eq('is_open', true)
            const { count: pending } = await supabase.from('merchants').select('id', { count: 'exact', head: true }).eq('status', 'pending')
            const { count: suspended } = await supabase.from('merchants').select('id', { count: 'exact', head: true }).eq('status', 'suspended')

            setStats({
                total: total || 0,
                open: open || 0,
                closed: (total || 0) - (open || 0),
                pending: pending || 0,
                suspended: suspended || 0
            })
        } catch (err) {
            console.error('Stats error:', err)
        }
    }

    useEffect(() => {
        fetchMerchants()
        fetchStats()
    }, [])

    const handleTerminateClick = (merchant) => {
        setSelectedMerchant(merchant)
        setConfirmText('')
        setIsTerminateModalOpen(true)
    }

    const handleTerminate = async () => {
        if (!selectedMerchant) return
        const { error } = await supabase.from('merchants').update({ status: 'terminated' }).eq('id', selectedMerchant.id)
        if (!error) {
            setMerchants(merchants.filter(m => m.id !== selectedMerchant.id))
            fetchStats()
            addToast(`Kemitraan ${selectedMerchant.name} telah diputus`, 'success')
        } else {
            addToast('Gagal memutus kemitraan', 'error')
        }
        setIsTerminateModalOpen(false)
        setSelectedMerchant(null)
    }

    const handleSuspendClick = (merchant) => {
        setSelectedMerchant(merchant)
        setIsSuspendModalOpen(true)
    }

    const handleSuspend = async () => {
        if (!selectedMerchant) return
        const { error } = await supabase.from('merchants').update({ status: 'suspended' }).eq('id', selectedMerchant.id)
        if (!error) {
            setMerchants(merchants.map(m => m.id === selectedMerchant.id ? { ...m, status: 'suspended' } : m))
            fetchStats()
            addToast(`${selectedMerchant.name} telah disuspend`, 'warning')
        } else {
            addToast('Gagal melakukan suspend', 'error')
        }
        setIsSuspendModalOpen(false)
        setSelectedMerchant(null)
    }

    const handleUnsuspend = async (merchant) => {
        const { error } = await supabase.from('merchants').update({ status: 'approved' }).eq('id', merchant.id)
        if (!error) {
            setMerchants(merchants.map(m => m.id === merchant.id ? { ...m, status: 'approved' } : m))
            fetchStats()
            addToast(`${merchant.name} telah diaktifkan kembali`, 'success')
        } else {
            addToast('Gagal mengaktifkan kembali', 'error')
        }
    }

    const expectedConfirmText = selectedMerchant ? `PUTUS KEMITRAAN ${selectedMerchant.name}` : ''
    const isConfirmValid = confirmText === expectedConfirmText

    if (loading) {
        return (
            <AdminLayout title="Manajemen Warung">
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout title="Manajemen Warung">

            {/* Export Button */}
            <div className="flex justify-end">
                <button
                    onClick={() => exportToCSV(merchants, [
                        { key: 'name', label: 'Nama Warung' },
                        { key: 'profiles.full_name', label: 'Pemilik' },
                        { key: 'profiles.phone', label: 'Telepon' },
                        { key: 'profiles.email', label: 'Email' },
                        { key: 'status', label: 'Status' },
                        { key: 'created_at', label: 'Bergabung' },
                    ], 'warung')}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    Export CSV
                </button>
            </div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl p-6 flex flex-col items-center justify-center text-center">
                    <span className="material-symbols-outlined text-4xl text-blue-500 mb-3">store</span>
                    <p className="text-sm text-[#617589] dark:text-[#94a3b8] font-medium mb-1">Total Warung Aktif</p>
                    <h3 className="text-3xl font-bold text-[#111418] dark:text-white">{stats.total}</h3>
                </div>
                <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl p-6 flex flex-col items-center justify-center text-center">
                    <span className="material-symbols-outlined text-4xl text-green-500 mb-3">door_open</span>
                    <p className="text-sm text-[#617589] dark:text-[#94a3b8] font-medium mb-1">Warung Buka</p>
                    <h3 className="text-3xl font-bold text-[#111418] dark:text-white">{stats.open}</h3>
                </div>
                <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl p-6 flex flex-col items-center justify-center text-center">
                    <span className="material-symbols-outlined text-4xl text-red-500 mb-3">door_front</span>
                    <p className="text-sm text-[#617589] dark:text-[#94a3b8] font-medium mb-1">Warung Tutup</p>
                    <h3 className="text-3xl font-bold text-[#111418] dark:text-white">{stats.closed}</h3>
                </div>
            </div>

            {/* Verification Queue Alert */}
            {stats.pending > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-3xl text-blue-600 dark:text-blue-200">pending_actions</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-[#111418] dark:text-white mb-2">Antrean Verifikasi Warung</h3>
                            <p className="text-[#617589] dark:text-[#94a3b8]">Terdapat <span className="font-bold text-blue-600 dark:text-blue-400">{stats.pending} Warung Baru</span> yang menunggu peninjauan dokumen dan persetujuan.</p>
                        </div>
                    </div>
                    <a href="/admin/merchants/verification" className="whitespace-nowrap flex items-center gap-2 px-6 py-3 bg-primary hover:bg-blue-700 text-white font-bold rounded-lg transition-colors">
                        Tinjau Antrean
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </a>
                </div>
            )}

            {/* Merchant List Table */}
            {merchants.length > 0 ? (
                <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl overflow-hidden">
                    <div className="px-6 py-5 border-b border-[#e5e7eb] dark:border-[#2a3b4d] flex items-center justify-between">
                        <h3 className="text-lg font-bold text-[#111418] dark:text-white">Daftar Warung Aktif</h3>
                        <div className="flex gap-2">
                            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#617589] dark:text-[#94a3b8] bg-[#f0f2f4] dark:bg-[#2a3b4d] hover:bg-[#e5e7eb] dark:hover:bg-[#344658] rounded-lg transition-colors">
                                <span className="material-symbols-outlined text-base">filter_list</span>
                                Filter
                            </button>
                            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#617589] dark:text-[#94a3b8] bg-[#f0f2f4] dark:bg-[#2a3b4d] hover:bg-[#e5e7eb] dark:hover:bg-[#344658] rounded-lg transition-colors">
                                <span className="material-symbols-outlined text-base">download</span>
                                Ekspor
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#f9fafb] dark:bg-[#1e2c3a] border-b border-[#e5e7eb] dark:border-[#2a3b4d]">
                                    <th className="px-6 py-4 text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider">Nama Warung</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider">Pemilik</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider">Kategori</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#2a3b4d]">
                                {merchants
                                    .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                                    .map((merchant) => (
                                        <tr key={merchant.id} className={`transition-colors relative ${activeRowId === merchant.id ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-[#f9fafb] dark:hover:bg-[#202e3b]'}`}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 bg-center bg-cover flex items-center justify-center text-xs font-bold text-gray-500"
                                                        style={merchant.logo_url ? { backgroundImage: `url(${merchant.logo_url})` } : {}}>
                                                        {!merchant.logo_url && (merchant.name?.substring(0, 2).toUpperCase() || 'WR')}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-[#111418] dark:text-white">{merchant.name}</p>
                                                        <p className="text-xs text-[#617589] dark:text-[#94a3b8]">ID: {merchant.id?.substring(0, 8)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="text-sm text-[#111418] dark:text-white font-medium">{merchant.profiles?.full_name || '-'}</p>
                                                <p className="text-xs text-[#617589] dark:text-[#94a3b8]">{merchant.profiles?.phone || merchant.phone || '-'}</p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                    {merchant.category || 'Makanan & Minuman'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {merchant.status === 'suspended' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                                                        Suspended
                                                    </span>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-2.5 h-2.5 rounded-full ${merchant.is_open ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                        <span className="text-sm text-[#111418] dark:text-white">{merchant.is_open ? 'Buka' : 'Tutup'}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <AdminActionMenu
                                                    items={[
                                                        { icon: 'store', label: 'Lihat Profil', onClick: () => navigate(`/admin/merchants/${merchant.id}`) },
                                                        { icon: 'edit', label: 'Edit Data', onClick: () => navigate(`/admin/merchants/edit/${merchant.id}`) },
                                                        { separator: true },
                                                        ...(merchant.status === 'suspended'
                                                            ? [{ icon: 'check_circle', label: 'Aktifkan Kembali', onClick: () => handleUnsuspend(merchant) }]
                                                            : [{ icon: 'pause_circle', label: 'Suspend Warung', onClick: () => handleSuspendClick(merchant), danger: false }]
                                                        ),
                                                        { icon: 'shopping_cart_off', label: 'Putus Kemitraan', onClick: () => handleTerminateClick(merchant), danger: true },
                                                    ]}
                                                    onOpenChange={(open) => setActiveRowId(open ? merchant.id : null)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                    <AdminPagination
                        currentPage={currentPage}
                        totalItems={merchants.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setCurrentPage}
                        label="warung"
                    />
                </div>
            ) : (
                <AdminEmptyState
                    title="Belum Ada Warung"
                    description="Daftar warung yang daftar dan disetujui akan muncul di halaman ini."
                    icon="store"
                />
            )}


            {/* Terminate Partnership Modal */}
            {isTerminateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#111418]/60 backdrop-blur-sm">
                    <div className="w-full max-w-[500px] bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d]">
                        <div className="p-8">
                            <h3 className="text-2xl font-bold text-[#111418] dark:text-white mb-4 text-center">Putus Kemitraan Warung?</h3>
                            <p className="text-[#617589] dark:text-[#94a3b8] text-center mb-8 leading-relaxed">
                                Tindakan ini bersifat permanen. <strong className="text-[#111418] dark:text-white">{selectedMerchant?.name}</strong> tidak akan bisa menerima pesanan lagi di platform.
                            </p>
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-[#111418] dark:text-white mb-2">Alasan</label>
                                <div className="relative">
                                    <select className="w-full appearance-none bg-[#f6f7f8] dark:bg-[#202e3b] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg pl-4 pr-10 py-3 text-[#111418] dark:text-white focus:outline-none focus:border-red-500 transition-colors cursor-pointer">
                                        <option disabled selected value="">Pilih alasan...</option>
                                        <option value="prosedur">Pelanggaran Prosedur</option>
                                        <option value="fraud">Fraud</option>
                                        <option value="permintaan">Permintaan Mitra</option>
                                        <option value="lainnya">Lainnya</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#617589] dark:text-[#94a3b8]">
                                        <span className="material-symbols-outlined font-light text-2xl">keyboard_arrow_down</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mb-8">
                                <label className="block text-sm font-bold text-[#111418] dark:text-white mb-2">Konfirmasi Tindakan</label>
                                <p className="text-xs text-[#617589] dark:text-[#94a3b8] mb-3">
                                    Ketik teks berikut untuk mengonfirmasi: <span className="font-mono font-bold text-red-600 dark:text-red-400">{expectedConfirmText}</span>
                                </p>
                                <input
                                    type="text"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    placeholder={expectedConfirmText}
                                    className="w-full bg-[#f6f7f8] dark:bg-[#202e3b] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg px-4 py-3 text-[#111418] dark:text-white focus:outline-none focus:border-red-500 transition-colors font-mono"
                                />
                                {confirmText && !isConfirmValid && (
                                    <p className="text-xs text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">error</span>
                                        Teks konfirmasi tidak sesuai
                                    </p>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setIsTerminateModalOpen(false)}
                                    className="w-full px-4 py-3 bg-[#f0f2f4] hover:bg-[#e5e7eb] dark:bg-[#2a3b4d] dark:hover:bg-[#344658] text-[#617589] dark:text-[#94a3b8] font-bold rounded-lg transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleTerminate}
                                    disabled={!isConfirmValid}
                                    className="w-full px-4 py-3 bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#ef4444]"
                                >
                                    Ya, Putus Kemitraan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Suspend Modal */}
            {isSuspendModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#111418]/60 backdrop-blur-sm">
                    <div className="w-full max-w-[440px] bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d]">
                        <div className="p-8">
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-yellow-600 text-3xl">pause_circle</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-[#111418] dark:text-white mb-3 text-center">Suspend Warung?</h3>
                            <p className="text-[#617589] dark:text-[#94a3b8] text-center mb-8 text-sm leading-relaxed">
                                <strong className="text-[#111418] dark:text-white">{selectedMerchant?.name}</strong> akan disuspend sementara dan tidak bisa menerima pesanan. Anda bisa mengaktifkannya kembali kapan saja.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setIsSuspendModalOpen(false)}
                                    className="w-full px-4 py-3 bg-[#f0f2f4] hover:bg-[#e5e7eb] dark:bg-[#2a3b4d] dark:hover:bg-[#344658] text-[#617589] dark:text-[#94a3b8] font-bold rounded-lg transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleSuspend}
                                    className="w-full px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg transition-colors"
                                >
                                    Ya, Suspend
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    )
}
