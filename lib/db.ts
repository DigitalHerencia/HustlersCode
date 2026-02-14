import { Prisma, PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import type { Account, BusinessData, Customer, InventoryItem, Payment, ScenarioData, Salesperson, Transaction } from "@/lib/types"

const connectionString = process.env.DATABASE_URL


if (!connectionString) {
  throw new Error("DATABASE_URL is required")
}

const neonAdapter = new PrismaNeon({ connectionString })

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter: neonAdapter,
})

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

export type DbTransaction = Prisma.TransactionClient

export async function withTransaction<T>(callback: (tx: DbTransaction) => Promise<T>): Promise<T> {
  return prisma.$transaction((tx) => callback(tx))
}

const toNumber = (value: Prisma.Decimal | number): number => Number(value)
const toDateOnlyString = (value: Date | null): string | null => (value ? value.toISOString().slice(0, 10) : null)
const toDateOnly = (value?: string | null): Date | null => (value ? new Date(`${value}T00:00:00.000Z`) : null)

function mapBusinessData(record: PrismaBusinessData): BusinessData {
  return {
    id: record.id,
    wholesalePricePerOz: toNumber(record.wholesalePricePerOz),
    targetProfitPerMonth: toNumber(record.targetProfitPerMonth),
    operatingExpenses: toNumber(record.operatingExpenses),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

function mapSalesperson(record: PrismaSalesperson): Salesperson {
  return {
    id: record.id,
    scenarioId: record.scenarioId,
    name: record.name,
    commissionRate: toNumber(record.commissionRate),
    salesQuantity: toNumber(record.salesQuantity),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

function mapScenario(record: PrismaScenarioWithSalespeople): ScenarioData {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    wholesalePrice: toNumber(record.wholesalePrice),
    retailPrice: toNumber(record.retailPrice),
    quantity: toNumber(record.quantity),
    timePeriod: record.timePeriod,
    expenses: toNumber(record.expenses),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    salespeople: record.salespeople.map(mapSalesperson),
  }
}

function mapInventoryItem(record: PrismaInventoryItem): InventoryItem {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    quantityG: toNumber(record.quantityG),
    quantityOz: toNumber(record.quantityOz),
    quantityKg: toNumber(record.quantityKg),
    purchaseDate: toDateOnlyString(record.purchaseDate) ?? new Date().toISOString().slice(0, 10),
    costPerOz: toNumber(record.costPerOz),
    totalCost: toNumber(record.totalCost),
    reorderThresholdG: toNumber(record.reorderThresholdG),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

function mapPayment(record: PrismaPayment): Payment {
  return {
    id: record.id,
    customerId: record.customerId,
    amount: toNumber(record.amount),
    date: toDateOnlyString(record.date) ?? new Date().toISOString().slice(0, 10),
    method: record.method,
    notes: record.notes,
    createdAt: record.createdAt,
  }
}

function mapCustomer(record: PrismaCustomerWithPayments): Customer {
  return {
    id: record.id,
    name: record.name,
    phone: record.phone,
    email: record.email,
    address: record.address,
    amountOwed: toNumber(record.amountOwed),
    dueDate: toDateOnlyString(record.dueDate),
    status: record.status,
    notes: record.notes,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    payments: record.payments.map(mapPayment),
  }
}

function mapTransaction(record: PrismaTransaction): Transaction {
  return {
    id: record.id,
    date: record.date.toISOString(),
    type: record.type,
    inventoryId: record.inventoryId,
    inventoryName: record.inventoryName,
    quantityGrams: toNumber(record.quantityGrams),
    pricePerGram: toNumber(record.pricePerGram),
    totalPrice: toNumber(record.totalPrice),
    cost: toNumber(record.cost),
    profit: toNumber(record.profit),
    paymentMethod: record.paymentMethod,
    customerId: record.customerId,
    customerName: record.customerName,
    notes: record.notes,
    createdAt: record.createdAt,
  }
}

function mapAccount(record: PrismaAccount): Account {
  return {
    id: record.id,
    name: record.name,
    type: record.type,
    balance: toNumber(record.balance),
    description: record.description,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

type PrismaBusinessData = Prisma.BusinessDataGetPayload<Record<string, never>>
type PrismaSalesperson = Prisma.SalespersonGetPayload<Record<string, never>>
type PrismaScenarioWithSalespeople = Prisma.ScenarioGetPayload<{ include: { salespeople: true } }>
type PrismaInventoryItem = Prisma.InventoryItemGetPayload<Record<string, never>>
type PrismaPayment = Prisma.PaymentGetPayload<Record<string, never>>
type PrismaCustomerWithPayments = Prisma.CustomerGetPayload<{ include: { payments: { orderBy: { date: "desc" } } } }>
type PrismaTransaction = Prisma.TransactionGetPayload<Record<string, never>>
type PrismaAccount = Prisma.AccountGetPayload<Record<string, never>>

export const repositories = {
  businessData: {
    async getLatest(): Promise<BusinessData | null> {
      const record = await prisma.businessData.findFirst({ orderBy: { createdAt: "desc" } })
      return record ? mapBusinessData(record) : null
    },
    async create(data: Omit<BusinessData, "id" | "createdAt" | "updatedAt">): Promise<BusinessData> {
      const record = await prisma.businessData.create({
        data: {
          wholesalePricePerOz: data.wholesalePricePerOz,
          targetProfitPerMonth: data.targetProfitPerMonth,
          operatingExpenses: data.operatingExpenses,
        },
      })
      return mapBusinessData(record)
    },
    async update(id: string, data: Partial<BusinessData>): Promise<BusinessData | null> {
      const record = await prisma.businessData.update({
        where: { id },
        data: {
          wholesalePricePerOz: data.wholesalePricePerOz,
          targetProfitPerMonth: data.targetProfitPerMonth,
          operatingExpenses: data.operatingExpenses,
        },
      })
      return mapBusinessData(record)
    },
  },
  scenarios: {
    async list(): Promise<ScenarioData[]> {
      const records = await prisma.scenario.findMany({ include: { salespeople: true }, orderBy: { createdAt: "desc" } })
      return records.map(mapScenario)
    },
    async getById(id: string): Promise<ScenarioData | null> {
      const record = await prisma.scenario.findUnique({ where: { id }, include: { salespeople: true } })
      return record ? mapScenario(record) : null
    },
    async create(data: Omit<ScenarioData, "id" | "createdAt" | "updatedAt">): Promise<ScenarioData> {
      const { salespeople, ...scenario } = data
      const result = await withTransaction(async (tx) => {
        const created = await tx.scenario.create({ data: scenario, include: { salespeople: true } })
        if (salespeople.length > 0) {
          await tx.salesperson.createMany({
            data: salespeople.map((person) => ({
              scenarioId: created.id,
              name: person.name,
              commissionRate: person.commissionRate,
              salesQuantity: person.salesQuantity,
            })),
          })
        }
        return tx.scenario.findUniqueOrThrow({ where: { id: created.id }, include: { salespeople: true } })
      })
      return mapScenario(result)
    },
    async update(id: string, data: Partial<ScenarioData>): Promise<ScenarioData | null> {
      const { salespeople, ...scenario } = data
      const result = await withTransaction(async (tx) => {
        await tx.scenario.update({ where: { id }, data: scenario })
        if (salespeople) {
          await tx.salesperson.deleteMany({ where: { scenarioId: id } })
          if (salespeople.length > 0) {
            await tx.salesperson.createMany({
              data: salespeople.map((person) => ({
                scenarioId: id,
                name: person.name,
                commissionRate: person.commissionRate,
                salesQuantity: person.salesQuantity,
              })),
            })
          }
        }
        return tx.scenario.findUnique({ where: { id }, include: { salespeople: true } })
      })
      return result ? mapScenario(result) : null
    },
    async delete(id: string): Promise<void> {
      await prisma.scenario.delete({ where: { id } })
    },
  },
  inventory: {
    async list(): Promise<InventoryItem[]> {
      const records = await prisma.inventoryItem.findMany({ orderBy: { createdAt: "desc" } })
      return records.map(mapInventoryItem)
    },
    async create(data: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">): Promise<InventoryItem> {
      const record = await prisma.inventoryItem.create({
        data: {
          ...data,
          purchaseDate: toDateOnly(data.purchaseDate) ?? new Date(),
        },
      })
      return mapInventoryItem(record)
    },
    async update(id: string, data: Partial<InventoryItem>): Promise<InventoryItem | null> {
      const record = await prisma.inventoryItem.update({
        where: { id },
        data: {
          ...data,
          purchaseDate:
            data.purchaseDate !== undefined ? toDateOnly(data.purchaseDate) ?? undefined : undefined,
        },
      })
      return mapInventoryItem(record)
    },
    async delete(id: string): Promise<void> {
      await prisma.inventoryItem.delete({ where: { id } })
    },
  },
  customers: {
    async list(): Promise<Customer[]> {
      const records = await prisma.customer.findMany({
        orderBy: { createdAt: "desc" },
        include: { payments: { orderBy: { date: "desc" } } },
      })
      return records.map(mapCustomer)
    },
    async getById(id: string): Promise<Customer | null> {
      const record = await prisma.customer.findUnique({ where: { id }, include: { payments: { orderBy: { date: "desc" } } } })
      return record ? mapCustomer(record) : null
    },
    async create(data: Omit<Customer, "id" | "createdAt" | "updatedAt" | "payments">): Promise<Customer> {
      const record = await prisma.customer.create({
        data: {
          ...data,
          dueDate: toDateOnly(data.dueDate),
        },
        include: { payments: { orderBy: { date: "desc" } } },
      })
      return mapCustomer(record)
    },
    async update(id: string, data: Partial<Customer>): Promise<Customer | null> {
      const { payments: _, ...customerData } = data
      const record = await prisma.customer.update({
        where: { id },
        data: {
          ...customerData,
          dueDate: customerData.dueDate !== undefined ? toDateOnly(customerData.dueDate) : undefined,
        },
        include: { payments: { orderBy: { date: "desc" } } },
      })
      return mapCustomer(record)
    },
    async delete(id: string): Promise<void> {
      await prisma.customer.delete({ where: { id } })
    },
    async addPayment(customerId: string, data: Omit<Payment, "id" | "createdAt" | "customerId">): Promise<Payment> {
      const payment = await withTransaction(async (tx) => {
        const createdPayment = await tx.payment.create({
          data: {
            customerId,
            amount: data.amount,
            date: toDateOnly(data.date) ?? new Date(),
            method: data.method,
            notes: data.notes,
          },
        })

        const customer = await tx.customer.findUnique({ where: { id: customerId } })
        if (customer) {
          const newAmountOwed = Math.max(0, toNumber(customer.amountOwed) - data.amount)
          const newStatus = newAmountOwed === 0 ? "paid" : data.amount > 0 ? "partial" : "unpaid"

          await tx.customer.update({
            where: { id: customerId },
            data: {
              amountOwed: newAmountOwed,
              status: newStatus,
            },
          })
        }

        return createdPayment
      })

      return mapPayment(payment)
    },
  },
  transactions: {
    async list(): Promise<Transaction[]> {
      const records = await prisma.transaction.findMany({ orderBy: { createdAt: "desc" } })
      return records.map(mapTransaction)
    },
    async create(data: Omit<Transaction, "id" | "createdAt">): Promise<Transaction> {
      const created = await withTransaction(async (tx) => {
        const transaction = await tx.transaction.create({
          data: {
            ...data,
            date: new Date(data.date),
          },
        })

        if (data.type === "sale" && data.inventoryId) {
          const inventory = await tx.inventoryItem.findUnique({ where: { id: data.inventoryId } })
          if (inventory) {
            const newQuantityG = Math.max(0, toNumber(inventory.quantityG) - data.quantityGrams)
            const newQuantityOz = newQuantityG / 28.3495
            const newQuantityKg = newQuantityG / 1000
            const newTotalCost = newQuantityOz * toNumber(inventory.costPerOz)

            await tx.inventoryItem.update({
              where: { id: data.inventoryId },
              data: {
                quantityG: newQuantityG,
                quantityOz: newQuantityOz,
                quantityKg: newQuantityKg,
                totalCost: newTotalCost,
              },
            })
          }
        }

        if (data.type === "sale" && data.customerId && data.paymentMethod === "credit") {
          const customer = await tx.customer.findUnique({ where: { id: data.customerId } })
          if (customer) {
            await tx.customer.update({
              where: { id: data.customerId },
              data: {
                amountOwed: toNumber(customer.amountOwed) + data.totalPrice,
                status: "unpaid",
              },
            })
          }
        }

        return transaction
      })

      return mapTransaction(created)
    },
  },
  accounts: {
    async list(): Promise<Account[]> {
      const records = await prisma.account.findMany({ orderBy: { createdAt: "desc" } })
      return records.map(mapAccount)
    },
    async create(data: Omit<Account, "id" | "createdAt" | "updatedAt">): Promise<Account> {
      const record = await prisma.account.create({ data })
      return mapAccount(record)
    },
    async update(id: string, data: Partial<Account>): Promise<Account | null> {
      const record = await prisma.account.update({ where: { id }, data })
      return mapAccount(record)
    },
    async delete(id: string): Promise<void> {
      await prisma.account.delete({ where: { id } })
    },
  },
}
