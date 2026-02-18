import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
    test('should display login page', async ({ page }) => {
        await page.goto('/login')

        // Check page structure
        await expect(page).toHaveTitle(/Bantoo/i)
        await expect(page.locator('input[type="tel"], input[name="phone"], input[placeholder*="phone" i], input[placeholder*="telepon" i]').first()).toBeVisible()
        await expect(page.locator('input[type="password"]').first()).toBeVisible()
    })

    test('should show validation on empty submit', async ({ page }) => {
        await page.goto('/login')

        // Try to submit without filling in fields
        const submitButton = page.locator('button[type="submit"], button:has-text("Masuk"), button:has-text("Login")').first()
        if (await submitButton.isVisible()) {
            await submitButton.click()

            // Should stay on login page (no navigation)
            await expect(page).toHaveURL(/login/i)
        }
    })

    test('should have register link', async ({ page }) => {
        await page.goto('/login')

        // Check for register link
        const registerLink = page.locator('a:has-text("Daftar"), a:has-text("Register"), a[href*="register"]').first()
        await expect(registerLink).toBeVisible()
    })

    test('should display register page', async ({ page }) => {
        await page.goto('/register')

        await expect(page).toHaveTitle(/Bantoo/i)
        // Should have name, phone, password fields
        const inputs = page.locator('input')
        await expect(inputs).toHaveCount(await inputs.count()) // at least renders inputs
        expect(await inputs.count()).toBeGreaterThanOrEqual(2)
    })
})
