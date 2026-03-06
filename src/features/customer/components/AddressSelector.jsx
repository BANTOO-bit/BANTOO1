import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAddress } from '@/context/AddressContext'

function AddressSelector() {
    const navigate = useNavigate()
    const { addresses, selectedAddress, selectAddress } = useAddress()
    const [isOpen, setIsOpen] = useState(false)

    const currentAddress = selectedAddress || addresses.find(a => a.isDefault) || addresses[0]

    const handleSelect = (addressId) => {
        selectAddress(addressId)
        setIsOpen(false)
    }

    const getLabelIcon = (label) => {
        if (label === 'Rumah') return 'home'
        if (label === 'Kantor') return 'work'
        return 'location_on'
    }

    return (
        <>
            {/* Address Button */}
            <div className="px-4 pt-2 pb-2">
                <div className="flex flex-col">
                    <span className="text-[10px] text-text-secondary font-medium mb-0.5 uppercase tracking-wide">Antar ke</span>
                    <button
                        onClick={() => setIsOpen(true)}
                        className="flex items-center gap-1 active:opacity-70 transition-opacity w-fit text-left"
                    >
                        <span className="material-symbols-outlined text-primary text-[18px] mr-1">
                            {currentAddress ? getLabelIcon(currentAddress.label) : 'location_on'}
                        </span>
                        <span className="font-semibold text-sm text-text-main truncate max-w-[260px]">
                            {currentAddress
                                ? `${currentAddress.label} - ${currentAddress.address.substring(0, 25)}${currentAddress.address.length > 25 ? '...' : ''}`
                                : 'Pilih Alamat'
                            }
                        </span>
                        <span className="material-symbols-outlined text-primary text-[20px]">
                            expand_more
                        </span>
                    </button>
                </div>
            </div>

            {/* Bottom Sheet Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Sheet */}
                    <div className="relative w-full max-w-md bg-white rounded-t-2xl shadow-2xl z-[101] max-h-[70vh] flex flex-col animate-slide-up">
                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="w-10 h-1 bg-gray-300 rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-3 border-b border-border-color">
                            <h3 className="text-base font-bold text-text-main">Pilih Alamat Pengantaran</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 active:scale-95 transition-all"
                            >
                                <span className="material-symbols-outlined text-text-secondary text-xl">close</span>
                            </button>
                        </div>

                        {/* Address List */}
                        <div className="flex-1 overflow-y-auto px-4 py-3">
                            {addresses.length === 0 ? (
                                <div className="py-8 text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <span className="material-symbols-outlined text-gray-400 text-3xl">location_off</span>
                                    </div>
                                    <p className="text-sm text-text-main font-medium mb-1">Belum ada alamat</p>
                                    <p className="text-xs text-text-secondary mb-4">Tambahkan alamat untuk mulai pesan</p>
                                    <button
                                        onClick={() => {
                                            setIsOpen(false)
                                            navigate('/address/add')
                                        }}
                                        className="px-5 py-2.5 bg-primary text-white rounded-xl font-medium text-sm active:scale-95 transition-transform"
                                    >
                                        + Tambah Alamat
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {addresses
                                        .sort((a, b) => {
                                            if (a.isDefault && !b.isDefault) return -1
                                            if (!a.isDefault && b.isDefault) return 1
                                            return 0
                                        })
                                        .map(addr => (
                                            <button
                                                key={addr.id}
                                                onClick={() => handleSelect(addr.id)}
                                                className={`w-full flex items-start gap-3 p-3.5 rounded-xl transition-all text-left ${currentAddress?.id === addr.id
                                                        ? 'bg-orange-50 border-2 border-primary/40 shadow-sm'
                                                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100 active:scale-[0.98]'
                                                    }`}
                                            >
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${addr.label === 'Rumah' ? 'bg-blue-100' :
                                                        addr.label === 'Kantor' ? 'bg-green-100' : 'bg-orange-100'
                                                    }`}>
                                                    <span className={`material-symbols-outlined text-lg ${addr.label === 'Rumah' ? 'text-blue-600' :
                                                            addr.label === 'Kantor' ? 'text-green-600' : 'text-primary'
                                                        }`}>
                                                        {getLabelIcon(addr.label)}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-sm text-text-main">{addr.label}</span>
                                                        {addr.isDefault && (
                                                            <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-bold">
                                                                Utama
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{addr.address}</p>
                                                </div>
                                                {currentAddress?.id === addr.id && (
                                                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center shrink-0 mt-1">
                                                        <span className="material-symbols-outlined text-white text-sm">check</span>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                </div>
                            )}
                        </div>

                        {/* Add New Address Button */}
                        {addresses.length > 0 && (
                            <div className="px-4 py-3 border-t border-border-color bg-white">
                                <button
                                    onClick={() => {
                                        setIsOpen(false)
                                        navigate('/address/add')
                                    }}
                                    className="w-full flex items-center justify-center gap-2 py-3 text-primary font-semibold text-sm bg-orange-50 hover:bg-orange-100 rounded-xl active:scale-[0.98] transition-all"
                                >
                                    <span className="material-symbols-outlined text-lg">add_location</span>
                                    Tambah Alamat Baru
                                </button>
                            </div>
                        )}

                        {/* Safe area for bottom */}
                        <div className="h-2 bg-white rounded-b-none" />
                    </div>
                </div>
            )}
        </>
    )
}

export default AddressSelector
