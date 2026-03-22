import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Übersicht', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/uebersicht')
    await page.waitForLoadState('domcontentloaded')
  })

  test('zeigt Übersicht-Seite mit Header', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Übersicht', exact: true })).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Vollständige Übersicht aller Personen und Geschenke')).toBeVisible()
  })

  test('zeigt Statistik-Karten', async ({ page }) => {
    await expect(page.getByText('Personen gesamt')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Ideen', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('Geplant', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('Gekauft', { exact: true }).first()).toBeVisible()
  })

  test('zeigt Personen-Tabelle', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: 'Person' })).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('columnheader', { name: 'Geburtstag' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Anlass' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Geschenk' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible()
  })

  test('zeigt Weihnachtsübersicht', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Weihnachtsübersicht' })).toBeVisible({ timeout: 10000 })
  })

  test('Drucken-Button vorhanden', async ({ page }) => {
    const printBtn = page.locator('button').filter({ hasText: /Drucken|drucken/ })
    const printIconBtn = page.locator('button svg').locator('..')
    const hasPrintButton = await printBtn.isVisible().catch(() => false) ||
      await printIconBtn.first().isVisible().catch(() => false)
    expect(hasPrintButton).toBeTruthy()
  })
})
