import { useState, useEffect, Suspense } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import helpArticles from '@/features/customer/pages/help/helpArticles'

/**
 * WhatsApp support footer — shared across all help detail pages.
 */
function HelpSupportFooter() {
    return (
        <section className="mt-4 mb-6">
            <h2 className="text-base font-bold text-text-main mb-4 text-center">Butuh Bantuan Lain?</h2>
            <div className="flex flex-col gap-3">
                <button className="w-full py-3.5 px-4 rounded-2xl bg-[#25D366] text-white font-semibold text-sm shadow-md active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
                    <svg className="bi bi-whatsapp" fill="currentColor" height="20" viewBox="0 0 16 16" width="20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"></path>
                    </svg>
                    <span>WhatsApp Support</span>
                </button>
                <p className="text-center text-xs font-normal text-[#7A7A7A]">Jam Operasional: Setiap Hari (08:00 - 22:00 WIB)</p>
            </div>
        </section>
    )
}

/**
 * HelpArticlePage — Data-driven help article renderer.
 * Uses route params to look up the article from helpArticles registry,
 * then lazily loads and renders the content component inside a shared layout.
 */
function HelpArticlePage() {
    const navigate = useNavigate()
    const { category, slug } = useParams()
    const [ContentComponent, setContentComponent] = useState(null)
    const [loading, setLoading] = useState(true)

    // Build the lookup key from route params
    const articleKey = category && slug ? `${category}/${slug}` : category || ''
    const article = helpArticles[articleKey]

    useEffect(() => {
        if (!article) {
            setLoading(false)
            return
        }

        let cancelled = false
        setLoading(true)

        article.content().then((mod) => {
            if (!cancelled) {
                // Support both default and named exports
                const Comp = mod.default || mod
                setContentComponent(() => Comp)
                setLoading(false)
            }
        }).catch(() => {
            if (!cancelled) setLoading(false)
        })

        return () => { cancelled = true }
    }, [articleKey])

    // Not found
    if (!article && !loading) {
        return (
            <div className="relative min-h-screen flex flex-col bg-background-light pb-6">
                <header className="sticky top-0 z-20 bg-background-light/95 backdrop-blur-md px-4 pt-12 pb-4 flex items-center justify-between border-b border-transparent transition-colors">
                    <button onClick={() => navigate(-1)} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors">
                        <span className="material-symbols-outlined text-text-main">arrow_back</span>
                    </button>
                    <h1 className="text-text-main text-lg font-bold tracking-tight absolute left-1/2 transform -translate-x-1/2">Tidak Ditemukan</h1>
                    <div className="w-10 h-10"></div>
                </header>
                <main className="flex-1 flex items-center justify-center px-4">
                    <div className="text-center">
                        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">help_center</span>
                        <h2 className="text-lg font-bold text-text-main mb-2">Artikel tidak ditemukan</h2>
                        <p className="text-sm text-text-secondary mb-6">Halaman bantuan yang Anda cari tidak tersedia.</p>
                        <button onClick={() => navigate('/help')} className="px-6 py-3 bg-primary text-white rounded-xl font-semibold text-sm">
                            Kembali ke Pusat Bantuan
                        </button>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="relative min-h-screen flex flex-col bg-background-light pb-6">
            {/* Shared Header */}
            <header className="sticky top-0 z-20 bg-background-light/95 backdrop-blur-md px-4 pt-12 pb-4 flex items-center justify-between border-b border-transparent transition-colors">
                <button
                    onClick={() => navigate(-1)}
                    className="absolute left-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-text-main active:scale-95 transition-transform"
                >
                    <span className="material-symbols-outlined text-text-main">arrow_back</span>
                </button>
                <h1 className="text-text-main text-lg font-bold tracking-tight absolute left-1/2 transform -translate-x-1/2 whitespace-nowrap max-w-[70%] truncate">
                    {article?.title || 'Bantuan'}
                </h1>
                <div className="w-10 h-10"></div>
            </header>

            {/* Dynamic Content */}
            <main className="flex flex-col gap-6 px-4 pt-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-pulse space-y-4 w-full">
                            <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                            <div className="h-4 bg-slate-200 rounded w-full"></div>
                            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                            <div className="h-32 bg-slate-200 rounded-xl w-full mt-4"></div>
                        </div>
                    </div>
                ) : ContentComponent ? (
                    <ContentComponent />
                ) : null}

                {/* Shared WhatsApp Footer */}
                {!loading && <HelpSupportFooter />}
                <div className="h-4"></div>
            </main>
        </div>
    )
}

export { HelpSupportFooter }
export default HelpArticlePage
