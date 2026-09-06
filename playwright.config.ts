import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  testMatch: /.*\.spec\.ts/,
  timeout: 90_000,
  use: { baseURL: 'http://127.0.0.1:4173', headless: true },
  webServer: { command: 'npm run build && node scripts/serve-static.mjs', url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI },
})
