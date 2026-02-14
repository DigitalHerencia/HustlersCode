"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, Plus, Minus, ShoppingCart, Save } from "lucide-react"
import { HustleTip } from "@/components/hustle-tip"
import { HustleStat } from "@/components/hustle-stat"
import type { Customer, InventoryItem, Transaction } from "@/lib/types"
import { formatCurrency, formatGrams, formatOunces, ouncesToGrams } from "@/lib/utils"
import { getInventory, getCustomers, createTransaction, addPayment } from "@/lib/facade/server"

interface CashRegisterProps {
  showTips: boolean
  onHideTips: () => void
}

export default function CashRegister({ showTips, onHideTips }: CashRegisterProps) {
  const [activeTab, setActiveTab] = useState("quick-sale")
  const [selectedInventoryId, setSelectedInventoryId] = useState<string | null>(null)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [customPrice, setCustomPrice] = useState<number | null>(null)
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [notes, setNotes] = useState("")
  const [dailyRevenue, setDailyRevenue] = useState(0)
  const [dailyTransactions, setDailyTransactions] = useState(0)
  const [dailyProfit, setDailyProfit] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [retailPricePerGram, setRetailPricePerGram] = useState(100) // Default value

  // Load inventory and customer data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [inventoryData, customersData] = await Promise.all([getInventory(), getCustomers()])
        setInventory(inventoryData)
        setCustomers(customersData)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Get selected inventory item
  const selectedInventory = selectedInventoryId ? inventory.find((item) => item.id === selectedInventoryId) : null

  // Get selected customer
  const selectedCustomer = selectedCustomerId ? customers.find((customer) => customer.id === selectedCustomerId) : null

  // Calculate sale price
  const calculateSalePrice = () => {
    if (customPrice !== null) return customPrice

    const pricePerGram = retailPricePerGram
    return pricePerGram * quantity
  }

  // Calculate cost
  const calculateCost = () => {
    if (!selectedInventory) return 0

    const costPerGram = selectedInventory.costPerOz / 28.35
    return costPerGram * quantity
  }

  // Calculate profit
  const calculateProfit = () => {
    return calculateSalePrice() - calculateCost()
  }

  // Handle quick sale
  const handleQuickSale = async () => {
    if (!selectedInventory) return

    setIsLoading(true)

    try {
      // Create transaction record
      const transaction: Omit<Transaction, "id" | "createdAt"> = {
        date: new Date().toISOString(),
        type: "sale",
        inventoryId: selectedInventory.id,
        inventoryName: selectedInventory.name,
        quantityGrams: quantity,
        pricePerGram: calculateSalePrice() / quantity,
        totalPrice: calculateSalePrice(),
        cost: calculateCost(),
        profit: calculateProfit(),
        paymentMethod: paymentMethod,
        customerId: selectedCustomer?.id || null,
        customerName: selectedCustomer?.name || null,
        notes: notes,
      }

      // Save transaction to database
      await createTransaction(transaction)

      // Update daily stats
      setDailyRevenue((prev) => prev + calculateSalePrice())
      setDailyTransactions((prev) => prev + 1)
      setDailyProfit((prev) => prev + calculateProfit())

      // Refresh inventory data
      const updatedInventory = await getInventory()
      setInventory(updatedInventory)

      // Refresh customer data if needed
      if (selectedCustomer && paymentMethod === "credit") {
        const updatedCustomers = await getCustomers()
        setCustomers(updatedCustomers)
      }

      // Reset form
      setQuantity(1)
      setCustomPrice(null)
      setNotes("")
    } catch (error) {
      console.error("Error processing sale:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle customer payment
  const handleCustomerPayment = async () => {
    if (!selectedCustomer) return

    setIsLoading(true)

    try {
      const paymentAmount = customPrice !== null ? customPrice : selectedCustomer.amountOwed

      if (paymentAmount <= 0) return

      // Create payment record
      const payment = {
        amount: paymentAmount,
        date: new Date().toISOString().split("T")[0],
        method: paymentMethod,
        notes: notes,
      }

      // Add payment to database
      await addPayment(selectedCustomer.id, payment)

      // Update daily stats
      setDailyRevenue((prev) => prev + paymentAmount)
      setDailyTransactions((prev) => prev + 1)

      // Refresh customer data
      const updatedCustomers = await getCustomers()
      setCustomers(updatedCustomers)

      // Reset form
      setCustomPrice(null)
      setNotes("")
    } catch (error) {
      console.error("Error processing payment:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Reset daily stats at midnight
  useEffect(() => {
    const now = new Date()
    const night = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1, // tomorrow
      0,
      0,
      0, // midnight
    )
    const msToMidnight = night.getTime() - now.getTime()

    const timer = setTimeout(() => {
      setDailyRevenue(0)
      setDailyTransactions(0)
      setDailyProfit(0)
    }, msToMidnight)

    return () => clearTimeout(timer)
  }, [dailyRevenue, dailyTransactions, dailyProfit])

  if (isLoading && inventory.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <div className="gangster-gradient text-white py-6 px-4 mb-4 border-gold border-2">
          <h1 className="text-4xl font-bold text-gold graffiti-font text-shadow">CASH REGISTER</h1>
          <p className="text-white/80 mt-1">MOVE PRODUCT. COLLECT MONEY. STACK PAPER.</p>
        </div>

        {showTips && (
          <HustleTip title="QUICK TRANSACTIONS">
            <p>
              Use this page for your day-to-day business. Record sales, collect payments, and keep your inventory
              accurate. Every transaction is tracked for your monthly reports.
            </p>
            <Button variant="link" className="p-0 h-auto text-gold" onClick={onHideTips}>
              Got it
            </Button>
          </HustleTip>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <HustleStat
          title="TODAY'S REVENUE"
          value={formatCurrency(dailyRevenue)}
          icon={<DollarSign className="h-5 w-5 text-black" />}
        />
        <HustleStat
          title="TODAY'S PROFIT"
          value={formatCurrency(dailyProfit)}
          icon={<ShoppingCart className="h-5 w-5 text-black" />}
        />
        <HustleStat
          title="TRANSACTIONS"
          value={dailyTransactions.toString()}
          icon={<Save className="h-5 w-5 text-black" />}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="quick-sale" className="gangster-font">
            QUICK SALE
          </TabsTrigger>
          <TabsTrigger value="collect-payment" className="gangster-font">
            COLLECT PAYMENT
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quick-sale" className="space-y-4 mt-4">
          <Card className="card-sharp border-gold">
            <CardHeader>
              <CardTitle className="gangster-font text-gold">PRODUCT SALE</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="gangster-font">SELECT PRODUCT</Label>
                <Select value={selectedInventoryId || ""} onValueChange={setSelectedInventoryId}>
                  <SelectTrigger className="input-sharp">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {inventory && inventory.length > 0 ? (
                      inventory.map((item) => (
                        <SelectItem key={item.id} value={item.id} disabled={item.quantityOz <= 0}>
                          {item.name} ({formatOunces(item.quantityOz)})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-inventory" disabled>
                        No inventory available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="gangster-font">QUANTITY (GRAMS)</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-gold/20 text-gold hover:bg-gold/10 button-sharp"
                    onClick={() => setQuantity(Math.max(0.2, quantity - 0.2))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    step="0.1"
                    min="0.1"
                    className="input-sharp text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-gold/20 text-gold hover:bg-gold/10 button-sharp"
                    onClick={() => setQuantity(quantity + 0.2)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {selectedInventory && (
                  <p className="text-xs text-muted-foreground">
                    Max available: {formatGrams(ouncesToGrams(selectedInventory.quantityOz))}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="gangster-font">CLIENT (OPTIONAL)</Label>
                <Select value={selectedCustomerId || "none"} onValueChange={setSelectedCustomerId}>
                  <SelectTrigger className="input-sharp">
                    <SelectValue placeholder="Select client (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No client</SelectItem>
                    {customers && customers.length > 0 ? (
                      customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-customers" disabled>
                        No customers available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="gangster-font">PRICE</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={customPrice !== null ? customPrice : calculateSalePrice()}
                    onChange={(e) => setCustomPrice(Number(e.target.value))}
                    step="0.01"
                    min="0"
                    className="input-sharp"
                  />
                  <Button
                    variant="outline"
                    className="border-gold/20 text-gold hover:bg-gold/10 button-sharp whitespace-nowrap"
                    onClick={() => setCustomPrice(null)}
                  >
                    Reset
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Standard price: {formatCurrency(retailPricePerGram)} per gram
                </p>
              </div>

              <div className="space-y-2">
                <Label className="gangster-font">PAYMENT METHOD</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="input-sharp">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="credit" disabled={!selectedCustomer || selectedCustomerId === "none"}>
                      Add to Client Account
                    </SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="crypto">Crypto</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="gangster-font">NOTES (OPTIONAL)</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-sharp"
                  placeholder="Add notes about this sale..."
                />
              </div>

              <div className="bg-smoke p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="gangster-font">TOTAL PRICE:</span>
                  <span className="font-bold text-gold">{formatCurrency(calculateSalePrice())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="gangster-font">COST:</span>
                  <span className="text-muted-foreground">{formatCurrency(calculateCost())}</span>
                </div>
                <div className="flex justify-between border-t border-muted/20 pt-2 mt-2">
                  <span className="gangster-font">PROFIT:</span>
                  <span className="font-bold text-money">{formatCurrency(calculateProfit())}</span>
                </div>
              </div>

              <Button
                onClick={handleQuickSale}
                disabled={
                  isLoading ||
                  !selectedInventory ||
                  quantity <= 0 ||
                  (selectedInventory && quantity > ouncesToGrams(selectedInventory.quantityOz))
                }
                className="w-full bg-gold hover:bg-gold/90 text-black button-sharp"
              >
                {isLoading ? "PROCESSING..." : "COMPLETE SALE"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collect-payment" className="space-y-4 mt-4">
          <Card className="card-sharp border-gold">
            <CardHeader>
              <CardTitle className="gangster-font text-gold">COLLECT PAYMENT</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="gangster-font">SELECT CLIENT</Label>
                <Select value={selectedCustomerId || ""} onValueChange={setSelectedCustomerId}>
                  <SelectTrigger className="input-sharp">
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers && customers.length > 0 ? (
                      customers
                        .filter((c) => c.amountOwed > 0)
                        .map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name} ({formatCurrency(customer.amountOwed)})
                          </SelectItem>
                        ))
                    ) : (
                      <SelectItem value="no-customers" disabled>
                        No customers with outstanding balances
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedCustomer && selectedCustomer.amountOwed > 0 && (
                <>
                  <div className="bg-smoke p-4">
                    <div className="flex justify-between items-center">
                      <span className="gangster-font">AMOUNT OWED:</span>
                      <span className="text-blood font-bold">{formatCurrency(selectedCustomer.amountOwed)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Due date: {new Date(selectedCustomer.dueDate || "").toLocaleDateString()}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="gangster-font">PAYMENT AMOUNT</Label>
                    <Input
                      type="number"
                      value={customPrice !== null ? customPrice : selectedCustomer.amountOwed}
                      onChange={(e) => setCustomPrice(Number(e.target.value))}
                      step="0.01"
                      min="0"
                      max={selectedCustomer.amountOwed}
                      className="input-sharp"
                    />
                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gold/20 text-gold hover:bg-gold/10 button-sharp"
                        onClick={() => setCustomPrice(selectedCustomer.amountOwed)}
                      >
                        Full Amount
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gold/20 text-gold hover:bg-gold/10 button-sharp"
                        onClick={() => setCustomPrice(selectedCustomer.amountOwed / 2)}
                      >
                        Half
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="gangster-font">PAYMENT METHOD</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger className="input-sharp">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="crypto">Crypto</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="gangster-font">NOTES (OPTIONAL)</Label>
                    <Input
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="input-sharp"
                      placeholder="Add notes about this payment..."
                    />
                  </div>

                  <Button
                    onClick={handleCustomerPayment}
                    disabled={
                      isLoading ||
                      !selectedCustomer ||
                      (customPrice !== null && (customPrice <= 0 || customPrice > selectedCustomer.amountOwed))
                    }
                    className="w-full bg-gold hover:bg-gold/90 text-black button-sharp"
                  >
                    {isLoading ? "PROCESSING..." : "RECORD PAYMENT"}
                  </Button>
                </>
              )}

              {selectedCustomer && selectedCustomer.amountOwed === 0 && (
                <div className="bg-smoke p-6 text-center">
                  <p className="text-money gangster-font">THIS CLIENT HAS NO OUTSTANDING BALANCE</p>
                </div>
              )}

              {!selectedCustomer && (
                <div className="bg-smoke p-6 text-center">
                  <p className="text-muted-foreground">Select a client to collect payment</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
