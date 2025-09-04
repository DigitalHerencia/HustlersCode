"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calculator, Users, Package } from "lucide-react"
import { HustleTip } from "@/components/hustle-tip"

export default function HelpTab() {
  const [activeTab, setActiveTab] = useState("overview")
  const [showTips, setShowTips] = useState(true)

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <div className="gangster-gradient text-white py-6 px-4 mb-4 border-gold border-2">
          <h1 className="text-4xl font-bold text-gold graffiti-font text-shadow">HELP & GUIDE</h1>
          <p className="text-white/80 mt-1">LEARN THE GAME. MASTER THE HUSTLE.</p>
        </div>

        {showTips && (
          <HustleTip title="KNOWLEDGE IS POWER">
            <p>
              This guide will help you get the most out of your Hustle Calculator. Learn all the features to maximize
              your profits and run your business like a boss.
            </p>
            <Button variant="link" className="p-0 h-auto text-gold" onClick={() => setShowTips(false)}>
              Got it
            </Button>
          </HustleTip>
        )}
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="overview" className="gangster-font">
            OVERVIEW
          </TabsTrigger>
          <TabsTrigger value="calculator" className="gangster-font">
            CALCULATOR
          </TabsTrigger>
          <TabsTrigger value="inventory" className="gangster-font">
            INVENTORY
          </TabsTrigger>
          <TabsTrigger value="customers" className="gangster-font">
            CLIENTS
          </TabsTrigger>
          <TabsTrigger value="register" className="gangster-font">
            REGISTER
          </TabsTrigger>
          <TabsTrigger value="forecast" className="gangster-font">
            FORECAST
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <Card className="card-sharp border-gold">
            <CardHeader>
              <CardTitle className="gangster-font text-gold">WELCOME TO HUSTLE CALCULATOR</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Hustle Calculator is your all-in-one business management tool designed specifically for street
                entrepreneurs. Track your inventory, manage clients, record sales, and forecast profits - all with an
                interface that keeps your data private and your business running smooth.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-smoke p-4 flex flex-col items-center text-center">
                  <Calculator className="h-10 w-10 text-gold mb-2" />
                  <h3 className="gangster-font text-gold">PRICE CALCULATOR</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Find your optimal price points to maximize profits
                  </p>
                </div>

                <div className="bg-smoke p-4 flex flex-col items-center text-center">
                  <Package className="h-10 w-10 text-gold mb-2" />
                  <h3 className="gangster-font text-gold">INVENTORY TRACKER</h3>
                  <p className="text-sm text-muted-foreground mt-1">Keep track of your product and never run dry</p>
                </div>

                <div className="bg-smoke p-4 flex flex-col items-center text-center">
                  <Users className="h-10 w-10 text-gold mb-2" />
                  <h3 className="gangster-font text-gold">CLIENT MANAGEMENT</h3>
                  <p className="text-sm text-muted-foreground mt-1">Manage your clients and collect what's owed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-sharp border-gold">
            <CardHeader>
              <CardTitle className="gangster-font text-gold">GETTING STARTED</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  <strong className="text-gold">Set up your business</strong> - Go to the Setup tab and enter your
                  wholesale costs and target profit
                </li>
                <li>
                  <strong className="text-gold">Add your inventory</strong> - Track what you have on hand in the
                  Inventory tab
                </li>
                <li>
                  <strong className="text-gold">Add your clients</strong> - Keep track of who owes you money in the
                  Clients tab
                </li>
                <li>
                  <strong className="text-gold">Record transactions</strong> - Use the Register to record sales and
                  payments
                </li>
                <li>
                  <strong className="text-gold">Check your forecast</strong> - See how your business is performing in
                  the Forecast tab
                </li>
              </ol>

              <div className="bg-smoke p-4 mt-4">
                <h3 className="gangster-font text-gold mb-2">PRO TIP</h3>
                <p className="text-sm">
                  Use the hamburger menu in the top left to quickly navigate between sections. You can also change the
                  theme and accent color to match your style.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculator" className="space-y-6 mt-6">
          <Card className="card-sharp border-gold">
            <CardHeader>
              <CardTitle className="gangster-font text-gold">PRICE CALCULATOR</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The Price Calculator helps you find the optimal price points for your product. It shows you different
                markup percentages and how they affect your profit, break-even point, and ROI.
              </p>

              <div className="space-y-4 mt-4">
                <h3 className="gangster-font text-gold">HOW TO USE</h3>

                <ol className="list-decimal pl-5 space-y-2">
                  <li>Enter your wholesale cost per ounce in the setup tab</li>
                  <li>The calculator will show you different markup percentages</li>
                  <li>See how each price point affects your profit and break-even point</li>
                  <li>Choose the price that works best for your business</li>
                </ol>

                <div className="bg-smoke p-4 mt-4">
                  <h3 className="gangster-font text-gold mb-2">KEY TERMS</h3>

                  <div className="space-y-2">
                    <div>
                      <strong className="text-gold">Markup</strong>: The percentage added to your cost to set your price
                    </div>
                    <div>
                      <strong className="text-gold">Break-even</strong>: How much product you need to move to cover
                      costs
                    </div>
                    <div>
                      <strong className="text-gold">ROI</strong>: Return on Investment - how hard your money is working
                      for you
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6 mt-6">
          <Card className="card-sharp border-gold">
            <CardHeader>
              <CardTitle className="gangster-font text-gold">INVENTORY MANAGEMENT</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
             <p>
                The Inventory tab helps you keep track of your product. You can add new inventory, update quantities,
                and see what's running low.
              </p>

              <div className="space-y-4 mt-4">
                <h3 className="gangster-font text-gold">HOW TO USE</h3>

                <ol className="list-decimal pl-5 space-y-2">
                  <li>Click "Add Product" to add new inventory</li>
                  <li>Enter the product name, quantity, and cost</li>
                  <li>Your inventory will automatically update when you make sales</li>
                  <li>The system will warn you when inventory is running low</li>
                  <li>Click the delete button to remove a product</li>
                </ol>

                <div className="bg-smoke p-4 mt-4">
                  <h3 className="gangster-font text-gold mb-2">PRO TIP</h3>
                  <p className="text-sm">
                    Keep your inventory updated in real-time. Knowing exactly what you have on hand prevents missed
                    sales and helps you restock at the right time.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6 mt-6">
          <Card className="card-sharp border-gold">
            <CardHeader>
              <CardTitle className="gangster-font text-gold">CLIENT MANAGEMENT</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The Clients tab helps you manage your customer relationships. Keep track of who owes you money, when
                payments are due, and payment history.
              </p>

              <div className="space-y-4 mt-4">
                <h3 className="gangster-font text-gold">HOW TO USE</h3>

                <ol className="list-decimal pl-5 space-y-2">
                  <li>Click "Add Client" to add a new customer</li>
                  <li>Enter their contact information and any notes</li>
                  <li>When a client buys on credit, their balance will update automatically</li>
                  <li>Use the Register tab to record payments</li>
                  <li>View payment history and current balance for each client</li>
                </ol>

                <div className="bg-smoke p-4 mt-4">
                  <h3 className="gangster-font text-gold mb-2">PRO TIP</h3>
                  <p className="text-sm">
                    Always set clear due dates for payments and follow up consistently. Respect in this business comes
                    from getting paid on time.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="register" className="space-y-6 mt-6">
          <Card className="card-sharp border-gold">
            <CardHeader>
              <CardTitle className="gangster-font text-gold">CASH REGISTER</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The Cash Register tab is where you record your daily sales and collect payments from clients. It
                automatically updates your inventory and client balances.
              </p>

              <div className="space-y-4 mt-4">
                <h3 className="gangster-font text-gold">HOW TO USE</h3>

                <ol className="list-decimal pl-5 space-y-2">
                  <li>Select "Quick Sale" to record a product sale</li>
                  <li>Choose the product, quantity, and payment method</li>
                  <li>Select a client if the sale is for a specific customer</li>
                  <li>Use "Collect Payment" to record payments from clients who owe money</li>
                  <li>All transactions are automatically tracked for your reports</li>
                </ol>

                <div className="bg-smoke p-4 mt-4">
                  <h3 className="gangster-font text-gold mb-2">PRO TIP</h3>
                  <p className="text-sm">
                    Record every transaction immediately. Accurate records keep your business running smooth and help
                    you spot trends in your sales.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-6 mt-6">
          <Card className="card-sharp border-gold">
            <CardHeader>
              <CardTitle className="gangster-font text-gold">MONTHLY FORECAST</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
             <p>
                The Forecast tab shows you where your business is heading. Track your progress toward monthly goals,
                identify trends, and make data-driven decisions.
              </p>

              <div className="space-y-4 mt-4">
                <h3 className="gangster-font text-gold">HOW TO USE</h3>

                <ol className="list-decimal pl-5 space-y-2">
                  <li>View your projected revenue and profit for the month</li>
                  <li>See how close you are to hitting your target profit</li>
                  <li>Check your inventory levels and days remaining</li>
                  <li>Analyze sales by product to identify your best sellers</li>
                  <li>Track your accounts receivable and overdue payments</li>
                </ol>

                <div className="bg-smoke p-4 mt-4">
                  <h3 className="gangster-font text-gold mb-2">PRO TIP</h3>
                  <p className="text-sm">
                    Use the forecast data to plan your inventory purchases. Buy more of what sells best and adjust your
                    prices based on demand.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
