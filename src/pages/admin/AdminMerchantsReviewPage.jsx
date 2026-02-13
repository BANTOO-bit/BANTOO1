import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import merchantService from '../../services/merchantService'
import { useAuth } from '../../context/AuthContext'

export default function AdminMerchantsReviewPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [merchant, setMerchant] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isApproving, setIsApproving] = useState(false)
    const [isRejecting, setIsRejecting] = useState(false)
    const [showRejectModal, setShowRejectModal] = useState(false)
    const [rejectionReason, setRejectionReason] = useState('')

    useEffect(() => {
        fetchMerchant()
    }, [id])

    const fetchMerchant = async () => {
        try {
            setLoading(true)
            const data = await merchantService.getMerchantForReview(id)
            setMerchant(data)
            setError(null)
        } catch (err) {
            console.error('Failed to fetch merchant:', err)
            setError('Gagal memuat data warung')
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async () => {
        if (!user?.id) {
            alert('Anda harus login sebagai admin')
            return
        }

        if (!confirm('Apakah Anda yakin ingin menyetujui warung ini?')) return

        try {
            setIsApproving(true)
            await merchantService.approveMerchant(id, user.id)
            alert('Warung berhasil disetujui!')
            navigate('/admin/merchants')
        } catch (err) {
            console.error('Failed to approve merchant:', err)
            alert('Gagal menyetujui warung')
        } finally {
            setIsApproving(false)
        }
    }

    const handleReject = async () => {
        if (!user?.id) {
            alert('Anda harus login sebagai admin')
            return
        }

        if (!rejectionReason.trim()) {
            alert('Harap masukkan alasan penolakan')
            return
        }

        try {
            setIsRejecting(true)
            await merchantService.rejectMerchant(id, rejectionReason)
            alert('Warung berhasil ditolak')
            navigate('/admin/merchants/verification')
        } catch (err) {
            console.error('Failed to reject merchant:', err)
            alert('Gagal menolak warung')
        } finally {
            setIsRejecting(false)
            setShowRejectModal(false)
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) + ' WIB'
    }

    if (loading) {
        return (
            <div className="flex min-h-screen w-full bg-[#f6f7f8] dark:bg-[#101922] items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="mt-4 text-[#617589] dark:text-[#94a3b8]">Memuat data...</p>
                </div>
            </div>
        )
    }

    if (error || !merchant) {
        return (
            <div className="flex min-h-screen w-full bg-[#f6f7f8] dark:bg-[#101922] items-center justify-center">
                <div className="text-center">
                    <span className="material-symbols-outlined text-6xl text-red-500">error</span>
                    <p className="mt-4 text-[#617589] dark:text-[#94a3b8]">{error || 'Data tidak ditemukan'}</p>
                    <button
                        onClick={() => navigate('/admin/merchants/verification')}
                        className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
                    >
                        Kembali
                    </button>
                </div>
            </div>
        )
    }

    return (
        <AdminLayout title="Tinjau Verifikasi Warung" showBack>

            {/* Left Column: Merchant Details */}
            <div className="lg:col-span-2 flex flex-col gap-6">

                {/* Profile Card */}
                <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl p-6">
                    <h3 className="text-lg font-bold text-[#111418] dark:text-white mb-6">Profil Warung</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm font-medium text-[#617589] dark:text-[#94a3b8] mb-1">Nama Warung</p>
                            <p className="text-base font-bold text-[#111418] dark:text-white">{merchant.name}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-[#617589] dark:text-[#94a3b8] mb-1">Nama Pemilik</p>
                            <p className="text-base font-bold text-[#111418] dark:text-white">{merchant.owner?.full_name || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-[#617589] dark:text-[#94a3b8] mb-1">Nomor Telepon</p>
                            <p className="text-base font-bold text-[#111418] dark:text-white">{merchant.owner?.phone || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-[#617589] dark:text-[#94a3b8] mb-1">Email</p>
                            <p className="text-base font-bold text-[#111418] dark:text-white">{merchant.owner?.email || 'N/A'}</p>
                        </div>
                        <div className="md:col-span-2">
                            <p className="text-sm font-medium text-[#617589] dark:text-[#94a3b8] mb-1">Alamat Lengkap</p>
                            <p className="text-base text-[#111418] dark:text-white leading-relaxed">
                                {merchant.address}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-[#617589] dark:text-[#94a3b8] mb-1">Jam Operasional</p>
                            <p className="text-base text-[#111418] dark:text-white">
                                {merchant.operating_hours?.open || 'N/A'} - {merchant.operating_hours?.close || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-[#617589] dark:text-[#94a3b8] mb-1">Bank</p>
                            <p className="text-base text-[#111418] dark:text-white uppercase">{merchant.bank_name || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-[#617589] dark:text-[#94a3b8] mb-1">Nama Rekening</p>
                            <p className="text-base text-[#111418] dark:text-white">{merchant.bank_account_name || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-[#617589] dark:text-[#94a3b8] mb-1">Nomor Rekening</p>
                            <p className="text-base text-[#111418] dark:text-white">{merchant.bank_account_number || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Documents Section */}
                <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl p-6">
                    <h3 className="text-lg font-bold text-[#111418] dark:text-white mb-6">Dokumen Pendukung</h3>

                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-base font-bold text-[#111418] dark:text-white">Foto KTP Pemilik</p>
                            </div>
                            <div className="aspect-[3/2] w-full max-w-md bg-[#f0f2f4] dark:bg-[#2a3b4d] rounded-lg border-2 border-dashed border-[#e5e7eb] dark:border-[#2a3b4d] flex items-center justify-center relative overflow-hidden group">
                                {merchant.ktp_url ? (
                                    <img
                                        src={merchant.ktp_url}
                                        alt="KTP Pemilik"
                                        className="w-full h-full object-contain"
                                        onClick={() => window.open(merchant.ktp_url, '_blank')}
                                    />
                                ) : (
                                    <span className="material-symbols-outlined text-6xl text-[#94a3b8]">id_card</span>
                                )}
                            </div>
                        </div>

                        <div className="h-px bg-[#e5e7eb] dark:bg-[#2a3b4d]"></div>

                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-base font-bold text-[#111418] dark:text-white">Foto Lokasi Warung</p>
                            </div>
                            <div className="aspect-[3/2] w-full max-w-md bg-[#f0f2f4] dark:bg-[#2a3b4d] rounded-lg border-2 border-dashed border-[#e5e7eb] dark:border-[#2a3b4d] flex items-center justify-center relative overflow-hidden group">
                                {merchant.image_url ? (
                                    <img
                                        src={merchant.image_url}
                                        alt="Foto Warung"
                                        className="w-full h-full object-contain cursor-pointer"
                                        onClick={() => window.open(merchant.image_url, '_blank')}
                                    />
                                ) : (
                                    <span className="material-symbols-outlined text-6xl text-[#94a3b8]">storefront</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Verification Action */}
            <div className="flex flex-col gap-6">
                <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl p-6 sticky top-24">
                    <h3 className="text-lg font-bold text-[#111418] dark:text-white mb-4">Status Verifikasi</h3>

                    <div className="space-y-4 mb-8">
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded-lg flex gap-3">
                            <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 shrink-0">info</span>
                            <div>
                                <p className="text-sm font-bold text-[#111418] dark:text-white">Menunggu Peninjauan</p>
                                <p className="text-xs text-[#617589] dark:text-[#94a3b8]">
                                    Dokumen diunggah pada {formatDate(merchant.created_at)}
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[#111418] dark:text-white mb-2">Catatan Admin (Opsional)</label>
                            <textarea
                                className="w-full h-32 bg-[#f6f7f8] dark:bg-[#202e3b] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg p-3 text-[#111418] dark:text-white text-sm focus:outline-none focus:border-primary resize-none"
                                placeholder="Tulis alasan jika menolak atau catatan tambahan..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                            ></textarea>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        <button
                            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg shadow-green-600/20 transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleApprove}
                            disabled={isApproving || isRejecting}
                        >
                            <span className="material-symbols-outlined">check_circle</span>
                            {isApproving ? 'Memproses...' : 'Setujui Warung'}
                        </button>
                        <button
                            className="w-full py-3 bg-white dark:bg-[#1a2632] border-2 border-red-100 dark:border-red-900/30 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => setShowRejectModal(true)}
                            disabled={isApproving || isRejecting}
                        >
                            <span className="material-symbols-outlined">cancel</span>
                            Tolak & Minta Revisi
                        </button>
                    </div>
                </div>
            </div>



            {/* Reject Confirmation Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-[#1a2632] rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-lg font-bold text-[#111418] dark:text-white mb-4">Konfirmasi Penolakan</h3>
                        <p className="text-sm text-[#617589] dark:text-[#94a3b8] mb-4">
                            Apakah Anda yakin ingin menolak warung ini? Pastikan Anda telah mengisi alasan penolakan.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="flex-1 py-2 border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg text-[#111418] dark:text-white"
                                disabled={isRejecting}
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleReject}
                                className="flex-1 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50"
                                disabled={isRejecting || !rejectionReason.trim()}
                            >
                                {isRejecting ? 'Memproses...' : 'Ya, Tolak'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    )
}
