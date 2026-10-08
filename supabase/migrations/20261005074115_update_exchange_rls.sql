DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exchange_listings' AND column_name = 'user_id') THEN
    ALTER TABLE exchange_listings ADD COLUMN user_id uuid DEFAULT auth.uid();
  END IF;
END $$;

DROP POLICY IF EXISTS "anon_select_exchange" ON exchange_listings;
DROP POLICY IF EXISTS "anon_insert_exchange" ON exchange_listings;
DROP POLICY IF EXISTS "anon_update_exchange" ON exchange_listings;
DROP POLICY IF EXISTS "anon_delete_exchange" ON exchange_listings;

DROP POLICY IF EXISTS "auth_select_exchange" ON exchange_listings;
CREATE POLICY "auth_select_exchange" ON exchange_listings FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_exchange" ON exchange_listings;
CREATE POLICY "auth_insert_exchange" ON exchange_listings FOR INSERT
TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_exchange" ON exchange_listings;
CREATE POLICY "auth_update_exchange" ON exchange_listings FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_exchange" ON exchange_listings;
CREATE POLICY "auth_delete_exchange" ON exchange_listings FOR DELETE
TO authenticated USING (true);