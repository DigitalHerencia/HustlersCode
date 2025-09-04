"use client"

import { useState, useEffect } from "react"
import { type InventoryItem, sampleInventory } from "@/lib/data"

// This hook provides access to the inventory data
// In a real application, this would likely fetch from a database or API
export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])

  useEffect(() => {
    // In a real app, this would be a fetch call or database query
    // For now, we'll use the sample data
    const storedInventory = localStorage.getItem("inventory")
    if (storedInventory) {
      try {
        setInventory(JSON.parse(storedInventory))
      } catch (error) {
        console.error("Failed to parse inventory from localStorage:", error)
        setInventory(sampleInventory)
      }
    } else {
      setInventory(sampleInventory)
    }
  }, [])

  const updateInventory = (newInventory: InventoryItem[]) => {
    setInventory(newInventory)
    localStorage.setItem("inventory", JSON.stringify(newInventory))
  }

  const addInventoryItem = (item: InventoryItem) => {
    const newInventory = [...inventory, item]
    updateInventory(newInventory)
  }

  const updateInventoryItem = (updatedItem: InventoryItem) => {
    const newInventory = inventory.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    updateInventory(newInventory)
  }

  const deleteInventoryItem = (itemId: string) => {
    const newInventory = inventory.filter((item) => item.id !== itemId)
    updateInventory(newInventory)
  }

  return {
    inventory,
    updateInventory,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
  }
}
