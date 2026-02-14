INSERT INTO business_data (wholesale_price_per_oz, target_profit_per_month, operating_expenses)
VALUES (120.00, 3000.00, 800.00);

INSERT INTO inventory_items (
  name,
  description,
  quantity_g,
  quantity_oz,
  quantity_kg,
  purchase_date,
  cost_per_oz,
  total_cost,
  reorder_threshold_g
)
VALUES (
  'Test Product',
  'Seeded product for deterministic tests',
  560.00,
  19.75,
  0.56,
  CURRENT_DATE,
  85.00,
  1678.75,
  100.00
);

INSERT INTO customers (name, phone, email, amount_owed, due_date, status, notes)
VALUES ('Test Customer', '555-000-1234', 'customer@example.com', 75.00, CURRENT_DATE + INTERVAL '7 day', 'unpaid', 'Seeded for tests');

INSERT INTO accounts (name, type, balance, description)
VALUES ('Test Cash Account', 'asset', 2500.00, 'Seeded cash account for tests');
