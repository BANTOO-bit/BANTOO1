import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import BackButton from '../../../components/shared/BackButton'
import { useToast } from '../../../context/ToastContext'
import { reviewService } from '../../../services/reviewService'
import orderService from '../../../services/orderService'
import { handleError } from '../../../utils/errorHandler'

// Preset review tags
const reviewTags = [
    { id: 'tasty', label: 'Enak', icon: '😋' },
    { id: 'fast', label: 'Cepat', icon: '⚡' },
    { id: 'clean', label: 'Bersih', icon: '✨' },
    { id: 'friendly', label: 'Ramah', icon: '😊' },
    { id: 'accurate', label: 'Sesuai', icon: '✅' },
    { id: 'value', label: 'Worth It', icon: '💰' },
]

function StarRating({ rating, setRating, size = 'lg' }) {
    const starSize = size === 'lg' ? 'text-4xl' : 'text-2xl'

    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`${starSize} transition-transform active:scale-110`}
                >
                    <span className={`material-symbols-outlined ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`} style={{ fontVariationSettings: star <= rating ? "'FILL' 1" : "'FILL' 0" }}>
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

    // Fetch order data from API when orderId is available
    const [order, setOrder] = useState({})

    useEffect(() => {
        async function fetchOrder() {
            if (orderId) {
                try {
                    const data = await orderService.getOrder(orderId)
                    if (data) {
                        setOrder({
                            id: data.id,
                            merchantName: data.merchant?.name || 'Restoran',
                            merchantId: data.merchant_id
                        })
                    }
                } catch (err) {
                    // Fallback to localStorage if API fails
                    const stored = JSON.parse(
                        localStorage.getItem('bantoo_review_order') ||
                        localStorage.getItem('bantoo_current_order') ||
                        '{}'
                    )
                    setOrder(stored)
                }
            } else {
                // Fallback to localStorage for backward compat
                const stored = JSON.parse(
                    localStorage.getItem('bantoo_review_order') ||
                    localStorage.getItem('bantoo_current_order') ||
                    '{}'
                )
                setOrder(stored)
            }
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
            toast.warning('Mohon beri rating untuk restoran')
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

            // Clean up localStorage
            localStorage.removeItem('bantoo_review_order')

            setIsSubmitting(false)
            setShowSuccess(true)

            setTimeout(() => {
                navigate('/orders')
            }, 2000)
        } catch (error) {
            handleError(error, toast, { context: 'Submit Review' })
            setIsSubmitting(false)
        }
    }

    if (showSuccess) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background-light px-4">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
                    <span className="material-symbols-outlined text-green-500 text-5xl">check_circle</span>
                </div>
                <h2 className="text-xl font-bold text-text-main mb-2">Terima Kasih!</h2>
                <p className="text-text-secondary text-center">
                    Ulasan kamu sangat membantu untuk meningkatkan layanan kami
                </p>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-background-light pb-bottom-nav">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white px-4 pt-12 pb-4 border-b border-border-color">
                <div className="relative flex items-center justify-center min-h-[40px]">
                    <BackButton confirmMessage="Batal memberi ulasan?" />
                    <h1 className="text-lg font-bold">Beri Ulasan</h1>
                </div>
            </header>

            <div className="flex-1 px-4 space-y-6 mt-6">
                {/* Merchant Rating */}
                <div className="bg-white rounded-2xl border border-border-color p-5 text-center">
                    <div className="w-16 h-16 mx-auto bg-orange-50 rounded-full flex items-center justify-center mb-3">
                        <span className="material-symbols-outlined text-primary text-3xl">storefront</span>
                    </div>
                    <h3 className="font-bold text-text-main mb-1">{order.merchantName || 'Restoran'}</h3>
                    <p className="text-sm text-text-secondary mb-4">Bagaimana makanannya?</p>
                    <div className="flex justify-center">
                        <StarRating rating={merchantRating} setRating={setMerchantRating} />
                    </div>
                    <p className="text-sm text-text-secondary mt-2">
                        {merchantRating === 0 && 'Ketuk bintang untuk memberi rating'}
                        {merchantRating === 1 && 'Sangat Buruk'}
                        {merchantRating === 2 && 'Buruk'}
                        {merchantRating === 3 && 'Cukup'}
                        {merchantRating === 4 && 'Baik'}
                        {merchantRating === 5 && 'Sangat Baik!'}
                    </p>
                </div>

                {/* Driver Rating */}
                <div className="bg-white rounded-2xl border border-border-color p-5 text-center">
                    <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-3">
                        <span className="material-symbols-outlined text-blue-500 text-3xl">two_wheeler</span>
                    </div>
                    <h3 className="font-bold text-text-main mb-1">Driver</h3>
                    <p className="text-sm text-text-secondary mb-4">Bagaimana pelayanan driver?</p>
                    <div className="flex justify-center">
                        <StarRating rating={driverRating} setRating={setDriverRating} />
                    </div>
                </div>

                {/* Review Tags */}
                <div className="bg-white rounded-2xl border border-border-color p-4">
                    <h3 className="font-bold text-sm mb-3">Apa yang kamu suka?</h3>
                    <div className="flex flex-wrap gap-2">
                        {reviewTags.map(tag => (
                            <button
                                key={tag.id}
                                onClick={() => toggleTag(tag.id)}
                                className={`px-3 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${selectedTags.includes(tag.id)
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-text-main'
                                    }`}
                            >
                                <span>{tag.icon}</span>
                                <span>{tag.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Review Text */}
                <div className="bg-white rounded-2xl border border-border-color p-4">
                    <h3 className="font-bold text-sm mb-3">Tulis ulasan (opsional)</h3>
                    <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Ceritakan pengalamanmu dengan pesanan ini..."
                        className="w-full h-24 p-3 bg-gray-50 rounded-xl border border-border-color text-sm resize-none focus:outline-none focus:border-primary"
                    />
                </div>
            </div>

            {/* Submit Button */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border-color p-4 z-50">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || merchantRating === 0}
                    className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all ${isSubmitting || merchantRating === 0
                        ? 'bg-gray-400'
                        : 'bg-primary active:scale-[0.98]'
                        }`}
                >
                    {isSubmitting ? 'Mengirim...' : 'Kirim Ulasan'}
                </button>
            </div>
        </div>
    )
}

export default ReviewPage
