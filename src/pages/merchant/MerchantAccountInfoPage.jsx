import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { merchantService } from '../../services/merchantService'
import PageLoader from '../../components/shared/PageLoader'
import { useToast } from '../../context/ToastContext'

function MerchantAccountInfoPage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const toast = useToast()
    const [merchant, setMerchant] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchMerchantData = async () => {
            if (!user?.merchantId) {
                setLoading(false)
                return
            }

            try {
                const data = await merchantService.getMerchantById(user.merchantId)

                // Combine auth user data with merchant data
                // Some info like email/phone comes from auth user/profile, some from merchant table
                setMerchant({
                    ...data,
                    email: user.email || user.user_metadata?.email,
                    // Prefer merchant phone if valid, else user phone
                    displayPhone: data.phone || user.phone,
                    ownerName: user.fullName || user.user_metadata?.full_name
                })
            } catch (error) {
                console.error('Error fetching merchant info:', error)
                toast.error('Gagal memuat informasi akun')
            } finally {
                setLoading(false)
            }
        }

        fetchMerchantData()
    }, [user])

    if (loading) return <PageLoader />

    // Fallback if no merchant data found
    if (!merchant && !loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <p className="text-gray-500">Data merchant tidak ditemukan.</p>
                <button onClick={() => navigate(-1)} className="mt-4 text-primary">Kembali</button>
            </div>
        )
    }

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 relative min-h-screen flex flex-col overflow-x-hidden pb-[88px]">
            <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 pt-12 pb-4 flex items-center justify-between border-b border-transparent dark:border-gray-800">
                <button
                    onClick={() => navigate(-1)}
                    className="w-8 h-8 flex items-center justify-center text-text-main dark:text-white"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-lg font-bold text-text-main dark:text-white leading-tight">Informasi Akun</h1>
                <div className="w-8"></div>
            </header>

            <main className="flex flex-col gap-6 px-4 pt-4">
                <div className="bg-card-light dark:bg-card-dark rounded-2xl shadow-soft overflow-hidden">
                    <div className="divide-y divide-border-color dark:divide-gray-800">
                        <div className="flex items-center justify-between p-4">
                            <span className="text-sm font-medium text-text-secondary dark:text-gray-400">ID Mitra</span>
                            <span className="text-sm font-semibold text-text-main dark:text-white font-mono">
                                {merchant?.id?.slice(0, 8).toUpperCase() || '-'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-4">
                            <span className="text-sm font-medium text-text-secondary dark:text-gray-400">Nama Warung</span>
                            <span className="text-sm font-semibold text-text-main dark:text-white text-right">{merchant?.name || '-'}</span>
                        </div>
                        {/* 
                           Note: 'Username' is not a standard field in our auth/merchant schema yet. 
                           Using Owner Name instead or hiding if not applicable.
                           If username is strictly required, we need to add it to profiles table.
                           For now, showing Owner Name as it's more relevant. 
                        */}
                        <div className="flex items-center justify-between p-4">
                            <span className="text-sm font-medium text-text-secondary dark:text-gray-400">Nama Pemilik</span>
                            <span className="text-sm font-semibold text-text-main dark:text-white">{merchant?.ownerName || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between p-4">
                            <span className="text-sm font-medium text-text-secondary dark:text-gray-400">Email Terdaftar</span>
                            <span className="text-sm font-semibold text-text-main dark:text-white text-right max-w-[60%] truncate">
                                {merchant?.email || '-'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-4">
                            <span className="text-sm font-medium text-text-secondary dark:text-gray-400">Nomor Telepon</span>
                            <span className="text-sm font-semibold text-text-main dark:text-white text-right">
                                {merchant?.displayPhone || '-'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-4">
                            <span className="text-sm font-medium text-text-secondary dark:text-gray-400">Tanggal Bergabung</span>
                            <span className="text-sm font-semibold text-text-main dark:text-white">
                                {merchant?.created_at ? new Date(merchant.created_at).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                }) : '-'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 mt-2">
                    <p className="text-xs text-center text-text-secondary dark:text-gray-500 px-4">
                        Informasi di atas hanya dapat diubah melalui verifikasi Admin untuk keamanan akun Anda.
                    </p>
                    <button className="w-full py-4 bg-primary hover:bg-primary-dark active:scale-[0.99] transition-all text-white font-semibold rounded-2xl shadow-md flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">support_agent</span>
                        Hubungi Admin
                    </button>
                </div>
                <div className="h-4"></div>
            </main>
        </div>
    )
}

export default MerchantAccountInfoPage
