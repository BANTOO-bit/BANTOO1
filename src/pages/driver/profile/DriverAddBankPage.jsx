import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { driverService } from '../../../services/driverService'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'
import { handleError } from '../../../utils/errorHandler'
import { validateForm, hasErrors, required, numeric, minLength } from '../../../utils/validation'
import PageLoader from '../../../components/shared/PageLoader'
import BankSelectSheet, { getBankDisplayName } from '../../../components/shared/BankSelectSheet'

function DriverAddBankPage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const toast = useToast()
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)
    const [isBankSheetOpen, setIsBankSheetOpen] = useState(false)
    const [formData, setFormData] = useState({
        bank: '',
        number: '',
        holder: ''
    })
    const [errors, setErrors] = useState({})

    const bankSchema = {
        bank: [required('Pilih bank terlebih dahulu')],
        number: [required('Nomor rekening wajib diisi'), numeric(), minLength(10, 'Nomor rekening minimal 10 digit')],
        holder: [required('Nama pemilik rekening wajib diisi'), minLength(3, 'Nama minimal 3 karakter')],
    }

    useEffect(() => {
        fetchCurrentData()
    }, [])

    const fetchCurrentData = async () => {
        try {
            const data = await driverService.getBankDetails()
            if (data) {
                setFormData({
                    bank: data.bank_name || '',
                    number: data.bank_account_number || '',
                    holder: data.bank_account_name || ''
                })
            }
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error('Error fetching bank details:', error)
        } finally {
            setInitialLoading(false)
        }
    }

    const handleSave = async () => {
        const validationErrors = validateForm(formData, bankSchema)
        if (hasErrors(validationErrors)) {
            setErrors(validationErrors)
            return
        }

        setLoading(true)
        try {
            await driverService.updateDriver(user.id, {
                bank_name: formData.bank,
                bank_account_number: formData.number,
                bank_account_name: formData.holder
            })

            toast.success('Rekening berhasil disimpan')
            navigate('/driver/bank')
        } catch (error) {
            handleError(error, toast, { context: 'Simpan rekening' })
        } finally {
            setLoading(false)
        }
    }

    if (initialLoading) return <PageLoader />

    return (
        <div className="font-display bg-background-light text-slate-900 antialiased min-h-screen">
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl bg-white">
                {/* Header */}
                <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
                    <div className="flex items-center px-4 h-[64px] gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full text-slate-700 hover:bg-slate-50 transition-colors active:scale-95"
                        >
                            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                        </button>
                        <h2 className="text-slate-900 text-lg font-bold leading-tight flex-1">Tambah Rekening</h2>
                    </div>
                </header>

                <main className="flex-1 p-5 pb-10 flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Pilih Bank / E-Wallet</label>
                        <div className="relative" onClick={() => setIsBankSheetOpen(true)}>
                            <input
                                readOnly
                                value={getBankDisplayName(formData.bank)}
                                placeholder="Pilih Bank Tujuan"
                                className={`w-full p-4 pr-10 rounded-xl border bg-white text-slate-900 font-bold focus:border-[#0d59f2] focus:ring-0 outline-none appearance-none cursor-pointer ${errors.bank ? 'border-red-400' : 'border-slate-200'}`}
                            />
                            {errors.bank && <p className="text-xs text-red-500 mt-1">{errors.bank}</p>}
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-slate-500">keyboard_arrow_down</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Nomor Rekening / HP</label>
                        <input
                            type="number"
                            value={formData.number}
                            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                            placeholder="Contoh: 1234567890"
                            className={`w-full p-4 rounded-xl border bg-white text-slate-900 font-bold placeholder:font-normal placeholder:text-slate-400 focus:border-[#0d59f2] focus:ring-0 outline-none ${errors.number ? 'border-red-400' : 'border-slate-200'}`}
                        />
                        {errors.number && <p className="text-xs text-red-500 mt-1">{errors.number}</p>}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Nama Pemilik Rekening</label>
                        <input
                            type="text"
                            value={formData.holder}
                            onChange={(e) => setFormData({ ...formData, holder: e.target.value.toUpperCase() })}
                            placeholder="Nama sesuai buku tabungan"
                            className={`w-full p-4 rounded-xl border bg-white text-slate-900 font-bold placeholder:font-normal placeholder:text-slate-400 focus:border-[#0d59f2] focus:ring-0 outline-none uppercase ${errors.holder ? 'border-red-400' : 'border-slate-200'}`}
                        />
                        {errors.holder && <p className="text-xs text-red-500 mt-1">{errors.holder}</p>}
                        <p className="text-xs text-slate-500 ml-1">Wajib sama dengan nama di KTP Anda.</p>
                    </div>

                    <div className="flex-1"></div>

                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full bg-[#0d59f2] hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-4 rounded-xl text-base transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                        {loading ? 'MENYIMPAN...' : 'SIMPAN REKENING'}
                    </button>
                </main>
            </div>

            <BankSelectSheet
                isOpen={isBankSheetOpen}
                onClose={() => setIsBankSheetOpen(false)}
                onSelect={(bank) => setFormData(prev => ({ ...prev, bank: bank.code }))}
                selectedBankCode={formData.bank}
            />
        </div>
    )
}

export default DriverAddBankPage
