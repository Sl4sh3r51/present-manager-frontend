import { type Page } from '@playwright/test'

const TEST_EMAIL = 'testing@gmail.com'
const TEST_PASSWORD = 'testing'

/**
 * Logs in via the UI with the default test user.
 * Waits until the redirect away from /login completes.
 */
export async function login(page: Page, email = TEST_EMAIL, password = TEST_PASSWORD) {
  await page.goto('/login')
  await page.locator('#email').waitFor({ timeout: 15000 })
  await page.locator('#email').fill(email)
  await page.locator('#password').fill(password)

  const submitButton = page.locator('button[type="submit"]')
  await submitButton.waitFor({ state: 'visible', timeout: 10000 })
  await submitButton.click()
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30000 })
  await page.waitForLoadState('domcontentloaded')
}
