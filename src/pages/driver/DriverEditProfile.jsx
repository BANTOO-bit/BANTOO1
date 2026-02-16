import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import driverService from '../../services/driverService'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

function DriverEditProfile() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const toast = useToast()

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    // Helper for safe string
    const getSafeString = (val) => {
        if (val === null || val === undefined) return ''
        if (typeof val === 'string') return val
        if (typeof val === 'object') return '' // Safety net for objects
        return String(val)
    }

    // Initial state
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        avatar_url: null
    })

    useEffect(() => {
        async function loadProfile() {
            if (!user?.id) return
            try {
                const profile = await driverService.getProfile()
                if (profile) {
                    setFormData({
                        name: getSafeString(profile.full_name),
                        phone: getSafeString(profile.phone),
                        email: getSafeString(profile.email),
                        address: getSafeString(profile.address), // Load real address
                        avatar_url: getSafeString(profile.avatar_url)
                    })
                }
            } catch (error) {
                console.error('Error loading profile:', error)
                toast.error('Gagal memuat profil')
            } finally {
                setIsLoading(false)
            }
        }
        loadProfile()
    }, [user, toast])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleFileChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        // Basic validation
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            toast.error('Ukuran foto maksimal 2MB')
            return
        }

        try {
            setIsSaving(true) // Show loading state on save button or global
            const publicUrl = await driverService.uploadAvatar(file, user.id)
            setFormData(prev => ({ ...prev, avatar_url: publicUrl }))
            toast.success('Foto berhasil diperbarui')
        } catch (error) {
            console.error('Upload failed:', error)
            toast.error('Gagal mengupload foto')
        } finally {
            setIsSaving(false)
        }
    }

    const handleSave = async () => {
        if (!user?.id) return

        setIsSaving(true)
        try {
            await driverService.updateProfile(user.id, {
                full_name: formData.name,
                phone: formData.phone,
                address: formData.address // Send address to service
            })
            toast.success('Profil berhasil diperbarui')
            navigate('/driver/profile')
        } catch (error) {
            console.error('Error saving profile:', error)
            toast.error('Gagal menyimpan perubahan')
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    // Helper for Avatar URL
    const getAvatarUrl = () => {
        if (formData.avatar_url && formData.avatar_url.length > 0) return formData.avatar_url

        const safeName = formData.name || 'User'
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(safeName)}&background=0D8ABC&color=fff`
    }

    return (
        <div className="font-display bg-background-light text-slate-900 antialiased min-h-screen">
            <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl bg-background-light">
                {/* Header */}
                <header className="bg-white pt-12 pb-4 px-6 sticky top-0 z-30 flex items-center justify-between border-b border-slate-100 shadow-sm">
                    <div className="w-16">
                        <button
                            onClick={() => navigate('/driver/profile')}
                            className="text-slate-500 text-base font-medium hover:text-slate-900 transition-colors"
                        >
                            Batal
                        </button>
                    </div>
                    <h1 className="text-lg font-bold text-slate-900 text-center flex-1">Ubah Profil</h1>
                    <div className="w-16 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="text-[#0d59f2] text-base font-bold hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isSaving ? '...' : 'Simpan'}
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto pb-32">
                    {/* Profile Photo Edit */}
                    <div className="flex flex-col items-center pt-8 pb-8 px-6 bg-white border-b border-slate-100 mb-4">
                        <div className="relative group cursor-pointer">
                            <label htmlFor="avatar-upload" className="cursor-pointer">
                                <div
                                    className="bg-center bg-no-repeat bg-cover rounded-full size-32 ring-4 ring-slate-50 shadow-xl"
                                    style={{ backgroundImage: `url("${getAvatarUrl()}")` }}
                                >
                                    <div className="absolute inset-0 bg-black/5 rounded-full group-hover:bg-black/10 transition-colors"></div>
                                </div>
                                <div className="absolute bottom-1 right-1 bg-[#0d59f2] text-white p-2 rounded-full ring-4 ring-white flex items-center justify-center shadow-md">
                                    <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                                </div>
                            </label>
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>
                        <p className="mt-3 text-xs font-semibold text-[#0d59f2]">Ketuk untuk ganti foto</p>
                    </div>

                    {/* Form Fields */}
                    <div className="px-4 space-y-4">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            {/* Name */}
                            <div className="p-5 border-b border-slate-50 hover:bg-slate-50 focus-within:bg-slate-50 transition-colors">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Nama Lengkap</label>
                                <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-full bg-blue-50 flex items-center justify-center text-[#0d59f2] flex-none">
                                        <span className="material-symbols-outlined text-[20px]">person</span>
                                    </div>
                                    <input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-transparent border-0 border-b border-transparent focus:border-[#0d59f2] focus:ring-0 px-0 py-1 text-slate-900 font-bold text-base placeholder:text-slate-300 transition-colors"
                                        placeholder="Masukkan nama lengkap"
                                        type="text"
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="p-5 border-b border-slate-50 hover:bg-slate-50 focus-within:bg-slate-50 transition-colors">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Nomor Telepon</label>
                                <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-full bg-blue-50 flex items-center justify-center text-[#0d59f2] flex-none">
                                        <span className="material-symbols-outlined text-[20px]">call</span>
                                    </div>
                                    <input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full bg-transparent border-0 border-b border-transparent focus:border-[#0d59f2] focus:ring-0 px-0 py-1 text-slate-900 font-bold text-base placeholder:text-slate-300 transition-colors"
                                        placeholder="08xx-xxxx-xxxx"
                                        type="tel"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="p-5 border-b border-slate-50 hover:bg-slate-50 focus-within:bg-slate-50 transition-colors">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Email</label>
                                <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-full bg-blue-50 flex items-center justify-center text-[#0d59f2] flex-none">
                                        <span className="material-symbols-outlined text-[20px]">mail</span>
                                    </div>
                                    <input
                                        name="email"
                                        value={formData.email}
                                        disabled
                                        className="w-full bg-transparent border-0 border-b border-transparent px-0 py-1 text-slate-500 font-bold text-base cursor-not-allowed"
                                        placeholder="nama@email.com"
                                        type="email"
                                    />
                                </div>
                            </div>

                            {/* Address */}
                            <div className="p-5 hover:bg-slate-50 focus-within:bg-slate-50 transition-colors">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Alamat Domisili</label>
                                <div className="flex items-start gap-4">
                                    <div className="size-10 rounded-full bg-blue-50 flex items-center justify-center text-[#0d59f2] flex-none mt-1">
                                        <span className="material-symbols-outlined text-[20px]">home_pin</span>
                                    </div>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full bg-transparent border-0 border-b border-transparent focus:border-[#0d59f2] focus:ring-0 px-0 py-1 text-slate-900 font-bold text-base leading-relaxed placeholder:text-slate-300 resize-none transition-colors"
                                        placeholder="Masukkan alamat lengkap"
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                        <p className="text-center text-xs text-slate-400 pt-4">ID Driver: {user?.id?.slice(0, 12).toUpperCase() || '-'}</p>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default DriverEditProfile
