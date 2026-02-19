import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProgressBar from '../../../components/partner/ProgressBar'
import FileUploadZone from '../../../components/partner/FileUploadZone'
import ExitConfirmationModal from '../../../components/partner/ExitConfirmationModal'
import { usePartnerRegistration } from '../../../context/PartnerRegistrationContext'

function DriverRegistrationStep2() {
    const navigate = useNavigate()
    const { driverData, saveDriverStepData } = usePartnerRegistration()

    const [formData, setFormData] = useState({
        vehicleType: driverData.step2.vehicleType || 'motor',
        plateNumber: driverData.step2.plateNumber || '',
        vehicleBrand: driverData.step2.vehicleBrand || '',
        vehiclePhoto: driverData.step2.vehiclePhoto || null,
        stnkPhoto: driverData.step2.stnkPhoto || null
    })

    const [vehiclePreview, setVehiclePreview] = useState(null)
    const [stnkPreview, setStnkPreview] = useState(null)
    const [showExitModal, setShowExitModal] = useState(false)
    const [errors, setErrors] = useState({})

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }))
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
    }

    const handleVehiclePhotoChange = (file) => {
        setFormData(prev => ({ ...prev, vehiclePhoto: file }))
        const reader = new FileReader()
        reader.onloadend = () => setVehiclePreview(reader.result)
        reader.readAsDataURL(file)
        if (errors.vehiclePhoto) setErrors(prev => ({ ...prev, vehiclePhoto: null }))
    }

    const handleStnkPhotoChange = (file) => {
        setFormData(prev => ({ ...prev, stnkPhoto: file }))
        const reader = new FileReader()
        reader.onloadend = () => setStnkPreview(reader.result)
        reader.readAsDataURL(file)
        if (errors.stnkPhoto) setErrors(prev => ({ ...prev, stnkPhoto: null }))
    }

    const validate = () => {
        const newErrors = {}
        if (!formData.plateNumber.trim()) newErrors.plateNumber = "Plat nomor wajib diisi"
        if (!formData.vehicleBrand.trim()) newErrors.vehicleBrand = "Merk kendaraan wajib diisi"
        if (!formData.vehiclePhoto) newErrors.vehiclePhoto = "Foto kendaraan wajib diunggah"
        if (!formData.stnkPhoto) newErrors.stnkPhoto = "Foto STNK wajib diunggah"

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleContinue = (e) => {
        e.preventDefault()
        if (!validate()) return

        saveDriverStepData(2, formData)
        navigate('/partner/driver/step-3')
    }

    const handleBack = () => {
        saveDriverStepData(2, formData)
        navigate('/partner/driver/step-1')
    }

    return (
        <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark relative">
            <header className="bg-white dark:bg-card-dark px-4 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm border-b border-gray-100 dark:border-gray-800">
                <button
                    onClick={handleBack}
                    className="p-2 -ml-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white flex-1 text-center pr-10">
                    Data Kendaraan
                </h1>
            </header>

            <div className="bg-white dark:bg-card-dark px-4 pt-2 pb-4 mb-2">
                <ProgressBar
                    currentStep={2}
                    totalSteps={3}
                    labels={['Data Diri', 'Kendaraan', 'Dokumen']}
                />
            </div>

            <main className="flex-1 overflow-y-auto no-scrollbar px-4 pt-4 pb-bottom-nav">
                <form onSubmit={handleContinue} className="space-y-6">
                    {/* Jenis Kendaraan */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Jenis Kendaraan
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            {/* Motor */}
                            <div className="relative cursor-pointer group">
                                <input
                                    checked={formData.vehicleType === 'motor'}
                                    className="peer sr-only"
                                    id="type_motor"
                                    name="vehicle_type"
                                    type="radio"
                                    onChange={() => setFormData(prev => ({ ...prev, vehicleType: 'motor' }))}
                                />
                                <label
                                    className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-primary bg-orange-50/50 dark:bg-orange-900/10 cursor-pointer transition-all peer-checked:shadow-md h-full"
                                    htmlFor="type_motor"
                                >
                                    <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center mb-2 shadow-sm text-primary">
                                        <span className="material-symbols-outlined">two_wheeler</span>
                                    </div>
                                    <span className="font-bold text-primary text-sm">Motor</span>
                                    <div className="absolute top-2 right-2 text-primary">
                                        <span className="material-symbols-outlined text-lg">check_circle</span>
                                    </div>
                                </label>
                            </div>

                            {/* Mobil - Disabled */}
                            <div className="relative group">
                                <label className="flex flex-col items-center justify-center p-4 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 cursor-not-allowed transition-all text-gray-400 dark:text-gray-600 opacity-60 h-full">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center mb-2 text-gray-300 dark:text-gray-600">
                                        <span className="material-symbols-outlined">directions_car</span>
                                    </div>
                                    <span className="font-medium text-sm text-gray-400 dark:text-gray-600">Mobil</span>
                                </label>
                                <div className="absolute top-2 right-2">
                                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                                        Segera Hadir
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Plat Nomor */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2" htmlFor="plat">
                            Plat Nomor
                        </label>
                        <div className="relative">
                            <input
                                className={`w-full bg-white dark:bg-surface-dark border ${errors.plateNumber ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-gray-700 focus:ring-primary/20'} rounded-xl px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary transition-all outline-none shadow-sm uppercase`}
                                id="plat"
                                name="plateNumber"
                                placeholder="Contoh: B 1234 ABC"
                                type="text"
                                value={formData.plateNumber}
                                onChange={handleInputChange}
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                                <span className="material-symbols-outlined text-lg">credit_card</span>
                            </div>
                        </div>
                        {errors.plateNumber && <p className="text-red-500 text-xs mt-1 ml-1">{errors.plateNumber}</p>}
                    </div>

                    {/* Merk Motor */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2" htmlFor="merk">
                            Merk Motor
                        </label>
                        <input
                            className={`w-full bg-white dark:bg-surface-dark border ${errors.vehicleBrand ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-gray-700 focus:ring-primary/20'} rounded-xl px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary transition-all outline-none shadow-sm`}
                            id="merk"
                            name="vehicleBrand"
                            placeholder="Contoh: Honda Vario"
                            type="text"
                            value={formData.vehicleBrand}
                            onChange={handleInputChange}
                        />
                        {errors.vehicleBrand && <p className="text-red-500 text-xs mt-1 ml-1">{errors.vehicleBrand}</p>}
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-800 my-4"></div>

                    {/* Foto Motor */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Foto Motor <span className="text-xs font-normal text-gray-500 ml-1">(Tampak depan)</span>
                        </label>
                        <FileUploadZone
                            icon="add_a_photo"
                            title="Unggah Foto"
                            subtitle="PNG, JPG, max 5MB"
                            onChange={handleVehiclePhotoChange}
                            preview={vehiclePreview}
                            required={false}
                        />
                        {errors.vehiclePhoto && <p className="text-red-500 text-xs mt-1 ml-1">{errors.vehiclePhoto}</p>}
                    </div>

                    {/* Foto STNK */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Foto STNK <span className="text-xs font-normal text-gray-500 ml-1">(Harus terlihat jelas)</span>
                        </label>
                        <FileUploadZone
                            icon="post_add"
                            title="Unggah Dokumen"
                            subtitle="PNG, JPG, max 5MB"
                            onChange={handleStnkPhotoChange}
                            preview={stnkPreview}
                            required={false}
                        />
                        {errors.stnkPhoto && <p className="text-red-500 text-xs mt-1 ml-1">{errors.stnkPhoto}</p>}
                    </div>
                </form>
            </main>

            <div className="absolute bottom-0 left-0 right-0 px-4 pt-4 bg-white/80 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 z-20">
                <button
                    onClick={handleContinue}
                    className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-2xl active:shadow-none active:scale-[0.99] transition-all flex items-center justify-center gap-2 group"
                >
                    <span>Lanjutkan</span>
                    <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
            </div>

            <ExitConfirmationModal
                isOpen={showExitModal}
                onClose={() => setShowExitModal(false)}
                onConfirm={() => navigate(-1)}
            />
        </div>
    )
}

export default DriverRegistrationStep2
