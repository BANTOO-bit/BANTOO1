import { useNavigate } from 'react-router-dom'

function DriverVehiclePage() {
    const navigate = useNavigate()

    // Mock Data
    const vehicle = {
        plate: 'B 1234 XYZ',
        brand: 'Honda',
        model: 'Vario 150',
        year: '2022',
        type: 'Motor',
        stnk: {
            number: '12345678',
            expiry: '12/27',
            status: 'valid'
        },
        sim: {
            number: '9876543210',
            expiry: '05/28',
            status: 'valid'
        }
    }

    return (
        <div className="font-display bg-background-light text-slate-900 antialiased min-h-screen">
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl bg-white">
                {/* Header */}
                <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
                    <div className="flex items-center px-4 h-[64px] gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full text-slate-700 hover:bg-slate-50 transition-colors active:scale-95"
                        >
                            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                        </button>
                        <h2 className="text-slate-900 text-lg font-bold leading-tight flex-1">Detail Kendaraan</h2>
                    </div>
                </header>

                <main className="flex-1 p-4 pb-12 flex flex-col gap-6">
                    {/* Vehicle Card */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <span className="material-symbols-outlined text-[100px]">two_wheeler</span>
                        </div>
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-[#0d59f2] mb-3 ring-4 ring-white shadow-sm">
                                <span className="material-symbols-outlined text-[40px]">two_wheeler</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">{vehicle.brand} {vehicle.model}</h3>
                            <div className="bg-slate-900 text-white px-3 py-1 rounded-lg font-mono font-bold text-sm tracking-wider mt-2 shadow-sm">
                                {vehicle.plate}
                            </div>
                            <p className="text-slate-500 text-xs font-medium mt-2">Tahun {vehicle.year} • {vehicle.type}</p>
                        </div>
                    </div>

                    {/* Documents */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 mb-3 ml-1">Dokumen Kendaraan</h3>
                        <div className="flex flex-col gap-3">
                            {/* STNK */}
                            <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
                                        <span className="material-symbols-outlined">description</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">STNK</p>
                                        <p className="text-xs text-slate-500">Berlaku sampai {vehicle.stnk.expiry}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-green-50 text-green-600 border border-green-100 rounded text-[10px] font-bold uppercase">Aktif</span>
                                    <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                                </div>
                            </div>

                            {/* SIM */}
                            <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
                                        <span className="material-symbols-outlined">badge</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">SIM C</p>
                                        <p className="text-xs text-slate-500">Berlaku sampai {vehicle.sim.expiry}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-green-50 text-green-600 border border-green-100 rounded text-[10px] font-bold uppercase">Aktif</span>
                                    <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Warning */}
                    <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 flex gap-3">
                        <span className="material-symbols-outlined text-yellow-600 shrink-0">info</span>
                        <div>
                            <p className="text-xs font-bold text-yellow-800 mb-1">Perubahan Data Kendaraan</p>
                            <p className="text-[11px] text-yellow-700 leading-relaxed">
                                Untuk mengubah data kendaraan atau plat nomor, silakan hubungi layanan pelanggan atau datang ke kantor operasional terdekat dengan membawa dokumen asli.
                            </p>
                        </div>
                    </div>

                    <button className="mt-4 w-full bg-white border border-slate-200 text-slate-700 font-bold py-3.5 rounded-xl text-sm transition-all active:scale-95 shadow-sm hover:bg-slate-50">
                        Hubungi Bantuan
                    </button>
                </main>
            </div>
        </div>
    )
}

export default DriverVehiclePage
