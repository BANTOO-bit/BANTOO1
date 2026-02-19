import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'

// Fix default icon issue with webpack/vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom Icons
const createIcon = (iconName, color = 'blue') => new L.DivIcon({
    className: 'custom-icon',
    html: `<div style="
        background-color: white;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        border: 2px solid ${color};
    ">
        <span class="material-symbols-outlined" style="color: ${color}; font-size: 20px;">${iconName}</span>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
})

const merchantIcon = createIcon('storefront', '#2979FF') // Primary Blue
const userIcon = createIcon('home', '#10B981') // Green
const driverIcon = createIcon('two_wheeler', '#3B82F6') // Blue

// Helper to auto-fit bounds
function MapBounds({ markers }) {
    const map = useMap()

    useEffect(() => {
        if (markers.length > 0) {
            const bounds = L.latLngBounds(markers)
            map.fitBounds(bounds, { padding: [50, 50] })
        }
    }, [map, markers])

    return null
}

/**
 * Smooth-moving driver marker.
 * Uses CSS transition on the marker element to smoothly animate position changes.
 */
function SmoothDriverMarker({ position }) {
    const markerRef = useRef(null)
    const map = useMap()
    const [initialPosition] = useState(position)

    useEffect(() => {
        const marker = markerRef.current
        if (marker && position) {
            // Smoothly move marker to new position over 2 seconds
            const startLatLng = marker.getLatLng()
            const endLatLng = L.latLng(position)
            const duration = 2000 // ms
            const startTime = performance.now()

            function animate(currentTime) {
                const elapsed = currentTime - startTime
                const progress = Math.min(elapsed / duration, 1)
                // Ease-out cubic
                const eased = 1 - Math.pow(1 - progress, 3)

                const lat = startLatLng.lat + (endLatLng.lat - startLatLng.lat) * eased
                const lng = startLatLng.lng + (endLatLng.lng - startLatLng.lng) * eased

                marker.setLatLng([lat, lng])

                if (progress < 1) {
                    requestAnimationFrame(animate)
                }
            }

            requestAnimationFrame(animate)
        }
    }, [position])

    if (!position) return null

    return (
        <Marker
            ref={markerRef}
            position={initialPosition}
            icon={driverIcon}
            zIndexOffset={100}
        >
            <Popup>Driver</Popup>
        </Marker>
    )
}

function TrackingMap({
    merchantLocation = [-7.0747, 110.8767],
    userLocation = [-6.2250, 106.8500],
    driverLocation,
    height = "300px"
}) {
    // Collect points for bounds
    const points = [
        merchantLocation,
        userLocation,
        ...(driverLocation ? [driverLocation] : [])
    ]

    return (
        <div className="rounded-2xl overflow-hidden border border-border-color shadow-soft relative z-0 h-full w-full">
            <MapContainer
                center={merchantLocation}
                zoom={13}
                style={{ height: height, width: '100%' }}
                zoomControl={false}
                attributionControl={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                {/* Route Line (Merchant -> User) */}
                <Polyline
                    positions={[merchantLocation, userLocation]}
                    pathOptions={{ color: '#2979FF', weight: 4, opacity: 0.6, dashArray: '10, 10' }}
                />

                {/* Route Line (Driver -> User, if driver exists) */}
                {driverLocation && (
                    <Polyline
                        positions={[driverLocation, userLocation]}
                        pathOptions={{ color: '#3B82F6', weight: 4, opacity: 0.7, dashArray: '8, 8' }}
                    />
                )}

                {/* Markers */}
                <Marker position={merchantLocation} icon={merchantIcon}>
                    <Popup>Restoran</Popup>
                </Marker>

                <Marker position={userLocation} icon={userIcon}>
                    <Popup>Lokasi Anda</Popup>
                </Marker>

                {/* Smooth-moving Driver Marker */}
                {driverLocation && (
                    <SmoothDriverMarker position={driverLocation} />
                )}

                {/* Auto fit bounds */}
                <MapBounds markers={points} />
            </MapContainer>
        </div>
    )
}

export default TrackingMap
