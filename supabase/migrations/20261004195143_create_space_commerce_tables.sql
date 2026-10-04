/*
# Space Circular Commerce Platform - Database Schema

1. New Tables
- `inventory`: Stores all scanned resources/items with their AI analysis results
  - id (serial, primary key)
  - object_name (text): Name of detected object
  - category (text): Category (Storage, Tool, Equipment, Container, etc.)
  - material (text): Material type (Plastic, Metal, Carbon Fiber, etc.)
  - condition (text): Condition (Good, Damaged, Critical, etc.)
  - damage_level (text): Damage severity (None, Low, Medium, High)
  - quantity (int): Number of items
  - location (text): Mission location (Mars Habitat A, Moon Base 1, etc.)
  - recommended_action (text): REPAIR, REUSE, RECYCLE, EXCHANGE, 3D_PRINT, DISCARD
  - reason (text): Explanation for the recommendation
  - status (text): Available, Repaired, Recycled, Exchanged, Printed, Discarded
  - reusable (boolean), repairable (boolean), recyclable (boolean), three_d_print_potential (boolean)
  - image_url (text): Optional stored image URL
  - created_at (timestamptz)

- `exchange_listings`: Marketplace listings for resource exchange
  - id (serial, primary key)
  - item_name (text)
  - material (text)
  - quantity (int)
  - location (text)
  - status (text): Available, Requested, Transferred
  - description (text)
  - listed_by (text): Astronaut/mission module name
  - requested_by (text): Who requested it
  - created_at (timestamptz)

- `print_jobs`: 3D printing job records
  - id (serial, primary key)
  - part_name (text)
  - required_material (text)
  - estimated_print_time (text)
  - estimated_material_amount (text)
  - design_available (boolean)
  - status (text): Pending, Printing, Completed, Failed
  - source_item (text): What item triggered this print job
  - created_at (timestamptz)

- `scan_logs`: Audit trail of all scans performed
  - id (serial, primary key)
  - detected_object (text)
  - confidence (numeric)
  - material (text)
  - condition (text)
  - recommended_action (text)
  - created_at (timestamptz)

2. Security
- RLS enabled on all tables.
- Single-tenant (no auth) — all policies use TO anon, authenticated with USING (true) since data is intentionally shared/public for this prototype.
*/