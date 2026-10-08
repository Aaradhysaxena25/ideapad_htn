DROP POLICY IF EXISTS "anon_select_print_jobs" ON print_jobs;
DROP POLICY IF EXISTS "anon_insert_print_jobs" ON print_jobs;
DROP POLICY IF EXISTS "anon_update_print_jobs" ON print_jobs;
DROP POLICY IF EXISTS "anon_delete_print_jobs" ON print_jobs;

DROP POLICY IF EXISTS "auth_select_print_jobs" ON print_jobs;
CREATE POLICY "auth_select_print_jobs" ON print_jobs FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_print_jobs" ON print_jobs;
CREATE POLICY "auth_insert_print_jobs" ON print_jobs FOR INSERT
TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_print_jobs" ON print_jobs;
CREATE POLICY "auth_update_print_jobs" ON print_jobs FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_print_jobs" ON print_jobs;
CREATE POLICY "auth_delete_print_jobs" ON print_jobs FOR DELETE
TO authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_scan_logs" ON scan_logs;
DROP POLICY IF EXISTS "anon_insert_scan_logs" ON scan_logs;
DROP POLICY IF EXISTS "anon_update_scan_logs" ON scan_logs;
DROP POLICY IF EXISTS "anon_delete_scan_logs" ON scan_logs;

DROP POLICY IF EXISTS "auth_select_scan_logs" ON scan_logs;
CREATE POLICY "auth_select_scan_logs" ON scan_logs FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_scan_logs" ON scan_logs;
CREATE POLICY "auth_insert_scan_logs" ON scan_logs FOR INSERT
TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_scan_logs" ON scan_logs;
CREATE POLICY "auth_update_scan_logs" ON scan_logs FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_scan_logs" ON scan_logs;
CREATE POLICY "auth_delete_scan_logs" ON scan_logs FOR DELETE
TO authenticated USING (true);