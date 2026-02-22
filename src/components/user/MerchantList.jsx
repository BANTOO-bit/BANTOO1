import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useSWR from 'swr'
import MerchantCard from './MerchantCard'
import { merchantService } from '../../services/merchantService'
import { supabase } from '../../services/supabaseClient'

function MerchantList() {
    const navigate = useNavigate()

    const { data: merchants = [], isLoading, mutate } = useSWR(
        'homepage_merchants',
        () => merchantService.getMerchants({ isOpen: null, limit: 5 }),
        { revalidateOnFocus: false } // Prevent excessive auto-refresh
    )

    useEffect(() => {
        // Set up Supabase Realtime subscription for merchant updates (e.g., Open/Close status)
        const subscription = supabase
            .channel('merchant_updates_homepage')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'merchants'
                },
                (payload) => {
                    // Update the local SWR cache instantly without re-fetching
                    mutate(currentMerchants => {
                        if (!currentMerchants) return []
                        return currentMerchants.map(merchant =>
                            merchant.id === payload.new.id
                                ? { ...merchant, ...payload.new }
                                : merchant
                        )
                    }, false)
                }
            )
            .subscribe()

        // Cleanup subscription when user leaves the homepage
        return () => {
            supabase.removeChannel(subscription)
        }
    }, [mutate])

    if (isLoading) {
        return <div className="py-4 text-center text-sm text-gray-500">Memuat merchant...</div>
    }

    if (merchants.length === 0) {
        return (
            <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-sm text-gray-500">Belum ada merchant yang tersedia.</p>
            </div>
        )
    }

    return (
        <section className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-text-main">Daftar Merchant</h2>
                <button
                    onClick={() => navigate('/merchants')}
                    className="text-sm text-primary font-medium hover:text-primary/80"
                >
                    Lihat Semua
                </button>
            </div>
            {merchants.map(merchant => (
                <MerchantCard
                    key={merchant.id}
                    merchant={merchant}
                    onClick={() => navigate(`/merchant/${merchant.id}`)}
                />
            ))}
        </section>
    )
}

export default MerchantList
