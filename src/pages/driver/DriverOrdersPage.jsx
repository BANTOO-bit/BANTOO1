import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DriverBottomNavigation from '../../components/driver/DriverBottomNavigation'
import EmptyState from '../../components/shared/EmptyState'

function DriverOrdersPage() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('active') // 'active' | 'completed'

    // Mock data for orders
    const activeOrders = [
        {
            id: 'ORD-2023-8825',
            merchantName: 'Nasi Goreng Gila Pak Kumis',
            time: 'Hari ini, 13:45 WIB',
            status: 'Menuju Warung',
            statusIcon: 'directions_bike',
            totalCOD: 45000,
            paymentMethod: 'COD'
        },
        {
            id: 'ORD-2023-8826',
            merchantName: 'Bakso Solo Samrat',
            time: 'Hari ini, 14:10 WIB',
            status: 'Antar ke Pelanggan',
            statusIcon: 'local_shipping',
            totalCOD: 110000,
            paymentMethod: 'Wallet'
        }
    ]

    const completedOrders = []

    return (
        <div className="font-display bg-background-light text-slate-900 antialiased min-h-screen">
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl bg-white">
                {/* Header */}
                <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-colors duration-300">
                    <div className="flex items-center p-4 justify-between">
                        <h1 className="text-xl font-bold text-slate-900">Riwayat Order</h1>
                        <div className="flex items-center justify-end">
                            <button className="flex items-center justify-center rounded-full size-10 bg-slate-100 text-slate-900 hover:bg-slate-200 transition-colors relative">
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
                    {activeTab === 'active' && (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Sedang Berjalan</h2>
                                <span className="text-xs font-medium text-slate-400">{activeOrders.length} Order</span>
                            </div>

                            {activeOrders.map((order) => (
                                <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-400 mb-1">#{order.id}</span>
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
                                                if (order.status === 'Menuju Warung') {
                                                    navigate('/driver/order/pickup')
                                                } else if (order.status === 'Antar ke Pelanggan') {
                                                    navigate('/driver/order/delivery')
                                                }
                                            }}
                                            className="flex items-center justify-center gap-2 bg-[#0d59f2] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                                        >
                                            Detail Tugas
                                            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'completed' && (
                        <EmptyState
                            icon="receipt_long"
                            title="Belum ada order selesai"
                            message="Order yang sudah selesai akan muncul di sini."
                        />
                    )}
                </main>

                {/* Bottom Navigation */}
                <DriverBottomNavigation activeTab="orders" />
            </div>
        </div>
    )
}

export default DriverOrdersPage
