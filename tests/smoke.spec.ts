import { test, expect } from '@playwright/test';

test('home renders', async ({ page }) => {
  // If you don't have baseURL in playwright.config.ts, keep absolute URL:
  await page.goto('http://localhost:3000/');
  await expect(page.getByRole('heading', { name: /my profile/i })).toBeVisible();
});
