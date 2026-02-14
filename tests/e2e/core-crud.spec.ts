import { expect, test } from "@playwright/test"

const coreRoutes = ["/inventory", "/customers", "/settings"]

test.describe("core CRUD route readiness", () => {
  for (const route of coreRoutes) {
    test(`route ${route} renders for CRUD workflows`, async ({ page }) => {
      await page.goto(route)
      await expect(page).toHaveURL(new RegExp(`${route.replace("/", "\\/")}`))
      await expect(page.locator("main, body").first()).toBeVisible()
    })
  }
})
