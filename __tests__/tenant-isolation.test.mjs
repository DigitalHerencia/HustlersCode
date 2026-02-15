import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const schema = fs.readFileSync(path.join(process.cwd(), 'db/schema.sql'), 'utf8')

test('tenant-scoped tables include tenant_id columns', () => {
  const required = [
    'business_data',
    'scenarios',
    'salespeople',
    'inventory_items',
    'customers',
    'payments',
    'transactions',
    'accounts',
  ]

  for (const table of required) {
    const matcher = new RegExp(`CREATE TABLE IF NOT EXISTS ${table} \\([\\s\\S]*?tenant_id UUID NOT NULL`, 'm')
    assert.ok(matcher.test(schema), `Expected tenant_id in ${table}`)
  }
})

test('cross-tenant FK constraints are composite', () => {
  assert.match(schema, /FOREIGN KEY \(tenant_id, customer_id\) REFERENCES customers\(tenant_id, id\)/)
  assert.match(schema, /FOREIGN KEY \(tenant_id, scenario_id\) REFERENCES scenarios\(tenant_id, id\)/)
})
