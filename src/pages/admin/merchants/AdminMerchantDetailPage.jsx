import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../../services/supabaseClient'
import AdminLayout from '../../../components/admin/AdminLayout'

export default function AdminMerchantDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [merchant, setMerchant] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [orderCount, setOrderCount] = useState(0)
    const [totalRevenue, setTotalRevenue] = useState(0)

    const fetchMerchant = async () => {
        try {
            const { data, error: fetchErr } = await supabase
                .from('merchants')
                .select(`
                    *,
                    owner:profiles!merchants_owner_id_fkey(id, full_name, phone, email, avatar_url)
                `)
                .eq('id', id)
                .single()

            if (fetchErr) throw fetchErr
            setMerchant(data)

            // Fetch order stats
            const { count } = await supabase
                .from('orders')
                .select('id', { count: 'exact', head: true })
                .eq('merchant_id', id)
            setOrderCount(count || 0)

            const { data: revenueData } = await supabase
                .from('orders')
                .select('total_amount')
                .eq('merchant_id', id)
                .in('status', ['completed', 'delivered'])
            setTotalRevenue(revenueData?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0)
        } catch (err) {
            console.error('Error fetching merchant:', err)
            setError('Gagal memuat data warung')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchMerchant() }, [id])

    const formatCurrency = (val) => `Rp ${(val || 0).toLocaleString('id-ID')}`
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'
    const getInitials = (name) => name ? name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : '??'

    if (loading) {
        return (
            <AdminLayout title="Detail Warung" showBack>
                <div className="flex items-center justify-center py-20">
                    <span className="material-symbols-outlined animate-spin text-4xl text-[#617589]">progress_activity</span>
                </div>
            </AdminLayout>
        )
    }

    if (error || !merchant) {
        return (
            <AdminLayout title="Detail Warung" showBack>
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <span className="material-symbols-outlined text-5xl text-red-400 mb-4">error</span>
                    <h3 className="text-lg font-bold text-[#111418] dark:text-white mb-2">{error || 'Warung tidak ditemukan'}</h3>
                    <button onClick={() => navigate('/admin/merchants')} className="text-sm text-primary hover:underline mt-4">← Kembali ke Daftar Warung</button>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout title="Detail Warung" showBack>
            <div className="flex flex-col gap-6">

                {/* Header Card */}
                <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-28 relative">
                        <div className="absolute -bottom-10 left-6">
                            <div className="w-20 h-20 rounded-xl bg-white dark:bg-[#1a2632] border-4 border-white dark:border-[#1a2632] shadow-lg bg-center bg-cover flex items-center justify-center text-lg font-bold text-orange-600"
                                style={merchant.logo_url ? { backgroundImage: `url(${merchant.logo_url})` } : {}}>
                                {!merchant.logo_url && getInitials(merchant.name)}
                            </div>
                        </div>
                    </div>
                    <div className="pt-14 pb-6 px-6">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-[#111418] dark:text-white">{merchant.name}</h2>
                                <p className="text-sm text-[#617589] dark:text-[#94a3b8] mt-1">ID: {merchant.id?.substring(0, 8)} • Bergabung {formatDate(merchant.created_at)}</p>
                                <div className="flex items-center gap-2 mt-3">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${merchant.is_open ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                        <span className={`w-2 h-2 rounded-full ${merchant.is_open ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                        {merchant.is_open ? 'Buka' : 'Tutup'}
                                    </span>
                                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                        {merchant.category || 'Makanan & Minuman'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => navigate(`/admin/merchants/edit/${merchant.id}`)}
                                    className="px-4 py-2.5 bg-primary hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2 text-sm">
                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                    Edit Data
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                        { label: 'Total Pesanan', value: orderCount, icon: 'receipt_long', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
                        { label: 'Total Pendapatan', value: formatCurrency(totalRevenue), icon: 'payments', color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
                        { label: 'Status', value: merchant.status === 'terminated' ? 'Diputus' : 'Aktif', icon: merchant.status === 'terminated' ? 'block' : 'verified', color: merchant.status === 'terminated' ? 'text-red-600 bg-red-50 dark:bg-red-900/20' : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] p-4 flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${stat.color}`}>
                                <span className="material-symbols-outlined text-xl">{stat.icon}</span>
                            </div>
                            <div>
                                <p className="text-lg font-bold text-[#111418] dark:text-white">{stat.value}</p>
                                <p className="text-xs text-[#617589]">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Info Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Store Info */}
                    <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl p-6">
                        <h3 className="text-base font-bold text-[#111418] dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px] text-orange-500">store</span>
                            Informasi Warung
                        </h3>
                        <div className="flex flex-col gap-4">
                            <InfoRow label="Nama Warung" value={merchant.name} />
                            <InfoRow label="Kategori" value={merchant.category || 'Makanan & Minuman'} />
                            <InfoRow label="Telepon" value={merchant.phone || '-'} />
                            <InfoRow label="Email" value={merchant.email || '-'} />
                            <InfoRow label="Alamat" value={merchant.address || '-'} />
                        </div>
                    </div>

                    {/* Owner Info */}
                    <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl p-6">
                        <h3 className="text-base font-bold text-[#111418] dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px] text-blue-500">person</span>
                            Data Pemilik
                        </h3>
                        <div className="flex flex-col gap-4">
                            <InfoRow label="Nama Pemilik" value={merchant.owner?.full_name || merchant.owner_name || '-'} />
                            <InfoRow label="NIK KTP" value={merchant.owner_nik || '-'} />
                            <InfoRow label="Telepon Pemilik" value={merchant.owner?.phone || '-'} />
                            <InfoRow label="Email Pemilik" value={merchant.owner?.email || '-'} />
                        </div>
                    </div>

                </div>
            </div>
        </AdminLayout>
    )
}

function InfoRow({ label, value }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
            <span className="text-sm text-[#617589] dark:text-[#94a3b8] sm:w-40 shrink-0">{label}</span>
            <span className="text-sm font-medium text-[#111418] dark:text-white">{value}</span>
        </div>
    )
}
