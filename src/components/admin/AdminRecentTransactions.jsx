import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminRecentTransactions() {
    const transactions = [
        {
            id: '#ORD-8833',
            merchant: 'Sate Madura Cak Dul',
            driver: 'Andi Pratama',
            total: 'Rp 45.000',
            status: 'Menyiapkan',
            statusColor: 'orange'
        },
        {
            id: '#ORD-8832',
            merchant: 'Seblak Prasmanan',
            driver: 'Rina Mulyani',
            total: 'Rp 22.000',
            status: 'Diantar',
            statusColor: 'blue'
        },
        {
            id: '#ORD-8831',
            merchant: 'Es Teh Jaya',
            driver: '--',
            isDriverMissing: true,
            total: 'Rp 12.000',
            status: 'Mencari Driver',
            statusColor: 'gray'
        },
        {
            id: '#ORD-8830',
            merchant: 'Geprek Bensu',
            driver: 'Budi Santoso',
            total: 'Rp 35.000',
            status: 'Selesai',
            statusColor: 'emerald'
        }
    ];

    const getStatusStyles = (color) => {
        const styles = {
            orange: {
                badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
                dot: 'bg-orange-500'
            },
            blue: {
                badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                dot: 'bg-blue-500'
            },
            gray: {
                badge: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
                dot: 'bg-gray-500 animate-pulse'
            },
            emerald: {
                badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                dot: 'bg-emerald-500'
            }
        };
        return styles[color] || styles.gray;
    };

    return (
        <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm flex-1 flex flex-col">
            <div className="px-6 py-4 border-b border-[#e5e7eb] dark:border-[#2a3b4d] flex items-center justify-between">
                <h3 className="font-bold text-[#111418] dark:text-white">Transaksi Terkini</h3>
                <Link to="/admin/orders" className="text-sm font-medium text-admin-primary hover:text-blue-700">Lihat Semua</Link>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-[#f9fafb] dark:bg-[#2a3b4d]/50 text-[#617589] dark:text-[#94a3b8] font-medium border-b border-[#e5e7eb] dark:border-[#2a3b4d]">
                        <tr>
                            <th className="px-6 py-3">ID Pesanan</th>
                            <th className="px-6 py-3">Warung</th>
                            <th className="px-6 py-3">Driver</th>
                            <th className="px-6 py-3">Total</th>
                            <th className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#2a3b4d]">
                        {transactions.map((tx) => {
                            const style = getStatusStyles(tx.statusColor);
                            return (
                                <tr key={tx.id}>
                                    <td className="px-6 py-4 font-medium text-[#111418] dark:text-white">{tx.id}</td>
                                    <td className="px-6 py-4 text-[#617589] dark:text-[#94a3b8]">{tx.merchant}</td>
                                    <td className={`px-6 py-4 text-[#617589] dark:text-[#94a3b8] ${tx.isDriverMissing ? 'italic' : ''}`}>{tx.driver}</td>
                                    <td className="px-6 py-4 font-medium text-[#111418] dark:text-white">{tx.total}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.badge}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
                                            {tx.status}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
