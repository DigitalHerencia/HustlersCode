import { beforeEach, describe, expect, it, vi } from "vitest"

const revalidatePathMock = vi.fn()

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}))

const txQueries: string[] = []
const queryMock = vi.fn()

vi.mock("@/lib/db", () => ({
  toCamelCase: (value: unknown) => value,
  toSnakeCase: (value: any) =>
    Object.fromEntries(Object.entries(value).map(([key, entryValue]) => [key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`), entryValue])),
  query: queryMock,
  $transaction: async (callback: (client: { query: (text: string, params?: unknown[]) => Promise<{ rows: any[] }> }) => Promise<unknown>) => {
    const client = {
      query: vi.fn(async (text: string) => {
        txQueries.push(text)
        if (text === "BEGIN") {
          return { rows: [] }
        }
        if (text === "COMMIT") {
          return { rows: [] }
        }
        if (text === "ROLLBACK") {
          return { rows: [] }
        }

        if (text.includes("INSERT INTO scenarios")) {
          return { rows: [{ id: "scenario-1" }] }
        }

        if (text.includes("INSERT INTO salespeople")) {
          throw new Error("salesperson insert failed")
        }

        if (text.includes("INSERT INTO transactions")) {
          return { rows: [{ id: "tx-1" }] }
        }

        if (text.includes("SELECT * FROM inventory_items")) {
          return { rows: [{ id: "inventory-1", quantity_g: 5, cost_per_oz: 10 }] }
        }

        if (text.includes("UPDATE inventory_items")) {
          throw new Error("inventory update failed")
        }

        return { rows: [] }
      }),
    }

    await client.query("BEGIN")

    try {
      const result = await callback(client)
      await client.query("COMMIT")
      return result
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    }
  },
}))

describe("rollback behavior for server actions", () => {
  beforeEach(() => {
    txQueries.length = 0
    queryMock.mockReset()
    revalidatePathMock.mockReset()
  })

  it("rolls back createScenario when salesperson insert fails", async () => {
    const { createScenario } = await import("@/app/actions")

    const result = await createScenario({
      name: "Test Scenario",
      description: "demo",
      wholesalePrice: 1,
      retailPrice: 2,
      quantity: 3,
      timePeriod: "daily",
      expenses: 1,
      salespeople: [{ name: "A", commissionRate: 5, salesQuantity: 10 }],
    })

    expect(result).toBeNull()
    expect(txQueries).toContain("ROLLBACK")
    expect(txQueries).not.toContain("COMMIT")
    expect(revalidatePathMock).not.toHaveBeenCalled()
  })

  it("rolls back createTransaction when inventory update fails", async () => {
    const { createTransaction } = await import("@/app/actions")

    const result = await createTransaction({
      date: new Date().toISOString(),
      type: "sale",
      inventoryId: "inventory-1",
      inventoryName: "Inventory",
      quantityGrams: 2,
      pricePerGram: 12,
      totalPrice: 24,
      cost: 10,
      profit: 14,
      paymentMethod: "cash",
      customerId: null,
      customerName: null,
      notes: null,
    })

    expect(result).toBeNull()
    expect(txQueries).toContain("ROLLBACK")
    expect(txQueries).not.toContain("COMMIT")
    expect(revalidatePathMock).not.toHaveBeenCalled()
  })
})
