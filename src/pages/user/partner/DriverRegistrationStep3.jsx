import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProgressBar from '../../../components/partner/ProgressBar'
import FileUploadZone from '../../../components/partner/FileUploadZone'
import { usePartnerRegistration } from '../../../context/PartnerRegistrationContext'
import BankSelectSheet, { getBankDisplayName } from '../../../components/shared/BankSelectSheet'

function DriverRegistrationStep3() {
    const navigate = useNavigate()
    const { driverData, saveDriverStepData, submitDriverRegistration } = usePartnerRegistration()

    const [formData, setFormData] = useState({
        idCardPhoto: driverData.step3.idCardPhoto || null,
        photoWithVehicle: driverData.step3.photoWithVehicle || null,
        bankName: driverData.step3.bankName || '',
        bankAccountName: driverData.step3.bankAccountName || '',
        bankAccountNumber: driverData.step3.bankAccountNumber || ''
    })

    const [idCardPreview, setIdCardPreview] = useState(null)
    const [withVehiclePreview, setWithVehiclePreview] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isBankSheetOpen, setIsBankSheetOpen] = useState(false)
    const [errors, setErrors] = useState({})

    const handleIdCardChange = (file) => {
        setFormData(prev => ({ ...prev, idCardPhoto: file }))
        const reader = new FileReader()
        reader.onloadend = () => setIdCardPreview(reader.result)
        reader.readAsDataURL(file)
        if (errors.idCardPhoto) setErrors(prev => ({ ...prev, idCardPhoto: null }))
    }

    const handleWithVehicleChange = (file) => {
        setFormData(prev => ({ ...prev, photoWithVehicle: file }))
        const reader = new FileReader()
        reader.onloadend = () => setWithVehiclePreview(reader.result)
        reader.readAsDataURL(file)
        if (errors.photoWithVehicle) setErrors(prev => ({ ...prev, photoWithVehicle: null }))
    }

    const validate = () => {
        const newErrors = {}
        if (!formData.idCardPhoto) newErrors.idCardPhoto = "Foto identitas wajib diunggah"
        if (!formData.photoWithVehicle) newErrors.photoWithVehicle = "Foto bersama kendaraan wajib diunggah"
        if (!formData.bankAccountName.trim()) newErrors.bankAccountName = "Nama pemilik rekening wajib diisi"
        if (!formData.bankName) newErrors.bankName = "Pilih bank/wallet"
        if (!formData.bankAccountNumber.toString().trim()) newErrors.bankAccountNumber = "Nomor rekening wajib diisi"

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) return

        setIsSubmitting(true)

        try {
            // Save step 3 data
            saveDriverStepData(3, formData)

            // Submit registration with formData directly to avoid stale state
            const result = await submitDriverRegistration(formData)

            if (result.success) {
                navigate('/partner/driver/status')
            } else {
                alert(result.error || 'Pendaftaran gagal. Silakan coba lagi.')
            }
        } catch (error) {
            console.error('Submission error:', error)
            alert('Terjadi kesalahan: ' + (error.message || 'Silakan coba lagi.'))
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleBack = () => {
        saveDriverStepData(3, formData)
        navigate('/partner/driver/step-2')
    }

    return (
        <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark relative">
            <header className="bg-white dark:bg-card-dark px-4 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm border-b border-gray-100 dark:border-gray-800">
                <button
                    onClick={handleBack}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-gray-900 dark:text-white">arrow_back</span>
                </button>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white flex-1 text-center">
                    Verifikasi Identitas
                </h1>
                <div className="w-10"></div>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar p-5 pb-32">
                <ProgressBar currentStep={3} totalSteps={3} />

                <div className="mb-6 text-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Unggah Dokumen
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed px-2">
                        Mohon unggah foto dokumen asli Anda agar akun driver Anda dapat segera diverifikasi. Pastikan foto terlihat jelas dan tidak buram.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* KTP */}
                    <div className={`bg-white dark:bg-surface-dark p-5 rounded-2xl border ${errors.idCardPhoto ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} shadow-sm`}>
                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-3xl">
                                    badge
                                </span>
                            </div>
                            <div className="w-full">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                    Foto KTP/Kartu Pelajar/SIM/dll
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                                    Pastikan nama terlihat jelas.
                                </p>
                                <FileUploadZone
                                    icon="add_a_photo"
                                    title="Ambil Foto"
                                    subtitle="Format JPG atau PNG"
                                    onChange={handleIdCardChange}
                                    preview={idCardPreview}
                                    required={false}
                                />
                                {errors.idCardPhoto && <p className="text-red-500 text-xs mt-2">{errors.idCardPhoto}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Foto Bersama Motor */}
                    <div className={`bg-white dark:bg-surface-dark p-5 rounded-2xl border ${errors.photoWithVehicle ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} shadow-sm`}>
                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-3xl">
                                    motorcycle
                                </span>
                            </div>
                            <div className="w-full">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                    Foto Bersama Motor
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                                    Pastikan kamu foto bersama motor terlihat jelas.
                                </p>
                                <FileUploadZone
                                    icon="add_a_photo"
                                    title="Ambil Foto"
                                    subtitle="Format JPG atau PNG"
                                    onChange={handleWithVehicleChange}
                                    preview={withVehiclePreview}
                                    required={false}
                                />
                                {errors.photoWithVehicle && <p className="text-red-500 text-xs mt-2">{errors.photoWithVehicle}</p>}
                            </div>
                        </div>
                    </div>
                </form>

                <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm mt-6">
                    <div className="flex flex-col items-center gap-4">
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-3xl">account_balance</span>
                        </div>
                        <div className="text-center mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Informasi Bank</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Masukkan data rekening pencairan dana.</p>
                        </div>
                        <div className="w-full space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nama Pemilik Rekening</label>
                                <input
                                    className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border ${errors.bankAccountName ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-gray-700 focus:ring-primary'} rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all placeholder:text-gray-400 text-sm`}
                                    placeholder="Sesuai buku tabungan"
                                    type="text"
                                    value={formData.bankAccountName || ''}
                                    onChange={(e) => {
                                        setFormData(prev => ({ ...prev, bankAccountName: e.target.value }))
                                        if (errors.bankAccountName) setErrors(prev => ({ ...prev, bankAccountName: null }))
                                    }}
                                />
                                {errors.bankAccountName && <p className="text-red-500 text-xs mt-1 ml-1">{errors.bankAccountName}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nama Bank/Wallet</label>
                                <div className="relative" onClick={() => setIsBankSheetOpen(true)}>
                                    <input
                                        readOnly
                                        value={getBankDisplayName(formData.bankName)}
                                        placeholder="Pilih Bank/Wallet"
                                        className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border ${errors.bankName ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-gray-700 focus:ring-primary'} rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all appearance-none text-sm text-gray-900 dark:text-white pr-10 cursor-pointer`}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
                                        <span className="material-symbols-outlined text-gray-400">expand_more</span>
                                    </span>
                                </div>
                                {errors.bankName && <p className="text-red-500 text-xs mt-1 ml-1">{errors.bankName}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nomor Rekening</label>
                                <input
                                    className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border ${errors.bankAccountNumber ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-gray-700 focus:ring-primary'} rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all placeholder:text-gray-400 text-sm`}
                                    placeholder="Contoh: 1234567890"
                                    type="number"
                                    value={formData.bankAccountNumber || ''}
                                    onChange={(e) => {
                                        setFormData(prev => ({ ...prev, bankAccountNumber: e.target.value }))
                                        if (errors.bankAccountNumber) setErrors(prev => ({ ...prev, bankAccountNumber: null }))
                                    }}
                                />
                                {errors.bankAccountNumber && <p className="text-red-500 text-xs mt-1 ml-1">{errors.bankAccountNumber}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Box */}
                <div className="mt-6 flex items-start gap-3 bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-lg border border-yellow-100 dark:border-yellow-800/30 text-left">
                    <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-500 text-xl shrink-0 mt-0.5">
                        info
                    </span>
                    <p className="text-xs text-yellow-800 dark:text-yellow-200/80 leading-snug">
                        Data Anda akan dijaga kerahasiaannya dan hanya digunakan untuk verifikasi pendaftaran mitra.
                    </p>
                </div>
            </main>

            <div className="absolute bottom-0 left-0 right-0 p-5 bg-white/80 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 z-20">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-2xl active:shadow-none active:scale-[0.99] transition-all flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span>{isSubmitting ? 'Mengirim...' : 'Kirim Pendaftaran'}</span>
                    <span className="material-symbols-outlined ml-2 group-hover:translate-x-1 transition-transform">
                        send
                    </span>
                </button>
            </div>

            <BankSelectSheet
                isOpen={isBankSheetOpen}
                onClose={() => setIsBankSheetOpen(false)}
                onSelect={(bank) => {
                    setFormData(prev => ({ ...prev, bankName: bank.code }))
                    if (errors.bankName) setErrors(prev => ({ ...prev, bankName: null }))
                }}
                selectedBankCode={formData.bankName}
            />
        </div>
    )
}

export default DriverRegistrationStep3
