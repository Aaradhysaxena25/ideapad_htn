CREATE TABLE IF NOT EXISTS print_jobs (
  id bigserial PRIMARY KEY,
  part_name text NOT NULL,
  required_material text NOT NULL DEFAULT 'PLA',
  estimated_print_time text NOT NULL DEFAULT '2h 30m',
  estimated_material_amount text NOT NULL DEFAULT '50g',
  design_available boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'Pending',
  source_item text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE print_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_print_jobs" ON print_jobs;
CREATE POLICY "anon_select_print_jobs" ON print_jobs FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_print_jobs" ON print_jobs;
CREATE POLICY "anon_insert_print_jobs" ON print_jobs FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_print_jobs" ON print_jobs;
CREATE POLICY "anon_update_print_jobs" ON print_jobs FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_print_jobs" ON print_jobs;
CREATE POLICY "anon_delete_print_jobs" ON print_jobs FOR DELETE
TO anon, authenticated USING (true);