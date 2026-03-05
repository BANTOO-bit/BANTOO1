import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import BackButton from '@/features/shared/components/BackButton'
import { useToast } from '@/context/ToastContext'
import { reviewService } from '@/services/reviewService'
import orderService from '@/services/orderService'
import { handleError } from '@/utils/errorHandler'

// Preset review tags
const reviewTags = [
    { id: 'tasty', label: 'Enak', icon: '😋' },
    { id: 'fast', label: 'Cepat', icon: '⚡' },
    { id: 'clean', label: 'Bersih', icon: '✨' },
    { id: 'friendly', label: 'Ramah', icon: '😊' },
    { id: 'accurate', label: 'Sesuai', icon: '✅' },
    { id: 'value', label: 'Worth It', icon: '💰' },
]

const ratingLabels = {
    0: 'Ketuk bintang untuk memberi rating',
    1: 'Sangat Buruk 😞',
    2: 'Buruk 😕',
    3: 'Cukup 😐',
    4: 'Baik 😊',
    5: 'Sangat Baik! 🤩'
}

function StarRating({ rating, setRating, size = 'lg' }) {
    const starSize = size === 'lg' ? 'text-4xl' : 'text-3xl'

    return (
        <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`${starSize} transition-all duration-200 active:scale-125 hover:scale-110`}
                >
                    <span
                        className={`material-symbols-outlined ${star <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                        style={{ fontVariationSettings: star <= rating ? "'FILL' 1" : "'FILL' 0" }}
                    >
                        star
                    </span>
                </button>
            ))}
        </div>
    )
}

function ReviewPage() {
    const { orderId } = useParams()
    const navigate = useNavigate()
    const toast = useToast()
    const [merchantRating, setMerchantRating] = useState(0)
    const [driverRating, setDriverRating] = useState(0)
    const [reviewText, setReviewText] = useState('')
    const [selectedTags, setSelectedTags] = useState([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [alreadyReviewed, setAlreadyReviewed] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [order, setOrder] = useState({})

    useEffect(() => {
        async function fetchOrder() {
            setIsLoading(true)
            if (orderId) {
                // Check if already reviewed
                try {
                    const reviewed = await reviewService.hasReviewed(orderId)
                    if (reviewed) {
                        setAlreadyReviewed(true)
                        setIsLoading(false)
                        return
                    }
                } catch (e) { /* ignore */ }

                try {
                    const data = await orderService.getOrder(orderId)
                    if (data) {
                        setOrder({
                            id: data.id,
                            merchantName: data.merchant?.name || data.merchants?.name || 'Warung',
                            merchantImage: data.merchant?.image_url || data.merchants?.image_url,
                            merchantId: data.merchant_id,
                            driverName: data.driver?.full_name || null,
                            driverPhoto: data.driver?.avatar_url || null,
                            items: data.items?.map(item => ({
                                name: item.product_name,
                                quantity: item.quantity
                            })) || [],
                            totalAmount: data.total_amount,
                            createdAt: data.created_at
                        })
                    }
                } catch (err) {
                    const stored = JSON.parse(
                        localStorage.getItem('bantoo_review_order') ||
                        localStorage.getItem('bantoo_current_order') ||
                        '{}'
                    )
                    setOrder(stored)
                }
            } else {
                const stored = JSON.parse(
                    localStorage.getItem('bantoo_review_order') ||
                    localStorage.getItem('bantoo_current_order') ||
                    '{}'
                )
                setOrder(stored)
            }
            setIsLoading(false)
        }
        fetchOrder()
    }, [orderId])

    const toggleTag = (tagId) => {
        setSelectedTags(prev =>
            prev.includes(tagId)
                ? prev.filter(t => t !== tagId)
                : [...prev, tagId]
        )
    }

    const handleSubmit = async () => {
        if (merchantRating === 0) {
            toast.warning('Mohon beri rating untuk warung')
            return
        }
        if (isSubmitting) return

        setIsSubmitting(true)

        try {
            const reviewOrderId = orderId || order.id || order.dbId
            if (!reviewOrderId) {
                toast.error('ID pesanan tidak ditemukan')
                setIsSubmitting(false)
                return
            }

            await reviewService.createReview({
                orderId: reviewOrderId,
                merchantRating,
                driverRating: driverRating || null,
                comment: reviewText || null,
                tags: selectedTags.length > 0 ? selectedTags : null
            })

            localStorage.removeItem('bantoo_review_order')
            setIsSubmitting(false)
            setShowSuccess(true)

            setTimeout(() => {
                navigate('/orders')
            }, 2500)
        } catch (error) {
            handleError(error, toast, { context: 'Submit Review' })
            setIsSubmitting(false)
        }
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
        )
    }

    // Already reviewed state
    if (alreadyReviewed) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark px-4">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-blue-500 text-4xl">reviews</span>
                </div>
                <h2 className="text-xl font-bold text-text-main dark:text-white mb-2">Sudah Diulas</h2>
                <p className="text-text-secondary dark:text-gray-400 text-center mb-6">
                    Kamu sudah memberikan ulasan untuk pesanan ini
                </p>
                <button
                    onClick={() => navigate('/orders')}
                    className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-md active:scale-95 transition-transform"
                >
                    Kembali ke Pesanan
                </button>
            </div>
        )
    }

    // Success state
    if (showSuccess) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark px-6">
                <div className="relative mb-6">
                    <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center animate-bounce">
                        <span className="material-symbols-outlined text-green-500 text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </div>
                    {/* Confetti dots */}
                    <div className="absolute -top-2 -left-2 w-3 h-3 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                    <div className="absolute -top-1 -right-3 w-2 h-2 bg-primary rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                    <div className="absolute -bottom-1 -left-3 w-2 h-2 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '0.8s' }}></div>
                </div>
                <h2 className="text-2xl font-bold text-text-main dark:text-white mb-2">Terima Kasih! 🎉</h2>
                <p className="text-text-secondary dark:text-gray-400 text-center max-w-[280px]">
                    Ulasan kamu sangat membantu untuk meningkatkan layanan kami
                </p>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-card-light dark:bg-card-dark px-4 pt-12 pb-4 border-b border-border-color dark:border-gray-800 shadow-sm">
                <div className="relative flex items-center justify-center min-h-[40px]">
                    <BackButton fallback="/orders" confirmMessage="Batal memberi ulasan?" />
                    <h1 className="text-lg font-bold text-text-main dark:text-white">Beri Ulasan</h1>
                </div>
            </header>

            <div className="flex-1 px-4 space-y-4 mt-4 pb-28">
                {/* Order Summary Card */}
                <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-border-color dark:border-gray-800 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-900/20 overflow-hidden flex items-center justify-center shrink-0">
                            {order.merchantImage ? (
                                <img src={order.merchantImage} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="material-symbols-outlined text-primary text-2xl">storefront</span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm text-text-main dark:text-white truncate">{order.merchantName || 'Warung'}</h3>
                            <p className="text-[11px] text-text-secondary dark:text-gray-400 mt-0.5 line-clamp-1">
                                {order.items?.length > 0
                                    ? order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')
                                    : 'Pesanan selesai'}
                            </p>
                            {order.totalAmount && (
                                <p className="text-[11px] font-semibold text-primary mt-0.5">
                                    Rp {order.totalAmount.toLocaleString()}
                                </p>
                            )}
                        </div>
                        <div className="shrink-0">
                            <span className="px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[10px] font-bold rounded-md">
                                Selesai
                            </span>
                        </div>
                    </div>
                </div>

                {/* Merchant Rating */}
                <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-border-color dark:border-gray-800 p-5">
                    <div className="text-center">
                        <div className="w-14 h-14 mx-auto bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-800/10 rounded-full flex items-center justify-center mb-3">
                            {order.merchantImage ? (
                                <img src={order.merchantImage} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <span className="material-symbols-outlined text-primary text-2xl">storefront</span>
                            )}
                        </div>
                        <h3 className="font-bold text-text-main dark:text-white mb-0.5">{order.merchantName || 'Warung'}</h3>
                        <p className="text-xs text-text-secondary dark:text-gray-400 mb-4">Bagaimana makanannya?</p>
                        <div className="flex justify-center mb-2">
                            <StarRating rating={merchantRating} setRating={setMerchantRating} />
                        </div>
                        <p className={`text-sm font-medium transition-all duration-300 ${merchantRating > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-text-secondary dark:text-gray-500'}`}>
                            {ratingLabels[merchantRating]}
                        </p>
                    </div>
                </div>

                {/* Driver Rating */}
                <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-border-color dark:border-gray-800 p-5">
                    <div className="text-center">
                        <div className="w-14 h-14 mx-auto bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/10 rounded-full flex items-center justify-center mb-3 overflow-hidden">
                            {order.driverPhoto ? (
                                <img src={order.driverPhoto} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="material-symbols-outlined text-blue-500 text-2xl">two_wheeler</span>
                            )}
                        </div>
                        <h3 className="font-bold text-text-main dark:text-white mb-0.5">{order.driverName || 'Driver'}</h3>
                        <p className="text-xs text-text-secondary dark:text-gray-400 mb-4">Bagaimana pelayanan driver?</p>
                        <div className="flex justify-center mb-2">
                            <StarRating rating={driverRating} setRating={setDriverRating} />
                        </div>
                        {driverRating > 0 && (
                            <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400 transition-all duration-300">
                                {ratingLabels[driverRating]}
                            </p>
                        )}
                    </div>
                </div>

                {/* Review Tags */}
                <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-border-color dark:border-gray-800 p-4">
                    <h3 className="font-bold text-sm text-text-main dark:text-white mb-3">Apa yang kamu suka?</h3>
                    <div className="flex flex-wrap gap-2">
                        {reviewTags.map(tag => (
                            <button
                                key={tag.id}
                                onClick={() => toggleTag(tag.id)}
                                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-1.5 active:scale-95 ${selectedTags.includes(tag.id)
                                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                                    : 'bg-gray-100 dark:bg-gray-800 text-text-main dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                <span className="text-base">{tag.icon}</span>
                                <span>{tag.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Review Text */}
                <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-border-color dark:border-gray-800 p-4">
                    <h3 className="font-bold text-sm text-text-main dark:text-white mb-3">Tulis ulasan (opsional)</h3>
                    <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Ceritakan pengalamanmu dengan pesanan ini..."
                        maxLength={500}
                        className="w-full h-24 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-border-color dark:border-gray-700 text-sm text-text-main dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                    />
                    <div className="flex justify-end mt-1">
                        <span className="text-[10px] text-text-secondary dark:text-gray-500">{reviewText.length}/500</span>
                    </div>
                </div>
            </div>

            {/* Submit Button - Fixed Bottom */}
            <div className="fixed bottom-0 left-0 right-0 bg-card-light dark:bg-card-dark border-t border-border-color dark:border-gray-800 p-4 z-50">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || merchantRating === 0}
                    className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${isSubmitting || merchantRating === 0
                        ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        : 'bg-gradient-to-r from-primary to-blue-600 active:scale-[0.98] hover:shadow-xl hover:shadow-primary/20'
                        }`}
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Mengirim...</span>
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-xl">send</span>
                            <span>Kirim Ulasan</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}

export default ReviewPage
