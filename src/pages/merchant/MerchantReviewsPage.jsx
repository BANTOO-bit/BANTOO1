import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MerchantBottomNavigation from '../../components/merchant/MerchantBottomNavigation'

function MerchantReviewsPage() {
    const navigate = useNavigate()
    const [activeFilter, setActiveFilter] = useState('all') // all, with_photo, reply_needed

    // Mock Data
    const reviews = [
        {
            id: 1,
            customer: {
                name: 'Rizky Ramadhan',
                avatar: 'https://i.pravatar.cc/150?u=rizky',
            },
            date: '20 Okt 2024',
            rating: 5,
            items: 'Bakso Urat Jumbo, Es Teh Manis',
            comment: 'Baksonya enak banget, kuahnya gurih! Pengiriman juga cepat. Mantap 👍',
            photos: [
                'https://placehold.co/200x200/orange/white?text=Bakso',
                'https://placehold.co/200x200/orange/white?text=Es+Teh'
            ],
            reply: null
        },
        {
            id: 2,
            customer: {
                name: 'Siti Aminah',
                avatar: 'https://i.pravatar.cc/150?u=siti',
            },
            date: '19 Okt 2024',
            rating: 4,
            items: 'Mie Ayam Ceker',
            comment: 'Rasanya oke, tapi cekernya agak keras dikit. Tolong diperbaiki ya.',
            photos: [],
            reply: 'Terima kasih masukannya kak Siti. Mohon maaf atas ketidaknyamanannya, akan kami perbaiki kedepannya.'
        },
        {
            id: 3,
            customer: {
                name: 'Budi Santoso',
                avatar: 'https://i.pravatar.cc/150?u=budi',
            },
            date: '18 Okt 2024',
            rating: 5,
            items: 'Es Jeruk Peras',
            comment: 'Seger banget es jeruknya!',
            photos: [],
            reply: null
        }
    ]

    const filteredReviews = reviews.filter(review => {
        if (activeFilter === 'with_photo') return review.photos.length > 0
        if (activeFilter === 'reply_needed') return review.reply === null
        return true
    })

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 relative min-h-screen flex flex-col overflow-x-hidden pb-[88px]">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 pt-12 pb-4 flex items-center justify-center relative border-b border-gray-200 dark:border-gray-800">
                <button
                    onClick={() => navigate(-1)}
                    className="absolute left-4 top-auto p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-text-main dark:text-white">arrow_back</span>
                </button>
                <h1 className="text-lg font-bold text-text-main dark:text-white">Ulasan Pembeli</h1>
            </header>

            <main className="flex flex-col gap-6 px-4 pt-4">
                {/* Summary Section */}
                <section className="bg-white dark:bg-card-dark p-5 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700 flex items-center gap-6">
                    <div className="flex flex-col items-center justify-center gap-1 min-w-[80px]">
                        <span className="text-4xl font-bold text-text-main dark:text-white">4.8</span>
                        <div className="flex text-yellow-400 text-sm">
                            <span className="material-symbols-outlined fill-current text-[16px]">star</span>
                            <span className="material-symbols-outlined fill-current text-[16px]">star</span>
                            <span className="material-symbols-outlined fill-current text-[16px]">star</span>
                            <span className="material-symbols-outlined fill-current text-[16px]">star</span>
                            <span className="material-symbols-outlined fill-current text-[16px]">star_half</span>
                        </div>
                        <span className="text-[10px] text-text-secondary">86 Ulasan</span>
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5 border-l border-gray-100 dark:border-gray-700 pl-6">
                        {[5, 4, 3, 2, 1].map((star, idx) => (
                            <div key={star} className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-text-secondary w-2">{star}</span>
                                <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-yellow-400 rounded-full"
                                        style={{ width: idx === 0 ? '70%' : idx === 1 ? '20%' : '5%' }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Filter Tabs */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {[
                        { id: 'all', label: 'Semua' },
                        { id: 'with_photo', label: 'Dengan Foto' },
                        { id: 'reply_needed', label: 'Perlu Dibalas' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveFilter(tab.id)}
                            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${activeFilter === tab.id
                                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                                    : 'bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 text-text-secondary hover:bg-gray-50'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Review List */}
                <div className="flex flex-col gap-4">
                    {filteredReviews.map(review => (
                        <article key={review.id} className="bg-white dark:bg-card-dark rounded-2xl p-4 shadow-soft border border-gray-100 dark:border-gray-700 flex flex-col gap-3">
                            {/* Reviewer Header */}
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={review.customer.avatar}
                                        alt={review.customer.name}
                                        className="w-10 h-10 rounded-full object-cover bg-gray-200"
                                    />
                                    <div className="flex flex-col">
                                        <h3 className="text-sm font-bold text-text-main dark:text-white">{review.customer.name}</h3>
                                        <div className="flex items-center gap-1.5">
                                            <div className="flex text-yellow-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <span key={i} className={`material-symbols-outlined text-[14px] ${i < review.rating ? 'fill-current' : 'text-gray-300'}`}>star</span>
                                                ))}
                                            </div>
                                            <span className="text-[10px] text-text-secondary">• {review.date}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Ordered Items */}
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5">
                                <p className="text-[11px] text-text-secondary line-clamp-1">
                                    <span className="font-semibold text-text-main dark:text-gray-300">Dipesan: </span>
                                    {review.items}
                                </p>
                            </div>

                            {/* Comment */}
                            <p className="text-sm text-text-main dark:text-gray-200 leading-relaxed">
                                {review.comment}
                            </p>

                            {/* Photos */}
                            {review.photos.length > 0 && (
                                <div className="flex gap-2 mt-1">
                                    {review.photos.map((photo, idx) => (
                                        <img
                                            key={idx}
                                            src={photo}
                                            alt="Review"
                                            className="w-16 h-16 rounded-xl object-cover border border-gray-100 dark:border-gray-700 hover:scale-105 transition-transform cursor-pointer"
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Merchant Reply */}
                            {review.reply ? (
                                <div className="mt-2 pl-4 border-l-2 border-primary/20">
                                    <p className="text-xs font-bold text-text-main dark:text-white mb-1">Balasan Anda:</p>
                                    <p className="text-xs text-text-secondary dark:text-gray-400 italic">"{review.reply}"</p>
                                </div>
                            ) : (
                                <button className="self-end mt-2 px-4 py-2 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-primary hover:bg-orange-100 transition-colors text-xs font-bold flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[16px]">reply</span>
                                    Balas Ulasan
                                </button>
                            )}
                        </article>
                    ))}
                </div>
            </main>
        </div>
    )
}

export default MerchantReviewsPage
