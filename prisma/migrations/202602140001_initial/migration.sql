CREATE TABLE IF NOT EXISTS "business_data" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "wholesale_price_per_oz" DECIMAL(10, 2) NOT NULL DEFAULT 100,
  "target_profit_per_month" DECIMAL(10, 2) NOT NULL DEFAULT 2000,
  "operating_expenses" DECIMAL(10, 2) NOT NULL DEFAULT 500,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "scenarios" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "wholesale_price" DECIMAL(10, 2) NOT NULL,
  "retail_price" DECIMAL(10, 2) NOT NULL,
  "quantity" DECIMAL(10, 2) NOT NULL,
  "time_period" VARCHAR(50) NOT NULL,
  "expenses" DECIMAL(10, 2) NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "salespeople" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "scenario_id" UUID NOT NULL REFERENCES "scenarios"("id") ON DELETE CASCADE,
  "name" VARCHAR(255) NOT NULL,
  "commission_rate" DECIMAL(5, 2) NOT NULL DEFAULT 0,
  "sales_quantity" DECIMAL(10, 2) NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "inventory_items" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "quantity_g" DECIMAL(10, 2) NOT NULL DEFAULT 0,
  "quantity_oz" DECIMAL(10, 2) NOT NULL DEFAULT 0,
  "quantity_kg" DECIMAL(10, 2) NOT NULL DEFAULT 0,
  "purchase_date" DATE NOT NULL,
  "cost_per_oz" DECIMAL(10, 2) NOT NULL DEFAULT 0,
  "total_cost" DECIMAL(10, 2) NOT NULL DEFAULT 0,
  "reorder_threshold_g" DECIMAL(10, 2) NOT NULL DEFAULT 100,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "customers" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(50),
  "email" VARCHAR(255),
  "address" TEXT,
  "amount_owed" DECIMAL(10, 2) NOT NULL DEFAULT 0,
  "due_date" DATE,
  "status" VARCHAR(50) NOT NULL DEFAULT 'unpaid',
  "notes" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "payments" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "customer_id" UUID NOT NULL REFERENCES "customers"("id") ON DELETE CASCADE,
  "amount" DECIMAL(10, 2) NOT NULL,
  "date" DATE NOT NULL,
  "method" VARCHAR(50) NOT NULL DEFAULT 'cash',
  "notes" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "transactions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "date" TIMESTAMPTZ(6) NOT NULL,
  "type" VARCHAR(50) NOT NULL,
  "inventory_id" UUID REFERENCES "inventory_items"("id") ON DELETE SET NULL,
  "inventory_name" VARCHAR(255),
  "quantity_grams" DECIMAL(10, 2) NOT NULL DEFAULT 0,
  "price_per_gram" DECIMAL(10, 2) NOT NULL DEFAULT 0,
  "total_price" DECIMAL(10, 2) NOT NULL DEFAULT 0,
  "cost" DECIMAL(10, 2) NOT NULL DEFAULT 0,
  "profit" DECIMAL(10, 2) NOT NULL DEFAULT 0,
  "payment_method" VARCHAR(50) NOT NULL DEFAULT 'cash',
  "customer_id" UUID REFERENCES "customers"("id") ON DELETE SET NULL,
  "customer_name" VARCHAR(255),
  "notes" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "accounts" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "type" VARCHAR(50) NOT NULL DEFAULT 'asset',
  "balance" DECIMAL(10, 2) NOT NULL DEFAULT 0,
  "description" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_inventory_items_name" ON "inventory_items"("name");
CREATE INDEX IF NOT EXISTS "idx_customers_name" ON "customers"("name");
CREATE INDEX IF NOT EXISTS "idx_customers_status" ON "customers"("status");
CREATE INDEX IF NOT EXISTS "idx_transactions_date" ON "transactions"("date");
CREATE INDEX IF NOT EXISTS "idx_transactions_type" ON "transactions"("type");
CREATE INDEX IF NOT EXISTS "idx_payments_customer_id" ON "payments"("customer_id");
CREATE INDEX IF NOT EXISTS "idx_salespeople_scenario_id" ON "salespeople"("scenario_id");
