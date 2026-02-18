import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../../services/supabaseClient'
import AdminLayout from '../../../components/admin/AdminLayout'

export default function AdminWithdrawalDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [withdrawal, setWithdrawal] = useState(null)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState(null)

    const formatCurrency = (val) => `Rp ${(val || 0).toLocaleString('id-ID')}`

    const fetchWithdrawal = async () => {
        try {
            const { data, error: fetchErr } = await supabase
                .from('withdrawals')
                .select(`
                    *,
                    user:profiles!withdrawals_user_id_fkey(id, full_name, phone, email, role, created_at)
                `)
                .eq('id', id)
                .single()

            if (fetchErr) throw fetchErr
            setWithdrawal(data)
        } catch (err) {
            console.error('Error fetching withdrawal:', err)
            setError('Gagal memuat detail penarikan')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchWithdrawal() }, [id])

    const getInitials = (name) => {
        if (!name) return '??'
        return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return '-'
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        })
    }

    const handleApprove = async () => {
        if (!confirm('Yakin ingin menyetujui dan memproses transfer ini?')) return
        setProcessing(true)
        try {
            const { error: updateErr } = await supabase
                .from('withdrawals')
                .update({ status: 'approved', processed_at: new Date().toISOString() })
                .eq('id', id)
            if (updateErr) throw updateErr
            alert('Penarikan telah disetujui')
            fetchWithdrawal()
        } catch (err) {
            alert('Gagal memproses: ' + err.message)
        } finally {
            setProcessing(false)
        }
    }

    const handleReject = async () => {
        const reason = prompt('Alasan penolakan:')
        if (!reason) return
        setProcessing(true)
        try {
            const { error: updateErr } = await supabase
                .from('withdrawals')
                .update({ status: 'rejected', rejection_reason: reason, processed_at: new Date().toISOString() })
                .eq('id', id)
            if (updateErr) throw updateErr
            alert('Penarikan telah ditolak')
            fetchWithdrawal()
        } catch (err) {
            alert('Gagal memproses: ' + err.message)
        } finally {
            setProcessing(false)
        }
    }

    if (loading) {
        return (
            <AdminLayout title="Tinjauan Penarikan Dana" showBack>
                <div className="flex items-center justify-center py-20">
                    <span className="material-symbols-outlined animate-spin text-4xl text-[#617589]">progress_activity</span>
                </div>
            </AdminLayout>
        )
    }

    if (error || !withdrawal) {
        return (
            <AdminLayout title="Tinjauan Penarikan Dana" showBack>
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <span className="material-symbols-outlined text-5xl text-red-400 mb-4">error</span>
                    <h3 className="text-lg font-bold text-[#111418] dark:text-white mb-2">{error || 'Penarikan tidak ditemukan'}</h3>
                    <button onClick={() => navigate('/admin/withdrawals')} className="text-sm text-primary hover:underline mt-4">← Kembali</button>
                </div>
            </AdminLayout>
        )
    }

    const isPending = withdrawal.status === 'pending'
    const user = withdrawal.user

    return (
        <AdminLayout title="Tinjauan Penarikan Dana" showBack>

            {/* Information Alert */}
            {isPending && (
                <div className="mb-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4 flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary mt-0.5">info</span>
                    <div>
                        <p className="text-sm font-medium text-primary mb-1">Permintaan Menunggu Persetujuan</p>
                        <p className="text-sm text-[#617589] dark:text-[#94a3b8]">Mohon verifikasi data bank dan saldo sebelum melakukan transfer.</p>
                    </div>
                </div>
            )}

            {!isPending && (
                <div className={`mb-6 rounded-xl p-4 flex items-start gap-3 border ${withdrawal.status === 'approved' ? 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30' :
                        'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30'
                    }`}>
                    <span className={`material-symbols-outlined mt-0.5 ${withdrawal.status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
                        {withdrawal.status === 'approved' ? 'check_circle' : 'cancel'}
                    </span>
                    <div>
                        <p className={`text-sm font-medium mb-1 ${withdrawal.status === 'approved' ? 'text-green-700' : 'text-red-700'}`}>
                            {withdrawal.status === 'approved' ? 'Telah Disetujui' : 'Ditolak'}
                        </p>
                        {withdrawal.rejection_reason && (
                            <p className="text-sm text-[#617589] dark:text-[#94a3b8]">Alasan: {withdrawal.rejection_reason}</p>
                        )}
                        {withdrawal.processed_at && (
                            <p className="text-xs text-[#617589] dark:text-[#94a3b8] mt-1">Diproses: {formatDate(withdrawal.processed_at)}</p>
                        )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 flex flex-col gap-6">

                    {/* Applicant Profile */}
                    <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] p-6">
                        <h3 className="text-base font-semibold text-[#111418] dark:text-white mb-4">Profil Pemohon</h3>
                        <div className="flex items-center gap-5">
                            <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
                                <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-2xl font-bold">
                                    {getInitials(user?.full_name)}
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h2 className="text-xl font-bold text-[#111418] dark:text-white">{user?.full_name || '-'}</h2>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                        {user?.role || 'User'}
                                    </span>
                                </div>
                                {user?.created_at && (
                                    <p className="text-sm text-[#617589] dark:text-[#94a3b8] mb-2">
                                        Bergabung sejak {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                )}
                                <div className="flex items-center gap-4 text-sm">
                                    {user?.phone && (
                                        <div className="flex items-center gap-1.5 text-[#617589] dark:text-[#94a3b8]">
                                            <span className="material-symbols-outlined text-[18px]">phone</span>
                                            <span className="font-medium text-[#111418] dark:text-white">{user.phone}</span>
                                        </div>
                                    )}
                                    {user?.email && (
                                        <div className="flex items-center gap-1.5 text-[#617589] dark:text-[#94a3b8]">
                                            <span className="material-symbols-outlined text-[18px]">email</span>
                                            <span className="font-medium text-[#111418] dark:text-white">{user.email}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Withdrawal Details */}
                    <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] p-6">
                        <h3 className="text-base font-semibold text-[#111418] dark:text-white mb-6">Detail Penarikan</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                            <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                                <p className="text-xs text-primary font-medium mb-1">Nominal Penarikan</p>
                                <p className="text-2xl font-bold text-primary">{formatCurrency(withdrawal.amount)}</p>
                                <p className="text-xs text-[#617589] dark:text-[#94a3b8] mt-1">Diajukan: {formatDate(withdrawal.created_at)}</p>
                            </div>
                        </div>
                        {(withdrawal.bank_name || withdrawal.account_number || withdrawal.account_holder) && (
                            <div className="border-t border-[#e5e7eb] dark:border-[#2a3b4d] pt-6">
                                <h4 className="text-sm font-medium text-[#617589] dark:text-[#94a3b8] mb-4 uppercase tracking-wider">Rekening Tujuan</h4>
                                <div className="flex flex-col gap-4">
                                    {withdrawal.bank_name && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-[#617589] dark:text-[#94a3b8]">Nama Bank</span>
                                            <span className="text-sm font-semibold text-[#111418] dark:text-white">{withdrawal.bank_name}</span>
                                        </div>
                                    )}
                                    {withdrawal.account_number && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-[#617589] dark:text-[#94a3b8]">Nomor Rekening</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-mono font-semibold text-[#111418] dark:text-white tracking-wide">{withdrawal.account_number}</span>
                                                <button onClick={() => { navigator.clipboard.writeText(withdrawal.account_number); alert('Disalin!') }} className="text-[#617589] hover:text-primary transition-colors">
                                                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {withdrawal.account_holder && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-[#617589] dark:text-[#94a3b8]">Atas Nama</span>
                                            <span className="text-sm font-semibold text-[#111418] dark:text-white">{withdrawal.account_holder}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    {/* Action Card */}
                    {isPending && (
                        <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] p-5 sticky top-24">
                            <h3 className="text-base font-semibold text-[#111418] dark:text-white mb-4">Aksi Verifikasi</h3>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleApprove}
                                    disabled={processing}
                                    className="w-full py-3 px-4 rounded-lg bg-primary hover:bg-blue-700 text-white font-medium text-sm transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                    {processing ? 'Memproses...' : 'Proses Transfer'}
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={processing}
                                    className="w-full py-3 px-4 rounded-lg border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 font-medium text-sm hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-[20px]">cancel</span>
                                    Tolak Penarikan
                                </button>
                            </div>
                            <p className="text-xs text-[#617589] dark:text-[#94a3b8] mt-4 text-center leading-relaxed">
                                Dengan memproses, sistem akan otomatis mengirim notifikasi ke mitra.
                            </p>
                        </div>
                    )}

                    {/* Status Info */}
                    <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] p-5">
                        <h3 className="text-sm font-bold text-[#111418] dark:text-white uppercase tracking-wider mb-4">Info Penarikan</h3>
                        <div className="flex flex-col gap-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-[#617589] dark:text-[#94a3b8]">ID</span>
                                <span className="font-mono text-xs text-[#111418] dark:text-white">#{withdrawal.id?.substring(0, 8)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#617589] dark:text-[#94a3b8]">Status</span>
                                <span className={`font-medium ${withdrawal.status === 'pending' ? 'text-amber-600' :
                                        withdrawal.status === 'approved' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {withdrawal.status === 'pending' ? 'Menunggu' : withdrawal.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#617589] dark:text-[#94a3b8]">Diajukan</span>
                                <span className="font-medium text-[#111418] dark:text-white">{formatDate(withdrawal.created_at)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
