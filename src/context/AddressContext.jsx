import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { addressService } from '../services/addressService'
import { useToast } from './ToastContext'

const AddressContext = createContext()

export function useAddress() {
    const context = useContext(AddressContext)
    if (!context) {
        throw new Error('useAddress must be used within an AddressProvider')
    }
    return context
}

export function AddressProvider({ children }) {
    const { user } = useAuth()
    const toast = useToast()
    const [addresses, setAddresses] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [selectedAddressId, setSelectedAddressId] = useState(() => {
        const saved = localStorage.getItem('bantoo_selected_address')
        return saved ? parseInt(saved) : null
    })

    const fetchAddresses = useCallback(async () => {
        if (!user) {
            setAddresses([])
            return
        }

        setIsLoading(true)
        try {
            const data = await addressService.getAddresses()
            setAddresses(data)

            // If we have addresses but none selected (or selected one is gone), select the default one
            if (data.length > 0) {
                const defaultAddr = data.find(a => a.is_default)
                const currentSelected = data.find(a => a.id === selectedAddressId)

                if (!currentSelected) {
                    setSelectedAddressId(defaultAddr ? defaultAddr.id : data[0].id)
                }
            }
        } catch (error) {
            console.error('Failed to fetch addresses:', error)
            // don't show toast on initial load to avoid spamming if just empty
        } finally {
            setIsLoading(false)
        }
    }, [user, selectedAddressId])

    useEffect(() => {
        fetchAddresses()
    }, [fetchAddresses])

    useEffect(() => {
        if (selectedAddressId) {
            localStorage.setItem('bantoo_selected_address', selectedAddressId.toString())
        }
    }, [selectedAddressId])

    const selectedAddress = addresses.find(a => a.id === selectedAddressId) || addresses.find(a => a.is_default) || addresses[0]

    const addAddress = async (newAddress) => {
        try {
            await addressService.addAddress(newAddress)
            await fetchAddresses()
            toast.success('Alamat berhasil ditambahkan')
            return true
        } catch (error) {
            console.error('Failed to add address:', error)
            toast.error('Gagal menambahkan alamat')
            throw error
        }
    }

    const updateAddress = async (id, updates) => {
        try {
            await addressService.updateAddress(id, updates)
            await fetchAddresses()
            toast.success('Alamat berhasil diperbarui')
        } catch (error) {
            console.error('Failed to update address:', error)
            toast.error('Gagal memperbarui alamat')
            throw error
        }
    }

    const deleteAddress = async (id) => {
        try {
            await addressService.deleteAddress(id)
            await fetchAddresses()
            toast.success('Alamat berhasil dihapus')
        } catch (error) {
            console.error('Failed to delete address:', error)
            toast.error('Gagal menghapus alamat')
            throw error
        }
    }

    const setDefaultAddress = async (id) => {
        try {
            await addressService.setDefault(id)
            await fetchAddresses()
            toast.success('Alamat utama diperbarui')
        } catch (error) {
            console.error('Failed to set default address:', error)
            toast.error('Gagal mengatur alamat utama')
            throw error
        }
    }

    const selectAddress = (id) => {
        setSelectedAddressId(id)
    }

    const value = {
        addresses: addresses.map(addr => ({
            ...addr,
            isDefault: addr.is_default, // map snake_case to camelCase for component compatibility
            name: addr.recipient_name, // map db col to component prop
            // Ensure other fields match component expectations if needed
        })),
        isLoading,
        selectedAddress: selectedAddress ? {
            ...selectedAddress,
            isDefault: selectedAddress.is_default,
            name: selectedAddress.recipient_name
        } : null,
        selectedAddressId,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        selectAddress,
        refreshAddresses: fetchAddresses
    }

    return (
        <AddressContext.Provider value={value}>
            {children}
        </AddressContext.Provider>
    )
}

export default AddressContext
