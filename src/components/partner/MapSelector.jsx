import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import locationService from '../../services/locationService'

// Fix for default marker icon in Leaflet
import L from 'leaflet'

const defaultIcon = L.icon({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
})

function ClickableMap({ position, onPositionChange }) {
    const map = useMap()

    // Invalidate size when map is ready
    useEffect(() => {
        setTimeout(() => {
            map.invalidateSize()
        }, 100)
    }, [map])

    useMapEvents({
        click(e) {
            onPositionChange({ lat: e.latlng.lat, lng: e.latlng.lng })
        }
    })

    return <Marker position={[position.lat, position.lng]} icon={defaultIcon} />
}

// Helper to programmatically move map
function FlyToLocation({ coords }) {
    const map = useMap();
    useEffect(() => {
        if (coords) {
            map.flyTo([coords.lat, coords.lng], 15, {
                animate: true,
                duration: 1.5
            });
        }
    }, [coords, map]);
    return null;
}

function MapSelector({ location, onLocationChange, onClose }) {
    const [currentPosition, setCurrentPosition] = useState(location)
    const [mapKey] = useState(() => Date.now().toString()) // Unique key for each mount

    // GPS States
    const [flyToCoords, setFlyToCoords] = useState(null)
    const [isGPSLoading, setIsGPSLoading] = useState(false)

    // React 18 Strict Mode Safety
    const [isMounted, setIsMounted] = useState(false)
    useEffect(() => {
        setIsMounted(true)
        return () => setIsMounted(false)
    }, [])

    const handlePositionChange = (newPosition) => {
        setCurrentPosition(newPosition)
        onLocationChange(newPosition)
    }

    const handleGetLocation = async () => {
        setIsGPSLoading(true)
        try {
            const coords = await locationService.getCurrentPosition()
            setFlyToCoords(coords)
            handlePositionChange(coords) // Update marker and parent
        } catch (error) {
            console.error("GPS Error:", error)
            alert("Gagal mengambil lokasi: " + error.message)
        } finally {
            setIsGPSLoading(false)
        }
    }

    if (!isMounted) return null

    return (
        <div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose()
            }}
        >
            <div className="bg-white dark:bg-card-dark rounded-2xl overflow-hidden w-full max-w-lg shadow-2xl">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 dark:text-white">Pilih Lokasi Warung</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">close</span>
                    </button>
                </div>

                <div className="h-80 sm:h-96 bg-gray-100 dark:bg-gray-800 relative">
                    <MapContainer
                        key={mapKey}
                        center={[currentPosition.lat, currentPosition.lng]}
                        zoom={15}
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={true}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; OpenStreetMap'
                        />
                        <ClickableMap
                            position={currentPosition}
                            onPositionChange={handlePositionChange}
                        />
                        <FlyToLocation coords={flyToCoords} />
                    </MapContainer>

                    {/* GPS Button Overlay - Added to original layout */}
                    <button
                        onClick={handleGetLocation}
                        disabled={isGPSLoading}
                        className="absolute bottom-4 right-4 z-[400] size-12 bg-white rounded-full shadow-xl flex items-center justify-center active:scale-90 transition-transform border border-slate-100 disabled:opacity-50"
                        title="Gunakan Lokasi Saat Ini"
                    >
                        {isGPSLoading ? (
                            <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <span
                                className="material-symbols-outlined text-primary text-[24px]"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                                my_location
                            </span>
                        )}
                    </button>
                </div>

                <div className="p-4 bg-white dark:bg-card-dark">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 text-center">
                        Klik pada peta untuk memilih lokasi · Lat: {currentPosition.lat.toFixed(4)}, Lng: {currentPosition.lng.toFixed(4)}
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors active:scale-[0.98]"
                    >
                        Konfirmasi Lokasi
                    </button>
                </div>
            </div>
        </div>
    )
}

export default MapSelector
