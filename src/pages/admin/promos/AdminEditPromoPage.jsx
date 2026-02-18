import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import AdminLayout from '../../../components/admin/AdminLayout'
import promoService from '../../../services/promoService'
import { supabase } from '../../../services/supabaseClient'

export default function AdminEditPromoPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [promoType, setPromoType] = useState('discount')
    const [isOpenType, setIsOpenType] = useState(false)
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [toast, setToast] = useState(null)

    // Controlled form state
    const [form, setForm] = useState({
        name: '',
        code: '',
        value: '',
        max_discount: '',
        min_order: '',
        valid_from: '',
        valid_until: '',
        is_active: true,
    })

    const fetchPromo = async () => {
        try {
            const { data, error: fetchErr } = await supabase
                .from('promos')
                .select('*')
                .eq('id', id)
                .single()

            if (fetchErr) throw fetchErr

            setForm({
                name: data.name || '',
                code: data.code || '',
                value: data.value || '',
                max_discount: data.max_discount || '',
                min_order: data.min_order || '',
                valid_from: data.valid_from ? data.valid_from.substring(0, 10) : '',
                valid_until: data.valid_until ? data.valid_until.substring(0, 10) : '',
                is_active: data.is_active ?? true,
            })
            setPromoType(data.type === 'flat' ? 'freeshipping' : 'discount')
        } catch (err) {
            console.error('Error fetching promo:', err)
            setError('Gagal memuat data promo')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchPromo() }, [id])

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            if (!form.code || !form.name || !form.value) {
                setToast({ type: 'error', message: 'Nama, kode, dan nilai promo wajib diisi' })
                setTimeout(() => setToast(null), 4000)
                setSaving(false)
                return
            }

            await promoService.updatePromo(id, {
                code: form.code.toUpperCase(),
                name: form.name,
                type: promoType === 'discount' ? 'percentage' : 'flat',
                value: parseFloat(form.value) || 0,
                max_discount: form.max_discount ? parseFloat(String(form.max_discount).replace(/\D/g, '')) : null,
                min_order: form.min_order ? parseFloat(String(form.min_order).replace(/\D/g, '')) : null,
                valid_from: form.valid_from || null,
                valid_until: form.valid_until || null,
                is_active: form.is_active,
            })

            setToast({ type: 'success', message: 'Promo berhasil diperbarui!' })
            setTimeout(() => navigate('/admin/promos'), 1500)
        } catch (err) {
            console.error('Error updating promo:', err)
            setToast({ type: 'error', message: 'Gagal memperbarui: ' + (err.message || 'Unknown error') })
            setTimeout(() => setToast(null), 5000)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <AdminLayout title="Manajemen Promo">
                <div className="flex items-center justify-center py-20">
                    <span className="material-symbols-outlined animate-spin text-4xl text-[#617589]">progress_activity</span>
                </div>
            </AdminLayout>
        )
    }

    if (error) {
        return (
            <AdminLayout title="Manajemen Promo">
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <span className="material-symbols-outlined text-5xl text-red-400 mb-4">error</span>
                    <h3 className="text-lg font-bold text-[#111418] dark:text-white mb-2">{error}</h3>
                    <button onClick={() => navigate('/admin/promos')} className="text-sm text-primary hover:underline mt-4">← Kembali ke Daftar Promo</button>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout title="Manajemen Promo">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    <span className="material-symbols-outlined text-[18px]">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
                    {toast.message}
                </div>
            )}

            {/* Breadcrumbs & Title */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-[#617589] dark:text-[#94a3b8]">
                    <Link to="/admin/promos" className="hover:text-primary transition-colors">Manajemen Promo</Link>
                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                    <span className="text-primary font-medium">Edit Promo</span>
                </div>
                <h1 className="text-2xl font-bold text-[#111418] dark:text-white">Edit Promo</h1>
                <p className="text-[#617589] dark:text-[#94a3b8] text-sm">Perbarui detail promo di bawah ini.</p>
            </div>

            {/* Form Card */}
            <div className="bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl p-6 lg:p-8 shadow-sm">
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-[#111418] dark:text-white" htmlFor="promoName">Nama Promo</label>
                        <input
                            className="w-full px-4 py-2.5 rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] bg-white dark:bg-[#101922] text-[#111418] dark:text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-gray-400"
                            id="promoName" value={form.name} onChange={(e) => handleChange('name', e.target.value)}
                            placeholder="Contoh: Diskon Kemerdekaan 45%" type="text" required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-[#111418] dark:text-white" htmlFor="promoCode">Kode Promo</label>
                        <input
                            className="w-full px-4 py-2.5 rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] bg-white dark:bg-[#101922] text-[#111418] dark:text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-gray-400 uppercase"
                            id="promoCode" value={form.code} onChange={(e) => handleChange('code', e.target.value)}
                            placeholder="Contoh: MERDEKA45" type="text" required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-[#111418] dark:text-white">Jenis Promo</label>
                        <div className="relative">
                            <div className="relative w-full cursor-pointer group" onClick={() => setIsOpenType(!isOpenType)}>
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-[#617589]">
                                    <span className="material-symbols-outlined">{promoType === 'discount' ? 'local_offer' : 'local_shipping'}</span>
                                </div>
                                <div className="w-full pl-12 pr-10 py-2.5 rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] ring-1 ring-transparent focus-within:ring-primary focus-within:border-primary bg-white dark:bg-[#101922] text-[#111418] dark:text-white flex items-center transition-all">
                                    <span className="block truncate">{promoType === 'discount' ? 'Diskon Harga' : 'Gratis Ongkir'}</span>
                                </div>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-[#617589]">
                                    <span className="material-symbols-outlined text-[20px] transition-transform duration-200" style={{ transform: isOpenType ? 'rotate(180deg)' : 'rotate(0deg)' }}>keyboard_arrow_down</span>
                                </div>
                            </div>
                            {isOpenType && (
                                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-lg overflow-hidden animate-[fadeIn_0.1s_ease-out] origin-top">
                                    <div className={`flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d] transition-colors ${promoType === 'discount' ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                                        onClick={() => { setPromoType('discount'); setIsOpenType(false) }}>
                                        <div className="flex items-center gap-3">
                                            <span className={`material-symbols-outlined text-[20px] ${promoType === 'discount' ? 'text-primary' : 'text-[#617589]'}`}>local_offer</span>
                                            <span className={`text-sm font-medium ${promoType === 'discount' ? 'text-[#111418] dark:text-white' : 'text-[#617589]'}`}>Diskon Harga</span>
                                        </div>
                                        {promoType === 'discount' && <span className="material-symbols-outlined text-primary text-[20px]">check</span>}
                                    </div>
                                    <div className={`flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d] transition-colors ${promoType === 'freeshipping' ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                                        onClick={() => { setPromoType('freeshipping'); setIsOpenType(false) }}>
                                        <div className="flex items-center gap-3">
                                            <span className={`material-symbols-outlined text-[20px] ${promoType === 'freeshipping' ? 'text-primary' : 'text-[#617589]'}`}>local_shipping</span>
                                            <span className={`text-sm font-medium ${promoType === 'freeshipping' ? 'text-[#111418] dark:text-white' : 'text-[#617589]'}`}>Gratis Ongkir</span>
                                        </div>
                                        {promoType === 'freeshipping' && <span className="material-symbols-outlined text-primary text-[20px]">check</span>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-[#111418] dark:text-white" htmlFor="promoValue">Nilai Promo</label>
                            <div className="relative">
                                <input className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] bg-white dark:bg-[#101922] text-[#111418] dark:text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                                    id="promoValue" value={form.value} onChange={(e) => handleChange('value', e.target.value)} placeholder="0" type="number" />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-[#617589]"><span className="text-sm font-medium">%</span></div>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-[#111418] dark:text-white" htmlFor="maxDiscount">Batas Maksimum Potongan</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-[#617589]"><span className="text-sm font-medium">Rp</span></div>
                                <input className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] bg-white dark:bg-[#101922] text-[#111418] dark:text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                                    id="maxDiscount" value={form.max_discount} onChange={(e) => handleChange('max_discount', e.target.value)} placeholder="0" type="text" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-[#111418] dark:text-white" htmlFor="minPurchase">Minimum Pembelian</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-[#617589]"><span className="text-sm font-medium">Rp</span></div>
                            <input className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] bg-white dark:bg-[#101922] text-[#111418] dark:text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                                id="minPurchase" value={form.min_order} onChange={(e) => handleChange('min_order', e.target.value)} placeholder="0" type="text" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-[#111418] dark:text-white" htmlFor="startDate">Tanggal Mulai</label>
                            <input className="w-full pl-4 pr-4 py-2.5 rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] bg-white dark:bg-[#101922] text-[#111418] dark:text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all [color-scheme:light] dark:[color-scheme:dark]"
                                id="startDate" value={form.valid_from} onChange={(e) => handleChange('valid_from', e.target.value)} type="date" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-[#111418] dark:text-white" htmlFor="endDate">Tanggal Selesai</label>
                            <input className="w-full pl-4 pr-4 py-2.5 rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] bg-white dark:bg-[#101922] text-[#111418] dark:text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all [color-scheme:light] dark:[color-scheme:dark]"
                                id="endDate" value={form.valid_until} onChange={(e) => handleChange('valid_until', e.target.value)} type="date" />
                        </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-[#e5e7eb] dark:border-[#2a3b4d] mt-8">
                        <div className="flex items-center gap-4 mt-6">
                            <label className="relative inline-flex items-center cursor-pointer group">
                                <input type="checkbox" className="sr-only peer" checked={form.is_active} onChange={(e) => handleChange('is_active', e.target.checked)} />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none dark:peer-focus:ring-primary rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                <span className="ml-3 text-sm font-medium text-[#111418] dark:text-white group-hover:text-primary transition-colors">Aktif</span>
                            </label>
                        </div>
                        <div className="flex items-center gap-3 mt-6">
                            <button type="button" onClick={() => navigate('/admin/promos')}
                                className="px-6 py-2.5 rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] text-[#617589] dark:text-[#94a3b8] font-medium hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d] hover:text-[#111418] dark:hover:text-white transition-colors">
                                Batal
                            </button>
                            <button type="submit" disabled={saving}
                                className="px-6 py-2.5 rounded-lg bg-primary hover:bg-blue-600 text-white font-medium transition-colors shadow-none disabled:opacity-50 flex items-center gap-2">
                                {saving && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
                                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    )
}
