import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminHeader from '../../components/admin/AdminHeader'
import driverService from '../../services/driverService'
import { useAuth } from '../../context/AuthContext'

export default function AdminDriversReviewPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [driver, setDriver] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isApproving, setIsApproving] = useState(false)
    const [isRejecting, setIsRejecting] = useState(false)
    const [showRejectModal, setShowRejectModal] = useState(false)
    const [rejectionReason, setRejectionReason] = useState('')

    useEffect(() => {
        fetchDriver()
    }, [id])

    const fetchDriver = async () => {
        try {
            setLoading(true)
            const data = await driverService.getDriverForReview(id)
            setDriver(data)
            setError(null)
        } catch (err) {
            console.error('Failed to fetch driver:', err)
            setError('Gagal memuat data driver')
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async () => {
        if (!user?.id) {
            alert('Anda harus login sebagai admin')
            return
        }

        if (!confirm('Apakah Anda yakin ingin menyetujui driver ini?')) return

        try {
            setIsApproving(true)
            await driverService.approveDriver(id, user.id)
            alert('Driver berhasil disetujui!')
            navigate('/admin/drivers')
        } catch (err) {
            console.error('Failed to approve driver:', err)
            alert('Gagal menyetujui driver')
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
            await driverService.rejectDriver(id, rejectionReason)
            alert('Driver berhasil ditolak')
            navigate('/admin/drivers/verification')
        } catch (err) {
            console.error('Failed to reject driver:', err)
            alert('Gagal menolak driver')
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

    if (error || !driver) {
        return (
            <div className="flex min-h-screen w-full bg-[#f6f7f8] dark:bg-[#101922] items-center justify-center">
                <div className="text-center">
                    <span className="material-symbols-outlined text-6xl text-red-500">error</span>
                    <p className="mt-4 text-[#617589] dark:text-[#94a3b8]">{error || 'Data tidak ditemukan'}</p>
                    <button
                        onClick={() => navigate('/admin/drivers/verification')}
                        className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
                    >
                        Kembali
                    </button>
                </div>
            </div>
        )
    }

    const getInitials = (name) => {
        if (!name) return 'N/A'
        return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    }

    return (
        <div className="flex min-h-screen w-full bg-[#f6f7f8] dark:bg-[#101922] font-display text-[#111418] dark:text-white overflow-x-hidden">
            <AdminSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <main className="flex-1 lg:ml-[280px] flex flex-col min-w-0 relative">
                <AdminHeader
                    onMenuClick={() => setIsSidebarOpen(true)}
                    title="Tinjau Dokumen Driver"
                    showBack={true}
                    onBackClick={() => navigate('/admin/drivers/verification')}
                />

                <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
                    <div className="max-w-[1000px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Left Column: Driver Info */}
                        <div className="lg:col-span-2 flex flex-col gap-6">

                            {/* Card: Identitas Driver */}
                            <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl overflow-hidden">
                                <div className="p-4 border-b border-[#e5e7eb] dark:border-[#2a3b4d] flex items-center justify-between bg-[#f9fafb] dark:bg-[#1e2c3a]">
                                    <h3 className="font-bold text-[#111418] dark:text-white">Identitas Driver</h3>
                                    <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                        Menunggu Verifikasi
                                    </span>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-2xl shrink-0">
                                            {getInitials(driver.user?.full_name)}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-[#111418] dark:text-white">{driver.user?.full_name || 'N/A'}</h2>
                                            <p className="text-[#617589] dark:text-[#94a3b8] text-sm mt-1">Diajukan pada {formatDate(driver.created_at)}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                                        <div>
                                            <p className="text-xs text-[#617589] dark:text-[#94a3b8] mb-1">Nomor Telepon</p>
                                            <p className="text-sm font-medium text-[#111418] dark:text-white">{driver.user?.phone || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-[#617589] dark:text-[#94a3b8] mb-1">Email</p>
                                            <p className="text-sm font-medium text-[#111418] dark:text-white">{driver.user?.email || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-[#617589] dark:text-[#94a3b8] mb-1">Bank</p>
                                            <p className="text-sm font-medium text-[#111418] dark:text-white uppercase">{driver.bank_name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-[#617589] dark:text-[#94a3b8] mb-1">Nama Rekening</p>
                                            <p className="text-sm font-medium text-[#111418] dark:text-white">{driver.bank_account_name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-[#617589] dark:text-[#94a3b8] mb-1">Nomor Rekening</p>
                                            <p className="text-sm font-medium text-[#111418] dark:text-white">{driver.bank_account_number || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card: Data Kendaraan */}
                            <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl overflow-hidden">
                                <div className="p-4 border-b border-[#e5e7eb] dark:border-[#2a3b4d] bg-[#f9fafb] dark:bg-[#1e2c3a]">
                                    <h3 className="font-bold text-[#111418] dark:text-white">Data Kendaraan</h3>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                                        <div>
                                            <p className="text-xs text-[#617589] dark:text-[#94a3b8] mb-1">Jenis Kendaraan</p>
                                            <p className="text-sm font-medium text-[#111418] dark:text-white">{driver.vehicle_type === 'motor' ? 'Sepeda Motor' : 'Mobil'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-[#617589] dark:text-[#94a3b8] mb-1">Merk & Tipe</p>
                                            <p className="text-sm font-medium text-[#111418] dark:text-white uppercase">{driver.vehicle_brand || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-[#617589] dark:text-[#94a3b8] mb-1">Nomor Polisi (Plat)</p>
                                            <p className="text-sm font-medium text-[#111418] dark:text-white uppercase">{driver.vehicle_plate || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card: Dokumen */}
                            <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl overflow-hidden">
                                <div className="p-4 border-b border-[#e5e7eb] dark:border-[#2a3b4d] bg-[#f9fafb] dark:bg-[#1e2c3a]">
                                    <h3 className="font-bold text-[#111418] dark:text-white">Dokumen Pendukung</h3>
                                </div>
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Foto Selfie */}
                                    <div className="flex flex-col gap-2">
                                        <p className="text-sm font-medium text-[#111418] dark:text-white">Foto Selfie</p>
                                        <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] flex items-center justify-center relative group cursor-pointer overflow-hidden">
                                            {driver.selfie_url ? (
                                                <img
                                                    src={driver.selfie_url}
                                                    alt="Selfie"
                                                    className="w-full h-full object-contain"
                                                    onClick={() => window.open(driver.selfie_url, '_blank')}
                                                />
                                            ) : (
                                                <span className="material-symbols-outlined text-4xl text-[#617589] dark:text-[#94a3b8]">person</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Foto KTP */}
                                    <div className="flex flex-col gap-2">
                                        <p className="text-sm font-medium text-[#111418] dark:text-white">Foto KTP</p>
                                        <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] flex items-center justify-center relative group cursor-pointer overflow-hidden">
                                            {driver.ktp_url ? (
                                                <img
                                                    src={driver.ktp_url}
                                                    alt="KTP"
                                                    className="w-full h-full object-contain"
                                                    onClick={() => window.open(driver.ktp_url, '_blank')}
                                                />
                                            ) : (
                                                <span className="material-symbols-outlined text-4xl text-[#617589] dark:text-[#94a3b8]">branding_watermark</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Foto STNK */}
                                    <div className="flex flex-col gap-2">
                                        <p className="text-sm font-medium text-[#111418] dark:text-white">Foto STNK</p>
                                        <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] flex items-center justify-center relative group cursor-pointer overflow-hidden">
                                            {driver.stnk_url ? (
                                                <img
                                                    src={driver.stnk_url}
                                                    alt="STNK"
                                                    className="w-full h-full object-contain"
                                                    onClick={() => window.open(driver.stnk_url, '_blank')}
                                                />
                                            ) : (
                                                <span className="material-symbols-outlined text-4xl text-[#617589] dark:text-[#94a3b8]">description</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Foto Kendaraan */}
                                    <div className="flex flex-col gap-2">
                                        <p className="text-sm font-medium text-[#111418] dark:text-white">Foto Kendaraan</p>
                                        <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] flex items-center justify-center relative group cursor-pointer overflow-hidden">
                                            {driver.vehicle_photo_url ? (
                                                <img
                                                    src={driver.vehicle_photo_url}
                                                    alt="Kendaraan"
                                                    className="w-full h-full object-contain"
                                                    onClick={() => window.open(driver.vehicle_photo_url, '_blank')}
                                                />
                                            ) : (
                                                <span className="material-symbols-outlined text-4xl text-[#617589] dark:text-[#94a3b8]">two_wheeler</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Foto Bersama Kendaraan */}
                                    <div className="flex flex-col gap-2 md:col-span-2">
                                        <p className="text-sm font-medium text-[#111418] dark:text-white">Foto Bersama Kendaraan</p>
                                        <div className="aspect-video max-w-md bg-gray-100 dark:bg-gray-800 rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] flex items-center justify-center relative group cursor-pointer overflow-hidden">
                                            {driver.photo_with_vehicle_url ? (
                                                <img
                                                    src={driver.photo_with_vehicle_url}
                                                    alt="Bersama Kendaraan"
                                                    className="w-full h-full object-contain"
                                                    onClick={() => window.open(driver.photo_with_vehicle_url, '_blank')}
                                                />
                                            ) : (
                                                <span className="material-symbols-outlined text-4xl text-[#617589] dark:text-[#94a3b8]">photo_camera</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Actions */}
                        <div className="flex flex-col gap-6">
                            <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl overflow-hidden sticky top-24">
                                <div className="p-4 border-b border-[#e5e7eb] dark:border-[#2a3b4d] bg-[#f9fafb] dark:bg-[#1e2c3a]">
                                    <h3 className="font-bold text-[#111418] dark:text-white">Aksi Verifikasi</h3>
                                </div>
                                <div className="p-6 flex flex-col gap-4">
                                    <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm">
                                        <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">info</span>
                                        <p>Pastikan semua data dan dokumen sesuai sebelum menyetujui.</p>
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

                                    <div className="grid grid-cols-1 gap-3">
                                        <button
                                            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg shadow-green-600/20 transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            onClick={handleApprove}
                                            disabled={isApproving || isRejecting}
                                        >
                                            <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                            {isApproving ? 'Memproses...' : 'Setujui Driver'}
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
                        </div>

                    </div>
                </div>
            </main>

            {/* Reject Confirmation Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-[#1a2632] rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-lg font-bold text-[#111418] dark:text-white mb-4">Konfirmasi Penolakan</h3>
                        <p className="text-sm text-[#617589] dark:text-[#94a3b8] mb-4">
                            Apakah Anda yakin ingin menolak driver ini? Pastikan Anda telah mengisi alasan penolakan.
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
        </div>
    )
}
