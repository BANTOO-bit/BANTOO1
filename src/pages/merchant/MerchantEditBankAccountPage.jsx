import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { handleError } from '../../utils/errorHandler'
import { supabase } from '../../services/supabaseClient'
import PageLoader from '../../components/shared/PageLoader'
import BankSelectSheet, { getBankDisplayName } from '../../components/shared/BankSelectSheet'

function MerchantEditBankAccountPage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const toast = useToast()
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isBankSheetOpen, setIsBankSheetOpen] = useState(false)
    const [formData, setFormData] = useState({
        bank_name: '',
        bank_account_number: '',
        bank_account_holder: ''
    })

    // Fetch existing bank data
    useEffect(() => {
        const fetchBankData = async () => {
            if (!user) return

            try {
                const { data, error } = await supabase
                    .from('merchants')
                    .select('bank_name, bank_account_number, bank_account_holder')
                    .eq('owner_id', user.id)
                    .single()

                if (error) throw error

                if (data) {
                    setFormData({
                        bank_name: data.bank_name || '',
                        bank_account_number: data.bank_account_number || '',
                        bank_account_holder: data.bank_account_holder || ''
                    })
                }
            } catch (error) {
                console.error('Error fetching bank data:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchBankData()
    }, [user])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleBankSelect = (bank) => {
        setFormData(prev => ({ ...prev, bank_name: bank.code }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSaving(true)

        try {
            const { error } = await supabase
                .from('merchants')
                .update({
                    bank_name: formData.bank_name,
                    bank_account_number: formData.bank_account_number,
                    bank_account_holder: formData.bank_account_holder
                })
                .eq('owner_id', user.id)

            if (error) throw error

            toast.success('Data rekening berhasil disimpan!')
            navigate(-1)
        } catch (error) {
            handleError(error, toast, { context: 'Save Bank Account' })
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) return <PageLoader />

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 relative min-h-screen flex flex-col overflow-x-hidden">
            <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 pt-12 pb-2 flex items-center justify-between border-b border-transparent dark:border-gray-800 transition-colors">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors -ml-2"
                >
                    <span className="material-symbols-outlined text-text-main dark:text-white">arrow_back</span>
                </button>
                <h1 className="text-text-main dark:text-white text-lg font-bold tracking-tight absolute left-1/2 transform -translate-x-1/2 whitespace-nowrap">Ubah Data Rekening</h1>
                <button
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className="text-primary font-bold text-base hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                    {isSaving ? '...' : 'Simpan'}
                </button>
            </header>

            <main className="flex flex-col gap-6 px-4 pt-6 flex-grow">
                <section className="bg-white dark:bg-card-dark rounded-2xl shadow-soft border border-border-color dark:border-gray-700 p-5 flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-text-main dark:text-white">Nama Bank</label>
                        <div className="relative" onClick={() => setIsBankSheetOpen(true)}>
                            <input
                                readOnly
                                value={getBankDisplayName(formData.bank_name)}
                                placeholder="Pilih Bank"
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-border-color dark:border-gray-700 text-text-main dark:text-white text-sm rounded-xl focus:ring-1 focus:ring-primary focus:border-primary block p-3.5 pr-10 cursor-pointer outline-none transition-all selection:bg-transparent"
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                <span className="material-symbols-outlined text-[20px]">expand_more</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-text-main dark:text-white">Nomor Rekening</label>
                        <input
                            name="bank_account_number"
                            value={formData.bank_account_number}
                            onChange={handleChange}
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-border-color dark:border-gray-700 text-text-main dark:text-white text-sm rounded-xl focus:ring-1 focus:ring-primary focus:border-primary block p-3.5 placeholder-gray-400 outline-none transition-all"
                            placeholder="Contoh: 1234..."
                            type="number"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-text-main dark:text-white">Nama Pemilik</label>
                        <input
                            name="bank_account_holder"
                            value={formData.bank_account_holder}
                            onChange={handleChange}
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-border-color dark:border-gray-700 text-text-main dark:text-white text-sm rounded-xl focus:ring-1 focus:ring-primary focus:border-primary block p-3.5 placeholder-gray-400 outline-none transition-all"
                            placeholder="Sesuaikan dengan buku tabungan"
                            type="text"
                        />
                    </div>
                </section>

                <div className="bg-gray-100/80 dark:bg-gray-800/50 rounded-xl p-4 flex gap-3 items-start border border-gray-100 dark:border-gray-700">
                    <span className="material-symbols-outlined text-text-secondary dark:text-gray-400 shrink-0 text-[20px] mt-0.5">info</span>
                    <div className="flex flex-col gap-1">
                        <h3 className="text-sm font-bold text-text-main dark:text-white">Penting</h3>
                        <p className="text-xs text-text-secondary dark:text-gray-400 leading-relaxed">
                            Pastikan nama pemilik rekening sama dengan nama di KTP Anda. Ketidakcocokan data dapat menyebabkan kendala dalam pencairan dana pendapatan Anda.
                        </p>
                    </div>
                </div>
            </main>

            <BankSelectSheet
                isOpen={isBankSheetOpen}
                onClose={() => setIsBankSheetOpen(false)}
                onSelect={handleBankSelect}
                selectedBankCode={formData.bank_name}
            />
        </div>
    )
}

export default MerchantEditBankAccountPage
