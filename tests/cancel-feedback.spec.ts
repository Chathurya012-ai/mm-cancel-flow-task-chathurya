import { test, expect } from '@playwright/test';

test.describe('CancelFlowModal - Feedback Cancel', () => {
  test('submits feedback and cancels', async ({ page }) => {
    await page.route('/api/cancel/feedback', route => {
      route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) });
    });
    await page.route('/api/subscription/cancel', route => {
      route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) });
    });
    await page.goto('/profile');
    await page.getByText('Cancel MigrateMate').click();
    await page.getByText('Not using enough').click();
    await page.getByText('Continue').click();
    await page.getByText('Rate 5').click();
    await page.getByText('Submit feedback').click();
    await page.getByText('Confirm cancel').click();
    await expect(page.getByText('Cancel MigrateMate')).toBeVisible();
  });

  test('shows error if feedback API fails', async ({ page }) => {
    await page.route('/api/cancel/feedback', route => {
      route.fulfill({ status: 500, body: JSON.stringify({ error: 'Test error' }) });
    });
    await page.goto('/profile');
    await page.getByText('Cancel MigrateMate').click();
    await page.getByText('Not using enough').click();
    await page.getByText('Continue').click();
    await page.getByText('Rate 5').click();
    await page.getByText('Submit feedback').click();
    await expect(page.getByText(/error/i)).toBeVisible();
  });
});
