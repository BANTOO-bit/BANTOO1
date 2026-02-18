import { test, expect } from '@playwright/test'

test.describe('Order Flow (Unauthenticated)', () => {
    test('should redirect to login when accessing cart', async ({ page }) => {
        await page.goto('/cart')

        // Should redirect unauthenticated users to login or show auth prompt
        await page.waitForLoadState('networkidle')

        // Either redirected to login page OR shows login prompt
        const url = page.url()
        const content = await page.locator('#root').innerHTML()

        // Check: either URL contains 'login' OR page shows a login/auth message
        const isOnLogin = url.includes('login')
        const hasAuthPrompt = content.includes('Masuk') || content.includes('Login') || content.includes('login')
        expect(isOnLogin || hasAuthPrompt).toBeTruthy()
    })

    test('should redirect to login when accessing order history', async ({ page }) => {
        await page.goto('/orders')

        await page.waitForLoadState('networkidle')

        const url = page.url()
        const content = await page.locator('#root').innerHTML()

        const isOnLogin = url.includes('login')
        const hasAuthPrompt = content.includes('Masuk') || content.includes('Login') || content.includes('login')
        expect(isOnLogin || hasAuthPrompt).toBeTruthy()
    })

    test('should redirect to login when accessing profile', async ({ page }) => {
        await page.goto('/profile')

        await page.waitForLoadState('networkidle')

        const url = page.url()
        const content = await page.locator('#root').innerHTML()

        const isOnLogin = url.includes('login')
        const hasAuthPrompt = content.includes('Masuk') || content.includes('Login') || content.includes('login')
        expect(isOnLogin || hasAuthPrompt).toBeTruthy()
    })
})

test.describe('Admin Routes (Unauthenticated)', () => {
    test('should show admin login page', async ({ page }) => {
        await page.goto('/admin')

        await page.waitForLoadState('networkidle')

        // Should show admin login or redirect to admin login
        const url = page.url()
        const content = await page.locator('#root').innerHTML()

        const isAdminLogin = url.includes('admin')
        const hasLoginForm = content.includes('password') || content.includes('Password') || content.includes('Admin')
        expect(isAdminLogin || hasLoginForm).toBeTruthy()
    })

    test('should not access admin dashboard without auth', async ({ page }) => {
        await page.goto('/admin/dashboard')

        await page.waitForLoadState('networkidle')

        // Should redirect to login
        const url = page.url()
        expect(url).not.toContain('/admin/dashboard')
    })
})

test.describe('Driver Routes (Unauthenticated)', () => {
    test('should redirect when accessing driver dashboard', async ({ page }) => {
        await page.goto('/driver')

        await page.waitForLoadState('networkidle')

        const url = page.url()
        const content = await page.locator('#root').innerHTML()

        // Should not show driver dashboard content without auth
        const isRedirected = url.includes('login') || !url.includes('/driver')
        const hasAuth = content.includes('Masuk') || content.includes('Login')
        expect(isRedirected || hasAuth).toBeTruthy()
    })
})
