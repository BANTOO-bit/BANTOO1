import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { reviewService } from '../../../services/reviewService'
import merchantService from '../../../services/merchantService'
import logger from '../../../utils/logger'

function MerchantReviewsPage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [activeFilter, setActiveFilter] = useState('all') // all, with_photo, reply_needed
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [merchantRating, setMerchantRating] = useState({ averageRating: 0, totalReviews: 0, distribution: {} })

    useEffect(() => {
        const fetchReviews = async () => {
            if (!user?.merchantId) return
            try {
                // Fetch reviews and merchant details (for rating summary if needed, but we calculate locally or fetch stats)
                // We'll calculate stats from reviews for now or add a service method if needed.
                // Actually reviewService.getMerchantReviews returns the list.
                // We might need a separate stats endpoint or calculate on client if list is small.
                // For now, let's fetch all (or paginated) and calculate stats on client for simplicity,
                // or better, implement a getMerchantRating in reviewService similar to driver.

                const [reviewsData, ratingData] = await Promise.all([
                    reviewService.getMerchantReviews(user.merchantId),
                    // We need to implement getMerchantRating in reviewService to be consistent
                    reviewService.getMerchantRating(user.merchantId)
                ])

                setReviews(reviewsData || [])
                setMerchantRating(ratingData)
            } catch (error) {
                if (process.env.NODE_ENV === 'development') console.error('Failed to fetch reviews:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchReviews()
    }, [user?.merchantId])

    const filteredReviews = reviews.filter(review => {
        if (activeFilter === 'with_photo') return review.photos && review.photos.length > 0
        if (activeFilter === 'reply_needed') return review.merchant_reply === null
        return true
    })

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 relative min-h-screen flex flex-col overflow-x-hidden pb-bottom-nav">
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
                        <span className="text-4xl font-bold text-text-main dark:text-white">
                            {merchantRating.averageRating.toFixed(1)}
                        </span>
                        <div className="flex text-yellow-400 text-sm">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star} className="material-symbols-outlined fill-current text-[16px]">
                                    {star <= Math.round(merchantRating.averageRating) ? 'star' : 'star_border'}
                                </span>
                            ))}
                        </div>
                        <span className="text-[10px] text-text-secondary">{merchantRating.totalReviews} Ulasan</span>
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5 border-l border-gray-100 dark:border-gray-700 pl-6">
                        {[5, 4, 3, 2, 1].map((star, idx) => {
                            const count = merchantRating.distribution?.[star] || 0
                            const percentage = merchantRating.totalReviews > 0 ? (count / merchantRating.totalReviews) * 100 : 0
                            return (
                                <div key={star} className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-text-secondary w-2">{star}</span>
                                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-yellow-400 rounded-full"
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )
                        })}
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
                                ? 'bg-primary text-white'
                                : 'bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 text-text-secondary hover:bg-gray-50'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Review List */}
                <div className="flex flex-col gap-4">
                    {filteredReviews.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-gray-500 dark:text-gray-400">Belum ada ulasan</p>
                        </div>
                    ) : (
                        filteredReviews.map(review => (
                            <article key={review.id} className="bg-white dark:bg-card-dark rounded-2xl p-4 shadow-soft border border-gray-100 dark:border-gray-700 flex flex-col gap-3">
                                {/* Reviewer Header */}
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={review.customer?.avatar_url || 'https://via.placeholder.com/150'}
                                            alt={review.customer?.full_name || 'Customer'}
                                            className="w-10 h-10 rounded-full object-cover bg-gray-200"
                                        />
                                        <div className="flex flex-col">
                                            <h3 className="text-sm font-bold text-text-main dark:text-white">
                                                {review.customer?.full_name || 'Pelanggan'}
                                            </h3>
                                            <div className="flex items-center gap-1.5">
                                                <div className="flex text-yellow-400">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i} className={`material-symbols-outlined text-[14px] ${i < review.merchant_rating ? 'fill-current' : 'text-gray-300'}`}>star</span>
                                                    ))}
                                                </div>
                                                <span className="text-[10px] text-text-secondary">
                                                    • {new Date(review.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Ordered Items (If available in review data, otherwise omit or fetch) */}
                                {/* Currently review schema might not have items string, usually joined from order_items. 
                                    For now we'll skip or use placeholder if not in query. 
                                    Standard reviewService.getMerchantReviews selects * from reviews. 
                                    If we want items, we need to join orders -> order_items.
                                    Let's keep it simple for now or assume review might have it if updated.
                                    Since we didn't update schema to store items string in reviews, we might miss this.
                                    I will omit it for now to avoid errors, or try to fetch if critical.
                                */}

                                {/* Comment */}
                                {review.comment ? (
                                    <p className="text-sm text-text-main dark:text-gray-200 leading-relaxed">
                                        "{review.comment}"
                                    </p>
                                ) : (
                                    <p className="text-xs text-slate-400 italic">Tidak ada komentar</p>
                                )}

                                {/* Photos - check if review has photos column or related table. 
                                    Assuming 'photos' column exists based on previous mock usage, 
                                    but need to verify schema. If not, hidden.
                                    Standard schema: reviews table. If photos are stored, likely a column 'photos' (array) or separate table.
                                    Let's handle safely.
                                */}
                                {review.photos && review.photos.length > 0 && (
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
                                {review.merchant_reply ? (
                                    <div className="mt-2 pl-4 border-l-2 border-primary/20">
                                        <p className="text-xs font-bold text-text-main dark:text-white mb-1">Balasan Anda:</p>
                                        <p className="text-xs text-text-secondary dark:text-gray-400 italic">"{review.merchant_reply}"</p>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => {
                                            // Handle reply logic - maybe open modal
                                            // For now just console log
                                            logger.debug('Reply to', review.id)
                                        }}
                                        className="self-end mt-2 px-4 py-2 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-primary hover:bg-orange-100 transition-colors text-xs font-bold flex items-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">reply</span>
                                        Balas Ulasan
                                    </button>
                                )}
                            </article>
                        ))
                    )}
                </div>
            </main>
        </div>
    )
}

export default MerchantReviewsPage
