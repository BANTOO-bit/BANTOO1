import { useNavigate } from 'react-router-dom'

const categories = [
    { id: 'makanan-berat', name: 'Makanan Berat', icon: 'dinner_dining' },
    { id: 'jajanan', name: 'Jajanan', icon: 'fastfood' },
    { id: 'kue', name: 'Kue', icon: 'cake' },
    { id: 'makanan-ringan', name: 'Snack', icon: 'cookie' },
    { id: 'seafood', name: 'Seafood', icon: 'set_meal' },
    { id: 'minuman', name: 'Minuman', icon: 'local_drink' },
    { id: 'kopi-teh', name: 'Kopi & Teh', icon: 'coffee' },
    { id: 'dessert', name: 'Dessert', icon: 'icecream' },
]

function CategoryItem({ category, onClick }) {
    return (
        <button
            className="flex flex-col items-center gap-1.5 group"
            onClick={() => onClick?.(category)}
        >
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center group-active:scale-90 transition-all duration-150 group-hover:bg-primary/5">
                <span className="material-symbols-outlined text-[22px] text-gray-600 group-hover:text-primary transition-colors">{category.icon}</span>
            </div>
            <span className="text-[10px] font-medium text-text-secondary text-center leading-tight">{category.name}</span>
        </button>
    )
}

function CategoryGrid() {
    const navigate = useNavigate()

    const handleCategoryClick = (category) => {
        navigate(`/category/${category.id}`)
    }

    return (
        <section>
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-[15px] font-bold text-text-main">Kategori</h2>
                <button
                    onClick={() => navigate('/categories')}
                    className="text-xs text-primary font-medium hover:text-primary/80 flex items-center gap-0.5"
                >
                    Lihat Semua
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                </button>
            </div>
            <div className="grid grid-cols-4 gap-y-4 gap-x-2">
                {categories.map(category => (
                    <CategoryItem
                        key={category.id}
                        category={category}
                        onClick={handleCategoryClick}
                    />
                ))}
            </div>
        </section>
    )
}

export default CategoryGrid
