import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { merchantService } from '../../../services/merchantService'
import { useToast } from '../../../context/ToastContext'
import { handleError } from '../../../utils/errorHandler'
import MerchantBottomNavigation from '../../../components/merchant/MerchantBottomNavigation'
import PageLoader from '../../../components/shared/PageLoader'
import BankSelectSheet, { getBankDisplayName } from '../../../components/shared/BankSelectSheet'

function MerchantAddBankAccountPage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const toast = useToast()

    const [formData, setFormData] = useState({
        bankName: '',
        accountNumber: '',
        accountName: ''
    })
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)
    const [isBankSheetOpen, setIsBankSheetOpen] = useState(false)

    // Load existing bank data
    useEffect(() => {
        const fetchCurrentData = async () => {
            if (!user?.merchantId) {
                setInitialLoading(false)
                return
            }

            try {
                const merchant = await merchantService.getMerchantById(user.merchantId)
                if (merchant) {
                    setFormData({
                        bankName: merchant.bank_name || '',
                        accountNumber: merchant.bank_account_number || '',
                        accountName: merchant.bank_account_name || ''
                    })
                }
            } catch (error) {
                if (process.env.NODE_ENV === 'development') console.error('Error fetching bank data:', error)
            } finally {
                setInitialLoading(false)
            }
        }

        fetchCurrentData()
    }, [user?.merchantId])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.bankName || !formData.accountNumber || !formData.accountName) {
            toast.error('Mohon lengkapi semua data')
            return
        }

        setLoading(true)
        try {
            await merchantService.updateMerchant(user.merchantId, {
                bank_name: formData.bankName,
                bank_account_number: formData.accountNumber,
                bank_account_name: formData.accountName
            })

            toast.success('Rekening berhasil disimpan')
            navigate(-1) // Go back to balance page
        } catch (error) {
            handleError(error, toast, { context: 'Simpan rekening merchant' })
        } finally {
            setLoading(false)
        }
    }

    if (initialLoading) return <PageLoader />

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 relative min-h-screen flex flex-col overflow-x-hidden">
            <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 pt-12 pb-4 flex items-center justify-between border-b border-transparent dark:border-gray-800">
                <button
                    onClick={() => navigate(-1)}
                    className="text-[#7A7A7A] text-base font-medium hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    Kembali
                </button>
                <h1 className="text-lg font-bold text-text-main dark:text-white leading-tight">Tambah Rekening</h1>
                <button
                    className="text-primary text-base font-bold hover:text-primary-dark transition-colors disabled:opacity-50"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
            </header>

            <main className="flex flex-col gap-6 px-4 pt-6 pb-bottom-nav">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-text-main dark:text-gray-200">Bank atau E-Wallet</label>
                        <div className="relative" onClick={() => setIsBankSheetOpen(true)}>
                            <input
                                readOnly
                                value={getBankDisplayName(formData.bankName)}
                                placeholder="Pilih Bank atau E-Wallet"
                                className="w-full bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-[16px] px-4 py-3.5 pr-10 text-text-main dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none cursor-pointer transition-shadow shadow-sm appearance-none"
                            />
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-gray-500">keyboard_arrow_down</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-text-main dark:text-gray-200">Nomor Rekening</label>
                        <input
                            name="accountNumber"
                            value={formData.accountNumber}
                            onChange={handleChange}
                            className="w-full bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-[16px] px-4 py-3.5 text-text-main dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm transition-shadow"
                            placeholder="Contoh: 1234567890"
                            type="number"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-text-main dark:text-gray-200">Nama Pemilik Rekening</label>
                        <input
                            name="accountName"
                            value={formData.accountName}
                            onChange={handleChange}
                            className="w-full bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-[16px] px-4 py-3.5 text-text-main dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm transition-shadow"
                            placeholder="Sesuaikan dengan buku tabungan"
                            type="text"
                        />
                    </div>
                </form>

                <div className="bg-gray-100 dark:bg-gray-800/50 rounded-[16px] p-4 flex gap-3 border border-gray-200 dark:border-gray-700 mt-2">
                    <div className="flex-shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 text-[20px]">info</span>
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">Penting</h4>
                        <p className="text-xs text-text-secondary leading-relaxed">
                            Nama pemilik rekening <span className="font-semibold">WAJIB</span> sama dengan nama pada KTP pendaftar untuk kelancaran proses pencairan dana. Verifikasi rekening membutuhkan waktu maksimal <span className="font-semibold">24 jam</span>. Bantoo! menjamin keamanan data finansial Anda dengan enkripsi standar industri.
                        </p>
                    </div>
                </div>
            </main>

            <MerchantBottomNavigation activeTab="profile" />

            <BankSelectSheet
                isOpen={isBankSheetOpen}
                onClose={() => setIsBankSheetOpen(false)}
                onSelect={(bank) => setFormData(prev => ({ ...prev, bankName: bank.code }))}
                selectedBankCode={formData.bankName}
            />
        </div>
    )
}

export default MerchantAddBankAccountPage
