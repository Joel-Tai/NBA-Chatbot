import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'https://joeltai.com/', // Change to your frontend port if needed
    headless: true,
  },
});