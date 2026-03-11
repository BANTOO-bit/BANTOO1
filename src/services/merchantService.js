import { supabase } from './supabaseClient'
import settingsService, { haversineDistance } from './settingsService'
import logger from '../utils/logger'

/**
 * @typedef {import('../types').ServiceResponse} ServiceResponse
 * @typedef {import('../types').Merchant} Merchant
 * @typedef {import('../types').MenuItem} MenuItem
 */

/**
 * Merchant Service - Handle merchant and menu data from Supabase
 */

/**
 * Helper to compute if merchant is actually open based on operating hours JSON
 * @param {Merchant} merchant 
 * @returns {boolean} true if open, false if manually closed or automatically outside hours
 */
function computeActualIsOpen(merchant) {
    if (!merchant) return false
    // If manually closed, definitely closed
    if (!merchant.is_open) return false

    // If no operating hours defined, fallback to manual status (is_open)
    if (!merchant.operating_hours) return merchant.is_open

    const dayMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
    const now = new Date()
    // Default to Indonesia time or localized context time. Using system local time for simplicity.
    const todayStr = dayMap[now.getDay()]
    const todaySchedule = merchant.operating_hours[todayStr]

    // If merchant explicitly marked this day as closed
    if (!todaySchedule || !todaySchedule.isOpen) return false

    // Example time: "08:00"
    const [openH, openM] = todaySchedule.open.split(':').map(Number)
    const [closeH, closeM] = todaySchedule.close.split(':').map(Number)

    const currentH = now.getHours()
    const currentM = now.getMinutes()

    const openMinutes = openH * 60 + openM
    const closeMinutes = closeH * 60 + closeM
    const currentMinutes = currentH * 60 + currentM

    // Handle overnight schedules (e.g. 20:00 to 04:00)
    if (openMinutes > closeMinutes) {
        return currentMinutes >= openMinutes || currentMinutes <= closeMinutes
    }

    // Normal schedule (e.g. 08:00 to 21:00)
    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes
}

export const merchantService = {
    // Simple in-memory cache
    _cache: {
        merchants: { data: null, timestamp: 0 },
        allMenus: { data: null, timestamp: 0 },
        categories: { data: null, timestamp: 0 },
        popularMenus: { data: null, timestamp: 0 }
    },
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes

    _isValidCache(key) {
        const item = this._cache[key]
        return item && item.data && (Date.now() - item.timestamp < this.CACHE_DURATION)
    },

    _setCache(key, data) {
        this._cache[key] = {
            data,
            timestamp: Date.now()
        }
    },
    /**
     * Get menus by category
     * @param {string} categoryId 
     * @returns {Promise<Array<MenuItem & {merchant_name: string, merchant_rating: number, merchant_image: string, merchant_delivery_fee: number, merchant_delivery_time: string, image: string}>>}
     */
    async getMenusByCategory(categoryId) {
        try {
            const targetCategory = categoryId.toLowerCase().trim()

            // Refactor (Cara B): Filter by Menu Item's Category directly
            // This assumes menu_items.category stores the standardized slug (e.g. 'makanan-berat')

            const { data, error } = await supabase
                .from('menu_items')
                .select(`
                    *,
                    merchants(
                        id, name, rating, address, image_url, delivery_fee, delivery_time, category
                    )
                `)
                .eq('is_available', true)
                .eq('category', targetCategory)

            logger.debug(`[DEBUG] GetMenusByCategory: ${targetCategory}, Found: ${data?.length}`)

            if (error) throw error

            // Transform result to flatten merchant info
            return (data || []).map(item => ({
                ...item,
                merchant_name: item.merchants?.name,
                merchant_rating: item.merchants?.rating,
                merchant_image: item.merchants?.image_url,
                merchant_delivery_fee: item.merchants?.delivery_fee,
                merchant_delivery_time: item.merchants?.delivery_time,
                // Ensure image url is valid
                image: item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Zm9vZHxlbnwwfDB8MHx8fDA%3D'
            }))

        } catch (error) {
            logger.error(`Failed to get menus by category ${categoryId}`, error, 'merchantService')
            throw error
        }
    },

    /**
     * Get all merchants
     * @param {Object} options - Query options
     * @param {string|null} [options.category=null] - Filter by category
     * @param {string|null} [options.search=null] - Search by name
     * @param {boolean|null} [options.isOpen=null] - Filter by open status
     * @param {number|null} [options.limit=null] - Limit number of results
     * @returns {Promise<Partial<Merchant>[]>}
     */
    async getMerchants({ category = null, search = null, isOpen = null, limit = null } = {}) {
        // Use cache only if fetching ALL merchants (common case for initial load/filtering)
        // If limit is provided, we probably shouldn't use the 'all merchants' cache unless we slice it?
        // For simplicity, let's just query DB if limit is used, or cache specific keys if needed.
        // Or better: If cache exists, return slice? 
        // Let's stick to DB for now to ensure 'is_open' sorting is correct.

        const isDefaultQuery = !category && !search && isOpen === null && !limit
        if (isDefaultQuery && this._isValidCache('merchants')) {
            return this._cache.merchants.data
        }

        try {
            let query = supabase
                .from('merchants')
                .select(`
                    id, name, category, rating, rating_count, 
                    delivery_time, delivery_fee, distance, 
                    is_open, operating_hours, has_promo, image:image_url, address, phone,
                    created_at
                `)
                .eq('status', 'approved')
                // Wait to sort in JS so we can use computed open status

            if (category) {
                query = query.eq('category', category)
            }
            if (search) {
                query = query.ilike('name', `%${search}%`)
            }
            if (isOpen !== undefined && isOpen !== null) {
                query = query.eq('is_open', isOpen)
            }

            if (limit) {
                query = query.limit(limit)
            }

            const { data, error } = await query

            if (error) throw error

            let computedData = (data || []).map(m => ({
                ...m,
                is_open: computeActualIsOpen(m)
            }))

            // Sort: Open -> Rating
            computedData.sort((a, b) => {
                if (a.is_open && !b.is_open) return -1
                if (!a.is_open && b.is_open) return 1
                return (b.rating || 0) - (a.rating || 0)
            })

            return computedData
        } catch (error) {
            logger.error('Failed to fetch merchants', error, 'merchantService')
            throw error
        }
    },

    /**
     * Search merchants by name
     * @param {string} query 
     * @returns {Promise<Partial<Merchant>[]>}
     */
    async searchMerchants(query) {
        return this.getMerchants({ search: query, limit: 5 })
    },

    /**
     * Get merchant by ID
     * @param {string} id 
     * @returns {Promise<Partial<Merchant>|null>}
     */
    async getMerchantById(id) {
        try {
            const { data, error } = await supabase
                .from('merchants')
                .select(`
                    id, name, category, rating, rating_count,
                    delivery_time, delivery_fee, distance,
                    is_open, operating_hours, has_promo, image:image_url, address, phone,
                    description, created_at, latitude, longitude
                `)
                .eq('id', id)
                .single()

            if (error) throw error
            if (data) {
                data.is_open = computeActualIsOpen(data)
            }
            return data
        } catch (error) {
            logger.error('Failed to fetch merchant by ID', error, 'merchantService')
            throw error
        }
    },

    /**
     * Get menus for a merchant
     * @param {string} merchantId 
     * @returns {Promise<Array<MenuItem & {merchantId: string, merchantName: string}>>}
     */
    async getMenusByMerchantId(merchantId) {
        try {
            const { data, error } = await supabase
                .from('menu_items')
                .select(`
                    id, name, description, price, category,
                    is_popular, image:image_url, is_available,
                    merchant_id
                `)
                .eq('merchant_id', merchantId)
                .eq('is_available', true)
                .order('is_popular', { ascending: false })

            if (error) throw error

            // Get merchant info for the items
            const merchant = await this.getMerchantById(merchantId)
            return (data || []).map(item => ({
                ...item,
                merchantId: merchant?.id,
                merchantName: merchant?.name
            }))
        } catch (error) {
            logger.error('Failed to fetch menus', error, 'merchantService')
            throw error
        }
    },

    /**
     * Get all menus across all merchants (for search/popular)
     * @param {Object} options 
     * @param {string|null} [options.search=null] 
     * @param {boolean} [options.popular=false] 
     * @param {number} [options.limit=50] 
     * @returns {Promise<Array<MenuItem & {merchantId: string, merchantName: string, merchantImage: string}>>}
     */
    async getAllMenus({ search = null, popular = false, limit = 50 } = {}) {
        const cacheKey = popular ? `popularMenus_${limit}` : (search ? null : `allMenus_${limit}`)
        if (cacheKey && this._isValidCache(cacheKey)) {
            return this._cache[cacheKey].data
        }

        try {
            let query = supabase
                .from('menu_items')
                .select(`
                    id, name, description, price, category,
                    is_popular, image:image_url, is_available,
                    merchant_id,
                    merchants!inner(id, name, image:image_url, is_open)
                `)
                .eq('is_available', true)

            if (popular) {
                query = query.eq('is_popular', true)
            }
            if (search) {
                query = query.ilike('name', `%${search}%`)
            }

            // Apply Limit
            if (limit) {
                query = query.limit(limit)
            }

            const { data, error } = await query

            if (error) throw error
            const result = (data || []).map(item => ({
                ...item,
                merchantId: item.merchants?.id,
                merchantName: item.merchants?.name,
                merchantImage: item.merchants?.image
            }))

            if (cacheKey) {
                this._setCache(cacheKey, result)
            }
            return result
        } catch (error) {
            logger.error('Failed to fetch all menus', error, 'merchantService')
            throw error
        }
    },

    /**
     * Get popular menus (for homepage)
     * @param {number} [limit=5] 
     * @returns {Promise<Array<MenuItem & {merchantId: string, merchantName: string, merchantImage: string}>>}
     */
    async getPopularMenus(limit = 5) {
        try {
            const menus = await this.getAllMenus({ popular: true, limit })
            return menus
        } catch (error) {
            logger.error('Failed to fetch popular menus', error, 'merchantService')
            return []
        }
    },

    /**
     * Get unique categories from merchants
     * @returns {Promise<string[]>}
     */
    async getCategories() {
        if (this._isValidCache('categories')) {
            return this._cache.categories.data
        }

        try {
            const { data, error } = await supabase
                .from('merchants')
                .select('category')
                .eq('status', 'approved')

            if (error) throw error
            const categories = [...new Set((data || []).map(m => m.category))]
            this._setCache('categories', categories)
            return categories
        } catch (error) {
            logger.error('Failed to fetch categories', error, 'merchantService')
            throw error
        }
    },

    /**
     * Calculate delivery fee based on distance using tier config
     * Uses OSRM for real road distance, falls back to haversine × 1.3
     * @param {string} merchantId - Merchant ID
     * @param {number} userLat - Customer latitude
     * @param {number} userLng - Customer longitude
     * @returns {Promise<{totalFee: number, adminFee: number, driverNet: number, distance: number, tierLabel: string, outOfRange: boolean, routeCoords: any, duration: any}>}
     */
    async getDeliveryFee(merchantId, userLat, userLng) {
        try {
            // 1. Get merchant location
            const merchant = await this.getMerchantById(merchantId)
            const merchantLat = merchant?.latitude || merchant?.lat
            const merchantLng = merchant?.longitude || merchant?.lng

            // 2. Calculate road distance via OSRM
            let distanceKm = 1 // Default 1km if no coordinates
            let routeCoords = null
            let duration = null

            if (merchantLat && merchantLng && userLat && userLng) {
                try {
                    const { getRoute } = await import('./routingService')
                    const route = await getRoute([merchantLat, merchantLng], [userLat, userLng])
                    distanceKm = route.distance
                    routeCoords = route.routeCoords
                    duration = route.duration
                } catch {
                    // Fallback to haversine × 1.3 if OSRM import/call fails
                    const straightLine = haversineDistance(merchantLat, merchantLng, userLat, userLng)
                    distanceKm = straightLine * 1.3
                }
            } else if (merchant?.distance) {
                distanceKm = parseFloat(merchant.distance) || 1
            }

            // 3. Get tier config from settings
            const tiersConfig = await settingsService.getDeliveryFeeTiers()

            // 4. Calculate fee from tier
            const feeResult = settingsService.calculateFeeFromTiers(distanceKm, tiersConfig)

            // 5. Attach route data for map display
            return { ...feeResult, routeCoords, duration }
        } catch (err) {
            console.error('Error calculating delivery fee:', err)
            // Fallback: use default tiers with 1km distance
            return settingsService.calculateFeeFromTiers(1, null)
        }
    },

    /**
     * Get merchants for verification (admin panel)
     * @param {string} [status='pending'] 
     * @returns {Promise<Merchant[]>}
     */
    async getMerchantsForVerification(status = 'pending') {
        try {
            const { data, error } = await supabase
                .from('merchants')
                .select(`
                    *,
                    owner:profiles!owner_id(id, full_name, email, phone, avatar_url)
                `)
                .eq('status', status)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data || []
        } catch (error) {
            logger.error('Failed to fetch merchants for verification', error, 'merchantService')
            throw error
        }
    },

    /**
     * Get merchant for review (admin panel)
     * @param {string} id 
     * @returns {Promise<Merchant>}
     */
    async getMerchantForReview(id) {
        try {
            const { data, error } = await supabase
                .from('merchants')
                .select(`
                    *,
                    owner:profiles!owner_id(id, full_name, email, phone, avatar_url)
                `)
                .eq('id', id)
                .single()

            if (error) throw error
            return data
        } catch (error) {
            logger.error('Failed to fetch merchant for review', error, 'merchantService')
            throw error
        }
    },

    /**
     * Update merchant profile
     * @param {string} id 
     * @param {Partial<Merchant>} updates 
     * @returns {Promise<Merchant>}
     */
    async updateMerchant(id, updates) {
        try {
            const { data, error } = await supabase
                .from('merchants')
                .update(updates)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error

            // Invalidate cache
            this._cache.merchants = { data: null, timestamp: 0 }
            // Also invalidate categories as they might have changed
            this._cache.categories = { data: null, timestamp: 0 }

            return data
        } catch (error) {
            logger.error('Failed to update merchant', error, 'merchantService')
            throw error
        }
    },

    /**
     * Approve merchant registration
     * @param {string} merchantId 
     * @param {string} adminId 
     * @returns {Promise<Merchant>}
     */
    async approveMerchant(merchantId, adminId) {
        try {
            const { data, error } = await supabase
                .from('merchants')
                .update({
                    status: 'approved',
                    approved_at: new Date().toISOString(),
                    approved_by: adminId
                })
                .eq('id', merchantId)
                .select()
                .single()

            if (error) throw error

            // Update the owner's profile role to 'merchant' so they can access merchant dashboard
            if (data?.owner_id) {
                await supabase
                    .from('profiles')
                    .update({
                        role: 'merchant',
                        active_role: 'merchant',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', data.owner_id)
            }

            logger.info(`Merchant ${merchantId} approved by admin ${adminId}`, 'merchantService')
            return data
        } catch (error) {
            logger.error('Failed to approve merchant', error, 'merchantService')
            throw error
        }
    },

    /**
     * Reject merchant registration
     * @param {string} merchantId 
     * @param {string} [reason=''] 
     * @returns {Promise<Merchant>}
     */
    async rejectMerchant(merchantId, reason = '') {
        try {
            const { data, error } = await supabase
                .from('merchants')
                .update({
                    status: 'rejected',
                    rejected_at: new Date().toISOString(),
                    rejection_reason: reason
                })
                .eq('id', merchantId)
                .select()
                .single()

            if (error) throw error
            logger.info(`Merchant ${merchantId} rejected with reason: ${reason}`, 'merchantService')
            return data
        } catch (error) {
            logger.error('Failed to reject merchant', error, 'merchantService')
            throw error
        }
    },

    /**
     * Get merchant sales stats (Revenue, Orders, Graph)
     * @param {string} merchantId 
     * @param {Date} startDate 
     * @param {Date} endDate 
     * @returns {Promise<{totalRevenue: number, totalOrders: number, averageOrderValue: number, graphData: Array<{name: string, value: number}>, topSellers: Array<{name: string, sold: number, revenue: number, percentage: number}>}>}
     */
    async getSalesStats(merchantId, startDate, endDate) {
        try {
            // Adjust end date to end of day
            const end = new Date(endDate)
            end.setHours(23, 59, 59, 999)

            const { data, error } = await supabase
                .from('orders')
                .select(`
                    id, 
                    subtotal, 
                    created_at, 
                    status,
                    order_items (
                        product_name,
                        quantity,
                        price_at_time
                    )
                `)
                .eq('merchant_id', merchantId)
                .eq('status', 'completed')
                .gte('created_at', startDate.toISOString())
                .lte('created_at', end.toISOString())
                .order('created_at', { ascending: true })

            if (error) throw error

            const sales = data || []
            const totalRevenue = sales.reduce((sum, order) => sum + (order.subtotal || 0), 0)
            const totalOrders = sales.length
            const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0
            
            // Commission calculation (10%)
            const commissionPercent = 10
            const totalCommission = Math.round(totalRevenue * (commissionPercent / 100))
            const netRevenue = totalRevenue - totalCommission

            // Group by day for graph
            const graphData = {}
            sales.forEach(order => {
                const date = new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                graphData[date] = (graphData[date] || 0) + (order.subtotal || 0)
            })

            // Calculate Top Sellers
            const itemMap = {}
            sales.forEach(order => {
                if (order.order_items) {
                    order.order_items.forEach(item => {
                        if (!itemMap[item.product_name]) {
                            itemMap[item.product_name] = {
                                name: item.product_name,
                                sold: 0,
                                revenue: 0
                            }
                        }
                        itemMap[item.product_name].sold += item.quantity
                        itemMap[item.product_name].revenue += (item.price_at_time * item.quantity)
                    })
                }
            })

            // Sort by quantity sold and take top 5
            const topSellers = Object.values(itemMap)
                .sort((a, b) => b.sold - a.sold)
                .slice(0, 5)
                .map(item => ({
                    ...item,
                    percentage: totalOrders > 0 ? Math.round((item.sold / sales.reduce((acc, order) => acc + (order.order_items?.length || 0), 0)) * 100) : 0 // Percentage of total items sold approximation
                }))

            // Recalculate percentage based on total items sold count for better accuracy if needed, 
            // but for now a simple relative metric is fine. 
            // Let's refine percentage to be share of total sold items.
            const totalItemsSold = Object.values(itemMap).reduce((acc, item) => acc + item.sold, 0)
            topSellers.forEach(item => {
                item.percentage = totalItemsSold > 0 ? Math.round((item.sold / totalItemsSold) * 100) : 0
            })

            return {
                totalRevenue,         // Gross
                totalCommission,      // 10% Commission
                netRevenue,           // Net after commission
                totalOrders,
                averageOrderValue,
                graphData: Object.entries(graphData).map(([name, value]) => ({ name, value })),
                topSellers
            }
        } catch (error) {
            logger.error('Failed to fetch sales stats', error, 'merchantService')
            throw error
        }
    },

    /**
     * Get merchant balance (Virtual calculation from Orders - Withdrawal)
     * @param {string} merchantId 
     * @returns {Promise<{balance: number, bank_name: string|null, bank_account_number: string|null, bank_account_name: string|null}>}
     */
    async getBalance(merchantId) {
        try {
            // 1. Get Owner ID first (withdrawals are linked to user_id)
            const { data: merchant, error: mError } = await supabase
                .from('merchants')
                .select('owner_id, bank_name, bank_account_number, bank_account_name')
                .eq('id', merchantId)
                .single()

            if (mError) throw mError

            // 2. Calculate Total Earnings (All time completed orders)
            const { data: orders, error: oError } = await supabase
                .from('orders')
                .select('subtotal')
                .eq('merchant_id', merchantId)
                .eq('status', 'completed')

            if (oError) throw oError

            const totalEarnings = (orders || []).reduce((sum, o) => sum + (o.subtotal || 0), 0)

            // 3. Calculate Total Withdrawals
            const { data: withdrawalsRaw, error: wError } = await supabase
                .from('withdrawals')
                .select('amount, status, created_at, bank_name')
                .eq('user_id', merchant.owner_id)
                .neq('status', 'rejected') // Pending/Approved/Completed count as deducted

            if (wError && wError.code !== 'PGRST116') throw wError // Ignore not found if strictly no table, but we checked table exists

            const withdrawals = withdrawalsRaw || []
            const totalWithdrawals = withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0)

            return {
                balance: totalEarnings - totalWithdrawals,
                totalEarnings,
                totalWithdrawals,
                withdrawals: withdrawals.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
                // Bank details from merchant record
                bankName: merchant.bank_name,
                accountNumber: merchant.bank_account_number,
                accountName: merchant.bank_account_name
            }
        } catch (error) {
            logger.error('Failed to fetch balance', error, 'merchantService')
            // Return 0 values on error gracefully to avoid crashing UI
            return {
                balance: 0,
                totalEarnings: 0,
                totalWithdrawals: 0,
                withdrawals: [],
                bankName: null,
                accountNumber: null,
                accountName: null
            }
        }
    },

    /**
     * Request withdrawal (with balance check and validation)
     */
    async requestWithdrawal(amount, bankDetails) {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const parsedAmount = parseInt(amount)
            if (!parsedAmount || parsedAmount <= 0) throw new Error('Nominal penarikan tidak valid')
            if (parsedAmount < 10000) throw new Error('Minimum penarikan adalah Rp 10.000')
            if (parsedAmount > 10000000) throw new Error('Maksimum penarikan adalah Rp 10.000.000')

            // Check merchant balance before allowing withdrawal
            const merchantId = user.merchantId || (await supabase.from('merchants').select('id').eq('owner_id', user.id).single()).data?.id
            if (merchantId) {
                const balanceData = await this.getBalance(merchantId)
                if (parsedAmount > balanceData.balance) {
                    throw new Error('Saldo tidak mencukupi untuk penarikan ini')
                }
            }

            const { data, error } = await supabase
                .from('withdrawals')
                .insert({
                    user_id: user.id,
                    amount: parsedAmount,
                    bank_name: bankDetails.bankName,
                    bank_account_number: bankDetails.accountNumber,
                    bank_account_name: bankDetails.accountName,
                    status: 'pending'
                })
                .select()
                .single()

            if (error) throw error
            return data
        } catch (error) {
            logger.error('Failed to request withdrawal', error, 'merchantService')
            throw error
        }
    },

    /**
     * Get the number of available/active drivers
     */
    async getAvailableDriversCount() {
        try {
            const { count, error } = await supabase
                .from('drivers')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'approved')
                .eq('is_active', true)

            if (error) throw error
            return count || 0
        } catch (error) {
            logger.error('Failed to get available drivers count', error, 'merchantService')
            return 0 // Fallback to 0 in case of error
        }
    },

    // ============================================================
    // MERCHANT OWNER-SIDE FUNCTIONS
    // ============================================================

    /**
     * Get merchant status by merchantId
     */
    async getMerchantStatus(merchantId) {
        const { data, error } = await supabase
            .from('merchants')
            .select('status')
            .eq('id', merchantId)
            .single()
        if (error) throw error
        return data?.status || 'approved'
    },

    /**
     * Get recent completed orders for balance history
     */
    async getRecentCompletedOrders(merchantId, limit = 5) {
        const { data, error } = await supabase
            .from('orders')
            .select('id, created_at, total_amount, status')
            .eq('merchant_id', merchantId)
            .eq('status', 'completed')
            .order('created_at', { ascending: false })
            .limit(limit)
        if (error) throw error
        return data || []
    },

    /**
     * Get bank account data for merchant owner
     */
    async getBankData(userId) {
        const { data, error } = await supabase
            .from('merchants')
            .select('bank_name, bank_account_number, bank_account_name')
            .eq('owner_id', userId)
            .single()
        if (error) throw error
        return data
    },

    /**
     * Save bank account data for merchant owner
     */
    async saveBankData(userId, bankData) {
        const { error } = await supabase
            .from('merchants')
            .update({
                bank_name: bankData.bank_name,
                bank_account_number: bankData.bank_account_number,
                bank_account_name: bankData.bank_account_name,
            })
            .eq('owner_id', userId)
        if (error) throw error
        return true
    },

    /**
     * Get operating hours for merchant owner
     */
    async getOperatingHours(userId) {
        const { data, error } = await supabase
            .from('merchants')
            .select('id, operating_hours')
            .eq('owner_id', userId)
            .single()
        if (error) throw error
        return data
    },

    /**
     * Save operating hours for merchant owner
     */
    async saveOperatingHours(userId, schedule) {
        const { error } = await supabase
            .from('merchants')
            .update({ operating_hours: schedule })
            .eq('owner_id', userId)
        if (error) throw error
        return true
    },

    // ============================================================
    // SHOP STATUS (extracted from AuthContext)
    // ============================================================

    /**
     * Get shop open/close status
     */
    async getShopStatus(merchantId) {
        const { data, error } = await supabase
            .from('merchants')
            .select('is_open')
            .eq('id', merchantId)
            .single()
        if (error) throw error
        return data?.is_open ?? false
    },

    /**
     * Toggle shop open/close status
     */
    async setShopOpen(merchantId, isOpen) {
        const { error } = await supabase
            .from('merchants')
            .update({ is_open: isOpen })
            .eq('id', merchantId)
        if (error) throw error
        return true
    },
}

export default merchantService

