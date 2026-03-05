import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import paymentService from '@/services/paymentService'
import { useToast } from '@/context/ToastContext'

function PaymentSimulationPage() {
    const { orderId } = useParams()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const toast = useToast()

    const method = searchParams.get('method') || 'digital'
    const amount = parseInt(searchParams.get('amount')) || 0

    const [isProcessing, setIsProcessing] = useState(false)
    const [timeLeft, setTimeLeft] = useState(900) // 15 minutes

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => (prev > 0 ? prev - 1 : 0))
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0')
        const s = (seconds % 60).toString().padStart(2, '0')
        return `${m}:${s}`
    }

    const methodNames = {
        gopay: 'GoPay',
        ovo: 'OVO',
        dana: 'DANA'
    }

    const methodName = methodNames[method] || method.toUpperCase()

    const handlePaySimulation = async () => {
        setIsProcessing(true)
        try {
            // Simulate webhook hitting our database
            await paymentService.simulateWebhookUpdate(orderId)

            // Redirect to success page
            navigate('/order-success', { state: { orderId: orderId, paid: true }, replace: true })
        } catch (error) {
            toast.error('Gagal memproses simulasi pembayaran')
            setIsProcessing(false)
        }
    }

    const handleCancel = () => {
        // Technically it should cancel the order or return to home
        navigate('/', { replace: true })
    }

    return (
        <div className="min-h-screen flex flex-col items-center bg-gray-50 pt-10 px-4 font-display">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">

                {/* Header */}
                <div className="bg-primary p-6 text-white text-center rounded-b-3xl relative shadow-md">
                    <button
                        onClick={handleCancel}
                        className="absolute left-4 top-4 p-2 pl-0 flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                        <span className="text-xs font-semibold">Tutup</span>
                    </button>
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 mt-4">
                        <span className="material-symbols-outlined text-3xl">qr_code_scanner</span>
                    </div>
                    <h1 className="text-xl font-black mb-1">Simulasi Pembayaran</h1>
                    <p className="text-sm opacity-90 font-medium">Bantoo App Testing Environment</p>
                </div>

                {/* Details */}
                <div className="p-8 pb-4 flex flex-col items-center">
                    <p className="text-sm text-text-secondary font-medium mb-1">Selesaikan pembayaran dalam</p>
                    <div className="text-2xl font-black text-red-500 mb-6 font-mono bg-red-50 px-4 py-2 border border-red-100 rounded-xl shadow-sm">
                        {formatTime(timeLeft)}
                    </div>

                    <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-8 shadow-inner">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Metode</span>
                            <span className="text-sm font-black bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm text-text-main">{methodName}</span>
                        </div>
                        <div className="w-full h-px bg-slate-200 mb-4 divider" />
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Order ID</span>
                            <span className="text-sm font-bold font-mono text-slate-700">#{orderId.substring(0, 8)}</span>
                        </div>
                        <div className="w-full h-px bg-slate-200 mb-4 divider" />
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Total Harga</span>
                            <span className="text-lg font-black text-primary drop-shadow-sm">Rp {amount.toLocaleString('id-ID')}</span>
                        </div>
                    </div>

                    <div className="w-full bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl mb-8 flex gap-3 text-left">
                        <span className="material-symbols-outlined text-blue-500 shrink-0">info</span>
                        <p className="text-xs text-blue-800 leading-relaxed font-medium">
                            Ini adalah halaman <strong className="font-extrabold">Simulasi Payment Gateway (Mock)</strong>. Dalam produksi, layar ini akan diganti dengan <em>Snap Interface Midtrans</em> atau <em>Checkout Xendit</em>.
                        </p>
                    </div>

                    <button
                        onClick={handlePaySimulation}
                        disabled={isProcessing}
                        className={`w-full py-4 text-sm font-black text-white rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 active:scale-95 transition-all ${isProcessing ? 'bg-gray-400 border-gray-500 cursor-not-allowed' : 'bg-[#1bc459] hover:bg-[#16a34a] border border-[#16a34a]'
                            }`}
                    >
                        {isProcessing ? (
                            <>
                                <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                                Memproses Pembayaran...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[20px]">task_alt</span>
                                Sukseskan Pembayaran (Simulasi)
                            </>
                        )}
                    </button>
                </div>
            </div>
            <div className="mt-8 text-center text-xs font-bold text-gray-400">
                <p>MOCKED SECURE PAYMENT PROCESS</p>
            </div>
        </div>
    )
}

export default PaymentSimulationPage
