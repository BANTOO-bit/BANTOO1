import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MerchantCard from './MerchantCard'
import { merchantService } from '../../services/merchantService'

function MerchantList() {
    const navigate = useNavigate()
    const [merchants, setMerchants] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchMerchants() {
            try {
                // Fetch only 3 merchants for the homepage, similar to original mock behavior
                const data = await merchantService.getMerchants({ isOpen: true })
                setMerchants(data.slice(0, 3))
            } catch (error) {
                console.error('Failed to fetch homepage merchants:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchMerchants()
    }, [])

    if (isLoading) {
        return <div className="py-4 text-center text-sm text-gray-500">Memuat merchant...</div>
    }

    if (merchants.length === 0) {
        return (
            <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-sm text-gray-500">Belum ada merchant yang buka saat ini.</p>
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
