import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import BackButton from '../../components/shared/BackButton'
import { useToast } from '../../context/ToastContext'
import { handleError, handleSuccess } from '../../utils/errorHandler'
import MerchantBottomNavigation from '../../components/merchant/MerchantBottomNavigation'
import { supabase } from '../../services/supabaseClient'
import PageLoader from '../../components/shared/PageLoader'

function MerchantOperatingHoursPage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const toast = useToast()
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    const days = [
        { id: 'mon', label: 'Senin', defaultOpen: '08:00', defaultClose: '21:00' },
        { id: 'tue', label: 'Selasa', defaultOpen: '08:00', defaultClose: '21:00' },
        { id: 'wed', label: 'Rabu', defaultOpen: '08:00', defaultClose: '21:00' },
        { id: 'thu', label: 'Kamis', defaultOpen: '08:00', defaultClose: '21:00' },
        { id: 'fri', label: 'Jumat', defaultOpen: '13:00', defaultClose: '22:00' },
        { id: 'sat', label: 'Sabtu', defaultOpen: '08:00', defaultClose: '22:00' },
        { id: 'sun', label: 'Minggu', defaultOpen: '08:00', defaultClose: '21:00' }
    ]

    // Default schedule structure
    const defaultSchedule = {
        mon: { isOpen: true, open: '08:00', close: '21:00' },
        tue: { isOpen: true, open: '08:00', close: '21:00' },
        wed: { isOpen: true, open: '08:00', close: '21:00' },
        thu: { isOpen: true, open: '08:00', close: '21:00' },
        fri: { isOpen: true, open: '13:00', close: '22:00' },
        sat: { isOpen: true, open: '08:00', close: '22:00' },
        sun: { isOpen: false, open: '08:00', close: '21:00' }
    }

    const [schedule, setSchedule] = useState(defaultSchedule)

    // Fetch existing schedule
    useEffect(() => {
        const fetchSchedule = async () => {
            if (!user) return

            try {
                // Get Merchant ID
                const { data: merchantData, error: merchantError } = await supabase
                    .from('merchants')
                    .select('id, operating_hours')
                    .eq('owner_id', user.id)
                    .single()

                if (merchantError) throw merchantError

                if (merchantData.operating_hours) {
                    setSchedule(merchantData.operating_hours)
                }
            } catch (error) {
                console.error('Error fetching operating hours:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchSchedule()
    }, [user])

    const handleToggle = (dayId) => {
        setSchedule(prev => ({
            ...prev,
            [dayId]: { ...prev[dayId], isOpen: !prev[dayId].isOpen }
        }))
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const { error } = await supabase
                .from('merchants')
                .update({ operating_hours: schedule })
                .eq('owner_id', user.id)

            if (error) throw error

            toast.success('Jam operasional berhasil disimpan!')
            navigate(-1) // Go back
        } catch (error) {
            handleError(error, toast, { context: 'Save Operating Hours' })
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) return <PageLoader />

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 relative min-h-screen flex flex-col overflow-x-hidden pb-[140px]">
            <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 pt-12 pb-4 flex items-center justify-between border-b border-transparent dark:border-gray-800">
                <button
                    onClick={() => navigate(-1)}
                    className="w-9 h-9 flex items-center justify-center rounded-full active:bg-gray-200 dark:active:bg-gray-800 transition-colors -ml-1 text-text-main dark:text-white"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-lg font-bold text-text-main dark:text-white flex-1 text-center pr-8">Jam Operasional</h1>
            </header>

            <main className="flex flex-col gap-6 px-4 pt-4">
                <section>
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-800 flex items-start gap-3">
                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 mt-0.5">info</span>
                        <p className="text-sm text-text-main dark:text-blue-100 leading-snug">
                            Atur jadwal buka warungmu agar pelanggan dapat memesan tepat waktu.
                        </p>
                    </div>
                </section>

                <section className="flex flex-col gap-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-base font-bold text-text-main dark:text-white">Jadwal Mingguan</h3>
                        <button className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">Terapkan ke semua hari</button>
                    </div>

                    <div className="flex flex-col gap-3">
                        {days.map(day => (
                            <OperatingDayCard
                                key={day.id}
                                label={day.label}
                                data={schedule[day.id]}
                                onToggle={() => handleToggle(day.id)}
                            />
                        ))}
                    </div>
                </section>

                <div className="h-4"></div>
            </main>

            <div className="fixed bottom-[80px] left-0 right-0 px-4 pb-4 bg-gradient-to-t from-background-light via-background-light to-transparent dark:from-background-dark dark:via-background-dark pt-8 z-10 pointer-events-none">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center pointer-events-auto disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
            </div>

            <MerchantBottomNavigation activeTab="profile" />
        </div>
    )
}

function OperatingDayCard({ label, data, onToggle }) {
    return (
        <article className={`bg - card - light dark: bg - card - dark p - 4 rounded - 2xl shadow - soft border border - border - color dark: border - gray - 700 transition - colors ${!data.isOpen ? 'opacity-75' : ''} `}>
            <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-text-main dark:text-white">{label}</span>
                <div className="relative inline-block w-11 h-6 align-middle select-none transition duration-200 ease-in">
                    <label className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input
                                type="checkbox"
                                className="sr-only"
                                checked={data.isOpen}
                                onChange={onToggle}
                            />
                            <div className={`block w - 11 h - 6 rounded - full transition - colors ${data.isOpen ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'} `}></div>
                            <div className={`dot absolute left - 1 top - 1 bg - white w - 4 h - 4 rounded - full transition - transform ${data.isOpen ? 'translate-x-5' : ''} `}></div>
                        </div>
                    </label>
                </div>
            </div>

            {data.isOpen ? (
                <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                        <label className="absolute -top-2 left-2 px-1 bg-card-light dark:bg-card-dark text-[10px] font-semibold text-text-secondary">Jam Buka</label>
                        <div className="flex items-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5">
                            <span className="text-sm font-medium text-text-main dark:text-white flex-1">{data.open}</span>
                            <span className="material-symbols-outlined text-gray-400 text-[18px]">schedule</span>
                        </div>
                    </div>
                    <span className="text-gray-400">-</span>
                    <div className="flex-1 relative">
                        <label className="absolute -top-2 left-2 px-1 bg-card-light dark:bg-card-dark text-[10px] font-semibold text-text-secondary">Jam Tutup</label>
                        <div className="flex items-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5">
                            <span className="text-sm font-medium text-text-main dark:text-white flex-1">{data.close}</span>
                            <span className="material-symbols-outlined text-gray-400 text-[18px]">schedule</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mt-4 flex items-center justify-center p-2 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
                    <span className="text-sm font-bold text-red-500 dark:text-red-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[18px]">block</span>
                        Tutup
                    </span>
                </div>
            )}
        </article>
    )
}

export default MerchantOperatingHoursPage
