import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Anlässe', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/anlaesse')
    await page.waitForLoadState('domcontentloaded')
  })

  test('zeigt Anlässe-Seite mit Header', async ({ page }) => {
    await expect(page.getByText('Anlässe verwalten')).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('button', { name: 'Anlass hinzufügen' })).toBeVisible()
  })

  test('zeigt Feste Anlässe', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Feste Anlässe' })).toBeVisible({ timeout: 10000 })
  })

  test('zeigt Benutzerdefinierte Anlässe Bereich', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Benutzerdefinierte Anlässe' })).toBeVisible({ timeout: 10000 })
  })

  test('zeigt Hinweise-Box', async ({ page }) => {
    await expect(page.getByText('Hinweise zu Anlässen')).toBeVisible({ timeout: 10000 })
  })

  test('Anlass erstellen, prüfen und löschen', async ({ page }) => {
    const anlassName = 'E2E Testanlass ' + Date.now()

    // --- Create ---
    await page.getByRole('button', { name: 'Anlass hinzufügen' }).click()
    await expect(page.locator('input[placeholder*="Hochzeitstag"]')).toBeVisible({ timeout: 5000 })

    await page.locator('input[placeholder*="Hochzeitstag"]').fill(anlassName)

    const typeSelect = page.locator('select')
    // eslint-disable-next-line playwright/no-conditional-in-test
    if (await typeSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await typeSelect.selectOption({ label: 'Benutzerdefiniert' })
    }

    await page.getByRole('button', { name: /Hinzufügen|Speichern|Erstellen/ }).click()
    await page.waitForLoadState('domcontentloaded')

    // --- Verify ---
    await expect(page.getByText(anlassName, { exact: true })).toBeVisible({ timeout: 10000 })

    // --- Delete ---
    const occasionCard = page.locator('.group', { hasText: anlassName })
    const deleteBtn = occasionCard.locator('button').last()
    await deleteBtn.click()

    // Wait for confirm dialog and click confirm
    await page.locator('[class*="fixed inset-0 z-50"]').waitFor({ timeout: 5000 })
    await page.locator('[class*="fixed inset-0 z-50"] button', { hasText: 'Löschen' }).click()
    await page.waitForLoadState('domcontentloaded')

    await expect(page.getByText(anlassName, { exact: true })).not.toBeVisible({ timeout: 10000 })
  })

  test('Anlass bearbeiten', async ({ page }) => {
    const anlassName = 'E2E EditAnlass ' + Date.now()

    // Create
    await page.getByRole('button', { name: 'Anlass hinzufügen' }).click()
    await expect(page.locator('input[placeholder*="Hochzeitstag"]')).toBeVisible({ timeout: 5000 })
    await page.locator('input[placeholder*="Hochzeitstag"]').fill(anlassName)

    const typeSelect = page.locator('select')
    // eslint-disable-next-line playwright/no-conditional-in-test
    if (await typeSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await typeSelect.selectOption({ label: 'Benutzerdefiniert' })
    }

    await page.getByRole('button', { name: /Hinzufügen|Speichern|Erstellen/ }).click()
    await page.waitForLoadState('domcontentloaded')
    await expect(page.getByText(anlassName, { exact: true })).toBeVisible({ timeout: 10000 })

    // Edit — click edit button on the occasion card (card has .group class)
    const occasionCard = page.locator('.group', { hasText: anlassName })
    await occasionCard.locator('button').first().click()

    // Wait for edit modal
    await page.locator('[class*="fixed inset-0 z-50"]').waitFor({ timeout: 10000 })
    const nameInput = page.locator('[class*="fixed inset-0 z-50"] input[type="text"]').first()
    await nameInput.clear()
    await nameInput.fill(anlassName + ' Geändert')
    await page.locator('[class*="fixed inset-0 z-50"] button[type="submit"]').click()
    await page.waitForLoadState('domcontentloaded')

    await expect(page.getByText(anlassName + ' Geändert', { exact: true })).toBeVisible({ timeout: 10000 })

    // Cleanup: delete
    const updatedCard = page.locator('.group', { hasText: anlassName + ' Geändert' })
    const delBtn = updatedCard.locator('button').last()
    await delBtn.waitFor({ state: 'visible', timeout: 5000 })
    // eslint-disable-next-line playwright/no-force-option
    await delBtn.click({ force: true })
    await page.locator('[class*="fixed inset-0 z-50"]').waitFor({ timeout: 5000 })
    await page.locator('[class*="fixed inset-0 z-50"] button', { hasText: 'Löschen' }).click()
    await page.waitForLoadState('domcontentloaded')
  })
})
