/*
# Create staff management tables (single-tenant, no auth)

1. New Tables
- `staff_salaries`: Records employee salary information.
  - `id` (uuid, PK)
  - `employee_name` (text, not null)
  - `base_salary` (numeric, not null)
  - `deductions` (numeric, default 0)
  - `net_pay` (numeric, not null — computed as base_salary - deductions on the client)
  - `month` (text — e.g. "1403-07" for tracking which month the salary belongs to)
  - `created_at` (timestamptz)
- `staff_leaves`: Records employee leave requests.
  - `id` (uuid, PK)
  - `employee_name` (text, not null)
  - `leave_date` (timestamptz, not null)
  - `reason` (text)
  - `created_at` (timestamptz)
- `staff_consumptions`: Records items taken from the supermarket by employees.
  - `id` (uuid, PK)
  - `employee_name` (text, not null)
  - `product_id` (text, references products)
  - `product_name` (text, not null)
  - `quantity` (integer, not null)
  - `date` (timestamptz, not null)
  - `created_at` (timestamptz)

2. Security
- Enable RLS on all three tables.
- Allow anon + authenticated full CRUD (single-tenant, password-gated app, data is intentionally shared).
*/

CREATE TABLE IF NOT EXISTS staff_salaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_name text NOT NULL,
  base_salary numeric NOT NULL DEFAULT 0,
  deductions numeric NOT NULL DEFAULT 0,
  net_pay numeric NOT NULL DEFAULT 0,
  month text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE staff_salaries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_staff_salaries" ON staff_salaries;
CREATE POLICY "anon_select_staff_salaries" ON staff_salaries FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_staff_salaries" ON staff_salaries;
CREATE POLICY "anon_insert_staff_salaries" ON staff_salaries FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_staff_salaries" ON staff_salaries;
CREATE POLICY "anon_update_staff_salaries" ON staff_salaries FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_staff_salaries" ON staff_salaries;
CREATE POLICY "anon_delete_staff_salaries" ON staff_salaries FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS staff_leaves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_name text NOT NULL,
  leave_date timestamptz NOT NULL,
  reason text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE staff_leaves ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_staff_leaves" ON staff_leaves;
CREATE POLICY "anon_select_staff_leaves" ON staff_leaves FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_staff_leaves" ON staff_leaves;
CREATE POLICY "anon_insert_staff_leaves" ON staff_leaves FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_staff_leaves" ON staff_leaves;
CREATE POLICY "anon_update_staff_leaves" ON staff_leaves FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_staff_leaves" ON staff_leaves;
CREATE POLICY "anon_delete_staff_leaves" ON staff_leaves FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS staff_consumptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_name text NOT NULL,
  product_id text,
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE staff_consumptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_staff_consumptions" ON staff_consumptions;
CREATE POLICY "anon_select_staff_consumptions" ON staff_consumptions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_staff_consumptions" ON staff_consumptions;
CREATE POLICY "anon_insert_staff_consumptions" ON staff_consumptions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_staff_consumptions" ON staff_consumptions;
CREATE POLICY "anon_update_staff_consumptions" ON staff_consumptions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_staff_consumptions" ON staff_consumptions;
CREATE POLICY "anon_delete_staff_consumptions" ON staff_consumptions FOR DELETE
  TO anon, authenticated USING (true);
