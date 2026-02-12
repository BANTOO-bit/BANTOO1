import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

function MerchantEditMenuPage() {
    const navigate = useNavigate()
    const [categories, setCategories] = useState([])
    const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false)
    const [previewImage, setPreviewImage] = useState('https://lh3.googleusercontent.com/aida-public/AB6AXuBMYJL8I4BvtTmb1l7dcjg0OMDIk68I4Y6hfn-HTbtDy2NhInoSa2Re9S_4rNgGoLZjeWl3R_0SPDpW92ZYS8ml_hduZp8isUGEE6Sb_t8FkxMYullfGBRCE1kxHCs3vUG6dgTjxFBHyc-ql1A6tB1b_FOuaS82oROijbO4AYNHKKNYwWF5cACyisDcx1bPPi-a3fKxEHUFJ64hipRpr2GQBym3kkj1E5mi180q0JONAuUYDFojWcIQJ6cRjBDvF7-TzF3qQxQ47jKA')

    useEffect(() => {
        const stored = localStorage.getItem('merchant_categories')
        if (stored) {
            setCategories(JSON.parse(stored))
        } else {
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

    // Mock initial data
    const [formData, setFormData] = useState({
        name: 'Bakso Urat Jumbo',
        category: 'Makanan',
        price: '25000',
        description: 'Bakso urat sapi asli ukuran jumbo dengan kuah kaldu sapi yang gurih dan nikmat. Disajikan dengan mie kuning, bihun, dan sayuran segar.',
        isAvailable: true
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleToggle = () => {
        setFormData(prev => ({ ...prev, isAvailable: !prev.isAvailable }))
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
                    <h1 className="text-xl font-bold text-text-main dark:text-white leading-tight w-full text-center">Edit Menu</h1>
                    <button
                        onClick={() => {
                            if (window.confirm('Hapus menu ini?')) {
                                navigate('/merchant/menu')
                            }
                        }}
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-red-500 active:scale-95 transition-transform hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                    >
                        <span className="material-symbols-outlined text-[24px]">delete</span>
                    </button>
                </div>
            </header>

            <main className="flex flex-col gap-6 px-4 pt-6 pb-32">
                {/* Image Section */}
                <section className="flex flex-col items-center gap-4">
                    <input
                        type="file"
                        accept="image/*"
                        id="image-upload"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files[0]
                            if (file) {
                                const reader = new FileReader()
                                reader.onloadend = () => {
                                    setPreviewImage(reader.result)
                                }
                                reader.readAsDataURL(file)
                            }
                        }}
                    />
                    <div className="relative group cursor-pointer">
                        <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-card border border-gray-100 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                            {/* Placeholder for now, will connect to state in next step */}
                            <img
                                alt="Preview Menu"
                                className="w-full h-full object-cover"
                                id="menu-preview-image"
                                src={previewImage}
                            />
                        </div>
                        <label
                            htmlFor="image-upload"
                            className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 bg-white dark:bg-card-dark text-text-secondary dark:text-gray-300 shadow-soft border border-gray-100 dark:border-gray-700 rounded-full p-2 hover:text-primary active:scale-95 transition-all flex items-center justify-center cursor-pointer">
                            <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                        </label>
                    </div>
                    <label htmlFor="image-upload" className="text-primary font-semibold text-sm hover:underline hover:text-primary-dark transition-colors cursor-pointer">Ganti Foto</label>
                </section>

                {/* Form */}
                <form className="flex flex-col gap-5">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-text-main dark:text-gray-200">Nama Menu</label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full rounded-xl bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary px-4 py-3 text-sm text-text-main dark:text-white placeholder-gray-400 shadow-sm transition-all"
                            type="text"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-text-main dark:text-gray-200">Kategori</label>
                        <div className="relative">
                            <div
                                onClick={() => setIsCategorySheetOpen(true)}
                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 flex items-center justify-between cursor-pointer active:bg-gray-50 dark:active:bg-gray-800 transition-colors"
                            >
                                <span className={`text-sm ${formData.category ? 'text-text-main dark:text-white' : 'text-gray-400'}`}>
                                    {formData.category
                                        ? categories.find(c => c.id === formData.category)?.label || 'Pilih Kategori'
                                        : 'Pilih Kategori'}
                                </span>
                                <span className="material-symbols-outlined text-gray-400 text-[20px]">expand_more</span>
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
                                                    className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-colors ${formData.category === cat.id
                                                        ? 'bg-primary/10 border border-primary/20'
                                                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent'
                                                        }`}
                                                >
                                                    <span className={`font-medium text-sm ${formData.category === cat.id
                                                        ? 'text-primary'
                                                        : 'text-text-main dark:text-white'
                                                        }`}>
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
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-text-main dark:text-gray-200">Harga</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary dark:text-gray-400 font-medium text-sm">Rp</span>
                            <input
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                className="w-full rounded-xl bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary pl-10 pr-4 py-3 text-sm text-text-main dark:text-white shadow-sm transition-all"
                                placeholder="0"
                                type="number"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-text-main dark:text-gray-200">Deskripsi</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full rounded-xl bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary px-4 py-3 text-sm text-text-main dark:text-white placeholder-gray-400 shadow-sm resize-none transition-all"
                            rows="4"
                        />
                    </div>

                    {/* Stock Status Toggle */}
                    <div className="mt-2 bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between shadow-sm">
                        <div>
                            <h3 className="text-sm font-semibold text-text-main dark:text-white">Status Stok</h3>
                            <p className="text-xs text-text-secondary dark:text-gray-400 mt-1">Atur ketersediaan menu</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`text-xs font-bold ${formData.isAvailable ? 'text-primary' : 'text-text-secondary'}`}>
                                {formData.isAvailable ? 'Tersedia' : 'Habis'}
                            </span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isAvailable}
                                    onChange={handleToggle}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                            </label>
                        </div>
                    </div>
                </form>
            </main>

            {/* Bottom Save Button */}
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-card-dark border-t border-gray-200 dark:border-gray-800 px-4 pt-4 pb-8 pb-safe z-50">
                <button
                    onClick={() => navigate('/merchant/menu')}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    <span>Simpan Perubahan</span>
                </button>
            </div>
        </div>
    )
}

export default MerchantEditMenuPage
