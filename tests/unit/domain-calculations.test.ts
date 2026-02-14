import { describe, expect, it } from "vitest"

import {
  calculatePricePoints,
  cn,
  calculateDerivedValues,
  formatCurrency,
  formatGrams,
  formatKilograms,
  formatOunces,
  formatPercentage,
  gramsToKilograms,
  gramsToOunces,
  kilogramsToGrams,
  ouncesToGrams,
} from "@/lib/utils"

describe("domain math and formatting", () => {
  it("formats nullable numeric inputs safely", () => {
    expect(formatCurrency(undefined)).toBe("$0.00")
    expect(formatCurrency(12.5)).toBe("$12.50")
    expect(formatGrams(null)).toBe("0.00g")
    expect(formatGrams(10)).toBe("10.00g")
    expect(formatKilograms(2)).toBe("2.00kg")
    expect(formatOunces(1.25)).toBe("1.25oz")
    expect(formatPercentage(0.123)).toBe("12%")
  })

  it("converts units consistently", () => {
    expect(gramsToOunces(28.3495)).toBeCloseTo(1)
    expect(ouncesToGrams(1)).toBeCloseTo(28.3495)
    expect(gramsToKilograms(1000)).toBe(1)
    expect(kilogramsToGrams(1.5)).toBe(1500)
  })

  it("calculates derived business values with commission and expenses", () => {
    const result = calculateDerivedValues({
      wholesalePricePerOz: 100,
      retailPricePerGram: 8,
      monthlySalesQuantity: 200,
      operatingExpenses: 300,
      commissionRate: 10,
    })

    expect(result.monthlyRevenue).toBe(1600)
    expect(result.commission).toBe(160)
    expect(result.netProfit).toBeGreaterThan(0)
    expect(result.breakEvenGrams).toBeGreaterThan(0)
  })
})

it("builds deterministic price point arrays", () => {
  const results = calculatePricePoints(
    {
      wholesalePricePerOz: 100,
      targetProfitPerMonth: 2000,
      operatingExpenses: 500,
    },
    [20, 40],
  )

  expect(results).toHaveLength(2)
  expect(results[0].markupPercentage).toBe(20)
  expect(results[0].monthlyProfit).toBeGreaterThan(0)
})

it("merges class names", () => {
  expect(cn("px-2", "py-2", "px-4")).toContain("px-4")
})
