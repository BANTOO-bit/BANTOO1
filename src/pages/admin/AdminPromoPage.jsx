import { useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
export default function AdminPromoPage() {
    const [activeTab, setActiveTab] = useState('all') // all, active, upcoming, history
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedPromo, setSelectedPromo] = useState(null)
    const [openDropdownId, setOpenDropdownId] = useState(null)

    // Mock Data
    const [promos, setPromos] = useState([
        {
            id: 1,
            name: 'Diskon Awal Bulan',
            code: 'AWALBULAN',
            type: 'discount',
            value: '20%',
            period: '01 Okt - 05 Okt 2023',
            used: 145,
            limit: 200,
            status: 'active'
        },
        {
            id: 2,
            name: 'Gratis Ongkir Weekend',
            code: 'FREEDEL',
            type: 'shipping',
            value: 'Gratis Ongkir',
            period: 'Setiap Sabtu & Minggu',
            used: 32,
            limit: 'Unlimited',
            status: 'active'
        },
        {
            id: 3,
            name: 'Flash Sale 10.10',
            code: 'FLASH10',
            type: 'discount',
            value: '50%',
            period: '10 Okt 2023',
            used: 0,
            limit: 500,
            status: 'upcoming'
        },
        {
            id: 4,
            name: 'Promo Gajian',
            code: 'GAJIAN25',
            type: 'amount',
            value: 'Rp 25.000',
            period: '25 Sep - 28 Sep 2023',
            used: 300,
            limit: 300,
            status: 'ended'
        }
    ])

    const toggleDropdown = (id) => {
        if (openDropdownId === id) {
            setOpenDropdownId(null)
        } else {
            setOpenDropdownId(id)
        }
    }

    const handleDeleteClick = (promo) => {
        setSelectedPromo(promo)
        setShowDeleteModal(true)
        setOpenDropdownId(null)
    }

    const confirmDelete = () => {
        setPromos(promos.filter(p => p.id !== selectedPromo.id))
        setShowDeleteModal(false)
        setSelectedPromo(null)
    }

    // Filter Logic
    const filteredPromos = promos.filter(promo => {
        if (activeTab === 'all') return true
        if (activeTab === 'active') return promo.status === 'active'
        if (activeTab === 'upcoming') return promo.status === 'upcoming'
        if (activeTab === 'history') return promo.status === 'ended'
        return true
    })

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-1.5 animate-pulse"></span>
                        Aktif
                    </span>
                )
            case 'upcoming':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        <span className="material-symbols-outlined text-[14px] mr-1">schedule</span>
                        Akan Datang
                    </span>
                )
            case 'ended':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                        Berakhir
                    </span>
                )
            default:
                return null
        }
    }

    const getIcon = (type) => {
        if (type === 'shipping') return 'local_shipping'
        if (type === 'amount') return 'account_balance_wallet'
        return 'percent'
    }

    const getColor = (type) => {
        if (type === 'shipping') return 'orange'
        return 'blue'
    }

    const getProgressColor = (promo) => {
        if (promo.status === 'ended') return 'bg-gray-400'
        if (promo.status === 'upcoming') return 'bg-gray-300'
        return 'bg-green-500'
    }

    const calculateProgress = (used, limit) => {
        if (limit === 'Unlimited') return 30 // Visual placeholder
        return Math.min((used / limit) * 100, 100)
    }

    return (
        <AdminLayout title="Manajemen Promo">

                        {/* Header Section */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-[#111418] dark:text-white">Daftar Promo & Diskon</h1>
                                <p className="text-[#617589] dark:text-[#94a3b8] text-sm mt-1">Kelola semua penawaran aktif dan yang akan datang untuk pelanggan.</p>
                            </div>
                            <Link to="/admin/promos/new" className="bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20 w-fit">
                                <span className="material-symbols-outlined text-[20px]">add</span>
                                Buat Promo Baru
                            </Link>
                        </div>

                        {/* Tabs */}
                        <div className="flex items-center gap-2 border-b border-[#e5e7eb] dark:border-[#2a3b4d] overflow-x-auto">
                            {[
                                { id: 'all', label: 'Semua Promo' },
                                { id: 'active', label: 'Sedang Aktif', count: promos.filter(p => p.status === 'active').length },
                                { id: 'upcoming', label: 'Akan Datang' },
                                { id: 'history', label: 'Riwayat' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 
                                        ${activeTab === tab.id ? 'text-primary border-primary' : 'text-[#617589] dark:text-[#94a3b8] hover:text-[#111418] dark:hover:text-white border-transparent'}`}
                                >
                                    {tab.label}
                                    {tab.count !== undefined && (
                                        <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        {promos.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm p-12 text-center">
                                <div className="w-32 h-32 mb-6 bg-primary/5 rounded-full flex items-center justify-center relative">
                                    <span className="material-symbols-outlined text-[64px] text-primary/40 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-12">redeem</span>
                                    <span className="material-symbols-outlined text-[32px] text-primary absolute top-[25%] right-[25%] -rotate-12 bg-white dark:bg-[#1a2632] rounded-full p-1 shadow-sm">sell</span>
                                </div>
                                <h2 className="text-xl font-bold text-[#111418] dark:text-white mb-3">Belum Ada Promo yang Dibuat</h2>
                                <p className="text-[#617589] dark:text-[#94a3b8] text-sm max-w-md mx-auto mb-8 leading-relaxed">
                                    Tarik lebih banyak pelanggan dengan membuat promo menarik seperti diskon harga atau gratis ongkir.
                                </p>
                                <Link to="/admin/promos/new" className="bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transform hover:-translate-y-0.5">
                                    <span className="material-symbols-outlined text-[20px]">add_circle</span>
                                    Buat Promo Pertama
                                </Link>
                            </div>
                        ) : (
                            filteredPromos.length === 0 ? (
                                <div className="p-12 text-center text-[#617589] dark:text-[#94a3b8]">
                                    Tidak ada promo {activeTab === 'all' ? '' : `di status '${activeTab}'`}
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm overflow-visible">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse min-w-[800px]">
                                            <thead>
                                                <tr className="bg-[#f6f7f8] dark:bg-[#23303d] border-b border-[#e5e7eb] dark:border-[#2a3b4d]">
                                                    <th className="py-4 px-6 text-xs font-bold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider">Nama Promo</th>
                                                    <th className="py-4 px-6 text-xs font-bold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider">Jenis</th>
                                                    <th className="py-4 px-6 text-xs font-bold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider">Periode</th>
                                                    <th className="py-4 px-6 text-xs font-bold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider">Penggunaan</th>
                                                    <th className="py-4 px-6 text-xs font-bold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider">Status</th>
                                                    <th className="py-4 px-6 text-xs font-bold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider text-right">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#2a3b4d]">
                                                {filteredPromos.map((promo) => (
                                                    <tr key={promo.id} className={`group hover:bg-[#f9fafb] dark:hover:bg-[#1f2b37] transition-colors ${promo.status === 'ended' ? 'opacity-60' : ''}`}>
                                                        <td className="py-4 px-6">
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-[#111418] dark:text-white text-sm">{promo.name}</span>
                                                                <span className="text-xs text-[#617589] dark:text-[#94a3b8] mt-0.5 font-mono">KODE: {promo.code}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`bg-${getColor(promo.type)}-50 dark:bg-${getColor(promo.type)}-900/20 text-${getColor(promo.type)}-600 dark:text-${getColor(promo.type)}-400 p-1.5 rounded-md`}>
                                                                    <span className="material-symbols-outlined text-[18px]">{getIcon(promo.type)}</span>
                                                                </div>
                                                                <span className="text-sm text-[#111418] dark:text-white">{promo.value}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span className="text-sm text-[#111418] dark:text-white">{promo.period}</span>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                    <div className={`${getProgressColor(promo)} h-full`} style={{ width: `${calculateProgress(promo.used, promo.limit)}%` }}></div>
                                                                </div>
                                                                <span className="text-xs text-[#617589] dark:text-[#94a3b8]">{promo.used}/{promo.limit}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            {getStatusBadge(promo.status)}
                                                        </td>
                                                        <td className="py-4 px-6 text-right relative">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    toggleDropdown(promo.id)
                                                                }}
                                                                className={`p-1 rounded-lg transition-colors ${openDropdownId === promo.id ? 'bg-[#f0f2f4] dark:bg-[#2a3b4d] text-primary' : 'text-[#617589] hover:text-primary dark:text-[#94a3b8] dark:hover:text-white'}`}
                                                            >
                                                                <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                                            </button>

                                                            {/* Dropdown Menu */}
                                                            {openDropdownId === promo.id && (
                                                                <div className="absolute right-6 top-10 w-56 origin-top-right bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] divide-y divide-[#e5e7eb] dark:divide-[#2a3b4d] rounded-lg shadow-xl z-10 text-left animate-[fadeIn_0.1s_ease-out]">
                                                                    <div className="py-1">
                                                                        <button className="group flex w-full items-center px-4 py-2 text-sm text-[#111418] dark:text-white hover:bg-[#f6f7f8] dark:hover:bg-[#23303d] transition-colors">
                                                                            <span className="material-symbols-outlined text-[20px] mr-3 text-[#617589] dark:text-[#94a3b8] group-hover:text-primary">edit</span>
                                                                            Edit Promo
                                                                        </button>
                                                                        <button className="group flex w-full items-center px-4 py-2 text-sm text-[#111418] dark:text-white hover:bg-[#f6f7f8] dark:hover:bg-[#23303d] transition-colors">
                                                                            <span className="material-symbols-outlined text-[20px] mr-3 text-[#617589] dark:text-[#94a3b8] group-hover:text-primary">content_copy</span>
                                                                            Duplikat Promo
                                                                        </button>
                                                                        <button className="group flex w-full items-center px-4 py-2 text-sm text-[#111418] dark:text-white hover:bg-[#f6f7f8] dark:hover:bg-[#23303d] transition-colors">
                                                                            <span className="material-symbols-outlined text-[20px] mr-3 text-[#617589] dark:text-[#94a3b8] group-hover:text-primary">pause_circle</span>
                                                                            Nonaktifkan
                                                                        </button>
                                                                    </div>
                                                                    <div className="py-1">
                                                                        <button
                                                                            onClick={() => handleDeleteClick(promo)}
                                                                            className="group flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                                                        >
                                                                            <span className="material-symbols-outlined text-[20px] mr-3 text-red-600 dark:text-red-400">delete</span>
                                                                            Hapus
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )
                        )}
        </AdminLayout>
    )
}
