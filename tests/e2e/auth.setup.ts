import fs from "node:fs"
import path from "node:path"

import { test as setup } from "@playwright/test"

const authFile = path.join(process.cwd(), "tests/e2e/.auth/user.json")

setup("capture baseline auth state", async ({ page }) => {
  await page.goto("/")

  const authDir = path.dirname(authFile)
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true })
  }

  await page.context().storageState({ path: authFile })
})
