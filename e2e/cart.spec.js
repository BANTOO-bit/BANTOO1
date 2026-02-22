import { test, expect } from '@playwright/test';

test.describe('Cart Flow', () => {
    test('should display empty cart message initially', async ({ page }) => {
        // Navigate straight to the cart page
        await page.goto('/cart');

        // Assumes empty state shows this text or similar
        await expect(page.locator('text=Keranjang Kosong')).toBeVisible({ timeout: 10000 });
    });

    test('should prevent checkout if cart is empty', async ({ page }) => {
        await page.goto('/cart');

        // Check for a disabled checkout button, or verifying the button is missing
        const checkoutButton = page.locator('button', { hasText: 'Pesan Sekarang' });

        // The button might not exist at all when empty, or it might be disabled
        if (await checkoutButton.isVisible()) {
            await expect(checkoutButton).toBeDisabled();
        }
    });
});
