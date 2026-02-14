import type { BusinessData, ScenarioData } from "@/lib/types"
import {
  deleteScenarioRecord,
  findLatestBusinessData,
  findScenarioById,
  findScenarios,
  insertBusinessData,
  insertScenario,
  updateBusinessDataRecord,
  updateScenarioRecord,
} from "@/src/domains/analytics/infrastructure/analytics-repository"
import { buildDefaultBusinessData } from "@/src/domains/analytics/domain/analytics-rules"
import { withTransaction } from "@/src/domains/shared/infrastructure/db"

export async function getBusinessData() {
  return findLatestBusinessData()
}

export async function saveBusinessData(data: Omit<BusinessData, "id" | "createdAt" | "updatedAt">) {
  return insertBusinessData(data)
}

export async function updateBusinessData(id: string, data: Partial<BusinessData>) {
  return updateBusinessDataRecord(id, data)
}

export async function initializeBusinessData() {
  const existing = await findLatestBusinessData()
  if (existing) return existing

  return insertBusinessData(buildDefaultBusinessData())
}

export async function listScenarios() {
  return findScenarios()
}

export async function getScenario(id: string) {
  return findScenarioById(id)
}

export async function createScenario(data: Omit<ScenarioData, "id" | "createdAt" | "updatedAt">) {
  return withTransaction(async () => {
    const scenario = await insertScenario(data)
    return findScenarioById(scenario.id)
  })
}

export async function updateScenario(id: string, data: Partial<ScenarioData>) {
  return withTransaction(async () => {
    await updateScenarioRecord(id, data)
    return findScenarioById(id)
  })
}

export async function deleteScenario(id: string) {
  await withTransaction(async () => {
    await deleteScenarioRecord(id)
  })
}
