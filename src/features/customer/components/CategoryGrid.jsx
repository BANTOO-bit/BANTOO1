const categories = [
    { id: 1, name: "Burger", icon: "lunch_dining" },
    { id: 2, name: "Pizza", icon: "local_pizza" },
    { id: 3, name: "Sushi", icon: "set_meal" },
    { id: 4, name: "Minuman", icon: "local_drink" },
    { id: 5, name: "Ayam", icon: "restaurant" },
    { id: 6, name: "Kopi", icon: "coffee" },
    { id: 7, name: "Camilan", icon: "bakery_dining" },
    { id: 8, name: "Dessert", icon: "icecream" },
]

function CategoryItem({ category, onClick }) {
    return (
        <div
            className="flex flex-col items-center gap-2 cursor-pointer"
            onClick={() => onClick?.(category)}
        >
            <div className="w-16 h-16 rounded-full bg-white shadow-soft border border-border-color flex items-center justify-center text-primary active:scale-95 transition-transform">
                <span className="material-symbols-outlined text-3xl">{category.icon}</span>
            </div>
            <span className="text-xs font-medium text-text-main">{category.name}</span>
        </div>
    )
}

function CategoryGrid({ onCategoryClick }) {
    return (
        <section>
            <h2 className="text-lg font-bold text-text-main mb-4">Kategori</h2>
            <div className="grid grid-cols-4 gap-y-6 gap-x-4">
                {categories.map(category => (
                    <CategoryItem
                        key={category.id}
                        category={category}
                        onClick={onCategoryClick}
                    />
                ))}
            </div>
        </section>
    )
}

export default CategoryGrid
