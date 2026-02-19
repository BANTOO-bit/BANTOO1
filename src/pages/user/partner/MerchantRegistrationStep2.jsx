import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProgressBar from '../../../components/partner/ProgressBar'
import FileUploadZone from '../../../components/partner/FileUploadZone'
import { usePartnerRegistration } from '../../../context/PartnerRegistrationContext'
import BankSelectSheet, { getBankDisplayName } from '../../../components/shared/BankSelectSheet'
import { useToast } from '../../../context/ToastContext'
import { handleError } from '../../../utils/errorHandler'

function MerchantRegistrationStep2() {
    const navigate = useNavigate()
    const toast = useToast()
    const { merchantData, saveMerchantStepData, submitMerchantRegistration } = usePartnerRegistration()

    const [formData, setFormData] = useState({
        idCardPhoto: merchantData.step2.idCardPhoto || null,
        shopPhoto: merchantData.step2.shopPhoto || null,
        bankName: merchantData.step2.bankName || '',
        bankAccountName: merchantData.step2.bankAccountName || '',
        bankAccountNumber: merchantData.step2.bankAccountNumber || ''
    })

    const [idCardPreview, setIdCardPreview] = useState(null)
    const [shopPreview, setShopPreview] = useState(null)
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

    const handleShopPhotoChange = (file) => {
        setFormData(prev => ({ ...prev, shopPhoto: file }))
        const reader = new FileReader()
        reader.onloadend = () => setShopPreview(reader.result)
        reader.readAsDataURL(file)
        if (errors.shopPhoto) setErrors(prev => ({ ...prev, shopPhoto: null }))
    }

    const validate = () => {
        const newErrors = {}
        if (!formData.idCardPhoto) newErrors.idCardPhoto = "Foto KTP wajib diunggah"
        if (!formData.shopPhoto) newErrors.shopPhoto = "Foto warung wajib diunggah"
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
            // Pass formData directly to avoid stale React state
            saveMerchantStepData(2, formData)
            const result = await submitMerchantRegistration(formData)

            if (result.success) {
                navigate('/partner/merchant/status')
            } else {
                alert(result.error || 'Pendaftaran gagal. Silakan coba lagi.')
            }
        } catch (error) {
            handleError(error, toast, { context: 'Pendaftaran merchant' })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleBack = () => {
        saveMerchantStepData(2, formData)
        navigate('/partner/merchant/step-1')
    }

    return (
        <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark relative">
            <header className="bg-white dark:bg-card-dark px-4 py-4 flex items-center sticky top-0 z-20 shadow-sm border-b border-gray-100 dark:border-gray-800 relative">
                <button
                    onClick={handleBack}
                    className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-800 dark:text-white z-10 relative"
                >
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </button>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2/3 text-center truncate">
                    Verifikasi Dokumen
                </h1>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar px-4 pt-4 pb-bottom-nav">
                <ProgressBar currentStep={2} totalSteps={2} />

                <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">
                        Verifikasi Warung
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Unggah foto dokumen yang diperlukan untuk memverifikasi keaslian warung Anda.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Foto KTP Pemilik */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Foto KTP Pemilik <span className="text-red-500">*</span>
                        </label>
                        <div className={`w-full h-48 border-2 border-dashed ${errors.idCardPhoto ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-dark'} rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group relative overflow-hidden`}>
                            <FileUploadZone
                                icon="add_a_photo"
                                title="Ambil Foto KTP"
                                subtitle="Format JPG atau PNG"
                                onChange={handleIdCardChange}
                                preview={idCardPreview}
                                required={false} // Handled by custom validation
                            />
                        </div>
                        {errors.idCardPhoto ? (
                            <p className="text-red-500 text-xs mt-2">{errors.idCardPhoto}</p>
                        ) : (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-start gap-1">
                                <span className="material-symbols-outlined text-sm text-yellow-500">info</span>
                                Pastikan tulisan pada KTP terbaca jelas dan tidak buram.
                            </p>
                        )}
                    </div>

                    {/* Foto Warung */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Foto Warung (Tampak Depan) <span className="text-red-500">*</span>
                        </label>
                        <div className={`w-full h-48 border-2 border-dashed ${errors.shopPhoto ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-dark'} rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group relative overflow-hidden`}>
                            <FileUploadZone
                                icon="storefront"
                                title="Ambil Foto Warung"
                                subtitle="Format JPG atau PNG"
                                onChange={handleShopPhotoChange}
                                preview={shopPreview}
                                required={false}
                            />
                        </div>
                        {errors.shopPhoto ? (
                            <p className="text-red-500 text-xs mt-2">{errors.shopPhoto}</p>
                        ) : (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-start gap-1">
                                <span className="material-symbols-outlined text-sm text-yellow-500">info</span>
                                Pastikan bangunan warung terlihat sepenuhnya.
                            </p>
                        )}
                    </div>

                    <div className="pt-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Informasi Rekening</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2" htmlFor="bankAccountName">
                                    Nama Pemilik Rekening
                                </label>
                                <input
                                    className={`w-full px-4 py-3 bg-white dark:bg-surface-dark border ${errors.bankAccountName ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-gray-700 focus:ring-primary'} rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all shadow-sm text-gray-900 dark:text-white placeholder-gray-400`}
                                    id="bankAccountName"
                                    name="bankAccountName"
                                    placeholder="Masukkan nama sesuai buku tabungan"
                                    type="text"
                                    value={formData.bankAccountName || ''}
                                    onChange={(e) => {
                                        setFormData(prev => ({ ...prev, bankAccountName: e.target.value }))
                                        if (errors.bankAccountName) setErrors(prev => ({ ...prev, bankAccountName: null }))
                                    }}
                                />
                                {errors.bankAccountName && <p className="text-red-500 text-xs mt-1 ml-1">{errors.bankAccountName}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2" htmlFor="bankName">
                                    Nama Bank/Wallet
                                </label>
                                <div className="relative" onClick={() => setIsBankSheetOpen(true)}>
                                    <input
                                        readOnly
                                        value={getBankDisplayName(formData.bankName)}
                                        placeholder="Pilih Bank/Wallet"
                                        className={`w-full px-4 py-3 bg-white dark:bg-surface-dark border ${errors.bankName ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-gray-700 focus:ring-primary'} rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all shadow-sm text-gray-900 dark:text-white appearance-none cursor-pointer pr-10`}
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400">
                                        <span className="material-symbols-outlined text-2xl">expand_more</span>
                                    </div>
                                </div>
                                {errors.bankName && <p className="text-red-500 text-xs mt-1 ml-1">{errors.bankName}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2" htmlFor="bankAccountNumber">
                                    Nomor Rekening
                                </label>
                                <input
                                    className={`w-full px-4 py-3 bg-white dark:bg-surface-dark border ${errors.bankAccountNumber ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-gray-700 focus:ring-primary'} rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all shadow-sm text-gray-900 dark:text-white placeholder-gray-400`}
                                    id="bankAccountNumber"
                                    name="bankAccountNumber"
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

                    <div className="pt-2">
                        <p className="text-xs text-gray-400 italic">* Wajib diisi</p>
                    </div>
                </form>
            </main>

            <div className="absolute bottom-0 left-0 right-0 px-4 pt-4 bg-white/80 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 z-20">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl active:shadow-none active:scale-[0.99] transition-all flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span>{isSubmitting ? 'Mengirim...' : 'Kirim Pendaftaran'}</span>
                    <span className="material-symbols-outlined ml-2 group-hover:translate-x-1 transition-transform text-sm">
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

export default MerchantRegistrationStep2
