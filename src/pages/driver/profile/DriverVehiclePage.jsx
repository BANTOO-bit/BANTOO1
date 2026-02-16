import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import driverService from '../../../services/driverService'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'

function DriverVehiclePage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const toast = useToast()
    const [isLoading, setIsLoading] = useState(true)
    const [vehicle, setVehicle] = useState(null)

    useEffect(() => {
        async function loadVehicle() {
            if (!user?.id) return
            try {
                const profile = await driverService.getProfile()
                setVehicle({
                    plate: profile.vehicle_plate || '-',
                    brand: profile.vehicle_brand || '-',
                    type: profile.vehicle_type || 'motor',
                    photoUrl: profile.vehicle_photo_url
                })
            } catch (error) {
                console.error('Error loading vehicle:', error)
                toast.error('Gagal memuat data kendaraan')
            } finally {
                setIsLoading(false)
            }
        }
        loadVehicle()
    }, [user, toast])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    const v = vehicle || {
        plate: '-', brand: '-', type: 'motor'
    }

    return (
        <div className="font-display bg-background-light text-slate-900 antialiased min-h-screen">
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl bg-white">
                {/* Header */}
                <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
                    <div className="flex items-center px-4 h-[64px] gap-4">
                        <button
                            onClick={() => navigate('/driver/account')}
                            className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full text-slate-700 hover:bg-slate-50 transition-colors active:scale-95"
                        >
                            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                        </button>
                        <h2 className="text-slate-900 text-lg font-bold leading-tight flex-1">Detail Kendaraan</h2>
                    </div>
                </header>

                <main className="flex-1 p-6 flex flex-col gap-8">
                    {/* Vehicle Card */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl md:rounded-3xl shadow-lg transform rotate-1 opacity-20"></div>
                        <div className="relative bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden">
                            {/* Vehicle Photo (if available) */}
                            {v.photoUrl && (
                                <div className="w-full h-48 bg-gray-100">
                                    <img src={v.photoUrl} alt="Vehicle" className="w-full h-full object-cover" />
                                </div>
                            )}

                            {/* Card Header: Icon & Status */}
                            <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-slate-500 font-medium text-sm capitalize">
                                    <span className="material-symbols-outlined text-[20px]">
                                        {v.type === 'car' ? 'directions_car' : 'two_wheeler'}
                                    </span>
                                    {v.type}
                                </div>
                                <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-100">
                                    <span className="material-symbols-outlined text-[16px]">verified</span>
                                    <span className="text-[10px] font-bold uppercase tracking-wide">Terverifikasi</span>
                                </div>
                            </div>

                            {/* Card Body: Info */}
                            <div className="p-6 flex flex-col items-center text-center">
                                {/* Brand Name */}
                                <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Kendaraan Utama</h3>
                                <p className="text-2xl font-bold text-slate-900 mb-6">{v.brand}</p>

                                {/* License Plate */}
                                <div className="bg-slate-900 text-white px-6 py-3 rounded-lg border-4 border-slate-800 shadow-md">
                                    <span className="font-mono text-2xl font-bold tracking-widest">{v.plate}</span>
                                </div>

                                <p className="text-[10px] text-slate-400 mt-2">Plat Nomor Terdaftar</p>
                            </div>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="flex gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                            <span className="material-symbols-outlined">security</span>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-blue-900 mb-1">Data Terjamin Aman</h4>
                            <p className="text-xs text-blue-700 leading-relaxed">
                                Dokumen kendaraan Anda (STNK & Foto Fisik) tersimpan aman di sistem kami untuk keperluan verifikasi dan asuransi perjalanan.
                            </p>
                        </div>
                    </div>

                    {/* Change Request */}
                    <div className="mt-auto">
                        <div className="text-center mb-4">
                            <p className="text-xs text-slate-400">Ingin mengganti kendaraan?</p>
                        </div>
                        <button className="w-full bg-white border border-slate-200 text-slate-700 font-bold py-3.5 rounded-xl text-sm transition-all active:scale-95 shadow-sm hover:bg-slate-50 flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined">headset_mic</span>
                            Hubungi Layanan Pelanggan
                        </button>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default DriverVehiclePage
