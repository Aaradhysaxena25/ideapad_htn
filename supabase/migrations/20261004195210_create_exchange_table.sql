CREATE TABLE IF NOT EXISTS exchange_listings (
  id bigserial PRIMARY KEY,
  item_name text NOT NULL,
  material text NOT NULL DEFAULT 'Unknown',
  quantity integer NOT NULL DEFAULT 1,
  location text NOT NULL DEFAULT 'Unknown',
  status text NOT NULL DEFAULT 'Available',
  description text DEFAULT '',
  listed_by text NOT NULL DEFAULT 'Mars Habitat A',
  requested_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE exchange_listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_exchange" ON exchange_listings;
CREATE POLICY "anon_select_exchange" ON exchange_listings FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_exchange" ON exchange_listings;
CREATE POLICY "anon_insert_exchange" ON exchange_listings FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_exchange" ON exchange_listings;
CREATE POLICY "anon_update_exchange" ON exchange_listings FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_exchange" ON exchange_listings;
CREATE POLICY "anon_delete_exchange" ON exchange_listings FOR DELETE
TO anon, authenticated USING (true);