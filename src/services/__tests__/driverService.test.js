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
            in: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            single: vi.fn()
        }))
    }
}))

import { supabase } from '../../services/supabaseClient'

describe('driverService', () => {
    let driverService

    beforeEach(async () => {
        vi.clearAllMocks()
        const mod = await import('../../services/driverService')
        driverService = mod.driverService || mod.default
    })

    describe('acceptOrder', () => {
        it('should call driver_accept_order RPC with order id', async () => {
            supabase.rpc.mockResolvedValue({
                data: { success: true, order_id: 'order-1', active_orders: 1, max_orders: 2 },
                error: null
            })

            const result = await driverService.acceptOrder('order-1')

            expect(supabase.rpc).toHaveBeenCalledWith('driver_accept_order', {
                p_order_id: 'order-1'
            })
            expect(result.success).toBe(true)
            expect(result.active_orders).toBe(1)
        })

        it('should throw if order already taken', async () => {
            supabase.rpc.mockResolvedValue({
                data: null,
                error: { message: 'Pesanan sudah diambil driver lain' }
            })

            await expect(driverService.acceptOrder('order-taken'))
                .rejects.toThrow()
        })

        it('should throw when max concurrent orders reached', async () => {
            supabase.rpc.mockResolvedValue({
                data: null,
                error: { message: 'Anda sudah memiliki 2 pesanan aktif (maks 2)' }
            })

            await expect(driverService.acceptOrder('order-3'))
                .rejects.toThrow()
        })
    })

    describe('getActiveOrders (multi-order)', () => {
        it('should return array of active orders from RPC', async () => {
            supabase.auth.getUser.mockResolvedValue({
                data: { user: { id: 'driver-1' } }
            })
            supabase.rpc.mockResolvedValue({
                data: {
                    orders: [
                        { id: 'order-1', status: 'pickup', merchant_name: 'A' },
                        { id: 'order-2', status: 'delivering', merchant_name: 'B' }
                    ],
                    count: 2
                },
                error: null
            })

            const orders = await driverService.getActiveOrders()

            expect(orders).toHaveLength(2)
            expect(orders[0].id).toBe('order-1')
            expect(orders[1].id).toBe('order-2')
        })

        it('should return empty array when not authenticated', async () => {
            supabase.auth.getUser.mockResolvedValue({
                data: { user: null }
            })

            const orders = await driverService.getActiveOrders()
            expect(orders).toEqual([])
        })
    })

    describe('getActiveOrder (backward compat)', () => {
        it('should return first active order or null', async () => {
            supabase.auth.getUser.mockResolvedValue({
                data: { user: { id: 'driver-1' } }
            })
            supabase.rpc.mockResolvedValue({
                data: {
                    orders: [{ id: 'order-1', status: 'pickup' }],
                    count: 1
                },
                error: null
            })

            const order = await driverService.getActiveOrder()
            expect(order).not.toBeNull()
            expect(order.id).toBe('order-1')
        })

        it('should return null if no active orders', async () => {
            supabase.auth.getUser.mockResolvedValue({
                data: { user: { id: 'driver-1' } }
            })
            supabase.rpc.mockResolvedValue({
                data: { orders: [], count: 0 },
                error: null
            })

            const order = await driverService.getActiveOrder()
            expect(order).toBeNull()
        })
    })
})
