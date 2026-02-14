import { expect, test } from "@playwright/test"

test.describe("auth and access boundaries", () => {
  test("loads register flow entry point", async ({ page }) => {
    await page.goto("/register")
    await expect(page).toHaveURL(/\/register/)
    await expect(page.locator("body")).toContainText(/register|sign up/i)
  })

  test("tenant route returns not found without valid tenant mapping", async ({ page }) => {
    const response = await page.goto("/tenant/non-existent-tenant")
    expect(response?.status()).toBeGreaterThanOrEqual(400)
  })

  test("rbac protected admin route is not publicly routable", async ({ page }) => {
    const response = await page.goto("/admin")
    expect(response?.status()).toBeGreaterThanOrEqual(400)
  })
})
