"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DollarSign, TrendingUp, BarChart3, Percent, HelpCircle } from "lucide-react"
import { formatCurrency, formatPercentage, businessConcepts, formatGrams } from "@/lib/utils"
import { HustleTip } from "@/components/hustle-tip"
import type { BusinessData } from "@/lib/data"
import { useInventory } from "@/lib/hooks/use-inventory"

interface SetupTabProps {
  businessData: BusinessData
  onUpdateBusinessData: (data: BusinessData) => void
  retailPricePerGram: number
  onUpdateRetailPrice: (price: number) => void
  showTips: boolean
  onHideTips: () => void
}

export default function SetupTab({
  businessData,
  onUpdateBusinessData,
  retailPricePerGram,
  onUpdateRetailPrice,
  showTips,
  onHideTips,
}: SetupTabProps) {
  const [activeTab, setActiveTab] = useState("pricing")
  const [markupPercentage, setMarkupPercentage] = useState(100)
  const { inventory } = useInventory()

  // Handle input changes for business data
  const handleInputChange = (field: keyof BusinessData, value: number) => {
    onUpdateBusinessData({
      ...businessData,
      [field]: value,
    })
  }

  // Calculate wholesale price per gram
  const wholesalePricePerGram = businessData.wholesalePricePerOz / 28.35

  // Calculate retail price based on markup
  const calculateRetailPrice = (markup: number) => {
    return wholesalePricePerGram * (1 + markup / 100)
  }

  // Update retail price when markup changes
  const handleMarkupChange = (value: number[]) => {
    const markup = value[0]
    setMarkupPercentage(markup)
    onUpdateRetailPrice(calculateRetailPrice(markup))
  }

  // Calculate profit per gram
  const profitPerGram = retailPricePerGram - wholesalePricePerGram

  // Calculate profit margin percentage
  const profitMarginPercentage = (profitPerGram / retailPricePerGram) * 100

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <div className="gangster-gradient text-white py-6 px-4 mb-4 border-gold border-2">
          <h1 className="text-4xl font-bold text-gold gangster-font text-shadow">BUSINESS SETUP</h1>
          <p className="text-white/80 mt-1">CONFIGURE YOUR OPERATION. MAXIMIZE YOUR PROFITS.</p>
        </div>

        {showTips && (
          <HustleTip title="BUSINESS CONFIGURATION">
            <p>
              Set up your business parameters here. These settings affect all calculations and projections throughout
              the app. Make sure they reflect your real costs and targets.
            </p>
            <Button variant="link" className="p-0 h-auto text-gold" onClick={onHideTips}>
              Got it
            </Button>
          </HustleTip>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pricing" className="gangster-font">
            PRICING SETUP
          </TabsTrigger>
          <TabsTrigger value="business" className="gangster-font">
            BUSINESS PARAMETERS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pricing" className="space-y-6 mt-6">
          <Card className="card-hover card-sharp border-gold">
            <CardHeader>
              <CardTitle className="gangster-font text-gold">PRICING CALCULATOR</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="wholesalePrice" className="flex items-center gangster-font">
                    <DollarSign className="h-4 w-4 mr-1 text-gold" />
                    WHOLESALE PRICE (PER OZ)
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 ml-1 inline opacity-70" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs card-sharp">
                          <p>{businessConcepts.wholesale}</p>
                          <p className="text-xs mt-1 text-muted-foreground">💰 Buy low, sell high. That's the game.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <span className="font-medium gold-text">{formatCurrency(businessData.wholesalePricePerOz)}</span>
                </div>
                <Input
                  id="wholesalePrice"
                  type="number"
                  value={businessData.wholesalePricePerOz}
                  onChange={(e) => handleInputChange("wholesalePricePerOz", Number.parseFloat(e.target.value) || 0)}
                  className="text-lg input-sharp"
                />
                <p className="text-xs text-muted-foreground">Per gram: {formatCurrency(wholesalePricePerGram)}</p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center justify-between mb-2 gangster-font">
                  <span className="flex items-center">
                    <Percent className="h-4 w-4 mr-1 text-gold" />
                    MARKUP PERCENTAGE
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 ml-1 inline opacity-70" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs card-sharp">
                          <p>{businessConcepts.markup}</p>
                          <p className="text-xs mt-1 text-muted-foreground">
                            💰 Higher markup = bigger profits per unit. Find your sweet spot.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </span>
                  <span className="font-medium text-gold">{formatPercentage(markupPercentage)}</span>
                </Label>
                <Slider
                  value={[markupPercentage]}
                  min={50}
                  max={200}
                  step={5}
                  onValueChange={handleMarkupChange}
                  className="mb-6"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>50%</span>
                  <span>100%</span>
                  <span>150%</span>
                  <span>200%</span>
                </div>
              </div>

              <div className="bg-smoke p-6 space-y-4">
                <h3 className="text-lg font-semibold gangster-font text-gold">CALCULATED RETAIL PRICE</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground gangster-font">RETAIL PRICE (PER GRAM)</p>
                    <p className="text-2xl font-bold mt-1 gold-text gangster-font">
                      {formatCurrency(retailPricePerGram)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground gangster-font">PROFIT (PER GRAM)</p>
                    <p className="text-2xl font-bold mt-1 money-text gangster-font">{formatCurrency(profitPerGram)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground gangster-font">PROFIT MARGIN</span>
                    <span className="font-medium gold-text">{formatPercentage(profitMarginPercentage)}</span>
                  </div>
                  <div className="w-full bg-secondary h-2">
                    <div className="bg-gold h-2" style={{ width: `${profitMarginPercentage}%` }}></div>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => onUpdateRetailPrice(retailPricePerGram)}
                className="w-full bg-gold hover:bg-gold/90 text-black button-sharp"
              >
                SAVE PRICING SETTINGS
              </Button>
            </CardContent>
          </Card>

          <Card className="card-hover card-sharp border-gold">
            <CardHeader>
              <CardTitle className="gangster-font text-gold">PRICING STRATEGY</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium gangster-font">PRICE POSITIONING</h3>
                <div className="bg-smoke p-4">
                  <p className="text-sm">
                    {profitMarginPercentage > 60
                      ? "Premium pricing strategy. High margins but may limit volume."
                      : profitMarginPercentage > 40
                        ? "Balanced pricing strategy. Good margins with reasonable volume."
                        : "Value pricing strategy. Lower margins but potentially higher volume."}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium gangster-font">RECOMMENDED STRATEGIES</h3>
                <div className="space-y-2">
                  {profitMarginPercentage < 30 && (
                    <div className="bg-blood/10 p-3 border-l-4 border-blood">
                      <p className="text-sm text-blood">
                        Warning: Your profit margin is very low. Consider increasing your prices or finding a cheaper
                        supplier.
                      </p>
                    </div>
                  )}

                  {profitMarginPercentage > 70 && (
                    <div className="bg-gold/10 p-3 border-l-4 border-gold">
                      <p className="text-sm">
                        Your margins are excellent, but make sure your price isn't limiting your sales volume. Consider
                        offering volume discounts to move more product.
                      </p>
                    </div>
                  )}

                  <div className="bg-smoke p-3">
                    <p className="text-sm">
                      • Test different price points to find your optimal balance of margin and volume
                    </p>
                  </div>

                  <div className="bg-smoke p-3">
                    <p className="text-sm">• Consider different pricing tiers for different customer segments</p>
                  </div>

                  <div className="bg-smoke p-3">
                    <p className="text-sm">• Monitor competitor pricing but don't automatically match it</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-6 mt-6">
          <Card className="card-hover card-sharp border-gold">
            <CardHeader>
              <CardTitle className="gangster-font text-gold">BUSINESS PARAMETERS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="expenses" className="flex items-center gangster-font">
                    <BarChart3 className="h-4 w-4 mr-1 text-blood" />
                    MONTHLY EXPENSES
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 ml-1 inline opacity-70" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs card-sharp">
                          <p>Your fixed monthly costs like rent, utilities, etc.</p>
                          <p className="text-xs mt-1 text-muted-foreground">
                            💰 Keep your overhead low to maximize profits.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <span className="font-medium blood-text">{formatCurrency(businessData.operatingExpenses)}</span>
                </div>
                <Input
                  id="expenses"
                  type="number"
                  value={businessData.operatingExpenses}
                  onChange={(e) => handleInputChange("operatingExpenses", Number.parseFloat(e.target.value) || 0)}
                  className="text-lg input-sharp"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="targetProfit" className="flex items-center gangster-font">
                    <TrendingUp className="h-4 w-4 mr-1 text-money" />
                    TARGET MONTHLY PROFIT
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 ml-1 inline opacity-70" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs card-sharp">
                          <p>How much profit you want to make each month.</p>
                          <p className="text-xs mt-1 text-muted-foreground">
                            💰 Set ambitious targets. Aim high, hustle hard.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <span className="font-medium money-text">{formatCurrency(businessData.targetProfitPerMonth)}</span>
                </div>
                <Input
                  id="targetProfit"
                  type="number"
                  value={businessData.targetProfitPerMonth}
                  onChange={(e) => handleInputChange("targetProfitPerMonth", Number.parseFloat(e.target.value) || 0)}
                  className="text-lg input-sharp"
                />
              </div>

              <div className="bg-smoke p-6">
                <h3 className="text-lg font-semibold gangster-font text-gold mb-4">BREAK-EVEN ANALYSIS</h3>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="gangster-font">MONTHLY FIXED COSTS</span>
                      <span className="text-gold">{formatCurrency(businessData.operatingExpenses)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="gangster-font">PROFIT PER GRAM</span>
                      <span className="text-gold">{formatCurrency(profitPerGram)}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-muted/20">
                    <div className="flex justify-between">
                      <span className="gangster-font">BREAK-EVEN QUANTITY</span>
                      <span className="text-gold">{formatGrams(businessData.operatingExpenses / profitPerGram)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      This is how much you need to sell each month just to cover your expenses.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-muted/20">
                    <div className="flex justify-between">
                      <span className="gangster-font">TARGET QUANTITY</span>
                      <span className="text-gold">
                        {formatGrams(
                          (businessData.operatingExpenses + businessData.targetProfitPerMonth) / profitPerGram,
                        )}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      This is how much you need to sell each month to hit your profit target.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => onUpdateBusinessData(businessData)}
                className="w-full bg-gold hover:bg-gold/90 text-black button-sharp"
              >
                SAVE BUSINESS SETTINGS
              </Button>
            </CardContent>
          </Card>

          <Card className="card-hover card-sharp border-gold">
            <CardHeader>
              <CardTitle className="gangster-font text-gold">BUSINESS OPTIMIZATION</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium gangster-font">EXPENSE MANAGEMENT</h3>
                <div className="bg-smoke p-4">
                  <p className="text-sm">
                    Your monthly expenses are {formatCurrency(businessData.operatingExpenses)}, which is{" "}
                    {businessData.operatingExpenses > 1000
                      ? "relatively high. Consider ways to reduce overhead."
                      : businessData.operatingExpenses > 500
                        ? "moderate. Keep monitoring for potential savings."
                        : "low. Good job keeping overhead down."}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium gangster-font">PROFIT TARGETS</h3>
                <div className="bg-smoke p-4">
                  <p className="text-sm">
                    Your target monthly profit is {formatCurrency(businessData.targetProfitPerMonth)}, which is{" "}
                    {businessData.targetProfitPerMonth > 5000
                      ? "ambitious. Make sure your sales volume can support this."
                      : businessData.targetProfitPerMonth > 2000
                        ? "reasonable. A solid target for a growing operation."
                        : "conservative. Consider setting more ambitious goals as you grow."}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium gangster-font">RECOMMENDED STRATEGIES</h3>
                <div className="space-y-2">
                  <div className="bg-smoke p-3">
                    <p className="text-sm">• Focus on high-margin products to maximize profit per transaction</p>
                  </div>

                  <div className="bg-smoke p-3">
                    <p className="text-sm">• Keep inventory levels optimized to minimize tied-up capital</p>
                  </div>

                  <div className="bg-smoke p-3">
                    <p className="text-sm">• Maintain strict collection policies to ensure healthy cash flow</p>
                  </div>

                  <div className="bg-smoke p-3">
                    <p className="text-sm">• Regularly review and adjust pricing based on market conditions</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover card-sharp border-gold mt-6">
            <CardHeader>
              <CardTitle className="gangster-font text-gold">INVENTORY SETTINGS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-medium gangster-font">INVENTORY MANAGEMENT</h3>
                <div className="bg-smoke p-4">
                  <p className="text-sm">
                    Your inventory is tracked across all components. Changes in the register will update your inventory
                    levels, and inventory purchases will be reflected in your financial reports.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium gangster-font">INVENTORY METRICS</h3>
                <div className="bg-smoke p-4 space-y-4">
                  <div className="flex justify-between">
                    <span className="gangster-font">TOTAL INVENTORY VALUE:</span>
                    <span className="text-gold">
                      {formatCurrency(inventory.reduce((sum, item) => sum + item.totalCost, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="gangster-font">TOTAL QUANTITY:</span>
                    <span className="text-gold">
                      {formatGrams(inventory.reduce((sum, item) => sum + item.quantityG, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="gangster-font">LOW STOCK ITEMS:</span>
                    <span className="text-gold">
                      {inventory.filter((item) => item.quantityG <= item.reorderThresholdG).length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium gangster-font">INVENTORY RECOMMENDATIONS</h3>
                <div className="space-y-2">
                  <div className="bg-smoke p-3">
                    <p className="text-sm">• Keep at least 2 weeks of inventory on hand based on your sales velocity</p>
                  </div>
                  <div className="bg-smoke p-3">
                    <p className="text-sm">• Set reorder thresholds to ensure you never run out of product</p>
                  </div>
                  <div className="bg-smoke p-3">
                    <p className="text-sm">• Track cost per unit carefully to maintain your profit margins</p>
                  </div>
                  <div className="bg-smoke p-3">
                    <p className="text-sm">• Consider bulk purchases to reduce your cost per unit</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setActiveTab("inventory")}
                className="w-full bg-gold hover:bg-gold/90 text-black button-sharp"
              >
                MANAGE INVENTORY
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
