"use server"

import { revalidatePath } from "next/cache"
import type { Account, BusinessData, Customer, InventoryItem, Payment, ScenarioData, Transaction } from "@/lib/types"
import {
  createScenario as createScenarioUseCase,
  deleteScenario as deleteScenarioUseCase,
  getBusinessData as getBusinessDataUseCase,
  getScenario as getScenarioUseCase,
  initializeBusinessData,
  listScenarios,
  saveBusinessData as saveBusinessDataUseCase,
  updateBusinessData as updateBusinessDataUseCase,
  updateScenario as updateScenarioUseCase,
} from "@/src/domains/analytics/application/analytics-service"
import {
  createAccount as createAccountUseCase,
  createTransaction as createTransactionUseCase,
  deleteAccount as deleteAccountUseCase,
  listAccounts,
  listTransactions,
  updateAccount as updateAccountUseCase,
} from "@/src/domains/billing/application/billing-service"
import {
  addCustomerPayment,
  createCustomer as createCustomerUseCase,
  deleteCustomer as deleteCustomerUseCase,
  getCustomerDetails,
  listCustomers,
  updateCustomer as updateCustomerUseCase,
} from "@/src/domains/customers/application/customers-service"
import {
  createInventory as createInventoryUseCase,
  deleteInventory as deleteInventoryUseCase,
  listInventoryItems,
  updateInventory as updateInventoryUseCase,
} from "@/src/domains/inventory/application/inventory-service"

export async function getBusinessData(): Promise<BusinessData | null> {
  try {
    return await getBusinessDataUseCase()
  } catch (error) {
    console.error("Error fetching business data:", error)
    return null
  }
}

export async function saveBusinessData(data: Omit<BusinessData, "id" | "createdAt" | "updatedAt">): Promise<BusinessData | null> {
  try {
    const result = await saveBusinessDataUseCase(data)
    revalidatePath("/")
    return result
  } catch (error) {
    console.error("Error saving business data:", error)
    return null
  }
}

export async function updateBusinessData(id: string, data: Partial<BusinessData>): Promise<BusinessData | null> {
  try {
    const result = await updateBusinessDataUseCase(id, data)
    revalidatePath("/")
    return result
  } catch (error) {
    console.error("Error updating business data:", error)
    return null
  }
}

export async function getScenarios(): Promise<ScenarioData[]> {
  try {
    return await listScenarios()
  } catch (error) {
    console.error("Error fetching scenarios:", error)
    return []
  }
}

export async function getScenario(id: string): Promise<ScenarioData | null> {
  try {
    return await getScenarioUseCase(id)
  } catch (error) {
    console.error("Error fetching scenario:", error)
    return null
  }
}

export async function createScenario(data: Omit<ScenarioData, "id" | "createdAt" | "updatedAt">): Promise<ScenarioData | null> {
  try {
    const result = await createScenarioUseCase(data)
    revalidatePath("/")
    return result
  } catch (error) {
    console.error("Error creating scenario:", error)
    return null
  }
}

export async function updateScenario(id: string, data: Partial<ScenarioData>): Promise<ScenarioData | null> {
  try {
    const result = await updateScenarioUseCase(id, data)
    revalidatePath("/")
    return result
  } catch (error) {
    console.error("Error updating scenario:", error)
    return null
  }
}

export async function deleteScenario(id: string): Promise<boolean> {
  try {
    await deleteScenarioUseCase(id)
    revalidatePath("/")
    return true
  } catch (error) {
    console.error("Error deleting scenario:", error)
    return false
  }
}

export async function getInventory(): Promise<InventoryItem[]> {
  try {
    return await listInventoryItems()
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return []
  }
}

export async function createInventoryItem(data: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">): Promise<InventoryItem | null> {
  try {
    const result = await createInventoryUseCase(data)
    revalidatePath("/")
    return result
  } catch (error) {
    console.error("Error creating inventory item:", error)
    return null
  }
}

export async function updateInventoryItem(id: string, data: Partial<InventoryItem>): Promise<InventoryItem | null> {
  try {
    const result = await updateInventoryUseCase(id, data)
    revalidatePath("/")
    return result
  } catch (error) {
    console.error("Error updating inventory item:", error)
    return null
  }
}

export async function deleteInventoryItem(id: string): Promise<boolean> {
  try {
    await deleteInventoryUseCase(id)
    revalidatePath("/")
    return true
  } catch (error) {
    console.error("Error deleting inventory item:", error)
    return false
  }
}

export async function getCustomers(): Promise<Customer[]> {
  try {
    return await listCustomers()
  } catch (error) {
    console.error("Error fetching customers:", error)
    return []
  }
}

export async function getCustomer(id: string): Promise<Customer | null> {
  try {
    return await getCustomerDetails(id)
  } catch (error) {
    console.error("Error fetching customer:", error)
    return null
  }
}

export async function createCustomer(data: Omit<Customer, "id" | "createdAt" | "updatedAt" | "payments">): Promise<Customer | null> {
  try {
    const result = await createCustomerUseCase(data)
    revalidatePath("/")
    return result
  } catch (error) {
    console.error("Error creating customer:", error)
    return null
  }
}

export async function updateCustomer(id: string, data: Partial<Customer>): Promise<Customer | null> {
  try {
    const result = await updateCustomerUseCase(id, data)
    revalidatePath("/")
    return result
  } catch (error) {
    console.error("Error updating customer:", error)
    return null
  }
}

export async function deleteCustomer(id: string): Promise<boolean> {
  try {
    await deleteCustomerUseCase(id)
    revalidatePath("/")
    return true
  } catch (error) {
    console.error("Error deleting customer:", error)
    return false
  }
}

export async function addPayment(customerId: string, data: Omit<Payment, "id" | "createdAt" | "customerId">): Promise<Payment | null> {
  try {
    const result = await addCustomerPayment(customerId, data)
    revalidatePath("/")
    return result
  } catch (error) {
    console.error("Error adding payment:", error)
    return null
  }
}

export async function getTransactions(): Promise<Transaction[]> {
  try {
    return await listTransactions()
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return []
  }
}

export async function createTransaction(data: Omit<Transaction, "id" | "createdAt">): Promise<Transaction | null> {
  try {
    const result = await createTransactionUseCase(data)
    revalidatePath("/")
    return result
  } catch (error) {
    console.error("Error creating transaction:", error)
    return null
  }
}

export async function getAccounts(): Promise<Account[]> {
  try {
    return await listAccounts()
  } catch (error) {
    console.error("Error fetching accounts:", error)
    return []
  }
}

export async function createAccount(data: Omit<Account, "id" | "createdAt" | "updatedAt">): Promise<Account | null> {
  try {
    const result = await createAccountUseCase(data)
    revalidatePath("/")
    return result
  } catch (error) {
    console.error("Error creating account:", error)
    return null
  }
}

export async function updateAccount(id: string, data: Partial<Account>): Promise<Account | null> {
  try {
    const result = await updateAccountUseCase(id, data)
    revalidatePath("/")
    return result
  } catch (error) {
    console.error("Error updating account:", error)
    return null
  }
}

export async function deleteAccount(id: string): Promise<boolean> {
  try {
    await deleteAccountUseCase(id)
    revalidatePath("/")
    return true
  } catch (error) {
    console.error("Error deleting account:", error)
    return false
  }
}

export async function initializeDefaultBusinessData(): Promise<BusinessData | null> {
  try {
    return await initializeBusinessData()
  } catch (error) {
    console.error("Error initializing default business data:", error)
    return null
  }
}
