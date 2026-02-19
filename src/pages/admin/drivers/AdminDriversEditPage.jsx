import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../../services/supabaseClient'
import AdminLayout from '../../../components/admin/AdminLayout'
import logger from '../../../utils/logger'

export default function AdminDriversEditPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [driver, setDriver] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    const [toast, setToast] = useState(null)

    // Form state
    const [form, setForm] = useState({
        full_name: '',
        nik: '',
        phone: '',
        email: '',
        address: '',
        vehicle_type: '',
        vehicle_plate: '',
        vehicle_brand: '',
    })

    const fetchDriver = async () => {
        try {
            // Fetch driver record
            const { data: driverData, error: driverErr } = await supabase
                .from('drivers')
                .select('*')
                .eq('id', id)
                .single()

            if (driverErr) throw driverErr

            // Fetch profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, phone, email')
                .eq('id', driverData.user_id || id)
                .single()

            const merged = { ...driverData, ...profile }
            setDriver(merged)
            setForm({
                full_name: merged.full_name || '',
                nik: merged.nik || '',
                phone: merged.phone || '',
                email: merged.email || '',
                address: merged.address || '',
                vehicle_type: merged.vehicle_type || '',
                vehicle_plate: merged.vehicle_plate || '',
                vehicle_brand: merged.vehicle_brand || '',
            })
        } catch (err) {
            console.error('Error fetching driver:', err)
            setError('Gagal memuat data driver')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchDriver() }, [id])

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            // Update drivers table
            const { error: driverErr } = await supabase
                .from('drivers')
                .update({
                    nik: form.nik,
                    address: form.address,
                    vehicle_type: form.vehicle_type,
                    vehicle_plate: form.vehicle_plate,
                    vehicle_brand: form.vehicle_brand,
                })
                .eq('id', id)

            if (driverErr) throw driverErr

            // Update profiles table
            const userId = driver?.user_id || id
            const { error: profileErr } = await supabase
                .from('profiles')
                .update({
                    full_name: form.full_name,
                    phone: form.phone,
                })
                .eq('id', userId)

            if (profileErr) console.warn('Profile update error:', profileErr)

            setToast({ type: 'success', message: 'Data driver berhasil disimpan!' })
            setTimeout(() => setToast(null), 3000)
        } catch (err) {
            setToast({ type: 'error', message: 'Gagal menyimpan: ' + err.message })
            setTimeout(() => setToast(null), 5000)
        } finally {
            setSaving(false)
        }
    }

    const getInitials = (name) => {
        if (!name) return '??'
        return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
    }

    if (loading) {
        return (
            <AdminLayout title="Edit Data Driver" showBack>
                <div className="flex items-center justify-center py-20">
                    <span className="material-symbols-outlined animate-spin text-4xl text-[#617589]">progress_activity</span>
                </div>
            </AdminLayout>
        )
    }

    if (error || !driver) {
        return (
            <AdminLayout title="Edit Data Driver" showBack>
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <span className="material-symbols-outlined text-5xl text-red-400 mb-4">error</span>
                    <h3 className="text-lg font-bold text-[#111418] dark:text-white mb-2">{error || 'Driver tidak ditemukan'}</h3>
                    <button onClick={() => navigate('/admin/drivers')} className="text-sm text-primary hover:underline mt-4">← Kembali</button>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout title="Edit Data Driver" showBack>
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 animate-slide-in ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                    <span className="material-symbols-outlined text-[18px]">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
                    {toast.message}
                </div>
            )}

            <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl overflow-hidden">
                <div className="p-6 md:p-8">
                    <form className="flex flex-col gap-6" onSubmit={(e) => { e.preventDefault(); handleSave() }}>

                        {/* Section: Identitas Pribadi */}
                        <div>
                            <h3 className="text-lg font-bold text-[#111418] dark:text-white mb-4">Identitas Pribadi</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2 flex items-center gap-6">
                                    <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-2xl">
                                        {getInitials(form.full_name)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-[#111418] dark:text-white mb-1">Foto Profil</p>
                                        <p className="text-xs text-[#617589] dark:text-[#94a3b8]">Format JPG, PNG. Maksimal 2MB.</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-[#111418] dark:text-white">Nama Lengkap (Sesuai KTP)</label>
                                    <input type="text" value={form.full_name} onChange={(e) => handleChange('full_name', e.target.value)}
                                        className="w-full bg-[#f6f7f8] dark:bg-[#101922] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg px-4 py-3 text-[#111418] dark:text-white focus:outline-none focus:border-primary transition-colors" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-[#111418] dark:text-white">NIK KTP</label>
                                    <input type="text" value={form.nik} onChange={(e) => handleChange('nik', e.target.value)}
                                        className="w-full bg-[#f6f7f8] dark:bg-[#101922] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg px-4 py-3 text-[#111418] dark:text-white focus:outline-none focus:border-primary transition-colors" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-[#111418] dark:text-white">Nomor Telepon</label>
                                    <input type="tel" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)}
                                        className="w-full bg-[#f6f7f8] dark:bg-[#101922] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg px-4 py-3 text-[#111418] dark:text-white focus:outline-none focus:border-primary transition-colors" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-[#111418] dark:text-white">Email</label>
                                    <input type="email" value={form.email} readOnly
                                        className="w-full bg-[#f6f7f8] dark:bg-[#101922] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg px-4 py-3 text-[#617589] dark:text-[#94a3b8] cursor-not-allowed" />
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
                                    <textarea rows="3" value={form.address} onChange={(e) => handleChange('address', e.target.value)}
                                        className="w-full bg-[#f6f7f8] dark:bg-[#101922] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg px-4 py-3 text-[#111418] dark:text-white focus:outline-none focus:border-primary transition-colors resize-none"></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-[#e5e7eb] dark:bg-[#2a3b4d]"></div>

                        {/* Section: Kendaraan */}
                        <div>
                            <h3 className="text-lg font-bold text-[#111418] dark:text-white mb-4">Kendaraan</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-[#111418] dark:text-white">Jenis Kendaraan</label>
                                    <input type="text" value={form.vehicle_type} onChange={(e) => handleChange('vehicle_type', e.target.value)}
                                        className="w-full bg-[#f6f7f8] dark:bg-[#101922] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg px-4 py-3 text-[#111418] dark:text-white focus:outline-none focus:border-primary transition-colors" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-[#111418] dark:text-white">Merek</label>
                                    <input type="text" value={form.vehicle_brand} onChange={(e) => handleChange('vehicle_brand', e.target.value)}
                                        className="w-full bg-[#f6f7f8] dark:bg-[#101922] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg px-4 py-3 text-[#111418] dark:text-white focus:outline-none focus:border-primary transition-colors" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-[#111418] dark:text-white">Plat Nomor</label>
                                    <input type="text" value={form.vehicle_plate} onChange={(e) => handleChange('vehicle_plate', e.target.value)}
                                        className="w-full bg-[#f6f7f8] dark:bg-[#101922] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg px-4 py-3 text-[#111418] dark:text-white focus:outline-none focus:border-primary transition-colors" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-[#e5e7eb] dark:border-[#2a3b4d]">
                            <button type="button" onClick={() => navigate('/admin/drivers')}
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
