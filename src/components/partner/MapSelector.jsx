import { useEffect, useState, useCallback } from 'react'
import { Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import locationService from '../../services/locationService'
import settingsService from '../../services/settingsService'
import LeafletMapPicker from '../shared/LeafletMapPicker'
import * as turf from '@turf/turf' // Use turf.js for precise geofencing calculation

function MapSelector({ location, onLocationChange, onClose }) {
    const [currentPosition, setCurrentPosition] = useState(location)
    const [mapKey] = useState(() => Date.now().toString()) // Unique key for each mount

    // GPS States
    const [flyToCoords, setFlyToCoords] = useState(null)
    const [isGPSLoading, setIsGPSLoading] = useState(false)

    // Geofencing constants
    // Set the operational center to Tanggungharjo city center
    const GEO_CENTER = { lat: -7.0922, lng: 110.6049 };

    // Dynamic Radius State
    const [geoRadiusMeters, setGeoRadiusMeters] = useState(15000); // Default 15km before load
    const [isWithinBounds, setIsWithinBounds] = useState(true);

    // Fetch Admin Settings for operational radius
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const tiersConfig = await settingsService.getDeliveryFeeTiers();
                if (tiersConfig && tiersConfig.max_radius_km) {
                    setGeoRadiusMeters(tiersConfig.max_radius_km * 1000); // km to meters
                }
            } catch (err) {
                console.error("Failed to load map radius settings, using fallback", err)
            }
        }
        fetchSettings()
    }, [])

    // Validate location on change
    useEffect(() => {
        const from = turf.point([currentPosition.lng, currentPosition.lat]);
        const to = turf.point([GEO_CENTER.lng, GEO_CENTER.lat]);
        const distance = turf.distance(from, to, { units: 'kilometers' });

        setIsWithinBounds(distance <= (geoRadiusMeters / 1000));
    }, [currentPosition, geoRadiusMeters]);

    // React 18 Strict Mode Safety
    const [isMounted, setIsMounted] = useState(false)
    useEffect(() => {
        setIsMounted(true)
        return () => setIsMounted(false)
    }, [])

    const handlePositionChange = useCallback((newPosition) => {
        setCurrentPosition(newPosition)
        onLocationChange(newPosition)
    }, [onLocationChange])

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
                    <LeafletMapPicker
                        initialLocation={currentPosition}
                        onLocationSelect={handlePositionChange}
                        triggerFlyTo={flyToCoords}
                    >
                        <Circle
                            center={[GEO_CENTER.lat, GEO_CENTER.lng]}
                            radius={geoRadiusMeters}
                            pathOptions={{
                                color: isWithinBounds ? '#3b82f6' : '#ef4444',
                                fillColor: isWithinBounds ? '#3b82f6' : '#ef4444',
                                fillOpacity: 0.1,
                                dashArray: '5, 10'
                            }}
                        />
                    </LeafletMapPicker>

                    {/* GPS Button Overlay - Added to original layout */}
                    <button
                        onClick={handleGetLocation}
                        disabled={isGPSLoading}
                        className="absolute top-4 right-4 z-[400] size-[2.6rem] bg-white rounded shadow-md flex items-center justify-center active:bg-gray-100 transition-colors border-2 border-slate-200 disabled:opacity-50"
                        title="Gunakan Lokasi Saat Ini"
                    >
                        {isGPSLoading ? (
                            <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <span
                                className="material-symbols-outlined text-gray-700 hover:text-primary text-[20px]"
                            >
                                my_location
                            </span>
                        )}
                    </button>

                    {!isWithinBounds && (
                        <div className="absolute top-4 left-[3rem] right-[4rem] z-[400] bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded shadow-md text-xs font-semibold flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">error</span>
                            Lokasi di luar area operasional BANTOO (Radius {geoRadiusMeters / 1000}km)
                        </div>
                    )}
                </div>

                <div className="p-4 bg-white dark:bg-card-dark">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 text-center">
                        Klik pada peta untuk memilih lokasi · Lat: {currentPosition.lat.toFixed(4)}, Lng: {currentPosition.lng.toFixed(4)}
                    </p>
                    <button
                        onClick={onClose}
                        disabled={!isWithinBounds}
                        className={`w-full font-bold py-3 rounded-xl transition-colors active:scale-[0.98] ${isWithinBounds
                            ? 'bg-primary hover:bg-blue-700 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        {isWithinBounds ? 'Konfirmasi Lokasi' : 'Lokasi Tidak Valid'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default MapSelector
