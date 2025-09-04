"use client"

import CashRegister from "@/components/cash-register"
import { useState, useEffect } from "react"
import { generateDemoData } from "@/lib/demo-data"
import { sampleInventory, sampleCustomers } from "@/lib/data"
import type { Customer, InventoryItem, Transaction } from "@/lib/data"

export default function RegisterPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(sampleInventory)
  const [customers, setCustomers] = useState<Customer[]>(sampleCustomers)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showTips, setShowTips] = useState(true)

  // Generate demo data on first load
  useEffect(() => {
    const demoData = generateDemoData(100, customers, inventory)
    setTransactions(demoData.transactions)
    setCustomers(demoData.updatedCustomers)
    setInventory(demoData.updatedInventory)
  }, [])

  const handleUpdateInventory = (items: InventoryItem[]) => {
    setInventory(items)
  }

  const handleUpdateCustomers = (updatedCustomers: Customer[]) => {
    setCustomers(updatedCustomers)
  }

  const handleAddTransaction = (transaction: Transaction) => {
    setTransactions((prev) => [...prev, transaction])
  }

  const handleHideTips = () => {
    setShowTips(false)
  }

  return (
    <div className="container py-4">
      <CashRegister
        inventory={inventory || []}
        customers={customers || []}
        retailPricePerGram={100} // Default value
        onUpdateInventory={handleUpdateInventory}
        onUpdateCustomers={handleUpdateCustomers}
        onAddTransaction={handleAddTransaction}
        showTips={showTips}
        onHideTips={handleHideTips}
      />
    </div>
  )
}
