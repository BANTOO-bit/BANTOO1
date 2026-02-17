import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'
import merchantService from '../../../services/merchantService'
import { handleError } from '../../../utils/errorHandler'

function MerchantEditProfilePage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const toast = useToast()

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        address: '',
        description: '',
        image: ''
    })

    useEffect(() => {
        async function fetchMerchantProfile() {
            if (user?.merchantId) {
                try {
                    const data = await merchantService.getMerchantById(user.merchantId)
                    if (data) {
                        setFormData({
                            name: data.name || '',
                            category: data.category || '',
                            address: data.address || '',
                            description: data.description || '',
                            image: data.image || ''
                        })
                    }
                } catch (error) {
                    handleError(error, toast, { context: 'Load Profile' })
                } finally {
                    setIsLoading(false)
                }
            } else {
                setIsLoading(false)
            }
        }
        fetchMerchantProfile()
    }, [user?.merchantId, toast])

    const handleChange = (e) => {
        const { id, value } = e.target
        setFormData(prev => ({
            ...prev,
            [id]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!user?.merchantId) return

        setIsSaving(true)
        try {
            await merchantService.updateMerchant(user.merchantId, {
                name: formData.name,
                category: formData.category,
                address: formData.address,
                description: formData.description
            })

            toast.success('Profil berhasil diperbarui')
            navigate(-1)
        } catch (error) {
            handleError(error, toast, { context: 'Update Profile' })
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    }

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 relative min-h-screen flex flex-col overflow-x-hidden pb-[88px]">
            <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 pt-12 pb-4 flex items-center justify-between border-b border-transparent dark:border-gray-800">
                <button
                    onClick={() => navigate(-1)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-lg font-bold text-text-main dark:text-white leading-tight">Ubah Profil</h1>
                <div className="w-8"></div>
            </header>

            <main className="flex flex-col gap-6 px-4 pt-2">
                <section className="flex flex-col items-center pt-4 pb-2">
                    <div className="relative w-28 h-28 mb-4">
                        {formData.image ? (
                            <img
                                alt="Warung Profile"
                                className="w-full h-full object-cover rounded-full shadow-md border-4 border-white dark:border-gray-700"
                                src={formData.image}
                            />
                        ) : (
                            <div className="w-full h-full rounded-full shadow-md border-4 border-white dark:border-gray-700 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <span className="material-symbols-outlined text-4xl text-gray-400">store</span>
                            </div>
                        )}
                        <button className="absolute bottom-1 right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white shadow-sm border-2 border-white dark:border-gray-800 hover:bg-primary-dark transition-colors">
                            <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                        </button>
                    </div>
                </section>

                <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-text-main dark:text-gray-200" htmlFor="name">Nama Warung</label>
                        <input
                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-card-dark border border-border-color dark:border-gray-700 text-text-main dark:text-white placeholder-text-secondary dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                            id="name"
                            placeholder="Nama Warung"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-text-main dark:text-gray-200" htmlFor="category">Kategori Kuliner</label>
                        <input
                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-card-dark border border-border-color dark:border-gray-700 text-text-main dark:text-white placeholder-text-secondary dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                            id="category"
                            placeholder="Contoh: Masakan Rumah"
                            type="text"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-text-main dark:text-gray-200" htmlFor="address">Lokasi Warung</label>
                        <input
                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-card-dark border border-border-color dark:border-gray-700 text-text-main dark:text-white placeholder-text-secondary dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                            id="address"
                            placeholder="Alamat Lengkap"
                            type="text"
                            value={formData.address}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-text-main dark:text-gray-200" htmlFor="description">Deskripsi Warung</label>
                        <textarea
                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-card-dark border border-border-color dark:border-gray-700 text-text-main dark:text-white placeholder-text-secondary dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm resize-none"
                            id="description"
                            placeholder="Deskripsikan warung Anda..."
                            rows="4"
                            value={formData.description}
                            onChange={handleChange}
                        ></textarea>
                    </div>
                    <div className="pt-4">
                        <button
                            className="w-full py-4 bg-primary hover:bg-primary-dark active:scale-[0.98] transition-all text-white font-bold rounded-2xl text-base disabled:opacity-70 disabled:cursor-not-allowed"
                            type="submit"
                            disabled={isSaving}
                        >
                            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
                <div className="h-4"></div>
            </main>
        </div>
    )
}

export default MerchantEditProfilePage
