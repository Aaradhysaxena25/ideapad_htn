CREATE TABLE IF NOT EXISTS inventory (
  id bigserial PRIMARY KEY,
  object_name text NOT NULL,
  category text NOT NULL DEFAULT 'Uncategorized',
  material text NOT NULL DEFAULT 'Unknown',
  condition text NOT NULL DEFAULT 'Unknown',
  damage_level text NOT NULL DEFAULT 'None',
  quantity integer NOT NULL DEFAULT 1,
  location text NOT NULL DEFAULT 'Unknown',
  recommended_action text NOT NULL DEFAULT 'REUSE',
  reason text DEFAULT '',
  status text NOT NULL DEFAULT 'Available',
  reusable boolean NOT NULL DEFAULT false,
  repairable boolean NOT NULL DEFAULT false,
  recyclable boolean NOT NULL DEFAULT false,
  three_d_print_potential boolean NOT NULL DEFAULT false,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_inventory" ON inventory;
CREATE POLICY "anon_select_inventory" ON inventory FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_inventory" ON inventory;
CREATE POLICY "anon_insert_inventory" ON inventory FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_inventory" ON inventory;
CREATE POLICY "anon_update_inventory" ON inventory FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_inventory" ON inventory;
CREATE POLICY "anon_delete_inventory" ON inventory FOR DELETE
TO anon, authenticated USING (true);