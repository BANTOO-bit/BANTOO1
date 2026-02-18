import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../../services/supabaseClient'
import AdminLayout from '../../../components/admin/AdminLayout'
import AdminActionMenu from '../../../components/admin/AdminActionMenu'
import AdminPagination from '../../../components/admin/AdminPagination'
import { exportToCSV } from '../../../utils/exportCSV'

const ITEMS_PER_PAGE = 15

export default function AdminUsersPage() {
    const navigate = useNavigate()
    const [filterStatus, setFilterStatus] = useState('all')
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ total: 0, active: 0, newThisWeek: 0, banned: 0 })
    const [activeRowId, setActiveRowId] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .in('role', ['customer'])
                .order('created_at', { ascending: false })
                .limit(50)

            if (!error) setUsers(data || [])
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    const fetchStats = async () => {
        try {
            const { count: total } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer')
            const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)
            const { count: newThisWeek } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer').gte('created_at', weekAgo.toISOString())
            setStats({ total: total || 0, active: total || 0, newThisWeek: newThisWeek || 0, banned: 0 })
        } catch (err) { console.error(err) }
    }

    useEffect(() => { fetchUsers(); fetchStats() }, [])

    const formatCurrency = (val) => `Rp ${(val || 0).toLocaleString('id-ID')}`

    const filteredUsers = filterStatus === 'all' ? users : users.filter(u => {
        if (filterStatus === 'Aktif') return true // all customers are active for now
        return false
    })

    const getStatusBadge = (status) => {
        return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800'
    }

    const getInitials = (n) => n ? n.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2) : '??'

    const avatarColors = ['bg-blue-100 dark:bg-blue-900/40 text-blue-600', 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600', 'bg-pink-100 dark:bg-pink-900/40 text-pink-600', 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600']

    if (loading) return <AdminLayout title="Manajemen Pelanggan"><div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div></AdminLayout>

    return (
        <AdminLayout title="Manajemen Pelanggan">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl p-5 flex flex-col gap-1">
                    <div className="flex items-center gap-2 mb-2"><span className="material-symbols-outlined text-[#617589] dark:text-[#94a3b8]">groups</span><p className="text-[#617589] dark:text-[#94a3b8] text-sm font-medium">Total Pelanggan</p></div>
                    <h3 className="text-3xl font-bold text-[#111418] dark:text-white">{stats.total.toLocaleString()}</h3>
                </div>
                <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl p-5 flex flex-col gap-1">
                    <div className="flex items-center gap-2 mb-2"><span className="material-symbols-outlined text-green-500">fiber_manual_record</span><p className="text-[#617589] dark:text-[#94a3b8] text-sm font-medium">Pelanggan Aktif</p></div>
                    <h3 className="text-3xl font-bold text-[#111418] dark:text-white">{stats.active.toLocaleString()}</h3>
                </div>
                <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl p-5 flex flex-col gap-1">
                    <div className="flex items-center gap-2 mb-2"><span className="material-symbols-outlined text-blue-500">person_add</span><p className="text-[#617589] dark:text-[#94a3b8] text-sm font-medium">Baru Minggu Ini</p></div>
                    <h3 className="text-3xl font-bold text-[#111418] dark:text-white">{stats.newThisWeek}</h3>
                </div>
                <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl p-5 flex flex-col gap-1">
                    <div className="flex items-center gap-2 mb-2"><span className="material-symbols-outlined text-red-500">block</span><p className="text-[#617589] dark:text-[#94a3b8] text-sm font-medium">Di-banned</p></div>
                    <h3 className="text-3xl font-bold text-[#111418] dark:text-white">{stats.banned}</h3>
                </div>
            </div>

            {/* Filter */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-1">
                <h3 className="text-lg font-bold text-[#111418] dark:text-white">Daftar Pelanggan</h3>
                <div className="flex gap-2 flex-wrap">
                    <div className="flex p-1 bg-gray-100 dark:bg-[#2a3b4d] rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d]">
                        {['all', 'Aktif'].map(status => (
                            <button key={status} onClick={() => setFilterStatus(status)} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${filterStatus === status ? 'bg-white dark:bg-[#1a2632] text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-[#617589] dark:text-[#94a3b8] hover:text-[#111418] dark:hover:text-white'}`}>
                                {status === 'all' ? 'Semua' : status}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => exportToCSV(filteredUsers, [
                            { key: 'full_name', label: 'Nama' },
                            { key: 'phone', label: 'Telepon' },
                            { key: 'email', label: 'Email' },
                            { key: 'role', label: 'Role' },
                            { key: 'created_at', label: 'Bergabung' },
                        ], 'pelanggan')}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">download</span>
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl overflow-hidden flex-1 mb-20">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[#e5e7eb] dark:border-[#2a3b4d] text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase bg-[#f9fafb] dark:bg-[#1e2c3a]">
                                <th className="px-6 py-4">Pelanggan</th><th className="px-6 py-4">Kontak</th><th className="px-6 py-4">Bergabung</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#2a3b4d]">
                            {filteredUsers
                                .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                                .map((user, idx) => (
                                    <tr key={user.id} className={`transition-colors ${activeRowId === user.id ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-[#f9fafb] dark:hover:bg-[#202e3b]'}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full ${avatarColors[idx % avatarColors.length]} flex items-center justify-center font-bold text-sm`}>{getInitials(user.full_name)}</div>
                                                <div><p className="text-sm font-semibold text-[#111418] dark:text-white">{user.full_name || '-'}</p><p className="text-xs text-[#617589] dark:text-[#94a3b8]">{user.id?.substring(0, 8)}</p></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><p className="text-sm text-[#111418] dark:text-white">{user.email || '-'}</p><p className="text-xs text-[#617589] dark:text-[#94a3b8]">{user.phone || '-'}</p></td>
                                        <td className="px-6 py-4"><p className="text-sm text-[#617589] dark:text-[#94a3b8]">{user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</p></td>
                                        <td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge()}`}><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>Aktif</span></td>
                                        <td className="px-6 py-4 text-right">
                                            <AdminActionMenu
                                                items={[
                                                    { icon: 'person', label: 'Lihat Detail', onClick: () => navigate(`/admin/users/${user.id}`) },
                                                    { icon: 'history', label: 'Riwayat Pesanan', onClick: () => navigate(`/admin/orders?customer=${user.id}`) },
                                                ]}
                                                onOpenChange={(open) => setActiveRowId(open ? user.id : null)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
                <AdminPagination
                    currentPage={currentPage}
                    totalItems={filteredUsers.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                    label="pelanggan"
                />
            </div>
        </AdminLayout>
    )
}
