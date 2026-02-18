import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DriverBottomNavigation from '../../components/driver/DriverBottomNavigation'
import EmptyState from '../../components/shared/EmptyState'
import BackToTopButton from '../../components/shared/BackToTopButton'
import { driverService } from '../../services/driverService'
import { useAuth } from '../../context/AuthContext'

function DriverOrdersPage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState('active') // 'active' | 'completed'
    const [activeOrders, setActiveOrders] = useState([])
    const [completedOrders, setCompletedOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user?.id) {
            fetchOrders()
        }
    }, [user?.id, activeTab])

    const fetchOrders = async () => {
        try {
            setLoading(true)
            if (activeTab === 'active') {
                // Fetch active orders (accepted, pickup, delivery)
                // Note: 'ready' orders are 'available', not 'active' for a specific driver until accepted
                // So we fetch orders assigned to this driver that are not completed/cancelled
                const orders = await driverService.getDriverOrders(['accepted', 'pickup', 'delivery'])

                // Transform to UI format
                const formatted = orders.map(o => ({
                    id: o.id,
                    merchantName: o.merchant?.name,
                    time: new Date(o.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                    status: getStatusLabel(o.status),
                    statusIcon: getStatusIcon(o.status),
                    totalCOD: o.payment_method === 'cod' ? o.total_amount : 0,
                    paymentMethod: o.payment_method === 'cod' ? 'COD' : 'Wallet',
                    statusKey: o.status
                }))
                setActiveOrders(formatted)
            } else {
                // Fetch completed orders
                const orders = await driverService.getDriverOrders('completed')
                const formatted = orders.map(o => ({
                    id: o.id,
                    merchantName: o.merchant?.name,
                    time: new Date(o.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                    status: 'Selesai',
                    statusIcon: 'check_circle',
                    totalCOD: o.payment_method === 'cod' ? o.total_amount : 0,
                    paymentMethod: o.payment_method === 'cod' ? 'COD' : 'Wallet',
                    statusKey: o.status
                }))
                setCompletedOrders(formatted)
            }
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error('Failed to fetch orders:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusLabel = (status) => {
        switch (status) {
            case 'accepted': return 'Menuju Warung'
            case 'pickup': return 'Antar ke Pelanggan'
            case 'delivery': return 'Sedang Mengantar'
            default: return status
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'accepted': return 'directions_bike'
            case 'pickup': return 'local_shipping'
            case 'delivery': return 'near_me'
            default: return 'help'
        }
    }

    return (
        <div className="font-display bg-background-light text-slate-900 antialiased min-h-screen">
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl bg-white">
                {/* Header */}
                <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-colors duration-300">
                    <div className="flex items-center p-4 justify-between">
                        <h1 className="text-xl font-bold text-slate-900">Riwayat Order</h1>
                        <div className="flex items-center justify-end">
                            <button
                                onClick={() => navigate('/driver/notifications')}
                                className="flex items-center justify-center rounded-full size-10 bg-slate-100 text-slate-900 hover:bg-slate-200 transition-colors relative"
                            >
                                <span className="material-symbols-outlined text-[24px]">notifications</span>
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex w-full border-b border-slate-200">
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`flex-1 py-3 text-sm font-bold relative ${activeTab === 'active' ? 'text-[#0d59f2]' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Aktif
                            {activeTab === 'active' && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0d59f2]" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('completed')}
                            className={`flex-1 py-3 text-sm font-medium relative group ${activeTab === 'completed' ? 'text-[#0d59f2]' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Selesai
                            {activeTab === 'completed' && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0d59f2]" />
                            )}
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 bg-background-light px-4 py-4 pb-24">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-8 h-8 border-4 border-slate-200 border-t-[#0d59f2] rounded-full animate-spin mb-4"></div>
                            <p className="text-slate-500 text-sm font-medium">Memuat pesanan...</p>
                        </div>
                    ) : activeTab === 'active' ? (
                        activeOrders.length > 0 ? (
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Sedang Berjalan</h2>
                                    <span className="text-xs font-medium text-slate-400">{activeOrders.length} Order</span>
                                </div>

                                {activeOrders.map((order) => (
                                    <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3">
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-400 mb-1">#{order.id.slice(0, 8)}</span>
                                                <h3 className="text-base font-bold text-slate-900">{order.merchantName}</h3>
                                                <p className="text-xs text-slate-500 mt-0.5">{order.time}</p>
                                            </div>
                                            <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border border-yellow-100">
                                                <span className="material-symbols-outlined text-[14px]">{order.statusIcon}</span>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="h-px w-full bg-slate-100" />
                                        <div className="flex justify-between items-center">
                                            <div className="flex flex-col gap-1">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Total COD</p>
                                                <p className="text-lg font-bold text-red-600">Rp {order.totalCOD.toLocaleString('id-ID')}</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    // Navigate based on order status (unified routes)
                                                    if (order.statusKey === 'accepted' || order.statusKey === 'Menuju Warung') {
                                                        navigate('/driver/order/pickup')
                                                    } else if (order.statusKey === 'pickup' || order.statusKey === 'delivery' || order.statusKey === 'Antar ke Pelanggan') {
                                                        navigate('/driver/order/delivery')
                                                    }
                                                }}
                                                className="flex items-center justify-center gap-2 bg-[#0d59f2] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
                                            >
                                                Detail Tugas
                                                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon="directions_bike"
                                title="Tidak ada order aktif"
                                message="Pesanan yang Anda ambil akan muncul di sini."
                            />
                        )
                    ) : (
                        completedOrders.length > 0 ? (
                            <div className="flex flex-col gap-4">
                                {completedOrders.map((order) => (
                                    <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3 opacity-75 hover:opacity-100 transition-opacity">
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-400 mb-1">#{order.id.slice(0, 8)}</span>
                                                <h3 className="text-base font-bold text-slate-900">{order.merchantName}</h3>
                                                <p className="text-xs text-slate-500 mt-0.5">{order.time}</p>
                                            </div>
                                            <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border border-green-100">
                                                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                                Selesai
                                            </span>
                                        </div>
                                        <div className="h-px w-full bg-slate-100" />
                                        <div className="flex justify-between items-center">
                                            <div className="flex flex-col gap-1">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Pendapatan</p>
                                                <p className="text-lg font-bold text-green-600">Rp {order.totalCOD > 0 ? '0' : '8.000'} <span className='text-[10px] text-gray-400 font-normal'>(Est)</span></p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon="receipt_long"
                                title="Belum ada order selesai"
                                message="Order yang sudah selesai akan muncul di sini."
                            />
                        )
                    )}
                </main>

                {/* Bottom Navigation */}
                <BackToTopButton />
                <DriverBottomNavigation activeTab="orders" />
            </div>
        </div>
    )
}

export default DriverOrdersPage
