/**
 * Memformat UUID menjadi kode singkat yang mudah dibaca (misalnya 6 karakter terakhir huruf besar)
 * @param {string} id - UUID asli dari database
 * @param {string} prefix - (Opsional) Awalan contoh: 'ORD', 'DRV'
 * @param {number} length - Panjang karakter yang diambil dari belakang (default: 6)
 * @returns {string} - Kode terformat, misal: #ORD-A8F2B1 atau #A8F2B1
 */
export const formatId = (id, prefix = '', length = 6) => {
    if (!id) return '-';
    // Ambil beberapa karakter terakhir dan jadikan huruf kapital
    const shortStr = id.slice(-length).toUpperCase();

    // Gabungkan dengan prefix jika ada
    if (prefix) {
        return `#${prefix}-${shortStr}`;
    }

    // Default cuma hashtag + kode
    return `#${shortStr}`;
};
