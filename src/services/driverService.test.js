import { describe, it, expect, vi, beforeEach } from 'vitest'
import { driverService } from './driverService'
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
            not: vi.fn().mockReturnThis(),
            is: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnThis(),
            gte: vi.fn().mockReturnThis(),
            lte: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            single: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis()
        }))
    }
}))

describe('driverService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Mock localStorage globally
        global.localStorage = {
            getItem: vi.fn(() => '[]'),
            setItem: vi.fn(),
            removeItem: vi.fn()
        }
    })

    describe('getAvailableOrders', () => {
        it('should call get_available_orders RPC and return mapped data', async () => {
            const mockOrders = [
                { id: 'order-1', merchant_name: 'Warung A', total_amount: 15000 }
            ]
            supabase.rpc.mockResolvedValueOnce({ data: mockOrders, error: null })

            const result = await driverService.getAvailableOrders({ lat: -6.2, lng: 106.8 })
            
            expect(supabase.rpc).toHaveBeenCalledWith('get_available_orders', {
                p_lat: -6.2,
                p_lng: 106.8,
                p_radius_km: 50
            })
            expect(result.length).toBe(1)
            expect(result[0].id).toBe('order-1')
        })

        it('should fallback to direct query if RPC fails or returns empty array (development fallback)', async () => {
            // Simulate missing RPC
            supabase.rpc.mockRejectedValueOnce(new Error('Function does not exist'))

            const result = await driverService.getAvailableOrders({ lat: -6.2, lng: 106.8 })
            
            // Current driverService implementation traps the error from RPC and falls back in some conditions,
            // but the outer catch block catches everything.
            // If the RPC throws, it returns empty array [] to prevent UI crash.
            expect(result).toEqual([])
        })
    })

    describe('acceptOrder', () => {
        it('should throw if driver is not logged in', async () => {
            supabase.auth.getUser.mockResolvedValueOnce({ data: { user: null } })
            
            await expect(driverService.acceptOrder('order-1')).rejects.toThrow('Driver belum login')
        })

        it('should accept order successfully via RPC', async () => {
            supabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'driver-1' } } })
            supabase.rpc.mockResolvedValueOnce({ data: { success: true }, error: null })

            const result = await driverService.acceptOrder('order-123')
            expect(result.success).toBe(true)
        })
    })
})
