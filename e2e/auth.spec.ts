import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Login', () => {
  test('zeigt Login-Formular', async ({ page }) => {
    await page.goto('/login')

    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toHaveText('Anmelden')
  })

  test('Login mit korrekten Daten leitet zum Dashboard weiter', async ({ page }) => {
    await login(page)

    await expect(page).toHaveURL('/')
  })

  test('Login mit falschen Daten zeigt Fehlermeldung', async ({ page }) => {
    await page.goto('/login')
    await page.locator('#email').fill('wrong@email.de')
    await page.locator('#password').fill('wrongpassword')
    await page.locator('button[type="submit"]').click()

    await expect(page.locator('.bg-red-50')).toBeVisible({ timeout: 10000 })
  })

  test('Link zur Registrierung vorhanden', async ({ page }) => {
    await page.goto('/login')

    const registerLink = page.locator('a[href*="/register"]')
    await expect(registerLink).toBeVisible()
    await expect(registerLink).toHaveText(/Jetzt registrieren/)
  })
})

test.describe('Register', () => {
  test('zeigt Registrierungs-Formular', async ({ page }) => {
    await page.goto('/register')

    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.locator('#password-confirm')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toHaveText('Konto erstellen')
  })

  test('Validierung: Passwörter müssen übereinstimmen', async ({ page }) => {
    await page.goto('/register')

    await page.locator('#email').fill('newuser@test.de')
    await page.locator('#password').fill('password123')
    await page.locator('#password-confirm').fill('different456')
    await page.locator('button[type="submit"]').click()

    // Either the button stays disabled or an error is shown
    const errorVisible = await page.locator('.bg-red-50').isVisible().catch(() => false)
    const buttonDisabled = await page.locator('button[type="submit"]').isDisabled()
    expect(errorVisible || buttonDisabled).toBeTruthy()
  })

  test('Validierung: Passwort mind. 6 Zeichen', async ({ page }) => {
    await page.goto('/register')

    await page.locator('#email').fill('newuser@test.de')
    await page.locator('#password').fill('12345')
    await page.locator('#password-confirm').fill('12345')
    await page.locator('button[type="submit"]').click()

    const errorVisible = await page.locator('.bg-red-50').isVisible().catch(() => false)
    const buttonDisabled = await page.locator('button[type="submit"]').isDisabled()
    expect(errorVisible || buttonDisabled).toBeTruthy()
  })
})
