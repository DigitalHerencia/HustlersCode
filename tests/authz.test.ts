import { beforeEach, describe, expect, it, vi } from "vitest"
import { requireAuthorization } from "../lib/authz/guard"
import { setAuthorizationTestContext } from "../lib/authz/context"
import { AuthorizationError } from "../lib/authz/types"

vi.mock("../lib/db", () => {
  return {
    query: vi.fn(),
  }
})

import { query } from "../lib/db"

const mockQuery = vi.mocked(query)

describe("authorization guard", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    setAuthorizationTestContext(null)
  })

  it("denies role escalation when claim role is not bound", async () => {
    setAuthorizationTestContext({
      userId: "user_1",
      tenantId: "tenant_a",
      claimRoles: ["owner"],
    })

    mockQuery.mockResolvedValue({ rows: [{ role_slug: "viewer" }] } as never)

    await expect(requireAuthorization("account:delete")).rejects.toBeInstanceOf(AuthorizationError)
  })

  it("denies operation when no role grants permission", async () => {
    setAuthorizationTestContext({
      userId: "user_2",
      tenantId: "tenant_a",
      claimRoles: ["viewer"],
    })

    mockQuery.mockResolvedValue({ rows: [{ role_slug: "viewer" }] } as never)

    await expect(requireAuthorization("inventory:delete")).rejects.toBeInstanceOf(AuthorizationError)
  })

  it("allows action when claim role and binding both grant permission", async () => {
    setAuthorizationTestContext({
      userId: "user_3",
      tenantId: "tenant_a",
      claimRoles: ["admin"],
    })

    mockQuery.mockResolvedValue({ rows: [{ role_slug: "admin" }] } as never)

    await expect(requireAuthorization("inventory:delete")).resolves.toMatchObject({ tenantId: "tenant_a" })
  })
})
