import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AdminLayout from '../../../components/admin/AdminLayout'
export default function AdminDriversEditPage() {
    const { id } = useParams()
    const navigate = useNavigate()

    return (
        <AdminLayout title="Edit Data Driver" showBack>
            <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl overflow-hidden">

                {/* Tabs */}
                <div className="flex border-b border-[#e5e7eb] dark:border-[#2a3b4d]">
                    <button className="flex-1 py-4 text-sm font-bold text-primary border-b-2 border-primary">
                        Profil & Pribadi
                    </button>
                    <button className="flex-1 py-4 text-sm font-medium text-[#617589] dark:text-[#94a3b8] hover:text-[#111418] dark:hover:text-white transition-colors">
                        Kendaraan
                    </button>
                    <button className="flex-1 py-4 text-sm font-medium text-[#617589] dark:text-[#94a3b8] hover:text-[#111418] dark:hover:text-white transition-colors">
                        Dokumen
                    </button>
                    <button className="flex-1 py-4 text-sm font-medium text-[#617589] dark:text-[#94a3b8] hover:text-[#111418] dark:hover:text-white transition-colors">
                        Bank & Rekening
                    </button>
                </div>

                <div className="p-6 md:p-8">
                    <form className="flex flex-col gap-6">

                        {/* Section: Identitas Pribadi */}
                        <div>
                            <h3 className="text-lg font-bold text-[#111418] dark:text-white mb-4">Identitas Pribadi</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2 flex items-center gap-6">
                                    <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full bg-center bg-cover flex items-center justify-center text-xs text-blue-600 dark:text-blue-300 relative group cursor-pointer overflow-hidden font-bold text-2xl">
                                        RH
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <span className="material-symbols-outlined text-white text-base">edit</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-[#111418] dark:text-white mb-1">Foto Profil</p>
                                        <p className="text-xs text-[#617589] dark:text-[#94a3b8] mb-3">Format JPG, PNG. Maksimal 2MB.</p>
                                        <button type="button" className="px-4 py-2 bg-white dark:bg-[#2a3b4d] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg text-sm font-bold text-[#111418] dark:text-white hover:bg-[#f9fafb] dark:hover:bg-[#344658] transition-colors">
                                            Ganti Foto
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-[#111418] dark:text-white">Nama Lengkap (Sesuai KTP)</label>
                                    <input
                                        type="text"
                                        defaultValue="Rudi Hartono"
                                        className="w-full bg-[#f6f7f8] dark:bg-[#101922] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg px-4 py-3 text-[#111418] dark:text-white focus:outline-none focus:border-primary transition-colors"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-[#111418] dark:text-white">NIK KTP</label>
                                    <input
                                        type="text"
                                        defaultValue="3276011234567890"
                                        className="w-full bg-[#f6f7f8] dark:bg-[#101922] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg px-4 py-3 text-[#111418] dark:text-white focus:outline-none focus:border-primary transition-colors"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-[#111418] dark:text-white">Nomor Telepon</label>
                                    <input
                                        type="tel"
                                        defaultValue="081234567890"
                                        className="w-full bg-[#f6f7f8] dark:bg-[#101922] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg px-4 py-3 text-[#111418] dark:text-white focus:outline-none focus:border-primary transition-colors"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-[#111418] dark:text-white">Email</label>
                                    <input
                                        type="email"
                                        defaultValue="rudi.hartono@gmail.com"
                                        className="w-full bg-[#f6f7f8] dark:bg-[#101922] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg px-4 py-3 text-[#111418] dark:text-white focus:outline-none focus:border-primary transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-[#e5e7eb] dark:bg-[#2a3b4d]"></div>

                        {/* Section: Alamat */}
                        <div>
                            <h3 className="text-lg font-bold text-[#111418] dark:text-white mb-4">Alamat Domisili</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2 flex flex-col gap-2">
                                    <label className="text-sm font-bold text-[#111418] dark:text-white">Alamat Lengkap</label>
                                    <textarea
                                        rows="3"
                                        defaultValue="Jl. Merdeka No. 45, RT 01/RW 02, Kec. Sumur Bandung, Kota Bandung, Jawa Barat"
                                        className="w-full bg-[#f6f7f8] dark:bg-[#101922] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg px-4 py-3 text-[#111418] dark:text-white focus:outline-none focus:border-primary transition-colors resize-none"
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-[#e5e7eb] dark:border-[#2a3b4d]">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/drivers')}
                                className="px-6 py-3 bg-[#f0f2f4] dark:bg-[#2a3b4d] hover:bg-[#e5e7eb] dark:hover:bg-[#344658] text-[#617589] dark:text-[#94a3b8] font-bold rounded-lg transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                className="px-6 py-3 bg-primary hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                            >
                                Simpan Perubahan
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    )
}
