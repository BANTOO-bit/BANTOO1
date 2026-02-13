import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import driverService from '../../services/driverService'

export default function AdminDriversVerificationPage() {
    const [activeTab, setActiveTab] = useState('pending')
    const [verificationQueue, setVerificationQueue] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchDrivers()
    }, [activeTab])

    const fetchDrivers = async () => {
        try {
            setLoading(true)
            const data = await driverService.getDriversForVerification('pending')
            setVerificationQueue(data)
            setError(null)
        } catch (err) {
            console.error('Failed to fetch drivers:', err)
            setError('Gagal memuat data driver')
        } finally {
            setLoading(false)
        }
    }

    const getInitials = (name) => {
        if (!name) return 'N/A'
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    const getColorClass = (index) => {
        const colors = ['blue', 'purple', 'yellow', 'green', 'pink']
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

    const formatVehicle = (driver) => {
        const brand = driver.vehicle_brand || 'N/A'
        const type = driver.vehicle_type === 'motor' ? 'Motor' : 'Mobil'
        const plate = driver.vehicle_plate || 'N/A'
        return `${brand} (${type}) - ${plate}`
    }

    return (
        <AdminLayout title="Verifikasi Driver Baru" showBack>

                        {/* Tabs */}
                        <div className="flex items-center gap-6 border-b border-[#e5e7eb] dark:border-[#2a3b4d] mb-6 overflow-x-auto">
                            <button
                                onClick={() => setActiveTab('pending')}
                                className={`pb-3 text-sm font-medium whitespace-nowrap transition-colors relative ${activeTab === 'pending'
                                    ? 'text-primary'
                                    : 'text-[#617589] dark:text-[#94a3b8] hover:text-[#111418] dark:hover:text-white'
                                    }`}
                            >
                                Menunggu Verifikasi
                                <span className="ml-2 px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-bold">{verificationQueue.length}</span>
                                {activeTab === 'pending' && (
                                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></div>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`pb-3 text-sm font-medium whitespace-nowrap transition-colors relative ${activeTab === 'history'
                                    ? 'text-primary'
                                    : 'text-[#617589] dark:text-[#94a3b8] hover:text-[#111418] dark:hover:text-white'
                                    }`}
                            >
                                Riwayat Verifikasi
                                {activeTab === 'history' && (
                                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></div>
                                )}
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

                        {/* List Content */}
                        {!loading && !error && (
                            <div className="flex flex-col gap-4">
                                {verificationQueue.length === 0 ? (
                                    <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl p-12 text-center">
                                        <p className="text-[#617589] dark:text-[#94a3b8]">Tidak ada driver yang menunggu verifikasi</p>
                                    </div>
                                ) : (
                                    verificationQueue.map((item, index) => {
                                        const color = getColorClass(index)
                                        const initials = getInitials(item.user?.full_name)

                                        return (
                                            <div key={item.id} className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl p-5 hover:shadow-md transition-shadow">
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                                    <div className="flex items-start gap-4">
                                                        <div className={`w-12 h-12 rounded-full bg-${color}-100 dark:bg-${color}-900 text-${color}-600 dark:text-${color}-200 flex items-center justify-center font-bold text-lg shrink-0`}>
                                                            {initials}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-base font-bold text-[#111418] dark:text-white">{item.user?.full_name || 'N/A'}</h3>
                                                            <div className="flex items-center gap-2 text-sm text-[#617589] dark:text-[#94a3b8] mt-1">
                                                                <span className="material-symbols-outlined text-[16px]">two_wheeler</span>
                                                                {formatVehicle(item)}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-[#617589] dark:text-[#94a3b8] mt-0.5">
                                                                <span className="material-symbols-outlined text-[16px]">call</span>
                                                                {item.user?.phone || 'N/A'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-1 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-[#e5e7eb] dark:border-[#2a3b4d]">
                                                        <div className="flex flex-col items-end mr-auto sm:mr-0">
                                                            <p className="text-xs font-semibold text-[#111418] dark:text-white">Diajukan Pada</p>
                                                            <p className="text-xs text-[#617589] dark:text-[#94a3b8]">{formatDate(item.created_at)} • {formatTime(item.created_at)}</p>
                                                        </div>
                                                        <Link to={`/admin/drivers/verification/${item.id}`} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors">
                                                            Tinjau
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        )}
        </AdminLayout>
    )
}
