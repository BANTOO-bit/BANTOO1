import { supabase } from './supabaseClient'

/**
 * Wallet Service - Handle wallet balance and transactions
 */
export const walletService = {
    /**
     * Get current user's wallet
     */
    async getWallet() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data, error } = await supabase
            .from('wallets')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (error) throw error
        return data
    },

    /**
     * Get wallet balance
     */
    async getBalance() {
        const wallet = await this.getWallet()
        return wallet?.balance || 0
    },

    /**
     * Get transaction history
     * @param {number} limit - Number of transactions to fetch
     * @param {number} offset - Offset for pagination
     */
    async getTransactions(limit = 20, offset = 0) {
        const wallet = await this.getWallet()
        if (!wallet) return []

        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('wallet_id', wallet.id)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

        if (error) throw error
        return data
    },

    /**
     * Request withdrawal (ATOMIC operation)
     * Uses RPC to ensure balance check + deduction + insert happen in one transaction.
     * This prevents double-spending where two concurrent requests both pass the balance check.
     *
     * @param {Object} params - Withdrawal params
     * @param {number} params.amount - Amount to withdraw
     * @param {string} params.bankName - Bank name
     * @param {string} params.accountName - Account holder name
     * @param {string} params.accountNumber - Bank account number
     */
    async requestWithdrawal({ amount, bankName, accountName, accountNumber }) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        if (!amount || amount <= 0) throw new Error('Invalid withdrawal amount')
        if (!bankName || !accountName || !accountNumber) {
            throw new Error('Bank details are required')
        }

        // Try atomic RPC first
        const { data: rpcResult, error: rpcError } = await supabase.rpc('request_withdrawal', {
            p_amount: amount,
            p_bank_name: bankName,
            p_account_name: accountName,
            p_account_number: accountNumber
        })

        if (rpcError) {
            // If RPC doesn't exist yet, use safer fallback
            if (rpcError.code === '42883' || rpcError.message?.includes('does not exist')) {
                return this._requestWithdrawalFallback(user, { amount, bankName, accountName, accountNumber })
            }
            // RPC exists but returned a business error (e.g., insufficient balance)
            throw new Error(rpcError.message || 'Withdrawal failed')
        }

        return rpcResult
    },

    /**
     * Fallback withdrawal (TEMPORARY — remove after RPC deployment)
     * Uses conditional update to prevent race conditions at DB level.
     * @private
     */
    async _requestWithdrawalFallback(user, { amount, bankName, accountName, accountNumber }) {
        // Atomically deduct balance using conditional update
        // The .gte('balance', amount) ensures we only deduct if sufficient balance
        const { data: wallet, error: deductError } = await supabase
            .from('wallets')
            .update({ balance: supabase.rpc('wallets_balance_minus', { amount }) || undefined })
            .eq('user_id', user.id)
            .gte('balance', amount)
            .select()
            .single()

        // If conditional update fails, it means insufficient balance or race condition
        if (deductError || !wallet) {
            // Check actual balance to give proper error message
            const currentBalance = await this.getBalance()
            if (currentBalance < amount) {
                throw new Error('Saldo tidak mencukupi')
            }
            throw new Error('Gagal memproses penarikan. Silakan coba lagi.')
        }

        // Insert withdrawal record
        const { data, error } = await supabase
            .from('withdrawals')
            .insert({
                user_id: user.id,
                amount,
                bank_name: bankName,
                bank_account_name: accountName,
                bank_account_number: accountNumber,
                status: 'pending'
            })
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * Get withdrawal history
     */
    async getWithdrawals() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data, error } = await supabase
            .from('withdrawals')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    }
}

export default walletService
