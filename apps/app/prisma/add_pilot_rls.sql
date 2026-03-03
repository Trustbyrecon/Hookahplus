-- Enable RLS on pilot tables (Supabase Security Advisor: rls_disabled_in_public)
-- Run from apps/app: npx prisma db execute --file prisma/add_pilot_rls.sql
-- Or execute in Supabase SQL Editor

ALTER TABLE "pilot_configs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "floorplan_layouts" ENABLE ROW LEVEL SECURITY;

-- Backend-only tables: allow postgres (pooler/Prisma) and service_role.
-- No policy for anon/authenticated = blocks PostgREST access from client keys.
-- If pooler uses postgres.PROJECT_REF, run in SQL Editor and replace postgres with that role.
CREATE POLICY "pilot_configs_backend" ON "pilot_configs"
  FOR ALL TO postgres USING (true) WITH CHECK (true);

CREATE POLICY "floorplan_layouts_backend" ON "floorplan_layouts"
  FOR ALL TO postgres USING (true) WITH CHECK (true);
