import { describe, it, expect, vi, beforeEach } from 'vitest'
import { walletService } from './walletService'
import { supabase } from './supabaseClient'

// Mock Supabase Client
vi.mock('./supabaseClient', () => ({
    supabase: {
        auth: {
            getUser: vi.fn()
        },
        rpc: vi.fn(),
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            range: vi.fn().mockReturnThis()
        }))
    }
}))

describe('walletService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('getWallet', () => {
        it('should throw if user is not authenticated', async () => {
            supabase.auth.getUser.mockResolvedValueOnce({ data: { user: null } })
            await expect(walletService.getWallet()).rejects.toThrow('Not authenticated')
        })

        it('should fetch user wallet', async () => {
            supabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'req-user-id' } } })
            
            const mockWallet = { id: 'wall-1', balance: 50000 }
            const mockQuery = {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValueOnce({ data: mockWallet, error: null })
            }
            supabase.from.mockReturnValueOnce(mockQuery)

            const result = await walletService.getWallet()
            expect(result).toEqual(mockWallet)
        })
    })

    describe('requestWithdrawal', () => {
        it('should enforce minimum withdrawal limit', async () => {
            supabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } } })
            
            await expect(walletService.requestWithdrawal({
                amount: 5000, 
                bankName: 'BCA', 
                accountName: 'Test', 
                accountNumber: '123'
            })).rejects.toThrow('Minimum penarikan adalah Rp 10.000')
        })

        it('should call request_withdrawal RPC', async () => {
            supabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } } })
            supabase.rpc.mockResolvedValueOnce({ data: { success: true }, error: null })

            const result = await walletService.requestWithdrawal({
                amount: 50000,
                bankName: 'BCA',
                accountName: 'Test User',
                accountNumber: '1234567890'
            })

            expect(supabase.rpc).toHaveBeenCalledWith('request_withdrawal', {
                p_amount: 50000,
                p_bank_name: 'BCA',
                p_account_name: 'Test User',
                p_account_number: '1234567890'
            })
            expect(result.success).toBe(true)
        })
    })
})
