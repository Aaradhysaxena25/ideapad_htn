CREATE TABLE IF NOT EXISTS nearby_detections (
  id bigserial PRIMARY KEY,
  spacecraft_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  detected_object text NOT NULL,
  confidence numeric NOT NULL DEFAULT 0.0,
  material text DEFAULT '',
  condition text DEFAULT '',
  recommended_action text DEFAULT '',
  auto_listed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE nearby_detections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_detections" ON nearby_detections;
CREATE POLICY "select_own_detections" ON nearby_detections FOR SELECT
TO authenticated USING (auth.uid() = spacecraft_id);

DROP POLICY IF EXISTS "insert_own_detections" ON nearby_detections;
CREATE POLICY "insert_own_detections" ON nearby_detections FOR INSERT
TO authenticated WITH CHECK (auth.uid() = spacecraft_id);

DROP POLICY IF EXISTS "update_own_detections" ON nearby_detections;
CREATE POLICY "update_own_detections" ON nearby_detections FOR UPDATE
TO authenticated USING (auth.uid() = spacecraft_id) WITH CHECK (auth.uid() = spacecraft_id);

DROP POLICY IF EXISTS "delete_own_detections" ON nearby_detections;
CREATE POLICY "delete_own_detections" ON nearby_detections FOR DELETE
TO authenticated USING (auth.uid() = spacecraft_id);