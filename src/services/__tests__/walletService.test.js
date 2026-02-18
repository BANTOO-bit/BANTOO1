import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock supabaseClient
vi.mock('../../services/supabaseClient', () => ({
    supabase: {
        auth: {
            getUser: vi.fn()
        },
        rpc: vi.fn(),
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn()
        }))
    }
}))

import { supabase } from '../../services/supabaseClient'

describe('walletService', () => {
    let walletService

    beforeEach(async () => {
        vi.clearAllMocks()
        // Dynamic import to reset module state
        const mod = await import('../../services/walletService')
        walletService = mod.walletService || mod.default
    })

    describe('requestWithdrawal', () => {
        it('should call request_withdrawal RPC with correct parameters', async () => {
            supabase.auth.getUser.mockResolvedValue({
                data: { user: { id: 'user-123' } }
            })
            supabase.rpc.mockResolvedValue({
                data: { success: true, withdrawal_id: 'wd-1' },
                error: null
            })

            const result = await walletService.requestWithdrawal({
                amount: 50000,
                bankName: 'BCA',
                accountName: 'John Doe',
                accountNumber: '1234567890'
            })

            expect(supabase.rpc).toHaveBeenCalledWith('request_withdrawal', {
                p_amount: 50000,
                p_bank_name: 'BCA',
                p_account_name: 'John Doe',
                p_account_number: '1234567890'
            })
            expect(result).toEqual({ success: true, withdrawal_id: 'wd-1' })
        })

        it('should throw error on insufficient balance', async () => {
            supabase.auth.getUser.mockResolvedValue({
                data: { user: { id: 'user-123' } }
            })
            supabase.rpc.mockResolvedValue({
                data: null,
                error: { message: 'Saldo tidak mencukupi', code: 'P0001' }
            })

            await expect(walletService.requestWithdrawal({
                amount: 999999,
                bankName: 'BCA',
                accountName: 'John',
                accountNumber: '123'
            })).rejects.toThrow('Saldo tidak mencukupi')
        })

        it('should reject if not authenticated', async () => {
            supabase.auth.getUser.mockResolvedValue({
                data: { user: null }
            })

            await expect(walletService.requestWithdrawal({
                amount: 50000,
                bankName: 'BCA',
                accountName: 'John',
                accountNumber: '123'
            })).rejects.toThrow()
        })
    })
})
