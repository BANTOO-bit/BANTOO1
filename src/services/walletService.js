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
        if (amount < 10000) throw new Error('Minimum penarikan adalah Rp 10.000')
        if (amount > 10000000) throw new Error('Maksimum penarikan adalah Rp 10.000.000')
        if (!bankName || !accountName || !accountNumber) {
            throw new Error('Bank details are required')
        }

        // Atomic RPC — ensures balance check + deduction + insert in one transaction
        const { data: rpcResult, error: rpcError } = await supabase.rpc('request_withdrawal', {
            p_amount: amount,
            p_bank_name: bankName,
            p_account_name: accountName,
            p_account_number: accountNumber
        })

        if (rpcError) {
            if (rpcError.code === '42883' || rpcError.message?.includes('does not exist')) {
                throw new Error('Fitur penarikan belum aktif. Hubungi admin.')
            }
            throw new Error(rpcError.message || 'Penarikan gagal')
        }

        return rpcResult
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
    },

    /**
     * Submit a deposit (Admin Fee Payment / Topup)
     * @param {Object} params - Deposit params
     * @param {number} params.amount - Total amount deposited
     * @param {string} params.paymentMethod - 'cash' or 'transfer'
     * @param {string} params.bankName - Optional bank name if transfer
     * @param {File} params.proofFile - File object for the transfer receipt
     */
    async submitDeposit({ amount, paymentMethod, bankName, proofFile }) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        if (!amount || amount < 1000) throw new Error('Minimal setoran adalah Rp 1.000')
        if (amount > 10000000) throw new Error('Maksimal setoran adalah Rp 10.000.000')

        let proofUrl = null;

        // If it's a transfer and we have a file, upload it
        if (paymentMethod === 'transfer' && proofFile) {
            const fileExt = proofFile.name.split('.').pop()
            const fileName = `${user.id}_${Date.now()}.${fileExt}`
            const filePath = `${user.id}/${fileName}` // Organise by user_id

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('deposits')
                .upload(filePath, proofFile, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (uploadError) {
                console.error("Deposit proof upload failed:", uploadError)
                throw new Error('Gagal mengunggah bukti transfer: ' + uploadError.message)
            }

            // Get Public URL
            const { data: publicURLData } = supabase.storage
                .from('deposits')
                .getPublicUrl(filePath)

            proofUrl = publicURLData.publicUrl
        }

        // Insert Record into DB
        const { data, error } = await supabase
            .from('deposits')
            .insert({
                user_id: user.id,
                amount,
                payment_method: paymentMethod,
                bank_name: paymentMethod === 'transfer' ? bankName : null,
                proof_url: proofUrl,
                status: 'pending'
            })
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * Get deposit history (for driver to track previous topup statuses)
     */
    async getDeposits() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data, error } = await supabase
            .from('deposits')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    /**
     * Set wallet PIN (hashed server-side via pgcrypto)
     * @param {string} pin - 4-6 digit PIN
     */
    async setPin(pin) {
        const { data, error } = await supabase.rpc('set_wallet_pin', {
            p_pin: pin
        })
        if (error) throw new Error(error.message || 'Gagal mengatur PIN')
        return data
    },

    /**
     * Verify wallet PIN (checked server-side, hash never exposed)
     * @param {string} pin - PIN to verify
     * @returns {Promise<{valid: boolean, message?: string}>}
     */
    async verifyPin(pin) {
        const { data, error } = await supabase.rpc('verify_wallet_pin', {
            p_pin: pin
        })
        if (error) throw new Error(error.message || 'Gagal memverifikasi PIN')
        return data
    },

    /**
     * Check if user has a PIN set
     * @returns {Promise<boolean>}
     */
    async hasPin() {
        const { data, error } = await supabase.rpc('has_wallet_pin')
        if (error) throw new Error(error.message || 'Gagal memeriksa PIN')
        return data
    }
}

export default walletService
