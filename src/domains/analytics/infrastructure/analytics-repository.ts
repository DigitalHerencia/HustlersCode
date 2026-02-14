import type { BusinessData, ScenarioData } from "@/lib/types"
import { dbQuery, toCamelCase, toSnakeCase } from "@/src/domains/shared/infrastructure/db"

export async function findLatestBusinessData(): Promise<BusinessData | null> {
  const result = await dbQuery(`SELECT * FROM business_data ORDER BY created_at DESC LIMIT 1`)
  if (result.rows.length === 0) return null
  return toCamelCase(result.rows[0])
}

export async function insertBusinessData(data: Omit<BusinessData, "id" | "createdAt" | "updatedAt">): Promise<BusinessData> {
  const snakeCaseData = toSnakeCase(data)
  const result = await dbQuery(
    `INSERT INTO business_data
     (wholesale_price_per_oz, target_profit_per_month, operating_expenses)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [snakeCaseData.wholesale_price_per_oz, snakeCaseData.target_profit_per_month, snakeCaseData.operating_expenses],
  )

  return toCamelCase(result.rows[0])
}

export async function updateBusinessDataRecord(id: string, data: Partial<BusinessData>): Promise<BusinessData | null> {
  const snakeCaseData = toSnakeCase(data)
  const updates: string[] = []
  const values: unknown[] = []
  let paramIndex = 1

  if (snakeCaseData.wholesale_price_per_oz !== undefined) {
    updates.push(`wholesale_price_per_oz = $${paramIndex}`)
    values.push(snakeCaseData.wholesale_price_per_oz)
    paramIndex++
  }
  if (snakeCaseData.target_profit_per_month !== undefined) {
    updates.push(`target_profit_per_month = $${paramIndex}`)
    values.push(snakeCaseData.target_profit_per_month)
    paramIndex++
  }
  if (snakeCaseData.operating_expenses !== undefined) {
    updates.push(`operating_expenses = $${paramIndex}`)
    values.push(snakeCaseData.operating_expenses)
    paramIndex++
  }

  updates.push(`updated_at = NOW()`)
  values.push(id)

  const result = await dbQuery(`UPDATE business_data SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`, values)
  if (result.rows.length === 0) return null
  return toCamelCase(result.rows[0])
}

export async function findScenarios(): Promise<ScenarioData[]> {
  const scenariosResult = await dbQuery(`SELECT * FROM scenarios ORDER BY created_at DESC`)
  const scenarios = toCamelCase(scenariosResult.rows)

  for (const scenario of scenarios) {
    const salespeopleResult = await dbQuery(`SELECT * FROM salespeople WHERE scenario_id = $1`, [scenario.id])
    scenario.salespeople = toCamelCase(salespeopleResult.rows)
  }

  return scenarios
}

export async function findScenarioById(id: string): Promise<ScenarioData | null> {
  const scenarioResult = await dbQuery(`SELECT * FROM scenarios WHERE id = $1`, [id])
  if (scenarioResult.rows.length === 0) return null

  const scenario = toCamelCase(scenarioResult.rows[0])
  const salespeopleResult = await dbQuery(`SELECT * FROM salespeople WHERE scenario_id = $1`, [id])
  scenario.salespeople = toCamelCase(salespeopleResult.rows)
  return scenario
}

export async function insertScenario(data: Omit<ScenarioData, "id" | "createdAt" | "updatedAt">): Promise<ScenarioData> {
  const { salespeople, ...scenarioData } = data
  const snakeCaseData = toSnakeCase(scenarioData)

  const scenarioResult = await dbQuery(
    `INSERT INTO scenarios
     (name, description, wholesale_price, retail_price, quantity, time_period, expenses)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      snakeCaseData.name,
      snakeCaseData.description,
      snakeCaseData.wholesale_price,
      snakeCaseData.retail_price,
      snakeCaseData.quantity,
      snakeCaseData.time_period,
      snakeCaseData.expenses,
    ],
  )

  const scenario = toCamelCase(scenarioResult.rows[0])

  if (salespeople && salespeople.length > 0) {
    for (const person of salespeople) {
      const snakeCasePerson = toSnakeCase(person)
      await dbQuery(
        `INSERT INTO salespeople
         (scenario_id, name, commission_rate, sales_quantity)
         VALUES ($1, $2, $3, $4)`,
        [scenario.id, snakeCasePerson.name, snakeCasePerson.commission_rate, snakeCasePerson.sales_quantity],
      )
    }
  }

  return scenario
}

export async function updateScenarioRecord(id: string, data: Partial<ScenarioData>): Promise<void> {
  const { salespeople, ...scenarioData } = data
  const snakeCaseData = toSnakeCase(scenarioData)

  if (Object.keys(snakeCaseData).length > 0) {
    const updates: string[] = []
    const values: unknown[] = []
    let paramIndex = 1

    for (const [key, value] of Object.entries(snakeCaseData)) {
      updates.push(`${key} = $${paramIndex}`)
      values.push(value)
      paramIndex++
    }

    updates.push(`updated_at = NOW()`)
    values.push(id)
    await dbQuery(`UPDATE scenarios SET ${updates.join(", ")} WHERE id = $${paramIndex}`, values)
  }

  if (salespeople) {
    await dbQuery(`DELETE FROM salespeople WHERE scenario_id = $1`, [id])

    for (const person of salespeople) {
      const snakeCasePerson = toSnakeCase(person)
      await dbQuery(
        `INSERT INTO salespeople
         (scenario_id, name, commission_rate, sales_quantity)
         VALUES ($1, $2, $3, $4)`,
        [id, snakeCasePerson.name, snakeCasePerson.commission_rate, snakeCasePerson.sales_quantity],
      )
    }
  }
}

export async function deleteScenarioRecord(id: string): Promise<void> {
  await dbQuery(`DELETE FROM salespeople WHERE scenario_id = $1`, [id])
  await dbQuery(`DELETE FROM scenarios WHERE id = $1`, [id])
}
