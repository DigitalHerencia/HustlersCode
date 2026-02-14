"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, AlertTriangle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { HustleTip } from "@/components/hustle-tip"
import { HustleStat } from "@/components/hustle-stat"
import type { InventoryItem, Transaction } from "@/lib/data"
import { formatCurrency, formatGrams, formatOunces, gramsToOunces, ouncesToGrams } from "@/lib/utils"
import {
  getInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  createTransaction,
} from "@/lib/facade/server"

interface InventoryManagementProps {
  inventory?: InventoryItem[]
  onUpdateInventory?: (inventory: InventoryItem[]) => void
  onAddTransaction?: (transaction: Transaction) => void
  showTips?: boolean
  onHideTips?: () => void
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  quantity: z.coerce.number().nonnegative("Quantity must be non-negative"),
  unit: z.enum(["g", "oz", "kg"]),
  costPerOz: z.coerce.number().nonnegative("Cost must be non-negative"),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  reorderThresholdG: z.coerce.number().nonnegative("Threshold must be non-negative"),
})

export default function InventoryManagement({
  inventory: propInventory,
  onUpdateInventory,
  onAddTransaction,
  showTips: propShowTips,
  onHideTips: propOnHideTips,
}: InventoryManagementProps) {
  // Internal state to handle the case when props aren't provided
  const [internalInventory, setInternalInventory] = useState<InventoryItem[]>([])
  const [internalShowTips, setInternalShowTips] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null)

  // Use props if provided, otherwise use internal state
  const inventory = propInventory !== undefined ? propInventory : internalInventory
  const showTips = propShowTips !== undefined ? propShowTips : internalShowTips

  // Initialize inventory data if not provided via props
  useEffect(() => {
    if (propInventory === undefined) {
      const loadInventory = async () => {
        setIsLoading(true)
        try {
          const data = await getInventory()
          setInternalInventory(data)
        } catch (error) {
          console.error("Error loading inventory:", error)
        } finally {
          setIsLoading(false)
        }
      }

      loadInventory()
    }
  }, [propInventory])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      quantity: 0,
      unit: "oz",
      costPerOz: 0,
      purchaseDate: new Date().toISOString().split("T")[0],
      reorderThresholdG: 100,
    },
  })

  const handleUpdateInventory = (newInventory: InventoryItem[]) => {
    if (onUpdateInventory) {
      onUpdateInventory(newInventory)
    } else {
      setInternalInventory(newInventory)
    }
  }

  const handleAddTransaction = async (transaction: Transaction) => {
    if (onAddTransaction) {
      onAddTransaction(transaction)
    } else {
      try {
        await createTransaction(transaction)
      } catch (error) {
        console.error("Error creating transaction:", error)
      }
    }
  }

  const handleHideTips = () => {
    if (propOnHideTips) {
      propOnHideTips()
    } else {
      setInternalShowTips(false)
    }
  }

  const handleAddItem = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)

    try {
      // Convert quantity to grams based on selected unit
      let quantityG: number

      if (values.unit === "oz") {
        quantityG = ouncesToGrams(values.quantity)
      } else if (values.unit === "kg") {
        quantityG = values.quantity * 1000
      } else {
        quantityG = values.quantity
      }

      const quantityOz = gramsToOunces(quantityG)
      const costPerOz = values.costPerOz
      const totalCost = costPerOz * quantityOz

      const newItem: Omit<InventoryItem, "id" | "createdAt" | "updatedAt"> = {
        name: values.name,
        description: values.description || "",
        quantityG,
        quantityOz,
        quantityKg: quantityG / 1000,
        purchaseDate: values.purchaseDate,
        costPerOz,
        totalCost,
        reorderThresholdG: values.reorderThresholdG,
      }

      // Create inventory item in database
      const createdItem = await createInventoryItem(newItem)

      if (createdItem) {
        // Create a transaction record for the inventory purchase
        const transaction: Omit<Transaction, "id" | "createdAt"> = {
          date: new Date().toISOString(),
          type: "purchase",
          inventoryId: createdItem.id,
          inventoryName: createdItem.name,
          quantityGrams: quantityG,
          pricePerGram: 0,
          totalPrice: totalCost,
          cost: totalCost,
          profit: 0,
          paymentMethod: "cash",
          customerId: null,
          customerName: null,
          notes: `Initial inventory purchase: ${createdItem.name}`,
        }

        await handleAddTransaction(transaction)

        // Update local state
        handleUpdateInventory([...inventory, createdItem])
      }
    } catch (error) {
      console.error("Error adding inventory item:", error)
    } finally {
      setIsLoading(false)
      setIsAddDialogOpen(false)
      form.reset()
    }
  }

  const handleEditItem = async (values: z.infer<typeof formSchema>) => {
    if (!editingItem) return

    setIsLoading(true)

    try {
      // Convert quantity to grams based on selected unit
      let quantityG: number

      if (values.unit === "oz") {
        quantityG = ouncesToGrams(values.quantity)
      } else if (values.unit === "kg") {
        quantityG = values.quantity * 1000
      } else {
        quantityG = values.quantity
      }

      const quantityOz = gramsToOunces(quantityG)
      const costPerOz = values.costPerOz
      const totalCost = costPerOz * quantityOz

      const updatedItem: Partial<InventoryItem> = {
        name: values.name,
        description: values.description || "",
        quantityG,
        quantityOz,
        quantityKg: quantityG / 1000,
        purchaseDate: values.purchaseDate,
        costPerOz,
        totalCost,
        reorderThresholdG: values.reorderThresholdG,
      }

      // Update inventory item in database
      const updated = await updateInventoryItem(editingItem.id, updatedItem)

      if (updated) {
        // If quantity changed, create a transaction record
        if (quantityG !== editingItem.quantityG) {
          const quantityDiff = quantityG - editingItem.quantityG
          const costDiff = totalCost - editingItem.totalCost

          if (quantityDiff !== 0) {
            const transaction: Omit<Transaction, "id" | "createdAt"> = {
              date: new Date().toISOString(),
              type: "purchase",
              inventoryId: editingItem.id,
              inventoryName: editingItem.name,
              quantityGrams: Math.abs(quantityDiff),
              pricePerGram: 0,
              totalPrice: Math.abs(costDiff),
              cost: Math.abs(costDiff),
              profit: 0,
              paymentMethod: "cash",
              customerId: null,
              customerName: null,
              notes:
                quantityDiff > 0
                  ? `Added ${formatGrams(quantityDiff)} to inventory`
                  : `Removed ${formatGrams(Math.abs(quantityDiff))} from inventory`,
            }

            await handleAddTransaction(transaction)
          }
        }

        // Update local state
        handleUpdateInventory(inventory.map((item) => (item.id === updated.id ? updated : item)))
      }
    } catch (error) {
      console.error("Error updating inventory item:", error)
    } finally {
      setIsLoading(false)
      setIsEditDialogOpen(false)
      setEditingItem(null)
    }
  }

  const handleDeleteItem = async () => {
    if (!deletingItemId) return

    setIsLoading(true)

    try {
      const success = await deleteInventoryItem(deletingItemId)

      if (success) {
        // Update local state
        handleUpdateInventory(inventory.filter((item) => item.id !== deletingItemId))
      }
    } catch (error) {
      console.error("Error deleting inventory item:", error)
    } finally {
      setIsLoading(false)
      setIsDeleteDialogOpen(false)
      setDeletingItemId(null)
    }
  }

  const openEditDialog = (item: InventoryItem) => {
    setEditingItem(item)

    // Default to showing quantity in ounces since that's how it's purchased
    form.reset({
      name: item.name,
      description: item.description,
      quantity: item.quantityOz,
      unit: "oz",
      costPerOz: item.costPerOz,
      purchaseDate: item.purchaseDate,
      reorderThresholdG: item.reorderThresholdG,
    })

    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (itemId: string) => {
    setDeletingItemId(itemId)
    setIsDeleteDialogOpen(true)
  }

  // Calculate total inventory value - with defensive checks
  const totalInventoryValue = Array.isArray(inventory) ? inventory.reduce((sum, item) => sum + item.totalCost, 0) : 0

  const totalQuantityG = Array.isArray(inventory) ? inventory.reduce((sum, item) => sum + item.quantityG, 0) : 0

  const totalQuantityOz = Array.isArray(inventory) ? inventory.reduce((sum, item) => sum + item.quantityOz, 0) : 0

  const lowStockItems = Array.isArray(inventory)
    ? inventory.filter((item) => item.quantityG <= item.reorderThresholdG).length
    : 0

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
          <h1 className="text-4xl font-bold text-gold graffiti-font text-shadow">INVENTORY</h1>
          <p className="text-white/80 mt-1">KNOW YOUR SUPPLY. CONTROL YOUR GAME.</p>
        </div>

        {showTips && (
          <HustleTip title="INVENTORY MANAGEMENT">
            <p>Track every gram. Know what you've got and what it's worth. Never get caught slipping with low stock.</p>
            <Button variant="link" className="p-0 h-auto text-gold" onClick={handleHideTips}>
              Got it
            </Button>
          </HustleTip>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <HustleStat
          title="TOTAL VALUE"
          value={formatCurrency(totalInventoryValue)}
          icon={<Plus className="h-5 w-5 text-black" />}
        />
        <HustleStat
          title="TOTAL QUANTITY"
          value={`${formatGrams(totalQuantityG)} (${formatOunces(totalQuantityOz)})`}
          icon={<Plus className="h-5 w-5 text-black" />}
        />
        <HustleStat
          title="LOW STOCK ITEMS"
          value={lowStockItems.toString()}
          icon={<AlertTriangle className="h-5 w-5 text-black" />}
          trend={lowStockItems > 0 ? "down" : "up"}
          trendValue={lowStockItems > 0 ? "Needs attention" : "All stocked"}
        />
      </div>

      <Card className="card-hover card-sharp border-gold">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="gangster-font text-gold">PRODUCT INVENTORY</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gold hover:bg-gold/90 text-black button-sharp">
                <Plus className="mr-2 h-4 w-4" /> ADD PRODUCT
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-smoke border-gold card-sharp">
              <DialogHeader>
                <DialogTitle className="gangster-font text-gold">ADD NEW PRODUCT</DialogTitle>
                <DialogDescription>Enter the details of the new product for your inventory.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddItem)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="gangster-font">PRODUCT NAME</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Premium, Standard, etc." className="input-sharp" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="gangster-font">DESCRIPTION</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Optional description" className="input-sharp resize-none" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="gangster-font">QUANTITY</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" min="0" {...field} className="input-sharp" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="gangster-font">UNIT</FormLabel>
                          <select
                            className="flex h-10 w-full rounded-none border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 input-sharp"
                            {...field}
                          >
                            <option value="g">Grams (g)</option>
                            <option value="oz">Ounces (oz)</option>
                            <option value="kg">Kilograms (kg)</option>
                          </select>
                          <FormDescription>Select the unit of measurement</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="costPerOz"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="gangster-font">COST PER OUNCE</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" min="0" {...field} className="input-sharp" />
                          </FormControl>
                          <FormDescription>Wholesale cost per ounce</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="purchaseDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="gangster-font">PURCHASE DATE</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="input-sharp" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="reorderThresholdG"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="gangster-font">REORDER THRESHOLD (GRAMS)</FormLabel>
                        <FormControl>
                          <Input type="number" step="1" min="0" {...field} className="input-sharp" />
                        </FormControl>
                        <FormDescription>When to reorder (in grams)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button
                      type="submit"
                      className="bg-gold hover:bg-gold/90 text-black button-sharp"
                      disabled={isLoading}
                    >
                      {isLoading ? "ADDING..." : "ADD PRODUCT"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!Array.isArray(inventory) || inventory.length === 0 ? (
              <div className="text-center py-12 bg-smoke">
                <p className="text-muted-foreground">No products found. Add a product to get started.</p>
              </div>
            ) : (
              inventory.map((item) => (
                <Card key={item.id} className="overflow-hidden card-hover card-sharp border-gold">
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium gangster-font">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">Purchased: {item.purchaseDate}</p>
                      </div>
                      {item.quantityG <= item.reorderThresholdG ? (
                        <Badge className="bg-blood/20 text-blood hover:bg-blood/20 border-blood/20 rounded-none">
                          LOW STOCK
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gold/10 text-gold border-gold/20 rounded-none">
                          {formatOunces(item.quantityOz)}
                        </Badge>
                      )}
                    </div>
                    {item.description && <p className="text-sm text-muted-foreground mt-2">{item.description}</p>}
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">QUANTITY</Label>
                        <p className="text-sm">
                          {formatGrams(item.quantityG)} / {formatOunces(item.quantityOz)}
                        </p>
                      </div>
                      <div className="text-right">
                        <Label className="text-xs text-muted-foreground">COST</Label>
                        <p className="text-sm">{formatCurrency(item.costPerOz)}/oz</p>
                      </div>
                    </div>
                    <div className="flex justify-between mt-3 pt-3 border-t border-muted/20">
                      <span className="font-medium gold-text">Total Value: {formatCurrency(item.totalCost)}</span>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          className="bg-gold hover:bg-gold/90 text-black button-sharp"
                          onClick={() => openEditDialog(item)}
                          disabled={isLoading}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          className="bg-gold hover:bg-gold/90 text-black button-sharp"
                          onClick={() => openDeleteDialog(item.id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-smoke border-gold card-sharp">
          <DialogHeader>
            <DialogTitle className="gangster-font text-gold">EDIT PRODUCT</DialogTitle>
            <DialogDescription>Update the details of this product.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditItem)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="gangster-font">PRODUCT NAME</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Premium, Standard, etc." className="input-sharp" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="gangster-font">DESCRIPTION</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Optional description" className="input-sharp resize-none" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="gangster-font">QUANTITY</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" {...field} className="input-sharp" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="gangster-font">UNIT</FormLabel>
                      <select
                        className="flex h-10 w-full rounded-none border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 input-sharp"
                        {...field}
                      >
                        <option value="g">Grams (g)</option>
                        <option value="oz">Ounces (oz)</option>
                        <option value="kg">Kilograms (kg)</option>
                      </select>
                      <FormDescription>Select the unit of measurement</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="costPerOz"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="gangster-font">COST PER OUNCE</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" {...field} className="input-sharp" />
                      </FormControl>
                      <FormDescription>Wholesale cost per ounce</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="purchaseDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="gangster-font">PURCHASE DATE</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="input-sharp" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="reorderThresholdG"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="gangster-font">REORDER THRESHOLD (GRAMS)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" min="0" {...field} className="input-sharp" />
                    </FormControl>
                    <FormDescription>When to reorder (in grams)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" className="bg-gold hover:bg-gold/90 text-black button-sharp" disabled={isLoading}>
                  {isLoading ? "UPDATING..." : "UPDATE PRODUCT"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-smoke border-gold card-sharp">
          <AlertDialogHeader>
            <AlertDialogTitle className="gangster-font text-gold">DELETE PRODUCT</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
              {deletingItemId && (
                <div className="mt-2">
                  <p className="text-blood">
                    This will remove the product from your inventory and all related records.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="button-sharp">CANCEL</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteItem}
              className="bg-blood hover:bg-blood/90 text-white button-sharp"
              disabled={isLoading}
            >
              {isLoading ? "DELETING..." : "DELETE"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
