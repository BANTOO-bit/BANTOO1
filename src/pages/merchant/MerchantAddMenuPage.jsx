import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import merchantService from '../../services/merchantService'
import BackButton from '../../components/shared/BackButton'
import MerchantBottomNavigation from '../../components/merchant/MerchantBottomNavigation'
import { useToast } from '../../context/ToastContext'
import { handleError, handleWarning, handleSuccess } from '../../utils/errorHandler'
import { supabase } from '../../services/supabaseClient'

function MerchantAddMenuPage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const toast = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [imageType, setImageType] = useState('url') // 'url' or 'upload' (disabled)
    const [imageUrl, setImageUrl] = useState('') // For preview
    const [imageFile, setImageFile] = useState(null) // For upload
    const [categories, setCategories] = useState([])
    const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false)

    useEffect(() => {
        const stored = localStorage.getItem('merchant_categories')
        if (stored) {
            setCategories(JSON.parse(stored))
        } else {
            // Fallback if accessed directly without visiting menu page first using Standard Categories
            setCategories([
                { id: 'makanan-berat', label: 'Makanan Berat' },
                { id: 'jajanan', label: 'Jajanan' },
                { id: 'minuman', label: 'Minuman' },
                { id: 'kopi-teh', label: 'Kopi & Teh' },
                { id: 'kue', label: 'Kue' },
                { id: 'makanan-ringan', label: 'Makanan Ringan' },
                { id: 'seafood', label: 'Seafood' },
                { id: 'frozenfood', label: 'Frozen Food' },
                { id: 'dessert', label: 'Dessert' },
                { id: 'sarapan', label: 'Sarapan' },
                { id: 'makanan-sehat', label: 'Makanan Sehat' },
                { id: 'makanan-bayi', label: 'Makanan Bayi' },
                { id: 'buah-sayur', label: 'Buah & Sayur' },
                { id: 'sembako', label: 'Sembako' }
            ])
        }
    }, [])

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        description: ''
    })

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        })
    }

    const handleSubmit = async () => {
        // Validation
        if (!formData.name || !formData.category || !formData.price) {
            toast.warning('Mohon lengkapi Nama, Kategori, dan Harga')
            return
        }

        setIsLoading(true)

        try {
            // 1. Get Merchant ID
            const { data: merchant, error: merchantError } = await supabase
                .from('merchants')
                .select('id')
                .eq('owner_id', user.id)
                .single()

            if (merchantError || !merchant) throw new Error('Merchant profile not found')

            // 2. Upload Image to Storage (if exists)
            let finalImage = null

            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop()
                const fileName = `${merchant.id}/${Date.now()}.${fileExt}`
                const filePath = `${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('menu-images')
                    .upload(filePath, imageFile)

                if (uploadError) throw uploadError

                // Get Public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('menu-images')
                    .getPublicUrl(filePath)

                finalImage = publicUrl
            }

            // Fallback placeholder logic
            if (!finalImage) {
                const placeholders = {
                    makanan: 'https://placehold.co/400x400/orange/white?text=Makanan',
                    minuman: 'https://placehold.co/400x400/blue/white?text=Minuman',
                    snack: 'https://placehold.co/400x400/yellow/black?text=Snack',
                    paket: 'https://placehold.co/400x400/red/white?text=Paket'
                }
                finalImage = placeholders[formData.category] || placeholders.makanan
            }

            // 3. Insert Product
            const { error: insertError } = await supabase
                .from('menu_items')
                .insert({
                    merchant_id: merchant.id,
                    name: formData.name,
                    category: formData.category,
                    price: parseInt(formData.price),
                    description: formData.description,
                    image_url: finalImage,
                    is_available: true
                })

            if (insertError) throw insertError

            // Success
            handleSuccess('Menu berhasil ditambahkan', toast)
            navigate('/merchant/menu')

        } catch (error) {
            console.error('Error adding menu:', error)
            handleError(error, toast, { context: 'Add Menu' })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 relative min-h-screen flex flex-col overflow-x-hidden pb-[88px]">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 pt-10 pb-4 flex flex-col gap-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between relative">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-text-main dark:text-white active:scale-95 transition-transform hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                    >
                        <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                    </button>
                    <h1 className="text-xl font-bold text-text-main dark:text-white leading-tight w-full text-center">Tambah Menu Baru</h1>
                </div>
            </header>

            <main className="flex flex-col gap-6 px-4 pt-4">
                {/* Image Upload Section */}
                <section className="flex flex-col items-center gap-4">
                    <input
                        type="file"
                        accept="image/*"
                        id="image-upload"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files[0]
                            if (file) {
                                // Validate file size (max 2MB)
                                if (file.size > 2 * 1024 * 1024) {
                                    toast.error('Ukuran gambar maksimal 2MB')
                                    return
                                }

                                setImageFile(file)
                                const reader = new FileReader()
                                reader.onloadend = () => {
                                    setImageUrl(reader.result) // For preview only
                                }
                                reader.readAsDataURL(file)
                            }
                        }}
                    />
                    <label
                        htmlFor="image-upload"
                        className="relative group cursor-pointer"
                    >
                        <div className={`w - 32 h - 32 rounded - 2xl overflow - hidden shadow - card border border - gray - 100 dark: border - gray - 700 ${!imageUrl ? 'bg-gray-100 dark:bg-gray-800 flex items-center justify-center' : ''} `}>
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt="Preview Menu"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="material-symbols-outlined text-gray-400 text-4xl">image</span>
                            )}
                        </div>
                        <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 bg-white dark:bg-card-dark text-text-secondary dark:text-gray-300 shadow-soft border border-gray-100 dark:border-gray-700 rounded-full p-2 hover:text-primary active:scale-95 transition-all flex items-center justify-center">
                            <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                        </div>
                    </label>
                    <label
                        htmlFor="image-upload"
                        className="text-primary font-semibold text-sm hover:underline hover:text-primary-dark transition-colors cursor-pointer"
                    >
                        {imageUrl ? 'Ganti Foto' : 'Tambah Foto'}
                    </label>
                </section>

                {/* Form */}
                <section className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-text-main dark:text-white" htmlFor="name">Nama Menu</label>
                        <input
                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm shadow-sm placeholder-gray-400 transition-all dark:text-white"
                            id="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Contoh: Bakso Spesial"
                            type="text"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-text-main dark:text-white" htmlFor="category">Kategori</label>
                        <div className="relative">
                            <div
                                onClick={() => setIsCategorySheetOpen(true)}
                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 flex items-center justify-between cursor-pointer active:bg-gray-50 dark:active:bg-gray-800 transition-colors"
                            >
                                <span className={`text - sm ${formData.category ? 'text-text-main dark:text-white' : 'text-gray-400'} `}>
                                    {formData.category
                                        ? categories.find(c => c.id === formData.category)?.label || 'Pilih Kategori'
                                        : 'Pilih Kategori'}
                                </span>
                                <span className="material-symbols-outlined text-gray-400 text-[20px]">expand_more</span>
                            </div>
                        </div>

                        {/* Category Bottom Sheet */}
                        {isCategorySheetOpen && (
                            <div className="fixed inset-0 z-[60] flex flex-col justify-end">
                                {/* Backdrop */}
                                <div
                                    className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                                    onClick={() => setIsCategorySheetOpen(false)}
                                ></div>

                                {/* Sheet Panel */}
                                <div className="bg-white dark:bg-card-dark w-full rounded-t-[24px] p-6 pb-safe relative z-10 shadow-2xl animate-slide-up max-h-[80vh] flex flex-col">
                                    <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-6 flex-shrink-0"></div>

                                    <div className="flex items-center justify-between mb-4 flex-shrink-0">
                                        <h3 className="text-lg font-bold text-text-main dark:text-white">Pilih Kategori</h3>
                                        <button
                                            onClick={() => setIsCategorySheetOpen(false)}
                                            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-text-secondary dark:text-gray-400"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">close</span>
                                        </button>
                                    </div>

                                    <div className="overflow-y-auto -mx-6 px-6 pb-4 space-y-2">
                                        {categories.map(cat => (
                                            <div
                                                key={cat.id}
                                                onClick={() => {
                                                    setFormData({ ...formData, category: cat.id })
                                                    setIsCategorySheetOpen(false)
                                                }}
                                                className={`flex items - center justify - between p - 4 rounded - xl cursor - pointer transition - colors ${formData.category === cat.id
                                                    ? 'bg-primary/10 border border-primary/20'
                                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent'
                                                    } `}
                                            >
                                                <span className={`font - medium text - sm ${formData.category === cat.id
                                                    ? 'text-primary'
                                                    : 'text-text-main dark:text-white'
                                                    } `}>
                                                    {cat.label}
                                                </span>
                                                {formData.category === cat.id && (
                                                    <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                                                )}
                                            </div>
                                        ))}

                                        <div
                                            onClick={() => {
                                                setIsCategorySheetOpen(false)
                                                navigate('/merchant/menu/categories')
                                            }}
                                            className="flex items-center justify-center gap-2 p-4 mt-2 border-t border-gray-100 dark:border-gray-800 text-primary font-semibold text-sm cursor-pointer active:bg-gray-50 dark:active:bg-gray-800 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">settings</span>
                                            <span>Kelola Kategori</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-text-main dark:text-white" htmlFor="price">Harga</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary dark:text-gray-400 font-medium text-sm">Rp</span>
                            <input
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm shadow-sm placeholder-gray-400 transition-all dark:text-white"
                                id="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="0"
                                type="number"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-text-main dark:text-white" htmlFor="description">Deskripsi</label>
                        <textarea
                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm shadow-sm placeholder-gray-400 resize-none transition-all dark:text-white"
                            id="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Jelaskan keunggulan menu kamu..."
                            rows="4"
                        ></textarea>
                    </div>
                </section>

                <section className="mt-4 pb-4">
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className={`w - full bg - primary hover: bg - primary - dark text - white font - semibold py - 3.5 rounded - xl shadow - md active: scale - [0.98] transition - all flex items - center justify - center gap - 2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''} `}
                    >
                        {isLoading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></span>
                                <span>Menyimpan...</span>
                            </>
                        ) : (
                            <span>Simpan Menu</span>
                        )}
                    </button>
                </section>
            </main>
        </div>
    )
}

export default MerchantAddMenuPage
