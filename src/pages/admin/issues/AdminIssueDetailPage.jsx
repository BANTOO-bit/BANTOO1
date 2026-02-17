import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AdminLayout from '../../../components/admin/AdminLayout'
export default function AdminIssueDetailPage() {
    const { id } = useParams()
    // Mock Data (Static for now as per HTML)
    const issueData = {
        id: id || 'ORD-8920',
        status: 'Selesai',
        reportedAt: '12 Oktober 2023, 09:45',
        duration: '45 Menit',
        type: 'Driver Tidak Bergerak',
        priority: 'Sedang',
        description: 'Lokasi driver terpantau tidak bergerak (stuck) di titik penjemputan selama lebih dari 15 menit. Customer mencoba menghubungi via chat namun tidak ada balasan. Ada indikasi masalah pada kendaraan atau aplikasi driver.',
        resolution: {
            admin: 'Aditya Pratama (Admin)',
            time: '12 Okt, 10:30',
            note: 'Driver dikonfirmasi mengalami ban bocor dan kehabisan baterai sehingga tidak bisa mengabari pelanggan. Pesanan telah dialihkan ke driver pengganti (Budi Santoso) dan pelanggan setuju menunggu. Saldo driver Asep dipotong Rp 10.000 sebagai sanksi ringan karena kelalaian komunikasi.'
        },
        driver: {
            name: 'Asep Surasep',
            initials: 'AS',
            rating: '4.8',
            color: 'purple'
        },
        customer: {
            name: 'Putri Delina',
            initials: 'PD',
            phone: '+62 812 3456 7890',
            color: 'blue'
        }
    }

    return (
        <AdminLayout title="Detail Riwayat Penyelesaian Masalah">

                        {/* Header Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <Link to="/admin/issues" className="flex items-center gap-2 text-[#617589] dark:text-[#94a3b8] hover:text-[#111418] dark:hover:text-white transition-colors group">
                                <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform text-[20px]">arrow_back</span>
                                <span className="font-medium">Kembali ke Daftar</span>
                            </Link>
                            <div className="flex items-center gap-3">
                                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] text-[#111418] dark:text-white rounded-lg hover:bg-[#f0f2f4] dark:hover:bg-[#202e3b] transition-colors text-sm font-medium">
                                    <span className="material-symbols-outlined text-[18px]">print</span>
                                    Cetak Laporan
                                </button>
                            </div>
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Left Column (Detail) */}
                            <div className="lg:col-span-2 flex flex-col gap-6">
                                <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm p-6 relative overflow-hidden">
                                    <div className={`absolute top-0 left-0 w-full h-1 ${issueData.status === 'Selesai' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h1 className="text-2xl font-bold text-[#111418] dark:text-white">#{issueData.id}</h1>
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${issueData.status === 'Selesai' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800'}`}>
                                                    <span className="material-symbols-outlined text-[16px] filled">check_circle</span>
                                                    {issueData.status}
                                                </span>
                                            </div>
                                            <p className="text-[#617589] dark:text-[#94a3b8] text-sm flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                                                Dilaporkan: {issueData.reportedAt}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-[#617589] dark:text-[#94a3b8] uppercase font-bold tracking-wider mb-1">Durasi Penanganan</p>
                                            <p className="text-lg font-bold text-[#111418] dark:text-white">{issueData.duration}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <h3 className="text-xs font-bold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider mb-2">Jenis Masalah</h3>
                                            <div className="flex items-center gap-2 p-3 bg-[#f6f7f8] dark:bg-[#202e3b] rounded-lg">
                                                <span className="material-symbols-outlined text-[#617589]">two_wheeler</span>
                                                <span className="font-medium text-[#111418] dark:text-white">{issueData.type}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider mb-2">Prioritas</h3>
                                            <div className="flex items-center gap-2 p-3 bg-[#f6f7f8] dark:bg-[#202e3b] rounded-lg">
                                                <span className="material-symbols-outlined text-orange-500">flag</span>
                                                <span className="font-medium text-[#111418] dark:text-white">{issueData.priority}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xs font-bold text-[#617589] dark:text-[#94a3b8] uppercase tracking-wider mb-2">Deskripsi Masalah</h3>
                                        <p className="text-[#111418] dark:text-white leading-relaxed text-sm">
                                            {issueData.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm p-6">
                                    <h2 className="text-lg font-bold text-[#111418] dark:text-white mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">fact_check</span>
                                        Catatan Penyelesaian
                                    </h2>
                                    <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/30 rounded-lg p-5 mb-6">
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300 flex shrink-0 items-center justify-center">
                                                <span className="material-symbols-outlined">person</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h4 className="font-bold text-[#111418] dark:text-white text-sm">{issueData.resolution.admin}</h4>
                                                    <span className="text-xs text-[#617589] dark:text-[#94a3b8]">{issueData.resolution.time}</span>
                                                </div>
                                                <p className="text-sm text-[#111418] dark:text-white">
                                                    {issueData.resolution.note}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <h3 className="text-sm font-bold text-[#111418] dark:text-white mb-3">Bukti Pendukung</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        <div className="aspect-video rounded-lg bg-gray-100 dark:bg-[#202e3b] border border-[#e5e7eb] dark:border-[#2a3b4d] flex items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-[#2a3b4d] transition-colors relative group overflow-hidden">
                                            <span className="material-symbols-outlined text-gray-400">image</span>
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-white text-xs font-medium">Lihat Peta</span>
                                            </div>
                                        </div>
                                        <div className="aspect-video rounded-lg bg-gray-100 dark:bg-[#202e3b] border border-[#e5e7eb] dark:border-[#2a3b4d] flex items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-[#2a3b4d] transition-colors relative group overflow-hidden">
                                            <span className="material-symbols-outlined text-gray-400">chat</span>
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-white text-xs font-medium">Lihat Chat</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column (Sidebar Info) */}
                            <div className="flex flex-col gap-6">
                                <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm p-6">
                                    <h3 className="text-sm font-bold text-[#111418] dark:text-white uppercase tracking-wider mb-4">Pihak Terkait</h3>
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-start gap-3 p-3 rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] bg-[#f9fafb] dark:bg-[#202e3b]">
                                            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300 flex shrink-0 items-center justify-center font-bold text-sm">AS</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-[#617589] dark:text-[#94a3b8] mb-0.5">Driver (Terlapor)</p>
                                                <p className="text-sm font-bold text-[#111418] dark:text-white truncate">{issueData.driver.name}</p>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <span className="material-symbols-outlined text-yellow-400 text-[14px] filled">star</span>
                                                    <span className="text-xs font-medium dark:text-white">{issueData.driver.rating}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-3 rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] bg-white dark:bg-[#1a2632]">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 flex shrink-0 items-center justify-center font-bold text-sm">PD</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-[#617589] dark:text-[#94a3b8] mb-0.5">Pelanggan (Pelapor)</p>
                                                <p className="text-sm font-bold text-[#111418] dark:text-white truncate">{issueData.customer.name}</p>
                                                <p className="text-xs text-[#617589] dark:text-[#94a3b8] mt-1">{issueData.customer.phone}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm p-6">
                                    <h3 className="text-sm font-bold text-[#111418] dark:text-white uppercase tracking-wider mb-6">Kronologi Masalah</h3>
                                    <div className="relative pl-4 border-l-2 border-[#e5e7eb] dark:border-[#2a3b4d] space-y-8">
                                        <div className="relative">
                                            <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-[#1a2632]"></div>
                                            <p className="text-xs font-bold text-green-600 dark:text-green-400 mb-0.5">12 Okt, 10:30</p>
                                            <p className="text-sm font-medium text-[#111418] dark:text-white">Masalah Diselesaikan</p>
                                            <p className="text-xs text-[#617589] dark:text-[#94a3b8] mt-1">Driver pengganti ditugaskan.</p>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-[#cbd5e1] dark:bg-[#475569] border-2 border-white dark:border-[#1a2632]"></div>
                                            <p className="text-xs font-bold text-[#617589] dark:text-[#94a3b8] mb-0.5">12 Okt, 10:15</p>
                                            <p className="text-sm font-medium text-[#111418] dark:text-white">Investigasi Admin</p>
                                            <p className="text-xs text-[#617589] dark:text-[#94a3b8] mt-1">Admin menghubungi {issueData.driver.name}.</p>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-[#cbd5e1] dark:bg-[#475569] border-2 border-white dark:border-[#1a2632]"></div>
                                            <p className="text-xs font-bold text-[#617589] dark:text-[#94a3b8] mb-0.5">12 Okt, 10:00</p>
                                            <p className="text-sm font-medium text-[#111418] dark:text-white">Laporan Diterima</p>
                                            <p className="text-xs text-[#617589] dark:text-[#94a3b8] mt-1">Sistem mendeteksi anomali GPS.</p>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-[#cbd5e1] dark:bg-[#475569] border-2 border-white dark:border-[#1a2632]"></div>
                                            <p className="text-xs font-bold text-[#617589] dark:text-[#94a3b8] mb-0.5">12 Okt, 09:45</p>
                                            <p className="text-sm font-medium text-[#111418] dark:text-white">Pesanan Dibuat</p>
                                            <p className="text-xs text-[#617589] dark:text-[#94a3b8] mt-1">Order #{issueData.id} masuk sistem.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
        </AdminLayout>
    )
}
