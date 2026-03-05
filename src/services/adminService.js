import { supabase } from './supabaseClient'

/**
 * Admin Service — Handles admin-specific operations.
 * All Supabase queries for admin pages/components are centralized here.
 */
export const adminService = {
    // ============================================================
    // USERS (CUSTOMERS)
    // ============================================================

    async getCustomers(limit = 50) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .in('role', ['customer'])
            .order('created_at', { ascending: false })
            .limit(limit)
        if (error) throw error
        return data || []
    },

    async getCustomerStats() {
        const { count: total } = await supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .eq('role', 'customer')

        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)

        const { count: newThisWeek } = await supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .eq('role', 'customer')
            .gte('created_at', weekAgo.toISOString())

        return {
            total: total || 0,
            active: total || 0,
            newThisWeek: newThisWeek || 0,
            banned: 0,
        }
    },

    async getUserDetail(userId) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()
        if (error) throw error
        return data
    },

    async getCustomerName(customerId) {
        const { data } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', customerId)
            .single()
        return data?.full_name || 'Pelanggan'
    },

    // ============================================================
    // ORDERS (Admin view)
    // ============================================================

    async getAdminOrders({ statusFilter, dateFilter, customerFilter, limit = 100 } = {}) {
        let query = supabase
            .from('orders')
            .select(`
                id, status, total_amount, payment_method, payment_status,
                created_at, accepted_at, picked_up_at, delivered_at, cancelled_at,
                delivery_address, notes, cancellation_reason, order_number,
                merchant:merchants(id, name),
                customer:profiles!orders_customer_id_fkey(id, full_name, phone),
                driver:profiles!orders_driver_id_fkey(id, full_name, phone),
                items:order_items(product_name, quantity, price_at_time)
            `)
            .order('created_at', { ascending: false })
            .limit(limit)

        if (customerFilter) query = query.eq('customer_id', customerFilter)
        if (statusFilter) query = query.eq('status', statusFilter)

        if (dateFilter) {
            const { start, end } = getDateRange(dateFilter)
            query = query.gte('created_at', start).lte('created_at', end)
        }

        const { data, error } = await query
        if (error) throw error
        return data || []
    },

    async getAdminOrderDetail(orderId) {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                merchant:merchants(id, name, image_url, address, phone),
                customer:profiles!orders_customer_id_fkey(id, full_name, phone, email, avatar_url),
                driver:profiles!orders_driver_id_fkey(id, full_name, phone, avatar_url),
                items:order_items(*, menu_items(image_url))
            `)
            .eq('id', orderId)
            .maybeSingle()
        if (error) throw error
        return data
    },

    // ============================================================
    // ADMIN AUTH
    // ============================================================

    async createAdminAccount(email, password) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        })
        if (error) throw error

        if (data?.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: data.user.id,
                    email,
                    role: 'admin',
                    full_name: 'Admin',
                })
            if (profileError) throw profileError
        }

        return data
    },

    async adminLogin(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        if (error) throw error
        return data
    },

    // ============================================================
    // ISSUES
    // ============================================================

    async getIssues({ status, limit = 50 } = {}) {
        let query = supabase
            .from('issues')
            .select('*, profiles:user_id(full_name, phone, avatar_url)')
            .order('created_at', { ascending: false })
            .limit(limit)

        if (status) query = query.eq('status', status)

        const { data, error } = await query
        if (error) throw error
        return data || []
    },

    async getIssueDetail(issueId) {
        const { data, error } = await supabase
            .from('issues')
            .select('*, profiles:user_id(full_name, phone, email, avatar_url)')
            .eq('id', issueId)
            .single()
        if (error) throw error
        return data
    },

    async updateIssueStatus(issueId, status, adminNotes) {
        const { error } = await supabase
            .from('issues')
            .update({
                status,
                admin_notes: adminNotes,
                resolved_at: status === 'resolved' ? new Date().toISOString() : null,
            })
            .eq('id', issueId)
        if (error) throw error
        return true
    },

    // ============================================================
    // NOTIFICATIONS (admin-specific)
    // ============================================================

    async getAdminSearchResults(query) {
        if (!query || query.length < 2) return []

        const [merchants, drivers, orders] = await Promise.all([
            supabase.from('merchants').select('id, name').ilike('name', `%${query}%`).limit(5),
            supabase.from('profiles').select('id, full_name').eq('role', 'driver').ilike('full_name', `%${query}%`).limit(5),
            supabase.from('orders').select('id, status, order_number').or(`id.eq.${query},order_number.ilike.%${query}%`).limit(5),
        ])

        return {
            merchants: merchants.data || [],
            drivers: drivers.data || [],
            orders: orders.data || [],
        }
    },

    async getAdminAlerts() {
        const [pendingWithdrawals, pendingMerchants, pendingDrivers, recentOrders] = await Promise.all([
            supabase.from('withdrawals').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
            supabase.from('merchants').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
            supabase.from('drivers').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
            supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        ])

        return {
            pendingWithdrawals: pendingWithdrawals.count || 0,
            pendingMerchants: pendingMerchants.count || 0,
            pendingDrivers: pendingDrivers.count || 0,
            pendingOrders: recentOrders.count || 0,
        }
    },

    async getRecentTransactions(limit = 10) {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                id, total_amount, payment_method, status, created_at, order_number,
                customer:profiles!orders_customer_id_fkey(full_name),
                merchant:merchants(name)
            `)
            .order('created_at', { ascending: false })
            .limit(limit)
        if (error) throw error
        return data || []
    },

    // ============================================================
    // FINANCIAL (COD)
    // ============================================================

    async getCodOrdersToday() {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const { data, error } = await supabase
            .from('orders')
            .select('id, total_amount, service_fee, payment_method, payment_status, status, created_at, customer_name')
            .eq('payment_method', 'cod')
            .gte('created_at', today.toISOString())
            .order('created_at', { ascending: false })
        if (error) throw error
        return data || []
    },

    // ============================================================
    // DRIVERS (Admin management)
    // ============================================================

    async getAdminDrivers() {
        const { data, error } = await supabase
            .from('drivers')
            .select('*, profiles!drivers_user_id_fkey(full_name, phone, email)')
            .in('status', ['approved', 'suspended'])
            .order('created_at', { ascending: false })
        if (error) throw error
        return data || []
    },

    async getDriverStats() {
        const [total, online, pending, suspended] = await Promise.all([
            supabase.from('drivers').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
            supabase.from('drivers').select('id', { count: 'exact', head: true }).eq('status', 'approved').eq('is_active', true),
            supabase.from('drivers').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
            supabase.from('drivers').select('id', { count: 'exact', head: true }).eq('status', 'suspended'),
        ])
        return {
            total: total.count || 0,
            online: online.count || 0,
            offline: (total.count || 0) - (online.count || 0),
            pending: pending.count || 0,
            suspended: suspended.count || 0,
        }
    },

    async terminateDriver(driverId, reason) {
        const { error } = await supabase.from('drivers').update({ status: 'terminated', termination_reason: reason || null }).eq('id', driverId)
        if (error) throw error
        return true
    },

    async suspendDriver(driverId) {
        const { error } = await supabase.from('drivers').update({ status: 'suspended' }).eq('id', driverId)
        if (error) throw error
        return true
    },

    async unsuspendDriver(driverId) {
        const { error } = await supabase.from('drivers').update({ status: 'approved' }).eq('id', driverId)
        if (error) throw error
        return true
    },

    // ============================================================
    // WITHDRAWALS (Admin detail + actions)
    // ============================================================

    async getWithdrawalDetail(withdrawalId) {
        const { data, error } = await supabase
            .from('withdrawals')
            .select('*, user:profiles!withdrawals_user_id_fkey(id, full_name, phone, email, role, created_at)')
            .eq('id', withdrawalId)
            .single()
        if (error) throw error
        return data
    },

    async approveWithdrawal(withdrawalId) {
        const { error } = await supabase
            .from('withdrawals')
            .update({ status: 'approved', processed_at: new Date().toISOString() })
            .eq('id', withdrawalId)
        if (error) throw error
        return true
    },

    async rejectWithdrawal(withdrawalId, reason) {
        const { error } = await supabase
            .from('withdrawals')
            .update({ status: 'rejected', rejection_reason: reason, processed_at: new Date().toISOString() })
            .eq('id', withdrawalId)
        if (error) throw error
        return true
    },

    // ============================================================
    // DASHBOARD
    // ============================================================

    async getDashboardStats() {
        const { data, error } = await supabase.rpc('get_admin_dashboard_stats')
        if (error) throw error
        return data || { total_orders: 0, active_cod: 0, online_drivers: 0, today_revenue: 0 }
    },

    async getDashboardChartData() {
        const today = new Date()
        const sevenDaysAgo = new Date(today)
        sevenDaysAgo.setDate(today.getDate() - 6)
        sevenDaysAgo.setHours(0, 0, 0, 0)

        const { data, error } = await supabase
            .from('orders')
            .select('created_at, total_amount, service_fee, status, payment_method')
            .gte('created_at', sevenDaysAgo.toISOString())
            .order('created_at', { ascending: true })
        if (error) throw error
        return data || []
    },

    async checkAdminRole(userId) {
        const { data } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single()
        return data?.role === 'admin'
    },

    // ============================================================
    // DRIVER DETAIL + EDIT
    // ============================================================

    async getDriverDetail(driverId) {
        const { data: driverData, error: driverErr } = await supabase
            .from('drivers')
            .select('*')
            .eq('id', driverId)
            .single()
        if (driverErr) throw driverErr

        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, phone, email, avatar_url, created_at')
            .eq('id', driverData.user_id || driverId)
            .single()

        const userId = driverData.user_id || driverId
        const { count } = await supabase
            .from('orders')
            .select('id', { count: 'exact', head: true })
            .eq('driver_id', userId)

        const { data: earningsData } = await supabase
            .from('orders')
            .select('delivery_fee')
            .eq('driver_id', userId)
            .in('status', ['completed', 'delivered'])

        return {
            driver: { ...driverData, ...profile },
            orderCount: count || 0,
            totalEarnings: earningsData?.reduce((sum, o) => sum + (o.delivery_fee || 0), 0) || 0,
        }
    },

    async getDriverEditData(driverId) {
        const { data: driverData, error: driverErr } = await supabase
            .from('drivers')
            .select('*')
            .eq('id', driverId)
            .single()
        if (driverErr) throw driverErr

        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, phone, email')
            .eq('id', driverData.user_id || driverId)
            .single()

        return { ...driverData, ...profile }
    },

    async updateDriverData(driverId, userId, form) {
        const { error: driverErr } = await supabase
            .from('drivers')
            .update({
                nik: form.nik,
                address: form.address,
                vehicle_type: form.vehicle_type,
                vehicle_plate: form.vehicle_plate,
                vehicle_brand: form.vehicle_brand,
            })
            .eq('id', driverId)
        if (driverErr) throw driverErr

        const { error: profileErr } = await supabase
            .from('profiles')
            .update({ full_name: form.full_name, phone: form.phone })
            .eq('id', userId)
        if (profileErr) console.warn('Profile update error:', profileErr)

        return true
    },

    // ============================================================
    // MERCHANTS (Admin management)
    // ============================================================

    async getAdminMerchants() {
        const { data, error } = await supabase
            .from('merchants')
            .select('*, profiles!merchants_owner_id_fkey(full_name, phone, email)')
            .in('status', ['approved', 'suspended'])
            .order('created_at', { ascending: false })
        if (error) throw error
        return data || []
    },

    async getMerchantStats() {
        const [total, open, pending, suspended] = await Promise.all([
            supabase.from('merchants').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
            supabase.from('merchants').select('id', { count: 'exact', head: true }).eq('status', 'approved').eq('is_open', true),
            supabase.from('merchants').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
            supabase.from('merchants').select('id', { count: 'exact', head: true }).eq('status', 'suspended'),
        ])
        return {
            total: total.count || 0,
            open: open.count || 0,
            closed: (total.count || 0) - (open.count || 0),
            pending: pending.count || 0,
            suspended: suspended.count || 0,
        }
    },

    async terminateMerchant(merchantId, reason) {
        const { error } = await supabase.from('merchants').update({ status: 'terminated', termination_reason: reason || null }).eq('id', merchantId)
        if (error) throw error
        return true
    },

    async suspendMerchant(merchantId) {
        const { error } = await supabase.from('merchants').update({ status: 'suspended' }).eq('id', merchantId)
        if (error) throw error
        return true
    },

    async unsuspendMerchant(merchantId) {
        const { error } = await supabase.from('merchants').update({ status: 'approved' }).eq('id', merchantId)
        if (error) throw error
        return true
    },

    async getMerchantDetail(merchantId) {
        const { data, error } = await supabase
            .from('merchants')
            .select('*, owner:profiles!merchants_owner_id_fkey(id, full_name, phone, email, avatar_url)')
            .eq('id', merchantId)
            .single()
        if (error) throw error

        const { count } = await supabase
            .from('orders')
            .select('id', { count: 'exact', head: true })
            .eq('merchant_id', merchantId)

        const { data: revenueData } = await supabase
            .from('orders')
            .select('total_amount')
            .eq('merchant_id', merchantId)
            .in('status', ['completed', 'delivered'])

        return {
            merchant: data,
            orderCount: count || 0,
            totalRevenue: revenueData?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0,
        }
    },

    async getMerchantEditData(merchantId) {
        const { data, error } = await supabase
            .from('merchants')
            .select('*, owner:profiles!merchants_owner_id_fkey(full_name, phone, email)')
            .eq('id', merchantId)
            .single()
        if (error) throw error
        return data
    },

    async updateMerchantData(merchantId, form) {
        const { error } = await supabase
            .from('merchants')
            .update({
                name: form.name,
                category: form.category,
                phone: form.phone,
                address: form.address,
                owner_name: form.owner_name,
                owner_nik: form.owner_nik,
            })
            .eq('id', merchantId)
        if (error) throw error
        return true
    },

    // ============================================================
    // ADMIN COMPONENT-SPECIFIC FUNCTIONS
    // ============================================================

    /**
     * Get admin quick action counts (for AdminQuickActions)
     */
    async getQuickActionCounts() {
        const [issuesRes, withdrawalsRes, driversRes, merchantsRes] = await Promise.all([
            supabase.from('issues').select('id', { count: 'exact', head: true }).in('status', ['open', 'in_progress']),
            supabase.from('withdrawals').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
            supabase.from('drivers').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
            supabase.from('merchants').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        ])

        return {
            issues: issuesRes.count || 0,
            withdrawals: withdrawalsRes.count || 0,
            verifications: (driversRes.count || 0) + (merchantsRes.count || 0)
        }
    },

    /**
     * Get recent transactions with driver info (for AdminRecentTransactions)
     */
    async getRecentTransactionsWithDrivers(limit = 5) {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                id, status, total_amount, created_at, customer_name,
                merchant:merchants(name),
                driver:profiles!orders_driver_id_fkey(full_name)
            `)
            .order('created_at', { ascending: false })
            .limit(limit)
        if (error) throw error
        return data || []
    },

    /**
     * Get pending partner registrations (for AdminPartnerVerification)
     */
    async getPendingPartners(type = 'merchants') {
        let query
        if (type === 'merchants') {
            query = supabase
                .from('merchants')
                .select(`
                    id, name, address, status, created_at,
                    owner:profiles!owner_id (full_name, phone)
                `)
                .eq('status', 'pending')
                .order('created_at', { ascending: false })
        } else {
            query = supabase
                .from('drivers')
                .select(`
                    id, vehicle_type, vehicle_plate, status, created_at,
                    user:profiles!user_id (full_name, phone)
                `)
                .eq('status', 'pending')
                .order('created_at', { ascending: false })
        }

        const { data, error } = await query
        if (error) throw error
        return data || []
    },

    /**
     * Approve a partner registration
     */
    async approvePartner(type, id) {
        const table = type === 'merchants' ? 'merchants' : 'drivers'
        const { error } = await supabase.from(table).update({ status: 'approved' }).eq('id', id)
        if (error) throw error
        return true
    },

    /**
     * Reject a partner registration
     */
    async rejectPartner(type, id) {
        const table = type === 'merchants' ? 'merchants' : 'drivers'
        const { error } = await supabase.from(table).update({ status: 'rejected' }).eq('id', id)
        if (error) throw error
        return true
    },

    /**
     * Get alert panel data (for AdminAlertPanel)
     */
    async getAlertPanelData() {
        const now = new Date()
        const todayStart = new Date(now)
        todayStart.setHours(0, 0, 0, 0)
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

        const [codRes, stuckRes, wdRes] = await Promise.all([
            supabase.from('orders')
                .select('driver_id, total_amount, service_fee, id')
                .eq('payment_method', 'cod')
                .eq('status', 'delivered')
                .neq('payment_status', 'paid')
                .gte('created_at', todayStart.toISOString()),
            supabase.from('orders')
                .select('id, status, created_at')
                .in('status', ['pending', 'accepted', 'preparing'])
                .lt('created_at', oneHourAgo.toISOString())
                .limit(5),
            supabase.from('withdrawals')
                .select('id, amount, created_at')
                .eq('status', 'pending')
                .lt('created_at', oneDayAgo.toISOString())
                .limit(3),
        ])

        // Resolve driver names for COD alerts
        let driverNames = {}
        const codOrders = codRes.data || []
        if (codOrders.length > 0) {
            const driverIds = [...new Set(codOrders.filter(o => o.driver_id).map(o => o.driver_id))]
            if (driverIds.length > 0) {
                const { data: drivers } = await supabase
                    .from('profiles')
                    .select('id, full_name')
                    .in('id', driverIds)
                drivers?.forEach(d => { driverNames[d.id] = d.full_name || 'Driver' })
            }
        }

        return {
            codOrders,
            driverNames,
            stuckOrders: stuckRes.data || [],
            pendingWithdrawals: wdRes.data || [],
        }
    },

    /**
     * Register a new admin account (for CreateAdminPage)
     */
    async registerAdmin({ email, password, name, phone }) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                    phone_number: phone,
                    role: 'admin'
                }
            }
        })

        if (signUpError) throw signUpError
        if (!signUpData.user) throw new Error('Registrasi gagal')

        const userId = signUpData.user.id

        // Insert admin role
        const { error: roleError } = await supabase
            .from('user_roles')
            .insert({ user_id: userId, role: 'admin' })
        if (roleError) console.error('Failed to insert admin role:', roleError)

        // Update profile
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ active_role: 'admin', phone, full_name: name })
            .eq('id', userId)
        if (profileError) console.error('Failed to update profile:', profileError)

        return signUpData
    },

    /**
     * Admin global search (enhanced for AdminHeader - with path formatting)
     */
    async searchGlobal(query) {
        if (!query || query.length < 2) return []
        const q = `%${query}%`

        const [merchants, drivers] = await Promise.all([
            supabase.from('merchants').select('id, name, status').ilike('name', q).limit(4),
            supabase.from('drivers').select('id, profiles!drivers_user_id_fkey(full_name)').limit(10)
        ])

        const results = []
        if (merchants.data?.length) {
            merchants.data.forEach(m => results.push({
                type: 'Warung', icon: 'storefront', label: m.name,
                sub: m.status === 'approved' ? 'Aktif' : m.status,
                path: `/admin/merchants/${m.id}`
            }))
        }
        if (drivers.data?.length) {
            const dq = query.toLowerCase()
            drivers.data
                .filter(d => d.profiles?.full_name?.toLowerCase().includes(dq))
                .slice(0, 4)
                .forEach(d => results.push({
                    type: 'Driver', icon: 'two_wheeler',
                    label: d.profiles?.full_name || 'Driver', sub: 'Driver',
                    path: `/admin/drivers/${d.id}`
                }))
        }

        return results
    },
}

// ============================================================
// Date range helpers (moved from AdminOrdersPage)
// ============================================================

function getDateRange(filter) {
    const now = new Date()
    const start = new Date(now)
    start.setHours(0, 0, 0, 0)

    switch (filter) {
        case 'kemarin': {
            start.setDate(start.getDate() - 1)
            const endYesterday = new Date(start)
            endYesterday.setHours(23, 59, 59, 999)
            return { start: start.toISOString(), end: endYesterday.toISOString() }
        }
        case 'minggu_ini':
            start.setDate(start.getDate() - start.getDay())
            return { start: start.toISOString(), end: now.toISOString() }
        case 'bulan_ini':
            start.setDate(1)
            return { start: start.toISOString(), end: now.toISOString() }
        default: // hari_ini
            return { start: start.toISOString(), end: now.toISOString() }
    }
}

export default adminService
