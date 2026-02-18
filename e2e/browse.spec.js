import { test, expect } from '@playwright/test'

test.describe('Browse & Navigation', () => {
    test('should load homepage', async ({ page }) => {
        await page.goto('/')

        await expect(page).toHaveTitle(/Bantoo/i)
        // Page should render without crashing
        await expect(page.locator('#root')).not.toBeEmpty()
    })

    test('should show app shell elements', async ({ page }) => {
        await page.goto('/')

        // Wait for the app to fully render (not just the root div)
        await page.waitForLoadState('networkidle')

        // The page should have some content rendered by React
        const rootContent = await page.locator('#root').innerHTML()
        expect(rootContent.length).toBeGreaterThan(50)
    })

    test('should navigate to search page', async ({ page }) => {
        await page.goto('/search')

        await expect(page).toHaveTitle(/Bantoo/i)
        await expect(page.locator('#root')).not.toBeEmpty()
    })

    test('should navigate to merchant list/category', async ({ page }) => {
        await page.goto('/restaurants')

        await expect(page).toHaveTitle(/Bantoo/i)
        // Should render the page (may redirect to login if not authenticated)
        await expect(page.locator('#root')).not.toBeEmpty()
    })

    test('should handle 404 routes gracefully', async ({ page }) => {
        await page.goto('/this-page-does-not-exist-12345')

        // App should not crash — should show either 404 page or redirect
        await expect(page.locator('#root')).not.toBeEmpty()
        // Should not show a blank white screen
        const rootContent = await page.locator('#root').innerHTML()
        expect(rootContent.length).toBeGreaterThan(10)
    })

    test('should have working PWA manifest', async ({ page }) => {
        const response = await page.goto('/manifest.json')
        expect(response.status()).toBe(200)

        const manifest = await response.json()
        expect(manifest.name).toContain('BANTOO')
        expect(manifest.icons).toHaveLength(2)
        expect(manifest.display).toBe('standalone')
    })

    test('should have meta tags for SEO', async ({ page }) => {
        await page.goto('/')

        const description = await page.locator('meta[name="description"]').getAttribute('content')
        expect(description).toBeTruthy()
        expect(description.length).toBeGreaterThan(10)

        const themeColor = await page.locator('meta[name="theme-color"]').getAttribute('content')
        expect(themeColor).toBeTruthy()
    })
})
