import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminService } from '@/services/adminService'

/**
 * AdminSearchBar — Global search with debounced results dropdown.
 */
function AdminSearchBar() {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [isSearching, setIsSearching] = useState(false)
    const [showSearchResults, setShowSearchResults] = useState(false)
    const searchRef = useRef(null)
    const searchTimerRef = useRef(null)

    // Debounced global search
    useEffect(() => {
        if (!searchQuery || searchQuery.length < 2) {
            setSearchResults([])
            setShowSearchResults(false)
            return
        }

        clearTimeout(searchTimerRef.current)
        searchTimerRef.current = setTimeout(async () => {
            setIsSearching(true)
            try {
                const results = await adminService.searchGlobal(searchQuery)
                setSearchResults(results)
                setShowSearchResults(true)
            } catch (err) {
                if (import.meta.env.DEV) console.error('Search error:', err)
            } finally {
                setIsSearching(false)
            }
        }, 400)

        return () => clearTimeout(searchTimerRef.current)
    }, [searchQuery])

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (searchRef.current && !searchRef.current.contains(event.target)) setShowSearchResults(false)
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleSearchSelect = (result) => {
        setShowSearchResults(false)
        setSearchQuery('')
        navigate(result.path)
    }

    return (
        <div className="hidden md:flex relative w-56" ref={searchRef}>
            <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-[#617589]">
                {isSearching
                    ? <span className="material-symbols-outlined text-lg animate-spin">sync</span>
                    : <span className="material-symbols-outlined text-lg">search</span>
                }
            </div>
            <input
                className="block w-full pl-9 pr-3 py-1.5 border-none rounded-lg bg-[#f0f2f4] dark:bg-[#2a3b4d] text-[#111418] dark:text-white placeholder-[#617589] focus:ring-2 focus:ring-primary text-xs outline-none transition-all"
                placeholder="Cari warung, driver..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
            />

            {/* Search Results Dropdown */}
            {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] rounded-xl shadow-lg overflow-hidden z-50">
                    {searchResults.length === 0 ? (
                        <div className="p-4 text-center text-xs text-[#617589]">Tidak ditemukan</div>
                    ) : (
                        <div className="max-h-[280px] overflow-y-auto divide-y divide-[#e5e7eb] dark:divide-[#2a3b4d]">
                            {searchResults.map((r, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSearchSelect(r)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#f9fafb] dark:hover:bg-[#2a3b4d]/50 transition-colors text-left"
                                >
                                    <div className="w-7 h-7 rounded-lg bg-[#f0f2f4] dark:bg-[#2a3b4d] flex items-center justify-center text-[#617589]">
                                        <span className="material-symbols-outlined text-sm">{r.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-[#111418] dark:text-white truncate">{r.label}</p>
                                        <p className="text-[10px] text-[#617589] capitalize">{r.type} • {r.sub}</p>
                                    </div>
                                    <span className="material-symbols-outlined text-[#94a3b8] text-sm">arrow_forward</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default AdminSearchBar
