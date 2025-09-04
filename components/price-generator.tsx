"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { v4 as uuidv4 } from "uuid"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { calculateDerivedValues } from "@/lib/utils"
import type { ScenarioData } from "@/lib/data"

const formSchema = z.object({
  basePrice: z.coerce.number().positive("Base price must be positive"),
  priceIncrement: z.coerce.number().positive("Price increment must be positive"),
  grossMarginPercentage: z.coerce
    .number()
    .min(1, "Margin must be at least 1%")
    .max(99, "Margin must be less than 100%"),
  targetProfit: z.coerce.number().positive("Target profit must be positive"),
})

interface PriceGeneratorProps {
  onGenerate: (scenarios: ScenarioData[]) => void
}

export default function PriceGenerator({ onGenerate }: PriceGeneratorProps) {
  const [previewScenarios, setPreviewScenarios] = useState<Array<{ price: number; margin: number }>>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      basePrice: 20,
      priceIncrement: 1,
      grossMarginPercentage: 60,
      targetProfit: 2000,
    },
  })

  const watchBasePrice = form.watch("basePrice")
  const watchPriceIncrement = form.watch("priceIncrement")
  const watchGrossMarginPercentage = form.watch("grossMarginPercentage")

  // Update preview whenever inputs change
  const updatePreview = () => {
    const basePrice = watchBasePrice || 20
    const priceIncrement = watchPriceIncrement || 1
    const marginPercentage = watchGrossMarginPercentage || 60

    const scenarios = []

    // Generate 5 price points below base price
    for (let i = 5; i > 0; i--) {
      const price = Math.max(basePrice - i * priceIncrement, priceIncrement)
      const margin = (price * marginPercentage) / 100
      scenarios.push({ price, margin })
    }

    // Add base price
    scenarios.push({
      price: basePrice,
      margin: (basePrice * marginPercentage) / 100,
    })

    // Generate 5 price points above base price
    for (let i = 1; i <= 5; i++) {
      const price = basePrice + i * priceIncrement
      const margin = (price * marginPercentage) / 100
      scenarios.push({ price, margin })
    }

    setPreviewScenarios(scenarios)
  }

  // Update preview when form values change
  useState(() => {
    const subscription = form.watch(() => updatePreview())
    updatePreview() // Initial update
    return () => subscription.unsubscribe()
  })

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    const { basePrice, priceIncrement, grossMarginPercentage, targetProfit } = values

    const generatedScenarios: ScenarioData[] = []

    // Generate 5 price points below base price
    for (let i = 5; i > 0; i--) {
      const price = Math.max(basePrice - i * priceIncrement, priceIncrement)
      const margin = (price * grossMarginPercentage) / 100

      const derivedValues = calculateDerivedValues(price, margin, targetProfit)

      generatedScenarios.push({
        id: uuidv4(),
        scenario: `P${price.toFixed(0)}`,
        retailPriceG: price,
        grossMarginG: margin,
        netProfit: targetProfit,
        ...derivedValues,
      })
    }

    // Add base price
    const baseMargin = (basePrice * grossMarginPercentage) / 100
    const baseDerivedValues = calculateDerivedValues(basePrice, baseMargin, targetProfit)

    generatedScenarios.push({
      id: uuidv4(),
      scenario: `P${basePrice.toFixed(0)}*`,
      retailPriceG: basePrice,
      grossMarginG: baseMargin,
      netProfit: targetProfit,
      ...baseDerivedValues,
    })

    // Generate 5 price points above base price
    for (let i = 1; i <= 5; i++) {
      const price = basePrice + i * priceIncrement
      const margin = (price * grossMarginPercentage) / 100

      const derivedValues = calculateDerivedValues(price, margin, targetProfit)

      generatedScenarios.push({
        id: uuidv4(),
        scenario: `P${price.toFixed(0)}`,
        retailPriceG: price,
        grossMarginG: margin,
        netProfit: targetProfit,
        ...derivedValues,
      })
    }

    onGenerate(generatedScenarios)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Price Points</CardTitle>
          <CardDescription>
            Set a base price and automatically generate multiple price scenarios around it
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="basePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Price (per gram)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="1" {...field} />
                      </FormControl>
                      <FormDescription>The center price point</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priceIncrement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Increment</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0.01" {...field} />
                      </FormControl>
                      <FormDescription>Amount to increase/decrease for each price point</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="grossMarginPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gross Margin Percentage: {field.value}%</FormLabel>
                      <FormControl>
                        <Slider
                          defaultValue={[field.value]}
                          min={1}
                          max={99}
                          step={1}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                      </FormControl>
                      <FormDescription>Percentage of price that is profit</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetProfit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Monthly Net Profit</FormLabel>
                      <FormControl>
                        <Input type="number" step="100" min="100" {...field} />
                      </FormControl>
                      <FormDescription>Your target monthly profit before sales commissions</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Preview of Generated Price Points</h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {previewScenarios.map((scenario, index) => (
                    <div
                      key={index}
                      className={`p-2 border rounded-md text-center ${
                        index === 5 ? "border-primary bg-primary/10" : ""
                      }`}
                    >
                      <div className="font-medium">${scenario.price.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">Margin: ${scenario.margin.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit">Generate Scenarios</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
