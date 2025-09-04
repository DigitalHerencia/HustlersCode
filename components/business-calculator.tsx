"use client"

import { useState, useEffect } from "react"
import { Package, Users, Settings, TrendingUp, DollarSign } from "lucide-react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { calculatePricePoints } from "@/lib/utils"
import { defaultBusinessData, defaultMarkupPercentages, sampleInventory, sampleCustomers } from "@/lib/data"
import type { BusinessData, PricePoint, InventoryItem, Customer, Transaction } from "@/lib/data"
import SettingsTab from "@/components/settings-tab"
import CustomersTab from "@/components/customers-tab"
import CashRegister from "@/components/cash-register"
import MonthlyForecast from "@/components/monthly-forecast"
import SetupTab from "@/components/setup-tab"
import InventoryManagement from "@/components/inventory-management"

export default function BusinessCalculator() {
  const [activeTab, setActiveTab] = useState("home")
  const [businessData, setBusinessData] = useState<BusinessData>(defaultBusinessData)
  const [pricePoints, setPricePoints] = useState<PricePoint[]>([])
  const [selectedMarkup, setSelectedMarkup] = useState(100) // Default 100% markup
  const [inventory, setInventory] = useState(sampleInventory)
  const [customers, setCustomers] = useState(sampleCustomers)
  const [showTips, setShowTips] = useState(true)
  const [retailPricePerGram, setRetailPricePerGram] = useState(20)
  const [transactions, setTransactions] = useState<Transaction[]>([])

  // Calculate price points when business data changes
  useEffect(() => {
    const newPricePoints = calculatePricePoints(businessData, defaultMarkupPercentages)
    setPricePoints(newPricePoints)
  }, [businessData])

  // Get the selected price point
  const selectedPricePoint = pricePoints.find((p) => p.markupPercentage === selectedMarkup) || pricePoints[2]

  // Handle input changes
  const handleInputChange = (field: keyof BusinessData, value: number) => {
    setBusinessData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle data loaded from Blob storage
  const handleDataLoaded = (
    loadedBusinessData: BusinessData,
    loadedInventory: InventoryItem[],
    loadedCustomers: Customer[],
  ) => {
    setBusinessData(loadedBusinessData)
    setInventory(loadedInventory)
    setCustomers(loadedCustomers)
    setActiveTab("home")
  }

  // Add this function to handle adding a transaction
  const handleAddTransaction = (transaction: Transaction) => {
    setTransactions([transaction, ...transactions])
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Main content area */}
      <div className="flex-1 overflow-y-auto pb-16">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="home" className="m-0 p-4 space-y-4">
            <CashRegister
              inventory={inventory}
              customers={customers}
              retailPricePerGram={retailPricePerGram}
              onUpdateInventory={setInventory}
              onUpdateCustomers={setCustomers}
              onAddTransaction={handleAddTransaction}
              showTips={showTips}
              onHideTips={() => setShowTips(false)}
            />
          </TabsContent>

          <TabsContent value="inventory" className="m-0 p-4 space-y-4">
            <InventoryManagement
              inventory={inventory}
              onUpdateInventory={setInventory}
              onAddTransaction={handleAddTransaction}
              showTips={showTips}
              onHideTips={() => setShowTips(false)}
            />
          </TabsContent>

          <TabsContent value="customers" className="m-0 p-4 space-y-4">
            <CustomersTab
              customers={customers}
              onUpdateCustomers={setCustomers}
              showTips={showTips}
              onHideTips={() => setShowTips(false)}
            />
          </TabsContent>

          <TabsContent value="forecast" className="m-0 p-4 space-y-4">
            <MonthlyForecast
              businessData={businessData}
              inventory={inventory}
              customers={customers}
              transactions={transactions}
              retailPricePerGram={retailPricePerGram}
              showTips={showTips}
              onHideTips={() => setShowTips(false)}
            />
          </TabsContent>

          <TabsContent value="setup" className="m-0 p-4 space-y-4">
            <SetupTab
              businessData={businessData}
              onUpdateBusinessData={setBusinessData}
              retailPricePerGram={retailPricePerGram}
              onUpdateRetailPrice={setRetailPricePerGram}
              showTips={showTips}
              onHideTips={() => setShowTips(false)}
            />
          </TabsContent>

          <TabsContent value="settings" className="m-0">
            <SettingsTab
              businessData={businessData}
              inventory={inventory}
              customers={customers}
              onDataLoaded={handleDataLoaded}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom navigation bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-midnight border-t border-gold">
        <div className="flex justify-around">
          <Button
            variant={activeTab === "home" ? "default" : "ghost"}
            className={`flex-1 flex flex-col items-center py-3 h-auto rounded-none ${
              activeTab === "home" ? "bg-gold text-black" : ""
            }`}
            onClick={() => setActiveTab("home")}
          >
            <DollarSign className="h-5 w-5 mb-1" />
            <span className="text-xs gangster-font">REGISTER</span>
          </Button>
          <Button
            variant={activeTab === "inventory" ? "default" : "ghost"}
            className={`flex-1 flex flex-col items-center py-3 h-auto rounded-none ${
              activeTab === "inventory" ? "bg-gold text-black" : ""
            }`}
            onClick={() => setActiveTab("inventory")}
          >
            <Package className="h-5 w-5 mb-1" />
            <span className="text-xs gangster-font">PRODUCT</span>
          </Button>
          <Button
            variant={activeTab === "customers" ? "default" : "ghost"}
            className={`flex-1 flex flex-col items-center py-3 h-auto rounded-none ${
              activeTab === "customers" ? "bg-gold text-black" : ""
            }`}
            onClick={() => setActiveTab("customers")}
          >
            <Users className="h-5 w-5 mb-1" />
            <span className="text-xs gangster-font">CLIENTS</span>
          </Button>
          <Button
            variant={activeTab === "forecast" ? "default" : "ghost"}
            className={`flex-1 flex flex-col items-center py-3 h-auto rounded-none ${
              activeTab === "forecast" ? "bg-gold text-black" : ""
            }`}
            onClick={() => setActiveTab("forecast")}
          >
            <TrendingUp className="h-5 w-5 mb-1" />
            <span className="text-xs gangster-font">FORECAST</span>
          </Button>
          <Button
            variant={activeTab === "setup" ? "default" : "ghost"}
            className={`flex-1 flex flex-col items-center py-3 h-auto rounded-none ${
              activeTab === "setup" ? "bg-gold text-black" : ""
            }`}
            onClick={() => setActiveTab("setup")}
          >
            <Settings className="h-5 w-5 mb-1" />
            <span className="text-xs gangster-font">SETUP</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

// Helper component for the plus icon
function Plus({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}
