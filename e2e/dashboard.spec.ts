import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('zeigt Geburtstage-Widget', async ({ page }) => {
    await expect(page.getByText('Nächste Geburtstage')).toBeVisible({ timeout: 10000 })
  })

  test('zeigt Weihnachtsstatus-Widget mit Statistiken', async ({ page }) => {
    await expect(page.getByText('Weihnachtsstatus')).toBeVisible({ timeout: 10000 })

    // Check stat labels exist
    await expect(page.getByText('Ideen', { exact: true })).toBeVisible()
    await expect(page.getByText('Geplant', { exact: true })).toBeVisible()
    await expect(page.getByText('Gekauft', { exact: true })).toBeVisible()
    await expect(page.getByText('Verschenkt', { exact: true })).toBeVisible()
  })

  test('zeigt Offene Aufgaben-Widget', async ({ page }) => {
    await expect(page.getByText('Offene Aufgaben')).toBeVisible({ timeout: 10000 })
  })

  test('Quick Actions vorhanden', async ({ page }) => {
    await expect(page.getByText('Person hinzufügen')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Geschenkidee hinzufügen')).toBeVisible()
  })
})
