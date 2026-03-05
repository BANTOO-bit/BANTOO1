import { useNavigate } from 'react-router-dom'
import Header from '@/features/customer/components/Header'
import AddressSelector from '@/features/customer/components/AddressSelector'
import SearchBar from '@/features/customer/components/SearchBar'
import MenuPopuler from '@/features/customer/components/MenuPopuler'
import MerchantList from '@/features/customer/components/MerchantList'
import HelpButton from '@/features/customer/components/HelpButton'
import CTASection from '@/features/shared/components/CTASection'
import BottomNavigation from '@/features/customer/components/BottomNavigation'
import SEO from '@/features/shared/components/SEO'

function HomePage() {
    const navigate = useNavigate()

    const handleMerchantClick = (merchant) => {
        navigate(`/merchant/${merchant.id}`)
    }

    return (
        <div className="relative min-h-screen flex flex-col overflow-x-hidden pb-bottom-nav bg-background-light">
            <SEO />
            <Header />
            <AddressSelector />
            <SearchBar />

            <main className="flex flex-col gap-6 px-4">
                <MenuPopuler />
                <MerchantList onMerchantClick={handleMerchantClick} />
                <HelpButton />
                <CTASection />
                <div className="h-4"></div>
            </main>

            <BottomNavigation activeTab="home" />
        </div>
    )
}

export default HomePage

