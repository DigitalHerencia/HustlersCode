"use client"

import MonthlyForecast from "@/components/monthly-forecast"
import { useState, useEffect } from "react"
import { generateDemoData } from "@/lib/demo-data"
import { sampleInventory, sampleCustomers, defaultBusinessData } from "@/lib/data"
import type { BusinessData, InventoryItem, Customer, Transaction } from "@/lib/data"

export default function ForecastPage() {
  const [businessData, setBusinessData] = useState<BusinessData>(defaultBusinessData)
  const [inventory, setInventory] = useState<InventoryItem[]>(sampleInventory)
  const [customers, setCustomers] = useState<Customer[]>(sampleCustomers)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showTips, setShowTips] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  // Generate demo data on first load
  useEffect(() => {
    try {
      const demoData = generateDemoData(100, customers, inventory)

      // Ensure transactions have all required properties
      const safeTransactions = (demoData.transactions || []).map((transaction) => ({
        ...transaction,
        profit: transaction.profit || 0,
        totalPrice: transaction.totalPrice || 0,
        quantityGrams: transaction.quantityGrams || 0,
        // Ensure date exists
        date: transaction.date || new Date().toISOString(),
      }))

      setTransactions(safeTransactions)

      // Ensure customers have all required properties
      const safeCustomers = (demoData.updatedCustomers || sampleCustomers).map((customer) => ({
        ...customer,
        amountOwed: customer.amountOwed || 0,
        dueDate: customer.dueDate || new Date().toISOString().split("T")[0],
      }))

      setCustomers(safeCustomers)

      // Ensure inventory items have all required properties
      const safeInventory = (demoData.updatedInventory || sampleInventory).map((item) => ({
        ...item,
        quantityOz: item.quantityOz || 0,
        initialQuantityOz: item.initialQuantityOz || item.quantityOz || 1, // Prevent division by zero
        costPerOz: item.costPerOz || 0,
      }))

      setInventory(safeInventory)
    } catch (error) {
      console.error("Error generating demo data:", error)
      // Fallback to sample data with safe values
      setCustomers(sampleCustomers.map((c) => ({ ...c, amountOwed: c.amountOwed || 0 })))
      setInventory(
        sampleInventory.map((i) => ({
          ...i,
          quantityOz: i.quantityOz || 0,
          initialQuantityOz: i.initialQuantityOz || i.quantityOz || 1,
        })),
      )
      setTransactions([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleHideTips = () => {
    setShowTips(false)
  }

  return (
    <div className="container py-4">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Loading forecast data...</p>
        </div>
      ) : (
        <MonthlyForecast
          businessData={businessData || defaultBusinessData}
          inventory={inventory || []}
          customers={customers || []}
          transactions={transactions || []}
          retailPricePerGram={100} // Default value
          showTips={showTips}
          onHideTips={handleHideTips}
        />
      )}
    </div>
  )
}
