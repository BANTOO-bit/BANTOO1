
/**
 * Service to handle location and geocoding operations
 * Uses OpenStreetMap Nominatim API (Free)
 */

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/reverse';
const BDC_BASE_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client';
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
            // Adding email parameter as requested by Nominatim TOS to reduce blocking
            const response = await fetch(
                `${NOMINATIM_BASE_URL}?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=id&email=bantoo.dev@localhost.com`
            );

            if (!response.ok) {
                throw new Error('Gagal mengambil data lokasi dari Nominatim');
            }

            const data = await response.json();

            // Nominatim returns a very detailed "display_name"
            if (data && data.display_name) {
                return data.display_name;
            }
            throw new Error('Format data Nominatim tidak sesuai');
        } catch (error) {
            console.warn('Nominatim error, falling back to BDC API:', error);

            try {
                // Fallback to BigDataCloud Free API (Client-side friendly, no CORS issues usually)
                const fallbackResponse = await fetch(
                    `${BDC_BASE_URL}?latitude=${lat}&longitude=${lng}&localityLanguage=id`
                );
                
                if (!fallbackResponse.ok) {
                     throw new Error('BDC API gagal merespon');
                }
                
                const fallbackData = await fallbackResponse.json();
                
                // Construct a readable address from BDC
                let addressParts = [];
                if (fallbackData.locality) addressParts.push(fallbackData.locality);
                if (fallbackData.city) addressParts.push(fallbackData.city);
                if (fallbackData.principalSubdivision) addressParts.push(fallbackData.principalSubdivision);
                
                if (addressParts.length > 0) {
                     return addressParts.join(', ');
                }
            } catch (fallbackError) {
                 console.warn('BDC fallback error:', fallbackError);
            }

            // Ultimate Fallback: Just return coordinates if lightweight fail
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
