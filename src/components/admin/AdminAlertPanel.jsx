import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabaseClient'

export default function AdminAlertPanel() {
    const [alerts, setAlerts] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchAlerts = async () => {
        try {
            const now = new Date()
            const todayStart = new Date(now)
            todayStart.setHours(0, 0, 0, 0)

            const alertItems = []

            // 1. Drivers with COD balance not deposited (orders delivered but payment not confirmed)
            const { data: codOrders } = await supabase
                .from('orders')
                .select('driver_id, total_amount, service_fee, id')
                .eq('payment_method', 'cod')
                .eq('status', 'delivered')
                .neq('payment_status', 'paid')
                .gte('created_at', todayStart.toISOString())

            if (codOrders?.length > 0) {
                // Group by driver
                const driverTotals = {}
                codOrders.forEach(o => {
                    if (!o.driver_id) return
                    if (!driverTotals[o.driver_id]) driverTotals[o.driver_id] = { total: 0, count: 0 }
                    driverTotals[o.driver_id].total += (o.total_amount || 0)
                    driverTotals[o.driver_id].count++
                })

                // Fetch driver names
                const driverIds = Object.keys(driverTotals)
                if (driverIds.length > 0) {
                    const { data: drivers } = await supabase
                        .from('profiles')
                        .select('id, full_name')
                        .in('id', driverIds)

                    const nameMap = {}
                    drivers?.forEach(d => { nameMap[d.id] = d.full_name || 'Driver' })

                    Object.entries(driverTotals).forEach(([driverId, info]) => {
                        if (info.total > 100000) { // Only alert if > Rp 100k
                            alertItems.push({
                                id: `cod-${driverId}`,
                                type: 'money_off',
                                title: 'Driver Belum Setor COD',
                                subtitle: nameMap[driverId] || 'Driver',
                                amount: `Rp ${info.total.toLocaleString('id-ID')}`,
                                risk: info.total > 500000 ? 'High Risk' : 'Medium',
                                color: info.total > 500000 ? 'red' : 'amber',
                            })
                        }
                    })
                }
            }

            // 2. Orders stuck in non-terminal status for too long (> 1 hour)
            const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
            const { data: stuckOrders } = await supabase
                .from('orders')
                .select('id, status, created_at')
                .in('status', ['pending', 'accepted', 'preparing'])
                .lt('created_at', oneHourAgo.toISOString())
                .limit(5)

            stuckOrders?.forEach(o => {
                alertItems.push({
                    id: `stuck-${o.id}`,
                    type: 'shopping_cart_off',
                    title: `Order Terlambat #${o.id.substring(0, 8)}`,
                    subtitle: `Status: ${o.status} > 1 jam`,
                    color: 'orange',
                })
            })

            // 3. Pending withdrawals > 24 hours
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
            const { data: pendingWithdrawals } = await supabase
                .from('withdrawals')
                .select('id, amount, created_at')
                .eq('status', 'pending')
                .lt('created_at', oneDayAgo.toISOString())
                .limit(3)

            pendingWithdrawals?.forEach(w => {
                alertItems.push({
                    id: `wd-${w.id}`,
                    type: 'receipt_long',
                    title: 'Penarikan Menunggu > 24 Jam',
                    subtitle: `Rp ${(w.amount || 0).toLocaleString('id-ID')}`,
                    amount: `Rp ${(w.amount || 0).toLocaleString('id-ID')}`,
                    amountColor: 'text-amber-600',
                    color: 'amber',
                })
            })

            setAlerts(alertItems)
        } catch (err) {
            console.error('Error fetching alerts:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAlerts()
        // Refresh every 60 seconds
        const interval = setInterval(fetchAlerts, 60000)
        return () => clearInterval(interval)
    }, [])

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
        }
        return classes[color] || classes.red
    }

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
                {loading ? (
                    <div className="p-6 text-center text-sm text-[#617589] dark:text-[#94a3b8]">
                        <span className="material-symbols-outlined animate-spin text-[20px] mr-2">progress_activity</span>
                        Memuat peringatan...
                    </div>
                ) : alerts.length === 0 ? (
                    <div className="p-8 text-center">
                        <span className="material-symbols-outlined text-green-500 text-4xl mb-2">check_circle</span>
                        <p className="text-sm font-medium text-[#111418] dark:text-white">Semua Aman</p>
                        <p className="text-xs text-[#617589] dark:text-[#94a3b8] mt-1">Tidak ada peringatan saat ini</p>
                    </div>
                ) : (
                    alerts.map((alert) => {
                        const colors = getColorClasses(alert.color)
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
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
