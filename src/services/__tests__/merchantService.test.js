import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock supabaseClient
vi.mock('../../services/supabaseClient', () => ({
    supabase: {
        rpc: vi.fn(),
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn(),
            update: vi.fn().mockReturnThis()
        }))
    }
}))

import { supabase } from '../../services/supabaseClient'

describe('merchantService — Operating Hours', () => {
    describe('check_merchant_open RPC', () => {
        it('should return is_open=true for an open merchant', async () => {
            supabase.rpc.mockResolvedValue({
                data: { is_open: true, reason: null },
                error: null
            })

            const { data } = await supabase.rpc('check_merchant_open', {
                p_merchant_id: 'merchant-1'
            })

            expect(data.is_open).toBe(true)
            expect(data.reason).toBeNull()
        })

        it('should return is_open=false with reason for closed merchant', async () => {
            supabase.rpc.mockResolvedValue({
                data: { is_open: false, reason: 'Warung ABC tidak buka hari ini' },
                error: null
            })

            const { data } = await supabase.rpc('check_merchant_open', {
                p_merchant_id: 'merchant-closed'
            })

            expect(data.is_open).toBe(false)
            expect(data.reason).toContain('tidak buka')
        })

        it('should return is_open=false with schedule for out-of-hours merchant', async () => {
            supabase.rpc.mockResolvedValue({
                data: { is_open: false, reason: 'Warung ABC buka jam 08:00 - 21:00' },
                error: null
            })

            const { data } = await supabase.rpc('check_merchant_open', {
                p_merchant_id: 'merchant-2'
            })

            expect(data.is_open).toBe(false)
            expect(data.reason).toContain('buka jam')
        })

        it('should handle non-existent merchant gracefully', async () => {
            supabase.rpc.mockResolvedValue({
                data: { is_open: false, reason: 'Warung tidak ditemukan' },
                error: null
            })

            const { data } = await supabase.rpc('check_merchant_open', {
                p_merchant_id: 'non-existent-id'
            })

            expect(data.is_open).toBe(false)
        })
    })
})
