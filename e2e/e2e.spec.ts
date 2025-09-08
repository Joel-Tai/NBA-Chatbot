import { test, expect } from '@playwright/test';

test('homepage loads and search works', async ({ page }) => {
  await page.goto('/');
  await page.fill('input[placeholder="Search"]', 'LeBron James stats');
  await page.click('button[type="submit"]');
  await expect(page.locator('text=LeBron James')).toBeVisible();
});