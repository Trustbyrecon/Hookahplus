-- Create menu_files table for tracking uploaded menu files
-- Files are linked to leads and deleted after menu data extraction to minimize storage costs

CREATE TABLE IF NOT EXISTS public.menu_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id TEXT, -- Link to reflex_events.id (string, not UUID)
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL, -- "application/pdf" | "image/jpeg" | "image/png"
  file_size INTEGER NOT NULL, -- bytes
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending', -- "pending" | "processing" | "extracted" | "failed" | "deleted"
  extracted_data JSONB, -- Menu/flavor data extracted by agent
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete for retention tracking

  -- Note: lead_id is TEXT because reflex_events.id is TEXT (not UUID)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_menu_files_lead_id ON public.menu_files(lead_id);
CREATE INDEX IF NOT EXISTS idx_menu_files_status ON public.menu_files(status);
CREATE INDEX IF NOT EXISTS idx_menu_files_tenant_id ON public.menu_files(tenant_id);
CREATE INDEX IF NOT EXISTS idx_menu_files_uploaded_at ON public.menu_files(uploaded_at);

-- Enable RLS
ALTER TABLE public.menu_files ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admin/owner can read menu files
CREATE POLICY "Admin can read menu files"
ON public.menu_files FOR SELECT
TO authenticated
USING (
  (SELECT m.role FROM auth.users u 
   JOIN public.memberships m ON m.user_id = u.id 
   WHERE u.id = (SELECT auth.uid()) AND m.role IN ('admin', 'owner')) IS NOT NULL
);

-- RLS Policy: Admin/owner can insert menu files
CREATE POLICY "Admin can insert menu files"
ON public.menu_files FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT m.role FROM auth.users u 
   JOIN public.memberships m ON m.user_id = u.id 
   WHERE u.id = (SELECT auth.uid()) AND m.role IN ('admin', 'owner')) IS NOT NULL
);

-- RLS Policy: Admin/owner can update menu files
CREATE POLICY "Admin can update menu files"
ON public.menu_files FOR UPDATE
TO authenticated
USING (
  (SELECT m.role FROM auth.users u 
   JOIN public.memberships m ON m.user_id = u.id 
   WHERE u.id = (SELECT auth.uid()) AND m.role IN ('admin', 'owner')) IS NOT NULL
);

-- RLS Policy: Admin/owner can delete menu files
CREATE POLICY "Admin can delete menu files"
ON public.menu_files FOR DELETE
TO authenticated
USING (
  (SELECT m.role FROM auth.users u 
   JOIN public.memberships m ON m.user_id = u.id 
   WHERE u.id = (SELECT auth.uid()) AND m.role IN ('admin', 'owner')) IS NOT NULL
);

-- Note: Service role can bypass RLS for server-side operations

