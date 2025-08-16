import { test, expect } from '@playwright/test';

// Helper to route /api/cancel/variant
import type { Page, Route } from '@playwright/test';
const routeVariant = async (page: Page) => {
  await page.route('**/api/cancel/variant', (route: Route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ offerEligible: true, variant: 'B', price: 15 })
    });
  });
};

// Helper to let /api/cancel/apply-offer pass through
const routeApplyOffer = async (page: Page) => {
  await page.route('**/api/cancel/apply-offer', (route: Route) => route.continue());
};

test.describe('Cancel Flow', () => {
  test('accepts offer for too expensive', async ({ page }) => {
    await routeVariant(page);
    await routeApplyOffer(page);
    await page.goto('/profile');
    await page.getByRole('button', { name: /cancel/i }).click();
    await page.getByText('Too expensive').click();
    await page.getByRole('button', { name: /continue/i }).click();
    await page.getByRole('button', { name: /yes.*stay/i }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(page.getByText(/active/i)).toBeVisible();
  });

  test('submits feedback and cancels', async ({ page }) => {
    await routeVariant(page);
    await routeApplyOffer(page);
    await page.goto('/profile');
    await page.getByRole('button', { name: /cancel/i }).click();
    await page.getByText('Not using enough').click();
    await page.getByRole('button', { name: /continue/i }).click();
    await page.getByRole('button', { name: /^4$/ }).click();
    await page.getByRole('button', { name: /submit feedback/i }).click();
    await page.getByRole('button', { name: /confirm cancel/i }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(page.getByText(/canceled/i)).toBeVisible();
  });
});
