"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Plus, Edit, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { HustleTip } from "@/components/hustle-tip"
import type { InventoryItem } from "@/lib/data"
import {
  formatCurrency,
  formatGrams,
  formatOunces,
  formatKilograms,
  ouncesToGrams,
  gramsToOunces,
  gramsToKilograms,
} from "@/lib/utils"
import { v4 as uuidv4 } from "uuid"

interface InventoryTableProps {
  showTips?: boolean
  onHideTips?: () => void
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  unit: z.enum(["g", "oz", "kg"]),
  costPerOz: z.coerce.number().positive("Cost must be positive"),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  reorderThresholdG: z.coerce.number().nonnegative("Threshold must be non-negative"),
})

export default function InventoryTable({ showTips = true, onHideTips = () => {} }: InventoryTableProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      quantity: 0,
      unit: "oz",
      costPerOz: 0,
      purchaseDate: new Date().toISOString().split("T")[0],
      reorderThresholdG: 0,
    },
  })

  const handleAddItem = (values: z.infer<typeof formSchema>) => {
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
    const quantityKg = gramsToKilograms(quantityG)
    const costPerOz = values.costPerOz
    const totalCost = costPerOz * quantityOz

    const newItem: InventoryItem = {
      id: uuidv4(),
      name: values.name,
      description: values.description || "",
      quantityG,
      quantityOz,
      quantityKg,
      purchaseDate: values.purchaseDate,
      costPerOz,
      totalCost,
      reorderThresholdG: values.reorderThresholdG,
    }

    setInventory([...inventory, newItem])
    setIsAddDialogOpen(false)
    form.reset()
  }

  const handleEditItem = (values: z.infer<typeof formSchema>) => {
    if (!editingItem) return

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
    const quantityKg = gramsToKilograms(quantityG)
    const costPerOz = values.costPerOz
    const totalCost = costPerOz * quantityOz

    const updatedItem: InventoryItem = {
      ...editingItem,
      name: values.name,
      description: values.description || "",
      quantityG,
      quantityOz,
      quantityKg,
      purchaseDate: values.purchaseDate,
      costPerOz,
      totalCost,
      reorderThresholdG: values.reorderThresholdG,
    }

    setInventory(inventory.map((item) => (item.id === updatedItem.id ? updatedItem : item)))
    setIsEditDialogOpen(false)
    setEditingItem(null)
    form.reset()
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

  const handleDeleteItem = (id: string) => {
    setInventory(inventory.filter((item) => item.id !== id))
  }

  const totalInventoryValue = inventory.reduce((sum, item) => sum + item.totalCost, 0)
  const totalQuantityG = inventory.reduce((sum, item) => sum + item.quantityG, 0)
  const totalQuantityOz = inventory.reduce((sum, item) => sum + item.quantityOz, 0)
  const totalQuantityKg = inventory.reduce((sum, item) => sum + item.quantityKg, 0)

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <div className="gangster-gradient text-white py-6 px-4 mb-4 border-gold border-2">
          <h1 className="text-4xl font-bold text-gold graffiti-font text-shadow">INVENTORY MANAGEMENT</h1>
          <p className="text-white/80 mt-1">TRACK YOUR PRODUCT. MONITOR COSTS. MAXIMIZE PROFITS.</p>
        </div>

        {showTips && (
          <HustleTip title="INVENTORY CONTROL">
            <p>
              Keep track of your product levels and costs. Set reorder thresholds to never run out of stock. Monitor
              your total inventory value to know exactly what your operation is worth.
            </p>
            <Button variant="link" className="p-0 h-auto text-gold" onClick={onHideTips}>
              Got it
            </Button>
          </HustleTip>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gold">{formatCurrency(totalInventoryValue)}</div>
            <p className="text-sm text-muted-foreground">Total Inventory Value</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gold">{formatGrams(totalQuantityG)}</div>
            <p className="text-sm text-muted-foreground">Total Quantity (g)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gold">{formatOunces(totalQuantityOz)}</div>
            <p className="text-sm text-muted-foreground">Total Quantity (oz)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gold">{formatKilograms(totalQuantityKg)}</div>
            <p className="text-sm text-muted-foreground">Total Quantity (kg)</p>
          </CardContent>
        </Card>
      </div>

      <Card className="card-sharp border-gold">
        <CardHeader>
          <div className="space-y-2">
            <CardTitle className="gangster-font text-gold">PRODUCT INVENTORY</CardTitle>
            <CardDescription>Track your commodity inventory levels and costs</CardDescription>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="mt-2 bg-gold hover:bg-gold/90 text-black">
                  <Plus className="mr-2 h-4 w-4" /> Add Inventory
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Inventory</DialogTitle>
                  <DialogDescription>Add a new inventory item to your stock.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleAddItem)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grade/Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Premium, Standard, etc." />
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
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Optional description" />
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
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" min="0" {...field} />
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
                            <FormLabel>Unit</FormLabel>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                            <FormLabel>Cost per Ounce</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" min="0" {...field} />
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
                            <FormLabel>Purchase Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
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
                          <FormLabel>Reorder Threshold (grams)</FormLabel>
                          <FormControl>
                            <Input type="number" step="1" min="0" {...field} />
                          </FormControl>
                          <FormDescription>When to reorder (in grams)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" className="bg-gold hover:bg-gold/90 text-black">
                        Add Inventory
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Grade/Name</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead className="hidden sm:table-cell">Cost</TableHead>
                  <TableHead className="hidden lg:table-cell">Purchase Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No inventory found. Add inventory to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  inventory?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="hidden md:table-cell">{item.description}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>{formatGrams(item.quantityG)}</div>
                          <div className="text-xs text-muted-foreground sm:hidden">{formatOunces(item.quantityOz)}</div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{formatCurrency(item.totalCost)}</TableCell>
                      <TableCell className="hidden lg:table-cell">{item.purchaseDate}</TableCell>
                      <TableCell>
                        {item.quantityG <= item.reorderThresholdG ? (
                          <Badge variant="destructive" className="whitespace-nowrap">
                            Low Stock
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="whitespace-nowrap">
                            In Stock
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            className="bg-gold hover:bg-gold/90 text-black"
                            onClick={() => openEditDialog(item)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-gold hover:bg-gold/90 text-black"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Inventory</DialogTitle>
            <DialogDescription>Update the details of this inventory item.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditItem)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade/Name</FormLabel>
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
                    <FormLabel>Description</FormLabel>
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
                      <FormLabel>Quantity</FormLabel>
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
                      <FormLabel>Unit</FormLabel>
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
                <Button type="submit" className="bg-gold hover:bg-gold/90 text-black button-sharp">
                  UPDATE PRODUCT
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
