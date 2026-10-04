CREATE TABLE IF NOT EXISTS scan_logs (
  id bigserial PRIMARY KEY,
  detected_object text NOT NULL,
  confidence numeric NOT NULL DEFAULT 0.0,
  material text DEFAULT '',
  condition text DEFAULT '',
  recommended_action text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE scan_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_scan_logs" ON scan_logs;
CREATE POLICY "anon_select_scan_logs" ON scan_logs FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_scan_logs" ON scan_logs;
CREATE POLICY "anon_insert_scan_logs" ON scan_logs FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_scan_logs" ON scan_logs;
CREATE POLICY "anon_update_scan_logs" ON scan_logs FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_scan_logs" ON scan_logs;
CREATE POLICY "anon_delete_scan_logs" ON scan_logs FOR DELETE
TO anon, authenticated USING (true);