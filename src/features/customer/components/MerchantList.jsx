import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useSWR from 'swr'
import MerchantCard from '@/features/customer/components/MerchantCard'
import { merchantService } from '@/services/merchantService'
import { useRealtime } from '@/hooks/useRealtime'
import Skeleton, { MerchantCardSkeleton } from '@/features/shared/components/Skeleton'

function MerchantList() {
    const navigate = useNavigate()

    const { data: merchants = [], isLoading, mutate } = useSWR(
        'homepage_merchants',
        () => merchantService.getMerchants({ isOpen: null, limit: 5 }),
        { revalidateOnFocus: false } // Prevent excessive auto-refresh
    )

    // Realtime subscription for merchant updates
    useRealtime(
        'merchant_updates_homepage',
        {
            table: 'merchants',
            event: 'UPDATE',
        },
        (payload) => {
            mutate(currentMerchants => {
                if (!currentMerchants) return []
                return currentMerchants.map(merchant =>
                    merchant.id === payload.new.id
                        ? { ...merchant, ...payload.new }
                        : merchant
                )
            }, false)
        },
        true
    )

    if (isLoading) {
        return (
            <section className="flex flex-col gap-3">
                <div className="flex justify-between items-center mb-1">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-20" />
                </div>
                {[1, 2, 3, 4].map(i => (
                    <MerchantCardSkeleton key={i} />
                ))}
            </section>
        )
    }

    if (merchants.length === 0) {
        return (
            <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-sm text-gray-500">Belum ada warung yang tersedia.</p>
            </div>
        )
    }

    return (
        <section className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
                <h2 className="text-[15px] font-bold text-text-main">Warung Terdekat</h2>
                <button
                    onClick={() => navigate('/merchants')}
                    className="text-sm text-primary font-medium hover:text-primary/80"
                >
                    Lihat Semua
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
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
