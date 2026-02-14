"use server"

import "server-only"


import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"
import { repositories } from "@/lib/db"
import type { BusinessData, ScenarioData, InventoryItem, Customer, Payment, Transaction, Account } from "@/lib/types"
import { auth } from "@clerk/nextjs/server"


async function requireAuthenticatedUserId(): Promise<string> {
  const { userId } = await auth()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  return userId
}

const isPrismaNotFound = (error: unknown): boolean =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025"

const isPrismaNotFound = (error: unknown): boolean =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025"

// Business Data Actions
export async function getBusinessData(): Promise<BusinessData | null> {
  await requireAuthenticatedUserId()
  try {
    return await repositories.businessData.getLatest()
  } catch (error) {
    console.error("Error fetching business data:", error)
    return null
  }
}

export async function saveBusinessData(
  data: Omit<BusinessData, "id" | "createdAt" | "updatedAt">,
): Promise<BusinessData | null> {
  await requireAuthenticatedUserId()
  try {
    const result = await repositories.businessData.create(data)
    revalidatePath("/")
    return result
  } catch (error) {
    console.error("Error saving business data:", error)
    return null
  }
}

export async function updateBusinessData(id: string, data: Partial<BusinessData>): Promise<BusinessData | null> {
  await requireAuthenticatedUserId()
  try {
    const result = await repositories.businessData.update(id, data)
    revalidatePath("/")
    return result
  } catch (error) {
    console.error("Error updating business data:", error)
    return null
  }
}

// Scenario Actions
export async function getScenarios(): Promise<ScenarioData[]> {
  await requireAuthenticatedUserId()
  try {
    return await repositories.scenarios.list()
  } catch (error) {
    console.error("Error fetching scenarios:", error)
    return []
  }
}

export async function getScenario(id: string): Promise<ScenarioData | null> {
  await requireAuthenticatedUserId()
  try {
    return await repositories.scenarios.getById(id)
  } catch (error) {
    console.error("Error fetching scenario:", error)
    return null
  }
}

export async function createScenario(
  data: Omit<ScenarioData, "id" | "createdAt" | "updatedAt">,
): Promise<ScenarioData | null> {
  await requireAuthenticatedUserId()
  try {
    const result = await repositories.scenarios.create(data)
    revalidatePath("/")
    return result
  } catch (error) {
    console.error("Error creating scenario:", error)
    return null
  }
}

export async function updateScenario(id: string, data: Partial<ScenarioData>): Promise<ScenarioData | null> {
  await requireAuthenticatedUserId()
  try {
    const result = await repositories.scenarios.update(id, data)
    revalidatePath("/")
    return result
  } catch (error) {
    if (isPrismaNotFound(error)) {
      return null
    }
    console.error("Error updating scenario:", error)
    return null
  }
}

export async function deleteScenario(id: string): Promise<boolean> {
  await requireAuthenticatedUserId()
  try {
    await repositories.scenarios.delete(id)
    revalidatePath("/")
    return true
  } catch (error) {
    if (isPrismaNotFound(error)) {
      return false
    }
    console.error("Error deleting scenario:", error)
    return false
  }
}

// Inventory Actions
export async function getInventory(): Promise<InventoryItem[]> {
  await requireAuthenticatedUserId()
  try {
    return await repositories.inventory.list()
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return []
  }
}

export async function createInventoryItem(
  data: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">,
): Promise<InventoryItem | null> {
  await requireAuthenticatedUserId()
  try {
    const result = await repositories.inventory.create(data)
    revalidatePath("/")
    return result
  } catch (error) {
    console.error("Error creating inventory item:", error)
    return null
  }
}

export async function updateInventoryItem(id: string, data: Partial<InventoryItem>): Promise<InventoryItem | null> {
  await requireAuthenticatedUserId()
  try {
    const result = await repositories.inventory.update(id, data)
    revalidatePath("/")
    return result
  } catch (error) {
    if (isPrismaNotFound(error)) {
      return null
    }
    console.error("Error updating inventory item:", error)
    return null
  }
}

export async function deleteInventoryItem(id: string): Promise<boolean> {
  await requireAuthenticatedUserId()
  try {
    await repositories.inventory.delete(id)
    revalidatePath("/")
    return true
  } catch (error) {
    if (isPrismaNotFound(error)) {
      return false
    }
    console.error("Error deleting inventory item:", error)
    return false
  }
}

// Customer Actions
export async function getCustomers(): Promise<Customer[]> {
  await requireAuthenticatedUserId()
  try {
    return await repositories.customers.list()
  } catch (error) {
    console.error("Error fetching customers:", error)
    return []
  }
}

export async function getCustomer(id: string): Promise<Customer | null> {
  await requireAuthenticatedUserId()
  try {
    return await repositories.customers.getById(id)
  } catch (error) {
    console.error("Error fetching customer:", error)
    return null
  }
}

export async function createCustomer(
  data: Omit<Customer, "id" | "createdAt" | "updatedAt" | "payments">,
): Promise<Customer | null> {
  await requireAuthenticatedUserId()
  try {
    const result = await repositories.customers.create(data)
    revalidatePath("/")
    return result
  } catch (error) {
    console.error("Error creating customer:", error)
    return null
  }
}

export async function updateCustomer(id: string, data: Partial<Customer>): Promise<Customer | null> {
  await requireAuthenticatedUserId()
  try {
    const result = await repositories.customers.update(id, data)
    revalidatePath("/")
    return result
  } catch (error) {
    if (isPrismaNotFound(error)) {
      return null
    }
    console.error("Error updating customer:", error)
    return null
  }
}

export async function deleteCustomer(id: string): Promise<boolean> {
  await requireAuthenticatedUserId()
  try {
    await repositories.customers.delete(id)
    revalidatePath("/")
    return true
  } catch (error) {
    if (isPrismaNotFound(error)) {
      return false
    }
    console.error("Error deleting customer:", error)
    return false
  }
}

// Payment Actions
export async function addPayment(
  customerId: string,
  data: Omit<Payment, "id" | "createdAt" | "customerId">,
): Promise<Payment | null> {
  await requireAuthenticatedUserId()
  try {
    const result = await repositories.customers.addPayment(customerId, data)
    revalidatePath("/")
    return result
  } catch (error) {
    console.error("Error adding payment:", error)
    return null
  }
}

// Transaction Actions
export async function getTransactions(): Promise<Transaction[]> {
  await requireAuthenticatedUserId()
  try {
    return await repositories.transactions.list()
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return []
  }
}

export async function createTransaction(data: Omit<Transaction, "id" | "createdAt">): Promise<Transaction | null> {
  await requireAuthenticatedUserId()
  try {
    const result = await repositories.transactions.create(data)
    revalidatePath("/")
    return result
  } catch (error) {
    console.error("Error creating transaction:", error)
    return null
  }
}

// Account Actions
export async function getAccounts(): Promise<Account[]> {
  await requireAuthenticatedUserId()
  try {
    return await repositories.accounts.list()
  } catch (error) {
    console.error("Error fetching accounts:", error)
    return []
  }
}

export async function createAccount(data: Omit<Account, "id" | "createdAt" | "updatedAt">): Promise<Account | null> {
  await requireAuthenticatedUserId()
  try {
    const result = await repositories.accounts.create(data)
    revalidatePath("/")
    return result
  } catch (error) {
    console.error("Error creating account:", error)
    return null
  }
}

export async function updateAccount(id: string, data: Partial<Account>): Promise<Account | null> {
  await requireAuthenticatedUserId()
  try {
    const result = await repositories.accounts.update(id, data)
    revalidatePath("/")
    return result
  } catch (error) {
    if (isPrismaNotFound(error)) {
      return null
    }
    console.error("Error updating account:", error)
    return null
  }
}

export async function deleteAccount(id: string): Promise<boolean> {
  await requireAuthenticatedUserId()
  try {
    await repositories.accounts.delete(id)
    revalidatePath("/")
    return true
  } catch (error) {
    if (isPrismaNotFound(error)) {
      return false
    }
    console.error("Error deleting account:", error)
    return false
  }
}

export async function initializeDefaultBusinessData(): Promise<BusinessData | null> {
  await requireAuthenticatedUserId()
  try {
    const existing = await repositories.businessData.getLatest()
    if (existing) {
      return existing
    }
    return await repositories.businessData.create({
      wholesalePricePerOz: 100,
      targetProfitPerMonth: 2000,
      operatingExpenses: 500,
    })
  } catch (error) {
    console.error("Error initializing default business data:", error)
    return null
  }
}
