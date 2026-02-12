import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAddress } from '../../context/AddressContext'

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
        <div className="relative px-4 pt-1 pb-1 z-20">
            <div className="flex flex-col">
                <span className="text-xs text-text-secondary font-medium mb-0.5">Antar ke</span>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-1 active:opacity-70 transition-opacity w-fit text-left"
                >
                    <span className="material-symbols-outlined text-primary text-[18px] mr-1">
                        {currentAddress ? getLabelIcon(currentAddress.label) : 'location_on'}
                    </span>
                    <span className="font-bold text-text-main truncate max-w-[280px]">
                        {currentAddress
                            ? `${currentAddress.label} - ${currentAddress.address.substring(0, 25)}${currentAddress.address.length > 25 ? '...' : ''}`
                            : 'Pilih Alamat'
                        }
                    </span>
                    <span className={`material-symbols-outlined text-primary text-[20px] transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                        expand_more
                    </span>
                </button>
            </div>

            {/* Dropdown */}
            {isOpen && (
                <>
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 z-30"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown Content */}
                    <div className="absolute left-4 right-4 top-full mt-2 bg-white rounded-xl shadow-lg border border-border-color z-40 max-h-[300px] overflow-y-auto">
                        <div className="p-2">
                            <p className="text-xs text-text-secondary px-3 py-2 font-medium">Alamat Tersimpan</p>

                            {addresses.length === 0 ? (
                                <div className="px-3 py-4 text-center">
                                    <p className="text-sm text-text-secondary mb-2">Belum ada alamat</p>
                                    <button
                                        onClick={() => {
                                            setIsOpen(false)
                                            navigate('/address/add')
                                        }}
                                        className="text-sm text-primary font-medium"
                                    >
                                        + Tambah Alamat
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {addresses
                                        .sort((a, b) => {
                                            // Primary address (isDefault) always comes first
                                            if (a.isDefault && !b.isDefault) return -1
                                            if (!a.isDefault && b.isDefault) return 1
                                            return 0
                                        })
                                        .map(addr => (
                                            <button
                                                key={addr.id}
                                                onClick={() => handleSelect(addr.id)}
                                                className={`w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left ${currentAddress?.id === addr.id
                                                    ? 'bg-orange-50 border border-primary/30'
                                                    : 'hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${addr.label === 'Rumah' ? 'bg-blue-100' :
                                                    addr.label === 'Kantor' ? 'bg-green-100' : 'bg-orange-100'
                                                    }`}>
                                                    <span className={`material-symbols-outlined text-sm ${addr.label === 'Rumah' ? 'text-blue-600' :
                                                        addr.label === 'Kantor' ? 'text-green-600' : 'text-primary'
                                                        }`}>
                                                        {getLabelIcon(addr.label)}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-sm text-text-main">{addr.label}</span>
                                                        {addr.isDefault && (
                                                            <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                                                                Utama
                                                            </span>
                                                        )}
                                                        {currentAddress?.id === addr.id && (
                                                            <span className="material-symbols-outlined text-primary text-sm ml-auto">check</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-text-secondary truncate mt-0.5">{addr.address}</p>
                                                </div>
                                            </button>
                                        ))}

                                    {/* Add New Address */}
                                    <button
                                        onClick={() => {
                                            setIsOpen(false)
                                            navigate('/address/add')
                                        }}
                                        className="w-full flex items-center gap-2 p-3 text-primary font-medium text-sm hover:bg-gray-50 rounded-lg mt-1 border-t border-border-color"
                                    >
                                        <span className="material-symbols-outlined text-lg">add</span>
                                        Tambah Alamat Baru
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default AddressSelector
