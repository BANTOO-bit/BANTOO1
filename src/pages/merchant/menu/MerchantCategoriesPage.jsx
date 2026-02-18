import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmationModal from '../../../components/shared/ConfirmationModal'

function MerchantCategoriesPage() {
    const navigate = useNavigate()
    const [categories, setCategories] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentCategory, setCurrentCategory] = useState({ id: '', label: '' })
    const [isEditing, setIsEditing] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState(null)

    // Load categories from localStorage on mount
    useEffect(() => {
        const storedCategories = localStorage.getItem('merchant_categories')
        if (storedCategories) {
            setCategories(JSON.parse(storedCategories))
        } else {
            // Default categories if none exist
            // Default categories from Customer App (AllCategoriesPage.jsx)
            const defaults = [
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
            ]
            setCategories(defaults)
            localStorage.setItem('merchant_categories', JSON.stringify(defaults))
        }
    }, [])

    const handleSave = () => {
        if (!currentCategory.label.trim()) return

        let newCategories
        if (isEditing) {
            newCategories = categories.map(c =>
                c.id === currentCategory.id ? { ...c, label: currentCategory.label } : c
            )
        } else {
            const newId = currentCategory.label.toLowerCase().replace(/\s+/g, '-')
            const newCat = { id: newId, label: currentCategory.label }
            newCategories = [...categories, newCat]
        }

        setCategories(newCategories)
        localStorage.setItem('merchant_categories', JSON.stringify(newCategories))
        closeModal()
    }

    const handleDelete = (id) => {
        setDeleteTarget(id)
    }

    const confirmDelete = () => {
        if (deleteTarget) {
            const newCategories = categories.filter(c => c.id !== deleteTarget)
            setCategories(newCategories)
            localStorage.setItem('merchant_categories', JSON.stringify(newCategories))
        }
        setDeleteTarget(null)
    }

    const openModal = (category = null) => {
        if (category) {
            setCurrentCategory(category)
            setIsEditing(true)
        } else {
            setCurrentCategory({ id: '', label: '' })
            setIsEditing(false)
        }
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setCurrentCategory({ id: '', label: '' })
        setIsEditing(false)
    }

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 relative min-h-screen flex flex-col overflow-x-hidden pb-[88px]">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 pt-10 pb-4 flex flex-col gap-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between relative">
                    <button
                        onClick={() => navigate('/merchant/menu')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-text-main dark:text-white active:scale-95 transition-transform hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                    >
                        <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                    </button>
                    <h1 className="text-xl font-bold text-text-main dark:text-white leading-tight w-full text-center">Kelola Kategori</h1>
                </div>
            </header>
            <main className="flex flex-col gap-4 px-4 pt-4">
                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl flex gap-3 items-start">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">info</span>
                    <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                        Kategori ini akan muncul sebagai tab di halaman menu Anda. Pastikan nama kategori jelas dan mudah dimengerti pelanggan.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    {categories.map((cat, idx) => (
                        <div key={cat.id} className="bg-white dark:bg-card-dark p-4 rounded-xl shadow-soft border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                            <span className="font-semibold text-text-main dark:text-white">{cat.label}</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => openModal(cat)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                </button>
                                <button
                                    onClick={() => handleDelete(cat.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Float Button */}
            <div className="fixed bottom-6 right-6 z-40">
                <button
                    onClick={() => openModal()}
                    className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark transition-transform active:scale-95"
                >
                    <span className="material-symbols-outlined text-[28px]">add</span>
                </button>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal}></div>
                    <div className="bg-white dark:bg-card-dark w-full max-w-xs rounded-2xl p-6 relative z-10 shadow-2xl animate-scale-up">
                        <h3 className="text-lg font-bold mb-4 text-text-main dark:text-white">
                            {isEditing ? 'Edit Kategori' : 'Tambah Kategori'}
                        </h3>
                        <input
                            type="text"
                            value={currentCategory.label}
                            onChange={(e) => setCurrentCategory({ ...currentCategory, label: e.target.value })}
                            placeholder="Nama Kategori (contoh: Promo)"
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm mb-6"
                            autoFocus
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={closeModal}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-500 font-medium text-sm"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!currentCategory.label.trim()}
                                className="flex-1 py-2.5 rounded-xl bg-primary text-white font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
                title="Hapus Kategori?"
                message="Kategori yang dihapus tidak dapat dikembalikan. Yakin ingin menghapus?"
                confirmLabel="Hapus"
                cancelLabel="Batal"
                icon="delete"
                confirmColor="red"
            />
        </div>
    )
}

export default MerchantCategoriesPage
