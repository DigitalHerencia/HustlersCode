import type { BusinessData } from "@/lib/types"

export function buildDefaultBusinessData(): Omit<BusinessData, "id" | "createdAt" | "updatedAt"> {
  return {
    wholesalePricePerOz: 100,
    targetProfitPerMonth: 2000,
    operatingExpenses: 500,
  }
}
