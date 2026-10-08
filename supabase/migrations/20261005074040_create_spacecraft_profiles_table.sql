CREATE TABLE IF NOT EXISTS spacecraft_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  spacecraft_name text NOT NULL,
  mission_type text NOT NULL DEFAULT 'Mars Surface',
  coordinates text NOT NULL DEFAULT 'Sector 7-G',
  crew_size integer NOT NULL DEFAULT 4,
  status text NOT NULL DEFAULT 'Active',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE spacecraft_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON spacecraft_profiles;
CREATE POLICY "select_own_profile" ON spacecraft_profiles FOR SELECT
TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON spacecraft_profiles;
CREATE POLICY "insert_own_profile" ON spacecraft_profiles FOR INSERT
TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON spacecraft_profiles;
CREATE POLICY "update_own_profile" ON spacecraft_profiles FOR UPDATE
TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON spacecraft_profiles;
CREATE POLICY "delete_own_profile" ON spacecraft_profiles FOR DELETE
TO authenticated USING (auth.uid() = id);