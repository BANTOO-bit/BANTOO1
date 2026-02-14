import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import BackButton from '../../components/shared/BackButton'
import { useAddress } from '../../context/AddressContext'
import MerchantShopOpenWarning from '../../components/shared/MerchantShopOpenWarning'

function CartPage() {
    const navigate = useNavigate()
    const {
        cartItems,
        merchantInfo,
        cartTotal,
        updateQuantity,
        removeFromCart,
        getMerchantNotes,
        updateMerchantNotes
    } = useCart()
    const { selectedAddress, addresses, selectAddress } = useAddress()

    // State for notes modal
    const [notesModal, setNotesModal] = useState({ isOpen: false, merchantName: '', currentNotes: '' })
    // State for address modal
    const [showAddressModal, setShowAddressModal] = useState(false)

    // Service fee and total calculation
    // Calculate per-merchant delivery fee (multiple merchants)
    const merchantGroups = groupByMerchant(cartItems)
    const totalMerchants = Object.keys(merchantGroups).length
    const totalDeliveryFee = totalMerchants * 8000 // Rp 8k per merchant (base)
    const totalPayment = cartTotal + totalDeliveryFee

    // Group items by merchant
    function groupByMerchant(items) {
        return items.reduce((groups, item) => {
            const merchantName = item.merchantName || merchantInfo?.name || 'Unknown'
            if (!groups[merchantName]) {
                groups[merchantName] = {
                    items: [],
                    merchantData: item.merchantData || merchantInfo
                }
            }
            groups[merchantName].items.push(item)
            return groups
        }, {})
    }

    const handleQuantityChange = (itemId, change) => {
        const item = cartItems.find(i => i.id === itemId)
        if (item) {
            const newQuantity = item.quantity + change
            if (newQuantity <= 0) {
                removeFromCart(itemId)
            } else {
                updateQuantity(itemId, newQuantity)
            }
        }
    }

    const getMerchantSubtotal = (items) => {
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    }

    const getMerchantItemCount = (items) => {
        return items.reduce((sum, item) => sum + item.quantity, 0)
    }

    // Handle add more items - navigate to merchant detail
    const handleAddMoreItems = (merchantName, merchantData) => {
        // Create merchant object for navigation
        const merchant = merchantData || merchantInfo || {
            id: Date.now(),
            name: merchantName,
            image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=200&fit=crop',
            rating: 4.5,
            ratingCount: 100,
            distance: '1.0 km',
            deliveryTime: '15-25 mnt',
            category: 'Makanan',
            isOpen: true
        }

        // Navigate to merchant detail
        if (merchant.id) {
            navigate(`/merchant/${merchant.id}`)
        } else {
            navigate('/')
        }
    }

    // Handle notes modal
    const openNotesModal = (merchantName) => {
        setNotesModal({
            isOpen: true,
            merchantName,
            currentNotes: getMerchantNotes(merchantName)
        })
    }

    const saveNotes = () => {
        updateMerchantNotes(notesModal.merchantName, notesModal.currentNotes)
        setNotesModal({ isOpen: false, merchantName: '', currentNotes: '' })
    }

    // Empty cart state
    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen flex flex-col bg-background-light">
                {/* Header */}
                <header className="sticky top-0 z-20 bg-background-light/95 backdrop-blur-md px-4 pt-12 pb-4 border-b border-border-color">
                    <div className="relative flex items-center justify-center min-h-[40px]">
                        <BackButton />
                        <h1 className="text-lg font-bold text-text-main">Keranjang</h1>
                    </div>
                </header>

                <div className="flex-1 flex flex-col items-center justify-center px-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-5xl text-gray-300">shopping_cart</span>
                    </div>
                    <h3 className="font-bold text-text-main mb-1">Keranjang Kosong</h3>
                    <p className="text-sm text-text-secondary text-center mb-6">
                        Yuk, mulai belanja dan tambahkan menu favoritmu!
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-primary text-white font-bold rounded-full shadow-lg shadow-primary/30 active:scale-95 transition-transform"
                    >
                        Cari Makanan
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-background-light pb-[200px]">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-background-light/95 backdrop-blur-md px-4 pt-12 pb-4 border-b border-border-color">
                <div className="relative flex items-center justify-center min-h-[40px]">
                    <BackButton confirmMessage="Keluar dari keranjang? Pesananmu belum selesai lho." />
                    <h1 className="text-lg font-bold text-text-main">Keranjang</h1>
                </div>
            </header>

            <main className="flex flex-col gap-4 px-4 pt-4">
                {/* Delivery Address Pill */}
                <button
                    onClick={() => setShowAddressModal(true)}
                    className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-4 py-2 active:bg-orange-100 transition-colors"
                >
                    <span className="material-symbols-outlined text-primary text-lg">location_on</span>
                    <span className="text-sm text-text-main flex-1 text-left truncate">
                        {selectedAddress ? `${selectedAddress.label} - ${selectedAddress.address}`.substring(0, 35) + '...' : 'Pilih alamat pengiriman'}
                    </span>
                    <span className="material-symbols-outlined text-text-secondary text-lg">expand_more</span>
                </button>

                {/* Merchant Shop Open Warning */}
                <MerchantShopOpenWarning blocking={false} />

                {/* Cart Items Grouped by Merchant */}
                {Object.entries(merchantGroups).map(([merchantName, { items, merchantData }]) => {
                    const merchantNotes = getMerchantNotes(merchantName)

                    return (
                        <section key={merchantName} className="bg-card-light rounded-2xl border border-border-color shadow-soft overflow-hidden">
                            {/* Merchant Header */}
                            <div className="flex items-center gap-3 px-4 py-3 border-b border-border-color bg-gray-50">
                                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                    {merchantData?.image ? (
                                        <img
                                            src={merchantData.image}
                                            alt={merchantName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-white shadow-sm">
                                            <span className="material-symbols-outlined text-primary">storefront</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-sm text-text-main">{merchantName}</p>
                                    <p className="text-[10px] text-text-secondary">
                                        {getMerchantItemCount(items)} item • 20-30 menit
                                    </p>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="divide-y divide-border-color">
                                {items.map(item => (
                                    <div key={item.id} className="p-4">
                                        <div className="flex gap-3">
                                            {/* Item Image */}
                                            <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-2xl text-gray-300">restaurant</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Item Details */}
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-sm text-text-main">{item.name}</h4>
                                                </div>
                                                <div className="flex items-center justify-between mt-2">
                                                    {/* Price */}
                                                    <div className="flex flex-col">
                                                        {item.originalPrice && item.originalPrice > item.price && (
                                                            <span className="text-[10px] text-text-secondary line-through">
                                                                Rp {item.originalPrice.toLocaleString()}
                                                            </span>
                                                        )}
                                                        <span className="font-bold text-primary text-sm">
                                                            Rp {item.price.toLocaleString()}
                                                        </span>
                                                    </div>

                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center gap-2 bg-gray-50 rounded-full px-1 py-0.5 border border-gray-100">
                                                        <button
                                                            onClick={() => handleQuantityChange(item.id, -1)}
                                                            className="w-6 h-6 flex items-center justify-center text-text-secondary hover:text-primary active:scale-90 transition-transform"
                                                        >
                                                            <span className="material-symbols-outlined text-[16px]">remove</span>
                                                        </button>
                                                        <span className="text-sm font-bold text-text-main w-4 text-center">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => handleQuantityChange(item.id, 1)}
                                                            className="w-6 h-6 flex items-center justify-center text-text-secondary hover:text-primary active:scale-90 transition-transform"
                                                        >
                                                            <span className="material-symbols-outlined text-[16px]">add</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Catatan untuk Warung (Per-Merchant) */}
                            <div className="px-4 py-3 border-t border-border-color bg-white">
                                <button
                                    onClick={() => openNotesModal(merchantName)}
                                    className="flex items-center gap-2 w-full text-left"
                                >
                                    <span className="material-symbols-outlined text-primary text-[18px]">edit_note</span>
                                    {merchantNotes ? (
                                        <div className="flex-1">
                                            <p className="text-xs text-text-secondary">Catatan untuk warung:</p>
                                            <p className="text-sm text-text-main">{merchantNotes}</p>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-primary font-medium">Tambah catatan untuk warung</span>
                                    )}
                                    <span className="material-symbols-outlined text-text-secondary text-[16px]">chevron_right</span>
                                </button>
                            </div>

                            {/* Add More from Merchant */}
                            <button
                                onClick={() => handleAddMoreItems(merchantName, merchantData)}
                                className="w-full px-4 py-3 text-primary text-sm font-semibold flex items-center justify-center gap-1 border-t border-border-color bg-white hover:bg-orange-50 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">add</span>
                                Tambah menu lain
                            </button>

                            {/* Merchant Subtotal */}
                            <div className="px-4 py-3 bg-gray-50 border-t border-border-color flex justify-between">
                                <div className="flex items-center gap-2 text-text-secondary text-xs">
                                    <span>Ongkir</span>
                                </div>
                                <span className="text-xs font-semibold text-text-main">Rp 8.000</span>
                            </div>
                            <div className="px-4 py-3 bg-gray-50 flex justify-between border-t border-border-color">
                                <span className="text-sm text-text-secondary">Subtotal Toko</span>
                                <span className="font-bold text-sm text-text-main">Rp {(getMerchantSubtotal(items) + 8000).toLocaleString()}</span>
                            </div>
                        </section>
                    )
                })}

                {/* Payment Summary */}
                <section className="bg-card-light rounded-2xl border border-border-color p-4 shadow-soft">
                    <h3 className="font-bold text-sm text-text-main mb-3">Rincian Pembayaran</h3>
                    <div className="space-y-2.5">
                        <div className="flex justify-between text-sm">
                            <span className="text-text-secondary">Total Harga ({cartItems.reduce((s, i) => s + i.quantity, 0)} item)</span>
                            <span className="font-semibold text-text-main">Rp {cartTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-text-secondary">Total Ongkos Kirim ({totalMerchants} Merchant)</span>
                            <span className="font-semibold text-text-main">Rp {totalDeliveryFee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-base pt-2 border-t border-border-color">
                            <span className="font-bold text-text-main">Total Pembayaran</span>
                            <span className="font-bold text-primary">Rp {totalPayment.toLocaleString()}</span>
                        </div>
                    </div>
                </section>
            </main>

            {/* Bottom Fixed CTA */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border-color px-4 pt-4 pb-6 shadow-[0_-8px_30px_rgba(0,0,0,0.05)]">
                <button
                    onClick={() => navigate('/checkout')}
                    className="w-full bg-primary hover:bg-orange-600 text-white font-bold h-14 rounded-2xl shadow-lg shadow-orange-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    <span>Pilih Metode Pembayaran</span>
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>
            </div>

            {/* Notes Modal */}
            {notesModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
                    <div className="w-full bg-white rounded-t-3xl p-6 animate-slide-up">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Catatan untuk {notesModal.merchantName}</h3>
                            <button onClick={() => setNotesModal({ isOpen: false, merchantName: '', currentNotes: '' })}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <textarea
                            value={notesModal.currentNotes}
                            onChange={(e) => setNotesModal(prev => ({ ...prev, currentNotes: e.target.value }))}
                            placeholder="Contoh: Jangan terlalu pedas, pisahkan sausnya..."
                            className="w-full h-32 p-4 border border-border-color rounded-xl resize-none focus:outline-none focus:border-primary"
                        />
                        <button
                            onClick={saveNotes}
                            className="w-full mt-4 py-4 bg-primary text-white font-bold rounded-xl active:scale-[0.98] transition-transform"
                        >
                            Simpan Catatan
                        </button>
                    </div>
                </div>
            )}

            {/* Address Selection Modal */}
            {showAddressModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
                    <div className="w-full bg-white rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto animate-slide-up">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Pilih Alamat Pengiriman</h3>
                            <button onClick={() => setShowAddressModal(false)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {addresses.length === 0 ? (
                            <div className="flex flex-col items-center py-8">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                    <span className="material-symbols-outlined text-3xl text-gray-400">location_off</span>
                                </div>
                                <p className="text-text-secondary text-sm mb-4">Belum ada alamat tersimpan</p>
                                <button
                                    onClick={() => {
                                        setShowAddressModal(false)
                                        navigate('/address/add')
                                    }}
                                    className="px-6 py-2 bg-primary text-white font-bold rounded-xl text-sm"
                                >
                                    Tambah Alamat
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    {addresses.map(addr => (
                                        <button
                                            key={addr.id}
                                            onClick={() => {
                                                selectAddress(addr.id)
                                                setShowAddressModal(false)
                                            }}
                                            className={`w-full text-left p-4 rounded-xl border transition-all ${selectedAddress?.id === addr.id
                                                ? 'border-primary bg-orange-50'
                                                : 'border-border-color hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="material-symbols-outlined text-primary text-lg">
                                                    {addr.label === 'Rumah' ? 'home' : addr.label === 'Kantor' ? 'work' : 'location_on'}
                                                </span>
                                                <span className="font-bold text-sm">{addr.label}</span>
                                                {addr.isDefault && (
                                                    <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full">Utama</span>
                                                )}
                                                {selectedAddress?.id === addr.id && (
                                                    <span className="material-symbols-outlined text-primary text-lg ml-auto">check_circle</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-text-secondary ml-7">{addr.address}</p>
                                            {addr.detail && (
                                                <p className="text-xs text-text-secondary ml-7 mt-0.5">{addr.detail}</p>
                                            )}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => {
                                        setShowAddressModal(false)
                                        navigate('/address/add')
                                    }}
                                    className="w-full mt-4 py-3 border-2 border-dashed border-primary text-primary font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-orange-50 transition-colors"
                                >
                                    <span className="material-symbols-outlined">add_location_alt</span>
                                    Tambah Alamat Baru
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default CartPage
