import { describe, it, expect } from 'vitest'
import { calculateDistance, estimateDeliveryTime } from '../driverLocationService'

describe('driverLocationService', () => {
    describe('calculateDistance (Haversine)', () => {
        it('should return 0 for same point', () => {
            const dist = calculateDistance(-6.2, 106.8, -6.2, 106.8)
            expect(dist).toBe(0)
        })

        it('should calculate known distance correctly (Jakarta to Bandung ≈ 120km)', () => {
            // Jakarta: -6.2088, 106.8456
            // Bandung: -6.9175, 107.6191
            const dist = calculateDistance(-6.2088, 106.8456, -6.9175, 107.6191)
            // Should be approximately 120-130 km
            expect(dist).toBeGreaterThan(100)
            expect(dist).toBeLessThan(150)
        })

        it('should calculate short distance (< 5km) for nearby points', () => {
            // Two points ~1km apart in Jakarta
            const dist = calculateDistance(-6.200, 106.845, -6.209, 106.845)
            expect(dist).toBeGreaterThan(0.5)
            expect(dist).toBeLessThan(2)
        })
    })

    describe('estimateDeliveryTime', () => {
        it('should return minimum 1 minute for very short distances', () => {
            const time = estimateDeliveryTime(0.01) // 10 meters
            expect(time).toBe(1)
        })

        it('should estimate ~12 minutes for 5km (at 25km/h)', () => {
            const time = estimateDeliveryTime(5)
            expect(time).toBe(12) // 5/25 * 60 = 12
        })

        it('should estimate ~24 minutes for 10km', () => {
            const time = estimateDeliveryTime(10)
            expect(time).toBe(24) // 10/25 * 60 = 24
        })

        it('should return rounded integer', () => {
            const time = estimateDeliveryTime(3.7)
            expect(Number.isInteger(time)).toBe(true)
        })
    })
})
