-- Database schema for Retail Analytics Utility

-- Authorization Roles
CREATE TABLE IF NOT EXISTS auth_roles (
  slug VARCHAR(64) PRIMARY KEY,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auth_permissions (
  slug VARCHAR(64) PRIMARY KEY,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auth_role_permissions (
  role_slug VARCHAR(64) NOT NULL REFERENCES auth_roles(slug) ON DELETE CASCADE,
  permission_slug VARCHAR(64) NOT NULL REFERENCES auth_permissions(slug) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (role_slug, permission_slug)
);

CREATE TABLE IF NOT EXISTS auth_role_bindings (
  tenant_id VARCHAR(128) NOT NULL,
  principal_id VARCHAR(128) NOT NULL,
  role_slug VARCHAR(64) NOT NULL REFERENCES auth_roles(slug) ON DELETE CASCADE,
  source VARCHAR(128) NOT NULL DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, principal_id, role_slug)
);

-- Business Data
CREATE TABLE IF NOT EXISTS business_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(128) NOT NULL,
  wholesale_price_per_oz DECIMAL(10, 2) NOT NULL DEFAULT 100,
  target_profit_per_month DECIMAL(10, 2) NOT NULL DEFAULT 2000,
  operating_expenses DECIMAL(10, 2) NOT NULL DEFAULT 500,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Scenarios
CREATE TABLE IF NOT EXISTS scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(128) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  wholesale_price DECIMAL(10, 2) NOT NULL,
  retail_price DECIMAL(10, 2) NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  time_period VARCHAR(50) NOT NULL,
  expenses DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Salespeople
CREATE TABLE IF NOT EXISTS salespeople (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  tenant_id VARCHAR(128) NOT NULL,
  name VARCHAR(255) NOT NULL,
  commission_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  sales_quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Inventory Items
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(128) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity_g DECIMAL(10, 2) NOT NULL DEFAULT 0,
  quantity_oz DECIMAL(10, 2) NOT NULL DEFAULT 0,
  quantity_kg DECIMAL(10, 2) NOT NULL DEFAULT 0,
  purchase_date DATE NOT NULL,
  cost_per_oz DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  reorder_threshold_g DECIMAL(10, 2) NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(128) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  amount_owed DECIMAL(10, 2) NOT NULL DEFAULT 0,
  due_date DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'unpaid',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  tenant_id VARCHAR(128) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  method VARCHAR(50) NOT NULL DEFAULT 'cash',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(128) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  type VARCHAR(50) NOT NULL,
  inventory_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
  inventory_name VARCHAR(255),
  quantity_grams DECIMAL(10, 2) NOT NULL DEFAULT 0,
  price_per_gram DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  profit DECIMAL(10, 2) NOT NULL DEFAULT 0,
  payment_method VARCHAR(50) NOT NULL DEFAULT 'cash',
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Accounts
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(128) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'asset',
  balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Seed roles and permissions
INSERT INTO auth_roles (slug, description) VALUES
  ('owner', 'Tenant owner with full permissions'),
  ('admin', 'Tenant admin with broad write access'),
  ('analyst', 'Reporting and read-only analytical access'),
  ('operator', 'Operational write access for day-to-day changes'),
  ('viewer', 'Read-only access')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO auth_permissions (slug, description) VALUES
  ('business_data:write', 'Create/update business data'),
  ('scenario:create', 'Create scenario records'),
  ('scenario:update', 'Update scenario records'),
  ('scenario:delete', 'Delete scenario records'),
  ('inventory:create', 'Create inventory records'),
  ('inventory:update', 'Update inventory records'),
  ('inventory:delete', 'Delete inventory records'),
  ('customer:create', 'Create customer records'),
  ('customer:update', 'Update customer records'),
  ('customer:delete', 'Delete customer records'),
  ('payment:create', 'Create payment records'),
  ('transaction:create', 'Create transaction records'),
  ('account:create', 'Create account records'),
  ('account:update', 'Update account records'),
  ('account:delete', 'Delete account records'),
  ('sensitive:read', 'Read sensitive operational data'),
  ('reporting:export', 'Export tenant reports')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO auth_role_permissions (role_slug, permission_slug)
SELECT role_slug, permission_slug
FROM (VALUES
  ('owner', 'business_data:write'), ('owner', 'scenario:create'), ('owner', 'scenario:update'), ('owner', 'scenario:delete'),
  ('owner', 'inventory:create'), ('owner', 'inventory:update'), ('owner', 'inventory:delete'), ('owner', 'customer:create'),
  ('owner', 'customer:update'), ('owner', 'customer:delete'), ('owner', 'payment:create'), ('owner', 'transaction:create'),
  ('owner', 'account:create'), ('owner', 'account:update'), ('owner', 'account:delete'), ('owner', 'sensitive:read'), ('owner', 'reporting:export'),
  ('admin', 'business_data:write'), ('admin', 'scenario:create'), ('admin', 'scenario:update'), ('admin', 'scenario:delete'),
  ('admin', 'inventory:create'), ('admin', 'inventory:update'), ('admin', 'inventory:delete'), ('admin', 'customer:create'),
  ('admin', 'customer:update'), ('admin', 'customer:delete'), ('admin', 'payment:create'), ('admin', 'transaction:create'),
  ('admin', 'account:create'), ('admin', 'account:update'), ('admin', 'account:delete'), ('admin', 'sensitive:read'), ('admin', 'reporting:export'),
  ('analyst', 'sensitive:read'), ('analyst', 'reporting:export'),
  ('operator', 'scenario:create'), ('operator', 'scenario:update'), ('operator', 'inventory:create'), ('operator', 'inventory:update'),
  ('operator', 'customer:create'), ('operator', 'customer:update'), ('operator', 'payment:create'), ('operator', 'transaction:create'), ('operator', 'sensitive:read'),
  ('viewer', 'sensitive:read')
) AS seeds(role_slug, permission_slug)
ON CONFLICT (role_slug, permission_slug) DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_role_bindings_principal ON auth_role_bindings(principal_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_business_data_tenant ON business_data(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_name ON inventory_items(tenant_id, name);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(tenant_id, name);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(tenant_id, date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(tenant_id, type);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(tenant_id, customer_id);
CREATE INDEX IF NOT EXISTS idx_salespeople_scenario_id ON salespeople(tenant_id, scenario_id);
