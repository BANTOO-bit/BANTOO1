import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// --- Fix Leaflet Default Icon ---
// (Leaflet's default icon assets are often missing in bundlers like Vite/Webpack)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// --- Helper Component: MapEvents ---
// Listens to map move events and updates parent
function MapEvents({ onMoveEnd, onMoveStart }) {
    const map = useMapEvents({
        moveend: () => {
            const center = map.getCenter();
            onMoveEnd({ lat: center.lat, lng: center.lng });
        },
        movestart: () => {
            onMoveStart && onMoveStart();
        }
    });
    return null;
}

// --- Helper Component: FlyToLocation ---
// Programmatically moves the map
function FlyToLocation({ coords }) {
    const map = useMap();
    useEffect(() => {
        if (coords) {
            map.flyTo([coords.lat, coords.lng], 17, {
                animate: true,
                duration: 1.5
            });
        }
    }, [coords, map]);
    return null;
}

const LeafletMapPicker = ({
    initialLocation = { lat: -7.0747, lng: 110.8767 }, // Default Tanggungharjo, Grobogan
    onLocationSelect,
    triggerFlyTo, // coordinate object to fly to
    isInteractionDisabled = false
}) => {
    // React 18 Validation:
    // We use a ref to track if the map has already been initialized to prevent strict mode double-mount issues
    const mapContainerRef = useRef(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);

    // If not mounted yet (client-side only), don't render map to avoid hydration mismatch or early init
    if (!isMounted) return <div className="w-full h-full bg-slate-200 animate-pulse"></div>;

    return (
        <div className="relative w-full h-full z-0">
            {/* Key on the wrapper div forces reconstruction if needed, but MapContainer key is usually enough */}
            <div className="w-full h-full">
                <MapContainer
                    ref={mapContainerRef}
                    key={`${initialLocation.lat}-${initialLocation.lng}`} // Changing key forces remounting when initial location changes significantly
                    center={[initialLocation.lat, initialLocation.lng]}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                    dragging={!isInteractionDisabled}
                    touchZoom={!isInteractionDisabled}
                    doubleClickZoom={!isInteractionDisabled}
                    scrollWheelZoom={!isInteractionDisabled}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />

                    <MapEvents
                        onMoveEnd={onLocationSelect}
                        onMoveStart={() => { /* Optional: set isDragging state upstream */ }}
                    />

                    {triggerFlyTo && <FlyToLocation coords={triggerFlyTo} />}
                </MapContainer>
            </div>

            {/* --- Fixed Center Pin Overlay --- */}
            {/* This pin stays in the center of the container while the map moves underneath */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[400] pointer-events-none -mt-8 flex flex-col items-center">
                <span
                    className="material-symbols-outlined text-primary text-5xl drop-shadow-lg filter"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                >
                    location_on
                </span>
                <div className="w-3 h-3 bg-black/20 rounded-full blur-[2px] mt-[-5px]"></div>
                {/* Tooltip/Label */}
                <div className="absolute top-full mt-1 bg-white px-3 py-1 rounded-full shadow-md text-xs font-bold text-slate-800 whitespace-nowrap border border-slate-100">
                    Lokasi Pin
                </div>
            </div>

            {/* Overlay Gradient for aesthetics (Optional) */}
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/10 to-transparent pointer-events-none z-[400]"></div>
        </div>
    )
}

export default LeafletMapPicker
