import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../../services/supabaseClient'
import AdminLayout from '../../../components/admin/AdminLayout'
import AdminEmptyState from '../../../components/admin/AdminEmptyState'

export default function AdminDriversPage() {
    const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false)
    const [selectedDriver, setSelectedDriver] = useState(null)
    const [confirmText, setConfirmText] = useState('')
    const [drivers, setDrivers] = useState([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ total: 0, online: 0, offline: 0, pending: 0 })

    const fetchDrivers = async () => {
        try {
            const { data, error } = await supabase
                .from('drivers')
                .select('*, profiles!drivers_user_id_fkey(full_name, phone, email)')
                .eq('status', 'approved')
                .order('created_at', { ascending: false })
            if (!error) setDrivers(data || [])
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    const fetchStats = async () => {
        try {
            const { count: total } = await supabase.from('drivers').select('id', { count: 'exact', head: true }).eq('status', 'approved')
            const { count: online } = await supabase.from('drivers').select('id', { count: 'exact', head: true }).eq('status', 'approved').eq('is_active', true)
            const { count: pending } = await supabase.from('drivers').select('id', { count: 'exact', head: true }).eq('status', 'pending')
            setStats({ total: total || 0, online: online || 0, offline: (total || 0) - (online || 0), pending: pending || 0 })
        } catch (err) { console.error(err) }
    }

    useEffect(() => { fetchDrivers(); fetchStats() }, [])

    const handleTerminateClick = (d) => { setSelectedDriver(d); setConfirmText(''); setIsTerminateModalOpen(true) }

    const handleTerminate = async () => {
        if (!selectedDriver) return
        const { error } = await supabase.from('drivers').update({ status: 'terminated' }).eq('id', selectedDriver.id)
        if (!error) { setDrivers(drivers.filter(d => d.id !== selectedDriver.id)); fetchStats() }
        setIsTerminateModalOpen(false); setSelectedDriver(null)
    }

    const getInitials = (n) => n ? n.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2) : '??'
    const driverDisplayName = (d) => d.profiles?.full_name || 'Driver'
    const expectedConfirmText = selectedDriver ? `PUTUS KEMITRAAN ${driverDisplayName(selectedDriver)}` : ''
    const isConfirmValid = confirmText === expectedConfirmText

    if (loading) return <AdminLayout title="Manajemen Driver"><div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div></AdminLayout>

    return (
        <AdminLayout title="Manajemen Driver">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl p-5 flex flex-col gap-1">
                    <div className="flex items-center gap-2 mb-2"><span className="material-symbols-outlined text-[#617589] dark:text-[#94a3b8]">groups</span><p className="text-[#617589] dark:text-[#94a3b8] text-sm font-medium">Total Armada</p></div>
                    <h3 className="text-3xl font-bold text-[#111418] dark:text-white">{stats.total.toLocaleString()}</h3>
                </div>
                <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl p-5 flex flex-col gap-1">
                    <div className="flex items-center gap-2 mb-2"><span className="material-symbols-outlined text-green-500">fiber_manual_record</span><p className="text-[#617589] dark:text-[#94a3b8] text-sm font-medium">Driver Online</p></div>
                    <h3 className="text-3xl font-bold text-[#111418] dark:text-white">{stats.online.toLocaleString()}</h3>
                </div>
                <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl p-5 flex flex-col gap-1">
                    <div className="flex items-center gap-2 mb-2"><span className="material-symbols-outlined text-gray-400">fiber_manual_record</span><p className="text-[#617589] dark:text-[#94a3b8] text-sm font-medium">Driver Offline</p></div>
                    <h3 className="text-3xl font-bold text-[#111418] dark:text-white">{stats.offline.toLocaleString()}</h3>
                </div>
            </div>

            {stats.pending > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-white dark:bg-[#1a2632] text-primary flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800 shadow-sm"><span className="material-symbols-outlined text-[24px]">verified_user</span></div>
                        <div>
                            <h3 className="text-lg font-bold text-[#111418] dark:text-white">Antrean Verifikasi Baru</h3>
                            <p className="text-[#617589] dark:text-[#94a3b8] mt-1 text-sm">Terdapat <span className="font-bold text-[#111418] dark:text-white">{stats.pending} Driver Baru</span> yang menunggu peninjauan dokumen.</p>
                        </div>
                    </div>
                    <Link to="/admin/drivers/verification" className="px-5 py-2.5 bg-primary hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm whitespace-nowrap flex items-center gap-2 shadow-sm">Tinjau Antrean <span className="material-symbols-outlined text-[18px]">arrow_forward</span></Link>
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-1">
                <h3 className="text-lg font-bold text-[#111418] dark:text-white">Daftar Driver Aktif</h3>
            </div>

            {drivers.length > 0 ? (
                <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl overflow-hidden flex-1 mb-20">
                    <div className="overflow-x-visible">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[#e5e7eb] dark:border-[#2a3b4d] text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase bg-[#f9fafb] dark:bg-[#1e2c3a]">
                                    <th className="px-6 py-4">Nama Driver</th><th className="px-6 py-4">Kendaraan</th><th className="px-6 py-4">Bergabung</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#2a3b4d]">
                                {drivers.map((driver) => {
                                    const name = driverDisplayName(driver)
                                    return (
                                        <tr key={driver.id} className="hover:bg-[#f9fafb] dark:hover:bg-[#202e3b] transition-colors relative z-10">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 flex items-center justify-center font-bold text-sm">{getInitials(name)}</div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-[#111418] dark:text-white">{name}</p>
                                                        <div className="flex items-center gap-1"><span className="material-symbols-outlined text-xs text-yellow-500">star</span><p className="text-xs text-[#617589] dark:text-[#94a3b8]">{driver.rating?.toFixed(1) || '0.0'}</p></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4"><p className="text-sm font-medium text-[#111418] dark:text-white">{driver.vehicle_type || '-'}</p><p className="text-xs text-[#617589] dark:text-[#94a3b8]">{driver.vehicle_plate || '-'}</p></td>
                                            <td className="px-6 py-4"><p className="text-sm text-[#617589] dark:text-[#94a3b8]">{driver.created_at ? new Date(driver.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</p></td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${driver.is_active ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${driver.is_active ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                                                    {driver.is_active ? 'Online' : 'Offline'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right relative">
                                                <div className="relative inline-block text-left group">
                                                    <button className="text-[#617589] hover:text-[#111418] dark:text-[#94a3b8] dark:hover:text-white p-2 hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d] rounded-lg transition-colors"><span className="material-symbols-outlined text-[20px]">more_vert</span></button>
                                                    <div className="hidden group-hover:block absolute right-0 top-full z-50 w-56 bg-white dark:bg-[#1a2632] rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] flex flex-col py-1 text-left">
                                                        <button className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#111418] dark:text-white hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d] transition-colors w-full text-left"><span className="material-symbols-outlined text-[18px] text-[#617589] dark:text-[#94a3b8]">person</span>Lihat Profil</button>
                                                        <Link to={`/admin/drivers/edit/${driver.id}`} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#111418] dark:text-white hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d] transition-colors w-full text-left"><span className="material-symbols-outlined text-[18px] text-[#617589] dark:text-[#94a3b8]">edit</span>Edit Data</Link>
                                                        <div className="h-px bg-[#e5e7eb] dark:bg-[#2a3b4d] my-1 mx-2"></div>
                                                        <button onClick={() => handleTerminateClick(driver)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left"><span className="material-symbols-outlined text-[18px]">person_off</span>Putus Kemitraan</button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-4 border-t border-[#e5e7eb] dark:border-[#2a3b4d] flex items-center justify-between">
                        <p className="text-sm text-[#617589] dark:text-[#94a3b8]">Menampilkan <span className="font-semibold text-[#111418] dark:text-white">1-{drivers.length}</span> dari <span className="font-semibold text-[#111418] dark:text-white">{stats.total.toLocaleString()}</span> driver</p>
                    </div>
                </div>
            ) : (
                <AdminEmptyState title="Belum Ada Driver" description="Daftar driver yang daftar dan disetujui akan muncul di halaman ini." icon="two_wheeler" />
            )}

            {isTerminateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#111418]/60 backdrop-blur-sm">
                    <div className="w-full max-w-[500px] bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d]">
                        <div className="p-8">
                            <h3 className="text-2xl font-bold text-[#111418] dark:text-white mb-4 text-center">Putus Kemitraan Driver?</h3>
                            <p className="text-[#617589] dark:text-[#94a3b8] text-center mb-8 leading-relaxed">Tindakan ini bersifat permanen. <strong className="text-[#111418] dark:text-white">{driverDisplayName(selectedDriver)}</strong> tidak akan bisa menerima order lagi.</p>
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-[#111418] dark:text-white mb-2">Alasan</label>
                                <select className="w-full appearance-none bg-[#f6f7f8] dark:bg-[#202e3b] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg pl-4 pr-10 py-3 text-[#111418] dark:text-white"><option disabled selected value="">Pilih alasan...</option><option>Pelanggaran Prosedur</option><option>Fraud</option><option>Permintaan Mitra</option><option>Lainnya</option></select>
                            </div>
                            <div className="mb-8">
                                <label className="block text-sm font-bold text-[#111418] dark:text-white mb-2">Konfirmasi Tindakan</label>
                                <p className="text-xs text-[#617589] dark:text-[#94a3b8] mb-3">Ketik: <span className="font-mono font-bold text-red-600 dark:text-red-400">{expectedConfirmText}</span></p>
                                <input type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder={expectedConfirmText} className="w-full bg-[#f6f7f8] dark:bg-[#202e3b] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg px-4 py-3 text-[#111418] dark:text-white font-mono" />
                                {confirmText && !isConfirmValid && <p className="text-xs text-red-600 dark:text-red-400 mt-2 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">error</span>Teks konfirmasi tidak sesuai</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => setIsTerminateModalOpen(false)} className="w-full px-4 py-3 bg-[#f0f2f4] hover:bg-[#e5e7eb] dark:bg-[#2a3b4d] dark:hover:bg-[#344658] text-[#617589] dark:text-[#94a3b8] font-bold rounded-lg transition-colors">Batal</button>
                                <button onClick={handleTerminate} disabled={!isConfirmValid} className="w-full px-4 py-3 bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Ya, Putus Kemitraan</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    )
}
