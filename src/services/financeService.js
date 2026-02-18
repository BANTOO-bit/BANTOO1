import { supabase } from './supabaseClient'

export const financeService = {
    /**
     * Get all withdrawal requests with filtering
     * @param {Object} filters - { status, startDate, endDate }
     */
    async getWithdrawals({ status = 'pending', startDate, endDate } = {}) {
        try {
            let query = supabase
                .from('withdrawals')
                .select(`
                    *,
                    user:user_id (
                        id,
                        full_name,
                        role,
                        phone,
                        avatar_url
                    )
                `)
                .order('created_at', { ascending: false })

            if (status && status !== 'all') {
                query = query.eq('status', status)
            }

            if (startDate) {
                query = query.gte('created_at', startDate)
            }

            if (endDate) {
                query = query.lte('created_at', endDate)
            }

            const { data, error } = await query

            if (error) throw error
            return data
        } catch (error) {
            console.error('FinanceService: Failed to fetch withdrawals', error)
            throw error
        }
    },

    /**
     * Get withdrawal details by ID
     */
    async getWithdrawalById(id) {
        try {
            const { data, error } = await supabase
                .from('withdrawals')
                .select(`
                    *,
                    user:user_id (
                        id,
                        full_name,
                        role,
                        phone,
                        email
                    )
                `)
                .eq('id', id)
                .single()

            if (error) throw error
            return data
        } catch (error) {
            console.error(`FinanceService: Failed to fetch withdrawal ${id}`, error)
            throw error
        }
    },

    /**
     * Approve a withdrawal
     * @param {string} id - Withdrawal ID
     * @param {File} proofImage - Transfer proof image (optional)
     */
    async approveWithdrawal(id, proofImage = null) {
        try {
            let proofUrl = null

            // Upload proof if provided
            if (proofImage) {
                const { storageService, STORAGE_PATHS } = await import('./storageService')
                proofUrl = await storageService.upload(proofImage, STORAGE_PATHS.FINANCE_RECEIPT, id)
            }

            // Update status
            const { data, error } = await supabase
                .from('withdrawals')
                .update({
                    status: 'approved',
                    proof_url: proofUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single()

            if (error) throw error

            // Create notification for user
            await supabase.from('notifications').insert({
                user_id: data.user_id,
                title: 'Penarikan Disetujui',
                message: `Permintaan penarikan dana sebesar Rp ${data.amount.toLocaleString()} telah disetujui.`,
                type: 'system',
                is_read: false
            })

            return data
        } catch (error) {
            console.error('FinanceService: Failed to approve withdrawal', error)
            throw error
        }
    },

    /**
     * Reject a withdrawal and Refund balance
     * @param {string} id - Withdrawal ID
     * @param {string} reason - Rejection reason
     */
    async rejectWithdrawal(id, reason) {
        try {
            // Get withdrawal details first to refund amount
            const withdrawal = await this.getWithdrawalById(id)
            if (!withdrawal) throw new Error('Withdrawal not found')

            if (withdrawal.status !== 'pending') {
                throw new Error('Can only reject pending withdrawals')
            }

            // Start RPC transaction if possible, or sequential
            // 1. Refund balance
            const { error: refundError } = await supabase.rpc('wallet_balance_plus', {
                p_user_id: withdrawal.user_id,
                p_amount: withdrawal.amount
            }).catch(async () => {
                // Fallback if RPC doesn't exist: Manual update
                const { data: wallet } = await supabase
                    .from('wallets')
                    .select('balance')
                    .eq('user_id', withdrawal.user_id)
                    .single()

                return await supabase
                    .from('wallets')
                    .update({ balance: (wallet?.balance || 0) + withdrawal.amount })
                    .eq('user_id', withdrawal.user_id)
            })

            if (refundError) throw new Error('Failed to refund balance')

            // 2. Update status
            const { data, error } = await supabase
                .from('withdrawals')
                .update({
                    status: 'rejected',
                    rejection_reason: reason,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single()

            if (error) throw error

            // 3. Create notification
            await supabase.from('notifications').insert({
                user_id: withdrawal.user_id,
                title: 'Penarikan Ditolak',
                message: `Permintaan penarikan dana Anda ditolak. Alasan: ${reason}. Saldo telah dikembalikan.`,
                type: 'system',
                is_read: false
            })

            return data
        } catch (error) {
            console.error('FinanceService: Failed to reject withdrawal', error)
            throw error
        }
    }
}

export default financeService
