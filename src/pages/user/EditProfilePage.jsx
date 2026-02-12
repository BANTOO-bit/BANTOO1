import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../services/supabaseClient'
import BottomNavigation from '../../components/user/BottomNavigation'
import PhotoPickerModal from '../../components/shared/PhotoPickerModal'
import Toast from '../../components/shared/Toast'
import PageLoader from '../../components/shared/PageLoader'

function EditProfilePage({ onNavigate }) {
    const navigate = useNavigate()
    const { user, refreshProfile } = useAuth()

    // Refs for file inputs
    const cameraInputRef = useRef(null)
    const galleryInputRef = useRef(null)

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        avatar: ''
    })

    const [isLoading, setIsLoading] = useState(false)
    const [showPhotoPicker, setShowPhotoPicker] = useState(false)
    const [toast, setToast] = useState({ message: '', type: 'success', visible: false })
    const [hasPhoto, setHasPhoto] = useState(false)

    // Load user data
    useEffect(() => {
        if (user) {
            const avatar = user.user_metadata?.avatar_url || ''
            setFormData({
                name: user.user_metadata?.full_name || '',
                email: user.email || '',
                phone: user.phone || user.user_metadata?.phone || '',
                avatar: avatar
            })
            setHasPhoto(!!avatar)
        }
    }, [user])

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            // Compress/Resize logic could go here
            const reader = new FileReader()
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, avatar: reader.result }))
                setHasPhoto(true)
                setShowPhotoPicker(false)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSave = async () => {
        if (!user) return

        setIsLoading(true)
        try {
            const updates = {
                data: {
                    full_name: formData.name,
                    phone: formData.phone,
                    avatar_url: formData.avatar
                }
            }

            const { error } = await supabase.auth.updateUser(updates)

            if (error) throw error

            await refreshProfile()

            setToast({ message: 'Profil berhasil disimpan', type: 'success', visible: true })
            setTimeout(() => navigate(-1), 1500)
        } catch (error) {
            console.error('Error updating profile:', error)
            setToast({ message: 'Gagal menyimpan profil', type: 'error', visible: true })
        } finally {
            setIsLoading(false)
        }
    }

    const handleTakePhoto = () => {
        if (cameraInputRef.current) {
            cameraInputRef.current.click()
        }
    }

    const handleChooseGallery = () => {
        if (galleryInputRef.current) {
            galleryInputRef.current.click()
        }
    }

    const handleDeletePhoto = () => {
        setFormData(prev => ({ ...prev, avatar: '' }))
        setHasPhoto(false)
        setShowPhotoPicker(false)
        setToast({ message: 'Foto Profil Dihapus (Simpan untuk menerapkan)', type: 'info', visible: true })
    }

    if (!user) return <PageLoader />

    return (
        <div className="relative min-h-screen flex flex-col bg-background-light">
            {/* Hidden Input for Camera */}
            <input
                type="file"
                accept="image/*"
                capture="user"
                ref={cameraInputRef}
                className="hidden"
                onChange={handleFileChange}
            />

            {/* Hidden Input for Gallery */}
            <input
                type="file"
                accept="image/*"
                ref={galleryInputRef}
                className="hidden"
                onChange={handleFileChange}
            />

            {/* Header */}
            <header className="sticky top-0 z-50 flex items-center justify-between bg-background-light p-4 pb-2">
                <button
                    onClick={() => navigate(-1)}
                    className="flex w-10 h-10 shrink-0 items-center justify-center rounded-full hover:bg-black/5 transition-colors"
                >
                    <span className="material-symbols-outlined text-text-main text-[24px]">arrow_back_ios_new</span>
                </button>
                <h1 className="flex-1 text-center text-lg font-bold leading-tight tracking-tight text-text-main">
                    Ubah Profil
                </h1>
                <div className="w-10 h-10"></div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
                {/* Avatar Section */}
                <div className="flex flex-col items-center pt-8 pb-8">
                    <div
                        className="relative group cursor-pointer"
                        onClick={() => setShowPhotoPicker(true)}
                    >
                        {hasPhoto ? (
                            <img
                                src={formData.avatar}
                                alt="Profile"
                                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-sm"
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-white shadow-sm flex items-center justify-center">
                                <span className="material-symbols-outlined text-gray-400 text-[48px]">person</span>
                            </div>
                        )}
                        <div className="absolute bottom-0 right-1 flex w-9 h-9 items-center justify-center rounded-full bg-primary text-white border-[3px] border-background-light shadow-md transition-transform transform group-hover:scale-105">
                            <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                        </div>
                    </div>
                    <p
                        className="mt-4 text-sm font-medium text-primary cursor-pointer"
                        onClick={() => setShowPhotoPicker(true)}
                    >
                        Ganti Foto Profil
                    </p>
                </div>

                {/* Form Fields */}
                <div className="flex flex-col gap-5 px-4">
                    {/* Nama Lengkap */}
                    <div className="flex flex-col gap-2">
                        <label className="text-text-main text-sm font-semibold pl-1">Nama Lengkap</label>
                        <input
                            className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-base font-normal text-text-main placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                            placeholder="Contoh: Sarah Wijaya"
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                        />
                    </div>

                    {/* Email (Read Only usually, but let's keep editable or read-only based on logic) */}
                    <div className="flex flex-col gap-2">
                        <label className="text-text-main text-sm font-semibold pl-1">Email</label>
                        <input
                            className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-base font-normal text-gray-500 cursor-not-allowed"
                            placeholder="Contoh: sarah.wijaya@example.com"
                            type="email"
                            value={formData.email}
                            readOnly
                        // Email usually shouldn't be changed easily in profile edit without re-verification
                        />
                    </div>

                    {/* Nomor Telepon */}
                    <div className="flex flex-col gap-2">
                        <label className="text-text-main text-sm font-semibold pl-1">Nomor Telepon</label>
                        <input
                            className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-base font-normal text-text-main placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                            placeholder="Contoh: +62 812 3456 7890"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                        />
                    </div>
                </div>

                <div className="h-8"></div>

                {/* Save Button */}
                <div className="px-4 pb-6">
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className={`flex w-full items-center justify-center rounded-2xl px-4 py-4 text-base font-bold text-white shadow-lg transition-all ${isLoading
                            ? 'bg-gray-300 shadow-none cursor-not-allowed'
                            : 'bg-primary shadow-orange-500/20 active:scale-[0.98] hover:bg-orange-600'
                            }`}
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            'Simpan Perubahan'
                        )}
                    </button>
                </div>
            </main>

            {/* Bottom Navigation */}
            <BottomNavigation activeTab="profile" onNavigate={onNavigate} />

            {/* Photo Picker Modal */}
            <PhotoPickerModal
                isOpen={showPhotoPicker}
                onClose={() => setShowPhotoPicker(false)}
                onTakePhoto={handleTakePhoto}
                onChooseGallery={handleChooseGallery}
                onDeletePhoto={handleDeletePhoto}
            />

            {/* Toast Notification */}
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.visible}
                onClose={() => setToast(prev => ({ ...prev, visible: false }))}
            />
        </div>
    )
}

export default EditProfilePage
