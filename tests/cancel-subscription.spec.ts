import { test, expect } from '@playwright/test';

test('cancel flow cancels and redirects home', async ({ page }) => {
  await page.goto('http://localhost:3000/');  // ⬅ absolute URL

  await page.getByRole('button', { name: /manage subscription/i }).click();
  await page.getByRole('button', { name: /cancel migrate mate/i }).click();
  // ...
});
