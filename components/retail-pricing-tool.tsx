"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PriceTable from "@/components/price-table"
import PriceCharts from "@/components/price-charts"
import { calculatePricePoints, formatCurrency } from "@/lib/utils"
import { defaultMarkupPercentages, type PricePoint, type BusinessData } from "@/lib/data"
import { HustleTip } from "@/components/hustle-tip"
import { DollarSign, TrendingUp, Percent, Database, Calculator, BarChart4, Table, Settings, Save } from "lucide-react"
import { updateBusinessData, saveBusinessData } from "@/lib/facade/server"

const formSchema = z.object({
  wholesalePrice: z.coerce.number().positive("Wholesale price must be positive"),
  unit: z.enum(["gram", "ounce"]),
  targetProfit: z.coerce.number().positive("Target profit must be positive"),
  operatingExpenses: z.coerce.number().nonnegative("Operating expenses must be zero or positive"),
})

interface RetailPricingToolProps {
  businessData?: BusinessData
  pricePoints?: PricePoint[]
  selectedPricePointId?: string | null
  onPricePointsUpdate?: (points: PricePoint[]) => void
  onPricePointSelect?: (id: string) => void
  showTips?: boolean
  onHideTips?: () => void
}

export default function RetailPricingTool({
  businessData,
  pricePoints = [],
  selectedPricePointId = null,
  onPricePointsUpdate = () => {},
  onPricePointSelect = () => {},
  showTips = true,
  onHideTips = () => {},
}: RetailPricingToolProps) {
  const [localPricePoints, setLocalPricePoints] = useState<PricePoint[]>(pricePoints)
  const [localSelectedPricePointId, setLocalSelectedPricePointId] = useState<string | null>(selectedPricePointId)
  const [markupPercentages, setMarkupPercentages] = useState<number[]>(defaultMarkupPercentages)
  const [activeView, setActiveView] = useState<"table" | "charts">("table")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [activeTab, setActiveTab] = useState("calculator")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      wholesalePrice: businessData?.wholesalePricePerOz || 100,
      unit: "ounce",
      targetProfit: businessData?.targetProfitPerMonth || 2000,
      operatingExpenses: businessData?.operatingExpenses || 500,
    },
  })

  // Update form when businessData changes
  useEffect(() => {
    if (businessData) {
      form.setValue("wholesalePrice", businessData.wholesalePricePerOz)
      form.setValue("targetProfit", businessData.targetProfitPerMonth)
      form.setValue("operatingExpenses", businessData.operatingExpenses)
    }
  }, [businessData, form])

  // Calculate price points when form values change
  const calculatePrices = (data: z.infer<typeof formSchema>) => {
    const { wholesalePrice, unit, targetProfit, operatingExpenses } = data

    // Create a businessData object using current state
    const tempBusinessData: BusinessData = {
      wholesalePricePerOz: unit === "ounce" ? wholesalePrice : wholesalePrice * 28.35,
      targetProfitPerMonth: targetProfit,
      operatingExpenses: operatingExpenses,
    }

    const newPricePoints = calculatePricePoints(tempBusinessData, markupPercentages)
    setLocalPricePoints(newPricePoints)
    onPricePointsUpdate(newPricePoints)

    // Select the middle price point by default
    if (newPricePoints.length > 0) {
      const middleIndex = Math.floor(newPricePoints.length / 2)
      setLocalSelectedPricePointId(newPricePoints[middleIndex].id)
      onPricePointSelect(newPricePoints[middleIndex].id)
    }

    // Switch to results tab after calculation
    setActiveTab("results")
  }

  // Initial calculation
  useEffect(() => {
    const values = form.getValues()
    calculatePrices(values)
  }, [])

  // Handle price point selection
  const handlePricePointSelect = (id: string) => {
    setLocalSelectedPricePointId(id)
    onPricePointSelect(id)
  }

  const selectedPricePoint =
    localPricePoints.find((p) => p.id === localSelectedPricePointId) ||
    (localPricePoints.length > 0 ? localPricePoints[Math.floor(localPricePoints.length / 2)] : null)

  const handleSaveBusinessData = async () => {
    setIsLoading(true)
    setIsSaved(false)

    try {
      const values = form.getValues()
      const dataToSave = {
        wholesalePricePerOz: values.unit === "ounce" ? values.wholesalePrice : values.wholesalePrice * 28.35,
        targetProfitPerMonth: values.targetProfit,
        operatingExpenses: values.operatingExpenses,
      }

      let updatedData

      if (businessData?.id) {
        // Update existing business data
        updatedData = await updateBusinessData(businessData.id, dataToSave)
      } else {
        // Create new business data
        updatedData = await saveBusinessData(dataToSave)
      }

      if (updatedData) {
        // Handle success
        setIsSaved(true)
        setTimeout(() => setIsSaved(false), 3000)
      }
    } catch (error) {
      console.error("Error saving business data:", error)
    }

    setIsLoading(false)
  }

  // Combined function to calculate and save
  const handleCalculateAndSave = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    setIsSaved(false)

    // First calculate prices
    calculatePrices(data)

    // Then save the data
    try {
      const dataToSave = {
        wholesalePricePerOz: data.unit === "ounce" ? data.wholesalePrice : data.wholesalePrice * 28.35,
        targetProfitPerMonth: data.targetProfit,
        operatingExpenses: data.operatingExpenses,
      }

      let updatedData

      if (businessData?.id) {
        // Update existing business data
        updatedData = await updateBusinessData(businessData.id, dataToSave)
      } else {
        // Create new business data
        updatedData = await saveBusinessData(dataToSave)
      }

      if (updatedData) {
        // Handle success
        setIsSaved(true)
        setTimeout(() => setIsSaved(false), 3000)
      }
    } catch (error) {
      console.error("Error saving business data:", error)
    }

    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <div className="gangster-gradient text-white py-6 px-4 mb-4 border-gold border-2">
          <h1 className="text-4xl font-bold text-gold graffiti-font text-shadow">PRICING</h1>
          <p className="text-white/80 mt-1">SET YOUR PRICES. MAXIMIZE YOUR PROFITS.</p>
        </div>

        {showTips && (
          <HustleTip title="STRATEGY">
            <p>
              Your pricing strategy directly impacts your bottom line. Find the sweet spot between volume and margin.
              Too high, and you lose customers. Too low, and you leave money on the table.
            </p>
            <Button variant="link" className="p-0 h-auto text-gold" onClick={onHideTips}>
              Got it
            </Button>
          </HustleTip>
        )}
      </div>

      <Card className="card-hover card-sharp border-gold">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="gangster-font text-gold flex items-center">
              <Calculator className="h-5 w-5 mr-2 text-gold" />
              PRICING CALCULATOR
            </CardTitle>
          </div>
          <CardDescription>Configure your business settings and see optimal pricing strategies</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-black border border-gold mb-6 grid grid-cols-2 w-full max-w-md mx-auto">
              <TabsTrigger value="calculator" className="data-[state=active]:bg-gold data-[state=active]:text-black">
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="results" className="data-[state=active]:bg-gold data-[state=active]:text-black">
                <BarChart4 className="h-4 w-4 mr-1" />
                Results
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calculator" className="mt-0">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCalculateAndSave)} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    {/* Business Settings Column */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold flex items-center gangster-font text-gold">
                          <Database className="h-5 w-5 mr-2 text-gold" />
                          BUSINESS SETTINGS
                        </h3>
                      </div>

                      <div className="bg-smoke p-4 rounded-md">
                        <p className="text-sm mb-4">
                          These settings affect all pricing calculations and are saved to your business profile.
                        </p>

                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="wholesalePrice"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel className="flex items-center gangster-font">
                                  <DollarSign className="h-4 w-4 mr-1 text-gold" />
                                  WHOLESALE PRICE
                                </FormLabel>
                                <div className="flex items-center space-x-2">
                                  <FormControl>
                                    <Input type="number" step="0.01" min="0.01" {...field} className="input-sharp" />
                                  </FormControl>
                                  <FormField
                                    control={form.control}
                                    name="unit"
                                    render={({ field }) => (
                                      <FormItem className="space-y-0 flex-shrink-0">
                                        <FormControl>
                                          <RadioGroup
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            className="flex space-x-2 items-center"
                                          >
                                            <div className="flex items-center space-x-1">
                                              <RadioGroupItem value="gram" id="gram" />
                                              <Label htmlFor="gram" className="text-sm">
                                                Per Gram
                                              </Label>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                              <RadioGroupItem value="ounce" id="ounce" />
                                              <Label htmlFor="ounce" className="text-sm">
                                                Per Ounce
                                              </Label>
                                            </div>
                                          </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="targetProfit"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel className="flex items-center gangster-font">
                                  <TrendingUp className="h-4 w-4 mr-1 text-money" />
                                  TARGET MONTHLY PROFIT
                                </FormLabel>
                                <FormControl>
                                  <Input type="number" step="100" min="100" {...field} className="input-sharp" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="operatingExpenses"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel className="flex items-center gangster-font">
                                  <DollarSign className="h-4 w-4 mr-1 text-gold" />
                                  OPERATING EXPENSES
                                </FormLabel>
                                <FormControl>
                                  <Input type="number" step="100" min="0" {...field} className="input-sharp" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="gangster-font flex items-center">
                                <Percent className="h-4 w-4 mr-1 text-gold" />
                                MARKUP PERCENTAGES
                              </Label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {markupPercentages.map((markup) => (
                                  <div key={markup} className="bg-secondary/20 px-2 py-1 text-sm rounded">
                                    {markup}%
                                  </div>
                                ))}
                              </div>
                            </div>
                            <Button
                              type="submit"
                              className="bg-gold hover:bg-gold/90 text-black button-sharp"
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                "PROCESSING..."
                              ) : (
                                <>
                                  <Save className="h-4 w-4 mr-1" />
                                  SAVE & CALCULATE
                                </>
                              )}
                            </Button>
                          </div>

                          {isSaved && (
                            <div className="mt-4 bg-green-900/20 border border-green-500 text-green-500 p-2 text-center rounded">
                              Settings saved successfully!
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="results" className="mt-0 space-y-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold gangster-font text-gold">PRICING RESULTS</h3>
              </div>

              <div className="bg-smoke p-4 rounded-md mb-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground gangster-font">WHOLESALE PRICE</p>
                    <p className="text-lg font-bold mt-1 gold-text">
                      {formatCurrency(form.getValues().wholesalePrice)}
                      <span className="text-xs ml-1">per {form.getValues().unit}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground gangster-font">TARGET PROFIT</p>
                    <p className="text-lg font-bold mt-1 money-text">
                      {formatCurrency(form.getValues().targetProfit)}
                      <span className="text-xs ml-1">per month</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground gangster-font">EXPENSES</p>
                    <p className="text-lg font-bold mt-1 text-red-500">
                      {formatCurrency(form.getValues().operatingExpenses)}
                      <span className="text-xs ml-1">per month</span>
                    </p>
                  </div>
                </div>
              </div>

              {activeView === "table" ? (
                <div className="bg-black border border-gold rounded-md">
                  <PriceTable
                    pricePoints={localPricePoints}
                    onSelectPricePoint={handlePricePointSelect}
                    selectedPricePointId={localSelectedPricePointId || ""}
                  />
                </div>
              ) : (
                <div className="bg-black border border-gold rounded-md p-4">
                  <PriceCharts pricePoints={localPricePoints} />
                </div>
              )}

              <div className="flex justify-center w-full my-6">
                <div className="grid grid-cols-2 gap-4 w-full">
                  <Button
                    onClick={() => setActiveView("table")}
                    size="sm"
                    className={
                      activeView === "table"
                        ? "bg-gold hover:bg-gold/90 text-black button-sharp"
                        : "bg-transparent border border-gold text-gold hover:bg-gold/10 button-sharp"
                    }
                  >
                    <Table className="h-4 w-4 mr-1" />
                    TABLE
                  </Button>
                  <Button
                    onClick={() => setActiveView("charts")}
                    size="sm"
                    className={
                      activeView === "charts"
                        ? "bg-gold hover:bg-gold/90 text-black button-sharp"
                        : "bg-transparent border border-gold text-gold hover:bg-gold/10 button-sharp"
                    }
                  >
                    <BarChart4 className="h-4 w-4 mr-1" />
                    CHARTS
                  </Button>
                </div>
              </div>

              {selectedPricePoint && (
                <div className="bg-smoke p-4 rounded-md">
                  <h3 className="font-medium gangster-font mb-4 text-gold">SELECTED PRICE POINT</h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground gangster-font">MARKUP</p>
                      <p className="text-xl font-bold mt-1 gold-text">{selectedPricePoint.markupPercentage}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground gangster-font">RETAIL PRICE</p>
                      <p className="text-xl font-bold mt-1 gold-text">
                        {formatCurrency(selectedPricePoint.retailPricePerGram)}
                        <span className="text-xs ml-1">per g</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground gangster-font">MONTHLY REVENUE</p>
                      <p className="text-xl font-bold mt-1 gold-text">
                        {formatCurrency(selectedPricePoint.monthlyRevenue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground gangster-font">MONTHLY PROFIT</p>
                      <p className="text-xl font-bold mt-1 money-text">
                        {formatCurrency(selectedPricePoint.monthlyProfit)}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 border border-gold/30 rounded">
                    <h4 className="font-medium gangster-font mb-2">PRICING RECOMMENDATION</h4>
                    <p className="text-sm">
                      {selectedPricePoint.markupPercentage > 120
                        ? "Premium pricing strategy. High margins but may limit volume. Best for exclusive products or loyal customer base."
                        : selectedPricePoint.markupPercentage > 80
                          ? "Balanced pricing strategy. Good margins with reasonable volume. Recommended for most businesses."
                          : "Value pricing strategy. Lower margins but potentially higher volume. Consider if you need to build market share."}
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
