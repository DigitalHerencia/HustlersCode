"use client"

import CustomersTab from "@/components/customers-tab"
import { useState, useEffect } from "react"
import { generateDemoData } from "@/lib/demo-data"
import type { Customer } from "@/lib/data"

export default function ClientsPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [showTips, setShowTips] = useState(true)

  // Generate demo data on first load
  useEffect(() => {
    try {
      const demoData = generateDemoData()
      setCustomers(demoData.customers || [])
    } catch (error) {
      console.error("Error generating demo data:", error)
      // Fallback to empty array
      setCustomers([])
    }
  }, [])

  const handleUpdateCustomers = (updatedCustomers: Customer[]) => {
    setCustomers(updatedCustomers || [])
  }

  const handleHideTips = () => {
    setShowTips(false)
  }

  return (
    <div className="container py-4">
      <CustomersTab
        customers={customers || []}
        onUpdateCustomers={handleUpdateCustomers}
        showTips={showTips}
        onHideTips={handleHideTips}
      />
    </div>
  )
}
