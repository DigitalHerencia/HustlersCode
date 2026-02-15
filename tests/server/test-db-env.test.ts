import { describe, expect, it } from "vitest"

import { resolveTestDatabaseUrl } from "@/db/test-db"

describe("resolveTestDatabaseUrl", () => {
  it("prefers TEST_DATABASE_URL when present", () => {
    expect(resolveTestDatabaseUrl({ TEST_DATABASE_URL: "postgres://test-db", DATABASE_URL: "postgres://primary-db" })).toBe(
      "postgres://test-db",
    )
  })

  it("falls back to DATABASE_URL", () => {
    expect(resolveTestDatabaseUrl({ DATABASE_URL: "postgres://primary-db" })).toBe("postgres://primary-db")
  })

  it("throws when no database URL exists", () => {
    expect(() => resolveTestDatabaseUrl({})).toThrowError("TEST_DATABASE_URL or DATABASE_URL must be configured")
  })
})
