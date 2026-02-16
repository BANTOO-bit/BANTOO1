import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { driverService } from '../../../services/driverService'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'
import PageLoader from '../../../components/shared/PageLoader'

function DriverEditBankPage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const toast = useToast()
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState({
        bank_name: '',
        bank_account_number: '',
        bank_account_name: ''
    })

    useEffect(() => {
        async function loadData() {
            try {
                const data = await driverService.getBankDetails()
                if (data) {
                    setFormData({
                        bank_name: data.bank_name || '',
                        bank_account_number: data.bank_account_number || '',
                        bank_account_name: data.bank_account_name || ''
                    })
                }
            } catch (error) {
                console.error('Error loading bank details:', error)
                toast.error('Gagal memuat data bank')
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [toast])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.bank_name || !formData.bank_account_number || !formData.bank_account_name) {
            toast.error('Mohon lengkapi semua data')
            return
        }

        setIsSaving(true)
        try {
            await driverService.updateProfile(user.id, {
                bank_name: formData.bank_name,
                bank_account_number: formData.bank_account_number,
                bank_account_name: formData.bank_account_name
            })
            toast.success('Data rekening berhasil disimpan')
            navigate('/driver/bank')
        } catch (error) {
            console.error('Error saving bank details:', error)
            toast.error('Gagal menyimpan perubahan')
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) return <PageLoader />

    return (
        <div className="font-display bg-background-light text-slate-900 antialiased min-h-screen">
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl bg-white">
                {/* Header */}
                <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
                    <div className="flex items-center px-4 h-[64px] gap-4">
                        <button
                            onClick={() => navigate('/driver/bank')}
                            className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full text-slate-700 hover:bg-slate-50 transition-colors active:scale-95"
                        >
                            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                        </button>
                        <h2 className="text-slate-900 text-lg font-bold leading-tight flex-1">Ubah Rekening</h2>
                    </div>
                </header>

                <main className="flex-1 p-6">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                        {/* Bank Name */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-slate-700">Nama Bank / E-Wallet</label>
                            <select
                                name="bank_name"
                                value={formData.bank_name}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            >
                                <option value="">Pilih Bank</option>
                                <option value="BCA">BCA</option>
                                <option value="BRI">BRI</option>
                                <option value="BNI">BNI</option>
                                <option value="MANDIRI">Mandiri</option>
                                <option value="JAGO">Bank Jago</option>
                                <option value="SEABANK">SeaBank</option>
                                <option value="GOPAY">GoPay</option>
                                <option value="OVO">OVO</option>
                                <option value="DANA">DANA</option>
                            </select>
                        </div>

                        {/* Account Number */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-slate-700">Nomor Rekening</label>
                            <input
                                type="text" // Number type sometimes annoying with leading zeros
                                name="bank_account_number"
                                value={formData.bank_account_number}
                                onChange={handleChange}
                                placeholder="Contoh: 1234567890"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                            />
                        </div>

                        {/* Account Holder Name */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-slate-700">Nama Pemilik Rekening</label>
                            <input
                                type="text"
                                name="bank_account_name"
                                value={formData.bank_account_name}
                                onChange={handleChange}
                                placeholder="Sesuai buku tabungan"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 uppercase"
                            />
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">info</span>
                                Harus sesuai dengan nama di KTP Anda.
                            </p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="mt-4 w-full bg-[#0d59f2] text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Menyimpan...
                                </>
                            ) : (
                                'Simpan Perubahan'
                            )}
                        </button>
                    </form>
                </main>
            </div>
        </div>
    )
}

export default DriverEditBankPage
