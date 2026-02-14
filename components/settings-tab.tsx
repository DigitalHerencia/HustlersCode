"use client"

import { useState, useEffect } from "react"
import { Check, AlertCircle, Shield, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getBusinessData, saveBusinessData, updateBusinessData } from "@/app/actions"
import type { BusinessData, InventoryItem, Customer } from "@/lib/types"
import { HustleTip } from "@/components/hustle-tip"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface SettingsTabProps {
  businessData: BusinessData
  inventory: InventoryItem[]
  customers: Customer[]
  onDataLoaded: (businessData: BusinessData, inventory: InventoryItem[], customers: Customer[]) => void
}

export default function SettingsTab({ businessData, inventory, customers, onDataLoaded }: SettingsTabProps) {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [showTips, setShowTips] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [wholesalePricePerOz, setWholesalePricePerOz] = useState(businessData?.wholesalePricePerOz || 100)
  const [targetProfitPerMonth, setTargetProfitPerMonth] = useState(businessData?.targetProfitPerMonth || 2000)
  const [operatingExpenses, setOperatingExpenses] = useState(businessData?.operatingExpenses || 500)

  // Load business data
  useEffect(() => {
    const loadBusinessData = async () => {
      setIsLoading(true)
      const data = await getBusinessData()
      if (data) {
        setWholesalePricePerOz(data.wholesalePricePerOz)
        setTargetProfitPerMonth(data.targetProfitPerMonth)
        setOperatingExpenses(data.operatingExpenses)
        onDataLoaded(data, inventory, customers)
      }
      setIsLoading(false)
    }

    if (!businessData) {
      void loadBusinessData()
    }
  }, [])

  // Handle save business data
  const handleSaveBusinessData = async () => {
    setIsLoading(true)

    try {
      let updatedData

      if (businessData?.id) {
        // Update existing business data
        updatedData = await updateBusinessData(businessData.id, {
          wholesalePricePerOz,
          targetProfitPerMonth,
          operatingExpenses,
        })
      } else {
        // Create new business data
        updatedData = await saveBusinessData({
          wholesalePricePerOz,
          targetProfitPerMonth,
          operatingExpenses,
        })
      }

      if (updatedData) {
        setMessage({ type: "success", text: "Business data saved successfully" })
        onDataLoaded(updatedData, inventory, customers)
      } else {
        setMessage({ type: "error", text: "Failed to save business data" })
      }
    } catch (error) {
      console.error("Error saving business data:", error)
      setMessage({ type: "error", text: "An error occurred while saving business data" })
    }

    setIsLoading(false)
  }

  return (
    <div className="space-y-4 p-4">
      <div className="text-center mb-4">
        <div className="gangster-gradient text-white py-6 px-4 mb-4 border-gold border-2">
          <h1 className="text-4xl font-bold text-gold graffiti-font text-shadow">SETTINGS</h1>
          <p className="text-white/80 mt-1">SECURE YOUR DATA. PROTECT YOUR EMPIRE.</p>
        </div>

        {showTips && (
          <HustleTip title="DATA SECURITY">
            <p>Keep your business data up to date. Smart hustlers never lose track of their numbers.</p>
            <Button variant="link" className="p-0 h-auto text-gold" onClick={() => setShowTips(false)}>
              Got it
            </Button>
          </HustleTip>
        )}
      </div>

      {message && (
        <Alert
          variant={message.type === "success" ? "default" : "destructive"}
          className={`mb-4 card-sharp ${message.type === "success" ? "bg-money/10 text-money border-money/20" : "bg-blood/10 text-blood border-blood/20"}`}
        >
          {message.type === "success" ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertTitle className="gangster-font">{message.type === "success" ? "SUCCESS" : "ERROR"}</AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Card className="card-hover card-sharp border-gold">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gangster-font text-gold">
              <Shield className="h-5 w-5 mr-2 text-gold" />
              DATA PRIVACY
            </h3>
            <p className="text-sm text-muted-foreground">
              Control how your business data is stored and when it should be automatically deleted for privacy and
              security.
            </p>

            <div className="space-y-4 bg-smoke p-4 rounded-md">
              <div className="flex items-center justify-between">
                <span className="text-sm gangster-font">AUTO-DELETE DATA</span>
                <div className="flex items-center">
                  <Switch id="auto-delete" className="mr-2" />
                  <Label htmlFor="auto-delete" className="text-sm font-medium text-gold">
                    ENABLED
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inactivity-period" className="text-sm gangster-font">
                  DELETE AFTER INACTIVITY PERIOD
                </Label>
                <Select defaultValue="90">
                  <SelectTrigger className="w-full input-sharp">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">6 months</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Your data will be automatically deleted after the selected period of inactivity.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between bg-smoke p-3">
              <span className="text-sm gangster-font">DATA STORAGE</span>
              <span className="text-sm font-medium text-gold">POSTGRES</span>
            </div>

            <div className="flex items-center justify-between bg-smoke p-3">
              <span className="text-sm gangster-font">ENCRYPTION</span>
              <span className="text-sm font-medium text-gold">ENABLED</span>
            </div>

            <Button variant="outline" className="w-full border-gold text-gold hover:bg-gold/10 button-sharp">
              <Trash2 className="h-4 w-4 mr-2" />
              DELETE ALL DATA NOW
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
