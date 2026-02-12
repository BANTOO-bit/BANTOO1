import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAddress } from '../../context/AddressContext'
import GPSLoadingOverlay from '../../components/shared/GPSLoadingOverlay'
import LocationFoundModal from '../../components/shared/LocationFoundModal'
import LocationFailedModal from '../../components/shared/LocationFailedModal'
import LeafletMapPicker from '../../components/shared/LeafletMapPicker'
import locationService from '../../services/locationService'
import { useToast } from '../../context/ToastContext'

const addressLabels = [
    { id: 'Rumah', icon: 'home' },
    { id: 'Kantor', icon: 'work' },
    { id: 'Lainnya', icon: null },
]

function AddAddressPage({ editAddress = null, onAddressAdded }) {
    const navigate = useNavigate()
    const { addAddress, updateAddress } = useAddress()
    const isEditing = !!editAddress
    const toast = useToast()

    const [form, setForm] = useState({
        label: editAddress?.label || 'Rumah',
        address: editAddress?.address || '',
        name: editAddress?.name || '',
        phone: editAddress?.phone || '',
        detail: editAddress?.detail || '',
        isDefault: editAddress?.isDefault || false
    })

    const [errors, setErrors] = useState({})

    // Map States
    const [mapCenter, setMapCenter] = useState({ lat: -6.2088, lng: 106.8456 }) // Default Jakarta
    const [flyToCoords, setFlyToCoords] = useState(null)
    const [isMapMoving, setIsMapMoving] = useState(false)
    const [isGeocoding, setIsGeocoding] = useState(false)

    // GPS States
    const [isGPSLoading, setIsGPSLoading] = useState(false)
    const [showLocationFound, setShowLocationFound] = useState(false)
    const [showLocationFailed, setShowLocationFailed] = useState(false)

    // Debounce geocoding to avoid too many requests while dragging
    useEffect(() => {
        if (!isMapMoving && mapCenter) {
            // Fetch address when map stops moving
            fetchAddressFromCoords(mapCenter.lat, mapCenter.lng)
        }
    }, [mapCenter, isMapMoving])

    const fetchAddressFromCoords = async (lat, lng) => {
        try {
            setIsGeocoding(true)
            const address = await locationService.reverseGeocode(lat, lng)
            if (address) {
                // Update form address automatically
                setForm(prev => ({
                    ...prev,
                    address: address
                }))
            }
        } catch (error) {
            console.error('Geocoding error:', error)
            // Optional: toast.error('Gagal mengambil detail alamat')
        } finally {
            setIsGeocoding(false)
        }
    }

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    const validate = () => {
        const newErrors = {}
        if (!form.address.trim()) newErrors.address = 'Alamat lengkap wajib diisi'
        if (!form.name.trim()) newErrors.name = 'Nama penerima wajib diisi'
        if (!form.phone.trim()) newErrors.phone = 'Nomor telepon wajib diisi'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSave = () => {
        if (!validate()) return

        const addressData = {
            ...form,
            area: 'Kecamatan Bantoo', // Could be derived from geocoding too
            latitude: mapCenter.lat,
            longitude: mapCenter.lng
        }

        if (isEditing) {
            updateAddress(editAddress.id, addressData)
            navigate(-1)
        } else {
            addAddress(addressData)
            if (onAddressAdded) {
                onAddressAdded()
            } else {
                navigate(-1)
            }
        }
    }

    const handleGetLocation = async () => {
        setIsGPSLoading(true)
        try {
            const coords = await locationService.getCurrentPosition()

            // Fly map to user location
            setFlyToCoords(coords)

            // Update center state (will trigger reverse geocode via effect)
            setMapCenter(coords)

            setShowLocationFound(true)
            setTimeout(() => setShowLocationFound(false), 2000) // Auto hide success modal
        } catch (error) {
            console.error('GPS Error:', error)
            setShowLocationFailed(true)
        } finally {
            setIsGPSLoading(false)
        }
    }

    const handleRetryGPS = () => {
        setShowLocationFailed(false)
        handleGetLocation()
    }

    const handleManualSelect = () => {
        setShowLocationFailed(false)
    }

    // Callback from Map Component when drag ends
    const handleMapMoveEnd = useCallback((newCenter) => {
        setMapCenter(newCenter) // This triggers the useEffect to fetch address
        setIsMapMoving(false)
    }, [])

    const handleMapMoveStart = useCallback(() => {
        setIsMapMoving(true)
    }, [])

    return (
        <div className="relative flex h-full min-h-screen w-full flex-col overflow-hidden max-w-md mx-auto bg-background-light shadow-2xl">
            {/* Header */}
            <header className="z-20 flex items-center justify-between bg-background-light/95 backdrop-blur-sm p-4 sticky top-0 border-b border-black/5">
                <button
                    onClick={() => navigate(-1)}
                    className="flex size-10 shrink-0 items-center justify-center rounded-full active:bg-black/5 transition-colors"
                >
                    <span className="material-symbols-outlined text-primary text-[28px]">chevron_left</span>
                </button>
                <h1 className="text-lg font-bold leading-tight tracking-tight text-slate-900">
                    {isEditing ? 'Edit Alamat' : 'Tambah Alamat Baru'}
                </h1>
                <div className="size-10"></div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pb-24 scroll-smooth">
                {/* Map Preview Section - Now Interactive */}
                <div className="relative w-full h-[40vh] min-h-[300px] bg-slate-200">

                    <LeafletMapPicker
                        initialLocation={mapCenter}
                        onLocationSelect={handleMapMoveEnd}
                        // onMoveStart={handleMapMoveStart} // Not exposed in component yet but good for future
                        triggerFlyTo={flyToCoords}
                    />

                    {/* Geocoding Loading Indicator */}
                    {isGeocoding && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-md flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs font-medium text-primary">Mencari alamat...</span>
                        </div>
                    )}

                    {/* GPS Loading Overlay */}
                    {isGPSLoading && (
                        <div className="absolute inset-0 bg-white/40 flex flex-col items-center justify-center z-[1000]">
                            <div className="p-6 bg-white rounded-2xl shadow-lg flex flex-col items-center gap-4">
                                <div className="relative size-12">
                                    <span className="material-symbols-outlined text-primary text-5xl animate-spin">
                                        progress_activity
                                    </span>
                                </div>
                                <div className="text-center">
                                    <p className="text-slate-900 text-sm font-semibold">Sedang mencari lokasimu...</p>
                                    <p className="text-gray-500 text-xs mt-1">Pastikan GPS aktif</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* My Location Button */}
                    <button
                        onClick={handleGetLocation}
                        disabled={isGPSLoading}
                        className="absolute bottom-4 right-4 size-12 bg-white rounded-full shadow-xl flex items-center justify-center active:scale-90 transition-transform border border-slate-100 disabled:opacity-50 z-[500]"
                        title="Gunakan Lokasi Saat Ini"
                    >
                        <span
                            className="material-symbols-outlined text-primary text-[28px]"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                            my_location
                        </span>
                    </button>
                </div>

                {/* Form Section */}
                <div className={`px-4 py-6 space-y-6 ${isGPSLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                    {/* Label Selection */}
                    <div className="space-y-3">
                        <h2 className="text-base font-bold text-slate-800">Label Alamat</h2>
                        <div className="flex flex-wrap gap-3">
                            {addressLabels.map(label => (
                                <label key={label.id} className="group cursor-pointer">
                                    <input
                                        type="radio"
                                        name="label"
                                        checked={form.label === label.id}
                                        onChange={() => handleChange('label', label.id)}
                                        className="peer sr-only"
                                    />
                                    <div className={`flex h-9 items-center justify-center gap-x-2 rounded-xl bg-white border px-4 transition-all
                                        ${form.label === label.id
                                            ? 'bg-primary/10 border-primary text-primary'
                                            : 'border-slate-200 text-slate-700 hover:border-slate-300'
                                        }`}
                                    >
                                        {label.icon && (
                                            <span className="material-symbols-outlined text-[18px]">{label.icon}</span>
                                        )}
                                        <span className="text-sm font-medium">{label.id}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 gap-5">
                        {/* Address */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-500 pl-1" htmlFor="address">
                                Alamat Lengkap
                            </label>
                            <textarea
                                id="address"
                                value={form.address}
                                onChange={(e) => handleChange('address', e.target.value)}
                                placeholder="Geser peta untuk isi alamat otomatis..."
                                rows="3"
                                className={`w-full rounded-2xl border bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none shadow-sm
                                    ${errors.address ? 'border-red-400' : 'border-slate-200'}`}
                            />
                            {errors.address && <p className="text-xs text-red-500 pl-1">{errors.address}</p>}
                            <div className="flex justify-end pt-1">
                                <p className="text-xs text-gray-400 italic">
                                    *Alamat akan terisi otomatis sesuai titik di peta
                                </p>
                            </div>
                        </div>

                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-500 pl-1" htmlFor="name">
                                Nama Penerima
                            </label>
                            <div className="relative">
                                <input
                                    id="name"
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    placeholder="Contoh: Budi Santoso"
                                    className={`w-full rounded-2xl border bg-white px-4 py-3.5 pr-12 text-base text-slate-900 placeholder:text-slate-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm
                                        ${errors.name ? 'border-red-400' : 'border-slate-200'}`}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <span className="material-symbols-outlined text-[20px]">person</span>
                                </div>
                            </div>
                            {errors.name && <p className="text-xs text-red-500 pl-1">{errors.name}</p>}
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-500 pl-1" htmlFor="phone">
                                Nomor Telepon
                            </label>
                            <div className="relative">
                                <input
                                    id="phone"
                                    type="tel"
                                    value={form.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    placeholder="Contoh: 0812..."
                                    className={`w-full rounded-2xl border bg-white px-4 py-3.5 pr-12 text-base text-slate-900 placeholder:text-slate-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm
                                        ${errors.phone ? 'border-red-400' : 'border-slate-200'}`}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <span className="material-symbols-outlined text-[20px]">call</span>
                                </div>
                            </div>
                            {errors.phone && <p className="text-xs text-red-500 pl-1">{errors.phone}</p>}
                        </div>

                        {/* Landmark */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-500 pl-1" htmlFor="detail">
                                Patokan (Opsional)
                            </label>
                            <input
                                id="detail"
                                type="text"
                                value={form.detail}
                                onChange={(e) => handleChange('detail', e.target.value)}
                                placeholder="Contoh: Pagar hitam, depan masjid..."
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900 placeholder:text-slate-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="h-8"></div>
                </div>
            </main>

            {/* Fixed Bottom Button */}
            <div className="fixed bottom-0 left-0 right-0 z-30 w-full max-w-md mx-auto bg-background-light/80 backdrop-blur-md px-4 py-5 border-t border-black/5">
                <button
                    onClick={handleSave}
                    disabled={isGPSLoading}
                    className="w-full rounded-2xl bg-primary py-4 text-center text-base font-bold text-white shadow-lg shadow-primary/25 active:scale-[0.98] transition-all hover:bg-primary/90 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Simpan Alamat
                </button>
            </div>

            {/* Location Found Modal (Auto Close) */}
            <LocationFoundModal
                isOpen={showLocationFound}
                onClose={() => setShowLocationFound(false)}
                onConfirm={() => setShowLocationFound(false)}
            />

            {/* Location Failed Modal */}
            <LocationFailedModal
                isOpen={showLocationFailed}
                onClose={() => setShowLocationFailed(false)}
                onRetry={handleRetryGPS}
                onManual={handleManualSelect}
            />
        </div>
    )
}

export default AddAddressPage
