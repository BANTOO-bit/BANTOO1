import { useNavigate } from 'react-router-dom'
import Header from '../../../components/user/Header'
import AddressSelector from '../../../components/user/AddressSelector'
import SearchBar from '../../../components/user/SearchBar'
import MenuPopuler from '../../../components/user/MenuPopuler'
import MerchantList from '../../../components/user/MerchantList'
import HelpButton from '../../../components/user/HelpButton'
import CTASection from '../../../components/shared/CTASection'
import BottomNavigation from '../../../components/user/BottomNavigation'

function HomePage() {
    const navigate = useNavigate()

    const handleMerchantClick = (merchant) => {
        navigate(`/merchant/${merchant.id}`)
    }

    return (
        <div className="relative min-h-screen flex flex-col overflow-x-hidden pb-[88px] bg-background-light">
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

