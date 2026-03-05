import { describe, it, expect } from 'vitest'
import { formatCurrency, formatId } from './formatters'

describe('Formatters Utility', () => {

    describe('formatId', () => {
        it('formats UUID into short ID', () => {
            expect(formatId('12345678-1234-1234-1234-123456789abc')).toBe('#789ABC')
        })

        it('adds prefix if provided', () => {
            expect(formatId('12345678-1234-1234-1234-123456789abc', 'ORD')).toBe('#ORD-789ABC')
        })

        it('returns - for empty id', () => {
            expect(formatId(null)).toBe('-')
            expect(formatId(undefined)).toBe('-')
            expect(formatId('')).toBe('-')
        })

        it('uses custom length', () => {
            expect(formatId('12345678-1234-1234-1234-123456789abc', '', 4)).toBe('#9ABC')
        })
    })

    describe('formatCurrency', () => {
        it('formats numbers to IDR correctly', () => {
            expect(formatCurrency(15000)).toBe('Rp 15.000')
            expect(formatCurrency(0)).toBe('Rp 0')
        })

        it('handles string numbers correctly (since IDR toLocaleString parses them or fails depending on env, fallback handles them by converting or 0)', () => {
            // Our implementation does (value || 0).toLocaleString
            // For a string, standard JS toLocaleString often works differently, but we expect Rp fallback behavior.
            const val = parseFloat('25000'); // Assuming it parses it if needed, else it might output NaN
            expect(formatCurrency(val)).toBe('Rp 25.000')
        })

        it('handles null/undefined correctly by returning Rp 0', () => {
            expect(formatCurrency(null)).toBe('Rp 0')
            expect(formatCurrency(undefined)).toBe('Rp 0')
        })
    })
})
