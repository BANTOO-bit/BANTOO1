import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAddress } from '../../../context/AddressContext'
import DeleteConfirmModal from '../../../components/shared/DeleteConfirmModal'

function AddressListPage() {
    const navigate = useNavigate()
    const { addresses, deleteAddress, setDefaultAddress, selectAddress } = useAddress()
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, addressId: null, label: '' })

    const handleSelect = (addressId) => {
        selectAddress(addressId)
        navigate(-1)
    }

    const handleDeleteClick = (e, addressId, label) => {
        e.stopPropagation()
        setDeleteModal({ isOpen: true, addressId, label })
    }

    const handleDeleteConfirm = () => {
        if (deleteModal.addressId) {
            deleteAddress(deleteModal.addressId)
        }
        setDeleteModal({ isOpen: false, addressId: null, label: '' })
    }

    const handleDeleteCancel = () => {
        setDeleteModal({ isOpen: false, addressId: null, label: '' })
    }

    const handleSetDefault = (e, addressId) => {
        e.stopPropagation()
        setDefaultAddress(addressId)
    }

    return (
        <div className="min-h-screen flex flex-col bg-background-light pb-[180px]">
            {/* Header */}
            <header className="bg-white px-4 pt-14 pb-4 border-b border-border-color sticky top-0 z-40">
                <div className="relative flex items-center justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute left-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-text-main active:scale-90 transition-transform"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-bold">Daftar Alamat</h1>
                </div>
            </header>

            {/* Address List */}
            <main className="flex flex-col gap-4 p-4">
                {addresses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-4xl text-gray-400">location_off</span>
                        </div>
                        <p className="text-text-secondary mb-4">Belum ada alamat tersimpan</p>
                        <button
                            onClick={() => navigate('/address/add')}
                            className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-md active:scale-95 transition-transform"
                        >
                            Tambah Alamat
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {addresses
                            .sort((a, b) => {
                                // Primary address (isDefault) always comes first
                                if (a.isDefault && !b.isDefault) return -1
                                if (!a.isDefault && b.isDefault) return 1
                                return 0
                            })
                            .map(addr => (
                                <div
                                    key={addr.id}
                                    onClick={() => handleSelect(addr.id)}
                                    className="bg-white p-4 rounded-xl border border-border-color relative group cursor-pointer active:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Icon */}
                                        <div className={`p-2 rounded-lg ${addr.isDefault ? 'bg-primary/10' : 'bg-gray-100'}`}>
                                            <span
                                                className={`material-symbols-outlined text-[20px] ${addr.isDefault ? 'text-primary' : 'text-text-secondary'}`}
                                                style={{ fontVariationSettings: addr.isDefault ? "'FILL' 1" : "'FILL' 0" }}
                                            >
                                                {addr.label === 'Rumah' ? 'home' : addr.label === 'Kantor' ? 'work' : 'location_on'}
                                            </span>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-bold text-sm">{addr.label}</h3>
                                                {addr.isDefault ? (
                                                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase">
                                                        Utama
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={(e) => handleSetDefault(e, addr.id)}
                                                        className="text-[10px] font-bold text-primary border border-primary px-3 py-1 rounded-full hover:bg-primary hover:text-white active:scale-95 transition-all"
                                                    >
                                                        Atur sebagai Utama
                                                    </button>
                                                )}
                                            </div>

                                            <p className="text-sm text-text-secondary leading-relaxed">
                                                {addr.address}
                                                {addr.detail && `, ${addr.detail}`}
                                            </p>

                                            <div className="mt-3 flex items-center justify-between">
                                                <div className="flex items-center text-xs text-text-secondary">
                                                    <span className="material-symbols-outlined text-sm mr-1">person</span>
                                                    <span>{addr.name} ({addr.phone})</span>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <button
                                                        onClick={(e) => handleDeleteClick(e, addr.id, addr.label)}
                                                        aria-label="Hapus"
                                                        className="text-gray-400 hover:text-red-500 transition-colors flex items-center justify-center"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            navigate('/address/edit', { state: { address: addr } })
                                                        }}
                                                        className="text-primary text-xs font-bold hover:underline"
                                                    >
                                                        Edit
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </main>

            {/* Fixed Bottom Button */}
            <div className="fixed bottom-0 left-0 right-0 z-50">
                <div className="bg-gradient-to-t from-background-light via-background-light/95 to-transparent px-4 pb-6 pt-8">
                    <button
                        onClick={() => navigate('/address/add')}
                        className="w-full h-[56px] bg-primary text-white font-bold rounded-[28px] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">add_location_alt</span>
                        <span>Tambah Alamat Baru</span>
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                addressLabel={deleteModal.label}
            />
        </div>
    )
}

export default AddressListPage
