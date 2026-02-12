import { useState, useEffect } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminHeader from '../../components/admin/AdminHeader'
import AdminWithdrawalModal from '../../components/admin/AdminWithdrawalModal'
import { financeService } from '../../services/financeService'
import { useAuth } from '../../context/AuthContext'

export default function AdminWithdrawalsPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [activeTab, setActiveTab] = useState('pending') // 'pending', 'approved', 'rejected'
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedWithdrawal, setSelectedWithdrawal] = useState(null)
    const [withdrawals, setWithdrawals] = useState([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ pendingCount: 0, pendingAmount: 0, processedAmount: 0 })

    useEffect(() => {
        fetchWithdrawals()
    }, [activeTab])

    const fetchWithdrawals = async () => {
        try {
            setLoading(true)
            const data = await financeService.getWithdrawals({ status: activeTab !== 'all' ? activeTab : null })
            setWithdrawals(data)

            // Recalculate quick stats (simplified, ideally backend provides this)
            const allPending = activeTab === 'pending' ? data : await financeService.getWithdrawals({ status: 'pending' })
            const pendingAmount = allPending.reduce((sum, w) => sum + w.amount, 0)

            setStats({
                pendingCount: allPending.length,
                pendingAmount,
                processedAmount: 0 // Placeholder or fetch real
            })
        } catch (error) {
            console.error('Failed to fetch withdrawals:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleProcessClick = (withdrawal) => {
        setSelectedWithdrawal(withdrawal)
        setIsModalOpen(true)
    }

    const handleConfirmTransfer = async (file, notes) => {
        try {
            if (selectedWithdrawal) {
                await financeService.approveWithdrawal(selectedWithdrawal.id, file)
                alert('Penarikan berhasil disetujui')
                setIsModalOpen(false)
                setSelectedWithdrawal(null)
                fetchWithdrawals() // Refresh list
            }
        } catch (error) {
            console.error('Failed to approve withdrawal:', error)
            alert('Gagal memproses penarikan')
        }
    }

    const formatCurrency = (val) => {
        return `Rp ${val.toLocaleString('id-ID')}`
    }

    return (
        <div className="flex min-h-screen w-full bg-[#f6f7f8] dark:bg-[#101922] font-display text-[#111418] dark:text-white overflow-x-hidden relative">

            <AdminWithdrawalModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                data={selectedWithdrawal}
                onConfirm={handleConfirmTransfer}
            />

            <AdminSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <main className="flex-1 lg:ml-[240px] flex flex-col min-w-0 relative">
                <AdminHeader
                    onMenuClick={() => setIsSidebarOpen(true)}
                    title="Manajemen Penarikan Dana"
                />

                <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto flex flex-col gap-6 h-full">

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-[#1a2632] p-6 rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] flex flex-col gap-1">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-[#617589] dark:text-[#94a3b8] text-sm font-medium">Total Permintaan Pending</p>
                                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-1 rounded-md text-xs font-bold">
                                        ACTION NEEDED
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-3xl font-bold text-[#111418] dark:text-white">{stats.pendingCount} Permintaan</h3>
                                </div>
                                <p className="text-sm text-[#617589] dark:text-[#94a3b8]">Total nominal: <span className="font-semibold text-[#111418] dark:text-white">{formatCurrency(stats.pendingAmount)}</span></p>
                            </div>
                            <div className="bg-white dark:bg-[#1a2632] p-6 rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] flex flex-col gap-1">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-[#617589] dark:text-[#94a3b8] text-sm font-medium">Dana Diproses</p>
                                    <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 p-1 rounded-md">
                                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-3xl font-bold text-[#111418] dark:text-white">-</h3>
                                </div>
                                <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                    Data real-time
                                </p>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] flex-1 flex flex-col min-h-[600px]">
                            {/* Tabs */}
                            <div className="flex items-center border-b border-[#e5e7eb] dark:border-[#2a3b4d]">
                                <button
                                    onClick={() => setActiveTab('pending')}
                                    className={`relative px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'pending' ? 'text-primary border-b-2 border-primary' : 'text-[#617589] dark:text-[#94a3b8] hover:bg-[#f9fafb] dark:hover:bg-[#2a3b4d]/30'}`}
                                >
                                    Menunggu ({stats.pendingCount})
                                </button>
                                <button
                                    onClick={() => setActiveTab('approved')}
                                    className={`relative px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'approved' ? 'text-primary border-b-2 border-primary' : 'text-[#617589] dark:text-[#94a3b8] hover:bg-[#f9fafb] dark:hover:bg-[#2a3b4d]/30'}`}
                                >
                                    Disetujui
                                </button>
                                <button
                                    onClick={() => setActiveTab('rejected')}
                                    className={`relative px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'rejected' ? 'text-primary border-b-2 border-primary' : 'text-[#617589] dark:text-[#94a3b8] hover:bg-[#f9fafb] dark:hover:bg-[#2a3b4d]/30'}`}
                                >
                                    Ditolak
                                </button>
                            </div>

                            {/* Table */}
                            <div className="flex-1 overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-[#f9fafb] dark:bg-[#1e2c3a] border-b border-[#e5e7eb] dark:border-[#2a3b4d]">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider">User</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider">Bank & Akun</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider">Jumlah</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#2a3b4d]">
                                        {loading ? (
                                            <tr><td colSpan="5" className="p-8 text-center">Memuat data...</td></tr>
                                        ) : withdrawals.length === 0 ? (
                                            <tr><td colSpan="5" className="p-8 text-center text-[#617589]">Tidak ada data penarikan</td></tr>
                                        ) : (
                                            withdrawals.map((item) => (
                                                <tr key={item.id} className="hover:bg-[#f9fafb] dark:hover:bg-[#202e3b] transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-[#111418] dark:text-white">{item.user?.full_name}</span>
                                                            <span className="text-xs text-[#617589] dark:text-[#94a3b8] capitalize">{item.user?.role}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-[#111418] dark:text-white">{item.bank_name}</span>
                                                            <span className="text-xs text-[#617589] dark:text-[#94a3b8]">{item.bank_account_number}</span>
                                                            <span className="text-xs text-[#617589] dark:text-[#94a3b8]">{item.bank_account_name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-[#111418] dark:text-white">
                                                        {formatCurrency(item.amount)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${item.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                                                item.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                                    'bg-red-100 text-red-800'
                                                            }`}>
                                                            {item.status === 'pending' ? 'Menunggu' : item.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {item.status === 'pending' && (
                                                            <button
                                                                onClick={() => handleProcessClick(item)}
                                                                className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors"
                                                            >
                                                                Proses
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
