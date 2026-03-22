import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Personen', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/personen')
    await page.waitForLoadState('domcontentloaded')
  })

  test('zeigt Personen-Seite mit Header', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Personen' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Person hinzufügen', exact: true })).toBeVisible()
  })

  test('Suchfeld vorhanden', async ({ page }) => {
    await expect(page.locator('input[placeholder*="Person suchen"]')).toBeVisible()
  })

  test('Person erstellen, prüfen und löschen', async ({ page }) => {
    const personName = 'E2E Testperson ' + Date.now()

    // --- Create ---
    await page.getByRole('button', { name: 'Person hinzufügen', exact: true }).click()
    await expect(page.locator('input[placeholder*="Anna Schmidt"]')).toBeVisible({ timeout: 5000 })

    await page.locator('input[placeholder*="Anna Schmidt"]').fill(personName)
    await page.locator('input[type="date"]').fill('1990-06-15')
    await page.locator('input[placeholder*="Kochen"]').fill('Lesen, Wandern')
    await page.locator('textarea[placeholder*="Weitere Informationen"]').fill('E2E Test Notiz')

    await page.getByRole('button', { name: /Hinzufügen/ }).click()
    await page.waitForLoadState('domcontentloaded')
    await expect(page.getByText(personName)).toBeVisible({ timeout: 10000 })

    // --- Search ---
    await page.locator('input[placeholder*="Person suchen"]').fill('E2E')
    await expect(page.getByText(personName)).toBeVisible()
    await page.locator('input[placeholder*="Person suchen"]').clear()
    await page.waitForLoadState('domcontentloaded')

    // --- Delete ---
    const card = page.locator('.group', { hasText: personName })
    await card.hover()
    // eslint-disable-next-line playwright/no-force-option
    await card.locator('button').first().click({ force: true })

    // Click "Löschen" in dropdown menu
    await page.locator('.absolute.right-0 button', { hasText: 'Löschen' }).click()

    // Wait for confirm dialog and click confirm button
    await page.locator('[class*="fixed inset-0 z-50"]').waitFor({ timeout: 5000 })
    await page.locator('[class*="fixed inset-0 z-50"] button', { hasText: 'Löschen' }).click()
    await page.waitForLoadState('domcontentloaded')
    await expect(page.getByText(personName, { exact: true })).not.toBeVisible({ timeout: 10000 })
  })

  test('Person bearbeiten', async ({ page }) => {
    const personName = 'E2E EditTest ' + Date.now()

    // Create
    await page.getByRole('button', { name: 'Person hinzufügen', exact: true }).click()
    await expect(page.locator('input[placeholder*="Anna Schmidt"]')).toBeVisible({ timeout: 5000 })
    await page.locator('input[placeholder*="Anna Schmidt"]').fill(personName)
    await page.getByRole('button', { name: /Hinzufügen/ }).click()
    await page.waitForLoadState('domcontentloaded')
    await expect(page.getByText(personName)).toBeVisible({ timeout: 10000 })

    // Open 3-dot menu and click "Bearbeiten"
    const card = page.locator('.group', { hasText: personName })
    await card.hover()
    // eslint-disable-next-line playwright/no-force-option
    await card.locator('button').first().click({ force: true })
    await page.getByText('Bearbeiten').click()

    // Wait for edit modal
    await expect(page.getByText('Person bearbeiten')).toBeVisible({ timeout: 5000 })

    const nameInput = page.locator('input[placeholder*="Anna Schmidt"]')
    await nameInput.clear()
    await nameInput.fill(personName + ' Geändert')
    await page.getByRole('button', { name: /Speichern/ }).click()
    await page.waitForLoadState('domcontentloaded')
    await expect(page.getByText(personName + ' Geändert')).toBeVisible({ timeout: 10000 })

    // Cleanup: delete
    const updatedCard = page.locator('.group', { hasText: personName + ' Geändert' })
    await updatedCard.hover()
    // eslint-disable-next-line playwright/no-force-option
    await updatedCard.locator('button').first().click({ force: true })
    await page.locator('.absolute.right-0 button', { hasText: 'Löschen' }).click()
    await page.locator('[class*="fixed inset-0 z-50"]').waitFor({ timeout: 5000 })
    await page.locator('[class*="fixed inset-0 z-50"] button', { hasText: 'Löschen' }).click()
    await page.waitForLoadState('domcontentloaded')
  })
})
