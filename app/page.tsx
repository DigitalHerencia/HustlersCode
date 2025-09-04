"use client"

import { useState, useEffect } from "react"
import CashRegister from "@/components/cash-register"
import { initializeDefaultBusinessData } from "@/app/actions"

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [showTips, setShowTips] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize database with default data if needed
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true)
      try {
        // Initialize default business data if none exists
        await initializeDefaultBusinessData()
        setIsLoading(false)
      } catch (err) {
        console.error("Initialization error:", err)
        setError("Failed to initialize application data. Using demo data instead.")
        setIsLoading(false)
      }
    }

    initialize()
  }, [])

  const handleHideTips = () => {
    setShowTips(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container py-4">
      {error && (
        <div
          className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Note: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <CashRegister showTips={showTips} onHideTips={handleHideTips} />
    </div>
  )
}
