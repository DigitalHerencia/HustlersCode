"use client"

import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { v4 as uuidv4 } from "uuid"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { ScenarioData } from "@/lib/data"
import { calculateDerivedValues } from "@/lib/utils"

const formSchema = z.object({
  scenario: z.string().min(1, "Scenario name is required"),
  retailPriceG: z.coerce.number().positive("Price must be positive"),
  grossMarginG: z.coerce.number().positive("Margin must be positive"),
  netProfit: z.coerce.number().positive("Target profit must be positive"),
})

interface RetailAnalyticsFormProps {
  onSubmit: (data: ScenarioData) => void
  initialData: ScenarioData | null
  isEditing: boolean
}

export default function RetailAnalyticsForm({ onSubmit, initialData, isEditing }: RetailAnalyticsFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      scenario: "",
      retailPriceG: 0,
      grossMarginG: 0,
      netProfit: 2000,
    },
  })

  // Update form when initialData changes (for editing)
  useEffect(() => {
    if (initialData) {
      form.reset({
        scenario: initialData.scenario,
        retailPriceG: initialData.retailPriceG,
        grossMarginG: initialData.grossMarginG,
        netProfit: initialData.netProfit,
      })
    }
  }, [initialData, form])

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    const derivedValues = calculateDerivedValues(
      values.retailPriceG,
      values.grossMarginG,
      values.netProfit,
      initialData?.salespeople,
    )

    const completeScenario: ScenarioData = {
      id: initialData?.id || uuidv4(),
      scenario: values.scenario,
      retailPriceG: values.retailPriceG,
      grossMarginG: values.grossMarginG,
      netProfit: values.netProfit,
      ...derivedValues,
    }

    onSubmit(completeScenario)

    if (!isEditing) {
      form.reset({
        scenario: "",
        retailPriceG: 0,
        grossMarginG: 0,
        netProfit: 2000,
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="scenario"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Scenario Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., A, B, C or Premium, Standard, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="retailPriceG"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Retail Price (per gram)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
                </FormControl>
                <FormDescription>The price you charge per gram</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="grossMarginG"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gross Margin (per gram)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
                </FormControl>
                <FormDescription>Your profit per gram (retail price minus cost)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="netProfit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Monthly Net Profit</FormLabel>
                <FormControl>
                  <Input type="number" step="1" min="0" {...field} />
                </FormControl>
                <FormDescription>Your target monthly profit before sales commissions</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit">{isEditing ? "Update Scenario" : "Add Scenario"}</Button>
      </form>
    </Form>
  )
}
