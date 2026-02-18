import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../../services/supabaseClient'
import AdminLayout from '../../../components/admin/AdminLayout'

export default function AdminMerchantsEditPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [merchant, setMerchant] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    const [toast, setToast] = useState(null)

    // Form state
    const [form, setForm] = useState({
        name: '',
        category: '',
        phone: '',
        email: '',
        owner_name: '',
        owner_nik: '',
        address: '',
    })

    const fetchMerchant = async () => {
        try {
            const { data, error: fetchErr } = await supabase
                .from('merchants')
                .select(`
                    *,
                    owner:profiles!merchants_owner_id_fkey(full_name, phone, email)
                `)
                .eq('id', id)
                .single()

            if (fetchErr) throw fetchErr

            setMerchant(data)
            setForm({
                name: data.name || '',
                category: data.category || 'fnb',
                phone: data.phone || '',
                email: data.email || '',
                owner_name: data.owner?.full_name || data.owner_name || '',
                owner_nik: data.owner_nik || '',
                address: data.address || '',
            })
        } catch (err) {
            console.error('Error fetching merchant:', err)
            setError('Gagal memuat data warung')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchMerchant() }, [id])

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const { error: updateErr } = await supabase
                .from('merchants')
                .update({
                    name: form.name,
                    category: form.category,
                    phone: form.phone,
                    address: form.address,
                    owner_name: form.owner_name,
                    owner_nik: form.owner_nik,
                })
                .eq('id', id)

            if (updateErr) throw updateErr

            setToast({ type: 'success', message: 'Data warung berhasil disimpan!' })
            setTimeout(() => setToast(null), 3000)
        } catch (err) {
            setToast({ type: 'error', message: 'Gagal menyimpan: ' + err.message })
            setTimeout(() => setToast(null), 5000)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <AdminLayout title="Edit Data Warung" showBack>
                <div className="flex items-center justify-center py-20">
                    <span className="material-symbols-outlined animate-spin text-4xl text-[#617589]">progress_activity</span>
                </div>
            </AdminLayout>
        )
    }

    if (error || !merchant) {
        return (
            <AdminLayout title="Edit Data Warung" showBack>
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <span className="material-symbols-outlined text-5xl text-red-400 mb-4">error</span>
                    <h3 className="text-lg font-bold text-[#111418] dark:text-white mb-2">{error || 'Warung tidak ditemukan'}</h3>
                    <button onClick={() => navigate('/admin/merchants')} className="text-sm text-primary hover:underline mt-4">← Kembali</button>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout title="Edit Data Warung" showBack>
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                    <span className="material-symbols-outlined text-[18px]">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
                    {toast.message}
                </div>
            )}

            <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl overflow-hidden">
                <div className="p-6 md:p-8">
                    <form className="flex flex-col gap-6" onSubmit={(e) => { e.preventDefault(); handleSave() }}>

                        {/* Section: Identitas Warung */}
                        <div>
                            <h3 className="text-lg font-bold text-[#111418] dark:text-white mb-4">Identitas Warung</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-[#111418] dark:text-white">Nama Warung</label>
                                    <input type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)}
                                        className="w-full bg-[#f6f7f8] dark:bg-[#101922] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg px-4 py-3 text-[#111418] dark:text-white focus:outline-none focus:border-primary transition-colors" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-[#111418] dark:text-white">Kategori</label>
                                    <div className="relative">
                                        <select value={form.category} onChange={(e) => handleChange('category', e.target.value)}
                                            className="w-full appearance-none bg-[#f6f7f8] dark:bg-[#101922] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg pl-4 pr-10 py-3 text-[#111418] dark:text-white focus:outline-none focus:border-primary transition-colors">
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
                                    <input type="tel" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)}
                                        className="w-full bg-[#f6f7f8] dark:bg-[#101922] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg px-4 py-3 text-[#111418] dark:text-white focus:outline-none focus:border-primary transition-colors" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-[#111418] dark:text-white">Email Warung (Opsional)</label>
                                    <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)}
                                        className="w-full bg-[#f6f7f8] dark:bg-[#101922] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg px-4 py-3 text-[#111418] dark:text-white focus:outline-none focus:border-primary transition-colors" />
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-[#e5e7eb] dark:bg-[#2a3b4d]"></div>

                        {/* Section: Alamat */}
                        <div>
                            <h3 className="text-lg font-bold text-[#111418] dark:text-white mb-4">Alamat Warung</h3>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-[#111418] dark:text-white">Alamat Lengkap</label>
                                <textarea rows="3" value={form.address} onChange={(e) => handleChange('address', e.target.value)}
                                    className="w-full bg-[#f6f7f8] dark:bg-[#101922] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg px-4 py-3 text-[#111418] dark:text-white focus:outline-none focus:border-primary transition-colors resize-none"></textarea>
                            </div>
                        </div>

                        <div className="h-px bg-[#e5e7eb] dark:bg-[#2a3b4d]"></div>

                        {/* Section: Data Pemilik */}
                        <div>
                            <h3 className="text-lg font-bold text-[#111418] dark:text-white mb-4">Data Pemilik</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-[#111418] dark:text-white">Nama Lengkap (Sesuai KTP)</label>
                                    <input type="text" value={form.owner_name} onChange={(e) => handleChange('owner_name', e.target.value)}
                                        className="w-full bg-[#f6f7f8] dark:bg-[#101922] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg px-4 py-3 text-[#111418] dark:text-white focus:outline-none focus:border-primary transition-colors" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-[#111418] dark:text-white">NIK KTP</label>
                                    <input type="text" value={form.owner_nik} onChange={(e) => handleChange('owner_nik', e.target.value)}
                                        className="w-full bg-[#f6f7f8] dark:bg-[#101922] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg px-4 py-3 text-[#111418] dark:text-white focus:outline-none focus:border-primary transition-colors" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-[#e5e7eb] dark:border-[#2a3b4d]">
                            <button type="button" onClick={() => navigate('/admin/merchants')}
                                className="px-6 py-3 bg-[#f0f2f4] dark:bg-[#2a3b4d] hover:bg-[#e5e7eb] dark:hover:bg-[#344658] text-[#617589] dark:text-[#94a3b8] font-bold rounded-lg transition-colors">
                                Batal
                            </button>
                            <button type="submit" disabled={saving}
                                className="px-6 py-3 bg-primary hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                                {saving && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
                                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    )
}
