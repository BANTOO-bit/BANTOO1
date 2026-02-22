import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { supabase } from '../../../services/supabaseClient'
import dashboardService from '../../../services/dashboardService'
import merchantService from '../../../services/merchantService'
import orderService from '../../../services/orderService'
import MerchantHeader from '../../../components/merchant/MerchantHeader'
import MerchantBottomNavigation from '../../../components/merchant/MerchantBottomNavigation'
import { generateOrderId } from '../../../utils/orderUtils'

function MerchantDashboard() {
    const navigate = useNavigate()
    const { user, isShopOpen } = useAuth()
    const [activeTab, setActiveTab] = useState('baru') // baru, diproses, selesai
    const [merchantStatus, setMerchantStatus] = useState('approved')
    const [availableDriversCount, setAvailableDriversCount] = useState(0)
    const [stats, setStats] = useState({
        todayEarnings: 0,
        totalOrders: 0,
        newOrders: 0,
        loading: true
    })
    const [recentOrders, setRecentOrders] = useState([])

    useEffect(() => {
        async function fetchMerchantStatus() {
            if (!user?.merchantId) return
            try {
                const { data } = await supabase.from('merchants').select('status').eq('id', user.merchantId).single()
                if (data) setMerchantStatus(data.status)
            } catch (err) {
                console.error('Error fetching merchant status:', err)
            }
        }

        async function fetchData() {
            if (!user?.merchantId) return

            try {
                // Fetch Stats
                const statsData = await dashboardService.getMerchantStats(user.merchantId)
                setStats({
                    ...statsData,
                    loading: false
                })

                // Fetch Available Drivers
                const driversCount = await merchantService.getAvailableDriversCount()
                setAvailableDriversCount(driversCount)

                // Fetch Pending Orders for 'Baru' tab
                const ordersData = await orderService.getMerchantOrders(user.merchantId, ['pending'])

                // Transform data for OrderCard
                const transformedOrders = ordersData.map(order => ({
                    id: generateOrderId(order.id),
                    time: new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                    payment: order.payment_method === 'cod' ? 'Tunai' : order.payment_method,
                    status: 'Baru',
                    total: `Rp ${order.total_amount.toLocaleString('id-ID')}`,
                    items: order.items?.map(item => ({
                        qty: item.quantity,
                        name: item.product_name,
                        price: `Rp ${item.price_at_time.toLocaleString('id-ID')}`,
                        note: item.notes
                    })) || []
                }))

                setRecentOrders(transformedOrders)

            } catch (error) {
                if (import.meta.env.DEV) console.error('Error fetching merchant dashboard data:', error)
                setStats(prev => ({ ...prev, loading: false }))
            }
        }

        fetchMerchantStatus()
        fetchData()
        // Refresh every 30 seconds
        const interval = setInterval(fetchData, 30000)

        // Set up Realtime subscription for driver online/offline status changes
        const driverSubscription = supabase
            .channel('driver_status_updates_dashboard')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'drivers'
                },
                () => {
                    // Refetch data when a driver status changes to ensure an accurate count
                    merchantService.getAvailableDriversCount().then(setAvailableDriversCount)
                }
            )
            .subscribe()

        return () => {
            clearInterval(interval)
            supabase.removeChannel(driverSubscription)
        }
    }, [user?.merchantId])

    // Blocked screens for suspended/terminated merchants
    if (merchantStatus === 'suspended' || merchantStatus === 'terminated') {
        const isTerminated = merchantStatus === 'terminated'
        return (
            <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 relative min-h-screen flex flex-col overflow-x-hidden">
                <MerchantHeader />
                <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
                    <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 relative ${isTerminated ? 'bg-red-50' : 'bg-yellow-50'}`}>
                        {!isTerminated && <div className="absolute inset-0 bg-yellow-100 rounded-full animate-pulse" />}
                        <span className={`material-symbols-outlined text-7xl z-10 ${isTerminated ? 'text-red-500' : 'text-yellow-500'}`}>
                            {isTerminated ? 'cancel' : 'pause_circle'}
                        </span>
                    </div>
                    <h2 className="text-2xl font-bold text-text-main dark:text-white mb-3">
                        {isTerminated ? 'Kemitraan Diputus' : 'Warung Disuspend'}
                    </h2>
                    <p className="text-sm text-text-secondary leading-relaxed max-w-xs mx-auto mb-8">
                        {isTerminated
                            ? 'Kemitraan warung Anda dengan platform telah diputus secara permanen. Silakan hubungi admin untuk informasi lebih lanjut.'
                            : 'Warung Anda sedang dalam penangguhan sementara. Anda tidak dapat menerima pesanan saat ini. Silakan hubungi tim Admin untuk bantuan.'
                        }
                    </p>
                    <button
                        onClick={() => window.open('mailto:support@bantoo.app', '_blank')}
                        className="w-full max-w-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-xl text-white">support_agent</span>
                        Hubungi Pusat Bantuan
                    </button>
                </main>
            </div>
        )
    }

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 relative min-h-screen flex flex-col overflow-x-hidden pb-bottom-nav">
            <MerchantHeader />

            <main className="flex flex-col gap-6 px-4 pt-2">
                {/* Offline Status Banner */}
                {!isShopOpen && (
                    <div className="bg-gray-100 dark:bg-gray-800 border-l-4 border-gray-500 text-gray-700 dark:text-gray-300 p-4 rounded-r shadow-sm flex items-start gap-3 animate-fade-in">
                        <span className="material-symbols-outlined text-gray-500">storefront</span>
                        <div>
                            <p className="font-bold text-sm">Warung Sedang Tutup (Offline)</p>
                            <p className="text-xs mt-0.5">Anda tidak akan menerima pesanan baru. Gunakan waktu ini untuk istirahat atau mengelola stok.</p>
                        </div>
                    </div>
                )}
                {/* Stats Section */}
                <section className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => navigate('/merchant/today-earnings')}
                        className="bg-white dark:bg-card-dark p-4 rounded-2xl shadow-soft border border-border-color dark:border-gray-700 flex flex-col justify-between h-[100px] hover:border-primary dark:hover:border-primary transition-colors cursor-pointer active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-2 text-text-secondary">
                            <span className="material-symbols-outlined text-[20px] text-primary">payments</span>
                            <span className="text-xs font-medium">Pendapatan</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text-main dark:text-white">
                                {stats.loading ? 'Loading...' : `Rp ${(stats.todayEarnings / 1000).toFixed(0)}k`}
                            </h2>
                            <p className="text-[10px] text-text-secondary font-medium">Hari ini</p>
                        </div>
                    </button>
                    <button
                        onClick={() => navigate('/merchant/total-orders')}
                        className="bg-white dark:bg-card-dark p-4 rounded-2xl shadow-soft border border-border-color dark:border-gray-700 flex flex-col justify-between h-[100px] hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-2 text-text-secondary">
                            <span className="material-symbols-outlined text-[20px] text-blue-500">receipt_long</span>
                            <span className="text-xs font-medium">Pesanan</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text-main dark:text-white">
                                {stats.loading ? 'Loading...' : `${stats.totalOrders} Order`}
                            </h2>
                            <p className="text-[10px] text-text-secondary font-medium">Hari ini</p>
                        </div>
                    </button>
                </section>

                <section>
                    <h3 className="text-sm font-semibold text-text-main dark:text-white mb-3">Kelola Warung</h3>
                    <div className="grid grid-cols-4 gap-3">
                        <ActionButton icon="restaurant_menu" label="Kelola Menu" color="orange" onClick={() => navigate('/merchant/menu')} />
                        <ActionButton icon="bar_chart" label="Laporan Penjualan" color="blue" onClick={() => navigate('/merchant/sales-report')} />
                        <ActionButton icon="schedule" label="Jam Operasional" color="purple" onClick={() => navigate('/merchant/profile/hours')} />
                        <ActionButton icon="account_balance_wallet" label="Saldo Saya" color="green" onClick={() => navigate('/merchant/balance')} />
                    </div>
                </section>

                {/* Active Orders */}
                <section className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-text-main dark:text-white">Pesanan Aktif</h3>
                        <button
                            onClick={() => navigate('/merchant/orders', { state: { activeTab: 'selesai' } })}
                            className="text-xs font-medium text-primary"
                        >
                            Riwayat
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex p-1 bg-gray-100 dark:bg-card-dark rounded-xl">
                        <TabButton
                            active={activeTab === 'baru'}
                            onClick={() => setActiveTab('baru')}
                            label={`Baru (${recentOrders.length})`}
                        />
                        <TabButton
                            active={activeTab === 'diproses'}
                            onClick={() => {
                                setActiveTab('diproses')
                                navigate('/merchant/orders', { state: { activeTab: 'diproses' } })
                            }}
                            label="Diproses"
                        />
                        <TabButton
                            active={activeTab === 'selesai'}
                            onClick={() => {
                                setActiveTab('selesai')
                                navigate('/merchant/orders', { state: { activeTab: 'selesai' } })
                            }}
                            label="Selesai"
                        />
                    </div>

                    {/* Order List */}
                    <div className="flex flex-col gap-4">
                        {activeTab === 'baru' && (
                            <>
                                {recentOrders.length > 0 ? (
                                    recentOrders.map(order => (
                                        <OrderCard
                                            key={order.id}
                                            {...order}
                                        />
                                    ))
                                ) : (
                                    <div className="py-8 text-center text-text-secondary text-sm">
                                        Tidak ada pesanan baru saat ini.
                                    </div>
                                )}
                            </>
                        )}
                        {/* We redirect for other tabs, so this might not be reached, but good fallback */}
                        {activeTab !== 'baru' && (
                            <div className="py-8 text-center text-text-secondary text-sm">
                                Memuat...
                            </div>
                        )}
                    </div>
                </section>

                {/* Driver Info Banner */}
                <section className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-4 flex items-center gap-3 border border-blue-100 dark:border-blue-800/30">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-card-dark flex items-center justify-center text-blue-600 shadow-sm">
                        <span className="material-symbols-outlined text-[20px]">two_wheeler</span>
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-semibold text-blue-800 dark:text-blue-300">Driver Tersedia</p>
                        <p className="text-[10px] text-blue-600 dark:text-blue-400">
                            {availableDriversCount > 0
                                ? `Ada ${availableDriversCount} driver di sekitar area warungmu.`
                                : 'Belum ada driver yang aktif saat ini.'}
                        </p>
                    </div>
                </section>

                {/* Help Section */}
                <section className="flex flex-col items-center justify-center py-8 gap-5 mt-4 border-t border-border-color dark:border-gray-800">
                    <h3 className="font-bold text-base text-text-main dark:text-white">Butuh Bantuan Lain?</h3>
                    <button className="w-full max-w-sm bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full py-3.5 px-6 flex items-center justify-center gap-2.5 font-bold shadow-md active:scale-95 transition-all">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path>
                        </svg>
                        WhatsApp Support
                    </button>
                    <p className="text-[10px] text-text-secondary font-medium">Jam Operasional: Setiap Hari (08:00 - 22:00 WIB)</p>
                </section>
            </main>

            <MerchantBottomNavigation activeTab="home" />
        </div>
    )
}

// Sub-components to keep code clean
function ActionButton({ icon, label, color, onClick }) {
    const colorClasses = {
        orange: 'bg-orange-50 text-orange-600 border-orange-100',
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
        green: 'bg-green-50 text-green-600 border-green-100'
    }

    return (
        <button onClick={onClick} className="flex flex-col items-center gap-2 group">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border group-active:scale-95 transition-transform shadow-sm ${colorClasses[color]}`}>
                <span className="material-symbols-outlined text-[26px]">{icon}</span>
            </div>
            <span className="text-[11px] font-medium text-center leading-tight whitespace-pre-line">{label.replace(' ', '\n')}</span>
        </button>
    )
}

function TabButton({ active, onClick, label }) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${active
                ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                : 'text-text-secondary hover:bg-white/50 dark:hover:bg-gray-800'
                }`}
        >
            {label}
        </button>
    )
}

function OrderCard({ id, time, payment, status, total, items, note }) {
    const navigate = useNavigate()

    return (
        <article className="bg-white dark:bg-card-dark rounded-2xl shadow-soft border border-border-color dark:border-gray-700 p-4 flex flex-col gap-3">
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <span className="text-xs text-text-secondary font-medium">Order ID #{id}</span>
                    <span className="text-[10px] text-text-secondary mt-0.5">{time} â€¢ {payment}</span>
                </div>
                <span className="px-2 py-1 rounded-md bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-[10px] font-bold uppercase tracking-wider">{status}</span>
            </div>
            <div className="h-px bg-border-color dark:bg-gray-800 w-full"></div>
            <div className="flex flex-col gap-2">
                {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold text-text-secondary">{item.qty}x</span>
                            <span className="text-text-main dark:text-white font-medium">{item.name}</span>
                        </div>
                        <span className="text-text-main dark:text-white font-semibold">{item.price}</span>
                    </div>
                ))}

                {note && (
                    <div className="mt-1 flex items-start gap-2">
                        <span className="material-symbols-outlined text-[14px] text-text-secondary mt-0.5">edit_note</span>
                        <p className="text-xs text-text-secondary italic">"{note}"</p>
                    </div>
                )}
            </div>
            <div className="h-px bg-border-color dark:bg-gray-800 w-full"></div>
            <div className="flex justify-between items-center">
                <div>
                    <span className="text-xs text-text-secondary">Total</span>
                    <p className="text-base font-bold text-text-main dark:text-white">{total}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate('/merchant/orders', { state: { activeTab: 'baru' } })}
                        className="px-4 py-2 rounded-xl border border-red-200 dark:border-red-900/50 text-red-500 font-semibold text-xs active:bg-red-50 transition-colors"
                    >
                        Tolak
                    </button>
                    <button
                        onClick={() => navigate('/merchant/orders', { state: { activeTab: 'baru' } })}
                        className="px-6 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md active:scale-95 transition-transform"
                    >
                        Terima
                    </button>
                </div>
            </div>
        </article>
    )
}

export default MerchantDashboard
