import { test, expect } from '@playwright/test'

test.describe('Order Flow (Unauthenticated)', () => {
    test('should redirect to login when accessing cart', async ({ page }) => {
        await page.goto('/cart')

        // Should eventually land on login page or show an auth prompt (auto-waits up to 5s)
        await expect(
            page.locator('text=/Masuk|Login/i').first()
        ).toBeVisible()
    })

    test('should redirect to login when accessing order history', async ({ page }) => {
        await page.goto('/orders')

        await expect(
            page.locator('text=/Masuk|Login/i').first()
        ).toBeVisible()
    })

    test('should redirect to login when accessing profile', async ({ page }) => {
        await page.goto('/profile')

        await expect(
            page.locator('text=/Masuk|Login/i').first()
        ).toBeVisible()
    })
})

test.describe('Admin Routes (Unauthenticated)', () => {
    test('should show admin login page', async ({ page }) => {
        await page.goto('/admin')

        // Should land on a login page for admin
        await expect(
            page.locator('text=/Masuk|Login|Password/i').first()
        ).toBeVisible()
    })

    test('should not access admin dashboard without auth', async ({ page }) => {
        await page.goto('/admin/dashboard')

        // Should eventually redirect to login or an admin auth page
        await expect(page).toHaveURL(/login|admin(?:$|\/)$/i)
    })
})

test.describe('Driver Routes (Unauthenticated)', () => {
    test('should redirect when accessing driver dashboard', async ({ page }) => {
        await page.goto('/driver')

        await expect(
            page.locator('text=/Masuk|Login/i').first()
        ).toBeVisible()
    })
})
