"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import RetailAnalyticsTable from "@/components/retail-analytics-table"
import RetailAnalyticsForm from "@/components/retail-analytics-form"
import RetailAnalyticsCharts from "@/components/retail-analytics-charts"
import SalespeopleTable from "@/components/salespeople-table"
import SalespeopleCharts from "@/components/salespeople-charts"
import PriceGenerator from "@/components/price-generator"
import type { ScenarioData } from "@/lib/data"

export default function RetailAnalyticsDashboard() {
  const [scenarios, setScenarios] = useState<ScenarioData[]>([])
  const [editingScenario, setEditingScenario] = useState<ScenarioData | null>(null)
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  // TODO: Implement data fetching from an external API or data source
  // useEffect(() => {
  //   const fetchData = async () => {
  //     const data = await fetch('/api/scenarios');
  //     const scenarios = await data.json();
  //     setScenarios(scenarios);
  //   };
  //   fetchData();
  // }, []);

  const selectedScenario = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0]

  const handleAddScenario = (newScenario: ScenarioData) => {
    setScenarios([...scenarios, newScenario])
    setSelectedScenarioId(newScenario.id)
  }

  const handleUpdateScenario = (updatedScenario: ScenarioData) => {
    setScenarios(scenarios.map((scenario) => (scenario.id === updatedScenario.id ? updatedScenario : scenario)))
    setEditingScenario(null)
  }

  const handleDeleteScenario = (id: string) => {
    setScenarios(scenarios.filter((scenario) => scenario.id !== id))
    if (selectedScenarioId === id && scenarios.length > 1) {
      setSelectedScenarioId(scenarios[0].id === id ? scenarios[1].id : scenarios[0].id)
    }
  }

  const handleEditScenario = (scenario: ScenarioData) => {
    setEditingScenario(scenario)
  }

  const handleUpdateSalespeople = (scenarioId: string, updatedSalespeople: any) => {
    setScenarios(
      scenarios.map((scenario) => {
        if (scenario.id === scenarioId) {
          const updatedScenario = {
            ...scenario,
            salespeople: updatedSalespeople,
          }
          // Recalculate total commission
          updatedScenario.totalCommission = updatedSalespeople.reduce(
            (total: number, person: any) => total + person.earnings,
            0,
          )
          // Update net profit after commission
          updatedScenario.netProfitAfterCommission = scenario.netProfit - updatedScenario.totalCommission

          return updatedScenario
        }
        return scenario
      }),
    )
  }

  const handleGenerateScenarios = (newScenarios: ScenarioData[]) => {
    // Replace all scenarios with the newly generated ones
    setScenarios(newScenarios)
    if (newScenarios.length > 0) {
      // Select the middle scenario (base price)
      const middleIndex = Math.floor(newScenarios.length / 2)
      setSelectedScenarioId(newScenarios[middleIndex].id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Retail Analytics Tool</CardTitle>
          <CardDescription>
            Compare different pricing scenarios and analyze their impact on revenue, profit, and sales team performance
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="table" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="table">Data Table</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="salespeople">Salespeople</TabsTrigger>
          <TabsTrigger value="salesCharts">Sales Charts</TabsTrigger>
          <TabsTrigger value="add">Add/Edit</TabsTrigger>
          <TabsTrigger value="generate">Generate</TabsTrigger>
        </TabsList>

        <TabsContent value="table">
          <Card>
            <CardContent className="pt-6">
              <RetailAnalyticsTable
                scenarios={scenarios}
                onEdit={handleEditScenario}
                onDelete={handleDeleteScenario}
                onSelectScenario={setSelectedScenarioId}
                selectedScenarioId={selectedScenarioId}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts">
          <Card>
            <CardContent className="pt-6">
              <RetailAnalyticsCharts scenarios={scenarios} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salespeople">
          <Card>
            <CardContent className="pt-6">
              {selectedScenario ? (
                <SalespeopleTable
                  scenario={selectedScenario}
                  onUpdateSalespeople={(updatedSalespeople) =>
                    handleUpdateSalespeople(selectedScenario.id, updatedSalespeople)
                  }
                />
              ) : (
                <p>No scenario selected. Please select a scenario from the Data Table tab.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salesCharts">
          <Card>
            <CardContent className="pt-6">
              {selectedScenario ? (
                <SalespeopleCharts scenario={selectedScenario} />
              ) : (
                <p>No scenario selected. Please select a scenario from the Data Table tab.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardContent className="pt-6">
              <RetailAnalyticsForm
                onSubmit={editingScenario ? handleUpdateScenario : handleAddScenario}
                initialData={editingScenario}
                isEditing={!!editingScenario}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generate">
          <PriceGenerator onGenerate={handleGenerateScenarios} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
