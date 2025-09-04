"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs"
import RetailPricingTool from "@/components/retail-pricing-tool"
import SettingsTab from "@/components/settings-tab"
import { defaultBusinessData, sampleInventory, sampleCustomers } from "@/lib/data"
import type { BusinessData, PricePoint, InventoryItem, Customer } from "@/lib/data"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "pricing">("general")
  const [businessData, setBusinessData] = useState<BusinessData>(defaultBusinessData)
  const [inventory, setInventory] = useState<InventoryItem[]>(sampleInventory)
  const [customers, setCustomers] = useState<Customer[]>(sampleCustomers)
  const [pricePoints, setPricePoints] = useState<PricePoint[]>([])
  const [selectedPricePointId, setSelectedPricePointId] = useState<string | null>(null)
  const [showTips, setShowTips] = useState(true)

  const handleDataLoad = (
    loadedBusinessData: BusinessData,
    loadedInventory: InventoryItem[],
    loadedCustomers: Customer[],
  ) => {
    setBusinessData(loadedBusinessData || defaultBusinessData)
    setInventory(loadedInventory || sampleInventory)
    setCustomers(loadedCustomers || sampleCustomers)
  }

  const handlePricePointsUpdate = (points: PricePoint[]) => {
    setPricePoints(points || [])
    if (points && points.length > 0 && !selectedPricePointId) {
      setSelectedPricePointId(points[0].id)
    }
  }

  const handlePricePointSelect = (id: string) => {
    setSelectedPricePointId(id)
  }

  const handleHideTips = () => {
    setShowTips(false)
  }

  return (
    <div className="container py-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="hidden">{/* Triggers removed as requested */}</TabsList>

        <TabsContent value="general" className="mt-4">
          <SettingsTab
            businessData={businessData}
            inventory={inventory}
            customers={customers}
            onDataLoaded={handleDataLoad}
          />
        </TabsContent>

        <TabsContent value="pricing" className="mt-4">
          <RetailPricingTool
            businessData={businessData}
            pricePoints={pricePoints}
            selectedPricePointId={selectedPricePointId}
            onPricePointsUpdate={handlePricePointsUpdate}
            onPricePointSelect={handlePricePointSelect}
            showTips={showTips}
            onHideTips={handleHideTips}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
