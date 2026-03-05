import { supabase } from './supabaseClient'

/**
 * COD Service — Handles Cash on Delivery fee management.
 * Extracted from AdminCODPage.jsx direct Supabase calls.
 */
export const codService = {
    async getDeposits(limit = 50) {
        const { data, error } = await supabase
            .from('deposits')
            .select('*, profiles:user_id(full_name, phone)')
            .order('created_at', { ascending: false })
            .limit(limit)
        if (error) throw error
        return data || []
    },

    async getDriverBalances() {
        const { data: drivers, error } = await supabase
            .from('drivers')
            .select('user_id, status, profiles:user_id(full_name, phone)')
            .in('status', ['approved', 'active', 'suspended'])
        if (error) throw error

        const results = []
        for (const driver of (drivers || [])) {
            try {
                const { data: balance } = await supabase.rpc('get_cod_balance', { p_driver_id: driver.user_id })
                if (balance && balance.balance > 0) {
                    results.push({
                        ...driver,
                        name: driver.profiles?.full_name || 'Driver',
                        phone: driver.profiles?.phone,
                        initials: (driver.profiles?.full_name || 'D').split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2),
                        cod: balance,
                    })
                }
            } catch { /* skip individual driver errors */ }
        }

        results.sort((a, b) => (b.cod?.balance || 0) - (a.cod?.balance || 0))
        return results
    },

    async getDriverLedger(driverId, limit = 50) {
        const { data, error } = await supabase
            .from('cod_ledger')
            .select('*')
            .eq('driver_id', driverId)
            .order('created_at', { ascending: false })
            .limit(limit)
        if (error) throw error
        return data || []
    },

    async getSummary() {
        const { data, error } = await supabase.rpc('get_cod_summary')
        if (error) throw error
        return data
    },

    async handleDepositAction(depositId, action) {
        const { data: { user } } = await supabase.auth.getUser()
        const { error } = await supabase
            .from('deposits')
            .update({
                status: action,
                reviewed_at: new Date().toISOString(),
                reviewed_by: user?.id || null,
                admin_notes: action === 'rejected' ? 'Ditolak oleh admin' : null,
            })
            .eq('id', depositId)
        if (error) throw error
        return true
    },
}

export default codService
