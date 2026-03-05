import { Link } from 'react-router-dom'

export default function AdminBreadcrumb({ items = [] }) {
    if (!items || items.length === 0) return null

    return (
        <nav className="flex items-center gap-2 text-sm mt-1">
            {items.map((item, index) => {
                const isLast = index === items.length - 1

                return (
                    <div key={index} className="flex items-center gap-2">
                        {item.path ? (
                            <Link
                                to={item.path}
                                className="text-[#617589] dark:text-[#94a3b8] hover:text-admin-primary dark:hover:text-admin-primary transition-colors"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className={isLast ? 'text-[#111418] dark:text-white font-medium' : 'text-[#617589] dark:text-[#94a3b8]'}>
                                {item.label}
                            </span>
                        )}
                        {!isLast && (
                            <span className="material-symbols-outlined text-[16px] text-[#617589] dark:text-[#94a3b8]">
                                chevron_right
                            </span>
                        )}
                    </div>
                )
            })}
        </nav>
    )
}
