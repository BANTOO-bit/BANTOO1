/**
 * merchantsData.js
 * Centralized mock data source for merchants and menus.
 * Used by SearchPage and other components for local/offline data.
 * 
 * TODO: Replace with Supabase queries once backend is deployed.
 */

const merchants = [
    {
        id: 'merchant-1',
        name: 'Nasi Goreng Gila Pak Kumis',
        category: 'Makanan Berat',
        rating: 4.8,
        deliveryTime: '15-25 min',
        deliveryFee: 'Rp 5.000',
        image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop',
        latitude: -6.2088,
        longitude: 106.8456,
        isOpen: true
    },
    {
        id: 'merchant-2',
        name: 'Geprek Bensu',
        category: 'Makanan Berat',
        rating: 4.5,
        deliveryTime: '20-30 min',
        deliveryFee: 'Rp 7.000',
        image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=400&h=300&fit=crop',
        latitude: -6.2150,
        longitude: 106.8500,
        isOpen: true
    },
    {
        id: 'merchant-3',
        name: 'RM Padang Sederhana',
        category: 'Makanan Berat',
        rating: 4.6,
        deliveryTime: '15-20 min',
        deliveryFee: 'Rp 5.000',
        image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&h=300&fit=crop',
        latitude: -6.2200,
        longitude: 106.8400,
        isOpen: true
    },
    {
        id: 'merchant-4',
        name: 'Bakso Solo Samrat',
        category: 'Jajanan',
        rating: 4.7,
        deliveryTime: '10-20 min',
        deliveryFee: 'Rp 4.000',
        image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=300&fit=crop',
        latitude: -6.2100,
        longitude: 106.8550,
        isOpen: true
    },
    {
        id: 'merchant-5',
        name: 'Mie Gacoan',
        category: 'Jajanan',
        rating: 4.4,
        deliveryTime: '20-35 min',
        deliveryFee: 'Rp 8.000',
        image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&h=300&fit=crop',
        latitude: -6.2250,
        longitude: 106.8350,
        isOpen: true
    },
    {
        id: 'merchant-6',
        name: 'Kopi Kenangan',
        category: 'Minuman',
        rating: 4.3,
        deliveryTime: '10-15 min',
        deliveryFee: 'Rp 5.000',
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop',
        latitude: -6.2180,
        longitude: 106.8480,
        isOpen: true
    }
]

const menus = [
    // Merchant 1 - Nasi Goreng Gila
    { id: 'menu-1', merchantId: 'merchant-1', merchantName: 'Nasi Goreng Gila Pak Kumis', name: 'Nasi Goreng Seafood', price: 25000, description: 'Nasi goreng dengan campuran seafood segar', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300&h=300&fit=crop', popular: true },
    { id: 'menu-2', merchantId: 'merchant-1', merchantName: 'Nasi Goreng Gila Pak Kumis', name: 'Nasi Goreng Ayam', price: 20000, description: 'Nasi goreng dengan ayam kampung', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=300&fit=crop', popular: true },
    { id: 'menu-3', merchantId: 'merchant-1', merchantName: 'Nasi Goreng Gila Pak Kumis', name: 'Mie Goreng Spesial', price: 22000, description: 'Mie goreng dengan topping lengkap', image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=300&h=300&fit=crop', popular: false },

    // Merchant 2 - Geprek Bensu
    { id: 'menu-4', merchantId: 'merchant-2', merchantName: 'Geprek Bensu', name: 'Ayam Geprek Original', price: 15000, description: 'Ayam geprek sambal bawang', image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=300&h=300&fit=crop', popular: true },
    { id: 'menu-5', merchantId: 'merchant-2', merchantName: 'Geprek Bensu', name: 'Ayam Geprek Mozarella', price: 25000, description: 'Ayam geprek dengan keju mozzarella', image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=300&h=300&fit=crop', popular: true },

    // Merchant 3 - RM Padang
    { id: 'menu-6', merchantId: 'merchant-3', merchantName: 'RM Padang Sederhana', name: 'Rendang Sapi', price: 30000, description: 'Rendang sapi asli Padang', image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=300&h=300&fit=crop', popular: true },
    { id: 'menu-7', merchantId: 'merchant-3', merchantName: 'RM Padang Sederhana', name: 'Gulai Ayam', price: 22000, description: 'Gulai ayam khas Minang', image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=300&h=300&fit=crop', popular: false },

    // Merchant 4 - Bakso Solo
    { id: 'menu-8', merchantId: 'merchant-4', merchantName: 'Bakso Solo Samrat', name: 'Bakso Urat Jumbo', price: 18000, description: 'Bakso urat ukuran jumbo', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=300&h=300&fit=crop', popular: true },
    { id: 'menu-9', merchantId: 'merchant-4', merchantName: 'Bakso Solo Samrat', name: 'Bakso Beranak', price: 20000, description: 'Bakso isi bakso kecil di dalamnya', image: 'https://images.unsplash.com/photo-1583224994078-e5a8a67e99de?w=300&h=300&fit=crop', popular: true },

    // Merchant 5 - Mie Gacoan
    { id: 'menu-10', merchantId: 'merchant-5', merchantName: 'Mie Gacoan', name: 'Mie Gacoan Level 1', price: 10000, description: 'Mie pedas level 1', image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=300&h=300&fit=crop', popular: true },
    { id: 'menu-11', merchantId: 'merchant-5', merchantName: 'Mie Gacoan', name: 'Mie Gacoan Level 4', price: 12000, description: 'Mie pedas level 4 (extreme)', image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=300&h=300&fit=crop', popular: false },

    // Merchant 6 - Kopi Kenangan
    { id: 'menu-12', merchantId: 'merchant-6', merchantName: 'Kopi Kenangan', name: 'Kopi Kenangan Mantan', price: 18000, description: 'Es kopi susu gula aren', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop', popular: true },
    { id: 'menu-13', merchantId: 'merchant-6', merchantName: 'Kopi Kenangan', name: 'Matcha Latte', price: 22000, description: 'Matcha premium dengan susu segar', image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=300&h=300&fit=crop', popular: true },
]

/**
 * Get all merchants
 * @returns {Array} All merchant objects
 */
export function getAllMerchants() {
    return merchants
}

/**
 * Get all menu items with merchantName included
 * @returns {Array} All menu items
 */
export function getAllMenus() {
    return menus
}

/**
 * Get a merchant by ID
 * @param {string} id - Merchant ID
 * @returns {Object|undefined} Merchant object or undefined
 */
export function getMerchantById(id) {
    return merchants.find(m => m.id === id)
}

/**
 * Get popular menu items (sorted by popularity flag)
 * @returns {Array} Popular menu items
 */
export function getPopularMenus() {
    return menus.filter(m => m.popular)
}
