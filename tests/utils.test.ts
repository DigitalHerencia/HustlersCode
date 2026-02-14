import { describe, expect, it } from "vitest"
import { formatCurrency, gramsToOunces, ouncesToGrams } from "@/lib/utils"

describe("utils", () => {
  it("formats currency with fallback for nullish values", () => {
    expect(formatCurrency(undefined)).toBe("$0.00")
    expect(formatCurrency(null)).toBe("$0.00")
    expect(formatCurrency(10.5)).toBe("$10.50")
  })

  it("converts grams and ounces consistently", () => {
    const grams = 56.699
    const ounces = gramsToOunces(grams)

    expect(ounces).toBeCloseTo(2, 5)
    expect(ouncesToGrams(ounces)).toBeCloseTo(grams, 5)
  })
})
