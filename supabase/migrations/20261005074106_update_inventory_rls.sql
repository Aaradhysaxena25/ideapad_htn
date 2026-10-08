DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory' AND column_name = 'user_id') THEN
    ALTER TABLE inventory ADD COLUMN user_id uuid DEFAULT auth.uid();
  END IF;
END $$;

DROP POLICY IF EXISTS "anon_select_inventory" ON inventory;
DROP POLICY IF EXISTS "anon_insert_inventory" ON inventory;
DROP POLICY IF EXISTS "anon_update_inventory" ON inventory;
DROP POLICY IF EXISTS "anon_delete_inventory" ON inventory;

DROP POLICY IF EXISTS "auth_select_inventory" ON inventory;
CREATE POLICY "auth_select_inventory" ON inventory FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_inventory" ON inventory;
CREATE POLICY "auth_insert_inventory" ON inventory FOR INSERT
TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_inventory" ON inventory;
CREATE POLICY "auth_update_inventory" ON inventory FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_inventory" ON inventory;
CREATE POLICY "auth_delete_inventory" ON inventory FOR DELETE
TO authenticated USING (true);