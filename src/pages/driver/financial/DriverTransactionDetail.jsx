import { useNavigate, useParams } from 'react-router-dom'

function DriverTransactionDetail() {
    const navigate = useNavigate()
    const { id } = useParams()

    // Mock data based on ID (In real app, fetch from API)
    const transaction = {
        id: id || 'ORD-12345',
        time: '14:30 WIB',
        status: 'LUNAS',
        method: 'Tunai (COD)',
        merchant: 'Warung Nasi Campur Bu Agus',
        customer: {
            name: 'Bpk. Budi Santoso',
            address: 'Jl. Melati Indah No. 45, RT 02/RW 05, Kel. Sukamaju, Kec. Cilodong, Depok.'
        },
        financial: {
            totalCOD: 75000,
            adminFee: 800,
            driverNet: 7200
        },
        proofTime: '14:31 WIB'
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
                <main className="flex-1 p-4 pb-24 bg-background-light flex flex-col gap-4">
                    {/* Status Card */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-500 text-[10px] font-medium mb-1 uppercase tracking-wider">ID Pesanan</p>
                                <h3 className="text-slate-900 text-lg font-bold">#{transaction.id}</h3>
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
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Rute Pengiriman</h4>
                        <div className="relative pl-2">
                            <div className="absolute left-[11px] top-3 bottom-8 w-0.5 bg-slate-100 border-l border-dashed border-slate-300"></div>

                            {/* Cleanup / Pickup */}
                            <div className="relative flex gap-4 mb-6">
                                <div className="relative z-10 flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 border-2 border-white shadow-sm flex items-center justify-center">
                                    <div className="w-2.5 h-2.5 bg-[#0d59f2] rounded-full"></div>
                                </div>
                                <div className="flex-1 -mt-1">
                                    <p className="text-[10px] text-slate-500 font-medium mb-0.5">Pengambilan</p>
                                    <p className="text-slate-900 font-bold text-sm">{transaction.merchant}</p>
                                </div>
                            </div>

                            {/* Destination */}
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
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Rincian Pembayaran</h4>

                        {/* COD Warning/Info Card */}
                        <div className="bg-red-50 rounded-xl p-4 border border-red-100 mb-4">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-red-800 text-xs font-bold">Total COD Ditagih</span>
                                <span className="material-symbols-outlined text-red-400 text-[20px]">payments</span>
                            </div>
                            <p className="text-red-500 text-3xl font-extrabold tracking-tight">Rp {transaction.financial.totalCOD.toLocaleString('id-ID')}</p>
                            <p className="text-red-400 text-[10px] mt-1 font-medium">Uang tunai wajib diterima dari pelanggan</p>
                        </div>

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

                    {/* Proof of Payment */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bukti Pembayaran</h4>
                            <span className="text-[10px] text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded-full">{transaction.proofTime}</span>
                        </div>
                        <div className="relative w-full aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200 group cursor-pointer">
                            <div className="absolute inset-0 bg-slate-100 flex flex-col items-center justify-center text-slate-400 gap-2">
                                <span className="material-symbols-outlined text-4xl text-slate-300">image</span>
                                <span className="text-xs font-medium">Foto Bukti Transaksi</span>
                            </div>
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                        </div>
                    </div>

                    <div className="mt-2">
                        <button className="w-full bg-white border border-slate-200 text-slate-700 font-bold py-3.5 rounded-xl text-sm transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900">
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
