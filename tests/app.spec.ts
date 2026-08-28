import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('@claim:sample-demo one click opens an isolated, complete sample dialog', async ({ page }) => {
  await page.goto('/demo')
  await expect(page.getByText('Demo — sample data, nothing is saved to your real workspace.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Save connection' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible()
  await expect(page.getByText('Server address entry')).toBeVisible()
  const databases = await page.evaluate(async () => (await indexedDB.databases()).map(database => database.name))
  expect(databases).toContain('demo:screen-bridge')
  expect(databases).not.toContain('screen-bridge')
})

test('@claim:keyboard-confirm number then Enter confirms without restarting OCR', async ({ page }) => {
  await page.goto('/demo')
  await page.keyboard.press('1')
  await expect(page.locator('#state')).toHaveText('Selected target 1. Press Enter to hear it.')
  await page.keyboard.press('Enter')
  await expect(page.locator('#state')).toHaveText('Target 1 read aloud.')
  await expect(page.getByText('Reading the crop locally.')).toHaveCount(0)
})

test('@claim:privacy-local the demo makes no cross-origin request and saves separately', async ({ page }) => {
  const external: string[] = []
  page.on('request', request => { if (!request.url().startsWith('http://127.0.0.1:4173') && !request.url().startsWith('blob:')) external.push(request.url()) })
  await page.goto('/demo')
  await page.getByRole('button', { name: 'Save target list locally' }).click()
  await expect(page.locator('#state')).toContainText('Target list saved in the demo workspace')
  expect(external).toEqual([])
  const names = await page.evaluate(async () => (await indexedDB.databases()).map(database => database.name))
  expect(names).toContain('demo:screen-bridge')
  expect(names).not.toContain('screen-bridge')
})

test('@claim:json-export exports an observable target list', async ({ page }) => {
  await page.goto('/demo')
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export JSON' }).click()
  const text = await (await download).createReadStream().then(async stream => { const chunks: Buffer[] = []; for await (const chunk of stream!) chunks.push(chunk); return Buffer.concat(chunks).toString() })
  expect(JSON.parse(text).targets).toEqual(expect.arrayContaining([expect.objectContaining({ label: 'Save connection' })]))
})

test('@claim:offline-reload reloads the demo after its first visit', async ({ context, page }) => {
  const errors: string[] = []
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  await page.goto('/demo')
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null)
  const cached = await page.evaluate(async () => (await caches.open('screen-bridge-v2')).keys().then(keys => keys.map(key => new URL(key.url).pathname)))
  expect(cached.some(path => path.startsWith('/assets/'))).toBe(true)
  await context.setOffline(true)
  await page.reload()
  expect(errors).toEqual([])
  await expect(page.getByRole('heading', { name: 'Reach visual controls with your screen reader.' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Save connection' })).toBeVisible()
})

test('saved target lists can be opened and deleted', async ({ page }) => {
  await page.goto('/demo')
  await page.getByRole('button', { name: 'Save target list locally' }).click()
  await expect(page.getByRole('button', { name: 'Open' })).toBeVisible()
  await page.getByRole('button', { name: 'Delete' }).click()
  await expect(page.getByText('No saved target lists in this demo workspace.')).toBeVisible()
})

test('desktop and 390px day mode have no serious accessibility violations', async ({ page }) => {
  await page.goto('/demo')
  for (const day of [false, true]) {
    if (day) await page.getByRole('button', { name: 'Day mode' }).click()
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
    expect(results.violations.filter(result => ['serious', 'critical'].includes(result.impact || ''))).toEqual([])
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
  const overflow = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, offenders: [...document.querySelectorAll<HTMLElement>('*')].filter(element => element.getBoundingClientRect().right > window.innerWidth + 1).slice(0, 5).map(element => [element.tagName, element.className, element.getBoundingClientRect().right]) }))
  expect(overflow.width <= 390, JSON.stringify(overflow)).toBe(true)
})
