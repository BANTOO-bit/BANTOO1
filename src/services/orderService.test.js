import { describe, it, expect, vi, beforeEach } from 'vitest'
import { orderService } from './orderService'
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
            maybeSingle: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            is: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnThis()
        }))
    }
}))

describe('orderService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('createOrder', () => {
        it('should throw "Not authenticated" if user is not logged in', async () => {
            supabase.auth.getUser.mockResolvedValueOnce({ data: { user: null } })
            await expect(orderService.createOrder({})).rejects.toThrow('Not authenticated')
        })

        it('should check if merchant is open before creating order', async () => {
            supabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'test-user-id' } } })
            
            // Mock checkMerchantOpen failing check
            supabase.rpc.mockResolvedValueOnce({ data: { is_open: false, reason: 'Tutup Manual' }, error: null })
            
            await expect(orderService.createOrder({ merchantId: 'm1', items: [] }))
                .rejects.toThrow('Tutup Manual')
        })

        it('should successfully create order if user is authenticated and merchant is open', async () => {
            supabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'test-user-id' } } })
            
            // 1st RPC: check_merchant_open
            supabase.rpc.mockResolvedValueOnce({ data: { is_open: true, reason: null }, error: null })
            
            // 2nd RPC: create_order
            const mockOrderResult = { id: 'order-123', total_amount: 50000 }
            supabase.rpc.mockResolvedValueOnce({ data: mockOrderResult, error: null })

            const result = await orderService.createOrder({
                merchantId: 'm1',
                items: [{ productId: 'p1', quantity: 2 }]
            })

            expect(supabase.rpc).toHaveBeenCalledWith('create_order', expect.any(Object))
            expect(result).toEqual(mockOrderResult)
        })
    })

    describe('cancelOrder', () => {
        it('should not allow cancelling non-cancellable status', async () => {
            const mockQuery = {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValueOnce({ data: { status: 'delivering' }, error: null })
            }
            supabase.from.mockReturnValueOnce(mockQuery)

            await expect(orderService.cancelOrder('order-123', 'Testing'))
                .rejects.toThrow('Pesanan tidak bisa dibatalkan karena sudah berstatus "delivering"')
        })
    })
})
