import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Navigation & Auth-Guard', () => {
  test('Auth-Guard: nicht eingeloggt → Redirect zu /login', async ({ page }) => {
    await page.goto('/')
    await page.waitForURL(/\/login/, { timeout: 10000 })
    await expect(page).toHaveURL(/\/login/)
  })

  test('Auth-Guard: /personen ohne Login → Redirect zu /login', async ({ page }) => {
    await page.goto('/personen')
    await page.waitForURL(/\/login/, { timeout: 10000 })
    await expect(page).toHaveURL(/\/login/)
  })

  test('Auth-Guard: /anlaesse ohne Login → Redirect zu /login', async ({ page }) => {
    await page.goto('/anlaesse')
    await page.waitForURL(/\/login/, { timeout: 10000 })
    await expect(page).toHaveURL(/\/login/)
  })

  test('Auth-Guard: /uebersicht ohne Login → Redirect zu /login', async ({ page }) => {
    await page.goto('/uebersicht')
    await page.waitForURL(/\/login/, { timeout: 10000 })
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe('Navbar', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('zeigt Navbar mit allen Links', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Geschenke-Manager' })).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Personen' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Anlässe' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Übersicht' })).toBeVisible()
  })

  test('Navigation: Dashboard → Personen', async ({ page }) => {
    await page.getByRole('link', { name: 'Personen' }).click()
    await page.waitForURL('/personen', { timeout: 10000 })
    await expect(page).toHaveURL('/personen')
  })

  test('Navigation: Dashboard → Anlässe', async ({ page }) => {
    const anlLink = page.getByRole('link', { name: 'Anlässe' })
    await anlLink.waitFor({ state: 'visible', timeout: 10000 })
    await anlLink.click()
    await page.waitForURL('/anlaesse', { timeout: 10000 })
    await expect(page).toHaveURL('/anlaesse')
  })

  test('Navigation: Dashboard → Übersicht', async ({ page }) => {
    await page.getByRole('link', { name: 'Übersicht' }).click()
    await page.waitForURL('/uebersicht', { timeout: 10000 })
    await expect(page).toHaveURL('/uebersicht')
  })

  test('Logout funktioniert', async ({ page }) => {
    const profileButtons = page.locator('header button')
    const lastButton = profileButtons.last()
    await lastButton.click()

    await page.getByText('Abmelden').click()

    await page.waitForURL(/\/login/, { timeout: 10000 })
    await expect(page).toHaveURL(/\/login/)
  })
})
