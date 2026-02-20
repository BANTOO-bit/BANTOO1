import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import driverService from '../../services/driverService'
import { reviewService } from '../../services/reviewService'

function DriverReviewsPage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [reviews, setReviews] = useState([])
    const [ratingData, setRatingData] = useState({ averageRating: 0, totalReviews: 0, distribution: {} })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchReviews = async () => {
            if (!user?.id) return
            try {
                // Get driver ID first
                const profile = await driverService.getProfile()
                if (!profile) return

                const [reviewsData, rating] = await Promise.all([
                    reviewService.getDriverReviews(profile.id),
                    reviewService.getDriverRating(profile.id)
                ])

                setReviews(reviewsData || [])
                setRatingData(rating)
            } catch (error) {
                if (import.meta.env.DEV) console.error('Failed to fetch reviews:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchReviews()
    }, [user])

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background-light">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="font-display bg-background-light text-slate-900 antialiased min-h-screen pb-safe">
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl bg-white">
                {/* Header */}
                <header className="sticky top-0 z-10 bg-white border-b border-slate-100">
                    <div className="flex items-center gap-4 px-4 h-16">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 -ml-2 rounded-full hover:bg-slate-50 transition-colors"
                        >
                            <span className="material-symbols-outlined text-slate-700">arrow_back</span>
                        </button>
                        <h1 className="text-lg font-bold text-slate-900">Ulasan Pembeli</h1>
                    </div>
                </header>

                <main className="flex-1 p-4">
                    {/* Summary Card */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm mb-6">
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col items-center justify-center min-w-[80px]">
                                <span className="text-4xl font-bold text-slate-900">
                                    {ratingData.averageRating.toFixed(1)}
                                </span>
                                <div className="flex text-amber-500 my-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span key={star} className="material-symbols-outlined text-[16px] filled">
                                            {star <= Math.round(ratingData.averageRating) ? 'star' : 'star_border'}
                                        </span>
                                    ))}
                                </div>
                                <span className="text-xs text-slate-500">
                                    {ratingData.totalReviews} Ulasan
                                </span>
                            </div>

                            {/* Distribution Bars */}
                            <div className="flex-1 flex flex-col gap-1.5">
                                {[5, 4, 3, 2, 1].map((star) => {
                                    const count = ratingData.distribution?.[star] || 0
                                    const percentage = ratingData.totalReviews > 0
                                        ? (count / ratingData.totalReviews) * 100
                                        : 0

                                    return (
                                        <div key={star} className="flex items-center gap-2 text-xs">
                                            <span className="flex items-center gap-0.5 w-8 font-medium text-slate-600">
                                                {star} <span className="material-symbols-outlined text-[10px] text-slate-400">star</span>
                                            </span>
                                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-amber-500 rounded-full"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <span className="w-6 text-right text-slate-400">{count}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Reviews List */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-sm font-bold text-slate-900">Apa kata mereka?</h3>

                        {reviews.length === 0 ? (
                            <div className="bg-slate-50 rounded-xl p-8 text-center">
                                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">reviews</span>
                                <p className="text-slate-500 font-medium">Belum ada ulasan</p>
                                <p className="text-xs text-slate-400 mt-1">Selesaikan order dengan baik untuk mendapatkan ulasan positif!</p>
                            </div>
                        ) : (
                            reviews.map((review) => (
                                <div key={review.id} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="size-8 rounded-full bg-slate-200 bg-cover bg-center"
                                                style={{ backgroundImage: `url("${review.customer?.avatar_url || 'https://via.placeholder.com/150'}")` }}
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900">
                                                    {review.customer?.full_name || 'Pelanggan'}
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    {new Date(review.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                                            <span className="material-symbols-outlined text-amber-500 text-[14px] filled mr-1">star</span>
                                            <span className="text-xs font-bold text-amber-700">{review.driver_rating}</span>
                                        </div>
                                    </div>

                                    {review.comment ? (
                                        <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg">
                                            "{review.comment}"
                                        </p>
                                    ) : (
                                        <p className="text-xs text-slate-400 italic">Tidak ada komentar</p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default DriverReviewsPage
