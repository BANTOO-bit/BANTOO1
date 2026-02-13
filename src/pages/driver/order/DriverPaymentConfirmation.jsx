import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useOrder } from '../../../context/OrderContext'
import { useToast } from '../../../context/ToastContext'
import { handleError } from '../../../utils/errorHandler'
import PhotoPickerModal from '../../../components/shared/PhotoPickerModal'
import orderService from '../../../services/orderService'

function DriverPaymentConfirmation() {
    const navigate = useNavigate()
    const { orderId } = useParams()
    const { user } = useAuth()
    const { activeOrder, setActiveOrder, orders } = useOrder()
    const toast = useToast()

    // Protected route: redirect if no active order
    useEffect(() => {
        if (!activeOrder) {
            navigate('/driver/dashboard')
        }
    }, [activeOrder, navigate])

    if (!activeOrder) return null

    const [checks, setChecks] = useState({
        moneyReceived: false,
        noShortage: false
    })

    const [photo, setPhoto] = useState(null)
    const [showPhotoModal, setShowPhotoModal] = useState(false)
    const [isConfirming, setIsConfirming] = useState(false)
    const fileInputRef = useRef(null)
    const cameraInputRef = useRef(null)

    const handleCheck = (e) => {
        const { name, checked } = e.target
        setChecks(prev => ({ ...prev, [name]: checked }))
    }

    const canConfirm = checks.moneyReceived && checks.noShortage

    const handleConfirm = async () => {
        if (!canConfirm) return

        try {
            setIsConfirming(true)

            // Confirm COD payment & Complete Order via Driver Service
            // The RPC 'completed' status sets payment_status='paid' and delivered_at=NOW()
            const { driverService } = await import('../../../services/driverService')
            await driverService.updateOrderStatus(activeOrder.dbId, 'completed')

            // Update context
            setActiveOrder({ ...activeOrder, status: 'completed', proofPhoto: photo })

            // Navigate to completion
            navigate('/driver/order/complete')
        } catch (error) {
            console.error('Error confirming payment:', error)
            handleError(error, toast, { context: 'Confirm Payment' })
        } finally {
            setIsConfirming(false)
        }
    }

    const handleFileSelect = (e) => {
        const file = e.target.files[0]
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setPhoto(reader.result)
                setShowPhotoModal(false)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleTakePhoto = () => {
        cameraInputRef.current?.click()
    }

    const handleChooseGallery = () => {
        fileInputRef.current?.click()
    }

    const handleDeletePhoto = () => {
        setPhoto(null)
        setShowPhotoModal(false)
    }

    return (
        <div className="font-display bg-background-light text-slate-900 antialiased min-h-screen relative flex flex-col overflow-x-hidden max-w-md mx-auto bg-white border-x border-slate-200">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="rounded-full p-2 hover:bg-slate-100 transition-colors">
                            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 leading-none">Konfirmasi Bayar</h1>
                            <span className="text-xs font-semibold text-slate-500">Order ID #{activeOrder.id.split('-')[2]}</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center justify-center rounded-full size-10 bg-slate-100 text-slate-900 hover:bg-slate-200 transition-colors">
                            <span className="material-symbols-outlined text-[24px]">help</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col pb-24 bg-background-light px-4 pt-4">
                {/* Customer Info */}
                <div className="flex gap-3 mb-4 items-center">
                    <div className="bg-blue-50 text-blue-600 rounded-full size-10 shrink-0 flex items-center justify-center border border-blue-100">
                        <span className="material-symbols-outlined text-[20px]">person</span>
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-900">{activeOrder.customerName}</h2>
                        <p className="text-xs text-slate-500 truncate max-w-[200px]">{activeOrder.customerAddress}</p>
                    </div>
                </div>

                {/* COD Amount Card */}
                <div className="bg-red-50 border-2 border-dashed border-red-300 rounded-xl p-4 text-center mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                        <span className="material-symbols-outlined text-[80px] text-red-600">payments</span>
                    </div>
                    <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1 relative z-10">Total COD</p>
                    <h3 className="text-4xl font-extrabold text-slate-900 mb-1 relative z-10">
                        <span className="text-xl font-bold text-slate-500 align-top mr-1">Rp</span>{activeOrder.totalAmount.toLocaleString('id-ID')}
                    </h3>
                    <p className="text-[10px] text-red-600/80 mt-1 font-medium relative z-10 bg-red-100 inline-block px-2 py-0.5 rounded-full">
                        Wajib Terima Tunai
                    </p>
                </div>

                {/* Verification Checkboxes */}
                <div className="mb-6">
                    <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-600 text-lg">verified_user</span>
                        Verifikasi Pembayaran
                    </h4>
                    <div className="flex flex-col gap-2.5">
                        <label className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-green-500 transition-colors group">
                            <input
                                name="moneyReceived"
                                checked={checks.moneyReceived}
                                onChange={handleCheck}
                                className="w-5 h-5 rounded border-slate-300 text-green-600 focus:ring-green-500 mt-0.5 shrink-0"
                                type="checkbox"
                            />
                            <div className="flex flex-col">
                                <span className="font-bold text-slate-800 text-base group-hover:text-green-700">Uang diterima sesuai nominal</span>
                                <span className="text-xs text-slate-500">Pastikan jumlah uang pas Rp {activeOrder.totalAmount.toLocaleString('id-ID')}</span>
                            </div>
                        </label>
                        <label className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-green-500 transition-colors group">
                            <input
                                name="noShortage"
                                checked={checks.noShortage}
                                onChange={handleCheck}
                                className="w-5 h-5 rounded border-slate-300 text-green-600 focus:ring-green-500 mt-0.5 shrink-0"
                                type="checkbox"
                            />
                            <div className="flex flex-col">
                                <span className="font-bold text-slate-800 text-base group-hover:text-green-700">Tidak ada kekurangan</span>
                                <span className="text-xs text-slate-500">Saya bertanggung jawab atas setoran ini</span>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Photo Upload */}
                <div className="mb-4">
                    <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center justify-between">
                        <span>Foto Bukti Pembayaran</span>
                        <span className="text-[10px] font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Opsional</span>
                    </h4>

                    {!photo ? (
                        <button
                            onClick={() => setShowPhotoModal(true)}
                            type="button"
                            className="w-full h-24 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors group"
                        >
                            <div className="bg-white p-2 rounded-full border border-slate-200 mb-1 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-slate-400 text-2xl">add_a_photo</span>
                            </div>
                            <span className="text-xs font-medium text-slate-500">Ketuk untuk ambil foto uang</span>
                        </button>
                    ) : (
                        <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-green-200 bg-slate-50">
                            <img src={photo} alt="Bukti pembayaran" className="w-full h-full object-cover" />
                            <div className="absolute top-2 right-2 flex gap-2">
                                <button
                                    onClick={() => setShowPhotoModal(true)}
                                    className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                                >
                                    <span className="material-symbols-outlined text-blue-600 text-[20px]">edit</span>
                                </button>
                                <button
                                    onClick={handleDeletePhoto}
                                    className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                                >
                                    <span className="material-symbols-outlined text-red-600 text-[20px]">delete</span>
                                </button>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                <p className="text-white text-xs font-medium flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                    Foto berhasil diupload
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Hidden file inputs */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </div>
            </main>

            {/* Bottom Action */}
            <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 p-4 max-w-md mx-auto bg-gradient-to-t from-white via-white to-transparent pb-2">
                <button
                    onClick={handleConfirm}
                    disabled={!canConfirm || isConfirming}
                    className="w-full bg-green-600 hover:bg-green-700 active:scale-[0.98] transition-all text-white font-bold text-xl h-14 rounded-xl flex items-center justify-center gap-2 mb-2 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed"
                >
                    <span className="material-symbols-outlined text-[28px]">{isConfirming ? 'refresh' : 'check_circle'}</span>
                    {isConfirming ? 'MEMPROSES...' : 'KONFIRMASI PEMBAYARAN'}
                </button>
            </div>

            {/* Photo Picker Modal */}
            <PhotoPickerModal
                isOpen={showPhotoModal}
                onClose={() => setShowPhotoModal(false)}
                onTakePhoto={handleTakePhoto}
                onChooseGallery={handleChooseGallery}
                onDeletePhoto={photo ? handleDeletePhoto : null}
            />

            <DriverBottomNavigation activeTab="orders" />
        </div>
    )
}

export default DriverPaymentConfirmation
