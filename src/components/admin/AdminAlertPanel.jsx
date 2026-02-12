import React from 'react';

export default function AdminAlertPanel() {
    const alerts = [
        {
            id: 1,
            type: 'money_off',
            title: 'Driver Belum Setor',
            subtitle: 'Budi Santoso',
            amount: 'Rp 850.000',
            risk: 'High Risk',
            color: 'red',
            action: 'Detail'
        },
        {
            id: 2,
            type: 'shopping_cart_off',
            title: 'Order Bermasalah #ORD-8829',
            subtitle: 'Warung Tutup',
            color: 'orange',
            action: 'Hubungi Warung'
        },
        {
            id: 3,
            type: 'receipt_long',
            title: 'Selisih Setoran',
            subtitle: 'Siti Aminah • Selisih',
            amount: 'Rp 15.000',
            amountColor: 'text-amber-600',
            color: 'amber',
            action: 'Periksa Bukti'
        }
    ];

    const getColorClasses = (color) => {
        const classes = {
            red: {
                bg: 'bg-red-100 dark:bg-red-900/30',
                text: 'text-red-600',
                badge: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
            },
            orange: {
                bg: 'bg-orange-100 dark:bg-orange-900/30',
                text: 'text-orange-600',
                badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
            },
            amber: {
                bg: 'bg-amber-100 dark:bg-amber-900/30',
                text: 'text-amber-600',
                badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
            }
        };
        return classes[color] || classes.red;
    };

    return (
        <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e5e7eb] dark:border-[#2a3b4d] flex items-center justify-between bg-red-50/50 dark:bg-red-900/10">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-600 dark:text-red-400">notifications_active</span>
                    <h3 className="font-bold text-[#111418] dark:text-white">Panel Peringatan Real-time</h3>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#617589] dark:text-[#94a3b8]">Live Update</span>
            </div>
            <div className="divide-y divide-[#e5e7eb] dark:divide-[#2a3b4d]">
                {alerts.map((alert) => {
                    const colors = getColorClasses(alert.color);
                    return (
                        <div key={alert.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#f9fafb] dark:hover:bg-[#2a3b4d]/50 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className={`w-10 h-10 rounded-full ${colors.bg} ${colors.text} flex items-center justify-center shrink-0`}>
                                    <span className="material-symbols-outlined">{alert.type}</span>
                                </div>
                                <div>
                                    <p className="font-semibold text-[#111418] dark:text-white text-sm lg:text-base">{alert.title}</p>
                                    <p className="text-sm text-[#617589] dark:text-[#94a3b8]">
                                        {alert.subtitle}
                                        {alert.amount && (
                                            <> • <span className={`font-medium ${alert.amountColor || 'text-[#111418] dark:text-white'}`}>{alert.amount}</span></>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 pl-14 md:pl-0">
                                {alert.risk && (
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${colors.badge} whitespace-nowrap`}>
                                        {alert.risk}
                                    </span>
                                )}
                                {alert.action === 'Hubungi Warung' ? (
                                    <button className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-admin-primary text-white hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap">
                                        {alert.action}
                                    </button>
                                ) : alert.action === 'Periksa Bukti' ? (
                                    <button className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#e5e7eb] dark:bg-[#2a3b4d] dark:border-[#4b5563] text-[#111418] dark:text-white hover:bg-gray-50 dark:hover:bg-[#374151] transition-colors whitespace-nowrap">
                                        {alert.action}
                                    </button>
                                ) : (
                                    <button className="text-sm font-medium text-[#617589] dark:text-[#94a3b8] hover:text-[#111418] dark:hover:text-white flex items-center gap-1">
                                        {alert.action} <span className="material-symbols-outlined text-sm">chevron_right</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
