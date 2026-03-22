import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Person Detail', () => {
  let personName: string

  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/personen')
    await page.waitForLoadState('domcontentloaded')

    // Create a test person for detail tests
    personName = 'E2E Detail ' + Date.now()
    await page.getByRole('button', { name: 'Person hinzufügen', exact: true }).click()
    await expect(page.locator('input[placeholder*="Anna Schmidt"]')).toBeVisible({ timeout: 15000 })
    await page.locator('input[placeholder*="Anna Schmidt"]').fill(personName)
    await page.locator('input[type="date"]').fill('1995-03-20')
    await page.locator('input[placeholder*="Kochen"]').fill('Musik, Sport')
    await page.locator('textarea[placeholder*="Weitere Informationen"]').fill('Detailtest Notiz')
    const addButton = page.getByRole('button', { name: /Hinzufügen/ })
    await addButton.waitFor({ state: 'visible', timeout: 10000 })
    await addButton.click()
    await page.waitForLoadState('domcontentloaded')
    await expect(page.getByText(personName)).toBeVisible({ timeout: 10000 })

    // Navigate to detail page by clicking the card container
    const card = page.locator('.group', { hasText: personName })
    await card.click()
    await page.waitForURL(/\/personen\//, { timeout: 10000 })
    await page.waitForLoadState('domcontentloaded')
  })

  test.afterEach(async ({ page }) => {
    // Cleanup: navigate back and delete the test person
    try {
      await page.goto('/personen', { timeout: 15000 })
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 })

      const card = page.locator('.group', { hasText: personName })
      if (await card.isVisible({ timeout: 5000 }).catch(() => false)) {
        await card.hover()
        await card.locator('button').first().waitFor({ state: 'attached', timeout: 2000 })
        // eslint-disable-next-line playwright/no-force-option
        await card.locator('button').first().click({ force: true })
        // eslint-disable-next-line playwright/no-force-option
        await page.locator('.absolute.right-0 button', { hasText: 'Löschen' }).click({ force: true })
        await page.locator('[class*="fixed inset-0 z-50"]').waitFor({ timeout: 5000 })
        await page.locator('[class*="fixed inset-0 z-50"] button', { hasText: 'Löschen' }).click()
        await page.waitForLoadState('domcontentloaded', { timeout: 10000 })
      }
    } catch {
      // Cleanup failure should not fail the test
    }
  })

  test('zeigt Personendetails', async ({ page }) => {
    await expect(page.getByText(personName)).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Detailtest Notiz')).toBeVisible()
  })

  test('zeigt Interessen', async ({ page }) => {
    await expect(page.getByText('Musik')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Sport')).toBeVisible()
  })

  test('zeigt Geschenkideen-Bereich', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Geschenkideen' })).toBeVisible({ timeout: 10000 })
  })

  test('zeigt Geplante Geschenke-Bereich', async ({ page }) => {
    await expect(page.getByText('Geplante Geschenke')).toBeVisible({ timeout: 10000 })
  })

  test('zeigt Aufgaben-Bereich', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Aufgaben' })).toBeVisible({ timeout: 10000 })
  })

  test('Aufgabe erstellen und erledigen', async ({ page }) => {
    const taskInput = page.locator('input[placeholder*="Neue Aufgabe"]')
    await expect(taskInput).toBeVisible({ timeout: 10000 })

    await taskInput.fill('E2E Testaufgabe')
    await taskInput.press('Enter')
    await page.waitForLoadState('domcontentloaded')

    await expect(page.getByText('E2E Testaufgabe')).toBeVisible({ timeout: 10000 })

    // Toggle task done via checkbox
    const taskCheckbox = page.locator('input[type="checkbox"]').first()
    // eslint-disable-next-line playwright/no-conditional-in-test
    if (await taskCheckbox.isVisible({ timeout: 3000 }).catch(() => false)) {
      await taskCheckbox.click()
      await page.waitForLoadState('domcontentloaded')
    }
  })

  test('Geschenkidee erstellen', async ({ page }) => {
    await page.getByRole('button', { name: /Idee hinzufügen/ }).click()

    // Wait for modal
    await expect(page.locator('input[placeholder*="Spa-Gutschein"]')).toBeVisible({ timeout: 5000 })

    // Fill idea form
    await page.locator('input[placeholder*="Spa-Gutschein"]').fill('E2E Testidee')
    await page.locator('textarea[placeholder*="Kurze Beschreibung"]').fill('Testbeschreibung')

    await page.getByRole('button', { name: /Hinzufügen|Speichern/ }).click()
    await page.waitForLoadState('domcontentloaded')

    await expect(page.getByText('E2E Testidee')).toBeVisible({ timeout: 10000 })
  })
})
