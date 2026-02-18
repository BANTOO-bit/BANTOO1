import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'
import { handleError } from '../../../utils/errorHandler'
import { validateForm, hasErrors, required, minLength } from '../../../utils/validation'
import { authService } from '../../../services/authService'
import { storageService, STORAGE_PATHS } from '../../../services/storageService'
import BackButton from '../../../components/shared/BackButton'
import BottomNavigation from '../../../components/user/BottomNavigation'

function EditProfilePage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const toast = useToast()

    const [isLoading, setIsLoading] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [errors, setErrors] = useState({})
    const [previewAvatar, setPreviewAvatar] = useState(null)
    const fileInputRef = useRef(null)
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        email: ''
    })

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
                phone: user.user_metadata?.phone_number || user.phone || '',
                email: user.email || ''
            })
        }
    }, [user])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const validationErrors = validateForm(
            { full_name: formData.full_name },
            { full_name: [required('Nama lengkap wajib diisi'), minLength(3, 'Nama minimal 3 karakter')] }
        )
        if (hasErrors(validationErrors)) {
            setErrors(validationErrors)
            return
        }

        setIsLoading(true)
        try {
            const { error } = await authService.updateProfile({
                full_name: formData.full_name,
                // We keep phone and email read-only for now to avoid auth complexity
                // If needed, we can add separate flows for changing them
            })

            if (error) throw error

            toast.success('Profil berhasil diperbarui')
            navigate('/profile')
        } catch (error) {
            handleError(error, toast, { context: 'Update profil' })
        } finally {
            setIsLoading(false)
        }
    }

    // Generate Avatar URL based on name
    const avatarUrl = previewAvatar || user?.user_metadata?.avatar_url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.full_name || 'User')}&background=random&color=fff`

    const handleImageChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Ukuran foto maksimal 2MB')
            return
        }

        // Show immediate preview
        const reader = new FileReader()
        reader.onloadend = () => setPreviewAvatar(reader.result)
        reader.readAsDataURL(file)

        setIsUploading(true)
        try {
            const uploadedUrl = await storageService.upload(file, STORAGE_PATHS.USER_PROFILE, user.id)
            if (uploadedUrl) {
                const { error } = await authService.updateProfile({ avatar_url: uploadedUrl })
                if (error) throw error
                toast.success('Foto profil berhasil diperbarui')
            }
        } catch (error) {
            handleError(error, toast, { context: 'Upload foto profil' })
            setPreviewAvatar(null) // Revert preview on failure
        } finally {
            setIsUploading(false)
            // Reset input so same file can be selected again
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-background-light pb-[100px]">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-card-light px-4 pt-12 pb-4 border-b border-border-color shadow-sm">
                <div className="relative flex items-center justify-center min-h-[44px]">
                    <BackButton fallback="/profile" />
                    <h1 className="text-lg font-bold">Ubah Profil</h1>
                </div>
            </header>

            <main className="flex-1 p-4">
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center gap-4 py-4">
                        <div className="relative group">
                            <div className={`w-24 h-24 rounded-full overflow-hidden border-4 border-white ${isUploading ? 'opacity-50' : ''}`}>
                                <img
                                    src={avatarUrl}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                                {isUploading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
                                        <span className="material-symbols-outlined animate-spin text-white text-2xl">progress_activity</span>
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                className="hidden"
                            />
                            <button
                                type="button"
                                className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform disabled:opacity-50"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                            >
                                <span className="material-symbols-outlined text-sm">camera_alt</span>
                            </button>
                        </div>
                        <p className="text-xs text-text-secondary">Ketuk ikon kamera untuk mengubah foto</p>
                    </div>

                    {/* Form Fields */}
                    <div className="flex flex-col gap-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-text-main ml-1">Nama Lengkap</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">person</span>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    placeholder="Masukkan nama lengkap"
                                    className={`w-full pl-11 pr-4 py-3.5 bg-white border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium ${errors.full_name ? 'border-red-400' : 'border-gray-200'}`}
                                />
                            </div>
                            {errors.full_name && <p className="text-xs text-red-500 ml-1 mt-1">{errors.full_name}</p>}
                        </div>

                        <div className="space-y-1.5 opacity-60">
                            <label className="text-sm font-bold text-text-main ml-1">Nomor Telepon</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">phone</span>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    disabled
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-text-secondary cursor-not-allowed font-medium"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                    Verified
                                </span>
                            </div>
                            <p className="text-[10px] text-text-secondary ml-1">Nomor telepon tidak dapat diubah sementara ini.</p>
                        </div>

                        <div className="space-y-1.5 opacity-60">
                            <label className="text-sm font-bold text-text-main ml-1">Email</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">mail</span>
                                <input
                                    type="text"
                                    value={formData.email}
                                    disabled
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-text-secondary cursor-not-allowed font-medium"
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </main>

            {/* Bottom Action */}
            <div className="p-4 bg-white border-t border-border-color">
                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full py-4 bg-primary text-white font-bold rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                            <span>Menyimpan...</span>
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-xl">save</span>
                            <span>Simpan Perubahan</span>
                        </>
                    )}
                </button>
            </div>

            <BottomNavigation activeTab="profile" />
        </div>
    )
}

export default EditProfilePage
