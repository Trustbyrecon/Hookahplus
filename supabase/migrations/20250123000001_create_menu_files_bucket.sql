-- Create storage bucket for menu files (PDF, JPG, PNG)
-- Files are stored temporarily until menu data is extracted, then deleted to minimize storage costs

-- Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'menu-files',
  'menu-files',
  false, -- Private bucket (admin-only access)
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policy: Only authenticated admin users can upload
CREATE POLICY "Admin can upload menu files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'menu-files' AND
  (SELECT m.role FROM auth.users u 
   JOIN public.memberships m ON m.user_id = u.id 
   WHERE u.id = auth.uid() AND m.role IN ('admin', 'owner')) IS NOT NULL
);

-- RLS Policy: Only authenticated admin users can read
CREATE POLICY "Admin can read menu files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'menu-files' AND
  (SELECT m.role FROM auth.users u 
   JOIN public.memberships m ON m.user_id = u.id 
   WHERE u.id = auth.uid() AND m.role IN ('admin', 'owner')) IS NOT NULL
);

-- RLS Policy: Only authenticated admin users can delete
CREATE POLICY "Admin can delete menu files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'menu-files' AND
  (SELECT m.role FROM auth.users u 
   JOIN public.memberships m ON m.user_id = u.id 
   WHERE u.id = auth.uid() AND m.role IN ('admin', 'owner')) IS NOT NULL
);

-- Note: Service role can bypass RLS for server-side operations
-- Files will be deleted automatically after menu data extraction (see retention policy)

