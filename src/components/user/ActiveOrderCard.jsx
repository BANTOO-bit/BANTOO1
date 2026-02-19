import OrderStepper from './OrderStepper'

/**
 * ActiveOrderCard Component
 * Displays an active order with stepper, status, and actions
 */
function ActiveOrderCard({ order, onTrack, onCancel }) {
    // Map order status to stepper step
    const getStepFromStatus = (status) => {
        const statusMap = {
            'pending': 0,
            'confirmed': 1,
            'preparing': 1,
            'on_the_way': 2,
            'delivered': 3
        }
        return statusMap[status] || 0
    }

    // Get status message based on order status
    const getStatusInfo = (status) => {
        const statusMap = {
            'pending': {
                message: 'Menunggu Konfirmasi Resto',
                showDriver: false,
                showCancel: true
            },
            'confirmed': {
                message: 'Pesanan Dikonfirmasi',
                showDriver: true,
                showCancel: false
            },
            'preparing': {
                message: 'Makanan Sedang Disiapkan',
                showDriver: true,
                showCancel: false
            },
            'on_the_way': {
                message: 'Pesanan Sedang Diantar',
                showDriver: true,
                showCancel: false
            },
            'delivered': {
                message: 'Pesanan Telah Sampai',
                showDriver: true,
                showCancel: false
            }
        }
        return statusMap[status] || statusMap['pending']
    }

    const currentStep = getStepFromStatus(order.status)
    const statusInfo = getStatusInfo(order.status)

    // Mock driver info (in real app, this would come from order data)
    const driverInfo = order.driverInfo || {
        name: 'Budi Santoso',
        vehicle: 'Honda Vario',
        plate: 'B 1234 XYZ',
        rating: 4.8,
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    }

    return (
        <div className="bg-card-light dark:bg-card-dark rounded-2xl p-4 shadow-soft border border-border-color dark:border-gray-800 relative">
            {/* Merchant info header */}
            <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-2xl">
                        {order.merchantType === 'grocery' ? 'shopping_bag' : 'restaurant'}
                    </span>
                </div>
                <div>
                    <h3 className="font-bold text-sm truncate">{order.merchantName}</h3>
                    <p className="text-[11px] text-text-secondary dark:text-gray-400 mt-1 font-medium leading-relaxed">
                        {order.items?.slice(0, 2).map(item => `${item.quantity}x ${item.name}`).join(', ')}
                        {order.items?.length > 2 && `, +${order.items.length - 2} lainnya`}
                    </p>
                </div>
            </div>

            {/* Order Stepper */}
            <OrderStepper currentStep={currentStep} />

            {/* Status message box */}
            <div className="mb-4 bg-orange-50/50 dark:bg-orange-900/10 rounded-xl p-3 border border-orange-100/50 dark:border-orange-900/20">
                {statusInfo.showDriver && order.status !== 'pending' ? (
                    <>
                        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-orange-200/50 dark:border-orange-800/30">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            <span className="text-xs font-bold text-primary">{statusInfo.message}</span>
                        </div>
                        {/* Driver info */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white dark:border-gray-800">
                                        <img
                                            alt="Driver"
                                            className="w-full h-full object-cover"
                                            src={driverInfo.photo}
                                        />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full px-1 py-0.5 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-0.5">
                                        <span className="material-symbols-outlined text-[8px] text-yellow-500 fill">star</span>
                                        <span className="text-[8px] font-bold">{driverInfo.rating}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-bold">{driverInfo.name}</span>
                                    <span className="text-[9px] text-text-secondary dark:text-gray-400">
                                        {driverInfo.vehicle} • {driverInfo.plate}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 text-blue-600 border border-blue-100 dark:border-blue-900/30 shadow-sm active:scale-95 transition-transform">
                                    <span className="material-symbols-outlined text-[18px]">chat</span>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <span className="text-xs font-bold text-primary">{statusInfo.message}</span>
                    </div>
                )}
            </div>

            {/* Bottom section with time and buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-dashed border-border-color dark:border-gray-800">
                <div className="flex flex-col">
                    <span className="text-[10px] text-text-secondary dark:text-gray-400 mb-0.5">
                        Estimasi Tiba
                    </span>
                    <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-primary text-sm">schedule</span>
                        <div className="flex flex-col leading-none">
                            <span className="font-bold text-sm text-text-main dark:text-white">
                                {order.estimatedTime || '25 - 35 menit'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {statusInfo.showCancel && onCancel && (
                        <button
                            onClick={() => onCancel(order)}
                            className="px-6 py-2.5 bg-red-500 text-white text-xs font-bold rounded-full shadow-md active:scale-95 transition-all hover:bg-red-600"
                        >
                            Batalkan Pesanan
                        </button>
                    )}
                    {!statusInfo.showCancel && (
                        <button
                            onClick={() => onTrack(order)}
                            className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-full shadow-md active:scale-95 transition-all hover:bg-blue-700"
                        >
                            Lacak Pesanan
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ActiveOrderCard
