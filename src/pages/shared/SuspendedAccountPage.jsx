import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import driverService from '../../services/driverService'

function SuspendedAccountPage() {
    const navigate = useNavigate()
    const { logout, user } = useAuth()
    const [codFeeData, setCodFeeData] = useState(null)
    const [loading, setLoading] = useState(true)

    const isDriver = user?.activeRole === 'driver' || user?.driverStatus === 'suspended'

    // Check if suspension is due to COD admin fee
    useEffect(() => {
        async function checkCodFee() {
            if (!isDriver || !user?.id) {
                setLoading(false)
                return
            }
            try {
                const feeData = await driverService.getCodAdminFeeBalance(user.id)
                if (feeData.isOverLimit) {
                    setCodFeeData(feeData)
                }
            } catch {
                // Ignore error
            } finally {
                setLoading(false)
            }
        }
        checkCodFee()
    }, [isDriver, user?.id])

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    const handleContactAdmin = () => {
        window.open('mailto:support@bantoo.app?subject=Akun Disuspend - ' + (user?.phone || ''), '_blank')
    }

    const isCodSuspend = codFeeData && codFeeData.isOverLimit

    if (loading) {
        return (
            <div className="min-h-screen bg-background-light flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background-light flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                {/* Icon */}
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${isCodSuspend ? 'bg-orange-100' : 'bg-red-100'}`}>
                    <span className={`material-symbols-rounded text-5xl ${isCodSuspend ? 'text-orange-500' : 'text-red-500'}`}>
                        {isCodSuspend ? 'payments' : 'block'}
                    </span>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-text-primary mb-2">
                    {isCodSuspend ? 'Setor Fee COD' : 'Akun Disuspend'}
                </h1>

                {/* Description */}
                <p className="text-text-secondary text-sm mb-2">
                    {isCodSuspend
                        ? 'Akun Anda ditangguhkan karena saldo fee ongkir COD melebihi batas.'
                        : 'Akun Anda telah ditangguhkan sementara oleh admin.'
                    }
                </p>

                {isCodSuspend ? (
                    <>
                        {/* COD Fee Details */}
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 mb-6 text-left">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="material-symbols-rounded text-orange-500">receipt_long</span>
                                <p className="text-sm font-bold text-orange-800">Detail Tagihan</p>
                            </div>
                            <div className="space-y-2 mb-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-orange-700">Total fee terkumpul</span>
                                    <span className="font-bold text-orange-800">Rp {codFeeData.totalOwed.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-orange-700">Sudah disetor</span>
                                    <span className="font-bold text-green-600">Rp {codFeeData.depositsMade.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="border-t border-orange-200 pt-2 flex justify-between text-sm">
                                    <span className="font-bold text-orange-800">Sisa yang harus disetor</span>
                                    <span className="font-black text-red-600 text-lg">Rp {codFeeData.balance.toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                            {/* Progress bar */}
                            <div className="w-full h-2.5 rounded-full bg-orange-100">
                                <div className="h-full rounded-full bg-red-500" style={{ width: `${Math.min(100, codFeeData.percentage)}%` }} />
                            </div>
                            <p className="text-[10px] text-orange-500 mt-1 text-right">{codFeeData.percentage}% dari batas Rp {codFeeData.limit.toLocaleString('id-ID')}</p>
                        </div>

                        {/* Info */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left">
                            <div className="flex items-start gap-2">
                                <span className="material-symbols-rounded text-blue-500 text-lg mt-0.5">info</span>
                                <p className="text-xs text-blue-700">
                                    Setelah Anda menyelesaikan penyetoran, akun akan diaktifkan kembali oleh admin. Proses verifikasi maksimal 1x24 jam.
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => navigate('/driver/deposit', { state: { amount: codFeeData.balance } })}
                                className="w-full bg-orange-500 text-white font-semibold py-3.5 rounded-xl hover:bg-orange-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-rounded text-xl">payments</span>
                                Setor Fee COD — Rp {codFeeData.balance.toLocaleString('id-ID')}
                            </button>
                            <button
                                onClick={handleContactAdmin}
                                className="w-full bg-white border border-gray-200 text-text-secondary font-semibold py-3 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-rounded text-xl">support_agent</span>
                                Hubungi Admin
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Generic suspension - Reason Box */}
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-left">
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-rounded text-red-500 text-xl mt-0.5">info</span>
                                <div>
                                    <p className="text-sm font-semibold text-red-800 mb-1">Kemungkinan Alasan:</p>
                                    <ul className="text-xs text-red-700 space-y-1">
                                        <li>• Pelanggaran ketentuan layanan</li>
                                        <li>• Aktivitas mencurigakan terdeteksi</li>
                                        <li>• Keluhan dari pengguna lain</li>
                                        <li>• Verifikasi dokumen diperlukan</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-left">
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-rounded text-amber-600 text-xl mt-0.5">help</span>
                                <div>
                                    <p className="text-sm font-semibold text-amber-800 mb-1">Apa yang bisa dilakukan?</p>
                                    <p className="text-xs text-amber-700">
                                        Hubungi tim support kami untuk informasi lebih lanjut dan proses pemulihan akun.
                                        Kami akan meninjau kembali akun Anda dalam 1-3 hari kerja.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleContactAdmin}
                                className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-rounded text-xl">mail</span>
                                Hubungi Admin
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full bg-white border border-gray-200 text-text-secondary font-semibold py-3 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-rounded text-xl">logout</span>
                                Keluar
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default SuspendedAccountPage
