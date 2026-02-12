import { createContext, useContext, useState, useEffect } from 'react'

const AddressContext = createContext()

export function useAddress() {
    const context = useContext(AddressContext)
    if (!context) {
        throw new Error('useAddress must be used within an AddressProvider')
    }
    return context
}

// Default addresses for demo
const defaultAddresses = [
    {
        id: 1,
        label: 'Rumah',
        name: 'Andi Pratama',
        phone: '+62 812 3456 7890',
        address: 'Jl. Mangga Dua No. 45, RT 03/RW 05',
        detail: 'Pagar hijau, dekat warung Bu Sari',
        area: 'Kecamatan Bantoo',
        isDefault: true
    },
    {
        id: 2,
        label: 'Kantor',
        name: 'Andi Pratama',
        phone: '+62 812 3456 7890',
        address: 'Gedung Graha Mandiri Lt. 5',
        detail: 'Lobby utama, minta ke resepsionis',
        area: 'Kecamatan Bantoo',
        isDefault: false
    }
]

export function AddressProvider({ children }) {
    const [addresses, setAddresses] = useState(() => {
        const saved = localStorage.getItem('bantoo_addresses')
        return saved ? JSON.parse(saved) : defaultAddresses
    })

    const [selectedAddressId, setSelectedAddressId] = useState(() => {
        const saved = localStorage.getItem('bantoo_selected_address')
        if (saved) return parseInt(saved)
        const defaultAddr = addresses.find(a => a.isDefault)
        return defaultAddr ? defaultAddr.id : addresses[0]?.id
    })

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem('bantoo_addresses', JSON.stringify(addresses))
    }, [addresses])

    useEffect(() => {
        if (selectedAddressId) {
            localStorage.setItem('bantoo_selected_address', selectedAddressId.toString())
        }
    }, [selectedAddressId])

    const selectedAddress = addresses.find(a => a.id === selectedAddressId) || addresses[0]

    const addAddress = (newAddress) => {
        const id = Date.now()
        const address = { ...newAddress, id }

        // If this is set as default, update others
        if (newAddress.isDefault) {
            setAddresses(prev => [
                ...prev.map(a => ({ ...a, isDefault: false })),
                address
            ])
        } else {
            setAddresses(prev => [...prev, address])
        }

        return id
    }

    const updateAddress = (id, updates) => {
        setAddresses(prev => {
            // If setting as default, update others first
            if (updates.isDefault) {
                return prev.map(a =>
                    a.id === id
                        ? { ...a, ...updates }
                        : { ...a, isDefault: false }
                )
            }
            return prev.map(a => a.id === id ? { ...a, ...updates } : a)
        })
    }

    const deleteAddress = (id) => {
        setAddresses(prev => {
            const filtered = prev.filter(a => a.id !== id)
            // If deleted address was default, set first as default
            if (prev.find(a => a.id === id)?.isDefault && filtered.length > 0) {
                filtered[0].isDefault = true
            }
            return filtered
        })

        // If deleted address was selected, select first available
        if (selectedAddressId === id && addresses.length > 1) {
            const remaining = addresses.filter(a => a.id !== id)
            setSelectedAddressId(remaining[0]?.id)
        }
    }

    const setDefaultAddress = (id) => {
        setAddresses(prev => prev.map(a => ({
            ...a,
            isDefault: a.id === id
        })))
    }

    const selectAddress = (id) => {
        setSelectedAddressId(id)
    }

    const value = {
        addresses,
        selectedAddress,
        selectedAddressId,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        selectAddress,
    }

    return (
        <AddressContext.Provider value={value}>
            {children}
        </AddressContext.Provider>
    )
}

export default AddressContext
