import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import driverService from '@/services/driverService'
import { formatId } from '@/utils/formatters'

function DriverTransactionDetail() {
    const navigate = useNavigate()
    const { id } = useParams()
    const [transaction, setTransaction] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        async function fetchTransaction() {
            if (!id) return
            try {
                const data = await driverService.getTransactionDetail(id)

                if (data) {
                    const isCOD = data.payment_method === 'cod'
                    const adminFee = data.service_fee || 0
                    const driverNet = (data.delivery_fee || 0) - adminFee

                    setTransaction({
                        id: data.id,
                        displayId: formatId(data.id),
                        time: data.delivered_at
                            ? new Date(data.delivered_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
                            : '-',
                        status: data.payment_status === 'paid' ? 'LUNAS' : 'PENDING',
                        method: isCOD ? 'Tunai (COD)' : 'Non-Tunai',
                        merchant: data.merchant?.name || '-',
                        customer: {
                            name: data.customer?.full_name || '-',
                            address: data.customer?.address || '-'
                        },
                        financial: {
                            totalCOD: isCOD ? data.total_amount : 0,
                            adminFee: adminFee,
                            driverNet: driverNet
                        },
                        proofTime: data.delivered_at
                            ? new Date(data.delivered_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
                            : '-'
                    })
                }
            } catch (err) {
                if (import.meta.env.DEV) console.error('Failed to fetch transaction:', err)
                setError('Gagal memuat detail transaksi')
            } finally {
                setLoading(false)
            }
        }
        fetchTransaction()
    }, [id])

    if (loading) {
        return (
            <div className="font-display bg-background-light text-slate-900 antialiased min-h-screen">
                <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl bg-white">
                    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
                        <div className="flex items-center px-4 justify-between h-[72px]">
                            <button onClick={() => navigate(-1)} className="flex items-center justify-center w-10 h-10 rounded-full text-slate-900 hover:bg-slate-50 transition-colors -ml-2 active:scale-95">
                                <span className="material-symbols-outlined">arrow_back</span>
                            </button>
                            <h2 className="text-slate-900 text-lg font-bold leading-tight">Detail Transaksi</h2>
                            <div className="w-8"></div>
                        </div>
                    </header>
                    <main className="flex-1 p-4 flex flex-col gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse">
                                <div className="h-4 bg-slate-200 rounded w-1/3 mb-3"></div>
                                <div className="h-6 bg-slate-200 rounded w-2/3"></div>
                            </div>
                        ))}
                    </main>
                </div>
            </div>
        )
    }

    if (error || !transaction) {
        return (
            <div className="font-display bg-background-light text-slate-900 antialiased min-h-screen">
                <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl bg-white items-center justify-center p-8 text-center">
                    <span className="material-symbols-outlined text-slate-300 text-6xl mb-4">error_outline</span>
                    <p className="text-slate-500 font-medium mb-4">{error || 'Transaksi tidak ditemukan'}</p>
                    <button onClick={() => navigate(-1)} className="px-6 py-2.5 bg-[#0d59f2] text-white font-bold rounded-xl">Kembali</button>
                </div>
            </div>
        )
    }

    return (
        <div className="font-display bg-background-light text-slate-900 antialiased min-h-screen">
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl bg-white">
                {/* Header */}
                <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
                    <div className="flex items-center px-4 justify-between h-[72px]">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center justify-center w-10 h-10 rounded-full text-slate-900 hover:bg-slate-50 transition-colors -ml-2 active:scale-95"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <h2 className="text-slate-900 text-lg font-bold leading-tight">Detail Transaksi</h2>
                        <div className="w-8"></div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 p-4 pb-bottom-nav bg-background-light flex flex-col gap-4">
                    {/* Status Card */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-500 text-[10px] font-medium mb-1 uppercase tracking-wider">ID Pesanan</p>
                                <h3 className="text-slate-900 text-lg font-bold">#{transaction.displayId}</h3>
                            </div>
                            <div className="text-right">
                                <p className="text-slate-500 text-[10px] font-medium mb-1 uppercase tracking-wider">Waktu Selesai</p>
                                <p className="text-slate-900 font-bold text-sm">{transaction.time}</p>
                            </div>
                        </div>
                        <div className="h-px w-full bg-slate-100"></div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-slate-500">Status Pembayaran</span>
                            <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold border border-green-100 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px] filled">check_circle</span>
                                {transaction.status}
                            </span>
                        </div>
                        <div className="h-px w-full bg-slate-100"></div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-slate-500">Metode Pembayaran</span>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px] text-slate-500">payments</span>
                                <span className="text-sm font-bold text-slate-900">{transaction.method}</span>
                            </div>
                        </div>
                    </div>

                    {/* Route Card */}
                    <div className="bg-white rounded-2xl px-4 pt-4 shadow-sm border border-slate-100">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Rute Pengiriman</h4>
                        <div className="relative pl-2">
                            <div className="absolute left-[11px] top-3 bottom-8 w-0.5 bg-slate-100 border-l border-dashed border-slate-300"></div>
                            <div className="relative flex gap-4 mb-6">
                                <div className="relative z-10 flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 border-2 border-white shadow-sm flex items-center justify-center">
                                    <div className="w-2.5 h-2.5 bg-[#0d59f2] rounded-full"></div>
                                </div>
                                <div className="flex-1 -mt-1">
                                    <p className="text-[10px] text-slate-500 font-medium mb-0.5">Pengambilan</p>
                                    <p className="text-slate-900 font-bold text-sm">{transaction.merchant}</p>
                                </div>
                            </div>
                            <div className="relative flex gap-4">
                                <div className="relative z-10 flex-shrink-0 w-6 h-6 rounded-full bg-red-50 border-2 border-white shadow-sm flex items-center justify-center">
                                    <span className="material-symbols-outlined text-red-500 text-[14px] filled">location_on</span>
                                </div>
                                <div className="flex-1 -mt-1">
                                    <p className="text-[10px] text-slate-500 font-medium mb-0.5">Tujuan</p>
                                    <p className="text-slate-900 font-bold text-sm">{transaction.customer.name}</p>
                                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">{transaction.customer.address}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Financial Details */}
                    <div className="bg-white rounded-2xl px-4 pt-4 shadow-sm border border-slate-100">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Rincian Pembayaran</h4>

                        {transaction.financial.totalCOD > 0 && (
                            <div className="bg-red-50 rounded-xl p-4 border border-red-100 mb-4">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-red-800 text-xs font-bold">Total COD Ditagih</span>
                                    <span className="material-symbols-outlined text-red-400 text-[20px]">payments</span>
                                </div>
                                <p className="text-red-500 text-3xl font-extrabold tracking-tight">Rp {transaction.financial.totalCOD.toLocaleString('id-ID')}</p>
                                <p className="text-red-400 text-[10px] mt-1 font-medium">Uang tunai wajib diterima dari pelanggan</p>
                            </div>
                        )}

                        <div className="space-y-3 pt-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-medium">Biaya Platform (Fee Admin)</span>
                                <span className="text-slate-900 font-semibold">-Rp {transaction.financial.adminFee.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="h-px w-full bg-slate-100 border-t border-dashed border-slate-200"></div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-medium">Pendapatan Bersih Driver</span>
                                <span className="text-green-600 font-bold text-lg">Rp {transaction.financial.driverNet.toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-2">
                        <button onClick={() => navigate('/driver/help')} className="w-full bg-white border border-slate-200 text-slate-700 font-bold py-3.5 rounded-xl text-sm transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900">
                            <span className="material-symbols-outlined text-[20px]">support_agent</span>
                            Hubungi Bantuan
                        </button>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default DriverTransactionDetail
