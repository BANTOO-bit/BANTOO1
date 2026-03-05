import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authService } from './authService'
import { supabase } from './supabaseClient'

// Mock the Supabase client
vi.mock('./supabaseClient', () => ({
    supabase: {
        auth: {
            signUp: vi.fn(),
            signInWithPassword: vi.fn(),
            signOut: vi.fn(),
            resetPasswordForEmail: vi.fn(),
            getSession: vi.fn(),
            getUser: vi.fn(),
            updateUser: vi.fn(),
            onAuthStateChange: vi.fn()
        },
        from: vi.fn()
    }
}))

describe('Auth Service Utility', () => {

    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('signInWithPhone', () => {
        const mockPhone = '081234567890'
        const mockPassword = 'password123'
        const mockEmail = 'test@bantoo.com'

        it('looks up email and signs in successfully', async () => {
            // Setup chained mocks for from('profiles').select('email').eq('phone', phone).maybeSingle()
            const mockMaybeSingle = vi.fn().mockResolvedValue({ data: { email: mockEmail }, error: null })
            const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
            const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
            supabase.from.mockReturnValue({ select: mockSelect })

            // Setup auth mock
            supabase.auth.signInWithPassword.mockResolvedValue({
                data: { user: { id: '123' } },
                error: null
            })

            const response = await authService.signInWithPhone(mockPhone, mockPassword)

            expect(supabase.from).toHaveBeenCalledWith('profiles')
            expect(mockEq).toHaveBeenCalledWith('phone', mockPhone)
            expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
                email: mockEmail,
                password: mockPassword
            })
            expect(response.error).toBeNull()
            expect(response.data.user.id).toBe('123')
        })

        it('returns error if profile not found', async () => {
            const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null })
            const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
            const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
            supabase.from.mockReturnValue({ select: mockSelect })

            const response = await authService.signInWithPhone(mockPhone, mockPassword)

            expect(response.error).toBeInstanceOf(Error)
            expect(response.error.message).toContain('Phone number not found')
            expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled()
        })
    })

    describe('signUpWithPhone', () => {
        it('requires email for registration', async () => {
            const response = await authService.signUpWithPhone('08123456789', 'pass', {})
            expect(response.error).toBeInstanceOf(Error)
            expect(response.error.message).toContain('Email is required')
            expect(supabase.auth.signUp).not.toHaveBeenCalled()
        })

        it('calls supabase signUp with mapped options', async () => {
            supabase.auth.signUp.mockResolvedValue({ data: { user: { id: '1' } }, error: null })

            const reqEmail = 'test@user.com'
            const reqPhone = '0812345'
            const reqMeta = { display_name: 'test' }

            const response = await authService.signUpWithPhone(reqPhone, 'pass', reqMeta, reqEmail)

            expect(supabase.auth.signUp).toHaveBeenCalledWith({
                email: reqEmail,
                password: 'pass',
                options: {
                    data: {
                        display_name: 'test',
                        phone_number: reqPhone,
                        email: reqEmail
                    }
                }
            })
            expect(response.data.user.id).toBe('1')
        })
    })

    describe('signOut', () => {
        it('calls supabase auth signOut', async () => {
            supabase.auth.signOut.mockResolvedValue({ error: null })
            const res = await authService.signOut()
            expect(supabase.auth.signOut).toHaveBeenCalled()
            expect(res.error).toBeNull()
        })
    })
})
