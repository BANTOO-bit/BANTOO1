import React from 'react'

function MerchantOrderDetail({ order, onBack }) {
    if (!order) return null;

    // Mock timeline data if not present (using order time as base)
    const timeline = order.timeline || {
        created: order.time,
        processed: '14:35',
        handover: '14:50',
        completed: '15:10'
    }

    // Mock customer info if not present
    const customer = order.customer || {
        name: 'Rizky Ramadhan',
        initials: 'RR'
    }

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 min-h-screen flex flex-col animate-fade-in relative z-50">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 pt-12 pb-4 flex items-center border-b border-border-color dark:border-gray-800">
                <button
                    onClick={onBack}
                    className="w-10 h-10 flex items-center justify-start text-text-main dark:text-white active:opacity-60 transition-opacity"
                >
                    <span className="material-symbols-outlined text-[24px]">arrow_back_ios</span>
                </button>
                <div className="flex-1 text-center flex flex-col">
                    <h1 className="text-base font-bold text-text-main dark:text-white leading-tight">Detail Pesanan</h1>
                    <span className="text-[11px] font-medium text-text-secondary">#{order.id}</span>
                </div>
                <div className="w-10"></div>
            </header>

            <main className="flex flex-col gap-4 px-4 pt-4 pb-40">
                {/* Status Banner */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white shrink-0">
                        <span className="material-symbols-outlined fill text-[28px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>check_circle</span>
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-green-800 dark:text-green-300 font-bold text-lg">Pesanan Selesai</h2>
                        <p className="text-green-700/70 dark:text-green-400/70 text-sm">Selesai pada {timeline.completed} WIB</p>
                    </div>
                </div>

                {/* Customer Info (Optional/If available) */}
                {/* <section className="bg-card-light dark:bg-card-dark rounded-2xl shadow-soft border border-border-color dark:border-gray-800 p-4">
                    <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Pelanggan</h3>
                     ... (Same as 'Saat sedang diantar.html' if needed, simpler version for 'Selesai')
                </section> */}

                {/* Menu Details */}
                <section className="bg-card-light dark:bg-card-dark rounded-2xl shadow-soft border border-border-color dark:border-gray-800 overflow-hidden">
                    <div className="p-4 border-b border-gray-50 dark:border-gray-800">
                        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Rincian Menu</h3>
                    </div>
                    <div className="p-4 flex flex-col gap-4">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-start">
                                <div className="flex gap-3">
                                    <span className="w-6 h-6 rounded bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-[10px] font-bold text-primary border border-orange-100 dark:border-orange-800/30 shrink-0">
                                        {item.qty}x
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-text-main dark:text-white leading-snug">{item.name}</span>
                                        {/* <span className="text-xs text-text-secondary mt-0.5">Mie, Ayam, Sawi, Pangsit</span> */}
                                        {item.note && <span className="text-xs text-text-secondary mt-0.5 italic">"{item.note}"</span>}
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-text-main dark:text-white">
                                    Rp {(item.price * item.qty).toLocaleString('id-ID')}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Payment Summary */}
                    <div className="bg-gray-50/50 dark:bg-white/5 p-4 flex flex-col gap-2">
                        <div className="flex justify-between items-center text-xs text-text-secondary">
                            <span>Subtotal</span>
                            <span>Rp {order.total.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-text-secondary">
                            <span>Komisi (0%)</span>
                            <span>Rp 0</span>
                        </div>
                        <div className="h-px bg-dashed border-t border-dashed border-gray-200 dark:border-gray-700 my-1"></div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-text-main dark:text-gray-300">Total Pendapatan Bersih</span>
                            <span className="text-lg font-bold text-primary">Rp {order.total.toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                </section>

                {/* Delivery Timeline */}
                <section className="bg-card-light dark:bg-card-dark rounded-2xl shadow-soft border border-border-color dark:border-gray-800 p-4">
                    <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-4">Detail Pengiriman</h3>
                    <div className="relative flex flex-col gap-6 pl-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100 dark:before:bg-gray-800">
                        <div className="relative">
                            <div className="absolute -left-[20px] top-1.5 w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-white dark:border-card-dark z-10"></div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-text-secondary uppercase font-bold tracking-tight">Diserahkan ke Driver</span>
                                <p className="text-sm font-medium text-text-main dark:text-white mt-0.5">{timeline.handover} WIB</p>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute -left-[20px] top-1.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-card-dark z-10"></div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-green-600 dark:text-green-400 uppercase font-bold tracking-tight">Diterima Pelanggan</span>
                                <p className="text-sm font-medium text-text-main dark:text-white mt-0.5">{timeline.completed} WIB</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Payment Method */}
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-500">account_balance_wallet</span>
                        <span className="text-sm text-text-secondary">Metode Pembayaran</span>
                    </div>
                    <span className="text-sm font-bold text-text-main dark:text-white">{order.payment}</span>
                </div>
            </main>

            {/* Footer */}
            <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-card-dark/80 backdrop-blur-xl border-t border-border-color dark:border-gray-800 p-4 pb-8 flex flex-col gap-3 z-40">
                <button className="w-full h-12 bg-transparent border border-gray-200 dark:border-gray-700 text-text-main dark:text-white font-semibold rounded-xl flex items-center justify-center transition-all active:bg-gray-50 dark:active:bg-gray-800">
                    Butuh Bantuan?
                </button>
            </footer>
        </div>
    )
}

export default MerchantOrderDetail
