import { useState, useEffect, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'
import merchantService from '../../../services/merchantService'
import locationService from '../../../services/locationService'
import { handleError } from '../../../utils/errorHandler'

// Lazy load map component to avoid SSR issues
const MapSelector = lazy(() => import('../../../components/partner/MapSelector'))

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
        image: '',
        location: null
    })

    const [locationSelected, setLocationSelected] = useState(false)
    const [showMapSelector, setShowMapSelector] = useState(false)
    const [isAddressLoading, setIsAddressLoading] = useState(false)

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
                            image: data.image || '',
                            location: data.latitude && data.longitude ? { lat: data.latitude, lng: data.longitude } : null
                        })
                        if (data.latitude && data.longitude) {
                            setLocationSelected(true)
                        }
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

    const handleLocationSelect = async (latlng) => {
        setFormData(prev => ({ ...prev, location: latlng }))
        setLocationSelected(true)

        // Try to auto-fill address via reverse geocoding if it makes sense to update it
        if (!formData.address || window.confirm('Apakah Anda ingin memperbarui teks alamat berdasarkan titik peta yang baru?')) {
            setIsAddressLoading(true)
            try {
                const address = await locationService.reverseGeocode(latlng.lat, latlng.lng)
                if (address) {
                    setFormData(prev => ({ ...prev, address: address }))
                }
            } catch (error) {
                if (import.meta.env.DEV) console.error("Geocoding error:", error)
            } finally {
                setIsAddressLoading(false)
            }
        }
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
                description: formData.description,
                latitude: formData.location?.lat || null,
                longitude: formData.location?.lng || null
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
        <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 relative min-h-screen flex flex-col overflow-x-hidden pb-bottom-nav">
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

                    {/* Titik Lokasi GPS */}
                    <div>
                        <label className="text-sm font-semibold text-text-main dark:text-gray-200 mb-1.5 block">
                            Titik Lokasi Warung (Peta)
                        </label>
                        <div
                            onClick={() => setShowMapSelector(true)}
                            className={`relative w-full h-auto min-h-[5rem] py-4 rounded-xl overflow-hidden border ${locationSelected
                                    ? 'border-green-400 dark:border-green-600 bg-green-50/50 dark:bg-green-900/10'
                                    : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                                } shadow-sm cursor-pointer hover:border-primary transition-all`}
                        >
                            <div className="w-full h-full flex items-center justify-between px-4">
                                <div className="flex items-center gap-3">
                                    {locationSelected ? (
                                        <>
                                            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                                                <span className="material-symbols-outlined text-green-600 dark:text-green-400">check_circle</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-green-700 dark:text-green-400">Lokasi Tersimpan</p>
                                                <p className="text-xs text-gray-500">Ketuk untuk mengubah titik Peta</p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="bg-white dark:bg-gray-700 p-2 rounded-full shadow-sm">
                                                <span className="material-symbols-outlined text-primary">place</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Pilih Lokasi di Peta</p>
                                                <p className="text-xs text-gray-400">Untuk akurasi pengiriman</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                            </div>
                        </div>
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
            {/* Map Selector Modal */}
            {showMapSelector && (
                <Suspense fallback={
                    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
                        <div className="bg-white dark:bg-card-dark rounded-2xl p-8">
                            <div className="flex flex-col items-center gap-4">
                                <span className="material-symbols-outlined text-5xl text-primary animate-pulse">map</span>
                                <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
                            </div>
                        </div>
                    </div>
                }>
                    <MapSelector
                        location={formData.location || { lat: -7.0674066, lng: 110.8715891 }} // Default fallback
                        onLocationChange={handleLocationSelect}
                        onClose={() => setShowMapSelector(false)}
                    />
                </Suspense>
            )}
        </div>
    )
}

export default MerchantEditProfilePage
