import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BackButton from '../../../components/shared/BackButton'
import ProgressBar from '../../../components/partner/ProgressBar'
import FileUploadZone from '../../../components/partner/FileUploadZone'
import ExitConfirmationModal from '../../../components/partner/ExitConfirmationModal'
import { usePartnerRegistration } from '../../../context/PartnerRegistrationContext'

function DriverRegistrationStep1() {
    const navigate = useNavigate()
    const { driverData, saveDriverStepData } = usePartnerRegistration()

    const [formData, setFormData] = useState({
        fullName: driverData.step1.fullName || '',
        phoneNumber: driverData.step1.phoneNumber || '',
        address: driverData.step1.address || '',
        selfiePhoto: driverData.step1.selfiePhoto || null
    })

    const [selfiePreview, setSelfiePreview] = useState(null)
    const [showExitModal, setShowExitModal] = useState(false)
    const [errors, setErrors] = useState({})

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
    }

    const handleSelfieChange = (file) => {
        setFormData(prev => ({ ...prev, selfiePhoto: file }))

        // Create preview
        const reader = new FileReader()
        reader.onloadend = () => {
            setSelfiePreview(reader.result)
        }
        reader.readAsDataURL(file)
        if (errors.selfiePhoto) setErrors(prev => ({ ...prev, selfiePhoto: null }))
    }

    const validate = () => {
        const newErrors = {}
        if (!formData.fullName.trim()) newErrors.fullName = "Nama lengkap wajib diisi"
        if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Nomor HP wajib diisi"
        if (!formData.address.trim()) newErrors.address = "Alamat wajib diisi"
        if (!formData.selfiePhoto) newErrors.selfiePhoto = "Foto selfie wajib diunggah"

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleContinue = (e) => {
        e.preventDefault()
        if (!validate()) return

        // Save data to context
        saveDriverStepData(1, formData)

        // Navigate to step 2
        navigate('/partner/driver/step-2')
    }

    const handleExit = () => {
        setShowExitModal(true)
    }

    const confirmExit = () => {
        navigate(-1) // Return to previous page
    }

    return (
        <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark relative">
            {/* Header */}
            <header className="bg-white dark:bg-card-dark px-4 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm border-b border-gray-100 dark:border-gray-800">
                <button
                    onClick={handleExit}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                    Daftar Jadi Driver
                </h1>
                <div className="w-10"></div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto no-scrollbar p-5 pb-32">
                <ProgressBar currentStep={1} totalSteps={3} />

                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    Data Pribadi
                </h2>

                <form onSubmit={handleContinue} className="space-y-6">
                    {/* Nama Lengkap */}
                    <div className="space-y-2">
                        <label
                            className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                            htmlFor="fullName"
                        >
                            Nama Lengkap
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <span className={`material-symbols-outlined text-xl ${errors.fullName ? 'text-red-500' : 'text-gray-400'}`}>
                                    person
                                </span>
                            </span>
                            <input
                                className={`w-full pl-10 pr-4 py-3.5 rounded-xl border ${errors.fullName ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-gray-700 focus:ring-primary'} bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:ring-2 focus:border-transparent placeholder-gray-400 text-sm transition-shadow shadow-sm outline-none`}
                                id="fullName"
                                name="fullName"
                                placeholder="Contoh: Budi Santoso"
                                type="text"
                                value={formData.fullName}
                                onChange={handleInputChange}
                            />
                        </div>
                        {errors.fullName && <p className="text-red-500 text-xs mt-1 ml-1">{errors.fullName}</p>}
                    </div>

                    {/* Nomor HP */}
                    <div className="space-y-2">
                        <label
                            className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                            htmlFor="phoneNumber"
                        >
                            Nomor HP/WhatsApp
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <span className={`material-symbols-outlined text-xl ${errors.phoneNumber ? 'text-red-500' : 'text-gray-400'}`}>
                                    phone_iphone
                                </span>
                            </span>
                            <input
                                className={`w-full pl-10 pr-4 py-3.5 rounded-xl border ${errors.phoneNumber ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-gray-700 focus:ring-primary'} bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:ring-2 focus:border-transparent placeholder-gray-400 text-sm transition-shadow shadow-sm outline-none`}
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

                    {/* Alamat */}
                    <div className="space-y-2">
                        <label
                            className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                            htmlFor="address"
                        >
                            Alamat Domisili
                        </label>
                        <textarea
                            className={`w-full p-4 rounded-xl border ${errors.address ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-gray-700 focus:ring-primary'} bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:ring-2 focus:border-transparent placeholder-gray-400 text-sm resize-none transition-shadow shadow-sm outline-none`}
                            id="address"
                            name="address"
                            placeholder="Masukkan alamat lengkap sesuai KTP/Domisili saat ini..."
                            rows="3"
                            value={formData.address}
                            onChange={handleInputChange}
                        ></textarea>
                        {errors.address && <p className="text-red-500 text-xs mt-1 ml-1">{errors.address}</p>}
                    </div>

                    {/* Foto Selfie */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Foto Selfie
                        </label>
                        <FileUploadZone
                            icon="add_a_photo"
                            title="Ambil foto selfie langsung"
                            subtitle="Pastikan wajah terlihat jelas, pencahayaan cukup"
                            accept="image/*"
                            capture="user"
                            onChange={handleSelfieChange}
                            preview={selfiePreview}
                            required={false}
                        />
                        {errors.selfiePhoto && <p className="text-red-500 text-xs mt-1 ml-1">{errors.selfiePhoto}</p>}
                    </div>
                </form>
            </main>

            {/* Bottom CTA */}
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 z-20">
                <button
                    onClick={handleContinue}
                    className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-2xl active:shadow-none active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                    type="button"
                >
                    <span>Lanjutkan</span>
                    <span className="material-symbols-outlined text-sm font-bold group-hover:translate-x-1 transition-transform">
                        arrow_forward
                    </span>
                </button>
            </div>

            {/* Exit Confirmation Modal */}
            <ExitConfirmationModal
                isOpen={showExitModal}
                onClose={() => setShowExitModal(false)}
                onConfirm={confirmExit}
            />
        </div>
    )
}

export default DriverRegistrationStep1
