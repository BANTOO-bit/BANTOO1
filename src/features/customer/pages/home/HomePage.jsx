import { useNavigate } from 'react-router-dom'
import { useOrder } from '@/context/OrderContext'
import usePullToRefresh from '@/hooks/usePullToRefresh'
import Header from '@/features/customer/components/Header'
import AddressSelector from '@/features/customer/components/AddressSelector'
import SearchBar from '@/features/customer/components/SearchBar'
// PromoBanner — aktifkan nanti saat promo sudah real
// import PromoBanner from '@/features/customer/components/PromoBanner'
import CategoryGrid from '@/features/customer/components/CategoryGrid'
import ReorderSection from '@/features/customer/components/ReorderSection'
import MenuPopuler from '@/features/customer/components/MenuPopuler'
import MerchantList from '@/features/customer/components/MerchantList'
import HelpButton from '@/features/customer/components/HelpButton'
import CTASection from '@/features/shared/components/CTASection'
import BottomNavigation from '@/features/customer/components/BottomNavigation'
import SEO from '@/features/shared/components/SEO'

function HomePage() {
    const navigate = useNavigate()
    const { fetchOrders } = useOrder()

    const { pullRef, PullIndicator } = usePullToRefresh(async () => {
        await fetchOrders()
        // SWR caches will also revalidate on the next render
        window.dispatchEvent(new Event('pull-refresh'))
    })

    const handleMerchantClick = (merchant) => {
        navigate(`/merchant/${merchant.id}`)
    }

    return (
        <div
            ref={pullRef}
            className="relative min-h-screen flex flex-col overflow-x-hidden pb-bottom-nav bg-background-light overflow-y-auto"
        >
            <SEO />
            <Header />
            <AddressSelector />
            <SearchBar />

            <PullIndicator />

            <main className="flex flex-col gap-5 px-4 pt-1">
                <div className="animate-fade-in-up stagger-1">
                    <CategoryGrid />
                </div>
                <div className="animate-fade-in-up stagger-2">
                    <ReorderSection />
                </div>
                <div className="animate-fade-in-up stagger-3">
                    <MenuPopuler />
                </div>
                <div className="animate-fade-in-up stagger-4">
                    <MerchantList onMerchantClick={handleMerchantClick} />
                </div>
                <div className="animate-fade-in-up stagger-5">
                    <HelpButton />
                    <CTASection />
                </div>
                <div className="h-4"></div>
            </main>

            <BottomNavigation activeTab="home" />
        </div>
    )
}

export default HomePage
