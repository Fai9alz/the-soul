-- ─── 003 — Application Unit Link ─────────────────────────────────────────────
-- Adds optional unit link to the `applications` table so applications can be
-- submitted either:
--   • As a "general application" from the navbar / hero / Apply section
--     → unit_id and unit_reference are both NULL
--   • From a specific unit card / unit detail page
--     → unit_id stores the units.id foreign key
--     → unit_reference stores the human-readable code (e.g. "SH-201"),
--       denormalized so admin records stay readable even if the unit is later
--       deleted.
--
-- Both columns are nullable — there is no validation requiring a unit.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS unit_id        uuid NULL REFERENCES units(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS unit_reference text NULL;

-- Index for admin filtering by unit
CREATE INDEX IF NOT EXISTS applications_unit_id_idx        ON applications (unit_id);
CREATE INDEX IF NOT EXISTS applications_unit_reference_idx ON applications (unit_reference);
