import { test, expect } from '@playwright/test';

test.describe('CancelFlowModal - Offer Accept', () => {
  test('accepts offer and closes modal', async ({ page }) => {
    await page.route('/api/cancel/apply-offer', async route => {
      const body = await route.request().postDataJSON();
      expect(body.variant).toBeDefined();
      expect(body.reason).toBeDefined();
      expect(body.price).toBeDefined();
      expect(route.request().headers()['csrf-token']).toBeDefined();
      expect(route.request().headers()['x-csrf-token']).toBeDefined();
      route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) });
    });
    await page.goto('/profile');
    await page.getByText('Cancel MigrateMate').click();
    await page.getByText('Too expensive').click();
    await page.getByText('Continue').click();
    await page.getByText('Yes, I’ll stay').click();
    await expect(page.getByText('Cancel MigrateMate')).toBeVisible();
  });

  test('shows friendly error on non-200', async ({ page }) => {
    await page.route('/api/cancel/apply-offer', route => {
      route.fulfill({ status: 500, body: JSON.stringify({ error: 'Test error' }) });
    });
    await page.goto('/profile');
    await page.getByText('Cancel MigrateMate').click();
    await page.getByText('Too expensive').click();
    await page.getByText('Continue').click();
    await page.getByText('Yes, I’ll stay').click();
    await expect(page.getByText(/Sorry, something went wrong/i)).toBeVisible();
  });
});
