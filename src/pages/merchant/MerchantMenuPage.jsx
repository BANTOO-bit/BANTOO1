import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import merchantService from '../../services/merchantService'
import MerchantBottomNavigation from '../../components/merchant/MerchantBottomNavigation'
import EmptyState from '../../components/shared/EmptyState'
import PageLoader from '../../components/shared/PageLoader'
import { useToast } from '../../context/ToastContext'
import { handleError, handleSuccess } from '../../utils/errorHandler'
import { supabase } from '../../services/supabaseClient'

function MerchantMenuPage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const toast = useToast()
    const [activeCategory, setActiveCategory] = useState('semua')
    const [searchQuery, setSearchQuery] = useState('')
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [itemToDelete, setItemToDelete] = useState(null)

    // Data State
    const [menuItems, setMenuItems] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [merchantId, setMerchantId] = useState(null)

    // Fetch Menu Data
    useEffect(() => {
        const fetchMenu = async () => {
            if (!user) return

            try {
                // 1. Get Merchant ID
                const { data: merchant, error: merchantError } = await supabase
                    .from('merchants')
                    .select('id')
                    .eq('owner_id', user.id)
                    .single()

                if (merchantError) throw merchantError
                if (!merchant) return

                setMerchantId(merchant.id)

                // 2. Get Products
                const { data: products, error: productsError } = await supabase
                    .from('menu_items')
                    .select('*')
                    .eq('merchant_id', merchant.id)
                    .order('created_at', { ascending: false })

                if (productsError) throw productsError

                // Transform to match component state if needed (schema matches mostly)
                // DB: image_url, Comp: image
                const formattedProducts = products.map(p => ({
                    ...p,
                    image: p.image_url || 'https://placehold.co/400x400/orange/white?text=Menu', // Fallback
                    price: p.price,
                    isAvailable: p.is_available
                }))

                setMenuItems(formattedProducts)
            } catch (error) {
                console.error('Error fetching menu:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchMenu()
    }, [user])

    const [categories, setCategories] = useState([])

    useEffect(() => {
        const loadCategories = () => {
            const stored = localStorage.getItem('merchant_categories')
            if (stored) {
                setCategories(JSON.parse(stored))
            } else {
                // Default fallback matches initialization in MerchantCategoriesPage
                setCategories([
                    { id: 'semua', label: 'Semua' },
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
        }

        loadCategories()
        // Listen for storage events to update if changed in another tab/window
        window.addEventListener('storage', loadCategories)
        return () => window.removeEventListener('storage', loadCategories)
    }, [])

    // Ensure 'Semua' is always first if not present in stored categories (though Logic in CategoriesPage handles it, safety check)
    const displayCategories = [{ id: 'semua', label: 'Semua' }, ...categories.filter(c => c.id !== 'semua')]

    const filteredMenus = menuItems.filter(item => {
        const matchesCategory = activeCategory === 'semua' || item.category === activeCategory
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    const handleToggleAvailability = async (itemId) => {
        // Optimistic Update
        const currentItem = menuItems.find(i => i.id === itemId)
        const newStatus = !currentItem.isAvailable

        setMenuItems(prevItems => prevItems.map(item =>
            item.id === itemId ? { ...item, isAvailable: newStatus } : item
        ))

        try {
            const { error } = await supabase
                .from('menu_items')
                .update({ is_available: newStatus })
                .eq('id', itemId)

            if (error) throw error
        } catch (err) {
            console.error('Error updating status:', err)
            // Revert on error
            setMenuItems(prevItems => prevItems.map(item =>
                item.id === itemId ? { ...item, isAvailable: !newStatus } : item
            ))
        }
    }

    const handleEdit = (itemId) => {
        navigate(`/merchant/menu/edit/${itemId}`)
    }

    const handleDeleteClick = (item) => {
        setItemToDelete(item)
        setShowDeleteModal(true)
    }

    const confirmDelete = async () => {
        if (itemToDelete) {
            try {
                const { error } = await supabase
                    .from('menu_items')
                    .delete()
                    .eq('id', itemToDelete.id)

                if (error) throw error

                setMenuItems(prevItems => prevItems.filter(item => item.id !== itemToDelete.id))
                setShowDeleteModal(false)
                setItemToDelete(null)
            } catch (err) {
                console.error('Error deleting product:', err)
                handleError(err, toast, { context: 'Delete Menu' })
            }
        }
    }

    const handleAddMenu = () => {
        navigate('/merchant/menu/add')
    }

    // Loading State
    if (isLoading) {
        return <PageLoader />
    }

    // Empty State
    if (!isLoading && menuItems.length === 0) {
        return (
            <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 relative min-h-screen flex flex-col overflow-x-hidden pb-[88px]">
                <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 pt-12 pb-4 flex flex-col gap-4 border-b border-transparent dark:border-gray-800">
                    <div className="flex items-center justify-center relative">
                        <h1 className="text-xl font-bold text-text-main dark:text-white leading-tight text-center">Kelola Menu</h1>
                    </div>
                </header>

                <main className="flex flex-col flex-1 items-center justify-center px-4 py-6 gap-8 text-center w-full max-w-md mx-auto">
                    <div className="relative">
                        <div className="w-48 h-48 bg-white dark:bg-card-dark rounded-full shadow-soft flex items-center justify-center z-10 relative border border-gray-100 dark:border-gray-700">
                            <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-[80px]">restaurant</span>
                        </div>
                        <div className="absolute -top-2 -right-2 w-12 h-12 bg-primary/10 rounded-full blur-sm"></div>
                        <div className="absolute -bottom-1 -left-4 w-16 h-16 bg-blue-400/10 rounded-full blur-md"></div>
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-lg font-semibold text-text-main dark:text-white">Belum ada menu yang terdaftar</h2>
                        <p className="text-sm text-text-secondary dark:text-gray-400 leading-relaxed max-w-[260px] mx-auto">
                            Mulai tambahkan menu jualanmu untuk mulai menerima pesanan.
                        </p>
                    </div>
                    <button
                        onClick={handleAddMenu}
                        className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-3.5 rounded-2xl font-semibold transition-all active:scale-95 w-full max-w-[280px] justify-center"
                    >
                        <span className="material-symbols-outlined text-[20px]">add_circle</span>
                        <span>Tambah Menu Pertama</span>
                    </button>
                    {/* Dev helper removed as we have real data now */}
                </main>

                <MerchantBottomNavigation activeTab="menu" />
            </div>
        )
    }

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 relative min-h-screen flex flex-col overflow-x-hidden pb-[88px]">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 pt-10 pb-4 flex flex-col gap-4 border-b border-transparent dark:border-gray-800">
                <div className="flex items-center justify-between relative">
                    <h1 className="text-xl font-bold text-text-main dark:text-white leading-tight w-full text-center">Kelola Menu</h1>
                    <button
                        onClick={handleAddMenu}
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full shadow-md active:scale-95 transition-transform"
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative w-full">
                    <div className="relative w-full px-4">
                        <span className="absolute left-7 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-[20px]">search</span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary text-sm placeholder-gray-400 dark:text-white"
                            placeholder="Cari nama menu..."
                        />
                    </div>

                    {/* Categories Tab */}
                    <div className="px-4 pb-0 overflow-x-auto hide-scrollbar flex gap-2 mt-4">
                        {displayCategories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${activeCategory === cat.id
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-white dark:bg-card-dark text-text-secondary dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-primary/50'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                        <button
                            onClick={() => navigate('/merchant/menu/categories')}
                            className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-text-secondary dark:text-gray-400 border border-transparent active:scale-95 transition-all"
                        >
                            <span className="material-symbols-outlined text-[20px]">settings</span>
                        </button>
                    </div>

                    {/* Spacing for tabs bottom */}
                    <div className="h-4"></div>
                </div>
            </header>

            <main className="flex flex-col gap-6 px-4 pt-2">
                {/* Menu Items */}
                <section className="flex flex-col gap-4">
                    {filteredMenus.map(item => (
                        <MenuItemCard
                            key={item.id}
                            item={item}
                            onToggleAvailability={handleToggleAvailability}
                            onEdit={handleEdit}
                            onDelete={() => handleDeleteClick(item)}
                        />
                    ))}
                </section>

                {filteredMenus.length === 0 && (
                    <EmptyState
                        icon="restaurant_menu"
                        title="Tidak ada menu ditemukan"
                        message="Coba ubah filter atau kata kunci pencarian."
                    />
                )}

                <div className="h-12"></div>
            </main>

            <MerchantBottomNavigation activeTab="menu" />

            {/* Delete Confirmation Modal */}
            {
                showDeleteModal && itemToDelete && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                        <div
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                            onClick={() => setShowDeleteModal(false)}
                        ></div>
                        <div className="relative bg-white dark:bg-card-dark w-full max-w-[320px] rounded-[24px] p-6 shadow-2xl transform transition-all flex flex-col items-center text-center gap-4 animate-scale-up">
                            <div className="flex flex-col gap-2">
                                <h2 className="text-lg font-semibold text-text-main dark:text-white">Hapus Menu ini?</h2>
                                <p className="text-sm text-text-secondary dark:text-gray-400 leading-relaxed">
                                    Menu yang dihapus tidak dapat dikembalikan. Apakah Anda yakin ingin menghapus <span className="font-medium text-text-main dark:text-gray-200">{itemToDelete.name}</span>?
                                </p>
                            </div>
                            <div className="flex w-full gap-3 mt-2">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 py-2.5 rounded-2xl bg-[#FF6B00] text-white font-semibold text-sm hover:bg-[#e65100] transition-colors"
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    )
}

function MenuItemCard({ item, onToggleAvailability, onEdit, onDelete }) {
    return (
        <article className={`bg-white dark:bg-card-dark rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700 p-3 flex gap-4 ${!item.isAvailable ? 'opacity-75' : ''}`}>
            {/* Image */}
            <div className="w-[80px] h-[80px] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 relative">
                <img
                    src={item.image}
                    alt={item.name}
                    className={`w-full h-full object-cover ${!item.isAvailable ? 'grayscale' : ''}`}
                />
                {!item.isAvailable && (
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white bg-black/50 px-2 py-1 rounded-md">Habis</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-between py-0.5">
                <div className="flex justify-between items-start gap-2">
                    <div>
                        <h3 className="text-sm font-semibold text-text-main dark:text-white leading-tight">{item.name}</h3>
                        <p className="text-xs text-text-secondary mt-1">Rp {item.price.toLocaleString('id-ID')}</p>
                    </div>

                    {/* Availability Toggle */}
                    <div className="flex flex-col items-end gap-1">
                        <label className="inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={item.isAvailable}
                                onChange={() => onToggleAvailability(item.id)}
                                className="sr-only peer"
                            />
                            <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                        </label>
                        <span className={`text-[9px] font-medium ${item.isAvailable ? 'text-primary' : 'text-text-secondary'}`}>
                            {item.isAvailable ? 'Tersedia' : 'Habis'}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end items-center gap-3 mt-2">
                    <button
                        onClick={() => onEdit(item.id)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-text-secondary hover:text-primary active:bg-gray-50 dark:active:bg-gray-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                        <span className="text-[10px] font-medium">Edit</span>
                    </button>
                    <button
                        onClick={onDelete}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-text-secondary hover:text-red-500 active:bg-red-50 dark:active:bg-red-900/20 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                        <span className="text-[10px] font-medium">Hapus</span>
                    </button>
                </div>
            </div>
        </article>
    )
}

export default MerchantMenuPage
