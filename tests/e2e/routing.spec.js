// @ts-check
import { test, expect } from '@playwright/test';

// Catatan: Karena aplikasi menggunakan AuthContext, user reguler akan di-redirect ke halaman login/register jika memaksa masuk ke rute tertentu.
// Oleh karena itu test default homepage dan ketersediaan public routes.

test.describe('App Routing', () => {
    test('Root URL should render login/register or homepage', async ({ page }) => {
        await page.goto('/');

        // Aplikasi Bantoo secara default / bergantung pada Auth state.
        // Jika tidak login, akan diredirct ke /register atau form Auth.
        // Cek body render (tidak render layar putih mati).
        const bodyContent = await page.textContent('body');

        // Memastikan React Mount berhasil dan VITE ter-serve
        expect(bodyContent).not.toBeNull();
        expect(bodyContent?.length).toBeGreaterThan(100);

        // Secara default title dari index.html adalah BANTOO - Aplikasi UMKM
        await expect(page).toHaveTitle(/Bantoo/i);
    });

    test('Should display App Providers structure internally', async ({ page }) => {
        // Test untuk mengecek fungsionalitas SWR Provider dengan melihat tidak ada crash di DOM utama
        await page.goto('/');

        // Karena render React terjadi di id="root"
        const rootContainer = page.locator('#root');
        await expect(rootContainer).toBeAttached();

        // Tidak boleh ada element Error Boundary yang merender fallback error JS
        const errorBoundaryFlag = await page.getByText(/Terjadi kesalahan/i).count();
        expect(errorBoundaryFlag).toBe(0); // Harus == 0 (Tidak ada komponen crash)
    });
});
