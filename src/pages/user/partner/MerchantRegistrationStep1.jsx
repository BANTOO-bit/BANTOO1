import { useState, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import ProgressBar from '../../../components/partner/ProgressBar'
import ExitConfirmationModal from '../../../components/partner/ExitConfirmationModal'
import { usePartnerRegistration } from '../../../context/PartnerRegistrationContext'
import locationService from '../../../services/locationService'

// Lazy load map component to avoid SSR issues
const MapSelector = lazy(() => import('../../../components/partner/MapSelector'))

function MerchantRegistrationStep1() {
    const navigate = useNavigate()
    const { merchantData, saveMerchantStepData } = usePartnerRegistration()

    const [formData, setFormData] = useState({
        shopName: merchantData.step1.shopName || '',
        ownerName: merchantData.step1.ownerName || '',
        phoneNumber: merchantData.step1.phoneNumber || '',
        address: merchantData.step1.address || '',
        addressDetail: merchantData.step1.addressDetail || '',
        location: merchantData.step1.location || null,
        openTime: merchantData.step1.openTime || '08:00',
        closeTime: merchantData.step1.closeTime || '21:00'
    })

    const [locationSelected, setLocationSelected] = useState(!!merchantData.step1.location)

    const [showExitModal, setShowExitModal] = useState(false)
    const [showMapSelector, setShowMapSelector] = useState(false)
    const [isAddressLoading, setIsAddressLoading] = useState(false)

    // Validation State
    const [errors, setErrors] = useState({})

    const validate = () => {
        const newErrors = {}
        if (!formData.shopName.trim()) newErrors.shopName = "Nama warung wajib diisi"
        if (!formData.ownerName.trim()) newErrors.ownerName = "Nama pemilik wajib diisi"
        if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Nomor HP wajib diisi"
        if (!locationSelected || !formData.location) newErrors.location = "Pilih titik lokasi warung di peta"
        if (!formData.address.trim()) newErrors.address = "Alamat wajib diisi. Pilih lokasi di peta untuk mengisi otomatis."

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }))
        }
    }

    const handleLocationSelect = async (latlng) => {
        setFormData(prev => ({ ...prev, location: latlng }))
        setLocationSelected(true)

        // Clear location error immediately
        if (errors.location) {
            setErrors(prev => ({ ...prev, location: null }))
        }

        // Auto-fill address via reverse geocoding
        setIsAddressLoading(true)
        try {
            const address = await locationService.reverseGeocode(latlng.lat, latlng.lng)
            if (address) {
                setFormData(prev => ({ ...prev, address: address }))
                // Clear address error if it existed
                if (errors.address) {
                    setErrors(prev => ({ ...prev, address: null }))
                }
            }
        } catch (error) {
            console.error("Failed to reverse geocode:", error)
        } finally {
            setIsAddressLoading(false)
        }
    }

    const handleContinue = (e) => {
        e.preventDefault()
        if (!validate()) {
            // Scroll to top or first error? 
            // For now just stop.
            return
        }
        saveMerchantStepData(1, formData)
        navigate('/partner/merchant/step-2')
    }

    return (
        <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark relative">
            <header className="bg-white dark:bg-card-dark px-4 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm border-b border-gray-100 dark:border-gray-800">
                <button
                    onClick={() => setShowExitModal(true)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-gray-900 dark:text-white">arrow_back</span>
                </button>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                    Daftar Jadi Warung
                </h1>
                <div className="w-10"></div>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar p-5 pb-32">
                <ProgressBar currentStep={1} totalSteps={2} />

                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    Mulai Usahamu
                </h2>

                <form onSubmit={handleContinue} className="space-y-6">
                    {/* Nama Warung */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2" htmlFor="shopName">
                            Nama Warung
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className={`material-symbols-outlined ${errors.shopName ? 'text-red-500' : 'text-gray-400'}`}>storefront</span>
                            </span>
                            <input
                                className={`w-full pl-10 pr-4 py-3.5 bg-white dark:bg-surface-dark border ${errors.shopName ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-gray-700 focus:ring-primary'} rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all shadow-sm text-gray-900 dark:text-white placeholder-gray-400`}
                                id="shopName"
                                name="shopName"
                                placeholder="Contoh: Warung Berkah"
                                type="text"
                                value={formData.shopName}
                                onChange={handleInputChange}
                            // required // Removed HTML5 required to use custom validation
                            />
                        </div>
                        {errors.shopName && <p className="text-red-500 text-xs mt-1 ml-1">{errors.shopName}</p>}
                    </div>

                    {/* Nama Pemilik */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2" htmlFor="ownerName">
                            Nama Pemilik
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className={`material-symbols-outlined ${errors.ownerName ? 'text-red-500' : 'text-gray-400'}`}>person</span>
                            </span>
                            <input
                                className={`w-full pl-10 pr-4 py-3.5 bg-white dark:bg-surface-dark border ${errors.ownerName ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-gray-700 focus:ring-primary'} rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all shadow-sm text-gray-900 dark:text-white placeholder-gray-400`}
                                id="ownerName"
                                name="ownerName"
                                placeholder="Nama lengkap sesuai KTP"
                                type="text"
                                value={formData.ownerName}
                                onChange={handleInputChange}
                            />
                        </div>
                        {errors.ownerName && <p className="text-red-500 text-xs mt-1 ml-1">{errors.ownerName}</p>}
                    </div>

                    {/* Nomor HP */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2" htmlFor="phoneNumber">
                            Nomor HP/WhatsApp
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className={`material-symbols-outlined ${errors.phoneNumber ? 'text-red-500' : 'text-gray-400'}`}>phone_iphone</span>
                            </span>
                            <input
                                className={`w-full pl-10 pr-4 py-3.5 bg-white dark:bg-surface-dark border ${errors.phoneNumber ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-gray-700 focus:ring-primary'} rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all shadow-sm text-gray-900 dark:text-white placeholder-gray-400`}
                                id="phoneNumber"
                                name="phoneNumber"
                                placeholder="Contoh: 081234567890"
                                type="tel"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                            />
                        </div>
                        {errors.phoneNumber && <p className="text-red-500 text-xs mt-1 ml-1">{errors.phoneNumber}</p>}
                    </div>

                    <hr className="border-gray-200 dark:border-gray-800 border-dashed" />

                    {/* Titik Lokasi (WAJIB, ditempatkan sebelum alamat) */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Titik Lokasi Warung <span className="text-red-500">*</span>
                        </label>
                        <div
                            onClick={() => setShowMapSelector(true)}
                            className={`relative w-full h-auto min-h-[9rem] py-6 rounded-2xl overflow-hidden border-2 border-dashed ${errors.location
                                ? 'border-red-500 bg-red-50/50 dark:bg-red-900/10'
                                : locationSelected
                                    ? 'border-green-400 dark:border-green-600 bg-green-50/50 dark:bg-green-900/10'
                                    : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50'
                                } shadow-sm group cursor-pointer hover:border-primary hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all`}
                        >
                            <div className="w-full h-full flex flex-col items-center justify-center">
                                {locationSelected ? (
                                    <>
                                        <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full shadow-md mb-3">
                                            <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-3xl">check_circle</span>
                                        </div>
                                        <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-1">Lokasi Terpilih</p>
                                        <button
                                            type="button"
                                            className="text-xs text-primary font-semibold hover:underline mt-1"
                                        >
                                            Ubah Lokasi
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="bg-white dark:bg-gray-700 p-3 rounded-full shadow-md mb-3 group-hover:scale-110 transition-transform">
                                            <span className={`material-symbols-outlined text-3xl ${errors.location ? 'text-red-500' : 'text-primary'}`}>place</span>
                                        </div>
                                        <button
                                            type="button"
                                            className="bg-primary hover:bg-orange-600 text-white text-sm font-bold py-2.5 px-5 rounded-full shadow-lg transition-all transform active:scale-95"
                                        >
                                            Pilih Lokasi di Peta
                                        </button>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Geser pin ke lokasi warung Anda</p>
                                    </>
                                )}
                            </div>
                        </div>
                        {errors.location && <p className="text-red-500 text-xs mt-1 ml-1">{errors.location}</p>}
                    </div>

                    {/* Alamat Otomatis (dari reverse geocoding) */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Alamat Warung
                            {locationSelected && <span className="text-xs font-normal text-gray-400 ml-2">(otomatis dari peta)</span>}
                        </label>
                        <div className="relative">
                            <div className={`w-full px-4 py-3 min-h-[3.5rem] rounded-xl border ${errors.address ? 'border-red-500 bg-red-50/30 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                                } text-sm transition-all shadow-sm flex items-start gap-2`}>
                                {isAddressLoading ? (
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                                        <span>Mengambil alamat...</span>
                                    </div>
                                ) : formData.address ? (
                                    <>
                                        <span className="material-symbols-outlined text-green-500 text-lg flex-shrink-0 mt-0.5">location_on</span>
                                        <span className="text-gray-900 dark:text-white leading-relaxed">{formData.address}</span>
                                    </>
                                ) : (
                                    <span className="text-gray-400 italic">Alamat akan terisi otomatis setelah memilih lokasi di peta</span>
                                )}
                            </div>
                        </div>
                        {errors.address && <p className="text-red-500 text-xs mt-1 ml-1">{errors.address}</p>}
                    </div>

                    {/* Detail Alamat (opsional, user bisa tambah info) */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2" htmlFor="addressDetail">
                            Detail Alamat <span className="text-xs font-normal text-gray-400">(opsional)</span>
                        </label>
                        <textarea
                            className="w-full px-4 py-3 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm text-gray-900 dark:text-white placeholder-gray-400 resize-none text-sm"
                            id="addressDetail"
                            name="addressDetail"
                            placeholder="Contoh: Sebelah Masjid Al-Ikhlas, depan gang RT 03, cat hijau"
                            rows="2"
                            value={formData.addressDetail}
                            onChange={handleInputChange}
                        ></textarea>
                    </div>

                    <hr className="border-gray-200 dark:border-gray-800 border-dashed" />

                    {/* Jam Operasional */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Jam Operasional
                        </label>
                        <div className="flex items-center gap-3">
                            <div className="flex-1">
                                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Buka</label>
                                <input
                                    className="w-full px-3 py-3 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none text-gray-900 dark:text-white font-medium text-center"
                                    type="time"
                                    name="openTime"
                                    value={formData.openTime}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <span className="text-gray-400 mt-5">-</span>
                            <div className="flex-1">
                                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Tutup</label>
                                <input
                                    className="w-full px-3 py-3 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none text-gray-900 dark:text-white font-medium text-center"
                                    type="time"
                                    name="closeTime"
                                    value={formData.closeTime}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </main>

            <div className="absolute bottom-0 left-0 right-0 p-5 bg-white/80 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 z-20">
                <button
                    onClick={handleContinue}
                    className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-orange-500/20 active:shadow-none active:scale-[0.99] transition-all flex items-center justify-center gap-2 group"
                >
                    <span>Lanjutkan</span>
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
            </div>

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
                        location={formData.location || { lat: -7.0747, lng: 110.8767 }} // Default: Tanggungharjo, Grobogan
                        onLocationChange={handleLocationSelect}
                        onClose={() => setShowMapSelector(false)}
                    />
                </Suspense>
            )}

            <ExitConfirmationModal
                isOpen={showExitModal}
                onClose={() => setShowExitModal(false)}
                onConfirm={() => navigate(-1)}
            />
        </div>
    )
}

export default MerchantRegistrationStep1
