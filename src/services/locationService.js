
/**
 * Service to handle location and geocoding operations
 * Uses OpenStreetMap Nominatim API (Free)
 */

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/reverse';

export const locationService = {
    /**
     * Get address details from latitude and longitude
     * @param {number} lat 
     * @param {number} lng 
     * @returns {Promise<string>} Formatted address
     */
    // Switch back to Nominatim for better precision (Street names, etc.)
    // We remove custom headers to avoid triggering CORS Preflight options which often fail on localhost
    reverseGeocode: async (lat, lng) => {
        try {
            // Using accept-language as query param instead of header to keep request "Simple"
            const response = await fetch(
                `${NOMINATIM_BASE_URL}?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=id`
            );

            if (!response.ok) {
                throw new Error('Gagal mengambil data lokasi dari Nominatim');
            }

            const data = await response.json();

            // Nominatim returns a very detailed "display_name"
            // We can also construct it from data.address if we want specific format
            return data.display_name;
        } catch (error) {
            console.warn('Nominatim error, falling back to basic coords:', error);

            // Fallback: Just return coordinates if lightweight fail
            // Or we could try the BDC API as a backup here if we really wanted to.
            return `Lokasi Terpilih: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        }
    },

    /**
     * Get current GPS position
     * @returns {Promise<{lat: number, lng: number}>}
     */
    getCurrentPosition: () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation tidak didukung oleh browser ini.'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    let errorMessage = 'Gagal mengambil lokasi.';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Izin lokasi ditolak.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Informasi lokasi tidak tersedia.';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Waktu permintaan lokasi habis.';
                            break;
                    }
                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    }
};

export default locationService;
