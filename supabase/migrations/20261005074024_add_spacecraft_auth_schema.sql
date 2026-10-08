/*
# Spacecraft profiles + nearby detections schema

1. New Tables
- `spacecraft_profiles`: Extended profile info for each registered spacecraft/mission
  - id (uuid, primary key, references auth.users)
  - spacecraft_name (text): e.g. "Mars Habitat Alpha"
  - mission_type (text): e.g. "Mars Surface", "Lunar Orbit", "Deep Space"
  - coordinates (text): Simulated sector coordinates for proximity
  - crew_size (integer)
  - status (text): Active, Standby, Emergency
  - created_at (timestamptz)

- `nearby_detections`: Continuous auto-scan results of surrounding machinery
  - id (bigserial, primary key)
  - spacecraft_id (uuid, references auth.users, defaults to auth.uid())
  - detected_object (text)
  - confidence (numeric)
  - material (text)
  - condition (text)
  - recommended_action (text)
  - auto_listed (boolean, default false): whether the item was auto-listed on exchange
  - created_at (timestamptz)

2. Modified Tables
- `inventory`: Add `user_id` column for ownership, defaults to auth.uid()
- `exchange_listings`: Add `user_id` column for ownership, defaults to auth.uid()

3. Security
- spacecraft_profiles: authenticated-only, owner-scoped (each spacecraft sees only its own profile)
- nearby_detections: authenticated-only, owner-scoped (each spacecraft sees only its own detections)
- inventory: Switch from anon+authenticated open access to authenticated owner-scoped
- exchange_listings: Switch from anon+authenticated open access to authenticated owner-scoped (but all authenticated users can READ all listings for the marketplace to work)
- print_jobs: Switch to authenticated-only, but all authenticated users can read
- scan_logs: Switch to authenticated-only, all authenticated can read
*/