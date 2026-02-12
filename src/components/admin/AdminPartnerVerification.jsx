import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabaseClient'
import { useToast } from '../../context/ToastContext'
import { handleError, handleSuccess } from '../../utils/errorHandler'

function AdminPartnerVerification() {
    const toast = useToast()
    const [activeTab, setActiveTab] = useState('merchants') // 'merchants' | 'drivers'
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchRequests()
    }, [activeTab])

    const fetchRequests = async () => {
        setLoading(true)
        setError(null)
        try {
            let query
            if (activeTab === 'merchants') {
                // Fetch pending merchants with owner details
                query = supabase
                    .from('merchants')
                    .select(`
                        id,
                        name,
                        address,
                        status,
                        created_at,
                        owner:profiles!owner_id (full_name, phone)
                    `)
                    .eq('status', 'pending')
                    .order('created_at', { ascending: false })
            } else {
                // Fetch pending drivers with user details
                query = supabase
                    .from('drivers')
                    .select(`
                        id,
                        vehicle_type,
                        vehicle_plate,
                        status,
                        created_at,
                        user:profiles!user_id (full_name, phone)
                    `)
                    .eq('status', 'pending')
                    .order('created_at', { ascending: false })
            }

            const { data, error: err } = await query

            if (err) throw err
            setRequests(data || [])
        } catch (err) {
            console.error(`Error fetching ${activeTab} requests:`, err)
            setError('Gagal memuat data. Silakan coba lagi.')
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (id) => {
        if (!confirm('Apakah Anda yakin ingin menyetujui pendaftaran ini?')) return

        try {
            const table = activeTab === 'merchants' ? 'merchants' : 'drivers'
            const { error: err } = await supabase
                .from(table)
                .update({ status: 'approved' })
                .eq('id', id)

            if (err) throw err

            // Remove from list
            setRequests(prev => prev.filter(req => req.id !== id))
            toast.success('Pendaftaran berhasil disetujui!')
        } catch (err) {
            console.error('Error approving request:', err)
            handleError(err, toast, { context: 'Approve Partner' })
        }
    }

    const handleReject = async (id) => {
        if (!confirm('Apakah Anda yakin ingin menolak pendaftaran ini?')) return

        try {
            const table = activeTab === 'merchants' ? 'merchants' : 'drivers'
            const { error: err } = await supabase
                .from(table)
                .update({ status: 'rejected' })
                .eq('id', id)

            if (err) throw err

            // Remove from list
            setRequests(prev => prev.filter(req => req.id !== id))
            toast.success('Pendaftaran berhasil ditolak!')
        } catch (err) {
            console.error('Error rejecting request:', err)
            handleError(err, toast, { context: 'Reject Partner' })
        }
    }

    // Helper to format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header / Tabs */}
            <div className="border-b border-gray-100 flex">
                <button
                    onClick={() => setActiveTab('merchants')}
                    className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === 'merchants'
                        ? 'text-primary border-b-2 border-primary bg-orange-50/50'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    Verifikasi Warung
                </button>
                <div className="w-[1px] bg-gray-100"></div>
                <button
                    onClick={() => setActiveTab('drivers')}
                    className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === 'drivers'
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    Verifikasi Driver
                </button>
            </div>

            {/* Content */}
            <div className="p-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <span className="material-symbols-outlined animate-spin text-3xl mb-2">progress_activity</span>
                        <p className="text-sm">Memuat data...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-12 text-red-500">
                        <p>{error}</p>
                        <button onClick={fetchRequests} className="mt-2 text-primary hover:underline text-sm">Coba Lagi</button>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                            <span className="material-symbols-outlined text-3xl opacity-50">inbox</span>
                        </div>
                        <p className="font-medium text-gray-600">Tidak ada permintaan baru</p>
                        <p className="text-xs mt-1">Semua pendaftaran {activeTab === 'merchants' ? 'warung' : 'driver'} aman terkendali.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {requests.map((req) => (
                            <div key={req.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-300 transition-colors flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between group">
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${activeTab === 'merchants' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                                        }`}>
                                        <span className="material-symbols-outlined">
                                            {activeTab === 'merchants' ? 'storefront' : 'two_wheeler'}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">
                                            {activeTab === 'merchants' ? req.name : `${req.user?.full_name || 'Driver'} (${req.vehicle_plate})`}
                                        </h4>
                                        <p className="text-sm text-gray-500 mb-1">
                                            {activeTab === 'merchants'
                                                ? `Pemilik: ${req.owner?.full_name || 'Unknown'} • ${req.owner?.phone || '-'}`
                                                : `Kendaraan: ${req.vehicle_type} • ${req.user?.phone || '-'}`
                                            }
                                        </p>
                                        <p className="text-xs text-gray-400 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[10px]">calendar_today</span>
                                            {formatDate(req.created_at)}
                                        </p>
                                        {activeTab === 'merchants' && (
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{req.address}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                    <button
                                        onClick={() => handleReject(req.id)}
                                        className="flex-1 sm:flex-none py-2 px-4 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium transition-colors"
                                    >
                                        Tolak
                                    </button>
                                    <button
                                        onClick={() => handleApprove(req.id)}
                                        className="flex-1 sm:flex-none py-2 px-4 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium shadow-sm transition-colors"
                                    >
                                        Setujui
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminPartnerVerification
