import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock supabase client before importing the service
vi.mock('../supabaseClient', () => ({
    supabase: {
        auth: {
            getUser: vi.fn()
        },
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            single: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            gte: vi.fn().mockReturnThis(),
            lte: vi.fn().mockReturnThis(),
        })),
        rpc: vi.fn()
    }
}))

import { orderService } from '../orderService'
import { supabase } from '../supabaseClient'

describe('orderService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('createOrder', () => {
        it('should call RPC create_order (server-side), NOT client-side fallback', async () => {
            // Setup auth
            supabase.auth.getUser.mockResolvedValue({
                data: { user: { id: 'user-123' } }
            })

            // Mock RPC: first call = check_merchant_open, second = create_order
            const mockOrderResult = { id: 'order-abc', status: 'pending' }
            supabase.rpc
                .mockResolvedValueOnce({ data: { is_open: true, reason: null }, error: null }) // check_merchant_open
                .mockResolvedValueOnce({ data: mockOrderResult, error: null }) // create_order

            const result = await orderService.createOrder({
                merchantId: 'merchant-1',
                items: [{ productId: 'item-1', quantity: 2, notes: '' }],
                deliveryAddress: 'Jl. Test 123',
                customerName: 'Test User',
                customerPhone: '081234567890',
                paymentMethod: 'cod'
            })

            // Verify check_merchant_open was called first
            expect(supabase.rpc).toHaveBeenCalledWith('check_merchant_open', {
                p_merchant_id: 'merchant-1'
            })

            // Verify create_order was called second
            expect(supabase.rpc).toHaveBeenCalledWith('create_order', expect.objectContaining({
                p_merchant_id: 'merchant-1',
                p_payment_method: 'cod'
            }))

            // Verify RPC items only contain ID+quantity (no price from client)
            const createOrderCall = supabase.rpc.mock.calls[1]
            expect(createOrderCall[1].p_items[0]).toEqual({
                menu_item_id: 'item-1',
                quantity: 2,
                notes: null
            })

            expect(result).toEqual(mockOrderResult)
        })

        it('should throw error when RPC fails (no client fallback)', async () => {
            supabase.auth.getUser.mockResolvedValue({
                data: { user: { id: 'user-123' } }
            })

            supabase.rpc.mockResolvedValue({
                data: null,
                error: { message: 'RPC function not found' }
            })

            await expect(
                orderService.createOrder({
                    merchantId: 'merchant-1',
                    items: [{ productId: 'item-1', quantity: 1 }],
                    deliveryAddress: 'Jl. Test',
                    customerName: 'Test',
                    customerPhone: '08123'
                })
            ).rejects.toThrow('RPC function not found')
        })

        it('should throw error when not authenticated', async () => {
            supabase.auth.getUser.mockResolvedValue({
                data: { user: null }
            })

            await expect(
                orderService.createOrder({ merchantId: 'x', items: [] })
            ).rejects.toThrow('Not authenticated')
        })
    })
})
