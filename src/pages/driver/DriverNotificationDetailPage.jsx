import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../services/supabaseClient'

function DriverNotificationDetailPage() {
    const navigate = useNavigate()
    const { id } = useParams()
    const [notification, setNotification] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchNotification() {
            try {
                const { data, error } = await supabase
                    .from('notifications')
                    .select('*')
                    .eq('id', id)
                    .single()

                if (error) throw error

                if (data) {
                    // Mark as read
                    await supabase
                        .from('notifications')
                        .update({ is_read: true })
                        .eq('id', id)

                    // Parse details from message or a metadata field
                    let details = null
                    try {
                        // Try parsing message as JSON for structured notifications
                        if (data.metadata) {
                            details = typeof data.metadata === 'string' ? JSON.parse(data.metadata) : data.metadata
                        }
                    } catch { /* not JSON, use as-is */ }

                    setNotification({
                        ...data,
                        subtype: data.type,
                        details,
                        time: new Date(data.created_at).toLocaleDateString('id-ID', {
                            day: '2-digit', month: 'short', year: 'numeric'
                        }),
                        icon: getIconForType(data.type),
                        color: getColorForType(data.type)
                    })
                }
            } catch (err) {
                if (process.env.NODE_ENV === 'development') console.error('Failed to fetch notification:', err)
            } finally {
                setLoading(false)
            }
        }

        if (id) fetchNotification()
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
            </div>
        )
    }

    if (!notification) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Notifikasi tidak ditemukan</p>
            </div>
        )
    }

    const formatCurrency = (value) => {
        return `Rp ${value.toLocaleString('id-ID')}`
    }

    // Layout for Withdrawal Success (code1.html, code6.html)
    if (notification.subtype === 'withdrawal' && notification.details) {
        const { transactionId, amount, adminFee, totalReceived, date, bankName, accountNumber, note } = notification.details
        return (
            <div className="font-display bg-white text-gray-900 min-h-screen flex flex-col antialiased">
                <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-white">
                    {/* Header */}
                    <header className="bg-white px-4 py-4 sticky top-0 z-50 border-b border-gray-200 flex items-center justify-between">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 -ml-2 rounded-full hover:bg-gray-50 transition-colors"
                        >
                            <span className="material-symbols-outlined text-gray-800">arrow_back</span>
                        </button>
                        <h1 className="text-lg font-bold text-center flex-grow pr-8 text-gray-900">Rincian Transaksi</h1>
                        <div className="w-6"></div>
                    </header>

                    {/* Main Content */}
                    <main className="flex-grow p-6 flex flex-col items-center">
                        <div className="mt-8 mb-6 flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-green-600 text-5xl">account_balance_wallet</span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-1">Penarikan Berhasil</h2>
                            <p className="text-sm text-gray-500 text-center px-6">{date}</p>
                        </div>

                        <div className="w-full max-w-sm bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                            <div className="flex justify-between items-center py-1">
                                <span className="text-sm text-gray-500">ID Transaksi</span>
                                <div className="flex items-center gap-1">
                                    <span className="text-sm font-medium text-gray-900">{transactionId}</span>
                                    <span className="material-symbols-outlined text-gray-400 text-[16px] cursor-pointer">content_copy</span>
                                </div>
                            </div>
                            <div className="h-px bg-gray-200 w-full my-2"></div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Jumlah Penarikan</span>
                                    <span className="text-sm font-medium text-gray-900">{formatCurrency(amount)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Biaya Admin</span>
                                    <span className="text-sm font-medium text-gray-900">{formatCurrency(adminFee)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-sm font-semibold text-gray-900">Total Diterima</span>
                                    <span className="text-lg font-bold text-green-600">{formatCurrency(totalReceived)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full max-w-sm mt-4 bg-white rounded-xl border border-gray-200 p-5">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Tujuan Transfer</h3>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-blue-600">account_balance</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{bankName}</p>
                                    <p className="text-sm text-gray-500">{accountNumber}</p>
                                </div>
                            </div>
                        </div>

                        <div className="w-full max-w-sm mt-6 bg-green-50 rounded-lg p-4 flex items-start gap-3">
                            <span className="material-symbols-outlined text-green-600 text-xl mt-0.5 flex-shrink-0">check_circle</span>
                            <p className="text-sm text-green-800 leading-relaxed">{note}</p>
                        </div>

                        <div className="mt-auto w-full max-w-sm pt-8 pb-4">
                            <button className="w-full bg-white border border-gray-300 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-50 transition-colors">
                                Butuh Bantuan?
                            </button>
                        </div>
                    </main>
                </div>
            </div>
        )
    }

    // Layout for Account Update (code2.html)
    if (notification.subtype === 'account' && notification.details) {
        const { bankName, accountNumber, time, note } = notification.details
        return (
            <div className="font-display bg-background-light text-gray-800 min-h-screen flex flex-col antialiased">
                <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-background-light">
                    {/* Header */}
                    <header className="bg-white px-4 py-4 sticky top-0 z-50 flex items-center justify-between">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <span className="material-symbols-outlined text-gray-600">arrow_back</span>
                        </button>
                        <h1 className="text-lg font-bold text-center flex-grow pr-8">Keamanan Akun</h1>
                        <div className="w-6"></div>
                    </header>

                    {/* Main Content */}
                    <main className="flex-grow flex flex-col items-center px-6 pt-8 pb-bottom-nav text-center">
                        <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-purple-600 text-5xl">security</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Perubahan Data Bank Berhasil</h2>
                        <p className="text-sm text-gray-500 mb-8 max-w-xs mx-auto">
                            Informasi rekening bank penerima pembayaran Anda telah berhasil diperbarui.
                        </p>

                        <div className="w-full bg-white rounded-xl p-6 mb-8 text-left border border-gray-100">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xs font-bold text-purple-600 shadow-sm border border-gray-100">
                                    BCA
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Bank Tujuan</p>
                                    <p className="font-bold text-gray-900">{bankName}</p>
                                </div>
                            </div>
                            <div className="h-px bg-gray-200 w-full mb-4"></div>
                            <div className="space-y-1">
                                <p className="text-xs text-gray-500 font-medium">Nomor Rekening Baru</p>
                                <p className="font-mono text-lg font-semibold text-gray-900 tracking-wide">{accountNumber}</p>
                            </div>
                        </div>

                        <div className="bg-orange-50 p-4 rounded-xl flex items-start text-left mb-6 border border-orange-100">
                            <span className="material-symbols-outlined text-orange-600 mr-3 mt-0.5 text-xl flex-shrink-0">info</span>
                            <p className="text-xs text-gray-700 leading-relaxed">
                                {note}
                            </p>
                        </div>
                    </main>

                    <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-100 p-4 pb-8 z-40">
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Hubungi Keamanan
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Layout for Suspended Account (code3.html)
    if (notification.subtype === 'suspended' && notification.details) {
        const { status, date, reason, description } = notification.details
        return (
            <div className="font-display bg-background-light text-gray-800 min-h-screen flex flex-col antialiased">
                <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-background-light">
                    {/* Header */}
                    <header className="bg-white px-4 py-4 sticky top-0 z-50 border-b border-gray-200 flex items-center justify-between">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <span className="material-symbols-outlined text-gray-600">arrow_back</span>
                        </button>
                        <h1 className="text-lg font-bold text-center flex-grow pr-8">Detail Akun</h1>
                        <div className="w-6"></div>
                    </header>

                    {/* Main Content */}
                    <main className="flex-grow p-6 flex flex-col items-center pt-10">
                        <div className="relative mb-8">
                            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-red-600 text-5xl">gpp_bad</span>
                            </div>
                        </div>

                        <div className="w-full bg-white rounded-xl p-6 space-y-4 border border-gray-100">
                            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                                <span className="text-sm text-gray-500">Status</span>
                                <span className="text-sm font-bold text-red-600">{status}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                                <span className="text-sm text-gray-500">Tanggal</span>
                                <span className="text-sm font-medium text-gray-900">{date}</span>
                            </div>
                            <div className="pt-1">
                                <h3 className="text-sm font-semibold text-gray-900 mb-2">Alasan Penangguhan</h3>
                                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg">
                                    {reason}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 text-center px-4">
                            <p className="text-sm text-gray-500 leading-relaxed">
                                {description}
                            </p>
                        </div>

                        <div className="flex-grow"></div>

                        <div className="w-full mt-8 mb-4">
                            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center space-x-2">
                                <span className="material-symbols-outlined text-[20px]">support_agent</span>
                                <span>Hubungi Pusat Bantuan</span>
                            </button>
                        </div>
                    </main>
                </div>
            </div>
        )
    }

    // Layout for Deposit Success (code4.html)
    if (notification.subtype === 'deposit' && notification.details) {
        const { transactionId, amount, status, adminName, time, note } = notification.details
        return (
            <div className="font-display bg-background-light text-gray-800 min-h-screen flex flex-col antialiased">
                <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-background-light">
                    {/* Header */}
                    <header className="bg-white px-4 py-4 sticky top-0 z-50 border-b border-gray-200 flex items-center justify-between">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <span className="material-symbols-outlined text-gray-600">arrow_back</span>
                        </button>
                        <h1 className="text-lg font-bold text-center flex-grow pr-8">Rincian Setoran</h1>
                        <div className="w-6"></div>
                    </header>

                    {/* Main Content */}
                    <main className="flex-grow p-6 flex flex-col items-center">
                        <div className="mt-8 mb-6 flex flex-col items-center">
                            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-blue-600 text-6xl">check_circle</span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mt-2">Setoran Berhasil</h2>
                            <p className="text-sm text-gray-500 mt-1">#{transactionId}</p>
                        </div>

                        <div className="w-full bg-white rounded-xl p-6 space-y-5 border border-gray-200">
                            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Jumlah Setoran</span>
                                <span className="text-lg font-bold text-gray-900">{formatCurrency(amount)}</span>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <span className="text-sm text-gray-500 w-1/3">Status</span>
                                    <span className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-1 rounded text-right">{status}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Waktu</span>
                                    <span className="text-sm font-medium text-gray-900">{time}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Nama Admin</span>
                                    <span className="text-sm font-medium text-gray-900">{adminName}</span>
                                </div>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-4 mt-4">
                                <div className="flex items-start space-x-3">
                                    <span className="material-symbols-outlined text-blue-600 text-lg mt-0.5">info</span>
                                    <div className="text-xs text-gray-700 leading-relaxed">
                                        {note}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-grow"></div>

                        <div className="w-full mt-8 mb-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                            >
                                Tutup
                            </button>
                        </div>
                    </main>
                </div>
            </div>
        )
    }

    // Layout for COD Limit Warning (code5.html)
    if (notification.subtype === 'limit' && notification.details) {
        const { amount, limit, description, action } = notification.details
        return (
            <div className="font-display bg-background-light text-gray-800 min-h-screen flex flex-col antialiased">
                <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-background-light">
                    {/* Header */}
                    <header className="bg-white px-4 py-4 sticky top-0 z-50 border-b border-gray-200 flex items-center justify-between">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <span className="material-symbols-outlined text-gray-600">arrow_back</span>
                        </button>
                        <h1 className="text-lg font-bold text-center flex-grow pr-8">Detail Notifikasi</h1>
                        <div className="w-6"></div>
                    </header>

                    {/* Main Content */}
                    <main className="flex-grow flex flex-col items-center p-6 text-center">
                        <div className="mt-8 mb-6">
                            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                <span className="material-symbols-outlined text-blue-600 text-6xl">search</span>
                            </div>
                        </div>

                        <h2 className="text-xl font-bold text-gray-900 mb-2">Peringatan Batas Setoran</h2>
                        <p className="text-2xl font-bold text-red-600 mb-6">Saldo COD Anda: {formatCurrency(amount)}</p>

                        <div className="bg-white p-6 rounded-xl w-full border border-gray-200 text-left mb-6">
                            <p className="text-sm text-gray-600 leading-relaxed mb-4">
                                {description}
                            </p>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {action}
                            </p>
                        </div>

                        <div className="w-full mt-auto mb-6">
                            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined">search</span>
                                Tinjau
                            </button>
                        </div>
                    </main>
                </div>
            </div>
        )
    }

    // Default/Fallback Layout for other notification types
    return (
        <div className="font-display bg-background-light text-gray-800 min-h-screen flex flex-col antialiased">
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-background-light">
                {/* Header */}
                <header className="bg-white px-4 py-4 sticky top-0 z-50 border-b border-gray-200 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <span className="material-symbols-outlined text-gray-600">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-bold text-center flex-grow pr-8">Detail Notifikasi</h1>
                    <div className="w-6"></div>
                </header>

                {/* Main Content */}
                <main className="flex-grow p-6 flex flex-col items-center pt-10">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-blue-600 text-5xl">{notification.icon}</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{notification.title}</h2>
                    <p className="text-sm text-gray-500 mb-4">{notification.time}</p>
                    <div className="w-full bg-white rounded-xl p-6 border border-gray-200">
                        <p className="text-sm text-gray-700 leading-relaxed">{notification.message}</p>
                    </div>
                </main>
            </div>
        </div>
    )
}

// Helper functions for notification types
function getIconForType(type) {
    const icons = {
        order: 'receipt_long', promo: 'local_offer', system: 'system_update',
        driver: 'two_wheeler', merchant: 'store', info: 'info',
        success: 'check_circle', warning: 'warning', alert: 'gpp_bad',
        security: 'security', withdrawal: 'account_balance_wallet',
        deposit: 'savings', limit: 'payments', suspended: 'gpp_bad', account: 'security'
    }
    return icons[type] || 'notifications'
}

function getColorForType(type) {
    const colors = {
        order: 'blue', promo: 'orange', system: 'gray',
        driver: 'blue', merchant: 'green', info: 'blue',
        success: 'green', warning: 'orange', alert: 'red',
        security: 'red', withdrawal: 'green', deposit: 'blue',
        limit: 'orange', suspended: 'red', account: 'purple'
    }
    return colors[type] || 'gray'
}

export default DriverNotificationDetailPage
