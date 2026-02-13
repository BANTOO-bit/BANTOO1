import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
export default function AdminMerchantsEditPage() {
    const { id } = useParams()
    const navigate = useNavigate()

    return (
        <AdminLayout title="Edit Data Warung" showBack>
                        <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl overflow-hidden">

                            {/* Tabs */}
                            <div className="flex border-b border-[#e5e7eb] dark:border-[#2a3b4d]">
                                <button className="flex-1 py-4 text-sm font-bold text-primary border-b-2 border-primary">
                                    Profil & Pemilik
                                </button>
                                <button className="flex-1 py-4 text-sm font-medium text-[#617589] dark:text-[#94a3b8] hover:text-[#111418] dark:hover:text-white transition-colors">
                                    Alamat & Lokasi
                                </button>
                                <button className="flex-1 py-4 text-sm font-medium text-[#617589] dark:text-[#94a3b8] hover:text-[#111418] dark:hover:text-white transition-colors">
                                    Jam Operasional
                                </button>
                                <button className="flex-1 py-4 text-sm font-medium text-[#617589] dark:text-[#94a3b8] hover:text-[#111418] dark:hover:text-white transition-colors">
                                    Bank & Pembayaran
                                </button>
                            </div>

                            <div className="p-6 md:p-8">
                                <form className="flex flex-col gap-6">

                                    {/* Section: Identitas Warung */}
                                    <div>
                                        <h3 className="text-lg font-bold text-[#111418] dark:text-white mb-4">Identitas Warung</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2 flex items-center gap-6">
                                                <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-xl bg-center bg-cover flex items-center justify-center text-xs text-gray-500 relative group cursor-pointer overflow-hidden">
                                                    <span className="material-symbols-outlined text-4xl">storefront</span>
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                        <span className="material-symbols-outlined text-white">edit</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-[#111418] dark:text-white mb-1">Foto Profil Warung</p>
                                                    <p className="text-xs text-[#617589] dark:text-[#94a3b8] mb-3">Format JPG, PNG. Maksimal 2MB.</p>
                                                    <button type="button" className="px-4 py-2 bg-white dark:bg-[#2a3b4d] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg text-sm font-bold text-[#111418] dark:text-white hover:bg-[#f9fafb] dark:hover:bg-[#344658] transition-colors">
                                                        Ganti Foto
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-bold text-[#111418] dark:text-white">Nama Warung</label>
                                                <input
                                                    type="text"
                                                    defaultValue="Warung Makan Sejahtera"
                                                    className="w-full bg-[#f6f7f8] dark:bg-[#101922] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg px-4 py-3 text-[#111418] dark:text-white focus:outline-none focus:border-primary transition-colors"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-bold text-[#111418] dark:text-white">Kategori</label>
                                                <div className="relative">
                                                    <select className="w-full appearance-none bg-[#f6f7f8] dark:bg-[#101922] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg pl-4 pr-10 py-3 text-[#111418] dark:text-white focus:outline-none focus:border-primary transition-colors">
                                                        <option value="fnb">Makanan & Minuman</option>
                                                        <option value="sembako">Sembako</option>
                                                        <option value="kesehatan">Kesehatan</option>
                                                    </select>
                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#617589] dark:text-[#94a3b8]">
                                                        <span className="material-symbols-outlined font-light text-2xl">keyboard_arrow_down</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-bold text-[#111418] dark:text-white">Nomor Telepon Warung</label>
                                                <input
                                                    type="tel"
                                                    defaultValue="081234567890"
                                                    className="w-full bg-[#f6f7f8] dark:bg-[#101922] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg px-4 py-3 text-[#111418] dark:text-white focus:outline-none focus:border-primary transition-colors"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-bold text-[#111418] dark:text-white">Email Warung (Opsional)</label>
                                                <input
                                                    type="email"
                                                    defaultValue="warungsejahtera@gmail.com"
                                                    className="w-full bg-[#f6f7f8] dark:bg-[#101922] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg px-4 py-3 text-[#111418] dark:text-white focus:outline-none focus:border-primary transition-colors"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-px bg-[#e5e7eb] dark:bg-[#2a3b4d]"></div>

                                    {/* Section: Data Pemilik */}
                                    <div>
                                        <h3 className="text-lg font-bold text-[#111418] dark:text-white mb-4">Data Pemilik</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-bold text-[#111418] dark:text-white">Nama Lengkap (Sesuai KTP)</label>
                                                <input
                                                    type="text"
                                                    defaultValue="Siti Aminah"
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
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-[#e5e7eb] dark:border-[#2a3b4d]">
                                        <button
                                            type="button"
                                            onClick={() => navigate('/admin/merchants')}
                                            className="px-6 py-3 bg-[#f0f2f4] dark:bg-[#2a3b4d] hover:bg-[#e5e7eb] dark:hover:bg-[#344658] text-[#617589] dark:text-[#94a3b8] font-bold rounded-lg transition-colors"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="button"
                                            className="px-6 py-3 bg-primary hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-primary/20"
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
